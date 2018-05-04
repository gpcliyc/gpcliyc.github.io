/**
 * @authors sfj
 * @date    2016-08-28
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    require("interface");
    // require("iscroll");
    var bootstrap = require("bootstrap");
    var header = require('header');
    require("pagination");
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var filter = require('filter');
    filter.showLoginStatus();
    var loading = "loading";
    var languagePackage = null;
    /*
    **iscroll.js实现上拉加载更多，代替分页
     */
    // var myScroll,
    //     pullUpEl,
    //     pullUpOffset;

    var user = getUser();//获取登录状态
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；
    var goodsObj = {
        pageNum: "",
        sort:"shelf_time"
    }
    var integralMall = {};
    // window.location.reload();
    integralMall.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.getUserInfo();
        this.list(goodsObj);
    }
    integralMall.renderBlock = function () {
        $("#integral_mall_search").html(template('t:integral_mall_search'));
        $("#getPoints").html(template('t:getPoints'));
    }
    integralMall.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_integral_mallNational/p_integral_mall.json', function (resp) {
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
    integralMall.template = function () {
        template.helper('formatCurrency', function (price) {
            var z = formatCurrency(price);
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
        template.helper('statusStr', function (statusStr) {
            switch (statusStr) {//状态:订阅,取消订阅,兑换,
                case 1:
                    statusStr = languagePackage['订阅提醒'];
                    break;
                case 2:
                    statusStr = languagePackage['已订阅'];
                    break;
                case 3:
                    // statusStr = languagePackage['兑换'];
                    statusStr = '兑换'
                    break;
            }
            return statusStr;
        })
        template.helper('shelfTimeParse', function (shelfTime) {
            var day = dayTime(shelfTime)
            return day;
        })
        template.helper('statusClass', function (statusClass) {
            switch (statusClass) {//状态:订阅,取消订阅,兑换,
                case 1:
                    statusClass = "status-1";
                    break;
                case 2:
                    statusClass = "status-2";
                    break;
                case 3:
                    statusClass = "status-3";
                    break;
            }
            return statusClass;
        })
    }
    //焦币商城-商品列表
    integralMall.list = function (goodsObj) {
        var that = this;
        goodsObj.pageNum = 1;
        // goodsObj.pageNum = goodsObj.pageNum || 1;
        var data = {
            "pageSize": 0,
            "pageNum": goodsObj.pageNum,
            "sort": goodsObj.sort
        };
        var json = {
            page: goodsObj.pageNum,
            pageSize: 0
        };
        data = data || json;
        interface.goodsList(data, function (resp) {
                var result = resp.data;
                // integralMall.parseData(result);
                $("#goodsList").html(template('t:goodsList', {list: result.content, center_240px: center_240px}));
                integralMall.operation();//页面事件操作
                var totalPages = result.totalPages;      //总页数
                var totalElements = result.totalElements;      //总条数
                $("#queryCount").html(totalElements);//用户个数;
                // integralMall.operate();
                //如果没有数据
                if (result.content == '') {
                    $("#goodsList").html('<div class="no-data">' + languagePackage['没有相关商品信息'] + '</div>');
                    // $('#pagination').html('');
                    // $('#pageNum').val(1);
                }
                //如果有数据则显示分页
                // if (totalPages > 0) {
                //     $("#pagination").pagination(resp.data.totalElements, {
                //         num_edge_entries: 3,//此属性控制省略号后面的个数
                //         num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                //         items_per_page: 16, // 每页显示的条目数
                //         current_page: goodsObj.pageNum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                //         callback: integralMall.pageCallback
                //     });
                //     if (resp.data.totalPages == 1) {
                //         $('#pagination').html('');
                //         $('#pageNum').val(1);
                //     }
                //     $("#totalElements").html("共" + totalElements + "条数据");
                // }

            },
            //error function
            function (resp) {
                alertReturn(resp.exception);
            }, loading);
    }
    integralMall.subscribe = function (id, title) {
        interface.subscribe({id: id}, function (resp) {
            if (resp.code == 0) {
                if (title) {
                    alertReturn(languagePackage['订阅成功，上架后将准时提醒您'] + "～")
                }
                integralMall.list(goodsObj);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    //设置图片列表的宽度、高度
    integralMall.setListStyle = function () {
        // var imgListWidth=$(".img_list").width();//图片展示列表总宽度
        // var listWidth = (imgListWidth-120)/4;//单个图片显示宽度
        // var listWidthPercent =  (listWidth/imgListWidth)*100+'%';//单个图片显示宽度百分比
        // $(".img_list .img_item").css({"width":listWidthPercent});
        // $(".img_list .pic_box").height(listWidth);
    }
    integralMall.operation = function () {
        integralMall.tabToggle();
        integralMall.goodsConvert();
        integralMall.changeText();
        integralMall.getIntegral();
        integralMall.getLogs();
    }
    //焦币值、上架时间排序
    integralMall.tabToggle = function () {
        $("#integral_mall_search .choose_tab").unbind('click').bind('click', function () {
            var _this = $(this);
            _this.siblings().removeClass("active");
            _this.addClass("active");
            var searchOption = _this.attr("search_option");
            goodsObj.sort = searchOption;
            integralMall.list(goodsObj);
        })
    }
    // 兑换、订阅、取消订阅操作
    integralMall.goodsConvert = function () {
        $(".operation_box .btn_status").unbind('click').bind('click', function () {
            var _this = $(this);
            if (user.login) {
                var option_type = _this.attr("option_type");
                var goodsId = _this.parent().attr("goodsid");
                var para = {
                    goodsId: goodsId
                }
                // 状态:1未订阅,2已订阅,3可兑换
                switch (Number(option_type)) {
                    case 1:
                        integralMall.subscribe(goodsId, true);
                        break;
                    case 2:
                        integralMall.subscribe(goodsId, false);
                        break;
                    case 3: {
                        // 焦币余额、认证验证
                        var goodsIntegral = _this.parent().attr("goods_integral");
                        if( goodsIntegral > user.data.integrals ) {
                            alertReturn("焦币不足！");
                            return ;
                        }
                        if( user.data.role === 0 ) {
                            alertReturn("未进行认证！");
                            return ;
                        }
                        window.location = 'p_goods_convert.html?goodsId='+goodsId;
                        break;
                    }
                }
            } else {
                alertReturn("请登录！");
            }

        })
    }
    integralMall.dialogCertify = function () {
        var content = '<h1><span class="welcome_you">欢迎您，请认证入驻</span></h1>' +
            ' <p class="welcome_you1">兑换商品，需要您的员工认证或公司认证</p> ' +
            '<div class="welcome-btn clearfloat"> ' +
            '<div class="welcome-btn-area left">' +
            '<div class="describe company_in">所在公司已入驻</div>' +
            '<a href="p_application.html" class="personal_apply_in" id="at_index_personal_apply_in" name="at_index_personal_apply_in">申请加入</a>' +
            '</div>' +
            '<div class="welcome-btn-area">' +
            '<div class="describe company_out">所在公司未入驻</div>' +
            '<a href="p_person_certification.html" class="company_apply_in" id="at_index_company_apply_in" name="at_index_company_apply_in">公司入驻</a>' +
            '</div>' +
            ' </div>'

        dialogOpt({
            title: ' ',
            class: 're-success',
            content: content
        });
    }
    integralMall.changeText = function () {
        $(".operation_box .status-2").hover(function () {
            $(this).text(languagePackage['取消订阅']);
        }, function () {
            $(this).text(languagePackage['已订阅']);
        })
    }
    //获取焦币记录
    integralMall.getLogs = function () {
        $("#integral_mall_title a").unbind('click').bind('click', function () {
            window.location.href = "p_integralRecord.html"
        })
    }
    integralMall.getIntegral = function () {
        $(".getPoints").unbind('click').bind('click', function () {
//        	window.location.href="p_integral_rule.html"
            window.open("p_integral_rule.html");
        })
    }
    // integralMall.pageCallback = function(pageNum) {
    //     goodsObj.pageNum = pageNum + 1;
    //     integralMall.list(goodsObj);
    // }
    integralMall.getUserInfo = function () {
        var integrals = 0;
        var showIntegral = "";
        var integralNum = "";
        var integralsFrozen = "";
        // if(user.login){
        //     interface.currentUserInfo(
        //         function (resp) {
        //             if(resp.code == 0){
        //                 if(resp.data.integrals){
        //                     integrals = resp.data.integrals;
        //                     showIntegral = "";
        //                     integralNum = integrals;
        //                 }
        //                 $("#integral_mall_title").html(template('t:integral_mall_title', {showIntegral:showIntegral, integralNum:integralNum}));
        //             }
        //
        //         },
        //         function (resp) {
        //             alertReturn(resp.exception);
        //         }
        //     )
        // }else{
        //     showIntegral="hide";
        //     integralNum="";
        //     $("#integral_mall_title").html(template('t:integral_mall_title', {showIntegral:showIntegral, integralNum:integralNum}));
        // }
        if (user.login) {
            integrals = user.data.integrals;
            showIntegral = "";
            integralNum = integrals;
            integralsFrozen = user.data.integralsFrozen;
        } else {
            showIntegral = "hide";
            integralNum = "";
            integralsFrozen = "";
        }
        $("#integral_mall_title").html(template('t:integral_mall_title', {
            showIntegral: showIntegral,
            integralNum: integralNum,
            integralsFrozen: integralsFrozen
        }));
    }

    integralMall.init();
});
