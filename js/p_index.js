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
    var interfaces = require("interface");
    var three = require('three');//3d图形框架,暂时没用
    var header = require('header');
    // var serviceOnline = require('serviceOnline'); //在线客服
    require("jqueryI18n");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var filter = require('filter');
    filter.showLoginStatus();

    var user = getUser();//获取登录状态
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；

    var indexFunc = {};
    indexFunc.init = function () {
        this.commonData();
        //this.initHeader();//判断登录来显示顶部
        this.switchTab();//切换tab
        this.loginModel();//登录部分
        this.registerModel();//注册部分
        this.getCode();//获取注册验证码
        //this.canvas();
        this.switchCheckbox();//复选框选中/不选中
        this.protocal();
        this.popupDiscountCoupon();
//        this.marketActiveDialog(); 去掉弹框
        this.marketActiveClose();
        this.marketActiveShow();
        this.showDialog();
        this.advertisement();//广告轮播图
        this.activeSize();//ad size
    }


    //初始化页面时验证是否记住了密码
    if ($.cookie("userName")) {
        $(".login-box .mobile").val($.cookie("userName"));
        $(".login-box .remeber").removeClass("checkbox-unselect").addClass("checkbox-select");
    } else {
        $(".login-box .remeber").removeClass("checkbox-select").addClass("checkbox-unselect");
    }
    indexFunc.showDialog = function () {
        if(getUser().data){
            var mobile = getUser().data.mobile;
            // var register = getUser().firstRegister;
            var register = _GET_DATA('firstRegister');
            if(register&&mobile){
                var isRegister = JSON.parse(register)
                if(isRegister.data == 'true'){
                    var z = '<h1><span class="welcome_you">欢迎你，</span>' + mobile + '</h1>' +
                        ' <p class="welcome_you1">恭喜您，已注册成功！请您尽快完善您所在公司的信息，如公司已入驻</p> ' +
                        ' <p class="welcome_you2">您可申请加入该公司，认证成功后您就可以发布和参与招标啦！</p> ' +
                        '<div class="welcome-btn clearfloat"> ' +
                        '<div class="welcome-btn-area left">' +
                        '<div class="describe company_in">所在公司已入驻</div>'+
                        '<a href="p_application.html" class="personal_apply_in" id="at_index_personal_apply_in" name="at_index_personal_apply_in">申请加入</a>'+
                        '</div>'+
                        '<div class="welcome-btn-area">' +
                        '<div class="describe company_out">所在公司未入驻</div>'+
                        '<a href="p_person_certification.html" class="company_apply_in" id="at_index_company_apply_in" name="at_index_company_apply_in">公司入驻</a>'+
                        '</div>'+
                        ' </div>'+
                        '<div class="go-home "><a href="p_bid_hall.html?petrolType=1" class="go_home closed" id="at_index_go_home" name="at_index_go_home">稍后认证，先逛逛</a></div>'

                    dialogOpt({
                        title: '通知',
                        class: 're-success',
                        content: z
                    });
                    $(".re-success .welcome_you").html(welcome_you);
                    $(".re-success .welcome_you1").html(welcome_you1);
                    $(".re-success .welcome_you2").html(welcome_you2);
                    $(".re-success .company_in").html(company_in);
                    $(".re-success .company_out").html(company_out);
                    $(".re-success .personal_apply_in").html(personal_apply_in);
                    $(".re-success .company_apply_in").html(company_apply_in);
                    $(".re-success .go_home").html(go_home);
                    $(".re-success .popupWrap .title").html(dialog_message);
                    // setUser({firstRegister:false});
                    _SET_DATA('firstRegister','false')
                }

            }
        }

    }
    indexFunc.popupDiscountCoupon =function ()  {
        /*如果登录,弹出优惠券*/
        if(user&&user.login&&user.data.couponFlag === 0){
            if(!_GET_DATA('couponFlag')){
                _SET_DATA('couponFlag','true')
//                $(".package-btn").click();
            }
        }
        // $('#couponsUse').unbind('click').bind('click',function (e) {
        //     interface.clickCoupon({},function (resp) {
        //         if(resp.code === 0){
        //             window.location.href = "p_coupons.html";
        //         }else{
        //             alertReturn(resp.exception);
        //         }
        //     },function (resp) {
        //         alertReturn(resp.exception);
        //     });
        // })
    }
    indexFunc.marketActiveDialog =function(){
        var expireTime = 60*60*24;
        var expireTimeStr = expireTime.toString();
        if(user&&user.login){

        }else{
            if(!_GET_DATA('firstOpen')){
                console.log()
                _SET_DATA('firstOpen','true',expireTimeStr+'s')
                $(".market_active").show();
            }
        }
    }
    indexFunc.marketActiveClose = function () {
        $('.active_close2').click(function () {
            $('.market_active').hide(); //关闭活动弹窗
        });
    }
    indexFunc.marketActiveShow = function () {
        $('#marketActiveShow').click(function () {
           window.location.href = "p_christmas.html";
        });
    }
    indexFunc.commonData = function () {
        interface.tradeData(function (resp) {
            if (resp.code == 0) {
                $('#gpc_total_voilum').html(gpc_total_voilum);
                $('#cpc_total_voilum').html(cpc_total_voilum);
                $('#calcinedCoke_amount').html(resp.data.calcinedOrderFinishQuantity||"0");
                $('#petrolCoke_amount').html(resp.data.orderFinishQuantity||"0" );
                $('.con_totalMoney  #petrol_totalMoney').html(total_trade_amount+' '+formatCurrency(resp.data.totalOrderFinishAmount||0)+yuan);
             } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /*登录部分*/
    indexFunc.loginModel = function () {
        $('.login-box .login').on('click', function () {
            var $this = $(this);
            if ($this.hasClass('not')) {
                return false;
            }
            var mobile = trim($('.login-box .mobile').val());
            var password = $('.login-box .password').val();
            if (mobile == '') {
                $('.login-box .mobile').addClass('red');
                $('.login-box .account .error').html('手机号不能为空');
                return false;
            }
            if (!matchMobile(mobile)) {
                $('.login-box .mobile').addClass('red');
                $('.login-box .account .error').html('手机号格式不正确');
                return false;
            }
            if (trim(password) == '') {
                $('.login-box .password').addClass('red');
                $('.login-box .passwd .error').html('密码不能为空');
                return false;
            }
            if (password.indexOf(" ") >= 0) {
                $('.login-box .password').addClass('red');
                $('.login-box .passwd .error').html('密码错误');
                return false;
            }
            $this.addClass('not');//接口完成以后移除not类才能再次点击
            $this.html('登录中...');
            interface.userLogin({
                userName: mobile,
                password: password
            }, function (resp) {
                $this.removeClass('not');
                if (resp.code == 0) {
                    if ($(".remeber").hasClass("checkbox-select")) {
                        $.cookie("userName", mobile, {expires: 7}); // 存储一个带7天期限的 cookie
                    }
                    else {
                        $.removeCookie("userName");
                    }
                    window.location.href = "/";
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                $this.removeClass('not');
                $this.html('登录');
                alertReturn(resp.exception);
            });
        })
        $(document).keyup(function (event) {//回车登录
            if (event.keyCode == 13) {
                if ($('.box .top .i-login').hasClass('active')) {
                    $('.login').click();
                }
            }
        });

        if (indexTab == 1) {//根据tab切换
            $('.i-login').click();
        }

        $('.s-index').on('click', function () {//右上角登录按钮
            $('.i-login').click();
        });
    }
    /*切换tab*/
    indexFunc.switchTab = function () {
        $(".top ul li").bind('click', function () {//切换tab
            var index = $(this).index();
            $(this).addClass('active').siblings('li').removeClass('active');
            $('.log-re').eq(index).show().siblings('.log-re').hide();
        });

        $('.log-re input').focus(function () {//框校验
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })

        $('.log-re .agree').click(function () {//框校验---复选框checkbox;
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })
    }

    /*是否选中checkbox*/
    indexFunc.switchCheckbox = function () {
        $(".remeber, .agree").on('click', function () {
            var $this = $(this);
            if ($this.hasClass("checkbox-select")) {
                $this.removeClass("checkbox-select").addClass("checkbox-unselect");
            } else {
                $this.removeClass("checkbox-unselect").addClass("checkbox-select");
            }
        })
    }

    //协议--弹框
    indexFunc.protocal = function () {
        $(".protocal").on('click', function () {
            var tpl = template("t:protocal", {});
            var d = dialogOpt({
                title: '焦易网协议',
                class: 'protocal-opt',
                content: tpl,
                closeClass: 'close',
                textCancel: '关闭'
            })
        })
    }

    /*注册部分*/
    indexFunc.registerModel = function () {
        $('.register-box .register').on('click', function () {
            var $this = $(this);
            if ($this.hasClass('not')) {
                return false;
            }
            var mobile = trim($('.register-box .mobile').val());
            var password = trim($('.register-box .password').val());
            var code = trim($('.register-box .code').val());
            var invitation = trim($('.register-box .invitation').val() || "");


            if (!mobile) {
                $('.register-box .mobile').addClass('red');
                $('.register-box .account .error').html('手机号不能为空');
                return false;
            }
            if (!matchMobile(mobile)) {
                $('.register-box .mobile').addClass('red');
                $('.register-box .account .error').html('手机号格式不正确');
                return false;
            }
            if (!code) {
                $('.register-box .code').addClass('red');
                $('.register-box .v-code .error').html('验证码不能为空');
                return false;
            }
            if (!password) {
                $('.register-box .password').addClass('red');
                $('.register-box .passwd .error').html('密码不能为空');
                return false;
            }

            if (!isPasswd(password)) {
                $('.register-box .password').addClass('red');
                $('.register-box .passwd .error').html('密码需包含字母、数字，且长度不小于6位');
                return false;
            }
            if(invitation!=""){
                var pattern =/^[A-Z0-9]{6}$/;
                if(!pattern.test(invitation)){
                    $('.register-box .invitation').addClass('red');
                    $('.register-box .content_invitation .error').html('邀请码包括大写字母和数字共6位');
                    return false;
                }
            }
            if (!$(".agree").hasClass("checkbox-select")) {
                $('.register-box .agreeProtocal').addClass('red');
                $('.register-box .agreeProtocal .error').html('请勾选协议');
                return false;
            }

            $this.addClass('not');//接口完成以后移除not类才能再次点击
            $this.html('注册中...');

            interface.userRegister({
                mobile: mobile,
                password: password,
                captcha: code,
                inviteCode:invitation
            }, function (res) {
                if (res.code == 0) {
                    _SET_DATA('firstRegister','true')
                    // window.location.href='p_bid_hall.html';
                    window.location.href = "/";
                    /**
                    var z = '<h1>欢迎你，' + mobile + '</h1>' +
                        ' <p>恭喜您，已注册成功！在这里偷偷告诉您，信息越完善您距离发布招标越近哦～ </p> ' +
                        '<div class="func-btn"> ' +
                        '<a class="finish" href="p_personal_info.html?register=1">完善我的信息</a>' +
                        ' <a class="go" href="p_bid_hall.html">先逛逛</a>' +
                        ' </div>'
                    **/
                    /**

                    var z = '<h1><span class="welcome_you">欢迎你，</span>' + mobile + '</h1>' +
                        ' <p class="welcome_you1">恭喜您，已注册成功！请您尽快完善您所在公司的信息，如公司已入驻</p> ' +
                        ' <p class="welcome_you2">您可申请加入该公司，认证成功后您就可以发布和参与招标啦！</p> ' +
                        '<div class="welcome-btn clearfloat"> ' +
                            '<div class="welcome-btn-area left">' +
                                '<div class="describe company_in">所在公司已入驻</div>'+
                                '<a href="p_application.html" class="personal_apply_in" id="at_index_personal_apply_in" name="at_index_personal_apply_in">申请加入</a>'+
                            '</div>'+
                            '<div class="welcome-btn-area">' +
                                '<div class="describe company_out">所在公司未入驻</div>'+
                                '<a href="p_person_certification.html" class="company_apply_in" id="at_index_company_apply_in" name="at_index_company_apply_in">公司入驻</a>'+
                            '</div>'+
                        ' </div>'+
                        '<div class="go-home"><a  class="go_home" href="p_bid_hall.html" id="at_index_go_home" name="at_index_go_home">稍后认证，先逛逛</a></div>'

                    dialogOpt({
                        title: '通知',
                        class: 're-success',
                        content: z
                    });
                    $(".re-success .welcome_you").html(welcome_you);
                    $(".re-success .welcome_you1").html(welcome_you1);
                    $(".re-success .welcome_you2").html(welcome_you2);
                    $(".re-success .company_in").html(company_in);
                    $(".re-success .company_out").html(company_out);
                    $(".re-success .personal_apply_in").html(personal_apply_in);
                    $(".re-success .company_apply_in").html(company_apply_in);
                    $(".re-success .go_home").html(go_home);
                    $(".re-success .popupWrap .title").html(dialog_message);
**/
                } else {
                    alertReturn(res.exception);
                }
                $this.removeClass('not');
                $this.html('注册');
            }, function (res) {
                $this.removeClass('not');
                $this.html('注册');
                alertReturn(res.exception);
            });
        })

        $('.s-register').on('click', function () {//右上角注册按钮
            $('.i-register').click();
        });

        if (indexTab == 2) {//根据tab切换
            $('.i-register').click();
        }

        $(document).keyup(function (event) {//回车登录
            if (event.keyCode == 13) {
                if ($('.box .top .i-register').hasClass('active')) {
                    $('.register').click();
                }
            }
        });
    }

    /*获取注册验证码*/
    indexFunc.getCode = function () {
        $(".send").on('click', function () {
            var $this = $(this);
            if ($this.hasClass('not')) {
                return false;
            }
            var mobile = trim($('.register-box .mobile').val());
            if (!mobile) {
                $('.register-box .mobile').addClass('red');
                $('.register-box .account .error').html('手机号不能为空');
                return false;
            }
            if (!matchMobile(mobile)) {
                $('.register-box .mobile').addClass('red');
                $('.register-box .account .error').html('手机号格式不正确');
                return false;
            }
            $this.addClass('not');
            interface.smsSendSms({
                mobile: mobile
            }, function (res) {
                if (res.code == 0) {
                    captcha(res.data.coolDown);
                } else {
                    alertReturn(res.exception);
                }
            }, function (res) {
                $this.removeClass('not');
                alertReturn(res.exception);
            });
        });

        var time;

        function captcha(coolDown) {
            time = coolDown;
            $(".send").html("重新发送(" + time + ")").addClass("color");
            lazy();
        }

        function lazy() {
            if (time >= 1) {
                $(".send").html("重新发送(" + time-- + ")");
                setTimeout(lazy, 1000);
            }
            else {
                $(".send").html("获取验证码").removeClass("color").removeClass('not');
            }
        }
    }

    //广告轮播图
    indexFunc.advertisement = function () {
        var advertisement = require('../js/component/advertisement/advertisement.js');
        $(".swiper-container").html(advertisement.render(1).el);
        advertisement.bindEvent();
    }

    var Market = '';
    var sign_in = '';
    var sign_up = '';
    var Account = '';
    var Pssword = '';
    var Forgot = '';

    var email_register = '';
    var welcome_you = '';
    var welcome_you1 = '';
    var welcome_you2 = '';
    var company_in = '';
    var company_out = '';
    var personal_apply_in = '';
    var company_apply_in = '';
    var company_apply_in = '';
    var go_home = '';
    var dialog_message = '';

    var send_again ='';


    var Keep_me = '';
    var index_Hours = '';
    var Phone_number = '';
    var index_SMS = '';
    var index_code = '';
    var index_agree = '';
    var index_advantages = '';
    var index_quality = '';
    var index_guarantee = '';
    var index_Authoritative = '';
    var index_detail1 = '';
    var index_detail2 = '';

    var index_Efficient = '';
    var index_Process = '';
    var index_online_trading = '';
    var index_detail3 = '';
    var index_detail4 = '';

    var index_High_Income = '';
    var index_industry = '';
    var index_Integration = '';
    var index_detail5 = '';
    var index_detail6 = '';

    var index_how_work = '';
    var index_step_Release = '';
    var index_step_seller = '';
    var index_step_Determine = '';
    var index_step_buyer = '';
    var index_step_Logistics = '';
    var index_step_Users = '';
    var gpc_total_voilum = ''; //石油焦总成交量／吨
    var cpc_total_voilum = ''; //煅后焦总成交量／吨
    var total_trade_amount = ''; //交易总金额
    var yuan = ''; //元单位

    jQuery.i18n.properties({
        name: 'messages',
        path: '../../plugin/i18n/',
        mode: 'both',
        language: getAcceptLanguage().substring(0, 2),
//          language:'en',
        callback: function () {
            Market = jQuery.i18n.prop('Market');
            sign_in = jQuery.i18n.prop('sign_in');
            sign_up = jQuery.i18n.prop('sign_up');
            Account = jQuery.i18n.prop('Account');
            Pssword = jQuery.i18n.prop('Pssword');
            Forgot = jQuery.i18n.prop('Forgot');
            email_register = jQuery.i18n.prop('email_register');
            welcome_you = jQuery.i18n.prop('welcome_you');
            welcome_you1 = jQuery.i18n.prop('welcome_you1');
            welcome_you2 = jQuery.i18n.prop('welcome_you2');
            company_in = jQuery.i18n.prop('company_in');
            company_out = jQuery.i18n.prop('company_out');
            personal_apply_in = jQuery.i18n.prop('personal_apply_in');
            company_apply_in = jQuery.i18n.prop('company_apply_in');
            go_home = jQuery.i18n.prop('go_home');
            dialog_message = jQuery.i18n.prop('dialog_message');
            Keep_me = jQuery.i18n.prop('Keep_me');
            index_Hours = jQuery.i18n.prop('index_Hours');
            Phone_number = jQuery.i18n.prop('Phone_number');
            index_SMS = jQuery.i18n.prop('index_SMS');
            index_code = jQuery.i18n.prop('index_code');
            index_agree = jQuery.i18n.prop('index_agree');
            index_advantages = jQuery.i18n.prop('index_advantages');
            index_quality = jQuery.i18n.prop('index_quality');
            index_guarantee = jQuery.i18n.prop('index_guarantee');
            index_Authoritative = jQuery.i18n.prop('index_Authoritative');
            index_detail1 = jQuery.i18n.prop('index_detail1');
            index_detail2 = jQuery.i18n.prop('index_detail2');

            index_Efficient = jQuery.i18n.prop('index_Efficient');
            index_Process = jQuery.i18n.prop('index_Process');
            index_online_trading = jQuery.i18n.prop('index_online_trading');
            index_detail3 = jQuery.i18n.prop('index_detail3');
            index_detail4 = jQuery.i18n.prop('index_detail4');

            index_High_Income = jQuery.i18n.prop('index_High_Income');
            index_industry = jQuery.i18n.prop('index_industry');
            index_Integration = jQuery.i18n.prop('index_Integration');
            index_detail5 = jQuery.i18n.prop('index_detail5');
            index_detail6 = jQuery.i18n.prop('index_detail6');

            index_how_work = jQuery.i18n.prop('index_how_work');

            index_step_Release = jQuery.i18n.prop('index_step_Release');
            index_step_seller = jQuery.i18n.prop('index_step_seller');
            index_step_Determine = jQuery.i18n.prop('index_step_Determine');
            index_step_buyer = jQuery.i18n.prop('index_step_buyer');
            index_step_Logistics = jQuery.i18n.prop('index_step_Logistics');
            index_step_Users = jQuery.i18n.prop('index_step_Users');
            gpc_total_voilum = jQuery.i18n.prop('gpc_total_voilum');
            cpc_total_voilum = jQuery.i18n.prop('cpc_total_voilum');
            total_trade_amount = jQuery.i18n.prop('total_trade_amount');
            yuan = jQuery.i18n.prop('yuan');
        }
    });
    if (getAcceptLanguage() == "en-US") {
        $(".header-bottom .text-box .title,.text-box-login .title,.register-box .v-code .send").css("letter-spacing", "0");
        $(".mod-explain-wrap .mod-explain p").remove();
        $(".mod-advantage-wrap .mod-advantage .item h3").css("font-size","13px");
        $(".mod-advantage-wrap .mod-advantage .item .con").css("white-space","inherit");
        $(".item-1,.item-2,.item-3").css('overflow','auto');
        $(".how_work p").remove();
    }

    $(".header-bottom .main p.title-market").html(Market);
    $(".header-bottom .box .i-login,button.login").html(sign_in);
    $(".header-bottom .box .i-register,button.register").html(sign_up);
    $(".header-bottom .login-box .account label").html(Account);
    $(".header-bottom .login-box .passwd label,.register-box .passwd label").html(Pssword);
    $(".header-bottom .login-box .forget a").html(Forgot);
    $(".header-bottom .email-register").html(email_register);

    $(".re-success .welcome_you").html(welcome_you);
    $(".re-success .welcome_you1").html(welcome_you1);
    $(".re-success .welcome_you2").html(welcome_you2);
    $(".re-success .company_in").html(company_in);
    $(".re-success .company_out").html(company_out);
    $(".re-success .personal_apply_in").html(personal_apply_in);
    $(".re-success .company_apply_in").html(company_apply_in);
    $(".re-success .go_home").html(go_home);
    $(".re-success .popupWrap .title").html(dialog_message);

    $(".header-bottom .login-box .forget .clearfloat span").html(Keep_me);
    $(".register-box .account label").html(Phone_number);
    $(".register-box .v-code label").html(index_SMS);
    $(".register-box .v-code .send").html(index_code);
    $(".register-box .agreeProtocal .protocal").html(index_agree);
    $(".mod-explain-wrap .mod-explain h1").html(index_advantages);
    $(".mod-advantage-wrap .mod-advantage .item1 h1,.mod-advantage-wrap .mod-advantage .item1 .title").html(index_quality);
    $(".mod-advantage-wrap .mod-advantage .item1 h3").html(index_guarantee);
    $(".mod-advantage-wrap .mod-advantage .item1 .con").html(index_Authoritative);
    $(".mod-advantage-wrap .mod-advantage .item1 .detail").eq(0).html(index_detail1);
    $(".mod-advantage-wrap .mod-advantage .item1 .detail").eq(1).html(index_detail2);

    $(".mod-advantage-wrap .mod-advantage .item2 h1,.mod-advantage-wrap .mod-advantage .item2 .title").html(index_Efficient);
    $(".mod-advantage-wrap .mod-advantage .item2 h3").html(index_Process);
    $(".mod-advantage-wrap .mod-advantage .item2 .con").html(index_online_trading);
    $(".mod-advantage-wrap .mod-advantage .item2 .detail").eq(0).html(index_detail3);
    $(".mod-advantage-wrap .mod-advantage .item2 .detail").eq(1).html(index_detail4);

    $(".mod-advantage-wrap .mod-advantage .item3 h1,.mod-advantage-wrap .mod-advantage .item3 .title").html(index_High_Income);
    $(".mod-advantage-wrap .mod-advantage .item3 h3").html(index_industry);
    $(".mod-advantage-wrap .mod-advantage .item3 .con").html(index_Integration);
    $(".mod-advantage-wrap .mod-advantage .item3 .detail").eq(0).html(index_detail5);
    $(".mod-advantage-wrap .mod-advantage .item3 .detail").eq(1).html(index_detail6);

    $(".how_work h1").html(index_how_work);

    $(".process .step-one h1").html(index_step_Release);
    $(".process .step-one p").html(index_step_seller);
    $(".process .step-two h1").html(index_step_Determine);
    $(".process .step-two p").html(index_step_buyer);
    $(".process .step-third h1").html(index_step_Logistics);
    $(".process .step-third p").html(index_step_Users);

//.market_active p

    indexFunc.activeSize = function () {
        var height = $(".market_active").height();
        var width = $(".market_active").width();
        $(".market_active p").css({
            "width":height + "px",
            "height":height + "px",
            "position": "fixed",
            "left": width/2+"px",
            "margin-left": -height/2+"px",
            "top": height/2+"px",
            "margin-top":-height/2+"px",
            "text-align": "center",
        });
        $(".market_active span a").css({
            "width":height/3,
            "margin-left": -height/6+"px",
            "bottom": height/4.7+"px",
        });
        $("tt").css({
            "width":height + "px",
            "height":height + "px",
            "position": "fixed",
            "left": width/2+"px",
            "margin-left": -height/2+"px",
            "top": height/2+"px",
            "margin-top":-height/2+"px",
            "text-align": "center",
        });

    }
    indexFunc.init();
});
