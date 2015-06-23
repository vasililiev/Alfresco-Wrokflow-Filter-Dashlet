# Alfresco-Wrokflow-Filter-Dashlet<br/>
This product is property of <a href="www.neocom.mk" target="blank">Neocom AD</a>, 1000 Skopje R.Macedonia<br/>
Developers: 
Vasil Iliev (vasil.iliev@neocom.com.mk),
Irena Ilievska (irena.ilievska@neocom.com.mk)

This product was made for better representation of Alfresco Tasks.
One of the flaws that Alfresco has is presentation of the tasks.
<strong>Workflow Filter Dashlet</strong> resolves this issue and gives the user better presentation of the assigned tasks.
The dashlets features:
<ul>
 <li>Works with all workflows, native and custom</li>
 <li>Initially, it sorts the tasks by date</li>
 <li>Better representation of <strong>assigned</strong> and <strong>done</strong> tasks</li>
 <li>Complete <strong>all</strong> tasks which are returned for verification only by click of a button</li>
 <li>Filtering through all tasks by:
   <ol>
     <li>Workflow message</li>
     <li>Priority</li>
     <li>Date started</li>
     <li>Workflow initiator</li>
   </ol>
</li>
 <li>Lets you sort the filtered data by:
   <ul>
       <li>Date</li>
       <li>Priority</li>
   </ul> 
</li>
</ul>
Provides autocomplete suggestions for initiator username when filtering by initiator.
With the new version, the dashlet is divided on two tabs which lets the user filter through <strong>assigned</strong> tasks and <strong>done</strong> tasks.
You can install them by using standard [Alfresco deployment tools](http://docs.alfresco.com/community/tasks/dev-extensions-tutorials-simple-module-install-amp.html)

Building the artifacts
----------------------
If you are new to Alfresco and the Alfresco Maven SDK, you should start by reading [Jeff Potts' tutorial on the subject](http://ecmarchitect.com/alfresco-developer-series-tutorials/maven-sdk/tutorial/tutorial.html).

You can build the artifacts from source code using maven
```$ mvn clean package```
