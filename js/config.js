/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
var version = "20130424";
seajs.config({
   alias: {
        // JQuery 相关插件
        "jquery": "jquery/2.1.4/jquery",
        "jqueryui": "jqueryui/jquery-ui",
        "jCookie": "j.cookie",
        "bxslider": "j.bxslider",
        "artTemplate": "template",
        "pagination": "j.pagination",
        "zic": "zic",
        "webuploader": "webuploader/webuploader",
        "area": "area",
        "cityselect": "citySelect",
        "count": "count",
        // three.js
        "three": "three.min.js",
        //bootstrap
        "bootstrap":"bootstrap/js/bootstrap",
        // 页面脚本
        "common": "../js/common",
        "header": "../js/header",
        "interface": "../js/interface",
        "http": "../js/httpClient",
        "analytics": "../js/analytics",
        "filter": "../js/filter",
        "global": "../js/global",//格式化时间
        "floatTool": "../js/floatTool",//精度计算
        "My97DatePicker": "My97DatePicker/WdatePicker", //v1.1.2
        "zic_type": "zic_type", //v1.1.2
        "jqueryI18n": "jquery.i18n.properties.min",
        "webuploader": "webuploader/webuploader",
        "intlTel":"intlTel/intlTelInput",
        "utils":"intlTel/utils",
        'sea-text':'seajs/2.2.3/sea-text',
        'swiper':'swiper-3.4.2.min',
        'thJsCallWx':'weixin/thJsCallWx'
      },
    // 预加载, 在使用use时生效
    preload: ["jquery", "artTemplate",'sea-text'],
    map: [
        ['.js', '.js?v=' + version]
    ]
});

//百度统计，加在analytics.js/common.js/header.js里均无用？
//var _hmt = _hmt || [];
//(function() {
//    var hm = document.createElement("script");
//    hm.src = "https://hm.baidu.com/hm.js?4d6f82be0fd7cf6a18da4ca5294ca92d";
//    var s = document.getElementsByTagName("script")[0];
//    s.parentNode.insertBefore(hm, s);
//})();

// 远程服务器地址
//seajs.host = "http://localhost:8081";
seajs.host = "http://123.57.175.237:8081"; // dev
//seajs.host = "http://123.57.175.237:9081"; // test
seajs.wsHost = "ws://123.57.175.237:8081";
//jsTicketUrl
seajs.jsTicketUrl = "";




