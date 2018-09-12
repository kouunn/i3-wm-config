/**
 * dorsyClip bg.js
 * @author dorsywang(314416946@qq.com)
 * May Follow Cauchy's Steps
 *
 */
chrome.browserAction.onClicked.addListener(function(tab){
    var deletedApps = JSON.parse(window.localStorage.getItem("dorsy_deletedApps") || "{\"list\":[]}");
    chrome.tabs.sendRequest(tab.id, {command: "toggleOpen", data: {deletedApps: deletedApps}}, function(response){
        if(! response){
            response = {
            }
        }
        //开关状态
        var status = response.status;
        var msgText = {
            "text": "ON"
        };

        var msgIcon = {
            path: "icon/48_gray.png"
        };

        if(! status){
            msgText.text = "OFF";
            msgIcon.path = "icon/48_gray.png";
        }else{
            msgIcon.path = "icon/48.png";
        }

        chrome.browserAction.setIcon(msgIcon);
    });
});

chrome.runtime.onMessage.addListener(function(mes, messager, sendResonse){
    if(mes && mes.command){
        var command = mes.command;
        var data = mes.data;

        var res = "";

        switch(command){
            case "getAllDomainData":
                var name = data.name;
                res = JSON.parse(window.localStorage.getItem(name)) || "";

                break;

            case "setAllDomainData":
                var name = data.name;
                var value = data.value;

                console.log(value);

                window.localStorage.setItem(name, JSON.stringify(value));

                res = 1;
        }

        sendResonse(res);
    }
});
chrome.tabs.onActivated.addListener(function(select){
    chrome.tabs.sendRequest(select.tabId, {command: "getStatus"}, function(response){
        if(! response) response = {};
        var status = response.status;
        var msgText = {
            "text": "ON"
        };

        var msgIcon = {
            path: "icon/48_gray.png"
        };

        if(status){
            msgText.text = "ON";
            msgIcon.path = "icon/48.png";
        }else{
            msgText.text = "OFF";
            msgIcon.path = "icon/48_gray.png";
        }

        //chrome.browserAction.setBadgeText(msgText);
        chrome.browserAction.setIcon(msgIcon);
    });
});
