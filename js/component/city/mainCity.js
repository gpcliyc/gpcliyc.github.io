/**
 * @authors sfj
 * @date    2017-10-17
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var template = require('artTemplate');
    require('bootstrap');
    require("../../common");
    require("sea-text");
    require('underscore-min');
    var getSelectOption = {};
    var languagePackage = null;
    var province = ['请选择','北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏','浙江','安徽','福建'
        ,'江西','山东','河南','湖北','湖南','广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆'];
    var foreignCounty = ['请选择国家或地区','俄罗斯','印度','美国','印度尼西亚','伊朗','沙特','阿曼','喀麦隆','委内瑞拉','危地马拉','中国香港','中国台湾','中国澳门'];
    var countryType = ['中国','其他国家和地区'];
    var countryType2 = ['中国','其他国家和地区'];
    function selectLanguage() {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/city/mainCity.json',function (resp) {
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
    getSelectOption.getSelectOption = function (value) {
        var valueArr = [];
        switch(value){
            case "province":
                valueArr = province;
                break;
            case "foreignCounty":
                valueArr = foreignCounty;
                break;
            case "countryType":
                valueArr = countryType;
                break;
            case "countryType2":
                valueArr = countryType2;
                break;
        }
        var optionStr = '';
        for(var i=0;i<valueArr.length;i++){
            var current = valueArr[i];
            optionStr += '<option value="'+languagePackage[current]+'">'+languagePackage[current]+'</option>'

        }
        return optionStr;
    }
    selectLanguage();
    // function getSelectOption(value) {
    //     var optionStr = '';
    //     for(var i=0;i<value.length;i++){
    //         var current = value[i];
    //         optionStr += '<option value="'+languagePackage[current]+'">'+languagePackage[current]+'</option>'
    //     }
    //     return optionStr;
    // }


    module.exports = getSelectOption;
});
