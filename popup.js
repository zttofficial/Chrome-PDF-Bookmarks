
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
//var currentPage=20;

//var currentPage = document.getElementById('pagenum').value;

Bookmark_load.onclick = function(element) {
/*
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
		tabs[0],
        {code:'let bookmark = tabs.url+ "#page=" + currentPage;console.log(bookmark);window.open(bookmark.toString());'});
  });
*/
var currentPage = document.getElementById('pagenum').value;

chrome.tabs.query({
  active: true,
  currentWindow: true
}, ([currentTab]) => {
  console.log(currentTab.url);
  let bookmark = currentTab.url+ "#page=" + currentPage;
  window.open(bookmark.toString());
});
};

/*
test.onclick = function(element) {
	window.open("http://stackoverflow.com/");
	chrome.browserAction.onClicked.addListener(function(activeTab){
		var newURL = "http://stackoverflow.com/";
		chrome.tabs.create({ url: newURL });
	});
};
*/