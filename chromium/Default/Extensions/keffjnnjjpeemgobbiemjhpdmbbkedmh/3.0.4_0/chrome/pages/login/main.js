function set_i18n_text() {
	"use strict";
	$("label#Email").html(get_msg("Email")), $("label#Password").html(get_msg("Password")), $("#nitc_submit").html(get_msg("Login")), $("#nitc_signup").html(get_msg("Signup")), $("#nitc_forgetpasswd").html(get_msg("ForgetPassword")), $("#Premium_is_good").html(get_msg("Premium_is_good"))
}
function check_member(t) {
	return "None" != t ? "is member, until " + t : "not premium"
}
window.ondragstart = function() {
	return !1
};
var get_msg = chrome.i18n.getMessage;
$(function() {
	function t() {
		var t = $("#nitc_username").val(),
			s = $("#nitc_password").val();
		$.post(support_url + "/account/elogin/", {
			identification: t,
			password: s
		}, function(s) {
			var i = s.msg;
			switch (i) {
			case "user wrong":
				$("#msg_fail").html(get_msg("Msg_user_wrong"));
				break;
			case "not active":
				$("#msg_fail").html(get_msg("Msg_user_not_active"));
				break;
			case "success":
				if ("True" == s.isf) {
					var i = {
						id: "probonus",
						title: get_msg("probonus_title"),
						message: get_msg("probonus_message", [s.premium_until]),
						icon: ""
					};
					e.showNotification(i)
				}
				chrome.storage.sync.set({
					em: t,
					en: s.en
				}, function() {
					e.refresh_pu(), $("#msg_success").html(t + get_msg("Msg_login_success")), $(".container").hide(), setTimeout("window.close()", 2e3)
				});
				break;
			default:
				$("#msg_fail").html("login failed, if always fail, please add a feedback with this msg:" + s), ga_report_error("Login Error", JSON.stringify(s))
			}
		}, "json").fail(function(t, e, s) {
			$("#msg_fail").html("login failed, if always fail, please add a feedback with this msg: <i>textStatus:" + e + ";error:" + s + "</i>"), ga_report_error("Login Error", "textStatus:" + e + ";error:" + s)
		})
	}
	set_i18n_text();
	var e = chrome.extension.getBackgroundPage();
	$("#nitc_signup").attr("href", support_url + "/accounts/signup/"), $("#nitc_forgetpasswd").attr("href", support_url + "/accounts/password/reset/"), $("#nitc_submit").on("click", function(e) {
		return e.preventDefault(), t(), !1
	})
});