chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = "http://color-picker.appsmaster.co/";
  chrome.tabs.create({ url: newURL });
});