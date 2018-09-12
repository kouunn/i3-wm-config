$(document).ready(function () {
    var bg = chrome.extension.getBackgroundPage();

    function isWindowsOrLinuxPlatform() {
        return navigator.userAgent.toLowerCase().indexOf('windows') > -1 ||
            navigator.userAgent.toLowerCase().indexOf('linux') > -1;
    }

    function i18nReplace(id, messageid) {
        return $('#' + id).html(chrome.i18n.getMessage(messageid || id));
    }

    function init() {
        i18nReplace('optionPageTitle');
        i18nReplace('optionTitle', 'name');
        i18nReplace('shorcutSetting', 'shortcut');
        i18nReplace('settingShortcutText', 'enableShortcut');
        i18nReplace('saveAndClose', 'saveAndClose');
        i18nReplace('colorTitle', 'optionColorTitle');
        i18nReplace('colorTip', 'spectrumTip');
        $('#colorpicker label').text(chrome.i18n.getMessage('colorpicker'));
        $('#rulerH label').text(chrome.i18n.getMessage('rulerH'));
        $('#rulerV label').text(chrome.i18n.getMessage('rulerV'));

        HotKey.setup();
        HotKeySetting.setup();

        localStorage['THEME_COLOR'] = localStorage['THEME_COLOR'] || "#f00";

        $("#spectrum").spectrum({
            showInput: true,
            color: localStorage['THEME_COLOR'],
            chooseText: chrome.i18n.getMessage('spectrumChoose'),
            cancelText: chrome.i18n.getMessage('spectrumCancel'),
            change: function (color) {
                localStorage['THEME_COLOR'] = color.toHexString();
            }
        });

        $("#saveAndClose").click(function () {
            if (save()) {
                chrome.tabs.getSelected(null, function (tab) {
                    chrome.tabs.remove(tab.id);
                });
            }
        });
    }

    function save() {
        return HotKeySetting.save();
    }

    var HotKeySetting = (function () {
        const CHAR_CODE_OF_AT = 64;
        const CHAR_CODE_OF_A = 65;
        const CHAR_CODE_OF_Z = 90;
        var hotKeySelection = document.querySelectorAll('#hot-key-setting select');
        var isWindowsOrLinux = isWindowsOrLinuxPlatform();

        var hotkey = {
            setup: function () {
                for (var i = 0; i < hotKeySelection.length; i++) {
                    hotKeySelection[i].add(new Option('--', '@'));
                    for (var j = CHAR_CODE_OF_A; j <= CHAR_CODE_OF_Z; j++) {
                        var value = String.fromCharCode(j);
                        var option = new Option(value, value);
                        hotKeySelection[i].add(option);
                    }
                }

                $('#colorpicker select').get(0).selectedIndex =
                    HotKey.getCharCode('colorpicker') - CHAR_CODE_OF_AT;
                $('#rulerH select').get(0).selectedIndex =
                    HotKey.getCharCode('rulerH') - CHAR_CODE_OF_AT;
                $('#rulerV select').get(0).selectedIndex =
                    HotKey.getCharCode('rulerV') - CHAR_CODE_OF_AT;

                $('#settingShortcut').click(function () {
                    hotkey.setState(this.checked);
                });

                hotkey.setState(HotKey.isEnabled());
            },

            validate: function () {
                var hotKeyLength =
                    Array.prototype.filter.call(hotKeySelection,
                        function (element) {
                            return element.value != '@'
                        }
                    ).length;
                if (hotKeyLength != 0) {
                    var validateMap = {};
                    validateMap[hotKeySelection[0].value] = true;
                    validateMap[hotKeySelection[1].value] = true;
                    validateMap[hotKeySelection[2].value] = true;

                    if (Object.keys(validateMap).length < hotKeyLength) {
                        ErrorInfo.show('hot_key_conflict');
                        return false;
                    }
                }
                ErrorInfo.hide();
                return true;
            },

            save: function () {
                var result = true;
                if ($('#settingShortcut').prop('checked')) {
                    if (this.validate()) {
                        HotKey.enable();
                        HotKey.set('colorpicker', $('#colorpicker select').val());
                        HotKey.set('rulerH', $('#rulerH select').val());
                        HotKey.set('rulerV', $('#rulerV select').val());
                    }
                    else {
                        result = false;
                    }
                }
                else {
                    HotKey.disable(bg);
                }

                return result;
            },

            setState: function (enabled) {
                $('#settingShortcut').prop('checked', enabled);
                $('#hot-key-setting').css('color', enabled ? '' : '#6d6d6d');
                for (var i = 0; i < hotKeySelection.length; i++) {
                    hotKeySelection[i].disabled = !enabled;
                }
                ErrorInfo.hide();
            },

            focusScreenCapture: function () {
                $('#screen-capture-hot-key').focus();
            }
        };
        return hotkey;
    })();

    var ErrorInfo = (function () {
        var infoWrapper = $('#error-info');
        return {
            show: function (msgKey) {
                var msg = chrome.i18n.getMessage(msgKey);
                infoWrapper.text(msg);
                infoWrapper.show();
            },

            hide: function () {
                infoWrapper.hide();
            }
        };
    })();

    init();
});