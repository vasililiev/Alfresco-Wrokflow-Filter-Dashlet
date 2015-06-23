<script type="text/javascript">//<![CDATA[
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
   new Extras.FilterWorkflows("${args.htmlid}").setMessages(${messages});
//]]></script>
<div class="dashlet padding-bottom-12">
   <div class="title-wrap title">
	   <div id="assigned" class="tab active-tab-assigned" onclick="Extras.changeTab(this.id)">${msg("header.assigned")}</div>
	   <div id="done" class="tab" onclick="Extras.changeTab(this.id)">${msg("header.done")}</div> 
   </div>
   <!-- <div class="title">${msg("header")}</div> -->
   <div class="toolbar flat-button">
   		<div class="align-left yui-button yui-menu-button">
	   		<select id="properties" class="select-width-auto border-width-01">
	   			<option value="description">${msg("prop.description")}</option>
	   			<option value="priority">${msg("prop.priority")}</option>
	   			<option value="date">${msg("prop.startDate")}</option>
	   			<option value="initiator">${msg("prop.initiator")}</option>
	   		</select>
   		</div>
   		<div class="align-left">
   			<input id="wfsearch-term-input" type="text" class="search_box_input" placeholder="${msg("placeholder.search_term")}" />
   			<select id="wfsearch-priority-input" class="select-width-auto border-width-11 yui-button yui-menu-button" style="display:none;">
	   			<option value="1">${msg("priority.high")}</option>
	   			<option value="2" selected>${msg("priority.medium")}</option>
	   			<option value="3">${msg("priority.low")}</option>
   			</select>
   		</div>
   		<div id="cal-filter" class="align-left" style="display:none;">
   			<input id="wfsearch-date-input" type="text" class="search_box_input" placeholder="${msg("placeholder.date")}" readonly/>
   			<div id="calendar-div" class="absolute"></div>
   		</div>
   		<div class="align-right yui-button yui-push-button search-icon border-width-0">
   			<button id="reset-workflows-button" type="button">${msg("btn.reset")}</button>
   		</div>
   		<div class="align-right yui-button yui-push-button search-icon border-width-0">
   			<button id="search-workflows-button" type="button">${msg("btn.search")}</button>
   		</div>
   		<div id="people-api" class="align-left" style="display: none;">
   			<input id="wfsearch-initiator-input" type="text" class="search_box_input" placeholder="${msg("placeholder.initiator")}" autocomplete="off" />
   			<div id="autocomplete-container" style="display: none;">
   				<ul id="suggestions">
   				
   				</ul>
   			</div>
   		</div>
   		<div class="titleBarActions" style="opacity: 0;">
   			<div title="Display help for this dashlet" class="titleBarActionIcon help"></div>
   		</div>
   </div>
   <div class="toolbar flat-button">
   		<div id="balloon_completeTasks" class="align-left completeAllTasks">
   			<span id="tooltip_completeTasks" class="tooltip">${msg("tooltip.completeTasks")}</span>
   		</div>
   		<div class="align-left yui-button yui-push-button search-icon border-width-0">
   			<button id="sort-by-date" type="button">${msg("btn.sortbydate")} <span class="font-size-small">▼</span></button>
   		</div>
   		<div class="align-left yui-button yui-push-button search-icon border-width-0">
   			<button id="sort-by-priority" type="button">${msg("btn.sortbypriority")} <span class="font-size-small">▼</span></button>
   		</div>
   		<div class="align-right padding-top-5 placeholder">
   			<span id="totalWorkflows">${msg("workflows.total")}</span>
   		</div>
   </div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
     <div id="list-items" class="detail-list-item first-item last-item">
     	${msg("workflows.loading")}
     </div>
   </div>
   <div id="list-item-messages" style="display:none; visbility: hidden;">
   ${msg("wf.title")},${msg("wf.before")},${msg("wf.from")},${msg("wf.type")},${msg("wf.priority")},${msg("passed.day")},${msg("passed.days")},${msg("prop.priority")},${msg("workflows.empty")},${msg("workflows.loading")},${msg("prompt.title")},${msg("prompt.text")},${msg("prompt.yes")},${msg("prompt.no")},${msg("workflows.deleting")},${msg("workflows.error")}
   </div>
</div>