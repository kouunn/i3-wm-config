var STORAGE_ITEM_NAME = "_site2Code";

//MIME types to work on
var TARGET_MIME_TYPE = [
    /^text\/[\w-.]+/i,
    /^application\/json/i,
    /^application\/(x-)?javascript/i,
    /^application\/(xhtml+)?xml/i
];

var g_site2Code = JSON.parse(localStorage.getItem(STORAGE_ITEM_NAME) || "{}");

var g_escapeContainer = document.createElement('textarea');
function escapeHTML(html) {
    g_escapeContainer.textContent = html;
    return g_escapeContainer.innerHTML;
}

//extract site url pattern from page url
//this pattern servers as index for site-->code map, which is saved in local storage
function extract_site_url_pattern(url) {
    if (typeof(url) !== "string"){
        return "Newtab";
    }
    
    var fragments = url.split('/').slice(0, 3);
    return fragments.join("/") + "/*";
}

function find_matched_mime (header){
    for (var i = 0; i < TARGET_MIME_TYPE.length; i++){
        var result = header.match(TARGET_MIME_TYPE[i]);
        if (result){
            return result[0];
        }
    }
    return null;
}

function onHeadersReceivedHandler(details) {
    //console.log("Header received:" + JSON.stringify(details));
    var url_pattern = extract_site_url_pattern(details.url);    
    if (g_site2Code[url_pattern]) {
        var is_type_header_found = false;   //default value, to be updated later
        
        var my_code = g_site2Code[url_pattern];
        var my_content_type = 'text/html; charset='+ my_code;   //default content type
        var headers = details.responseHeaders;                
        
        for(var i = 0; i < headers.length; i++){
            var header = headers[i];
            if(header.name.toLowerCase() == 'content-type'){
                is_type_header_found = true;
                
                var matched = find_matched_mime(header.value.toLowerCase().trim());
                                
                if (matched && TEXT_CODING_MAP[my_code]){
                    header.value = matched + '; charset='+ my_code;                
                    //console.log("change header coding to " + my_code + ", url =" + details.url);
                }
                else{
                    //not a target MIME, do nothing                    
                    //console.log("non-target content-type found: " + header.value);
                }
                
                break;
            }
        }
        
        if (! is_type_header_found){
            headers.push({
                name    : "content-type",
                value   : my_content_type  
            });
            //console.log("Add coding header " + my_code + " for url =" + details.url);
        }  
        return {responseHeaders:headers};    
    }
    else{
        return {};
    }
}

chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceivedHandler, 
    {
        urls: ["<all_urls>"],
    }, 
    ['blocking', 'responseHeaders']
); 

function isHTMLFile(url){
    if (url.match(/\.html?$/i)){
        return true;
    }
    return false;
}

//load local file with specified character set
function loadLocalFile(url, new_code, tabId){
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("text/plain; charset=" + new_code);

    xhr.onload = function() {
        var is_html = isHTMLFile(url);
        
        var mime_marker = is_html ? "html" : "plain";                
        var doc_contents = is_html?
                'decodeURI("' + encodeURI(xhr.responseText) + '")' :
                '"<pre>" + decodeURI("'+ encodeURI(escapeHTML(xhr.responseText)) +'") + "</pre>"';
                
        var code_inject =     
            'var newDoc = document.open("text/' + mime_marker + '", "replace");'+
            'newDoc.write(' + doc_contents + ');' +
            'newDoc.close();';
        
        chrome.tabs.executeScript(tabId, {code : code_inject}, function(){
            //console.log("Code injection done");
        }); 
    };
    xhr.onerror = function() {
        //Todo: check error reason?
        chrome.tabs.create({ url: chrome.i18n.getMessage("msgPage")});
    };
    xhr.open('GET', url, true);

    try{
        xhr.send();
    }
    catch(e){
        console.error("failed to send xhr");  
    }
}

// The onClicked callback function.
function onClickHandler(info, tab) {
    var new_code = info.menuItemId;
    var flg_need_reload = false;
    
    if (new_code === "help"){
        var locale = chrome.i18n.getMessage("_locale");
        chrome.tabs.create({ 
            url: "http://www.deep-watch.net/" + locale
                 + "/blog/bring-character-encoding-menu-back-to-chrome-with-extension"}
        );
    }
    
    if (TEXT_CODING_MAP[new_code]){ //some codes may be removed from menu due to version-up
        var url_pattern = extract_site_url_pattern(tab.url);
        
        if (new_code == "default"){
            delete(g_site2Code[url_pattern]);  
            flg_need_reload = true;
        }
        else{
            if (url_pattern == "file:///*"){
                loadLocalFile(tab.url, new_code, tab.id);
            }        
            else{
                g_site2Code[url_pattern] = new_code;
                flg_need_reload = true;
            }
        }

        localStorage.setItem(STORAGE_ITEM_NAME, JSON.stringify(g_site2Code));
        
        if (flg_need_reload){
            chrome.tabs.update(tab.id, {url: tab.url}); 
        }
    }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

//update selected coding every time new page loaded
//this action may be expensive
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {    
    if (changeInfo.status === "complete") {
        //update context menu   
        var url_pattern = extract_site_url_pattern(tab.url);
        var my_code = g_site2Code[url_pattern] || "default";
        
        //update menu status
        for (var menuId in TEXT_CODING_MAP){
            chrome.contextMenus.update(menuId, {
                "checked"   :   false
            });
        }

        chrome.contextMenus.update(my_code, {
            "checked"   :   true
        });  
    }
});   

// Set up context menu at install time.
//chrome.runtime.onInstalled.addListener(function() {
chrome.storage.sync.get(
    {
        "disabled_menu": "[]",
        "usr_menu": "[]"
    }, 
    function(items) {
        chrome.contextMenus.create({
            "title":  chrome.i18n.getMessage("Help_page"), 
            "type"  : "normal",
            "contexts":["page"], 
            "id": "help"
        });
        
        chrome.contextMenus.create({
            "type"  : "separator",
            "contexts":["page"], 
            "id": "separator"
        });
        
        var disabled_menu = [];
        var usr_menu = [];
        
        try{
            disabled_menu = JSON.parse(items["disabled_menu"]);
            usr_menu = JSON.parse(items["usr_menu"]);
        }
        catch(e){
            console.log("Error when parsing options");
        }
        
        //override default map
        disabled_menu.forEach(function(code){
            delete(TEXT_CODING_MAP[code]);
        });
        
        for (var code in TEXT_CODING_MAP){
            var temp = TEXT_CODING_MAP[code];
            var language = chrome.i18n.getMessage(temp[0]);
            var menu_title = language;

            if (temp[1]){
                menu_title += " ("+ temp[1] + ")";
            }

            chrome.contextMenus.create({
                "title": menu_title, 
                "type"  : "radio",
                "contexts":["page"], 
                "id": code
            });
        }            
        
        usr_menu.forEach(function(obj){
            var lang = obj["lang"];
            var code = obj["code"];
            
            TEXT_CODING_MAP[code] = [lang, code];
            chrome.contextMenus.create({
                "title": lang + "(" + code + ")", 
                "type"  : "radio",
                "contexts":["page"], 
                "id": code,
            });            
        });        
    }
);    
//});
