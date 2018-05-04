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
    }

    var orderId = request('orderId');
    var from = request('from');

    /*左侧菜单*/
    tradePasswdFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {//tradePasswordSet :交易密码：1已设置 0未设置
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'交易密码'));
                if (resp.data.tradePasswordSet == 1) {
                    $('.step-setted').removeClass('hide');
                } else {
                    $('.step-set').removeClass('hide');
                }
                $('.show-mobile').html('+86 '+resp.data.mobile);
                tradePasswdFunc.setTradePasswd();//设置交易密码
                tradePasswdFunc.operation();
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    tradePasswdFunc.setTradePasswd = function () {
        $('.setup-box li input').focus(function () {//框校验
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })

        $('.step-set .set-passwd-btn,.step-forget .set-passwd-btn').on('click', function () {//设置和修改交易密码
            var $this = $(this);
            if ($this.hasClass('btn-inverse')) {
                return false;
            }
            var captcha = trim($('.code:visible').val());
            var tradePassword = trim($('.trade-passwd:visible').val());
            var againTradePassword = trim($('.again-trade-passwd:visible').val());
            if (!tradePassword) {
                $('.trade-passwd:visible').siblings('.error').html('请输入交易密码');
                return false;
            } else {
                if (!isSPasswd(tradePassword)) {
                    $('.trade-passwd:visible').siblings('.error').html('交易密码格式不正确');
                    return false;
                }
            }
            if (!againTradePassword) {
                $('.again-trade-passwd:visible').siblings('.error').html('请输入新交易密码');
                return false;
            } else {
                if (!isSPasswd(againTradePassword)) {
                    $('.again-trade-passwd:visible').siblings('.error').html('新交易密码格式不正确');
                    return false;
                }
            }
            if (againTradePassword) {
                if (tradePassword != againTradePassword) {
                    $('.again-trade-passwd:visible').siblings('.error').html('两次输入交易密码不一致');
                    return false;
                }
            }
            if (captcha == '') {
                $('.code:visible').siblings('.error').html('请输入验证码');
                return false;
            }
            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.setTradePasswd({
                captcha: captcha,
                tradePassword: tradePassword
            }, function (res) {
                if (res.code == 0) {
                    if(orderId && from=="noPassword"){
                        var tipsHtml = '<h1>您已经成功设置密码</h1>' +
                            '<h2>你可以点击“继续支付”按钮，返回支付界面完成支付</h2>';
                        var d2 = dialogOpt({
                            title: '提示',
                            class: 'tips-dialog',
                            content: tipsHtml,
                            textOkey: '继续支付',
                            textCancel: '取消',
                            funcOkey: function () {
                                d2.remove();
                                window.location.href = 'p_order_detail.html?orderId=' + orderId;
                            }
                        });
                    }else{
                        alertReturn('设置交易密码成功');
                    }
                    $('.step-set,.step-forget').addClass('hide');
                    $('.step-setted').removeClass('hide');
                    $('.again-trade-passwd,.trade-passwd,.code').val('');
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                    tradePasswdFunc.operation();
                    $(".send:visible").html("获取验证码").removeClass("color").removeClass('not');
                }else{
					alertReturn(res.exception);
					$this.addClass('btn-primary').removeClass('btn-inverse');
				}
            }, function (res) {
                alertReturn(res.exception);
                $this.addClass('btn-primary').removeClass('btn-inverse');
            });
        })

        $('.send:visible').on('click', function () {//发送短信验证码按钮
            var $this = $(this);
            if ($this.hasClass('not')) {
                return false;
            }
            var mobile = $('.show-mobile:visible').text().replace('+86 ', '');
            $this.addClass('not');
            interface.smsGetSms({
                type: 5,
                mobile: mobile
            }, function (res) {
                if (res.code == 0) {
                    captcha(res.data.coolDown);
                } else {
                    alertReturn(res.exception);
                }
            }, function (res) {
                alertReturn(res.exception);
            });
        })
    }
    var time;

    function captcha(coolDown) {
        time = coolDown;
        $(".send:visible").html("重新发送(" + time + ")").addClass("color");
        lazy();
    }

    function lazy() {
        if (time >= 1) {
            $(".send:visible").html("重新发送(" + time-- + ")");
            setTimeout(lazy, 1000);
        }
        else {
            $(".send:visible").html("获取验证码").removeClass("color").removeClass('not');
        }
    }

    /**
     *操作按钮*
     **/
    tradePasswdFunc.operation = function () {
        $('.reset-passwd-btn').on('click', function () {//重置交易密码
            $('.step-setted').addClass('hide');
            $('.step-update').removeClass('hide');
            tradePasswdFunc.setTradePasswd();//设置交易密码
        })

        $('.forget-passwd-btn').on('click', function () {//忘记交易密码
            $('.step-setted').addClass('hide');
            $('.step-forget').removeClass('hide');
            tradePasswdFunc.setTradePasswd();//设置交易密码
        })

        $('.step-update .set-passwd-btn').on('click', function () {//重置交易密码
            var $this = $(this);
            if ($this.hasClass('btn-inverse')) {
                return false;
            }
            console.log('hey')
            var tradePassword = trim($('.trade-passwd:visible').val());
            var newTradePassword = trim($('.new-trade-passwd:visible').val());
            var againTradePassword = trim($('.again-trade-passwd:visible').val());
            if (!tradePassword) {
                $('.trade-passwd:visible').siblings('.error').html('请输入原交易密码');
                return false;
            }

            if (!newTradePassword) {
                $('.new-trade-passwd:visible').siblings('.error').html('请输入新交易密码');
                return false;
            } else {
                if (!isSPasswd(newTradePassword)) {
                    $('.new-trade-passwd:visible').siblings('.error').html('新交易密码格式不正确');
                    return false;
                }
            }
            if (!againTradePassword) {
                $('.again-trade-passwd:visible').siblings('.error').html('请输入确认新交易密码');
                return false;
            } else {
                if (!isSPasswd(againTradePassword)) {
                    $('.again-trade-passwd:visible').siblings('.error').html('确认新交易密码格式不正确');
                    return false;
                }
            }
            if (againTradePassword) {
                if (newTradePassword != againTradePassword) {
                    $('.again-trade-passwd:visible').siblings('.error').html('两次输入交易密码不一致');
                    return false;
                }
            }

            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.resetTradePasswd({
                oldTradePassword: tradePassword,
                newTradePassword: newTradePassword
            }, function (res) {
                if (res.code == 0) {
                    alertReturn('设置交易密码成功');
                    $('.step-update').addClass('hide');
                    $('.step-setted').removeClass('hide');
                    $('.again-trade-passwd,.trade-passwd,.new-trade-passwd').val('');
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                    tradePasswdFunc.operation();
                    $(".send:visible").html("获取验证码").removeClass("color").removeClass('not');
                }else{
					alertReturn(res.exception);
					$this.addClass('btn-primary').removeClass('btn-inverse');
				}
            }, function (res) {
                alertReturn(res.exception);
                $this.addClass('btn-primary').removeClass('btn-inverse');
            });
        })

        tradePasswdFunc.setTradePasswd();//设置交易密码
    }

    tradePasswdFunc.init();
});
