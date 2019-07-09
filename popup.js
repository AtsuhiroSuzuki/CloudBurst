//chrome.storage.local.clear()
var currentNoteId;

var fontNames = initializeFonts();

var toolbarMap = {};
toolbarMap['fontFormat'] = ['bold', 'italic', 'underline', 'strike'];
toolbarMap['quoteBlocks'] = ['blockquote', 'code-block'];
toolbarMap['textLists'] = [{ 'list': 'ordered'}, { 'list': 'bullet' }];
toolbarMap['subSuperScript'] = [{ 'script': 'sub'}, { 'script': 'super' }];
toolbarMap['indents'] = [{ 'indent': '-1'}, { 'indent': '+1' }];
toolbarMap['fontSize'] = [{ 'size': ['small', false, 'large', 'huge'] }];
toolbarMap['textColor'] = [{ 'color': [] }, { 'background': [] }];
toolbarMap['toolbarFont'] = [{ 'font': fontNames }];
toolbarMap['align'] = [{ 'align': [] }];
toolbarMap['removeFormatting'] = ['clean'];
toolbarMap['link'] = ['link'];

function getToolbar(callback){
	var currentToolbar = [];
	chrome.storage.local.get(['ToolbarSettings'], function (result) {
		if(result.ToolbarSettings == undefined){
			for(let i = 0; i < GLOBAL_CONSTANTS.DEFAULT_TOOLBAR.length; i++){
				currentToolbar.push(toolbarMap[GLOBAL_CONSTANTS.DEFAULT_TOOLBAR[i]]);
			}
			chrome.storage.local.set({
				ToolbarSettings: GLOBAL_CONSTANTS.DEFAULT_TOOLBAR
			}, function(){
				callback(currentToolbar);
			});
		}
		else{
			for(let setting of result.ToolbarSettings){
				currentToolbar.push(toolbarMap[setting]);
			}
			callback(currentToolbar);
		}
	});
}

var noteQuill;
var toolbar;
getToolbar(function(result){
	noteQuill = new Quill('#noteText', {
		theme: 'snow',
		placeholder: 'Let your ideas rain...',
		bounds: document.getElementById('noteText'),
		modules: {
			syntax: true,
			toolbar: result
		}
	});
	loadNote();
	let toolbarElement = document.getElementsByClassName("ql-toolbar")[0];
	if(toolbarElement.clientHeight == 30) {
		toolbarElement.classList.add("hideToolbar");
		document.getElementById("noteText").setAttribute("style","border-radius: 15px")
		document.getElementById("noteTextContainer").className = "containerNone";
	}
	else if(toolbarElement.clientHeight == 40)
		document.getElementById("noteTextContainer").className = "containerShort";
	else
		document.getElementById("noteTextContainer").className = "containerTall";
	if(toolbarElement.clientHeight == 64)
		document.getElementById("noteTextContainer").className = "containerTall";
});

document.addEventListener('DOMContentLoaded', function() {
    var add = document.getElementById("sidebar-add");
    add.addEventListener('click', function() {
    	createNote();
    });
});

noteText.onkeyup = function(){saveNote()};
titleText.onkeyup = function(){saveTitle()};

/*
	function - save to db
*/
function saveNote(){
	chrome.storage.local.set({
		[currentNoteId]: {titleText: titleText.value, noteText: noteQuill.getContents()}
	});
}
/*
	function - save to db, update tab title
*/
function saveTitle(){
	let title = document.getElementById(currentNoteId).firstChild.nodeValue = titleText.value;
	chrome.storage.local.set({
		[currentNoteId]: {titleText: titleText.value, noteText: noteQuill.getContents()}
	});
}

function loadNote(){
	chrome.storage.local.get(['CurrentNoteId'], function (result) {
		if(result.CurrentNoteId == undefined){
			createNote();
		}
		else{
			currentNoteId = result.CurrentNoteId;
			chrome.storage.local.get([currentNoteId.toString()], function (result) {
				noteQuill.setContents(result[currentNoteId].noteText)
				titleText.value = result[currentNoteId].titleText;
			});
		}
	});
	chrome.storage.local.get(['NoteSet'], function (result) {
		if(result.NoteSet != undefined){	
			var noteSetArray = Object.values(result.NoteSet);
			for (var i = 0; i < noteSetArray.length; i++) {
				createNoteButton(noteSetArray[i]);
			}
		}
	});
}

function createNote(){
	chrome.storage.local.get(['LastId'], function (result) {
		if(result.LastId == undefined){
			initializeNote(0);
		}
		else{
			initializeNote(++result.LastId);
		}
	});
	document.getElementById("sidebar").scrollTop = 0;
}

function initializeNote(id){
	var d = new Date();
  	var dateTimeString = d.toDateString() + ", " + d.toLocaleTimeString();
	var emptyNote = {titleText: "", noteText: "", creationTime: dateTimeString};
	chrome.storage.local.set({
		[id]: emptyNote
	}, function () {
		var lastNote = document.getElementById(currentNoteId);
		if(lastNote != null)
			lastNote.className = "sidebar-item";
		chrome.storage.local.set({
			CurrentNoteId : id
		});
		currentNoteId = id;
		createNoteButton(id);
		noteQuill.setContents("");
		titleText.value = "";
		chrome.storage.local.set({
			CurrentNoteId: id,
			LastId : id
		}, function(){
			chrome.storage.local.get(['NoteSet'], function (result){
				if(result.NoteSet == undefined){
					var set = [id];
					chrome.storage.local.set({
						NoteSet : set
					});
				}
				else{
					var newSet = Object.values(result.NoteSet)
					newSet.push(id);
					chrome.storage.local.set({
						NoteSet : newSet
					});
				}
			});
		});
	});
}

function createNoteButton(id){
	chrome.storage.local.get([id.toString()], function (result) {
		var buttonItem = document.createElement("a");
		if(id == currentNoteId)
			buttonItem.className = "sidebar-item sidebar-item-selected";
		else
			buttonItem.className = "sidebar-item";
		buttonItem.id = id;
		buttonItem.appendChild(document.createTextNode(result[id].titleText));

		var deleteButton = document.createElement("button");
		deleteButton.className = "delete-button";
		deleteButton.id = id + "Delete";

		var deleteImage = document.createElement("img");
		deleteImage.src = "images/trash.png";
		deleteImage.height = 13;
		deleteImage.width = 13;

		deleteButton.appendChild(deleteImage);
		buttonItem.appendChild(deleteButton);

		var sidebar = document.getElementById("sidebar");
		sidebar.insertBefore(buttonItem, sidebar.childNodes[0]);

		var noteButton = document.getElementById(id);
	    var noteDeleteButton = document.getElementById(id + 'Delete');

	    
	    /*noteButton.addEventListener('contextmenu', function(event){
			//Show Datetime
			chrome.storage.local.get(noteButton.id.toString(), function (result){
				let time = result[noteButton.id].creationTime;

			});
			event.preventDefault();
	    });*/
	    
	    
	    noteButton.addEventListener('click', function() {
	    	switchNote(noteButton.id);
	    });

	    noteButton.addEventListener('mouseenter', function() {
	    	if(noteButton.id != currentNoteId)
	    		noteButton.classList.add("sidebar-item-hover");
	    });

	    noteButton.addEventListener('mouseleave', function() {
	    	if(noteButton.id != currentNoteId)
	    		noteButton.className = "sidebar-item";
	    });

	    noteDeleteButton.addEventListener('click', function(event) {
	    	deleteNote(noteButton.id);
	    	event.stopPropagation();
	    });

	    noteDeleteButton.addEventListener('mouseover', function() {
	    	noteButton.classList.add("sidebar-item-delete");
	    });

	    noteDeleteButton.addEventListener('mouseout', function() {
	    	noteButton.classList.remove("sidebar-item-delete");
	    });
	});
}

function switchNote(id){
	chrome.storage.local.get([id.toString()], function (result) {
		if(result[id] != undefined){
			var prevNoteButton = document.getElementById(currentNoteId);
			noteQuill.setContents(result[id].noteText);
			titleText.value = result[id].titleText;
			currentNoteId = id;
			chrome.storage.local.set({
				CurrentNoteId : id
			});
			var noteButton = document.getElementById(id);

			if(prevNoteButton != null)
				prevNoteButton.className = "sidebar-item";
			noteButton.className = "sidebar-item sidebar-item-selected";
		}
	});
}

function deleteNote(id){
	var noteElement = document.getElementById(id);
	noteElement.remove();
	chrome.storage.local.get(['NoteSet'], function (result) {
		var noteSetArray = Object.values(result.NoteSet);
		if(noteSetArray.length == 1){
			chrome.storage.local.set({
				NoteSet : []
			}, function (){
				createNote();
			});
		}
		else{
			var index = noteSetArray.indexOf(parseInt(id,10));
			if(id == currentNoteId){
				if(index != 0){
					switchNote(noteSetArray[index-1]);
				}
				else{
					switchNote(noteSetArray[index+1]);
				}
			}
			noteSetArray.splice(index,1);
			chrome.storage.local.set({
				NoteSet : noteSetArray
			});
		}
	});
	chrome.storage.local.remove([id.toString()]);
}


function initializeFonts() {
	// specify the fonts you would 
	var fonts = ['Sans Serif', 'Arial', 'Courier', 'Garamond', 'Tahoma', 'Times New Roman', 'Verdana'];
	// generate code friendly names

	// add fonts to style
	var fontStyles = "";
	fonts.forEach(function(font) {
	    var fontName = getFontName(font);
	    fontStyles += ".ql-snow .ql-picker.ql-font .ql-picker-label[data-value=" + fontName + "]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=" + fontName + "]::before {" +
	        "content: '" + font + "';" +
	        "font-family: '" + font + "', sans-serif;" +
	        "}" +
	        ".ql-font-" + fontName + "{" +
	        " font-family: '" + font + "', sans-serif;" +
	        "}";
	});
	var node = document.createElement('style');
	node.innerHTML = fontStyles;
	document.body.appendChild(node);

	
	// Add fonts to whitelist
	var Font = Quill.import('formats/font');
	Font.whitelist = fontNames;
	Quill.register(Font, true);

	let titleText = document.getElementById("titleText");
	
	return fonts.map(font => getFontName(font));
}

function getFontName(font) {
    return font.toLowerCase().replace(/\s/g, "-");
}