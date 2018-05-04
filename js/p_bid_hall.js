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
    var bootstrap = require("bootstrap");
    var global = require("global");
    var interfaces = require("interface");
    var paginations = require("pagination");
    var number = require("count");
    var header = require('header');
    var easing = require('easing');
    var exscroll = require('exscroll');
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    //区分是石油焦(petrocokeType=1)还是煅后焦(petrocokeType=2)
    var petrolType = Number(request('petrolType')) || 1;

    /**
     *初始化一些变量*
     */
    var user = getUser();//获取缓存登录
    var isFirstView = _GET_DATA('isFirstView')//是否首次访问
    var startPrice;//底价
    var o_startPrice;//当前出价
    var pagenum;
    if (request('pagenum')) {
        pagenum = request('pagenum');
    } else {
        pagenum = 1;
    }
    var queryType;
    if (request('queryType')) {
        queryType = request('queryType');
    } else {
        queryType = 1;
    }
    var type;//1供给标(供方发布),2需求标(需方发布) ,
    var type = request('type');//tab类型1：供应大厅；2：采购大厅
    var endTime;//倒计时结束时间
    var currentHour = new Date().getHours();//当前的小时
    var currentTime = new Date().getTime();//当前时间
    var languagePackage = null;
    var bidHallFunc = {};

    /**
     * 初始化倒计时所用变量*
     **/
    var endYear = new Date().getFullYear();
    var endMonth = new Date().getMonth() + 1;
    var endDay = new Date().getDate() + 1;
    var endHour;
    var endMinute;
    var stringTime;

    /**
     *初始化*
     **/
    bidHallFunc.init = function () {
        this.template();

        this.selectLanguage();
        this.setTitleAndMeta();
        this.showPetrocokeType();
        this.tipBox();
        this.funcBtn();//资质认证发布招标按钮
        this.selectOpt();//筛选条件
        this.tenderList();//招标列表
        this.bidTab();//供应大厅、采购大厅tab;
        this.initBidTab();
        this.hideCertify();
        this.cancelBidding();
        windowOnScroll(this.scrollEvent);
    }
    bidHallFunc.cancelBidding = function () {
        $('body').undelegate('click').delegate('.func-btn .btn-cancel', 'click', function () {
            var $this = $(this);
            var tenderId = $this.parents('.item').attr('data-tenderId');
            var d = dialogOpt({
                title: languagePackage['提示'],
                class: 'cancle-bid',
                content: '<p>' + languagePackage['确定要取消该招标吗'] + '？</p>',
                textOkey: languagePackage['确定'],
                textOkeyId: 'at_cancleTender_okid',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_cancleTender_cancelid',
                closeId: 'at_cancleTender_closeid',
                funcOkey: function () {
                    interface.cancleTender({
                        tenderId: tenderId
                    }, function (resp) {
                        if (resp.code == 0) {
                            alertReturn(languagePackage['取消成功']);
                            bidHallFunc.init();
                            d.remove();
                            setUser();
                        } else {
                            bidHallFunc.init();
                            d.remove();
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            })
        });
    }
    bidHallFunc.initBidTab = function () {
        if (type == 2) {//type1:代表供应大厅；2：代表采购大厅
            type = 2;
            $(".bid-tabBox").css("border-bottom", "3px solid #4CB050");
            $("ul.bid-tab li:eq(1)").css("color", "#4CB050").siblings().css("color", "#363636");
            $("ul.bid-tab li:eq(1) i").addClass("bid-green").parent().siblings().find('i').removeClass("bid-current");
            $('.mod-bid-list').eq(1).removeClass('hide').siblings('.mod-bid-list').addClass('hide');
            $("#particles-js").addClass("particles-bg");
        } else {
            type = 1;
            $(".bid-tabBox").css("border-bottom", "3px solid #5b8ed2");
            $("ul.bid-tab li:eq(0)").css("color", "#5b8ed2").siblings().css("color", "#363636");
            $("ul.bid-tab li:eq(0) i").addClass("bid-current").parent().siblings().find('i').removeClass("bid-green");
            $('.mod-bid-list').eq(0).removeClass('hide').siblings('.mod-bid-list').addClass('hide');
            $("#particles-js").removeClass("particles-bg");
        }
    }
    bidHallFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_interNational/p_bid_hall.json', function (resp) {
            if (resp) {
                for (var i = resp.length - 1; i >= 0; i--) {
                    var keys = _.keys(resp[i]);
                    if (language === keys[0]) {
                        languagePackage = resp[i][language];
                        break;
                    }
                }
            }
        })
    }
    bidHallFunc.setTitleAndMeta = function () {
        var keyWords = document.querySelectorAll('meta[name="keywords"]')[0],
            description = document.querySelectorAll('meta[name="description"]')[0];
        if (petrolType == 1) {
            $('head title').html(languagePackage['石油焦大厅-焦易网']);
            keyWords.setAttribute('content', '石油焦现货,石油焦报价,石油焦价格,石油焦供应商,石油焦价格,石油焦招标,石油焦行情,焦易网,焦易');
            description.setAttribute('content', '石油焦大厅提供最新石油焦招标资源，让石油焦交易更简单，更高效，更安全');
        } else if (petrolType == 2) {
            $('head title').html(languagePackage['煅后焦大厅-焦易网']);
            keyWords.setAttribute('content', '"煅后焦现货, 煅后焦报价, 煅后焦价格, 煅后焦供应商, 煅后焦价格, 煅后焦招标, 煅后焦行情,焦易网,焦易');
            description.setAttribute('content', '"煅后焦大厅提供最新煅后焦招标资源，找好焦，上焦易！');
        } else if (petrolType == 3) {
            $('head title').html(languagePackage['焦炭大厅-焦易网']);
            /*keyWords.setAttribute('content', '"煅后焦现货, 煅后焦报价, 煅后焦价格, 煅后焦供应商, 煅后焦价格, 煅后焦招标, 煅后焦行情,焦易网,焦易');
            description.setAttribute('content', '"煅后焦大厅提供最新煅后焦招标资源，找好焦，上焦易！');*/
        }
    }
    bidHallFunc.showPetrocokeType = function () {
        $("#petrocokeType").html(template('t:petrocokeType', {data: petrolType}));
        $("#ashOrDensityTitle").html(template('t:ashOrDensityTitle', {data: petrolType}));
        $("#hover-menu").html(template('t:hover-menu', {data: petrolType}));
        $("#func").html(template('t:func', {data: petrolType}));
        $("#bid-tab").html(template('t:bid-tab', {data: petrolType}));
        $("#top_search").html(template('t:top_search', {data: petrolType}));

    }
    bidHallFunc.tipBox = function () {
        if (user.login) {
            if (user.data.createTime == user.data.lastLogin && !isFirstView) {//判断是否是注册后第一次登陆且第一次访问竞价大厅...
                _SET_DATA('isFirstView', '1');

//                $('.package-coupons').show(); //显示优惠券弹窗
            }
        }
    }

    /**
     *累计交易金额等数据*
     **/
    bidHallFunc.commonData = function () {
        interface.tradeData(function (resp) {
            if (resp.code == 0) {
                $("#total_money").html(resp.data.totalOrderFinishAmount);
                $("#count-number").numberRock({
                    speed: 20,//
                    count: resp.data.totalOrderFindshCount
                })
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    bidHallFunc.dialogCertify = function (mobile) {
        var z = '<h1><span class="welcome_you">欢迎你，</span>' + mobile + '</h1>' +
            ' <p class="welcome_you1">恭喜您，已注册成功！请您尽快完善您所在公司的信息，如公司已入驻</p> ' +
            ' <p class="welcome_you2">您可申请加入该公司，认证成功后您就可以发布和参与招标啦！</p> ' +
            '<div class="welcome-btn clearfloat"> ' +
            '<div class="welcome-btn-area left">' +
            '<div class="describe company_in">所在公司已入驻</div>' +
            '<a href="p_application.html" class="personal_apply_in" id="at_index_personal_apply_in" name="at_index_personal_apply_in">申请加入</a>' +
            '</div>' +
            '<div class="welcome-btn-area">' +
            '<div class="describe company_out">所在公司未入驻</div>' +
            '<a href="p_person_certification.html" class="company_apply_in" id="at_index_company_apply_in" name="at_index_company_apply_in">公司入驻</a>' +
            '</div>' +
            ' </div>' +
            '<div class="go-home"><a  class="closed go_home" id="at_index_go_home" name="at_index_go_home">稍后认证，先逛逛</a></div>'

        dialogOpt({
            title: '通知',
            class: 're-success',
            content: z
        });
    }

    /**
     * 资质认证发布招标按钮
     **/
    bidHallFunc.funcBtn = function () {
        if (user && user.login) {
            $('.func .certify').off().on('click', function () {//资质验证按钮
                // var userInfo = getUser().data;


                interface.currentUserInfo(function (resp) {
                    var userInfo = resp.data;
                    //已冻结
                    if (userInfo.role == 0 && userInfo.status == 3) {
                        alertReturn('账号已被冻结');
                        return;
                    }
                    if (userInfo.role == 0) {
                        bidHallFunc.dialogCertify(userInfo.mobile);
                    } else if (userInfo.role == 5) {
                        window.location.href = 'p_person_certification.html';
                    } else {
                        window.location.href = 'p_application.html';
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            })

            //我要供应按钮
            $('.func .publish-bid').off().on('click', function () {
                var user = getUser().data;
                if (user.role == 3) {
                    alertReturn(languagePackage['您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。']);
                    return;
                }
                if (user.role != 2 && user.role != 1) {
                    alertReturn(languagePackage['没有相关资质认证']);
                    return;
                }
                if (user.role != 2) {
                    alertReturn(languagePackage['您不是管理员，没有权限发布招标']);
                    return;
                }
                if (user.status == 3) {
                    alertReturn(languagePackage['账号已被冻结']);
                    return;
                }
                //公司是否已封停
                interface.companyDetail(function (resp) {
                    if (resp.data.businessStatus == 2) {
                        alertReturn(languagePackage['公司已封停，如有疑问请联系客服']);
                        return;
                    }
                    if (user.reputationValue < 0) {
//                    alertReturn(languagePackage['抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看']);
                        window.location.href = 'p_tender_invitation.html?petrolType=' + petrolType;
                    } else {
                        window.location.href = 'p_tender_invitation.html?petrolType=' + petrolType;
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });

//                interface.currentUserInfo(function (resp) {
//                    var userInfo = resp.data;
//                    if (userInfo.role != 2) {
//                        alertReturn(languagePackage['您还未进行资质认证']);
//                    } else {
//                        if (userInfo.role) {
//                            if (userInfo.role == 1 || userInfo.role == 3) {
//                                alertReturn(languagePackage['您不是管理员，没有权限发布招标']);
//                            } else if (userInfo.role == 4) {
//                                alertReturn(languagePackage['您的资质认证还没有通过']);
//                            } else {
//                                if (userInfo.status == 3) {
//                                    alertReturn(languagePackage['账号已被冻结']);
//                                } else {
//                                    if (userInfo.reputationValue < 0) {
////                                        alertReturn(languagePackage['抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看']);
//                                        window.location.href = 'p_tender_invitation.html?petrolType='+petrolType;
//                                    } else {
//                                        window.location.href = 'p_tender_invitation.html?petrolType='+petrolType;
//                                    }
//                                }
//                            }
//                        } else {
//                            alertReturn(languagePackage['您的资质认证还没有通过']);
//                        }
//                    }
//                }, function (resp) {
//                    alertReturn(resp.exception);
//                });
            })

            //我要采购按钮
            $('.func .release').off().on('click', function () {
                var user = getUser().data;
                if (user.role == 3) {
                    alertReturn(languagePackage['您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。']);
                    return;
                }
                if (user.role != 2 && user.role != 1) {
                    alertReturn(languagePackage['没有相关资质认证']);
                    return;
                }
                if (user.role != 2) {
                    alertReturn(languagePackage['您不是管理员，没有权限发布采购']);
                    return;
                }
                if (user.status == 3) {
                    alertReturn(languagePackage['账号已被冻结']);
                    return;
                }
                //公司是否已封停
                interface.companyDetail(function (resp) {
                    if (resp.data.businessStatus == 2) {
                        alertReturn(languagePackage['公司已封停，如有疑问请联系客服']);
                        return;
                    }
                    if (user.reputationValue < 0) {
                        //        alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
                        window.location.href = 'p_release_purchase.html?petrolType=' + petrolType;
                    } else {
                        window.location.href = 'p_release_purchase.html?petrolType=' + petrolType;
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
//                interface.currentUserInfo(function (resp) {
//                    var userInfo = resp.data;
//                    if (userInfo.role != 2) {
//                        alertReturn(languagePackage['您还未进行资质认证']);
//                    } else {
//                        if (userInfo.role) {
//                            if (userInfo.role == 1 || userInfo.role == 3) {
//                                alertReturn(languagePackage['您不是管理员，没有权限发布采购']);
//                            } else if (userInfo.role == 4) {
//                                alertReturn(languagePackage['您的资质认证还没有通过']);
//                            } else {
//                                if (userInfo.status == 3) {
//                                    alertReturn(languagePackage['账号已被冻结']);
//                                } else {
//                                    if (userInfo.reputationValue < 0) {
////                                        alertReturn(languagePackage['抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看']);
//                                        window.location.href = 'p_release_purchase.html?petrolType='+petrolType;
//                                    } else {
//                                        window.location.href = 'p_release_purchase.html?petrolType='+petrolType;
//                                    }
//                                }
//                            }
//                        } else {
//                            alertReturn(languagePackage['您的资质认证还没有通过']);
//                        }
//                    }
//                }, function (resp) {
//                    alertReturn(resp.exception);
//                });
            })
        } else {
            $('.certify,.publish').off().on('click', function () {
                alertReturn(languagePackage['请登录']);
            })
        }
    }

    /**
     * 筛选条件*
     **/
    bidHallFunc.selectOpt = function () {
        //处理选择筛选--所有硫含量
        $(".menu-item.type li").off().on('click', function () {
            var $this = $(this);
            var index = $this.parents('.menu-item').index();
            $this.parents('.menu-item').hide();
            if ($this.text() == languagePackage['自定义含量']) {
                var suHtml = '<div class="con"><label>' + languagePackage['硫'] + '</label><input type="text"/>%</div>';
                var d = dialogOpt({
                    title: languagePackage['自定义含量'],
                    class: 'self-content',
                    content: suHtml,
                    textOkey: languagePackage['确定'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {

                        $this.addClass('active').siblings().removeClass('active');
                        var typeValue = languagePackage['硫'] + $('.con input').val() + '%';
                        $('.mod-tab-bid li:eq(0) span').html(typeValue);
                        $('.mod-tab-bid li:eq(0) span').attr('data-su', $('.con input').val());
                        $('.mod-tab-bid li:eq(0) span').removeAttr('data-maxSu').removeAttr('data-minSu');
                        bidHallFunc.tenderList(1);
                        d.remove();
                    }
                })

                //限制数字
                $('.con input').on('input', function () {
                    var $this = $(this);
                    if (!isInteger0($this.val())) {
                        $this.val('');
                    }
                    if ($this.val() > 6) {
                        $this.val($this.val().slice(0, 6));
                        return false;
                    }
                });

                //for ie  限制数字
                if (document.all) {
                    $('.con input').each(function () {//限制数字
                        var $this = $(this);
                        var inputVal = trim($this.val());
                        if (this.attachEvent) {
                            this.attachEvent('onpropertychange', function (e) {
                                if (e.propertyName != 'value') return;
                                if (!isInteger0(inputVal)) {
                                    $this.val('');
                                }
                                if (inputVal.length > 6) {
                                    $(this).val(inputVal.slice(0, 6));
                                    return false;
                                }
                            });
                        }
                    })
                }


                return false;
            } else {
                var typeValue = $this.html();
                var maxSu = $this.attr('data-maxSu');
                var minSu = $this.attr('data-minSu');
                $this.parents('.menu-item').hide();
                $this.addClass('active').siblings().removeClass('active');
                $('.mod-tab-bid li:eq(0) span').attr('data-maxSu', maxSu);
                $('.mod-tab-bid li:eq(0) span').attr('data-minSu', minSu);
                $('.mod-tab-bid li:eq(0) span').html(typeValue);
                $('.mod-tab-bid li:eq(0) span').removeAttr('data-su');
                bidHallFunc.tenderList(1);
            }
            windowOnScroll(bidHallFunc.scrollEvent);
        });

        //处理选择筛选--所有产地tab
        $(".menu-item.place li").off().on('click', function () {
            var $this = $(this);
            $this.parents('.menu-item').hide();
            var typeValue = $this.html();
            $this.parents('.menu-item').hide();
            $this.addClass('active').siblings().removeClass('active');


            var languagePackage_invert = _.invert(languagePackage);
            var placeObj = _.omit(languagePackage_invert, function (key, value, obj) {
                return value != typeValue;
            });
            $('.mod-tab-bid li:eq(3) span').html(typeValue);
            $('.mod-tab-bid li:eq(3) span').attr('data-value', placeObj[typeValue]);
            bidHallFunc.tenderList(1);
        });

        //处理选择筛选--所有灰分含量
        $(".menu-item.type-ash li").off().on('click', function () {
            var $this = $(this);
            $this.parents('.menu-item').hide();
            if ($this.text() == languagePackage['自定义含量']) {
                var suHtml = '<div class="con"><label>' + languagePackage['灰分'] + '</label><input type="text"/>%</div>';
                var d = dialogOpt({
                    title: languagePackage['自定义含量'],
                    class: 'self-content',
                    content: suHtml,
                    textOkey: languagePackage['确定'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {
                        $this.addClass('active').siblings().removeClass('active');
                        var typeValue = languagePackage['灰分'] + $('.con input').val() + '%';
                        $('.mod-tab-bid li:eq(1) span').html(typeValue);
                        $('.mod-tab-bid li:eq(1) span').attr('data-ash', $('.con input').val());
                        $('.mod-tab-bid li:eq(1) span').removeAttr('data-maxAsh').removeAttr('data-minAsh');
                        bidHallFunc.tenderList(1);
                        d.remove();
                    }
                })

                //限制数字
                $('.con input').on('input', function () {
                    var $this = $(this);
                    if (!isInteger0($this.val())) {
                        $this.val('');
                    }
                    if ($this.val() > 6) {
                        $this.val($this.val().slice(0, 6));
                        return false;
                    }

                });

                //for ie  限制数字
                if (document.all) {
                    $('.con input').each(function () {//限制数字
                        var $this = $(this);
                        var inputVal = trim($this.val());
                        if (this.attachEvent) {
                            this.attachEvent('onpropertychange', function (e) {
                                if (e.propertyName != 'value') return;
                                if (!isInteger0(inputVal)) {
                                    $this.val('');
                                }
                                if (inputVal.length > 6) {
                                    $(this).val(inputVal.slice(0, 6));
                                    return false;
                                }
                            });
                        }
                    })
                }

                return false;
            } else {
                var typeValue = $this.html();
                var maxAsh = $this.attr('data-maxAsh');
                var minAsh = $this.attr('data-minAsh');
                $this.parents('.menu-item').hide();
                $this.addClass('active').siblings().removeClass('active');
                $('.mod-tab-bid li:eq(1) span').attr('data-maxAsh', maxAsh);
                $('.mod-tab-bid li:eq(1) span').attr('data-minAsh', minAsh);
                $('.mod-tab-bid li:eq(1) span').html(typeValue);
                $('.mod-tab-bid li:eq(1) span').removeAttr('data-ash');
                bidHallFunc.tenderList(1);
            }
        });
        //处理选择筛选--所有真密度
        $(".menu-item.type-tensity li").off().on('click', function () {
            var $this = $(this);
            $this.parents('.menu-item').hide();
            if ($this.text() == languagePackage['自定义含量']) {
                var suHtml = '<div class="con"><label>' + languagePackage['真密度'] + '</label><input type="text"/>g/cm³</div>';
                var d = dialogOpt({
                    title: languagePackage['自定义含量'],
                    class: 'self-content',
                    content: suHtml,
                    textOkey: languagePackage['确定'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {
                        $this.addClass('active').siblings().removeClass('active');
                        var typeValue = languagePackage['真密度'] + $('.con input').val() + 'g/cm³';
                        $('.mod-tab-bid li:eq(1) span').html(typeValue);
                        $('.mod-tab-bid li:eq(1) span').attr('data-tensity', $('.con input').val());
                        $('.mod-tab-bid li:eq(1) span').removeAttr('data-maxTensity').removeAttr('data-minTensity');
                        bidHallFunc.tenderList(1);
                        d.remove();
                    }
                })
                return false;
            } else {
                var typeValue = $this.html();
                var maxTensity = $this.attr('data-maxTensity');
                var minTensity = $this.attr('data-minTensity');
                $this.parents('.menu-item').hide();
                $this.addClass('active').siblings().removeClass('active');
                $('.mod-tab-bid li:eq(1) span').attr('data-maxTensity', maxTensity);
                $('.mod-tab-bid li:eq(1) span').attr('data-minTensity', minTensity);
                $('.mod-tab-bid li:eq(1) span').html(typeValue);
                $('.mod-tab-bid li:eq(1) span').removeAttr('data-tensity');
                bidHallFunc.tenderList(1);
            }
        });

        //处理选择筛选--所有钒含量
        $(".menu-item.type-va li").off().on('click', function () {
            var $this = $(this);
            $this.parents('.menu-item').hide();
            if ($this.text() == languagePackage['自定义含量']) {
                var suHtml = '<div class="con"><label>' + languagePackage['钒'] + '</label><input type="text"/>ppm</div>';
                var d = dialogOpt({
                    title: languagePackage['自定义含量'],
                    class: 'self-content',
                    content: suHtml,
                    textOkey: languagePackage['确定'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {
                        $this.addClass('active').siblings().removeClass('active');
                        var typeValue = languagePackage['钒'] + $('.con input').val() + 'ppm';
                        $('.mod-tab-bid li:eq(2) span').html(typeValue);
                        $('.mod-tab-bid li:eq(2) span').attr('data-va', $('.con input').val());
                        $('.mod-tab-bid li:eq(2) span').removeAttr('data-maxVa').removeAttr('data-minVa');
                        bidHallFunc.tenderList(1);
                        d.remove();
                    }
                })

                //限制整数
                $('.con input').on('input', function () {
                    var $this = $(this);
                    var inputVal = trim($this.val());
                    if (!isInteger(inputVal)) {
                        $this.val('');
                    } else {
                        if (inputVal.indexOf('.') >= 0) {
                            $this.val(inputVal.substring(0, inputVal.indexOf('.')));
                        }
                        if ($this.val() > 6) {
                            $this.val($this.val().slice(0, 6));
                            return false;
                        }
                    }
                });

                //for ie  限制整数
                if (document.all) {
                    $('.con input').each(function () {//限制整数
                        var $this = $(this);
                        var inputVal = trim($this.val());
                        if (this.attachEvent) {
                            this.attachEvent('onpropertychange', function (e) {
                                if (e.propertyName != 'value') return;
                                if (!isInteger(inputVal)) {
                                    $this.val('');
                                } else {
                                    if (inputVal.indexOf('.') >= 0) {
                                        $this.val(inputVal.substring(0, inputVal.indexOf('.')));
                                    }
                                    if (inputVal.length > 6) {
                                        $(this).val(inputVal.slice(0, 6));
                                        return false;
                                    }
                                }
                            });
                        }
                    })
                }

                return false;
            }
            var typeValue = $this.html();
            var maxVa = $this.attr('data-maxVa');
            var minVa = $this.attr('data-minVa');
            $this.parents('.menu-item').hide();
            $this.addClass('active').siblings().removeClass('active');
            $('.mod-tab-bid li:eq(2) span').attr('data-maxVa', maxVa);
            $('.mod-tab-bid li:eq(2) span').attr('data-minVa', minVa);
            $('.mod-tab-bid li:eq(2) span').html(typeValue);
            $('.mod-tab-bid li:eq(2) span').removeAttr('data-va');
            bidHallFunc.tenderList(1);
        });

        //处理选择筛选--所有标签tab
        $(".menu-item.type-label li").off().on('click', function () {
            var $this = $(this);
            $this.parents('.menu-item').hide();
            var typeValue = $this.html();
            var typelabel = $this.attr('data-label');
            $this.parents('.menu-item').hide();
            $this.addClass('active').siblings().removeClass('active');

            $('.mod-tab-bid li:eq(4) span').html(typeValue);
            $('.mod-tab-bid li:eq(4) span').attr('data-value', typelabel);
            bidHallFunc.tenderList(1);
        });

        //处理选择筛选--其他筛选
        $(".mod-tab-bid .other").off().on('click', function () {
            var html = "";
            if (petrolType == 1) {
                html = '<h3>' + languagePackage['常规指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-com clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['水分'] + '</label><input class="water" type="text"/><span>%</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['粒度'] + '</label><input class="particle" type="text"/>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['挥发分'] + '</label><input class="volatiles" type="text"/><span>%</span>' +
                    '</li>' +
                    '</ul>' +
                    '<h3>' + languagePackage['微量元素指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item  select-item-par clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['钠'] + '</label><input class="na" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铝'] + '</label><input class="ai" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['钙'] + '</label><input class="ca" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>' +
                    '<ul class="' + languagePackage['css']['select-item'] + '  select-item select-item-par ' + languagePackage['css']['select-item'] + ' clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['硅'] + '</label><input class="si" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铁'] + '</label><input class="fe" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['磷'] + '</label><input class="ph" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>';
            } else if (petrolType == 2) {
                html = '<h3>' + languagePackage['常规指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-com clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['灰分'] + '</label><input class="ash" type="text"/><span>%</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['挥发分'] + '</label>' +
                    '<input class="volatiles" type="text"/><span>%</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['水分'] + '</label><input class="water" type="text"/><span>%</span>' +
                    '</li>' +
                    '</ul>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-com clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['粉末比电阻'] + '</label><input class="resistance" type="text"/><span>μΩm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['振实密度'] + '</label><input class="vibration" type="text"/><span>g/cm³</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['粒度'] + '</label><input class="particle" type="text"/><span>mm</span>' +
                    '</li>' +
                    '</ul>' +
                    '<h3>' + languagePackage['微量元素指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-par clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['钠'] + '</label><input class="na" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铝'] + '</label><input class="ai" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['钙'] + '</label><input class="ca" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-par clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['硅'] + '</label><input class="si" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铁'] + '</label><input class="fe" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['磷'] + '</label><input class="ph" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-par clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['铅'] + '</label><input class="pi" type="text"/><span>ppm</span>' +
                    '</li>' +
                    // '<li>' +
                    // '<label>钒</label><input class="va" type="text"/><span>ppm</span>' +
                    // '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['镍'] + '</label><input class="ni" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>';
            } else if (petrolType == 3) {
                html = '<h3>' + languagePackage['常规指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-com clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['水分'] + '</label><input class="water" type="text"/><span>%</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['焦末含量'] + '</label><input class="peacoke" type="text"/><span>%</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['挥发分'] + '</label><input class="volatiles" type="text"/><span>%</span>' +
                    '</li>' +
                    '</ul>' +
                    '<h3>' + languagePackage['微量元素指标'] + '</h3>' +
                    '<ul class="' + languagePackage['css']['select-item'] + ' select-item select-item-par clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['钠'] + '</label><input class="na" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铝'] + '</label><input class="ai" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['钙'] + '</label><input class="ca" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>' +
                    '<ul class="' + languagePackage['css']['select-item'] + '  select-item select-item-par' + languagePackage['css']['select-item'] + ' clearfloat">' +
                    '<li>' +
                    '<label>' + languagePackage['硅'] + '</label><input class="si" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['铁'] + '</label><input class="fe" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '<li>' +
                    '<label>' + languagePackage['磷'] + '</label><input class="ph" type="text"/><span>ppm</span>' +
                    '</li>' +
                    '</ul>';
            }
            var d = dialogOpt({
                title: languagePackage['其他筛选'],
                class: 'other-select',
                content: html,
                textOkey: languagePackage['确定'],
                textCancel: languagePackage['取消'],
                funcOkey: function () {
                    //新增字段
                    var ash = trim($('.select-item .ash').val() || "");//灰
                    var resistance = trim($('.select-item .resistance').val() || "");//粉末比电阻
                    var vibration = trim($('.select-item .vibration').val() || "");//振实密度
                    var volatiles = trim($('.select-item .volatiles').val() || "");//挥发分
                    var water = trim($('.select-item .water').val() || "");//水分
                    var particle = trim($('.select-item .particle').val() || "");//粒度
                    var peacoke = trim($('.select-item .peacoke').val() || "");//焦末含量
                    var na = trim($('.select-item .na').val() || "");//钠
                    var ai = trim($('.select-item .ai').val() || "");//铝
                    var ca = trim($('.select-item .ca').val() || "");//钙
                    var si = trim($('.select-item .si').val() || "");//硅
                    var fe = trim($('.select-item .fe').val() || "");//铁
                    var ph = trim($('.select-item .ph').val() || "");//磷
                    // var va = trim($('.select-item .va').val()||"");//钒
                    var ni = trim($('.select-item .ni').val() || "");//镍
                    var pi = trim($('.select-item .pi').val() || "");//铅
                    var ashHtml = ash ? languagePackage["灰分"] + '<span class="ash">' + ash + '</span>%、' : '';
                    var resistanceHtml = resistance ? languagePackage["粉末比电阻"] + '<span class="resistance">' + resistance + '</span>μΩm、' : '';
                    var vibrationHtml = vibration ? languagePackage["振实密度"] + '<span class="vibration">' + vibration + '</span>g/cm³、' : '';
                    var volatilesHtml = volatiles ? languagePackage["挥发分"] + '<span class="volatiles">' + volatiles + '</span>%、' : '';
                    var waterHtml = water ? languagePackage["水分"] + '<span class="water">' + water + '</span>%、' : '';
                    var particleHtml = particle ? languagePackage["粒度"] + '<span class="particle">' + particle + '</span>mm、' : '';
                    var naHtml = na ? languagePackage["钠"] + '<span class="na">' + na + '</span>ppm、' : '';
                    var aiHtml = ai ? languagePackage["铝"] + '<span class="ai">' + ai + '</span>ppm、' : '';
                    var caHtml = ca ? languagePackage["钙"] + '<span class="ca">' + ca + '</span>ppm、' : '';
                    var siHtml = si ? languagePackage["硅"] + '<span class="si">' + si + '</span>ppm、' : '';
                    var feHtml = fe ? languagePackage["铁"] + '<span class="fe">' + fe + '</span>ppm、' : '';
                    var pfHtml = ph ? languagePackage["磷"] + '<span class="ph">' + ph + '</span>ppm、' : '';
                    // var vaHtml = va ? '钒<span class="va">' + va + '</span>ppm、' : '';
                    var niHtml = ni ? languagePackage["镍"] + '<span class="ni">' + ni + '</span>ppm、' : '';
                    var piHtml = pi ? languagePackage["铅"] + '<span class="pi">' + pi + '</span>ppm、' : '';
                    var peacokeHtml = peacoke ? '焦末含量<span class="peacoke">' + peacoke + '</span>%、' : '';
                    if ($('.show-other').length > 0) {
                        $('.show-other').remove();
                    }
                    if (ash || resistance || vibration || volatiles || water || particle || na || ai || ca || si || fe || ph || ni || pi || peacoke) {
                        var changeHtml = '<div class="show-other">' +
                            '<p>' + languagePackage["其他筛选"] + '：' +
                            '' + ashHtml + '' +
                            '' + resistanceHtml + '' +
                            '' + vibrationHtml + '' +
                            '' + volatilesHtml + '' +
                            '' + waterHtml + '' +
                            '' + particleHtml + '' +
                            '' + naHtml + '' +
                            '' + aiHtml + '' +
                            '' + caHtml + '' +
                            '' + siHtml + '' +
                            '' + feHtml + '' +
                            '' + pfHtml + '' +
                            // '' + vaHtml + '' +
                            '' + niHtml + '' +
                            '' + piHtml + '' +
                            '' + peacokeHtml + '' +
                            '</p>' +
                            '<i class="close1"></i>' +
                            '</div>';
                        $('.bid-tabBox').after(changeHtml);
                        var str = $('.show-other p').html();
                        $('.show-other p').html(str.substring(0, str.lastIndexOf('、')));//去除最后一个、
                        $('.show-other .close1').off().on('click', function () {
                            $('.show-other').remove();
                            bidHallFunc.tenderList(1);
                        })
                    }
                    bidHallFunc.tenderList(1);
                    d.remove();
                }
            })

            //限制整数
            $('.select-item-par input').on('input', function () {
                var $this = $(this);
                var inputVal = trim($this.val());
                if (!isInteger(inputVal)) {
                    $this.val('');
                } else {
                    if (inputVal.indexOf('.') >= 0) {
                        $this.val(inputVal.substring(0, inputVal.indexOf('.')));
                    }

                    if ($this.val() > 6) {
                        $this.val($this.val().slice(0, 6));
                        return false;
                    }
                }
            });

            //for ie  限制整数
            if (document.all) {
                $('.select-item-par input').each(function () {//限制整数
                    var $this = $(this);
                    var inputVal = trim($this.val());
                    if (this.attachEvent) {
                        this.attachEvent('onpropertychange', function (e) {
                            if (e.propertyName != 'value') return;
                            if (!isInteger(inputVal)) {
                                $this.val('');
                            } else {
                                if (inputVal.indexOf('.') >= 0) {
                                    $this.val(inputVal.substring(0, inputVal.indexOf('.')));
                                }

                                if (inputVal.length > 6) {
                                    $(this).val(inputVal.slice(0, 6));
                                    return false;
                                }
                            }
                        });
                    }
                })
            }

            //限制2位小数
            $('.select-item-com input').on('input', function () {
                var $this = $(this);
                var inputVal = trim($this.val());
                if (!isInteger0(inputVal)) {
                    $this.val('');
                } else {
                    if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 2) {
                        $this.val(Math.floor(Number(inputVal) * 100) / 100);
                        return false;
                    }

                    if ($this.val() > 6) {
                        $this.val($this.val().slice(0, 6));
                        return false;
                    }
                }
            });

            //for ie  限制2位小数
            if (document.all) {
                $('.select-item-com input').each(function () {
                    var $this = $(this);
                    var inputVal = trim($this.val());
                    if (this.attachEvent) {
                        this.attachEvent('onpropertychange', function (e) {
                            if (e.propertyName != 'value') return;
                            if (!isInteger(inputVal)) {
                                $this.val('');
                            } else {
                                if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 2) {
                                    $this.val(Math.floor(Number(inputVal) * 100) / 100);
                                    return false;
                                }
                                if (inputVal.length > 6) {
                                    $(this).val(inputVal.slice(0, 6));
                                    return false;
                                }
                            }
                        });
                    }
                })
            }
        });

        //处理选择筛选--搜索回车搜索
        $(document).keyup(function (event) {//回车登录
            if (event.keyCode == 13) {
                bidHallFunc.tenderList(1);
            }
        });

        //处理选择筛选--我的筛选条件
        $('.bid-condition .item.select li').off().on('click', function () {
            var $this = $(this);
            //1全部招标,2我参与的招标,3我发布的招标,4历史招标
            queryType = $this.attr('data-type');
            //2我参与的招标,3我发布的招标，登陆验证
            if (queryType != 1 && queryType!= 4 && !user.login) {
                alertReturn(languagePackage['请登录']);
                return;
            }
            $('.bid-condition .item.select li').removeClass("active");
            $this.addClass("active");
            bidHallFunc.tenderList(1, queryType);
        })

        $(".mod-tab-bid li").hover(function () {
            $(this).find("i").removeClass("on").addClass("off");
        }, function () {
            $(this).find("i").removeClass("off").addClass("on");
        });

        $(".mod-tab-bid li.li").unbind("click").bind("click", function () {
            var $this = $(this);
            var index = $this.index();
            var isHide = $('.menu-item:eq(' + index + ')').attr("style");
            $('.menu-item').hide();
            if (isHide.indexOf("none") >= 0) {
                $('.menu-item:eq(' + index + ')').show();
            } else if (isHide.indexOf("block") >= 0) {
                $('.menu-item:eq(' + index + ')').hide();
            }
        });

        $(".mod-tab-bid li.li").click(function (event) {
            event.stopPropagation();
        });


        $(document).click(function () {
            $('.menu-item').hide();
        });

        //关注信息
        $('.type-focus').on('click', function () {
            if (user && user.login) {
                var d = dialogOpt({
                    title: languagePackage['关注'],
                    class: 'other-select',
                    content: '<div id="followMain"></div>',
                    textOkey: '+' + languagePackage['关注'],
                    textCancel: languagePackage['取消'],
                    isHide: true,
                    funcOkey: function () {

                        var ashMax = $('.ashList li.active').attr('data-maxash');
                        var ashMin = $('.ashList li.active').attr('data-minash');
                        var labels = $('.labelList li.active').attr('data-label');
                        var suMax = $('.suList li.active').attr('data-maxsu');
                        var suMin = $('.suList li.active').attr('data-minsu');
                        var userId = user.data.id;
                        var vaMin = $('.labelList li.active').attr('data-minva');
                        var vaMax = $('.labelList li.active').attr('data-maxva');
                        var productAreas = $('.placeList li.active').attr('data-value');
                        var densityMax = $('.densityList li.active').attr('data-maxtensity');
                        var densityMin = $('.densityList li.active').attr('data-mintensity');


                        interface.userFollowTarget({
                            ashMax:ashMax,
                            ashMin:ashMin,
                            label:labels,
                            petrolType:petrolType,
                            suMax:suMax,
                            suMin:suMin,
                            type:type,
                            userId:userId,
                            vaMin:vaMin,
                            vaMax:vaMax,
                            productArea:productAreas,
                            densityMax:densityMax,
                            densityMin:densityMin
                        },function (resp) {
                            d.remove();
                        },function (resp) {
                            alertReturn(resp.exception)
                        })

                    }
                })

                var maxSu = $('.mod-tab-bid .type span').attr('data-maxSu'),//硫含量终止值
                    minSu = $('.mod-tab-bid .type span').attr('data-minSu'),//硫含量起始值
                    su = $('.mod-tab-bid .type span').attr('data-su'),//硫含量值
                    maxDensity = $('.mod-tab-bid .type-tensity span').attr('data-maxtensity'),//真密度含量终止值
                    minDensity = $('.mod-tab-bid .type-tensity span').attr('data-mintensity'),//真密度含量起始值
                    density = $('.mod-tab-bid .type-tensity span').attr('data-tensity'),//真密度含量值
                    maxAsh = $('.mod-tab-bid .type-ash span').attr('data-maxAsh'),//灰分含量终止值
                    minAsh = $('.mod-tab-bid .type-ash span').attr('data-minAsh'),//灰分含量起始值
                    ash = $('.mod-tab-bid .type-ash span').attr('data-ash'),//灰分含量值
                    maxVa = $('.mod-tab-bid .type-va span').attr('data-maxVa'),//钒含量终止值
                    minVa = $('.mod-tab-bid .type-va span').attr('data-minVa'),//钒含量起始值
                    va = $('.mod-tab-bid .type-va span').attr('data-Va'),//钒含量值
                    label = $('.mod-tab-bid .type-label span').attr('data-value'),//标签值
                    productArea = $('.mod-tab-bid .place span').attr('data-value');;//产地名称

                var suValue;//硫
                if (maxSu == 1.0) {
                    suValue = 1;
                } else if (maxSu == 1.5 && minSu == 1) {
                    suValue = 2;
                } else if (maxSu == 2.0 && minSu == 1.5) {
                    suValue = 3;
                } else if (maxSu == 3.0 && minSu == 2.0) {
                    suValue = 4;
                } else if (maxSu == 4.0 && minSu == 3.0) {
                    suValue = 5;
                } else if (maxSu == 5.0 && minSu == 4.0) {
                    suValue = 6;
                } else if (minSu == 5.0) {
                    suValue = 7;
                } else if (su) {
                    suValue = 8;
                } else {
                    suValue = 9;
                }

                var densityValue;//真密度

                if (maxDensity == 2.00 && minDensity == 1.98) {
                    densityValue = 1;
                } else if (maxDensity == 2.03 && minDensity == 2.00) {
                    densityValue = 2;
                } else if (maxDensity == 2.06 && minDensity == 2.03) {
                    densityValue = 3;
                } else if (maxDensity == 2.08 && minDensity == 2.06) {
                    densityValue = 4;
                } else if (minDensity == 2.08) {
                    densityValue = 5;
                } else if (density) {
                    densityValue = 6;
                } else {
                    densityValue = 7;
                }

                var ashValue;//灰分

                if (maxAsh == 0.5) {
                    ashValue = 1;
                } else if (maxAsh == 1.0 && minAsh == 0.5) {
                    ashValue = 2;
                } else if (minAsh == 1.0) {
                    ashValue = 3;
                } else if (ash) {
                    ashValue = 4;
                } else {
                    ashValue = 5;
                }

                var vaValue;//钒
                if (maxVa == 100) {
                    vaValue = 1;
                } else if (maxVa == 150 && minVa == 100) {
                    vaValue = 2;
                } else if (maxVa == 250 && minVa == 150) {
                    vaValue = 3;
                } else if (maxVa == 350 && minVa == 250) {
                    vaValue = 4;
                } else if (maxVa == 450 && minVa == 350) {
                    vaValue = 5;
                } else if (maxVa == 500 && minVa == 450) {
                    vaValue = 6;
                } else if (minVa == 500) {
                    vaValue = 7;
                } else if (va) {
                    vaValue = 8;
                } else {
                    vaValue = 9;
                }

                $('#followMain').html(template('t:followMain', {
                    data: petrolType,
                    maxSu: maxSu,
                    minSu: minSu,
                    ash: ash,
                    ashValue: ashValue,
                    su: su,
                    density: density,
                    densityValue: densityValue,
                    suValue: suValue,
                    va: va,
                    vaValue: vaValue,
                    label: label,
                    productArea: productArea
                }))
                d.show(200);
                bidHallFunc.followEventType('su','硫');//关注弹框的硫绑定事件
                bidHallFunc.followEventType('density','真密度');//关注弹框的真密度绑定事件
                bidHallFunc.followEventType('ash','灰分');//关注弹框的灰分绑定事件
                bidHallFunc.followEventType('va','钒');//关注弹框的钒绑定事件
                bidHallFunc.followEventOpt();//关注弹框的产地、标签绑定事件
            } else {
                alertReturn(languagePackage['请登录']);
            }
        })
    }


    bidHallFunc.followEventType = function (ele,text) {
        $('.'+ele+'List li').on('click', function () {
            var That = $(this);

            if (That.hasClass('spe')) {

                var suHtml = '<div class="con"><label>' + languagePackage[text] + '</label><input type="text"/>%</div>';
                var d = dialogOpt({
                    title: languagePackage['自定义含量'],
                    class: 'self-content',
                    content: suHtml,
                    textOkey: languagePackage['确定'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {
                        var inputValue = $('.con input').val();
                        That.html('自定义' + languagePackage[text] + '=' + inputValue);
                        That.attr('data-minSu', inputValue);
                        That.attr('data-maxSu', inputValue);
                        That.addClass('active').siblings().removeClass('active');
                        d.remove();
                    }
                })

                //限制数字
                $('.con input').on('input', function () {
                    var $this = $(this);
                    if (!isInteger0($this.val())) {
                        $this.val('');
                    }
                    if ($this.val() > 6) {
                        $this.val($this.val().slice(0, 6));
                        return false;
                    }
                });

                //for ie  限制数字
                if (document.all) {
                    $('.con input').each(function () {//限制数字
                        var $this = $(this);
                        var inputVal = trim($this.val());
                        if (this.attachEvent) {
                            this.attachEvent('onpropertychange', function (e) {
                                if (e.propertyName != 'value') return;
                                if (!isInteger0(inputVal)) {
                                    $this.val('');
                                }
                                if (inputVal.length > 6) {
                                    $(this).val(inputVal.slice(0, 6));
                                    return false;
                                }
                            });
                        }
                    })
                }

                return false;
            } else {
                That.addClass('active').siblings().removeClass('active');
                That.siblings('.spe').html(languagePackage['自定义含量']);
            }
        })
    };


    bidHallFunc.followEventOpt = function () {
        $('.placeList li, .labelList li').on('click', function () {
            var That = $(this);
            That.addClass('active').siblings().removeClass('active');
        })
    };

    /**
     *招标列表*
     **/
    bidHallFunc.tenderList = function (page) {
        if (page) {
            pagenum = page;
        }
        var loading = "loading";
        // var petrolType = petrolType ;//：1石油焦，2煅后焦，3焦炭
        var maxDensity = $('.mod-tab-bid .type-tensity span').attr('data-maxtensity'),//真密度含量终止值
            minDensity = $('.mod-tab-bid .type-tensity span').attr('data-mintensity'),//真密度含量起始值
            density = $('.mod-tab-bid .type-tensity span').attr('data-tensity');//真密度含量值
        var maxAsh = $('.mod-tab-bid .type-ash span').attr('data-maxAsh'),//灰分含量终止值
            minAsh = $('.mod-tab-bid .type-ash span').attr('data-minAsh'),//灰分含量起始值
            ash = $('.mod-tab-bid .type-ash span').attr('data-ash'),//灰分含量值
            maxSu = $('.mod-tab-bid .type span').attr('data-maxSu'),//硫含量终止值
            minSu = $('.mod-tab-bid .type span').attr('data-minSu'),//硫含量起始值
            su = $('.mod-tab-bid .type span').attr('data-su'),//硫含量值
            maxVa = $('.mod-tab-bid .type-va span').attr('data-maxVa'),//钒含量终止值
            minVa = $('.mod-tab-bid .type-va span').attr('data-minVa'),//钒含量起始值
            va = $('.mod-tab-bid .type-va span').attr('data-Va'),//钒含量值
            label = $('.mod-tab-bid .type-label span').attr('data-value'),//标签值
            searchWord = $('.search input').val(),//关键字
            productArea = '';//产地名称
        if (petrolType == 2) {//煅后焦参数
            var ash = $('.show-other .ash').html();
            var ni = $('.show-other .ni').html();
            var va = $('.show-other .va').html();
        }
        if (petrolType == 3) {//焦炭参数
            var peacoke = $('.show-other .peacoke').html();//焦末含量
        }
        var volatiles = $('.show-other .volatiles').html();//挥发分
        var water = $('.show-other .water').html();//水分
        var particle = $('.show-other .particle').html();//粒度
        var na = $('.show-other .na').html();//钠
        var ai = $('.show-other .ai').html();//铝
        var ca = $('.show-other .ca').html();//钙
        var si = $('.show-other .si').html();//硅
        var fe = $('.show-other .fe').html();//铁
        var ph = $('.show-other .ph').html();//磷
        var pi = $('.show-other .pi').html();//铅
        var resistance = $('.show-other .resistance').html();//粉末比电阻
        var vibration = $('.show-other .vibration').html();//振实密度
        // if ($('.mod-tab-bid .place span').attr('data-value') == '所有产地' || $('.mod-tab-bid .place span').attr('data-value') == '无产地要求') {
        if ($('.mod-tab-bid .place span').attr('data-value') == '所有产地') {
            productArea = '';
        } else {
            productArea = $('.mod-tab-bid .place span').attr('data-value');
        }

        interface.bidList({
            petrolType: petrolType,
            minDensity: minDensity,
            maxDensity: maxDensity,
            density: density,
            maxAsh: maxAsh,
            maxSu: maxSu,
            minAsh: minAsh,
            minSu: minSu,
            maxVa: maxVa,
            minVa: minVa,
            label: label ? Number(label) : '',
            va: va,
            su: su,
            ash: ash,
            searchWord: searchWord,
            productArea: productArea,
            pageSize: 20,
            pageNum: pagenum,
            volatiles: volatiles,
            particle: particle,
            water: water,
            na: na,
            ai: ai,
            ca: ca,
            si: si,
            fe: fe,
            ph: ph,
            ni: ni,
            pi: pi,
            resistance: resistance,
            vibration: vibration,
            type: type,
            queryType: queryType,
            peacoke: peacoke
        }, function (resp) {
            if (resp.data.content.length > 0) {
                var _data = resp.data.content;
                //我发布的竞价中的招标
                var userData = [];
                if (user && user.login) {
                    for (var i = 0; i < _data.length; i++) {
                        if (_data[i].userId == user.data.id && _data[i].status == 2) {
                            userData.push(_data[i]);
                        }
                    }
                    //热门招标除去我发布的竞价中的招标
                    _data.splice(0, userData.length);
                }
                $("#j_tender_list" + type).html(template('t:j_tender_list', {
                    list: _data,
                    userList: user,
                    userData: userData
                }));

                $('#pagination' + type).pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 20, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: bidHallFunc.tenderList_pageCallback
                });
                if (resp.data.totalPages == 1) {
                    $('#pagination' + type).html('');
                    $('#pageNum' + type).val(1);
                }
                if (type == 1) {
                    $(".func-btn button").addClass("btn-blue");
                } else if (type == 2) {
                    $(".func-btn button").addClass("btn-green");
                }
                $('.bid-condition .item.select li').removeClass("active");
                if (queryType == 1) {
                    $('.bid-condition .item.select li').eq(0).addClass("active");
                } else if (queryType == 2) {
                    $('.bid-condition .item.select li').eq(1).addClass("active");
                    $(".bid-list h1.hot-title").html(languagePackage['我参与的招标']);
                } else if (queryType == 3) {
                    $('.bid-condition .item.select li').eq(2).addClass("active");
                    if (userData.length > 0) {
                        $(".bid-list h1.hot-title").html("");
                    } else {
                        $(".bid-list h1.hot-title").html(languagePackage['我发布的招标']);
                    }
                } else if (queryType == 4) {
                    $('.bid-condition .item.select li').eq(4).addClass("active");
                    $(".bid-list h1.hot-title").html(languagePackage['历史招标']);
                }else{
                    $('.bid-condition .item.select li').eq(3).addClass("active");
                    $(".bid-list h1.hot-title").html(languagePackage['我关注的招标']);
                }

                bidHallFunc.dealwithImg();
                bidHallFunc.tenderListOptBtn();
                bidHallFunc.showCountDown();
                bidHallFunc.bindFollow();
            } else {
                $("#j_tender_list" + type).html('<div class="no-data">' + languagePackage['没有相关招标信息'] + '</div>');
                $('#pagination' + type).html('');
                $('#pageNum' + type).val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading)
    }

    bidHallFunc.tenderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        bidHallFunc.tenderList(page_id + 1);
    }

    bidHallFunc.bidTab = function () {
        $("ul.bid-tab li").click(function () {//点击tab更改地址栏参数1代表供应大厅；2代表采购大厅
            var _this = $(this);
            var index = _this.index();
            switch (index) {
                case 0:
                    type = 1;
                    // 更改地址栏参数
                    var param = "?type=" + 1 + "&petrolType=" + petrolType;
                    window.history.pushState(null, null, param);  // 改变地址栏的参数
                    $(".bid-tabBox").css("border-bottom", "3px solid #5b8ed2");
                    _this.css("color", "#5b8ed2").siblings().css("color", "#363636");
                    _this.find("i").addClass("bid-current").parent().siblings().find('i').removeClass("bid-green");
                    $('.mod-bid-list').eq(0).removeClass('hide').siblings('.mod-bid-list').addClass('hide');
                    //bidHallFunc.resetSelest();
                    $("#particles-js").removeClass("particles-bg");
                    break;
                case 1:
                    type = 2;
                    // 更改地址栏参数
                    var param = "?type=" + 2 + "&petrolType=" + petrolType;
                    window.history.pushState(null, null, param);  // 改变地址栏的参数
                    $(".bid-tabBox").css("border-bottom", "3px solid #4CB050");
                    _this.css("color", "#4CB050").siblings().css("color", "#363636");
                    _this.find("i").addClass("bid-green").parent().siblings().find('i').removeClass("bid-current");
                    $('.mod-bid-list').eq(1).removeClass('hide').siblings('.mod-bid-list').addClass('hide');
                    //bidHallFunc.resetSelest();
                    $("#particles-js").addClass("particles-bg");
                    break;
            }
            bidHallFunc.tenderList(1);
        })
    }

    /**
     *列表操作按钮*
     **/
    bidHallFunc.tenderListOptBtn = function () {
        $('.btn-take.btn-primary').off().on('click', function () {//参与
            if (user.login) {
                var $this = $(this),
                    tenderId = $this.parents('.item').attr('data-tenderId');
                interface.currentUserInfo(function (resp) {
                    var userInfo = resp.data;
                    if (userInfo.role == 3) {
                        alertReturn(languagePackage['您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。']);
                        return;
                    }
                    if (userInfo.role == 1 || userInfo.role == 2) {
                        alertReturn(languagePackage['没有进行相关资质认证']);
                        return;
                    }
                    $this.off('click');
                    interface.participation(
                        {id: tenderId},
                        function (resp) {
                            if (resp.code == 0) {
                                $this.parents('.con').siblings('.bid-label').html('已参与');
                                //$this.removeClass('btn-primary').addClass('btn-inverse');
                                $this.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        },
                        function (resp) {
                            alertReturn(resp.exception);
                        }
                    );
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            } else {
                alertReturn(languagePackage['请登录']);
            }
        })

        $('.btn-sign').off().on('click', function () {//去签协议
            window.open('p_contract.html?tab=1');
        })

        //出价
        $('.btn-offer').unbind('click').bind('click', function () {
            if (!user.login) {
                alertReturn(languagePackage['请登录']);
                return;
            }
            var $this = $(this);
            var tenderId = $this.parents('.item').attr('data-tenderId');
            var userInfo = getUser().data;
            if (userInfo.role == 3) {
                alertReturn(languagePackage['您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。']);
                return;
            }
            if (userInfo.role != 1 && userInfo.role != 2) {
                alertReturn(languagePackage['没有进行相关资质认证']);
                return;
            }
            var minBuyQuantity = Number(commonData('MIN_BUY_QUANTITY'));//最小申买量
            //出价验证
            interface.bidTenderValite({tenderId: tenderId}, function (resp) {
                interface.tenderDetail({id: tenderId}, function (resp) {
                    //var btnStatus = 0;//按钮状态0：可以点击；1：不可以点击
                    startPrice = resp.data.reservePrice;
                    var successBuyQuantity = resp.data.successBuyQuantity ? f_double(resp.data.successBuyQuantity) : '0.00';//中标量、
                    var buyQuantity = resp.data.buyQuantity ? f_double(resp.data.buyQuantity) : '0.00';//申买量
                    var currentBuyPrice = resp.data.buyPrice ? f_double(resp.data.buyPrice) : '0';//当前出价
                    o_startPrice = resp.data.startPrice;//起投价格
                    var buyAmountHtml;//申买数量
                    if (resp.data.buyQuantity) {
                        buyAmountHtml = '<input class="buy-amount" type="text" value="' + resp.data.buyQuantity + '" id="at_bid_hall_buy-amount" name="at_bid_hall_buy-amount"/>';
                    } else {
                        buyAmountHtml = '<input class="buy-amount" type="text" id="at_bid_hall_buy-amount" name="at_bid_hall_buy-amount"/>'
                    }
                    var competeBuyHtml;
                    if (resp.data.type == 1) {
                        competeBuyHtml = '<input type="text" value="0" id="num" disabled/>';
                    } else {
                        competeBuyHtml = '<input type="text" value="0" id="num" disabled/>';
                    }
                    var operationHtml;//加减符号type:1为加号；type=2为减号
                    if (type == 1) {
                        operationHtml = '+';
                    } else if (type == 2) {
                        operationHtml = '-';
                    }
                    if (type == 1) {
                        var typeName = resp.data.type == 1 ? languagePackage['供应商'] : languagePackage['采购方'];
                        var reputationClass;
                        if (resp.data.reputationValue <= 0) {
                            reputationClass = 1;
                        } else if (resp.data.reputationValue > 0 && resp.data.reputationValue <= 150) {
                            reputationClass = 2;
                        } else if (resp.data.reputationValue > 150 && resp.data.reputationValue <= 300) {
                            reputationClass = 3;
                        } else if (resp.data.reputationValue > 300) {
                            reputationClass = 4;
                        }
                        var content = '<div class="left-time">' +
                            '<div class="bidding">' + languagePackage['竞价中'] + '</div>' +
                            '<div class="w-time">' +
                            '<p class="j-endtime">' + resp.data.endTime + '</p>' +
                            '<i class="clock"></i>' +
                            '</div>' +
                            '<div class="w-supplier fl-none">' +
                            '<p><tt>' + typeName + '：</tt><em class="em-12">' + resp.data.companyName + '</em><span class="s-credibility-' + reputationClass + '"></span></p>' +
                            '<div class="w-credibility" style="right: 0; left: auto;">' +
                            '<h4>' + resp.data.companyName + '</h4>' +
                            '<h5><tt>' + returnZhengshu(resp.data.star) + '</tt><i>' + resp.data.orderSuccessCount + languagePackage['单'] + '</i></h5>' +
                            '<dl>' +
                            '<dt class="w-credibility-' + reputationClass + '"></dt>' +
                            '<dd>' + languagePackage['信誉值'] + '：' + resp.data.reputationValue + '</dd>' +
                            '</dl>' +
                            '</div>' +
                            '</div>' +
                            '<a class="enter-bidding-rule" href="javascript:;" id="at_bid_hall_br" name="at_bid_hall_br">' + languagePackage['竞价规则'] + '</a>' +
                            '</div>' +
                            '<div class="bid-top clearfloat">' +
                            '<h1 class="fts-14">' + resp.data.title + '</h1>' +
                            '<div class="place-water">' +
                            '<div class="place"><label>' + languagePackage['产地'] + '：</label>' + languagePackage[resp.data.productArea] + '</div>' +
                            '<div><label>' + languagePackage['扣水量'] + '：</label>' + resp.data.buckleWaterRate + '</div>' +
                            '</div>' +
                            '<div class="start-time"><p><label>' + languagePackage['出厂底价'] + ' </label>￥<span class="color-42">' + resp.data.reservePrice + '</span>' + languagePackage['元/吨'] + ' </p></div>' +
                            '<div class="a-amount">' +
                            '<p><label>' + languagePackage['竞买量'] + ' </label>' + resp.data.totalQuantity + languagePackage['吨'] + '</p>' +
                            '<p><label>' + languagePackage['申买量'] + ' </label>' + resp.data.totalBuyQuantity + languagePackage['吨'] + '</p>' +
                            '<p><label>' + languagePackage['起订量'] + ' </label>' + minBuyQuantity + languagePackage['吨'] + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div class="bid-bottom clearfloat">' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的出价'] + '：</label><span class="color-42">' + currentBuyPrice + '</span>' + languagePackage['元/吨'] + '</div>' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的申买量'] + '：</label><span class="color-42">' + buyQuantity + '</span>' + languagePackage['元/吨'] + '</div>' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的中标量'] + '：</label><span class="color-42">' + successBuyQuantity + '</span>' + languagePackage['吨'] + '</div>' +
                            '<div class="even clearfloat"><label>' + languagePackage['申买量'] + '：</label>' + buyAmountHtml + '</div>' +
                            '<div class="even clearfloat">' +
                            '<label class="vm">' + languagePackage['竞买出价'] + '：</label>' +
                            '<div class="num_add_reduce clearfloat">' +
                            '<span class="start-price">' + o_startPrice + languagePackage['元/吨'] + '<span>' + operationHtml + '</span></span>' +
                            '<div class="reduce" id="at_bid_hall_reduce" name="at_bid_hall_reduce"></div>' +
                            '<div class="num_inp">' + competeBuyHtml + '</div>' +
                            '<div class="add" id="at_bid_hall_add" name="at_bid_hall_add"></div>' +
                            '</div>' +
                            '<div class="m-criticalPrice"><label>' + languagePackage['当前中标底价'] + '：</label>' + resp.data.criticalPrice + languagePackage['元/吨'] + '</div>' +
                            '</div>' +
                            '<div class="even clearfloat"><label>' + languagePackage['总共出价'] + '：</label><span class="total-amount">' + (resp.data.buyPrice ? (Number(o_startPrice) * Number(resp.data.buyQuantity)) : 0) + '</span>' + languagePackage['元'] + '</div>' +
                            '</div>';
                    } else {
                        var typeName = resp.data.type == 1 ? languagePackage['供应商'] : languagePackage['采购方'];
                        var reputationClass;
                        if (resp.data.reputationValue <= 0) {
                            reputationClass = 1;
                        } else if (resp.data.reputationValue > 0 && resp.data.reputationValue <= 150) {
                            reputationClass = 2;
                        } else if (resp.data.reputationValue > 150 && resp.data.reputationValue <= 300) {
                            reputationClass = 3;
                        } else if (resp.data.reputationValue > 300) {
                            reputationClass = 4;
                        }
                        var content = '<div class="left-time">' +
                            '<div class="bidding">' + languagePackage['竞价中'] + '</div>' +
                            '<div class="w-time">' +
                            '<p class="j-endtime">' + resp.data.endTime + '</p>' +
                            '<i class="clock"></i>' +
                            '</div>' +
                            '<div class="w-supplier fl-none">' +
                            '<p><tt>' + typeName + '：</tt><em class="em-12">' + resp.data.companyName + '</em><span class="s-credibility-' + reputationClass + '"></span></p>' +
                            '<div class="w-credibility" style="right: 0; left: auto;">' +
                            '<h4>' + resp.data.companyName + '</h4>' +
                            '<h5><tt>' + returnZhengshu(resp.data.star) + '</tt><i>' + resp.data.orderSuccessCount + languagePackage['单'] + '</i></h5>' +
                            '<dl>' +
                            '<dt class="w-credibility-' + reputationClass + '"></dt>' +
                            '<dd>' + languagePackage['信誉值'] + '：' + resp.data.reputationValue + '</dd>' +
                            '</dl>' +
                            '</div>' +
                            '</div>' +
                            '<a class="enter-bidding-rule" href="javascript:;">' + languagePackage['竞价规则'] + '</a>' +
                            '</div>' +
                            '<div class="bid-top clearfloat">' +
                            '<h1 class="fts-14">' + resp.data.title + '</h1>' +
                            '<div class="place-water">' +
                            '<div class="place"><label>' + languagePackage['产地'] + '：</label>' + languagePackage[resp.data.productArea] + '</div>' +
                            '<div><label>' + languagePackage['扣水量'] + '：</label>' + resp.data.buckleWaterRate + '%</div>' +
                            '</div>' +
                            '<div class="start-time"><p><label>' + languagePackage['出厂底价'] + ' </label>￥<span class="color-42">' + resp.data.reservePrice + '</span> ' + languagePackage['元/吨'] + '</p></div>' +
                            '<div class="a-amount">' +
                            '<p><label>' + languagePackage['采购量'] + ' </label>' + resp.data.totalQuantity + languagePackage['吨'] + '</p>' +
                            '<p><label>' + languagePackage['供应量'] + ' </label>' + resp.data.totalBuyQuantity + languagePackage['吨'] + '</p>' +
                            '<p><label>' + languagePackage['起订量'] + ' </label>' + minBuyQuantity + languagePackage['吨'] + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div class="bid-bottom clearfloat">' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的出价'] + '：</label><span class="color-42">' + currentBuyPrice + '</span>' + languagePackage['元/吨'] + '</div>' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的供应量'] + '：</label><span class="color-42">' + buyQuantity + '</span>' + languagePackage['元/吨'] + '</div>' +
                            '<div class="odd clearfloat"><label>' + languagePackage['我的中标量'] + '：</label><span class="color-42">' + successBuyQuantity + '</span>' + languagePackage['吨'] + '</div>' +
                            '<div class="even clearfloat"><label>' + languagePackage['供应量'] + '：</label>' + buyAmountHtml + '</div>' +
                            '<div class="even clearfloat">' +
                            '<label class="vm">' + languagePackage['竞卖出价'] + '：</label>' +
                            '<div class="num_add_reduce clearfloat">' +
                            '<span class="start-price">' + o_startPrice + languagePackage['元/吨'] + '<span>' + operationHtml + '</span></span>' +
                            '<div class="reduce" id="at_bid_hall_reduce" name="at_bid_hall_reduce"></div>' +
                            '<div class="num_inp">' + competeBuyHtml + '</div>' +
                            '<div class="add" id="at_bid_hall_add" name="at_bid_hall_add"></div>' +
                            '</div>' +
                            '<div class="m-criticalPrice"><label>' + languagePackage['当前中标底价'] + '：</label>' + resp.data.criticalPrice + languagePackage['元/吨'] + '</div>' +
                            '</div>' +
                            '<div class="even clearfloat"><label>' + languagePackage['总共出价'] + '：</label><span class="total-amount">' + (resp.data.buyPrice ? (Number(o_startPrice) * Number(resp.data.buyQuantity)) : 0) + '</span>' + languagePackage['元'] + '</div>' +
                            '</div>';
                    }

                    if (type == 1) {
                        var offerBtn = "offer1";
                    } else if (type == 2) {
                        var offerBtn = "offer2";
                    }

                    var d = dialogOpt({
                        title: languagePackage['竞买出价'],
                        class: 'bid-purchase',
                        offerBtn: offerBtn,
                        content: content,
                        textOkey: languagePackage['出价'],
                        textOkeyId: 'at_bid_hall_cjokId',
                        textCancel: languagePackage['取消'],
                        textCancelId: 'at_bid_hall_cjcancelId',
                        closeId: 'at_bid_hall_cjcloseId',
                        funcOkey: function () {
                            //if (btnStatus == 1) {
                            //    return false;
                            //}
                            var buyPrice;
                            var obuyQuantity = trim($('.buy-amount').val());
                            if (type == 1) {
                                buyPrice = trim(f_double(Number(o_startPrice) + Number($('.num_inp input').val())));
                                if (!isInteger(obuyQuantity)) {
                                    alertReturn(languagePackage['申买数量必须为数字且大于0']);
                                    return false;
                                }

                                if (Number(obuyQuantity) < minBuyQuantity || Number(obuyQuantity) > Number(resp.data.totalQuantity)) {
                                    alertReturn(languagePackage['申买数量必须在minBuyQuantity-maxBuyQuantity']
                                        .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity', resp.data.totalQuantity));
                                    return false;
                                }
                                //出价必需大于等于中标最低价
                                if (Number(buyPrice) < Number(o_startPrice)) {
                                    alertReturn(languagePackage['出价必需大于等于中标最低价']);
                                    return false;
                                }
                                if (resp.data.buyQuantity) {
                                    if (Number(buyPrice) < Number(currentBuyPrice)) {
                                        alertReturn(languagePackage['出价价格必须大于等于当前出价']);
                                        return false;
                                    }
                                    //减少标时出价不能小于等于当前出价
                                    if (Number(obuyQuantity) < Number(resp.data.buyQuantity) && Number(buyPrice) <= Number(currentBuyPrice)) {
                                        alertReturn(languagePackage['出价价格必须大于当前出价']);
                                        return false;
                                    }
                                }
                            } else {
                                buyPrice = trim(f_double(Number(o_startPrice) - Number($('.num_inp input').val())));
                                if (Number(buyPrice) <= 0) {
                                    alertReturn(languagePackage['出价价格必须大于0']);
                                    return false;
                                }
                                if (!isInteger(obuyQuantity)) {
                                    alertReturn(languagePackage['供应数量数量必须为数字且大于0']);
                                    return false;
                                }
                                if (Number(obuyQuantity) < minBuyQuantity || Number(obuyQuantity) > Number(resp.data.totalQuantity)) {
                                    alertReturn(languagePackage['供应数量必须在minBuyQuantity-maxBuyQuantity']
                                        .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity', resp.data.totalQuantity));
                                    return false;
                                }
                                //出价必需小于等于中标最高价
                                if (Number(buyPrice) > Number(o_startPrice)) {
                                    alertReturn(languagePackage['出价必需小于等于中标最高价']);
                                    return false;
                                }
                                if (resp.data.buyQuantity) {
                                    if (Number(buyPrice) > Number(currentBuyPrice)) {
                                        alertReturn(languagePackage['出价价格必须小于等于当前出价']);
                                        return false;
                                    }
                                    //减少标时出价不能大于等于当前出价
                                    if (Number(obuyQuantity) < Number(resp.data.buyQuantity) && Number(buyPrice) >= Number(currentBuyPrice)) {
                                        alertReturn(languagePackage['出价价格必须小于当前出价']);
                                        return false;
                                    }
                                }
                            }
                            var param = {
                                buyPrice: buyPrice,
                                buyQuantity: obuyQuantity,
                                tenderId: tenderId
                            }
                            //出价验证
                            interface.bidTenderValite(param, function (resp) {
                                var quantityName = "";
                                //btnStatus = 1;
                                if (type == 1) {  // 1供应 2采购
                                    var currentBid = Number(o_startPrice) + Number($(".num_inp input").val());
                                    quantityName = "申买量";
                                } else if (type == 2) {
                                    var currentBid = Number(o_startPrice) - Number($(".num_inp input").val());
                                    quantityName = "供应量";
                                }

                                var totalAmount = $('.total-amount').html();
                                d.remove();
                                var html1 = '<div>' +
                                    '<h1>' + languagePackage['当前出价'] + '</h1>' +
                                    '<h2>' + currentBid + languagePackage['元'] + '</h2>' +
                                    '<p><span>' + languagePackage[quantityName] + ' : ' + obuyQuantity + languagePackage['吨'] + '</span><span>' + languagePackage['总共出价'] + ' : ' + totalAmount + languagePackage['元'] + '</span></p>' +
                                    '</div>';
                                var d1 = dialogOpt({
                                    title: languagePackage['确认出价'],
                                    class: 'widthdraw_ok',
                                    content: html1,
                                    textOkey: languagePackage['确认'],
                                    textOkeyId: 'at_bid_hall_qrokId',
                                    textCancel: languagePackage['取消'],
                                    textCancelId: 'at_bid_hall_qrcancelId',
                                    closeId: 'at_bid_hall_qrcloseId',
                                    funcOkey: function () {
                                        interface.bidTender(param, function (resp) {
                                            if (resp.code == 0) {
                                                alertReturn(languagePackage['出价成功']);
                                                if ($this.parents('.item').find('.apply-amount').length > 0) {
                                                    $this.parents('.item').find('.apply-amount span.fts-16').html(obuyQuantity);
                                                    $this.parents('.item').find('.success-amount span').html(resp.data);
                                                } else {
                                                    $this.parents('.item').find('.purchase').append('<p class="apply-amount"><label>' + languagePackage['申买量'] + '：</label><span class="color-41"><span class="fts-16">' + obuyQuantity + '</span>吨</span></p><p class="success-amount"><label>' + languagePackage['我的中标量'] + '：</label><span>' + resp.data + '</span>' + languagePackage['吨'] + '</p>');
                                                }
                                                $this.parents('.item').find('.bid-label').html(languagePackage['已出价']);
                                                bidHallFunc.tenderList($("#pageNum" + type).val());
                                                d1.remove();
                                            } else {
                                                //btnStatus = 0;
                                                alertReturn(resp.exception);
                                            }
                                        }, function (resp) {
                                            //btnStatus = 0;
                                            alertReturn(resp.exception);
                                        });
                                    }
                                });
                            }, function (resp) {
                                //code = 3，只能投竞价中的标，刷新页面
                                if (resp.code == 3) {
                                    bidHallFunc.tenderList(1);
                                }
                                alertReturn(resp.exception);
                            });
                        }
                    });
                    //进入竞价规则页面
                    $(".enter-bidding-rule").off().on('click', function () {
                        window.open('p_bidding_rule.html');
                    });
                    bidHallFunc.priceChange();
                    bidHallFunc.inputAmount();
                    if (resp.data.status == 2) {
                        var endTime = $('.left-time .j-endtime').html();
                        countDown($('.left-time .j-endtime'), endTime);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            }, function (resp) {
                //code = 3，只能投竞价中的标，刷新页面
                if (resp.code == 3) {
                    bidHallFunc.tenderList(1);
                }
                alertReturn(resp.exception);
            });
        });

        $('.item .detail .title,.item .bid-cover').off().on('click', function () {
            var $this = $(this);
            var tenderId = $this.parents('.item').attr('data-tenderId');
            var userId = $this.parents('.item').attr('data-userId');
            var type = $this.parents('.item').attr('data-bidType');//1:供应标；2：采购标；
            if (user && user.login && user.data.id == userId) {
//                window.location.href = 'p_bid_detail_seller.html?tenderId=' + tenderId + '&type=' + type + '&from=hall'+ '&pagenum='+ pagenum + '&queryType='+ queryType+'&petrolType='+petrolType;
                window.open('p_bid_detail_seller.html?tenderId=' + tenderId + '&type=' + type + '&from=hall' + '&pagenum=' + pagenum + '&queryType=' + queryType + '&petrolType=' + petrolType);
            } else {
//                window.location.href = 'p_bid_detail_buyer.html?tenderId=' + tenderId + '&type=' + type + '&from=hall'+ '&pagenum='+ pagenum + '&queryType='+ queryType+'&petrolType='+petrolType;
                window.open('p_bid_detail_buyer.html?tenderId=' + tenderId + '&type=' + type + '&from=hall' + '&pagenum=' + pagenum + '&queryType=' + queryType + '&petrolType=' + petrolType);
            }
        })
    }


    /*
     *渲染倒计时*
     **/
    bidHallFunc.showCountDown = function () {
        $('#j_tender_list' + type + ' .j-count').each(function () {
            var $this = $(this);
            var status = $this.parents(".item").attr("data-status");
            if (status == 2) {
                var endTime = $this.html();
                //alert(endTime);
                countDown($(this), endTime);
            }
        });
    }


    /**
     *出价价格加减*
     **/
    bidHallFunc.priceChange = function () {
        $('.num_add_reduce .reduce').bind('click', function () {
            var buyAmount = $('.buy-amount').val();
            var count = parseInt($('.num_inp input').val());
            if (count > 0) {
                count -= 5;
                $('.num_inp input').val(count);
                var inputPrice = $('.num_inp input').val();
                var totalPrice;
                if (type == 1) {
                    totalPrice = Number(o_startPrice) + Number(inputPrice);
                } else if (type == 2) {
                    totalPrice = Number(o_startPrice) - Number(inputPrice);
                }
                $('.total-amount').html(f_double(totalPrice * buyAmount));
            }
        });

        $('.num_add_reduce .add').bind('click', function () {
            var buyAmount = $('.buy-amount').val();
            var count = parseInt($('.num_inp input').val());
            if (isNaN(count)) {
                count = 0
                $('.num_inp input').val("0");
            }
            count += 5;
            if (Number(count) >= Number(o_startPrice)) {
                return false;
            }
            $('.num_inp input').val(count);
            var inputPrice = $('.num_inp input').val();
            var totalPrice;
            if (type == 1) {
                totalPrice = Number(o_startPrice) + Number(inputPrice);
            } else if (type == 2) {
                totalPrice = Number(o_startPrice) - Number(inputPrice);
            }
            $('.total-amount').html(f_double(totalPrice * buyAmount));
        });
    }

    /**
     *输入申买量*
     **/
    bidHallFunc.inputAmount = function () {
        //输入申买量
        $('.buy-amount').off().on('input', function () {
            var $this = $(this);
            var buyAmount = trim($this.val());
            var inputVal = trim($this.val());
            if (!isZhengshu(inputVal)) {
                $this.val('');
                $(".total-amount").html(f_double(0.00));
            } else {
                $this.val(Number(inputVal));
                var inputPrice = $('.num_inp input').val();
                var totalPrice;
                if (type == 1) {
                    totalPrice = Number(o_startPrice) + Number(inputPrice);
                } else if (type == 2) {
                    totalPrice = Number(o_startPrice) - Number(inputPrice);
                }
                $(".total-amount").html(f_double(totalPrice * buyAmount));

            }
        });

        $('.num_inp input').off().on('input', function () {
            var $this = $(this);
            var inputPrice = trim($this.val());
            var inputVal = trim($this.val());
            if (!isZhengshu(inputVal)) {
                $this.val('');
                $(".num_inp input").html(f_double(0.00));
            } else {
                $this.val(Number(inputVal));
                var buyAmount = $('.buy-amount').val();
                var totalPrice;
                if (type == 1) {
                    totalPrice = Number(o_startPrice) + Number(inputPrice);
                } else if (type == 2) {
                    totalPrice = Number(o_startPrice) - Number(inputPrice);
                }
                $(".total-amount").html(f_double(totalPrice * buyAmount));

            }
        });

    }

    /**
     *重值筛选*
     **/
    bidHallFunc.resetSelest = function () {
        $('.mod-tab-bid .type span').html('所有硫含量').attr('data-maxsu', '').attr('data-minsu', '').attr('data-su', '');
        $('.mod-tab-bid .type-ash span').html('所有灰分含量').attr('data-maxash', '').attr('data-minash', '').attr('data-ash', '');
        $('.mod-tab-bid .type-va span').html('所有钒含量').attr('data-maxva', '').attr('data-minva', '').attr('data-va', '');
        $('.mod-tab-bid .place span').html('所有产地');
        if ($('.show-other').length > 0) {
            $('.show-other').remove();
        }
    }

    /**
     *处理图片--获取图片的宽高来添加样式*
     **/
    bidHallFunc.dealwithImg = function () {
        $('.bid-cover img').each(function () {
            var $this = $(this);
            var img_url = $this.attr('src');
            // 创建对象
            var img = new Image();
            // 改变图片的src
            img.src = img_url;
            // 定时执行获取宽高
            var check = function () {
                // 只要任何一方大于0
                // 表示已经服务器已经返回宽高
                if (img.width > 0 && img.height > 0) {
                    if (img.width >= img.height) {
                        $this.addClass('height');
                    } else {
                        $this.addClass('width');
                    }
                    clearInterval(int);
                }
            };
            var int = setInterval(check, 40);
        });
    }

    bidHallFunc.template = function () {
        template.helper('returnZhengshu', function (obj) {
            var z = returnZhengshu(obj);
            return z;
        });
        template.helper('setLanguagePackage', function (key) {
            if (key in languagePackage) {
                return languagePackage[key];
            }
        })
        template.helper('setLanguagePackageCss', function (key) {
            if (key in languagePackage['css']) {
                return languagePackage['css'][key];
            }
        })
    }
    bidHallFunc.hideCertify = function () {
        if (user && user.login) {
            var userInfo = getUser().data;
            if (userInfo.role) {
                if (userInfo.role == 1 || userInfo.role == 2 || userInfo.role == 3) {
                    $(".certify ").addClass("hide");
                }
            }
        }
    }

    /*倒计时*/
    // function countDown(el, endTime) {
    //     var interval = new Date(endTime - new Date().getTime());
    //     if (interval.getTime() <= 0 ) {
    //         window.location.reload();
    //     } else {
    //         var h = Math.floor(interval / 1000 / 60 / 60 % 24);
    //         var m = Math.floor(interval / 1000 / 60 % 60);
    //         var s = Math.floor(interval / 1000 % 60);
    //         if (m < 10) {
    //             m = '0' + m;
    //         }
    //         if (s < 10) {
    //             s = '0' + s;
    //         }
    //         el.text(h + ':' + m + ':' + s);
    //         if()
    //         setTimeout(function () {
    //             countDown(el, parseInt(endTime));
    //         }, 1000);
    //     }
    // }

    function countDown(el, endTime) {
        var interval = new Date(endTime - new Date().getTime());
        var h = Math.floor(interval / 1000 / 60 / 60 % 24);
        var m = Math.floor(interval / 1000 / 60 % 60);
        var s = Math.floor(interval / 1000 % 60);
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        el.text(h + ':' + m + ':' + s);
        if (interval.getTime() <= 0) {
            window.location.reload();
        } else {
            setTimeout(function () {
                if (interval.getTime() <= 5 * 60 * 1000) {
                    el.addClass('color-red');
                    countDown(el, parseInt(endTime));
                } else {
                    countDown(el, parseInt(endTime));
                }

            }, 1000);
        }

    }

    //大厅消息
    //var news1;  //判断通知消息
    var int1;

    function showNotice() {
        if (int1) {
            window.clearInterval(int1);
        }
        interface.bidHallNews(function (resp) {
            if (resp.code == 0) {
                if (resp.data.content.length > 0) {
                    $("#news_modular").html(template('t:j_news_modular', {list: resp.data.content}));
                    bidHallFunc.closeNotice();

                    var news_modularN = resp.data.content.length;
                    if (news_modularN > 1) {
                        $(document).ready(function () {
                            $("#news_modular").slide({
                                li_size: 1, //每次滚动li个数,默认一屏
                                speed: 1000, //速度：数值越大，速度越慢（毫秒）默认500
                                timer: 5000, //不需要自动滚动删掉该参数
                                li_w: 38 //每个li的宽度（包括border,margin,padding,都要算进去）
                            });
                        });
                    }
                } else {
                    $("#news_modular").hide();
                }

            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }

    //登录判断
    if (user.login) {
        showNotice();
    } else {
        $("#news_modular").hide();
    }


    bidHallFunc.closeNotice = function () {
        $('.news-modular ul li .news-close,.news-words a').off().on('click', function () {
            var _this = $(this);
            var id = _this.parents("li").attr("data-id");
            interface.closeBidHallNews({
                id: id
            }, function (resp) {
                if (resp.code == 0) {
                    //news1 = 1;
                    showNotice();
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }

    function rollNotice() {
        var _index = $("#news_modular ul li.show").index();
        //console.log(_index);
        $("#news_modular ul li").eq(_index).removeClass("show").addClass("hide");
        if (_index == $("#news_modular ul li").length - 1) {
            $("#news_modular ul li").eq(0).removeClass("hide").addClass("show");
        } else {
            $("#news_modular ul li").eq(_index + 1).removeClass("hide").addClass("show");
        }
    }

    //绑定关注取消关注事件
    bidHallFunc.bindFollow = function () {
        $('.focus_on').off('click').on('click', function () {

            var _this = $(this);
            var userId = _this.attr('data-userid');

            if ($.trim(_this.text()) == languagePackage['关注']) {
                interface.follow({
                    userId: userId
                }, function (resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['已关注']);
                        _this.addClass('special');
                        $('#j_tender_list1').find('.focus_on').each(function () {
                            if (userId == $(this).attr('data-userid')) {
                                $(this).text(languagePackage['已关注']);
                                $(this).addClass('special');
                                $(this).siblings('.focus_on_text').text(languagePackage['已接收该商家发布招标通知']);
                            }
                        });
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            }
        });
    }
    bidHallFunc.scrollEvent = function (e, _scrollTopNum) {

        var _topOperationBarNum = $(".header-top").height(),// 获取标题栏高度
            _topOperationArea = $(".mod-header").height(),// 获取上方区域高度

            _topBetweenHeight = _topOperationArea - _topOperationBarNum;//上方浮动计算高度

        // 判断标题栏的位置，做固定
        if (_scrollTopNum > _topBetweenHeight || _scrollTopNum == _topBetweenHeight) {
            // 判断固定标题栏
            if (!$(".bid-tabBox").hasClass("bid-tabBoxFixed")) {
                $(".bid-tabBox").addClass("bid-tabBoxFixed");
            }
            if (!$(".mod-tab-bid").hasClass("mod-tab-bidFixed")) {
                $(".mod-tab-bid").addClass("mod-tab-bidFixed");
            }
            // if (!$(".bid-condition-top").hasClass("bid-condition-topFixed")) {
            //     $(".bid-condition-top").addClass("bid-condition-topFixed");
            //
            // }
            $(".mod-bid").css('padding-top', '200px')
        }
        if (_scrollTopNum < _topBetweenHeight) {
            // 解除标题栏固定
            if ($(".bid-tabBox").hasClass("bid-tabBoxFixed")) {
                $(".bid-tabBox").removeClass("bid-tabBoxFixed");
            }
            if ($(".mod-tab-bid").hasClass("mod-tab-bidFixed")) {
                $(".mod-tab-bid").removeClass("mod-tab-bidFixed");
            }
            // if ($(".bid-condition-top").hasClass("bid-condition-topFixed")) {
            //     $(".bid-condition-top").removeClass("bid-condition-topFixed");
            // }
            $(".mod-bid").css('padding-top', '0')
        }
    };

    bidHallFunc.init();
});







