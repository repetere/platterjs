'use strict';

var platter = require('../../lib/platter'),
	platterTemplate,
	platterAssets,
	platterData,
	platterStyles,
	platterInfoPanel;

platterTemplate = new platter({
	idSelector : 'template'
});
platterData = new platter({
	idSelector : 'data'
});
platterAssets = new platter({
	idSelector : 'assets'
});
platterStyles = new platter({
	idSelector : 'styles'
});
platterInfoPanel = new platter({
	idSelector : 'info'
});

window.onload = function(){
	// console.log("window loaded");
	platterInfoPanel.init();
	platterTemplate.init();
	platterData.init();
	platterAssets.init();
	platterStyles.init();
};

window.platterAssets = platterAssets;

platterTemplate.on("intializedPlatter",function(data){
	// console.log("got event",data);
	var a = data;
});