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
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var languagePackage = null;
    var forgetPwd = {};
    /*初始化*/
    forgetPwd.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.operation();
        this.validateTel();
        this.resetPwd();
        // this.resultPassword();
    }
    forgetPwd.renderBlock = function () {
        $("#forgetArea").html(template('t:forgetArea'));
        // this.validateTel();
    }
    forgetPwd.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_main_pageNational/p_main_page.json',function (resp) {
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
    forgetPwd.template = function () {
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

    }
    //校验手机
    forgetPwd.validateTel = function () {
        $(".send").on('click', function () {
            var $this = $(this);
            if($this.hasClass('not')){
                return false;
            }
            var mobile = $("#mobile").val();
            if (!mobile) {
                $('.mod-tel .mobileBox .error').html(languagePackage['手机号不能为空']);
                return false;
            }
            if (!matchMobile(mobile)) {
                $('.mod-tel .mobileBox .error').html(languagePackage['手机号格式不正确']);
                return false;
            }
            $this.addClass('not')
            interface.validateTel({
                "mobile": mobile
            }, function (resp) {
                if (resp.code == 0) {
                    captcha(resp.data.coolDown);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });

        var time;

        function captcha(coolDown) {
            time = coolDown;
            $(".send").html(languagePackage['重新发送']+"(" + time + ")").addClass("color");
            lazy();
        }

        function lazy() {
            if (time >= 1) {
                $(".send").html(languagePackage['重新发送']+"(" + time-- + ")");
                setTimeout(lazy, 1000);
            }
            else {
                $(".send").html(languagePackage['获取验证码']).removeClass("not");
            }
        }
    }
    forgetPwd.operation = function () {
        $(".next").on('click', function () {
            var mobile = $("#mobile").val();
            var captcha = $("#captcha").val();
            if (!mobile) {
                $('.mod-tel .mobileBox .error').html(languagePackage['手机号不能为空']);
                return false;
            }
            if (!matchMobile(mobile)) {
                $('.mod-tel .mobileBox .error').html(languagePackage['手机号格式不正确']);
                return false;
            }

            if (!captcha) {
                $('.mod-tel .captchaBox .error').html(languagePackage['验证码不能为空']);
                return false;
            }

            _SET_DATA('mobile', $("#mobile").val());
            _SET_DATA('captcha', $("#captcha").val());
            interface.resetCheck({
                mobile: mobile,
                captcha: captcha
            },function(resp){
                if(resp.code == 0){
                    $(".mod-tel").hide();
                    $(".mod-pwd").show();
                }else{
                    $('.mod-tel .captchaBox .error').html(resp.exception);
                    //alertReturn(resp.exception);
                }
            },function(resp){
                alertReturn(resp.exception);
            })
        });
        $('.forgetBox input').focus(function () {//框校验
            var $this = $(this);
            $this.siblings('.error').html('');
        })
    }
    //自动填充
    forgetPwd.resultPassword=function () {
        $("#newPwd").keyup(function () {
            $("#newPwd_repeat").val($(this).val());
        })
    }

    //重置密码
    forgetPwd.resetPwd = function () {
        $(".sure").on('click', function () {
            var mobile = _GET_DATA('mobile');
            var captcha = _GET_DATA('captcha');
            var newPwd = $("#newPwd").val();
            var newPwd_repeat = $("#newPwd_repeat").val();
            if (!newPwd) {
                $('.mod-pwd .newPwdBox .error').html(languagePackage['新密码不能为空']);
                return false;
            }
            if (!isPasswd(newPwd)) {
                $('.mod-pwd .newPwdBox .error').html(languagePackage['密码需包含字母、数字，且长度不小于6位']);
                return false;
            }
            if (!newPwd_repeat) {
                $('.mod-pwd .newPwd_repeatBox .error').html(languagePackage['重复新密码不能为空']);
                return false;
            }
            if (newPwd_repeat != newPwd) {
                $('.mod-pwd .newPwd_repeatBox .error').html(languagePackage['两次输入密码不一致']);
                return false;
            }
            interface.resetPwd({
                "captcha": captcha,
                "mobile": mobile,
                "newPassword": newPwd
            }, function (resp) {
                if (resp.code == 0) {
                    $(".mod-pwd").hide();
                    $(".mod-finish").show();
                    _DEL_DATA('mobile');
                    _DEL_DATA('captcha');
                    var timer = setInterval(function () {//重置密码成功，4s后跳转到登录页；
                        window.location.href = "/";
                    }, 4000);
                    timer;
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            })
        })
    }

    forgetPwd.init();
});
