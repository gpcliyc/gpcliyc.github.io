/**
 * @authors sfj
 * @date    2017-09-08
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    require('bootstrap');
    require('underscore-min');
    var template = require("artTemplate");
    var leftMenu = {
        leftShow : function (data,str) {
            var templates ="" ;
            if(data){
                var tpl = require('./leftMenu.html');
                templates = template.render(tpl)({data:data,str:str});
            }
            return templates;
        }
    }

    var languagePackageLeftMenu = null;
    var language = getAcceptLanguage();
    $.ajaxSettings.async = false;
    $.getJSON('../js/component/leftMenu/leftMenu.json',function (resp) {
        if(resp){
            for(var i=resp.length-1;i>=0;i--){
                var keys = _.keys(resp[i]);
                if(language === keys[0]){
                    languagePackageLeftMenu = resp[i][language];
                    break ;
                }
            }
        }
    })

    /**
     * 模板解析方法
     */
    template.helper('setLanguagePackageLeftMenu',function (key) {
        if(key in languagePackageLeftMenu){
            return languagePackageLeftMenu[key];
        }
    })
    module.exports = leftMenu;
});
