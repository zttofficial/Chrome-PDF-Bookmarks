
/* demo code from official document

let changeColor = document.getElementById('changeColor');

changeColor.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        {code: 'document.body.style.backgroundColor = "' + color + '";'});
  });
};


chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});
*/

let currentPage = document.getElementById('Bookmark_save');

Bookmark_load.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
		tabs[0].id,
        {code:'let current_url = tabs[0].url;let bookmark = current_url+ "#page=" + currentPage;window.open(bookmark);'});
  });
};

/*
test.onclick = function(element) {
	chrome.browserAction.onClicked.addListener(function(activeTab){
		var newURL = "http://stackoverflow.com/";
		chrome.tabs.create({ url: newURL });
	});
};
*/