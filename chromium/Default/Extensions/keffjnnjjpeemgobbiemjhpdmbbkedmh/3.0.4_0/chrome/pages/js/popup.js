function set_i18n_text(){"use strict";$("div#social strong").html(get_msg("social_title")),$("div#help_text").html(get_msg("help",[support_url+"/faq/"])),$("div#feedback").html(get_msg("feedback",[support_url+"/feedback/"])),$("div#rating").html(get_msg("rating",[support_url+"/ext_rating/"])),$("span.premium").html(get_msg("premium")),$("h4#block_ads_title").html(get_msg("block_ads")),$("button#refresh_member").html(get_msg("refresh_member_btn")),$("#confligExt").html(get_msg("Working_nomal")),$(".ads_btn_replacer").html(get_msg("Expire_featrue")),$("#ext_pro").html(get_msg("Ext_pro")),$("#btn_exit").html(get_msg("btn_exit")),$("#ads_notice").html(get_msg("ads_notice")),$("#feedback_btn").html(get_msg("feedback_btn",[support_url+"/feedback/"])),$("#mobileUseTip").html(get_msg("mobileUseTip")),$(".m_server_type_basic").html(get_msg("m_server_type_basic")),$(".m_server_type_pro").html(get_msg("m_server_type_pro")),$(".m_server_type_intro").html(get_msg("m_server_type_intro",[support_url+"/faq/#Q_5"])),$("#in_queue").html(get_msg("user_in_queue_content")),$("#contri_rate").html(get_msg("contri_rate")),$("#contri_rate").prop("title",get_msg("contri_title")),$("#contri_expire_desc").html(get_msg("contri_expire_desc")),$("#contri_notice_a").html(get_msg("contri_notice")),$("#disable_contri").html(get_msg("disable_contri")),$("#user_agreement").html(get_msg("user_agreement"))}function startTimer(e,t){var r=new Timer;r.start({countdown:!0,startValues:{seconds:e}}),$("#in_queue").show(),document.getElementById("timer").innerHTML=r.getTimeValues().toString(),r.addEventListener("secondsUpdated",function(e){document.getElementById("timer").innerHTML=r.getTimeValues().toString()}),r.addEventListener("targetAchieved",function(e){document.getElementById("in_queue").innerHTML=t,document.getElementById("timer").innerHTML=""})}function date_second_diff(e,t){var r=e-t,n=Math.floor(r/1e3);return n}var get_msg=chrome.i18n.getMessage;$(document).ready(function(){"use strict";function e(){a.remove_storage(["em","em"]),t(""),a.remove_pu(),a.monitor_server_addr(),a.unset_v_p()}function t(e){e?($("#not_login").hide(),$("#already_login").show(),$("#username").html(get_msg("Welcome")+","+e),$("#c_server_addr").show()):($("#not_login").show(),$("#already_login").hide(),$("#c_server_addr").hide())}function r(){var e=a.unblock_boundary.storage.load("is_pro_expired_notice_done");if(!e){var t={time:Date.now(),icon:"",title:get_msg("Pro_expired"),message:get_msg("Pro_expired_notice"),link:support_url+"/buy/"};a.showRichNotification(t),a.richNotificationEvent(t);var r=new Date,n=r.setDate(r.getDate()+7);a.unblock_boundary.storage.save("is_pro_expired_notice_done","true",n)}}function n(){var e=a.unblock_boundary.storage.load("is_pro_near_expire_notice_done");if(!e){var t={time:Date.now(),icon:"",title:get_msg("Pro_near_expire"),message:get_msg("Pro_near_expire_notice"),link:support_url+"/buy/"};a.showRichNotification(t),a.richNotificationEvent(t);var r=new Date,n=r.setDate(r.getDate()+1);a.unblock_boundary.storage.save("is_pro_near_expire_notice_done","true",n)}}function o(e){if(e){parseInt(e);e>=0&&2>=e&&n()}var t=a.is_pu_valid(e);t?($(".m_server_type_basic").html(get_msg("m_server_type_pro")+0),$("#is_member").html(get_msg("Pro_valid",[e])).removeClass("text-warning"),$(".show_expire_msg").hide(),$("#ads_btn").css("opacity",1),$("#ads_help_msg").show(),$("#c_server_addr_btn").removeClass("disabled"),$("#c_server_addr_btn_down").removeClass("disabled"),$("#in_queue_tr").hide(),$("#gongxian").hide()):($(".m_server_type_basic").html(get_msg("m_server_type_basic")),$("#is_member").html(get_msg("Pro_expired",[e])).attr("class","text-warning"),$(".show_expire_msg").show(),$("#ads_btn").css("opacity",.2),$("#ads_help_msg").hide(),$("#c_server_addr_btn").addClass("disabled"),$("#c_server_addr_btn_down").addClass("disabled"),$("#in_queue_tr").show(),a.monitor_server_addr(),r(),$("#gongxian").show())}function _(){var e=a.localStorage.getItem("extOn")||!0;e=JSON.parse(e),$("#pause_btn_onoff").prop("checked",e),e?($("#setting_table").show(),$("#confligExt").html(get_msg("Working_nomal")),a.change_browser_icon("regular")):($("#setting_table").hide(),$("#confligExt").html(get_msg("Working_paused")),a.updateIcon("chrome/icons/icon19gray.png",get_msg("Working_paused")))}function i(e){var t=$("#c_server_addr_ul li a")[e];$("#c_server_addr_btn").text($(t).text())}function s(){var e=a.localStorage.getItem("queue");if(e){var t=new Date(parseInt(e)),r=date_second_diff(t,new Date);r>0&&startTimer(r,get_msg("user_in_queue_done"))}}set_i18n_text();var a=chrome.extension.getBackgroundPage(),g=a.getHashContribute();g?($("#contri_value").html(g.hashContribute),$("#contri_expire_value").html(g.expireTime.Format("yyyy-MM-dd")),$("#gongxian").show()):$("#gongxian").hide(),$("#contri_rate").attr("href",support_url+"/flat/other/contribution/"),$("#contri_notice_a").attr("href",support_url+"/flat/other/contribution/"),$("#disable_contri").attr("href",support_url+"/flat/other/disable_contribution/"),$("#ext_pro").attr("href",support_url+"/ext_pro/"),$("#mobileUseTip").attr("href",support_url+"/how-to-use-in-mobile/"),$("#user_agreement").attr("href",support_url+"/agreement/"),$("#btn_exit").click(function(){e()}),a.get_storage("em",function(e){t(e)});var m=a.get_pu();m?o(m):t(""),$("#refresh_member").on("click",function(e){return $("#is_member").html("refreshing, please wait..."),a.refresh_pu(),!1}),chrome.runtime.onMessage.addListener(function(t){"pinfo refreshed"==t.msg_type?o(t.info):"server_addr_index_changed"==t.msg_type?i(t.info):"clear_pro_feature"==t.msg_type&&e()});var c=navigator.language.substr(0,2);if("en"===c||"zh"===c){var l="Unblock Boundary"+a.unblock_boundary.lastest_new_version;l+=" ("+c+"); ",l+=navigator.userAgent,l=encodeURIComponent(l).replace(/%2F/g,"/");var d=$("#feedback a");d.prop("href",d.prop("href")+"?t="+l)}chrome.browserAction.setBadgeText({text:""}),a.get_storage("previous_new_version",function(e){"undefined"!=typeof e&&e===a.unblock_boundary.lastest_new_version||a.set_storage("previous_new_version",a.unblock_boundary.lastest_new_version)}),$("div#version small").html("Unblock Boundary v"+a.unblock_boundary.lastest_new_version);var u=new Date;"undefined"==typeof localStorage.first_time?localStorage.first_time=u.getTime():u.getTime()>parseInt(localStorage.first_time,10)+2592e5&&$("div#rating").show(),$("#myonoffswitch").prop("checked",a.videoOn),$("#tips").html(a.tips),$("#myonoffswitch").click(function(){localStorage.videoOn=a.videoOn=$("#myonoffswitch").prop("checked")}),$("#pause_btn_onoff").click(function(){var e=$("#pause_btn_onoff").prop("checked");a.localStorage.setItem("extOn",e),e?($("#setting_table").show(),$("#confligExt").html(get_msg("Working_nomal")),a.change_browser_icon("regular")):($("#setting_table").hide(),$("#confligExt").html(get_msg("Working_paused")),a.updateIcon("chrome/icons/icon19gray.png",get_msg("Working_paused"))),a.setExtOnOff()}),$("#c_server_addr_ul li a").click(function(){var e=$(this);$("#c_server_addr_btn").text(e.text());var t=parseInt(e.attr("data-attr"));a.change_server_addr(t)});var p=a.localStorage.getItem("server_addr_index")||"0";if(i(p),_(),a.warmingProxy&&a.warmingProxy.length>0){for(var h='<span style="color:red">'+get_msg("Warning_proxy")+'</span><ul style="color:red">',f=0;f<a.warmingProxy.length;f++)h+="<li>"+a.warmingProxy[f].name+"</li>";h+="</ul>",$("#confligExt").html(h)}s()});