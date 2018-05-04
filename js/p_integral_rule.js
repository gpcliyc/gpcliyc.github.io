/**
 * @authors sfj
 * @date    2016-08-28
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
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var filter = require('filter');
    filter.showLoginStatus();

    var user = getUser();//获取登录状态
    var languagePackage = null;
    var goodsId = request('goodsId');//获取商品I
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；
    var goodsConvert = {};
    goodsConvert.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
    }
    goodsConvert.template = function () {

        template.helper('setLanguagePackage',function (key) {
            if(key in languagePackage){
                return languagePackage[key];
            }
        })
        template.helper('setLanguagePackageCss',function (key) {
            if(key in languagePackage['css']){
                return languagePackage['css'][key];
            }
        })
        template.helper('parseInt',function (number) {
            return parseInt(number);
        })
    }
    goodsConvert.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_integral_mallNational/p_integral_mall.json',function (resp) {
            if(resp){
                for(var i=resp.length-1;i>=0;i--){
                    var keys = _.keys(resp[i]);
                    if(language === keys[0]){
                        languagePackage = resp[i][language];
                        break ;
                    }
                }
            }
        })
    }
    goodsConvert.renderBlock = function () {
        var rate = commonData('ORDER_INTEGRALS_RATE');//客户经理提成比例(默认0.00025,即0.025%)
        $("#goods_convert_area").html(template('t:goods_convert_area', {rate: rate*100}));
    }

    goodsConvert.init();
});
