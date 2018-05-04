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
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var helpFunc = {};
    /*初始化*/
    helpFunc.init = function () {
        this.supply()
    }

    helpFunc.supply = function(){
        $('#supply').on('click',function () {
            window.open('../pdf/焦易网供应商操作手册.pdf')
        })
    }

    helpFunc.init();
});
