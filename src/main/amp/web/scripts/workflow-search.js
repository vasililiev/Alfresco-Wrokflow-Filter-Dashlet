/**
 * Extras root namespace.
 * 
 * @namespace Extras
 */
// Ensure Extras root object exists
if (typeof Extras == "undefined" || !Extras) {
	var Extras = {};
}

(function() {
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event, Element = YAHOO.util.Element;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML;

	//Fetched JSON
	var workflowsData = null;
	//Contains the result JSON after filtering
	var filteredData = [];
	//Keeps sorting direction
	var sortDirection = {
			date: "DESCENDING",
			priority: "DESCENDING"
	}
	//Has the selected filter, initially: description
	var selectedFilter = "description";
	//Selected workflow id's
	var indexArray = [];
	

    // Set webscript template
    var webscript = YAHOO.lang.substitute("api/task-instances?authority={authority}&properties={properties}",
    {
        authority: encodeURIComponent(Alfresco.constants.USERNAME),
        properties: ["bpm_priority", "bpm_status", "bpm_dueDate", "bpm_description"].join(",")
    });
    
    var autoCompleteItem = '<li id="{username}" onclick="Extras.selectUsername(this.id)">{username}<span class="placeholder"> ({name})</span></li>';
	
	/**
	 * ConsoleFilterWorkflows constructor.
	 * 
	 * @param {String}
	 *            htmlId The HTML id of the parent element
	 * @return {FilterWorkflows} The new FilterWorkflows instance
	 * @constructor
	 */
	Extras.FilterWorkflows = function(htmlId) {
		this.name = "Extras.FilterWorkflows";
		Extras.FilterWorkflows.superclass.constructor.call(this, htmlId);

		/* Register this component */
		Alfresco.util.ComponentManager.register(this);

		/* Load YUI Components */
		Alfresco.util.YUILoaderHelper.require([ "button", "container",
				"datasource", "datatable", "json", "history" ],
				this.onComponentsLoaded, this);

		/* Define panel handlers */
		var parent = this;

		// NOTE: the panel registered first is considered the "default" view and
		// is displayed first

		/* Search Panel Handler */
		FormPanelHandler = function FormPanelHandler_constructor() {
			FormPanelHandler.superclass.constructor.call(this, "form");
		};

		YAHOO.extend(FormPanelHandler, Alfresco.ConsolePanelHandler,
        {
	         /**
			 * Called by the ConsolePanelHandler when this panel shall be loaded
			 * 
			 * @method onLoad
			 */
	         onLoad: function onLoad()
	         {	        	 
	        	 
	         }
        });
		new FormPanelHandler();
      
		return this;
	}
	
	YAHOO.extend(Extras.FilterWorkflows, Alfresco.ConsoleTool,
    {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
       options:
       {
         /**
          * Number of characters required for a search.
          * 
          * @property minSearchTermLength
          * @type int
          * @default 1
          */
          minSearchTermLength: 1
       },
      
       /**
        * Fired by YUI when parent element is available for scripting.
        * Component initialisation, including instantiation of YUI widgets and event listener binding.
        *
        * @method onReady
        */
       onReady: function FilterWorkflows_onReady()
       {
         // Call super-class onReady() method
          Extras.FilterWorkflows.superclass.onReady.call(this);
          Extras.renderCalendar();
         //Set event listeners Toolbar 1
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("search-workflows-button"), "click", Extras.doFilter);
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("reset-workflows-button"), "click", Extras.getAllWorkflows);
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("wfsearch-date-input"), "click", Extras.showCalendar);
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("wfsearch-initiator-input"), "keyup", Extras.getUsernames);
          
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("properties"), "change", Extras.changeFilter);

          //Set event listeners Toolbar 2
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("sort-by-date"), "click", Extras.sortByDate);
          YAHOO.util.Event.addListener(YAHOO.util.Dom.get("sort-by-priority"), "click", Extras.sortByPriority);
          
          //Get messages
          Extras.getTemplateMessages();
          
          //Workflow list-item template
          item = '<div class="list-item">\
		      		<a href="{url}" target="_blank">\
		      			<div class="priority">\
		      				<div class="circle {isDone}"></div>\
		      			</div>\
		      			<div class="properties-content">\
		      				<div class="wf-title">\
		      					<span><strong>'+messages.title+'</strong> {wfTitle}</span>\
		      				</div>\
		      				<div class="wf-properties">\
		      					<span class="property"><strong>'+messages.before+'</strong> {days} {annot}</span>\
		      					<span class="property"><strong>'+messages.from+'</strong> {from}</span>\
		      					<span class="property"><strong>'+messages.priority+'</strong> {priority}</span>\
		      					<span class="property"><strong>'+messages.type+'</strong> {type}</span>\
		      				</div>\
		      			</div>\
		      		</a>\
		      	</div>';
           
          //Send AJAX request to get all workflows
          Extras.getAllWorkflows(webscript);

       }
       
    });
	
	/**
	 * Sends an AJAX Request go retrieve all assigned workflows
	 */
	Extras.getAllWorkflows = function() {
		Alfresco.util.Ajax.request(
		{
			url: Alfresco.constants.PROXY_URI + webscript,
			method: Alfresco.util.Ajax.GET,
			responseContentType: Alfresco.util.Ajax.JSON,
			successCallback:
			{
				fn: function(responce){
					var workflows = responce.json.data;
					YAHOO.util.Dom.get("list-items").innerHTML="";
					workflows.sort(function(a,b){
						return Extras.dateFromISO8601(b.workflowInstance.startDate) - Extras.dateFromISO8601(a.workflowInstance.startDate);
					});
					workflowsData = filteredData = workflows;
					Extras.showAllWorkflows();
				},
				scope: this
			},
			failureCallback:
			{
				fn: function(responce){
					alert(JSON.stringify(responce));
				},
				scope: this
			}
		});
	};
	
	/**
	 * Parses a date from Alfresco format
	 * i.e. 2015-05-16T16:55:22:00
	 */
	Extras.dateFromISO8601 = function(isostr) {
		var parts = isostr.match(/\d+/g);
		return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
	};
	
	/**
	 * Parses a string to Date object
	 * format dd/mm/yyyy
	 */
	Extras.dateFromString = function(dateString) {
		var parts = dateString.split('/');
		return new Date(parts[2], parts[1]-1, parts[0]);
	};
	
	/**
	 * Calculates difference between a date and today in days
	 */
	Extras.daysPassed = function(dateFrom) {
		var today = new Date();
		today.setHours(0,0,0,0);
		dateFrom.setHours(0,0,0,0);
		return parseInt((today - dateFrom)/(1000*60*60*24));
	};
	
	/**
	 * [Boolean] If the task status exists in the statusArray then
	 * it verifies that the task is complete (Send for completion confirmation).
	 */
	Extras.getStatus = function(status) {
		var statusArray = ["Task Completed",
		                   "Approved",
		                   "Rejected",
		                   "Document Rejected",
		                   "Site Invitation Accepted",
		                   "Site Invitation Rejected",
		                   "Завршена Задача",
		                   "Отфрлено",
		                   "Одобрено"];
		return statusArray.indexOf(status);
	};
	
	/**
	 * Since the workflow list item is custom, the messages should be set depending on the browser locale.
	 * In the VIEW, there is a hidden div where all properties are comma separated.
	 * This function reads all the properties and creates a global variable of them.
	 */
	Extras.getTemplateMessages = function() {
		var msgArray = YAHOO.util.Dom.get("list-item-messages").innerHTML.split(',');
		messages = {
			"title":msgArray[0],
			"before":msgArray[1],
			"from":msgArray[2],
			"type":msgArray[3],
			"priority":msgArray[4],
			"day":msgArray[5],
			"days":msgArray[6],
			"priority":msgArray[7]
		};
	};
	
	/**
	 * Switches between the filter controls depending of the filter selection
	 */
	Extras.changeFilter = function() {
		selectedFilter = YAHOO.util.Dom.get("properties").value;
		switch(selectedFilter){
		case "description":
			YAHOO.util.Dom.get("wfsearch-term-input").style.display = "block";
			YAHOO.util.Dom.get("wfsearch-priority-input").style.display = "none";
			YAHOO.util.Dom.get("cal-filter").style.display = "none";
			YAHOO.util.Dom.get("people-api").style.display = "none";
			break;
		case "priority":
			YAHOO.util.Dom.get("wfsearch-term-input").style.display = "none";
			YAHOO.util.Dom.get("wfsearch-priority-input").style.display = "block";
			YAHOO.util.Dom.get("cal-filter").style.display = "none";
			YAHOO.util.Dom.get("people-api").style.display = "none";
			break;
		case "date":
			YAHOO.util.Dom.get("wfsearch-term-input").style.display = "none";
			YAHOO.util.Dom.get("wfsearch-priority-input").style.display = "none";
			YAHOO.util.Dom.get("cal-filter").style.display = "block";
			YAHOO.util.Dom.get("people-api").style.display = "none";
			break;
		case "initiator":
			YAHOO.util.Dom.get("wfsearch-term-input").style.display = "none";
			YAHOO.util.Dom.get("wfsearch-priority-input").style.display = "none";
			YAHOO.util.Dom.get("cal-filter").style.display = "none";
			YAHOO.util.Dom.get("people-api").style.display = "block";
			break;
		default:
			Extras.showAllWorkflows();
		}
	};
	
	/**
	 * It shows all workflows that were initially red.
	 * It does not send AJAX request to the API to read the new ones
	 */
	Extras.showAllWorkflows = function() {
      	YAHOO.util.Dom.get("list-items").innerHTML = "";
		for(var i=0; i<workflowsData.length; i++)
        {
	   		 var wf = workflowsData[i];
	     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
	       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
        }
		filteredData = workflowsData;
		indexArray = [];
	};
	
	/**
	 * Filtering workflows by desciption
	 */
	Extras.filterByDescription = function() {
		var term = YAHOO.util.Dom.get("wfsearch-term-input").value;
		if(term == "") Extras.showAllWorkflows()
		YAHOO.util.Dom.get("list-items").innerHTML = "";
		for(var i=0; i<filteredData.length; i++)
        {
	   		 var wf = filteredData[i];
			 if(wf.workflowInstance.message.toUpperCase().indexOf(term.toUpperCase()) != -1)
			 {
				 indexArray.push(wf.id);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
			 }
        }
		Extras.updateFilteredData(indexArray);
	};

	/**
	 * Filtering workflows by priority
	 */
   	Extras.filterByPriority = function() {
		var priority = parseInt(YAHOO.util.Dom.get("wfsearch-priority-input").value);
      	YAHOO.util.Dom.get("list-items").innerHTML = "";
		for(var i=0; i<filteredData.length; i++)
        {
	   		 var wf = filteredData[i];
			 if(wf.workflowInstance.priority == priority)
			 {
				 indexArray.push(wf.id);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
			 }
        }
		Extras.updateFilteredData(indexArray);
   		
   	};
   	
   	/**
   	 * Filtering workflows by date when they were started
   	 */
   	Extras.filterByDate = function(){
		var dateString = YAHOO.util.Dom.get("wfsearch-date-input").value;
		if(date == "") return;
		var dateEntered = Extras.dateFromString(dateString);
      	YAHOO.util.Dom.get("list-items").innerHTML = "";
		for(var i=0; i<filteredData.length; i++)
        {
	   		 var wf = filteredData[i];
	     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
	     	 date.setHours(0,0,0,0);
			 if(dateEntered.toDateString() == date.toDateString())
			 {
				 indexArray.push(wf.id);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
			 }
        }
		Extras.updateFilteredData(indexArray);
   	};
   	
   	/**
   	 * Filtering workflows by initiator.
   	 * By initiator, it's ment the username of the initiator
   	 */
   	Extras.filterByInitiator = function() {
   		var username = YAHOO.util.Dom.get("wfsearch-initiator-input").value;
		if(username == "") return;
      	YAHOO.util.Dom.get("list-items").innerHTML = "";
		for(var i=0; i<filteredData.length; i++)
        {
	   		 var wf = filteredData[i];
			 if(wf.workflowInstance.initiator.userName.toUpperCase().indexOf(username.trim().toUpperCase()) != -1)
			 {
				 indexArray.push(wf.id);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
			 }
        }
		Extras.updateFilteredData(indexArray);
   	};   	
   	
   	/**
   	 * Click event for the search button
   	 */
   	Extras.doFilter = function() {
		switch(selectedFilter){
		case "description":
			Extras.filterByDescription();
			break;
		case "priority":
			Extras.filterByPriority();
			break;
		case "date":
			Extras.filterByDate();
			break;
		case "initiator":
			Extras.filterByInitiator();
			break;
		default:
			Extras.showAllWorkflows();
		}
	};

	/**
	 * Render client calendar for the FilterByDate control
	 */
	Extras.renderCalendar = function() {
		myCal = new YAHOO.widget.Calendar("calendar-div");
		//draw the calendar on screen
		myCal.render();
		myCal.hide();
		//define the ripDate function which gets the selected date
		var ripDate = function(type, args) {
			//get the date components
			var dates = args[0];
			var date = dates[0];
			var theYear = date[0];
			var theMonth = date[1];
			var theDay = date[2];
			
			var theDate = theDay + "/" + theMonth + "/" + theYear;
			YAHOO.util.Dom.get("wfsearch-date-input").value = theDate;
			myCal.hide();
		}
		//subscribe to the select event on Calendar cells
		myCal.selectEvent.subscribe(ripDate);
	};
	
	/**
	 * Click event on the textbox to show the calendars
	 */
	Extras.showCalendar = function (){
		myCal.show();
	};
	
	/**
	 * Arguments:
	 *		-Workflow item
	 *Returns a custom workflow element filled with the properties read from the argument 
	 */
	Extras.setWorkflowListElement = function(wf) {
    	var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
		return YAHOO.lang.substitute(item,{
      		 url: "/share/page/task-edit?taskId="+wf.id+"&amp;referrer=tasks",
      		 isDone: Extras.getStatus(wf.title) != -1?"done":"pending",
      		 wfTitle: wf.workflowInstance.message == null? wf.workflowInstance.title : wf.workflowInstance.message,
      		 from: wf.workflowInstance.initiator.firstName + " " +wf.workflowInstance.initiator.lastName,
      		 type: wf.title,
      		 days: Extras.daysPassed(date),
      		 annot: Extras.daysPassed(date) == 1?messages.day:messages.days,
      		 priority: wf.propertyLabels.bpm_priority
      	 });
	};
	
	/**
	 * Arguments: indexArray (array of workflow id's)
	 * It removes all items which are not in the list,
	 * updates the filtered data with the results
	 */
	Extras.updateFilteredData = function(indexArray) {
		var updateData = [];
		for(var i=0; i<filteredData.length; i++)
        {
	   		 var wf = filteredData[i];
			 if(indexArray.indexOf(wf.id) != -1)
			 {
				 updateData.push(wf);
			 }
        }
		filteredData = updateData;
		indexArray = [];
	};
	
	Extras.getUsernames = function() {
   		var username = YAHOO.util.Dom.get("wfsearch-initiator-input").value;
   		Alfresco.util.Ajax.request(
		{
			url: Alfresco.constants.PROXY_URI + "api/people?sortBy=fullName&dir=asc&filter="+username+"&maxResults=50",
			method: Alfresco.util.Ajax.GET,
			responseContentType: Alfresco.util.Ajax.JSON,
			successCallback:
			{
				fn: function(responce){
			        YAHOO.util.Dom.get("suggestions").innerHTML = "";
					var people = responce.json.people;
					
					for(var i =0; i<people.length; i++ )
				    {
				           var item = YAHOO.lang.substitute(autoCompleteItem,
				        		    {
						               username: people[i].userName,
						               name: people[i].firstName + " " + people[i].lastName
						           });
				           YAHOO.util.Dom.get("suggestions").innerHTML += item;
				    }
					YAHOO.util.Dom.get("autocomplete-container").style.display = "block";
				},
				scope: this
			},
			failureCallback:
			{
				fn: function(responce){
					
				},
				scope: this
			}
		});
	};
	
	Extras.selectUsername = function(username) {
		YAHOO.util.Dom.get("autocomplete-container").style.display = "none";
   		YAHOO.util.Dom.get("wfsearch-initiator-input").value = username;
	}
	
	/**
	 * Sort by date funtion
	 */
	Extras.sortByDate = function(){
		if(sortDirection.date == "DESCENDING")
		{
			filteredData.sort(function(a,b){
				return Extras.dateFromISO8601(a.workflowInstance.startDate) - Extras.dateFromISO8601(b.workflowInstance.startDate);
			});
			YAHOO.util.Dom.get("list-items").innerHTML = "";
			for(var i=0; i<filteredData.length; i++)
	        {
		   		 var wf = filteredData[i];
		     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
	        }
			YAHOO.util.Dom.get("sort-by-date").innerHTML = YAHOO.util.Dom.get("sort-by-date").innerHTML.replace('▼',"▲");
			sortDirection.date = "ASCENDING";
		}
		else if(sortDirection.date == "ASCENDING")
		{
			filteredData.sort(function(a,b){
				return Extras.dateFromISO8601(b.workflowInstance.startDate) - Extras.dateFromISO8601(a.workflowInstance.startDate);
			});
			YAHOO.util.Dom.get("list-items").innerHTML = "";
			for(var i=0; i<filteredData.length; i++)
	        {
		   		 var wf = filteredData[i];
		     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
	        }
			YAHOO.util.Dom.get("sort-by-date").innerHTML = YAHOO.util.Dom.get("sort-by-date").innerHTML.replace("▲","▼");
			sortDirection.date = "DESCENDING";
		}
	};
	
	/**
	 * Sort by priority function
	 */
	Extras.sortByPriority = function(){
		if(sortDirection.priority == "DESCENDING")
		{
			filteredData.sort(function(a,b){
				return b.workflowInstance.priority < a.workflowInstance.priority;
			});
			YAHOO.util.Dom.get("list-items").innerHTML = "";
			for(var i=0; i<filteredData.length; i++)
	        {
		   		 var wf = filteredData[i];
		     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
	        }
			YAHOO.util.Dom.get("sort-by-priority").innerHTML = YAHOO.util.Dom.get("sort-by-priority").innerHTML.replace('▼',"▲");
			sortDirection.priority = "ASCENDING";0
		}
		else if(sortDirection.priority == "ASCENDING")
		{
			filteredData.sort(function(a,b){
				return b.workflowInstance.priority > a.workflowInstance.priority;
			});
			YAHOO.util.Dom.get("list-items").innerHTML = "";
			for(var i=0; i<filteredData.length; i++)
	        {
		   		 var wf = filteredData[i];
		     	 var date = Extras.dateFromISO8601(wf.workflowInstance.startDate);
		       	 YAHOO.util.Dom.get("list-items").innerHTML += Extras.setWorkflowListElement(wf);
	        }
			YAHOO.util.Dom.get("sort-by-priority").innerHTML = YAHOO.util.Dom.get("sort-by-priority").innerHTML.replace("▲","▼");
			sortDirection.priority = "DESCENDING";
		}
	}
})();
