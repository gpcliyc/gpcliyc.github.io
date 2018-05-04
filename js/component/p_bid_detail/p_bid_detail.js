/**
 * Created by like on 2017/7/5.
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var template = require('artTemplate');
    require('bootstrap');
    require("sea-text");
    require('underscore-min');
    var languagePackage = null;
    var p_bid_detail = {

        render:function (data,languagePackage) {
            var templates ="" ;
            this.el = "" ;
            this.helper(languagePackage);
            if(data){
              var tpl = require('./p_bid_detail.html');
              var minBuyQuantity = Number(commonData('MIN_BUY_QUANTITY'));//最小申买量
              templates = template.render(tpl)({data:data,languagePackage:languagePackage,minBuyQuantity:minBuyQuantity});
              this.el = $(templates).get(0);
            }
            this.bindEvent(data);
            return this;
        },
        bindEvent:function (data) {
            $(this.el).find('#myTab a:first').tab('show');
            $(this.el).find('#myTab a').bind('click',function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            //查看质检报告
            $(this.el).find("#review_report").bind('click',function(){
                window.open(data.inspectionReport)
            });
         },
        helper:function (languagePackage) {
            if(languagePackage) languagePackage =languagePackage;
            // languagePackage =languagePackage;
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
          template.helper('tenderType',function (type) {
              switch (type){
                  case 1: return languagePackage["供给标"];
                  case 2: return languagePackage["需求标"];
              }
          });
          template.helper('petrolType',function (type) {
              switch (type){
                  case 1: return languagePackage["石油焦"];
                  case 2: return languagePackage["煅后焦"];
                  case 3: return languagePackage["焦炭"];
              }
          })
        }
    }
    module.exports = p_bid_detail;
});
