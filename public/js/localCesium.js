Cesium.BingMapsApi.defaultKey = 'AnOxaLCOV8PWUt_68TaV2pRNOykPDOugZ9q2fNQYx3UWpuFizlvnxKDhmBk2e3iL';

var viewer = new Cesium.Viewer('cesium_container', {
	baseLayerPicker : false,
	animation : false,
	timeline : false,
	sceneModePicker : false,
	geocoder : false,
	fullscreenButton : false
});
var terrainProvider = new Cesium.CesiumTerrainProvider({
	url: '//assets.agi.com/stk-terrain/world'
});

viewer.terrainProvider = terrainProvider;
document.getElementsByClassName("cesium-viewer-bottom")[0].style.display = "none";

viewer.camera.flyTo({
	destination : Cesium.Cartesian3.fromElements(2127119.0540426956, -5511772.388822916, -2403709.50407885),
	orientation : {
		heading : 6.279164396494254,
		pitch : -0.48797493203134934,
		roll : 0.0
	}
});

var scene = viewer.scene;
//var points = [];
var handlerTwo;

handlerTwo = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handlerTwo.setInputAction(function(movement) {
    if (viewer.selectedEntity) {
        var valor = "d:3fqu3g:Caja:" + viewer.selectedEntity.id;
		$("#deviceslist").val(valor);
		$("#deviceslist").trigger('change');
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
