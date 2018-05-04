/**
 * @authors sfj
 * @date    2016-09-11
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    require("interface");
    var bootstrap = require("bootstrap");
    var header = require('header');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var filter = require('filter');
    filter.showLoginStatus();

    var user = getUser();//获取登录状态
    var goodsId = request('goodsId');//获取商品I
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；
    var marketActive = {};
    marketActive.init = function () {
            this.setStyle();
            this.showMoreActive();
    }
    marketActive.setStyle  =function () {
        var screenWidth = $(".middle_title").width();
        var stripeWidth = (screenWidth-475-10)/2;
        var stripeWidthPercent = (stripeWidth/screenWidth)*100+'%'
        $(".middle_title .middle_left").css({"width":stripeWidthPercent});
        $(".middle_title .middle_right").css({"width":stripeWidthPercent});
    }
    marketActive.showMoreActive = function () {
        $('.more_active  .show_btn').click(function () {
            window.location.href = "p_integral_mall.html";
        });
    }

    marketActive.init();
});
