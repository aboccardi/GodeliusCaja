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

var subscribeTopic = "";

var Realtime = function(orgId, api_key, auth_token) {

	var firstMessage = true;
	var Reconnect = false;

	var clientId="a:"+orgId+":" +Date.now();

	console.log("clientId: " + clientId);
	var hostname = orgId+".messaging.internetofthings.ibmcloud.com";
	var client;

	this.initialize = function(){

		client = new Messaging.Client(hostname, 8883,clientId);

		// Initialize the Realtime Graph
		var rtGraph = new RealtimeGraph();
		client.onMessageArrived = function(msg) {
			var topic = msg.destinationName;
			var tokensCaja = topic.split('/');
			var idCaja = tokensCaja[4];
			var payload = JSON.parse(msg.payloadString);
			//First message, instantiate the graph  
		    if (firstMessage) {
		    	$('#chart').empty();
		    	firstMessage=false;
				var dbhost = "5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix.cloudant.com";
				var dbid = "/iotp_znuylb_default_";
				var apicmd = "/_design/iotp/_view/by-deviceId-and-date";
				var user = "5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix";
				var pass = "4bac2881ad82100778fc1b0d7e34f6066a7c718a7d12baf8acf02504d5cf1c87";
				var d = new Date();
				dbid = dbid + d.getFullYear() + "-" + String("00" + (d.getMonth()+1)).slice(-2);
				var limite = 100;
				var skey = '["'+idCaja+'",{}]';
				var ekey = '["'+idCaja+'"]';
				var desc = true;
				jQuery.ajax
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
						rtGraph.displayChart(idCaja, data);
					},
					error: function (xhr, ajaxOptions, thrownError) {
						console.log(xhr.status);
						console.log(thrownError);
					}
				});
		    } else {
		    	rtGraph.graphData(payload);
				
				viewer.entities.getById(idCaja).description =  '\
						<p>\
						  Fecha perf.: 20/09/2016 14:56 <br> \
						  Mezcla tipo: ...<br> \
						  Fecha llenado: 21/09/2016 08:45 <br> \
						  Temp de la caja (ºC): '+ payload.d.temp0 +' <br>\
						  Temp taco (ºC): '+ payload.d.temp1 +'<br>\
						  Temp 5m prof. (ºC): '+ payload.d.temp2 +'<br>\
						  Temp 10m prof. (ºC): '+ payload.d.temp3 +'<br>\
						  Temp 15m prof. (ºC): '+ payload.d.temp4 +'<br>\
						</p>';
		    }
		};

		client.onConnectionLost = function(e){
			console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
			Reconnect = true;
			this.connect(connectOptions);
			
		}

		var connectOptions = new Object();
		connectOptions.keepAliveInterval = 3600;
		connectOptions.useSSL=true;
		connectOptions.userName=api_key;
		connectOptions.password=auth_token;

		connectOptions.onSuccess = function() {
			console.log("MQTT connected to host: "+client.host+" port : "+client.port+" at " + Date.now());
			if (Reconnect) {
				var subscribeOptions = {
					qos : 0,
					onSuccess : function() {
						console.log("subscribed to " + subscribeTopic);
						Reconnect = false;
					},
					onFailure : function(){
						console.log("Failed to subscribe to " + subscribeTopic);
						console.log("As messages are not available, visualization is not possible");
					}
				};
		
				var item = $("#deviceslist").val();
				var tokens = item.split(':');
	//			if(subscribeTopic != "") {
	//				console.log("Unsubscribing to " + subscribeTopic);
	//				client.unsubscribe(subscribeTopic);
	//			}

				firstMessage = false;

				subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
				client.subscribe(subscribeTopic,subscribeOptions);

			}
		}

		connectOptions.onFailure = function(e) {
			console.log("MQTT connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);
			client.connect(connectOptions);
		}

		console.log("about to connect to " + client.host);
		client.connect(connectOptions);
	}

	// Subscribe to the device when the device ID is selected.
	this.plotRealtimeGraph = function(){
		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		
		var item = $("#deviceslist").val();
		var tokens = item.split(':');
		if(subscribeTopic != "") {
			console.log("Unsubscribing to " + subscribeTopic);
			client.unsubscribe(subscribeTopic);
		}

		//clear prev graphs
		$('#chart').hide(function(){ 
			$('#chart').empty(); 
			$('#chart').show();
			$('#chart').append(imageHTML);
		});
		
		$('#timeline').empty();
		$('#legend').empty();
		firstMessage = true;

		subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);
	}

	this.initialize();

	var imageHTML = '<div class="iotdashboardtext">The selected device is not currently sending events to the Internet of Things Foundation</div><br><div class="iotdashboardtext">Select to view historical data or select a different device.</div> <img class="iotimagesMiddle" align="middle" alt="Chart" src="images/IOT_Icons_Thing02.svg">';
}
