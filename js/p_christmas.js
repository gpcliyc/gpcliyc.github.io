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
//  header.serviceOnline();
    var filter = require('filter');
    require('thJsCallWx');
    filter.showLoginStatus();

    var user = getUser();//获取登录状态
    var goodsId = request('goodsId');//获取商品I
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；
    var marketActive = {};
    marketActive.init = function () {
            this.setStyle();
            this.showMoreActive();
            this.options();
            this.wxFengxiang();
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
    marketActive.options = function () {
        $(".middle_coin a").click(function () {
            //未登录则跳登陆页
            var user = getUser();
            if(!user || !user.login){
                window.location.href = "/";
                return ;
            }
            window.location.href = this.title;
        });
    }
    marketActive.wxFengxiang = function () {
        /*微信端右上角分享*/
        if (isWXBrowser()) {
            thJsCallWx.callWx({
                title: '双旦狂欢，“币”不可挡', // 分享标题
                desc: '京东E卡、话费充值卡、大牌口红、香水等豪礼己上线，速来抢、抢、抢！', // 分享内容
                link: window.location.href,//分享链接：当前页
                imgUrl: 'https://petrocoke.oss-cn-beijing.aliyuncs.com/petrocoke/201712201430001915.jpeg' //分享时显示图片
            });
        }
    }

    marketActive.init();
});
