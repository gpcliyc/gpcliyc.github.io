/**
 * @date  2017/10/09
 * @author  sfj
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    require("interface");
    require("pagination");
    require('underscore-min');
    var global = require("global");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var languagePackage = null;
    var emailRegister = {};
    /*初始化*/
    emailRegister.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
    }
    emailRegister.template = function () {

        template.helper('setLanguagePackage',function (key) {
            if(key in languagePackage){
                return languagePackage[key];
            }
        })
    }
    emailRegister.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_email_registerNational/p_email_register.json',function (resp) {
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
    emailRegister.renderBlock = function () {
        $("#email_registration").html(template('t:email_registration'));
    }
    emailRegister.init();
});
