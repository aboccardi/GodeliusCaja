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

// Main UI 
var orgId = "";
var orgName = "";
//flag for historian
var isHistorian = false;
var api_key ="";
var auth_token = "";
var devices = [];

// Get the OrgId and OrgName
$.ajax
({
	type: "GET",
	url: "/api/v0002/organization",
	dataType: 'json',
	async: false,

	success: function (data, status, jq){

		orgId = data.id;
		orgName = data.name;
		api_key = data.api_key;
		auth_token = data.auth_token;
	},
	error: function (xhr, ajaxOptions, thrownError) {
		if(xhr.status === 401 || xhr.status === 403){
			console.log("Not authorized. Check your Api Key and Auth token");
			window.location.href="loginfail";
		}
		console.log("Not able to fetch the Organization details");
		console.log(xhr.status);
		console.log(thrownError);
	}
});

//get the devices list of the org
$.ajax
({
	type: "GET",
	url: "/api/v0002/organization/getdevices",
	dataType: 'json',
	async: true,

	success: function (data, status, jq){

		devices = data;
		for(var d in devices){
			$("#deviceslist").append("<option value="+devices[d].clientId+">"+devices[d].deviceId+"</option>");
			console.log(devices[d]);
			$.ajax
			({
				type: "GET",
				url: "/api/v0002/device/types/" + devices[d].typeId + "/devices/" + devices[d].deviceId + "/location",
				dataType: 'json',
				async: true,
				
				success: function (data, status, jq) {
					console.log("location x: " + data.metadata.x);
					console.log("location y: " + data.metadata.y);
					console.log("location z: " + data.metadata.z);
					var x = data.metadata.x;
					var y = data.metadata.y;
					var z = data.metadata.z;
					entityId = data.deviceId;
					var pointPosition = Cesium.Cartesian3.fromElements(x,y,z);
					viewer.entities.add({
						id: entityId,
						name: "Caja " + entityId,
						position: pointPosition,
						point : {
							color : Cesium.Color.SKYBLUE,
							pixelSize : 10,
							outlineColor : Cesium.Color.YELLOW,
							outlineWidth : 1,
							heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
						}
					});
					
					viewer.entities.getById(entityId).description =  '\
						<p>\
						  Fecha perf.: 20/09/2016 14:56 <br> \
						  Mezcla tipo: ...<br> \
						  Fecha llenado: 21/09/2016 08:45 <br> \
						  Temp de la caja (ºC): '+ payload.d.temp0 +' <br>\
						  Temp taco (ºC): '+ payload.d.temp1 +'<br>\
						  Temp 5m prof. (ºC): '+ payload.d.temp2 +'<br>\
						  Temp 10m prof. (ºC): '+ payload.d.temp3 +'<br>\
						  Temp 15m prof. (ºC): '+ payload.d.temp4 +'<br>\
						  Batt0 (V): '+ payload.d.batt0 +'<br>\
						  Batt1 (V): '+ payload.d.batt1 +'<br>\
						  Batt2 (V): '+ payload.d.batt2 +'<br>\
						  Batt3 (V): '+ payload.d.batt3 +'<br>\
						</p>';
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(xhr.status);
					console.log(thrownError);
				}
				
			});

		}
	},
	error: function (xhr, ajaxOptions, thrownError) {
		console.log(xhr.status);
		console.log(thrownError);
	}
});

	
	
var realtime = new Realtime(orgId, api_key, auth_token);

var historian = new Historian();
$( "#deviceslist" ).change(function() {
	var idCaja = $("#deviceslist option:selected").text();
	viewer.selectedEntity = viewer.entities.getById(idCaja);
	if(isHistorian){
		historian.plotHistoricGraph();
	} else {
		realtime.plotRealtimeGraph();
	}
	
});

//Toggle historian options when user selects historic/live data radio buttons
$('#historic').change(function() {
	$('#historicData').show(500);
	historian.plotHistoricGraph();
	isHistorian = true;
});

$('#realtime').change(function() {
	$('#historicData').hide(500);
	realtime.plotRealtimeGraph();
	isHistorian = false;
});

//plot historic graph when user changes the spinner
$( "#historicTopRange").on( "spinchange", function( event, ui ) {
	historian.plotHistoricGraph();
});

$( "#historicEnds" ).datetimepicker({ onChangeDateTime:function(dp,$input){
    historian.plotHistoricGraph();
  }
});