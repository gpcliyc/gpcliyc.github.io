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
    var global = require("global");
    var interfaces = require("interface");
    var paginations = require("pagination");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var balanceDatailFunc = {};

    /*初始化搜索变量*/
    var types,// 类型:1入账,2付款,3提现,4其他
        startDate,//开始时间
        endDate;//结束时间

    /**
     *初始化函数*
     **/
    balanceDatailFunc.init = function () {
        this.leftMenu();//左侧菜单
        this.balanceDetailList();//余额明细
        this.checkboxFunc();//复选框
    }

    /**
     *复选框*
     **/
    balanceDatailFunc.checkboxFunc = function () {
        $('.option li').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('checked')) {
                $this.addClass('checked');
            } else {
                $this.removeClass('checked');
            }
            balanceDatailFunc.balanceDetailList();
        });

        $('#select-time').on('change', function () {
            balanceDatailFunc.balanceDetailList();
        });
    }

    /**
     *左侧菜单*
     **/
    balanceDatailFunc.leftMenu = function () {
        interface.currentUserInfo(function (resp) {//获取当前用户信息
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'账户概览'));
//                $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
                $('.total-balance span').html(resp.data.totalBalance.toFixed(2));
                $('.userable-balance span').html(resp.data.useableBalace.toFixed(2));
                balanceDatailFunc.operation(resp.data);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /**
     *余额明细*
     **/
    balanceDatailFunc.balanceDetailList = function (page) {
        var pagenum = page ? page : $("#pageNum").val();
        var loading = "loading";
        var typeArray = [];//type交易类型组成数组
        $('.option li.checked').each(function () {
            var $this = $(this);
            var typeStr = $this.attr('data-type');
            typeArray.push(typeStr);
        });

        var dateType = $("#select-time option:selected").val();

        interface.balanceDetailList({
            pageNum: pagenum,
            pageSize: 10,
            types: typeArray,
            startDate: startDate,
            endDate: endDate,
            dateType: dateType
        }, function (resp) {
            if (resp.code == 0) {
                if (resp.data.content && resp.data.content.length > 0) {
                    $("#j_balanceDetailList").html(template('t:j_balanceDetailList', {
                        list: resp.data.content
                    }));
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: balanceDatailFunc.balanceList_pageCallback
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }
                } else {
                    $("#j_balanceDetailList").html("<tr><td colspan='5' class='tc color-9d fts-14'>没有相关交易记录</td></tr>");
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading)
    }

    /*
     *分页回调*
     */
    balanceDatailFunc.balanceList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        balanceDatailFunc.balanceDetailList(page_id + 1);
    }

    /**
     *提现充值按钮*
     */
    balanceDatailFunc.operation = function (data) {
        widthDrawDialog(data);//提现弹框
        rechargeDialog();//充值弹框
    }

    balanceDatailFunc.init();
});
