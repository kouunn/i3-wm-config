// for get element by id
function $(id) {
  return document.getElementById(id);
}

// Returns -1 if value isn't in array.
// Return position starting from 0 if found
function inArray(value, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return i;
  }
  return -1;
}

var injectHash = {};

// base bg object
var bg = {
  tab: 0,
  tabs: [],
  helperFile: "js/ed_helper.js",
  dropperLoaded: false,
  screenshotData: '',
  screenshotFormat: 'png',
  debugImage: null,
  debugTab: 0,
  color: null,

  // use selected tab
  // need to null all tab-specific variables
  useTab: function (tab) {
    bg.tab = tab;
  },

  sendMessage: function (message, callback) {
    chrome.tabs.sendMessage(bg.tab.id, message, callback);
  },

  messageListener: function () {
    // simple messages
    chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
      switch (req.type) {
        case 'designertools_hot_key':
          if (HotKey.isEnabled()) {
            switch (req.keyCode) {
              case HotKey.getCharCode('colorpicker'):
                chrome.tabs.getSelected(null, function (tab) {
                  bg.useTab(tab);
                  bg.pickupActivate();
                });
                break;
              case HotKey.getCharCode('rulerH'):
                chrome.tabs.getSelected(null, function (tab) {
                  bg.useTab(tab);
                  bg.hRulerActivate();
                });
                break;
              case HotKey.getCharCode('rulerV'):
                chrome.tabs.getSelected(null, function (tab) {
                  bg.useTab(tab);
                  bg.vRulerActivate();
                });
                break;
            }
          }
          break;

        // Reload background script
        case 'reload-background':
          window.location.reload();
          break;
      }
    });

    // longer connections
    chrome.runtime.onConnect.addListener(function (port) {
      port.onMessage.addListener(function (req) {
        switch (req.type) {
          // Taking screenshot for content script
          case 'screenshot':
            ////console.log('received screenshot request');
            bg.capture();
            break;

          // Creating debug tab
          case 'debug-tab':
            ////console.log('received debug tab');
            bg.debugImage = req.image;
            bg.createDebugTab();
            break;

          // Set color given in req
          case 'set-color':
            bg.setColor(req);
            break;

        }
      });
    });
  },

  // method for setting color. It set bg color, update badge and save to history if possible
  setColor: function (req) {
    // we are storing color with first # character
    if (!req.color.rgbhex.match(/^#/))
      req.color.rgbhex = '#' + req.color.rgbhex;

    bg.color = req.color.rgbhex;
    chrome.browserAction.setBadgeText({text: ' '});
    chrome.browserAction.setBadgeBackgroundColor({color: [req.color.r, req.color.g, req.color.b, 255]});

    // local storage only if available
    if (window.localStorage != null) {
      // save to clipboard through small hack
      if (window.localStorage['autoClipboard'] === "true") {
        var edCb = $('edClipboard');
        edCb.value = window.localStorage['autoClipboardNoGrid'] === "true" ? bg.color.substring(1) : bg.color;
        edCb.select();
        document.execCommand("copy", false, null);
      }

      // history can be disabled i.e when setting color from
      // history itself
      if (req.history == undefined || req.history != 'no') {
        var history = JSON.parse(window.localStorage.history);
        // first check if there isn't same color in history
        if (inArray(bg.color, history) < 0) {
          history.push(bg.color);
          window.localStorage.history = JSON.stringify(history);
        }
      }
    }
  },

  //
  activate: function (callback) {
    if(injectHash[bg.tab.id] == true) {
      if(callback) {
        callback();
      }
    }
    else {
      chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "js/inject.js"}, function () {
        injectHash[bg.tab.id] = true;
        if(callback) {
          callback();
        }
      });
    }

    /*bg.sendMessage({type: 'edropper-loaded'}, function (res) {
      if(res && res.dropperLoaded == true) {
        if(callback) {
          callback();
        }
      }
      else {
        chrome.tabs.executeScript(bg.tab.id, {allFrames: false, file: "js/inject.js"}, function () {
          if(callback) {
            callback();
          }
        });
      }
    });*/
  },

  hRulerActivate: function() {
    bg.activate(function() {
      // load options
      /*cursor = (window.localStorage.dropperCursor === 'crosshair') ? 'crosshair' : 'default';
       enableColorToolbox = (window.localStorage.enableColorToolbox === "false") ? false : true;
       enableColorTooltip = (window.localStorage.enableColorTooltip === "false") ? false : true;
       enableRightClickDeactivate = (window.localStorage.enableRightClickDeactivate === "false") ? false : true;*/

      // activate picker
      bg.sendMessage({type: 'hruler-activate', options: { themeColor: localStorage['THEME_COLOR'] || "#f00" }}, function () {
      });
    });
  },

  vRulerActivate: function() {
    bg.activate(function() {
      // activate picker
      bg.sendMessage({type: 'vruler-activate', options: { themeColor: localStorage['THEME_COLOR'] || "#f00" }}, function () {
      });
    });
  },

  pickupActivate: function () {
    bg.activate(function() {
      // activate picker
      bg.sendMessage({type: 'pickup-activate', options: { cursor: 'default', themeColor: localStorage['THEME_COLOR'] || "#f00" }}, function () {
      });
    });
  },

  // capture actual Screenshot
  capture: function () {
    ////console.log('capturing');
    try {
      chrome.tabs.captureVisibleTab(null, {format: bg.screenshotFormat, quality: 100}, bg.doCapture);
      // fallback for chrome before 5.0.372.0
    } catch (e) {
      chrome.tabs.captureVisibleTab(null, bg.doCapture);
    }
  },

  getColor: function () {
    return bg.color;
  },

  doCapture: function (data) {
    ////console.log('sending updated image');
    bg.sendMessage({type: 'update-image', data: data}, function () {
    });
  },

  createDebugTab: function () {
    // DEBUG
    if (bg.debugTab != 0) {
      chrome.tabs.sendMessage(bg.debugTab, {type: 'update'});
    } else
      chrome.tabs.create({url: 'debugimage.html', selected: false}, function (tab) {
        bg.debugTab = tab.id
      });
  },

  isThisPlatform: function (operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
  },

  tabOnChangeListener: function () {
    // deactivate dropper if tab changed
    chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
      if (bg.tab.id == tabId)
        bg.sendMessage({type: 'cancel'}, function () {
        });
    });

  },

  tabOnUpdateListener: function() {
    chrome.tabs.onUpdated.addListener(function (tabId) {
      console.log(tabId);
      delete injectHash[tabId];
    });
  },

  init: function () {
    // only if we have support for localStorage
    if (window.localStorage != null) {

      // show installed or updated page
      if (window.localStorage.firstInstall == undefined || window.localStorage.firstInstall === "false") {
        // TODO: for new installs inject ed helper to all tabs
        window.localStorage.firstInstall = true;
        chrome.tabs.create({url: 'options.html', selected: true});
      }
    }

    // windows support jpeg only ?
    bg.screenshotFormat = bg.isThisPlatform('windows') ? 'jpeg' : 'png';

    // we have to listen for messages
    bg.messageListener();

    // act when tab is changed
    // TODO: call only when needed? this is now used also if picker isn't active
    bg.tabOnChangeListener();

    bg.tabOnUpdateListener();
  }
};

document.addEventListener('DOMContentLoaded', function () {
  bg.init()
});

