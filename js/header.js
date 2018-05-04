/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    require("common");
    require("jqueryI18n");
    var logo_whitw = "../images/common/logo_head01.png";
    var logo_black = "../images/common/logo_head.png";
    if (isEnUS()) {
        var lang01 = "English";
        var lang02 = "中文";
        logo_whitw = "../images/common/logo-whitw-en.png";
        logo_black = "../images/common/logo-black-en.png";
    } else {
        var lang01 = "中文";
        var lang02 = "English";
        logo_whitw = "../images/common/logo_head01.png";
        logo_black = "../images/common/logo_head.png";
    }


    var homeIndex = '';
    var bidding_platform = '';
    var footer_home = '';
    var footer_about_us = '';
    var footer_memorabilia = '';
    var footer_contact = '';
    var footer_help = '';
    var footer_bid = '';
    var footer_privacy = '';
    var footer_feedbook = '';
    var sign_in = '';
    var sign_up = '';

    var at_header_p_personal_info = '';//个人面板
    var at_header_p_order = '';//我的订单
    var at_header_p_contract = '';//我的协议
    var at_header_p_my_publish_tender = '';//我发布的招标
    var at_header_p_my_participation_tender = '';//我参与的招标
    var at_header_login_out = '';//退出登录
    var at_header_publish_bid = '';//供应招标
    var at_header_release = '';//采购招标

    var head_title = getCurrentPage();
    jQuery.i18n.properties({
        name: 'messages',
        path: '../../plugin/i18n/',
        mode: 'both',
        language: getAcceptLanguage().substring(0, 2),
//          language:'en',
        callback: function () {
            homeIndex = jQuery.i18n.prop('home_index');
            bidding_platform1 = jQuery.i18n.prop('bidding_platform1');
            bidding_platform2 = jQuery.i18n.prop('bidding_platform2');
            bidding_platform3 = jQuery.i18n.prop('bidding_platform3');
            bidding_platform4 = jQuery.i18n.prop('bidding_platform4');
            footer_home = jQuery.i18n.prop('footer_home');
            footer_about_us = jQuery.i18n.prop('footer_about_us');
            footer_memorabilia =  jQuery.i18n.prop('footer_memorabilia');
            footer_contact = jQuery.i18n.prop('footer_contact');
            footer_help = jQuery.i18n.prop('footer_help');
            footer_bid = jQuery.i18n.prop('footer_bid');
            footer_privacy = jQuery.i18n.prop('footer_privacy');
            footer_feedbook = jQuery.i18n.prop('footer_feedbook');
            sign_in = jQuery.i18n.prop('sign_in');
            sign_up = jQuery.i18n.prop('sign_up');
            at_header_p_personal_info = jQuery.i18n.prop('at_header_p_personal_info');
            at_header_p_order = jQuery.i18n.prop('at_header_p_order');
            at_header_p_contract = jQuery.i18n.prop('at_header_p_contract');
            at_header_p_my_publish_tender = jQuery.i18n.prop('at_header_p_my_publish_tender');
            at_header_p_my_participation_tender = jQuery.i18n.prop('at_header_p_my_participation_tender');
            at_header_login_out = jQuery.i18n.prop('at_header_login_out');
            at_header_publish_bid = jQuery.i18n.prop('at_header_publish_bid');
            at_header_release = jQuery.i18n.prop('at_header_release');
            head_title = jQuery.i18n.prop(head_title);
            newMessageDialog =  jQuery.i18n.prop('newMessageDialog');
            orderCreated =  jQuery.i18n.prop('orderCreated');
            orderPay =  jQuery.i18n.prop('orderPay');
            orderDetail =  jQuery.i18n.prop('orderDetail');
            downloadAttachment =  jQuery.i18n.prop('downloadAttachment');
            agreementNotice =  jQuery.i18n.prop('agreementNotice');
            closeButton =  jQuery.i18n.prop('closeButton');
        }
    });

    /**
     * 是否是从ops跳过来的
     */
    var _accessToken = request('accessToken');
    if(_accessToken){
        setUser({login:true,data:{accessToken:_accessToken}},null,false);
    }

    function showHeader() {
        // 判断是否登录
        var user = getUser();
        var z = '';
        var loginHtml = '';
        if (window.location.pathname.indexOf('html') == -1 || window.location.pathname.indexOf('index.html') > -1) {//判断首页

        } else {
            loginHtml = '<li class="o-login"><a class="special sign_in  head-font" href="/?indexTab=1" id="at_header_sign_in" name="at_header_sign_in">' + sign_in + '</a></li>' +
                '<li class=""><a class="special style o-register"  href="/?indexTab=2" id="at_header_o-register" name="at_header_o-register">' + sign_up + '</a></li>';
        }


        if (user.login) {
            var userHtml = user.data.nickname ? user.data.nickname : user.data.mobile;
            z = '<div class="mod-header">' +
                '<div class="header-top clearfloat">' +
                '<a href="/" class="logo" id="at_header_log" name="at_header_log"><img src="' + logo_whitw + '" alt=""/></a>' +
                '<ul class="clearfloat">' +
                // '<li class="package-btn" id="at_header_package-btn" name="at_header_package-btn"><img src="../images/common/icon_package.png"></li>' +
                '<li class=""><a class="head-font" href="/" id="at_header_homeIndex" name="at_header_homeIndex">' + homeIndex + '</a></li>' +
//            '<li class=""><a href="/">网站首页</a></li>' +
                '<li class=""><a class="head-font hall" href="p_bid_hall.html?petrolType=1" id="at_header_bidding_platform1" name="at_header_bidding_platform1">' + bidding_platform1 + '</a></li>' +
                '<li class=""><a class="head-font hall" href="p_bid_hall.html?petrolType=2" id="at_header_bidding_platform2" name="at_header_bidding_platform2">' + bidding_platform2 + '</a></li>' +
                '<li class=""><a class="hall head-font"  href="p_bid_hall.html?petrolType=3" id="at_header_bidding_platform4" name="at_header_bidding_platform4">' + bidding_platform4 + '</a></li>' +
                '<li class=""><a class="head-font hall" href="p_integral_mall.html" id="at_header_bidding_platform3" name="at_header_bidding_platform3">' + bidding_platform3 + '</a></li>' +
                '<li class="remind o-login">' +
                '<a href="p_notice.html" id="at_header_p_notice" name="at_header_p_notice">' +
                '<div class="remind-png">' +
                '<i></i>' +
                '</div>' +
                '</a>' +
                '</li>' +
                '<li class="user">' +
                '<a class="head-font" href="p_personal_info.html" id="at_header_user_head-font" name="at_header_user_head-font">' +
                '<dl>' +
                '<dd><span>' + userHtml + '</span><label></label></dd>' +
                '</dl>' +
                '</a>' +
                '<div class="personal-menu" id="at_deader_personal-menu" name="at_deader_personal-menu">' +
                '<label></label>' +
                '<div class="list" id="at_deader_personal-menu_list" name="at_deader_personal-menu_list">' +
                '<div class="m-list">' +
                '<a href="p_personal_info.html" class="item" id="at_header_p_personal_info" name="at_header_p_personal_info">'+at_header_p_personal_info+'</a>' +
                '</div>' +
                '<div class="m-list">' +
                '<a href="p_order.html" class="item" id="at_header_p_order" name="at_header_p_order">'+at_header_p_order+'</a>' +
                '<a href="p_contract.html" class="item" id="at_header_p_contract" name="at_header_p_contract">'+at_header_p_contract+'</a>' +
                '</div>' +
                '<div class="m-list">' +
                '<a href="p_my_publish_tender.html" class="item" id="at_header_p_my_publish_tender" name="at_header_p_my_publish_tender">'+at_header_p_my_publish_tender+'</a>' +
                '<a href="p_my_participation_tender.html" class="item" id="at_header_p_my_participation_tender" name="at_header_p_my_participation_tender">'+at_header_p_my_participation_tender+'</a>' +
                '</div>' +
                '<div class="m-list">' +
                '<a class="item login-out" id="at_header_login-out" name="at_header_login-out">'+at_header_login_out+'</a>' +
                '<button class="publish-bid item" id="at_header_publish-bid" name="at_header_publish-bid">'+at_header_publish_bid+'</button>' +
                '<button class="release item" id="at_header_release" name="at_header_release">'+at_header_release+'</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                // 优惠券弹窗
                '<div class="package-coupons">' +
                '<p><tt><img src="../images/common/ad_coupons.png"></tt><a href="javascript:;" class="close2"><img src="../images/common/icon_close2.png" id="at_header_close2" name="at_header_close2"></a><span><a href="javascript:;" id="at_header_use" name="at_header_use"><img src="../images/common/icon_use.png" id="couponsUse"></a></span></p>' +
                '</div>'
            '</div>'
        } else {
            z = '<div class="mod-header">' +
                '<div class="header-top clearfloat">' +
                '<a href="/" class="logo" id="at_header_log" name="at_header_log"><img src="' + logo_whitw + '" alt=""/></a>' +
                '<ul class="clearfloat">' +
                // '<li class="package-btn" id="at_header_package-btn" name="at_header_package-btn"><img src="../images/common/icon_package.png"></li>' +
                '<li class=""><a class="head-font" href="/" id="at_header_head-font" name="at_header_head-font">' + homeIndex + '</a></li>' +
                '<li class=""><a class="hall head-font"  href="p_bid_hall.html?petrolType=1" id="at_header_bidding_platform1" name="at_header_bidding_platform1">' + bidding_platform1 + '</a></li>' +
                '<li class=""><a class="hall head-font"  href="p_bid_hall.html?petrolType=2" id="at_header_bidding_platform2" name="at_header_bidding_platform2">' + bidding_platform2 + '</a></li>' +
                '<li class=""><a class="hall head-font"  href="p_bid_hall.html?petrolType=3" id="at_header_bidding_platform4" name="at_header_bidding_platform4">' + bidding_platform4 + '</a></li>' +
                '<li class=""><a class="head-font hall" href="p_integral_mall.html" id="at_header_bidding_platform3" name="at_header_bidding_platform3">' + bidding_platform3 + '</a></li>' +
                '' + loginHtml + '' +
                '</ul>' +
                '</div>' +
                // 优惠券弹窗
                '<div class="package-coupons">' +
                '<p><tt><img src="../images/common/ad_coupons_unused.png"></tt><a href="javascript:;" class="close2"><img src="../images/common/icon_close2.png" id="at_header_close2" name="at_header_close2"></a><span><a href="javascript:;" id="user_login" name="user_login"><img src="../images/common/icon-login.png"></a></span></p>' +
                '</div>'
            '</div>'
        }

        $('#layout_header').html(z);
        //判断首页和竞价大厅
        if (!(window.location.pathname.indexOf('html') == -1 || window.location.pathname.indexOf('index.html') > -1  || window.location.pathname.indexOf('p_bid_hall') > -1)) {
            $("#layout_header").addClass("backColor");
            //$("#layout_header").css("background-color","#3b3a3f");
            $("#layout_header .header-top .logo img").attr("src", logo_black);
            $("#layout_header .header-top ul.clearfloat a .remind-png i").css("background", "url('../images/common/remind01.png') no-repeat center / 100% 100%");
            $("#layout_header .header-top ul.clearfloat a.head-font").css("color", "#333");
            $("#layout_header .header-top ul.clearfloat a").css("color", "#333");
            $("#layout_header .header-top ul.clearfloat .user a dl dd label").css("border-color", "#333 transparent");
        }
        couponsUseShow();
        //鼠标滚动后header背景变色
        window.onscroll = function () {
            //setTimeout(function () {
            toggleTopMenu();
            //}, 500);
        };
        function couponsUseShow() {
            $('#couponsUse').unbind('click').bind('click',function (e) {
                interface.clickCoupon({},function (resp) {
                    if(resp.code === 0){
                        window.location.href = "p_coupons.html";
                    }else{
                        alertReturn(resp.exception);
                    }
                },function (resp) {
                    alertReturn(resp.exception);
                });
            })
        }
        function toggleTopMenu() {
            if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
                $("#layout_header").addClass("backColor");
                $("#layout_header .header-top .logo img").attr("src", logo_black);
                $("#layout_header .header-top ul.clearfloat a .remind-png i").css("background", "url('../images/common/remind01.png') no-repeat center / 100% 100%");
                $("#layout_header .header-top ul.clearfloat a.head-font").css("color", "#333");
                $("#layout_header .header-top ul.clearfloat a.sign_in").css({
                    "color": "#333",
                    "border": "1px solid #363e47"
                });
                $("#layout_header .header-top ul.clearfloat a.style").css({
                    "background-color": "#363e47",
                    "border": "2px solid #333",
                    "color": "#fff"
                });
                $("#layout_header .header-top ul.clearfloat .user a dl dd label").css("border-color", "#333 transparent");
                //$("#layout_header .header-top ul.clearfloat a").css("color","#333");
            } else {
                if (window.location.pathname.indexOf('html') == -1 || window.location.pathname.indexOf('index.html') > -1 || window.location.pathname.indexOf('p_bid_hall') > -1) {
                    $("#layout_header").removeClass("backColor");
                    $("#layout_header .header-top .logo img").attr("src", logo_whitw);
                    $("#layout_header .header-top ul.clearfloat a .remind-png i").css("background", "url('../images/common/remind.png') no-repeat center / 100% 100%");
                    $("#layout_header .header-top ul.clearfloat a.head-font").css("color", "#fff");
                    $("#layout_header .header-top ul.clearfloat a.sign_in").css({
                        "color": "#fff",
                        "border": "1px solid #fff"
                    });
                    $("#layout_header .header-top ul.clearfloat a.style").css({
                        "color": "#5b8ed2",
                        "border": "2px solid #fff",
                        "background-color": "rgba(250, 250, 250, 1)"
                    });
                    $("#layout_header .header-top ul.clearfloat .user a dl dd label").css("border-color", "#fff transparent");

                }
            }
        }
        $('.package-btn').click(function () {
            $('.package-coupons').show();
        });
        $('.close2').click(function () {
            $('.package-coupons').hide(); //关闭优惠券弹窗
        });

        if (user.login) {//每10秒刷新一下通知接口
            heatBeat(newMessageDialog);
            var unreadNum;
            //var count1;  //判断通知消息
            var count2;  //认证成功后添加提醒

            function notice() {
                interface.noticeCount(function (resp) {
                    if (resp.code == 0) {
                        //count1 = 0;
                        //if (count1 == 0) {
                        if (unreadNum < resp.data.unread) {
                            //count1 = 1;
                            // alertReturn('您有新的通知');
                            alertReturn(newMessageDialog);
                        }
                        //}
                        unreadNum = resp.data.unread;

                        if (unreadNum != 0) {//判断通知消息为0时则不显示0...
                            var html = ' <div class="dot">' + unreadNum + '</div>';
                            $('.remind .remind-png :not(i)').remove();
                            $('.remind .remind-png').append(html);
                        }
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            }
             notice();
            //if (count1 == 0) {
            // var int = setInterval(notice, 10000);
            // }

            //认证成功后添加提醒
            function authentication() {
                interface.noticeList({
                    status: "1",
                    type: "11"
                }, function (resp) {
                    if (resp.code == 0) {
                        count2 = 0;
                        if (count2 == 0) {
                            var _content = resp.data.content;
                            if (_content.length > 0) {
                                count2 = 1;
                                //var _content = [{"id": 1}];
                                var _id = _content[0].id;
                                authenticationDialog(_id);
                            }
                        }
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            }

            authentication();

        } else {
            //如果没有注册,大礼包显示未注册,点击跳到注册页面
            $('#user_login').off('click').on('click', function (e) {
                $('.package-coupons').hide(); //关闭优惠券弹窗
                // window.location.href = "/";
                if ($('.sign_in').length) {
                    window.location.href = '/?indexTab=2';
                }
                $('.i-register').click();
            })
        }

        //认证成功后添加提醒弹框
        function authenticationDialog(_id) {
            //资质认证提示：恭喜，您公司认证成功，现在可以去发布招标啦~
            //员工认证提示：恭喜，您加入公司认证申请成功
            var content;
            if (getUser().data.role == 5 || getUser().data.role == 2) {
                content = '恭喜，您公司认证成功，现在可以去发布招标啦~';
            } else {
                content = '恭喜，您加入公司认证申请成功';
            }
            var d = dialogOpt({
                title: '通知',
                class: 'common-tips',
                content: content,
                textOkey: '关闭',
                textOkeyId: 'at_header_commonokid',
                closeId: 'at_header_commoncloseid',
                funcOkey: function () {
                    interface.updateRead({
                        id: _id
                    }, function (resp) {
                        if (resp.code == 0) {
                            d.remove();
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    });
                }
            });
        }


        $('.user,.user a,.personal-menu').unbind("mouseover").bind("mouseover", function () {
            $('.personal-menu').show();
        }).unbind("mouseout").bind("mouseout", function () {
            $('.personal-menu').hide();
        });

        //退出登录
        $('.login-out').on('click', function () {
            $(".login-out").addClass("login-false");
            interface.userLogout({}, function (res) {
                delUser();
                if(_GET_DATA('firstRegister')) _DEL_DATA('firstRegister');
                window.location.href = "/";
            }, function (res) {
                alertReturn(res.exception);
            });
        })


        $('.personal-menu .publish-bid').on('click', function () {
            var user = getUser().data;
            if(user.role == 3){
                alertReturn('您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。');
                return ;
            }
            if(user.role != 2 && user.role != 1){
                alertReturn('没有相关资质认证');
                return ;
            }
            if(user.role!=2){
                alertReturn('您不是管理员，没有权限发布招标');
                return ;
            }
            if (user.status == 3) {
                alertReturn('账号已被冻结');
                return ;
            }
            //公司是否已封停
            interface.companyDetail(function (resp) {
                if(resp.data.businessStatus == 2){
                    alertReturn('公司已封停，如有疑问请联系客服');
                    return ;
                }
                if (user.reputationValue < 0) {
                    //        alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
                    window.location.href = 'p_tender_invitation.html';
                } else {
                    window.location.href = 'p_tender_invitation.html';
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });



//            if (userInfo.role != 2) {
//                alertReturn('您还未进行资质认证');
//            } else {
//                if (userInfo.role) {
//                    if (userInfo.role == 1 || userInfo.role == 3) {
//                        alertReturn('您不是管理员，没有权限发布招标');
//                    } else if (userInfo.role == 4) {
//                        alertReturn('您的资质认证还没有通过');
//                    } else {
//                        if (userInfo.status == 3) {
//                            alertReturn('账号已被冻结');
//                        } else {
//                            if (userInfo.reputationValue < 0) {
////                                    alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
//                                window.location.href = 'p_tender_invitation.html';
//                            } else {
//                                window.location.href = 'p_tender_invitation.html';
//                            }
//                        }
//                    }
//                } else {
//                    alertReturn('您的资质认证还没有通过');
//                }
//            }
        })

        $('.personal-menu .release').on('click', function () {
            var user = getUser().data;
            if(user.role == 3){
                alertReturn('您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。');
                return ;
            }
            if(user.role != 2 && user.role != 1){
                alertReturn('没有相关资质认证');
                return ;
            }
            if(user.role!=2){
                alertReturn('您不是管理员，没有权限发布采购');
                return ;
            }
            if (user.status == 3) {
                alertReturn('账号已被冻结');
                return ;
            }
            //公司是否已封停
            interface.companyDetail(function (resp) {
                if(resp.data.businessStatus == 2){
                    alertReturn('公司已封停，如有疑问请联系客服');
                    return ;
                }
                if (user.reputationValue < 0) {
                    //        alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
                    window.location.href = 'p_release_purchase.html';
                } else {
                    window.location.href = 'p_release_purchase.html';
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
//            interface.currentUserInfo(function (resp) {
//                var userInfo = resp.data;
//                if (userInfo.role != 2) {
//                    alertReturn('您还未进行资质认证');
//                } else {
//                    if (userInfo.role) {
//                        if (userInfo.role == 1 || userInfo.role == 3) {
//                            alertReturn('您不是管理员，没有权限发布采购');
//                        } else if (userInfo.role == 4) {
//                            alertReturn('您的资质认证还没有通过');
//                        } else {
//                            if (userInfo.status == 3) {
//                                alertReturn('账号已被冻结');
//                            } else {
//                                if (userInfo.reputationValue < 0) {
////                                    alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
//                                    window.location.href = 'p_release_purchase.html';
//                                } else {
//                                    window.location.href = 'p_release_purchase.html';
//                                }
//                            }
//                        }
//                    } else {
//                        alertReturn('您的资质认证还没有通过');
//                    }
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            });
        });
        if (user.login){
            setUser();
        }


        //英文版去掉焦币商城
        if(isEnUS()){
            $("#at_header_bidding_platform3").remove();
        }
        // 根据中英文切换网页标题，head.title
        $('head title').html(head_title);
    }

    function showFooter() {
        if (isEnUS()) {
            var lang01 = "English";
            var lang02 = "中文";
        } else {
            var lang01 = "中文";
            var lang02 = "English";
        }

        var z = '<div class="footer-box">' +
            '<div class="footer-inline">' +
            '<img src="../images/common/logo.png" alt="">' +
            '</div>' +
            '<div class="footer-inline">' +
            '<ul class="clearfloat">' +
            '<li><a href="/" id="at_header_footer-box_footer_home" name="at_header_footer-box_footer_home">' + footer_home + '</a></li>' +
            '<li><a href="p_aboutUs.html" id="at_header_footer-box_p_aboutUs" name="at_header_footer-box_p_aboutUs" target="_blank">' + footer_about_us + '</a></li>' +
            // '<li><a href="p_memorabilia.html" id="at_header_footer-box_p_memorabilia" name="at_header_footer-box_p_memorabilia">' + footer_memorabilia + '</a></li>' +
            '<li><a href="p_memorabilia.html" id="at_header_footer-box_p_memorabilia" name="at_header_footer-box_p_memorabilia">大事记</a></li>' +
            '<li><a href="p_contactUs.html" id="at_header_footer-box_p_contactUs" name="at_header_footer-box_p_contactUs" target="_blank">' + footer_contact + '</a></li>' +
            '<li><a href="p_help_center.html?type=1" id="at_header_footer-box_p_help_center" name="at_header_footer-box_p_help_center" target="_blank">' + footer_help + '</a></li>' +
            '<li><a href="p_privacy.html" id="at_header_footer-box_p_privacy" name="at_header_footer-box_p_privacy" target="_blank">' + footer_privacy + '</a></li>' +
            '<li><a class="feedback" href="javascript:;" id="at_header_footer-box_feedback" name="at_header_footer-box_feedback" target="_blank">' + footer_feedbook + '</a></li>' +
            '<li><a href="p_bidding_rule.html" id="at_header_footer-box_p_bidding_rule" name="at_header_footer-box_p_bidding_rule" target="_blank">' + footer_bid + '</a></li>' +
            '</ul>' +
            '<p class="version">' +
            '@2017 版权所有 山东焦易网信息科技有限公司 鲁ICP备14014985号-2 服务热线：400-6688-709' +
            '</p>' +
            '</div>' +
            '<div class="footer-inline">' +
            '<div class="contact tc">' +
            '<div class="img-box wechat">' +
            '<div class="dropdown">' +
            '<img style="width: 190px;" src="../images/main/wechat.jpg" alt="微信公众号二维码">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="lang-select">' +
            '<div class="lang-zh">' +
            '<span class="current-lang">' + lang01 + '</span>' +
            '<i class="down"></i>' +
            '</div>' +
            '<div class="lang-list">' +
            '<a class="lang_btn" id="at_header_footer-box_lang_btn" name="at_header_footer-box_lang_btn">' + lang02 + '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="records-management">' +
            '<a href="p_recordsManagement.html" target="_blank" id="at_header_footer-box_p_recordsManagement" name="at_header_footer-box_p_recordsManagement"></a>' +
            '</div>';
        $('#layout_footer').html(z);
        selectZhOrEng();

        var html = '<p>很高兴您能够提出宝贵的意见，相关详情请描述清晰，以便我们能够尽快解决您的问题～ </p>' +
            '<textarea placeholder="在这里填写您的意见反馈..." maxlength="150" id="at_head_feedback_content" name="at_head_feedback_content"></textarea>'
        $('.feedback').on('click', function () {
            if(!getUser().login){
                alertReturn('请登录');
                return;
            }
            var d = dialogOpt({
                title: '意见反馈',
                class: 'feedback-cover',
                content: html,
                textOkey: '发送',
                textOkeyId: 'at_head_feedback_ok',
                textCancel: '取消',
                textCancelId: 'at_head_feedback_cancel',
                closeId: 'at_head_feedback_close',
                funcOkey: function () {
                    var content = trim($('.feedback-cover textarea').val());
                    if (!content) {
                        alertReturn('请填写反馈内容');
                        return false;
                    }
                    interface.feedBack({
                        content: content
                    }, function (resp) {
                        if (resp.code == 0) {
                            d.remove();
                            alertReturn('发送成功，感谢您的反馈~');
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            })
        })
    }

    function selectZhOrEng() {
        $('.lang-select .lang-list').unbind('click').bind('click', function () {
            var select01 = $(this).siblings(".lang-zh").find("span.current-lang").html();
            var select02 = $(this).find("a.lang_btn").html();
            $(this).siblings(".lang-zh").find("span.current-lang").html(select02);
            $(this).siblings(".lang-zh").find("i").removeClass("up");
            $(this).find("a.lang_btn").html(select01);
            $(this).hide();
            if (select02 == "English") {
                setAcceptLanguage("en-US");
            } else if (select02 == "中文") {
                setAcceptLanguage("zh-CN");
            }
            window.location.reload();
        });
        $('.lang-select .lang-zh').unbind('click').bind('click', function () {
            if ($('.lang-select i').hasClass("up")) {
                $('.lang-select i').removeClass("up");
                $('.lang-select .lang-list').hide();
            } else {
                $('.lang-select i').addClass("up");
                $('.lang-select .lang-list').show();
            }

        });
    }

    function serviceOnline() {
        var z = '<div class="customer-service" id="customer-service" name="customer-service">我的客服</div>';
        $('body').append(z);

        $('#customer-service').off('click').on('click', function () {
            $('.contact-pic').show();
            interface.commonData({
                type: 'CUSTOM_SERVICE_IMG'
            }, function (resp) {
                if (resp.code == 0) {
                    var picHtml = '<div class="contact-pic" id="contact-pic"><p><img src="' + resp.data + '"/><a href="javascript:;" class="close" id="contact-pic-close"></a></p></div>';
                    $('body').append(picHtml);
                    $('body').off('click').on('click', function () {
                        $('#contact-pic').remove();
                    });
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            })
        });
    }

    module.exports = {
        showHeader: showHeader,
        showFooter: showFooter,
        serviceOnline: serviceOnline
    };
});
