/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    require("interface");
    require("pagination");
    var global = require("global");
    require('underscore-min');
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var p_bidding_rule = {};
    var languagePackage = null;
    /*初始化*/
    p_bidding_rule.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();

    }
    p_bidding_rule.template = function () {
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
    }
    p_bidding_rule.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_ruleNational/p_bid_rule.json',function (resp) {
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
    p_bidding_rule.renderBlock = function () {
        $("#bidRuleContent").html(template('t:bidRuleContent'));
    }
    p_bidding_rule.init();
});
