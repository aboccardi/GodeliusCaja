/*******************************************************************************
* Copyright (c) 2014 IBM Corporation and other Contributors.
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
* IBM - Initial Contribution
*******************************************************************************/

var Historian  = function () {

	var $ = jQuery;
	var historianGraph;

	this.initialize = function() {
		historianGraph = new HistorianGraph();
	}

	this.plotHistoricGraph = function (){
		var item = $( "#deviceslist" ).val();
		if(item) {
			var tokens = item.split(':');

			var top = $( 'input[name=historicQuery]:checked' ).val();
			console.log("called "+top);
			var queryParam = {};
			var dbhost = "5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix.cloudant.com";
			var dbid = "/iotp_znuylb_default_";
			var apicmd = "/_design/iotp/_view/by-deviceId-and-date";
			var user = "5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix";
			var pass = "4bac2881ad82100778fc1b0d7e34f6066a7c718a7d12baf8acf02504d5cf1c87";
			
			if(top == "topEvents") {
				var d = new Date();
				dbid = dbid + d.getFullYear() + "-" + String("00" + (d.getMonth()+1)).slice(-2);
				var limite = $(historicTopRange).spinner( "value" );
				var skey = '["'+tokens[3]+'",{}]';
				var ekey = '["'+tokens[3]+'"]';
				var desc = true;
			} 
			else if(top == "dateRange") {
				//Datetimes only in GMT
				var fechaini = new Date(Date.parse($(historicStarts).val()));
				var fechafin = new Date(Date.parse($(historicEnds).val()));
				dbid = dbid + fechafin.getFullYear() + "-" + (fechafin.getMonth()+1);
				var limite = 100000;
				var skey = '["'+tokens[3]+'","'+fechafin.toISOString()+'"]';
				var ekey = '["'+tokens[3]+'","'+fechaini.toISOString()+'"]';
				var desc = true;
			}
//			var baseurl = "5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix.cloudant.com/iotp_znuylb_default_2016-11/_design/iotp/_view/by-deviceId-and-date"
			
			$.ajax
			({
				type: "GET",
				url: "https://" + dbhost + dbid + apicmd,
				data: {
					startkey: skey,
					endkey: ekey,
					descending:desc,
					limit: limite
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader ("Authorization", "Basic " + btoa(user + ":" + pass));
				},
				async: true,

				success: function (data, status, jq){

					//clear prev graphs
					$('#chart').empty();
//					var $newGraph = $('#chart').clone();
//					$('#chart').replaceWith($newGraph);
					$('#timeline').empty();
					$('#legend').empty();
					historianGraph.displayHistChart(null,data);
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(xhr.status);
					console.log(thrownError);
				}
			});
		}
	}

	this.initialize();
	var imageHTML = '<div class="iotdashboardtext">The selected device does not have historic events in the Internet of Things Foundation</div><br><div class="iotdashboardtext">Select a different device.</div> <img class="iotimagesMiddle" align="middle" alt="Chart" src="images/IOT_Icons_Thing02.svg">';
};
