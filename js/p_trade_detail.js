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

    /*初始化搜索变量*/
    var status,//交易状态1：处理中；2：已完成；3已取消；4：已失败
        startDate,//开始时间
        endDate;//结束时间

    /**
     *初始化函数*
     **/
    var tradeFunc = {};
    tradeFunc.init = function () {
        this.leftMenu();//左侧菜单
        this.tradeDetailList();//交易记录
        this.checkboxFunc();//复选框
    }

    /*左侧菜单*/
    tradeFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'交易记录'));
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /**
     *复选框和下拉列表*
     **/
    tradeFunc.checkboxFunc = function () {
        $('.option li').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('checked')) {
                $this.addClass('checked');
            } else {
                $this.removeClass('checked');
            }
            tradeFunc.tradeDetailList();
        });

        $('#select-time').on('change', function () {
            tradeFunc.tradeDetailList();
        });

    }

    /**
     *交易记录*
     **/
    tradeFunc.tradeDetailList = function (page) {
        var pagenum = page ? page : $("#pageNum").val();
        var loading = "loading";
        var typeArray = [];//交易类型:1订单入账,2付款订单,3订单流单,4订单多退,5提现,6提现失败,7充值
        var statusArray = [];//交易类型:1处理中,2已完成,3已取消,4已失败

        $('.trade-type .option li.checked').each(function () {
            var $this = $(this);
            var typeStr = $this.attr('data-type');
            typeArray.push(typeStr);
        });

        $('.trade-status .option li.checked').each(function () {
            var $this = $(this);
            var statusStr = $this.attr('data-type');
            statusArray.push(statusStr);
        });

        var dateType = $("#select-time option:selected").val();

        interface.tradeDetailList({
            pageNum: pagenum,
            pageSize: 10,
            types: typeArray,
            startDate: startDate,
            endDate: endDate,
            status: statusArray,
            dateType: dateType
        }, function (resp) {
            if (resp.code == 0) {
                if (resp.data.content && resp.data.content.length > 0) {
                    $("#j_tradeDetailList").html(template('t:j_tradeDetailList', {
                        list: resp.data.content
                    }));

                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: tradeFunc.tradeList_pageCallback
                    });

                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }

                    tradeFunc.hoverFunc();
                } else {
                    $("#j_tradeDetailList").html("<tr><td colspan='7' class='tc color-9d fts-14'>没有相关交易记录</td></tr>");
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
    tradeFunc.tradeList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        tradeFunc.tradeDetailList(page_id + 1);
    }

    /**
     *hover每一行，去掉三个点的样式*
     **/
    tradeFunc.hoverFunc = function () {
        $('#j_tradeDetailList tr').hover(function () {
            var $this = $(this);
            $this.find('.remark').removeClass('overflow');
        }, function () {
            var $this = $(this);
            $this.find('.remark').addClass('overflow');
        })
    }

    tradeFunc.init();
});
