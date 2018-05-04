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
    var tradePasswdFunc = {};
    tradePasswdFunc.init = function () {
        this.leftMenu();//左侧菜单
        tradePasswdFunc.operation();

    }

    var orderId = request('orderId');
    var from = request('from');

    /*左侧菜单*/
    tradePasswdFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            console.log(resp.data)//用户信息判断没有结束
            if (resp.code == 0) {//tradePasswordSet :交易密码：1已设置 0未设置
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'登录密码'));
                $('.show-mobile').html('+86 '+resp.data.mobile);

            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /**
     *操作按钮*
     **/
    tradePasswdFunc.operation = function () {
        $('.step-setted').removeClass('hide');
        $('.reset-passwd-btn').on('click', function () {//修改密码
            $('.step-setted').addClass('hide');
            $('.step-update').removeClass('hide');
            // tradePasswdFunc.setTradePasswd();//设置登录密码
        })

        $('.step-update .set-passwd-btn').on('click', function () {//校验登录密码
            var $this = $(this);
            if ($this.hasClass('btn-inverse')) {
                return false;
            }
            var tradePassword = trim($('.trade-passwd:visible').val());
            var newTradePassword = trim($('.new-trade-passwd:visible').val());
            var againTradePassword = trim($('.again-trade-passwd:visible').val());
            $('.again-trade-passwd,.trade-passwd,.new-trade-passwd').siblings('.error').html('');
            if (!tradePassword) {
                $('.trade-passwd:visible').siblings('.error').html('请输入原登录密码');
                return false;
            }

            if (!newTradePassword) {
                $('.new-trade-passwd:visible').siblings('.error').html('请输入新登录密码');
                return false;
            } else {
                if (!isPasswd(newTradePassword)) {
                    $('.new-trade-passwd:visible').siblings('.error').html('密码需包含字母、数字，且长度不小于6位');
                    return false;
                }
            }
            if (!againTradePassword) {
                $('.again-trade-passwd:visible').siblings('.error').html('请输入确认新登录密码');
                return false;
            }
            if (againTradePassword) {
                if (newTradePassword != againTradePassword) {
                    $('.again-trade-passwd:visible').siblings('.error').html('两次输入登录密码不一致');
                    return false;
                }
            }
            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.resetLoginPasswd({
                oldPassword: tradePassword,
                newPassword: newTradePassword
            }, function (res) {
                if (res.code == 0) {
                    alertReturn('设置登录密码成功');
                    $('.step-update').addClass('hide');
                    $('.step-setted').removeClass('hide');
                    $('.again-trade-passwd,.trade-passwd,.new-trade-passwd').val('').siblings('.error').html('');
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                }else{
                    alertReturn(res.exception);
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                }
            }, function (res) {
                alertReturn(res.exception);
                $this.addClass('btn-primary').removeClass('btn-inverse');
            });
        })

        //tradePasswdFunc.setTradePasswd();//设置登录密码
    }

    tradePasswdFunc.init();
});
