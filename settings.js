chrome.storage.local.get(['ToolbarSettings'], function (result){
	if(result.ToolbarSettings == undefined){
		chrome.storage.local.set({
			ToolbarSettings: GLOBAL_CONSTANTS.DEFAULT_TOOLBAR
		}, function(){
			setCheckboxes(GLOBAL_CONSTANTS.DEFAULT_TOOLBAR);
		});
	}
	else{
		setCheckboxes(result.ToolbarSettings);
	}
});

document.addEventListener('DOMContentLoaded', function() {
    var save = document.getElementById('save');
    var resetDefault = document.getElementById('resetDefault');
    
    save.addEventListener('click', function() {
    	let currentToolbar = [];
        for(let setting of GLOBAL_CONSTANTS.TOOLBAR_LIST){
			if(document.getElementById(setting).checked == true){
				currentToolbar.push(setting);
			}
		}
		chrome.storage.local.set({
			ToolbarSettings: currentToolbar
		}, savedMessage());
    });

    resetDefault.addEventListener('click', function() {
    	chrome.storage.local.set({
			ToolbarSettings: GLOBAL_CONSTANTS.DEFAULT_TOOLBAR
		}, setCheckboxes(GLOBAL_CONSTANTS.DEFAULT_TOOLBAR, savedMessage));
    });

});

function savedMessage(){
	var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
}

function setCheckboxes(inputToolbar, callback){
	for(let setting of GLOBAL_CONSTANTS.TOOLBAR_LIST){
		document.getElementById(setting).checked = false;
	}
	for(let setting of inputToolbar){
		document.getElementById(setting).checked = true;
	}
	if(callback != undefined)
		callback();
}