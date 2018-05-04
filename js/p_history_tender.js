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
    var global = require("global");
    require("interface");
    require("pagination");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var histioryTenderFunc = {};

    /*初始化*/
    histioryTenderFunc.init = function () {
        this.selectOpt();
        this.tenderList(1); //招标列表
        this.count();//各状态数量
    }

    histioryTenderFunc.count = function () {
        interface.historyCount(function (resp) {
            if (resp.code == 0) {
                $('.mod-menu .total').html(resp.data.total);
                $('.mod-menu .supplier').html(resp.data.supply);
                $('.mod-menu .purchaser').html(resp.data.demand);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }


    histioryTenderFunc.selectOpt = function () {
        //处理选择筛选--所有种类、所有产地
        $(".mod-menu .item li").on('click', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            histioryTenderFunc.tenderList(1);
        });
    }

    /*招标列表*/
    histioryTenderFunc.tenderList = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var loading = "loading";
        interface.historyTenderList({
                type: status,
                pageSize: 10,
                pageNum: pagenum
            }, function (resp) {
                switch (status) {
                    case "":
                        $('.mod-menu .total').html(resp.data.totalElements);
                        break;
                    case "1":
                        $('.mod-menu .supplier').html(resp.data.totalElements);
                        break;
                    case "2":
                        $('.mod-menu .purchaser').html(resp.data.totalElements);
                        break;
                }
                if (resp.data.content.length > 0) {
                    $("#j_tender_list").html(template('t:j_tender_list', {list: resp.data.content, userList: user}));
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: histioryTenderFunc.tenderList_pageCallback
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }
                    $('.item .detail .title,.item .bid-cover').on('click', function () {//点击标的标题和封面进入详情...
                        var $this = $(this);
                        var tenderId = $this.parents('.item').attr('data-tenderId');
                        var userId = $this.parents('.item').attr('data-userId');
                        var type = $this.parents('.item').attr('data-bidType');//1:供应标；2：采购标；
                        if (user && user.login && user.data.id == userId) {
                            window.location.href = 'p_bid_detail_seller.html?tenderId=' + tenderId + '&type=' + type + '&from=history';
                        } else {
                            window.location.href = 'p_bid_detail_buyer.html?tenderId=' + tenderId + '&type=' + type + '&from=history';
                        }
                    });
                    histioryTenderFunc.dealwithImg();
                } else {
                    $("#j_tender_list").html('<div class="no-data">没有相关招标信息</div>');
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading
        )
    }

    histioryTenderFunc.tenderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        histioryTenderFunc.tenderList(page_id + 1);
    }

    /*处理图片--获取图片的宽高来添加样式*/
    histioryTenderFunc.dealwithImg = function () {
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

    histioryTenderFunc.init();
})
;
