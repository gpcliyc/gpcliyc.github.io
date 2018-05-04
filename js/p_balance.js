/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-30 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    var interfaces = require("interface");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var balanceFunc = {};
    balanceFunc.init = function () {
        this.leftMenu();//左侧菜单
    }

    /**
     *左侧菜单*
     **/
    balanceFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'账户概览'));
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
                $('.total-balance span').html(resp.data.totalBalance.toFixed(2));
                $('.userable-balance span').html(resp.data.useableBalace.toFixed(2));
                balanceFunc.operation(resp.data);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /**
     *提现充值按钮*
     */
    balanceFunc.operation = function (data) {

        widthDrawDialog(data);//提现弹框
        rechargeDialog();//充值弹框
    }

    balanceFunc.init();
});
