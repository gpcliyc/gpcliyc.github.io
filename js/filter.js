/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var http = require("http");
    var common = require("common");
    require("jCookie");
    var user = getUser();
    function toLoginPage() {
        if (!user.login) {
            window.location.href = "/";
        }
    }

    function showLoginStatus() {
        // 判断是否登录
        if (!user.login) {
            $('.main .box').show();
        }else{
        	$('.main .text-box').removeClass('text-box').addClass('text-box-login');
        	$('.main .con').removeClass('con').addClass('con-login');
        }
    }

    function isLogin() {
        var token = $.cookie("token");
        if (token) {
            return true;
        } else {
            return false;
        }
    }

    module.exports = {
        "toLoginPage": toLoginPage,
        "showLoginStatus": showLoginStatus,
        "isLogin": isLogin
    };
});