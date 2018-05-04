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
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var status;//通知状态及左侧菜单选中状态 status=0代表全部通知；status=1代表未读通知；status=2代表已读通知
    //通知页面tab=0代表全部通知；tab=1代表未读通知；tab=2代表已读通知
    var tab = request('tab');
    if (tab == 1) {
        status = 1;
    } else if (tab == 2) {
        status = 2;
    } else {
        status = "";
    }

    var noticetListFunc = {};
    /*初始化*/
    noticetListFunc.init = function () {
        this.count(); //协议状态
        this.selectOpt(status);//左侧tab
        this.orderList(1); //协议列表
    }

    noticetListFunc.selectOpt = function () {
        if (status) {//选中菜单
            $('.mod-menu .item li:eq(' + status + ')').addClass('active').siblings().removeClass('active');
        }

        //点击左侧tab
        $(".mod-menu .item li").on('click', function () {
            console.log('hey')
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            $(".mod-body .notice .theme").find("#msgCenter").html($this.html().substring(0, 4));
            $("#allMsg").prop('checked',false);//切换时去掉全选
            noticetListFunc.orderList(1);

        });
    }


    /*通知列表*/
    noticetListFunc.orderList = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var loading = "loading";
        interface.noticeList({
                status: status,
                pageSize: 10,
                pageNum: pagenum
            }, function (resp) {
                if (resp.data.content.length > 0) {
                    $("#j_noticeList").html(template('t:j_noticeList', {list: resp.data.content}));
                    if($("#allMsg").prop("checked")){
                        $("#j_noticeList .item").each(function (index, item) {
                            $(item).find('.oneMsg:checkbox').prop("checked", true );
                        })
                    }
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: noticetListFunc.orderList_pageCallback
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }
                    noticetListFunc.optBtn();
                } else {
                    $("#j_noticeList").html('<div class="no-data">没有相关通知</div>');
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading
        )
    }

    noticetListFunc.orderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        noticetListFunc.orderList(page_id + 1);
    }

    /*按钮*/
    noticetListFunc.optBtn = function () {
        $("#allMsg").off('click').on('click', function (e) {
            if ($("#j_noticeList .item").length) {
                var allChecked = !!$(this).is(':checked');
                $("#j_noticeList .item").each(function (index, item) {
                    $(item).find('.oneMsg:checkbox').prop("checked", allChecked);
                })
            }
        })
        $("#j_noticeList .item .oneMsg").off('click').on('click', function (e) {
            var flag = $("#j_noticeList .item .oneMsg:checked").length === $("#j_noticeList .item").length;
            $("#allMsg:checkbox").prop("checked", flag);
        })
        //功能操作
        $('#msgOperator').off('click').on('click', function (e) {
            if ($("#j_noticeList .item input:checked").length) {
                var id = $(e.target).attr('id');
               var activeStatus = $(".mod-menu .item li.active").attr('data-status');
                switch (id) {
                    case "markRead":{
                        type = 1;
                        msg = "标记已读成功";
                        break;
                    }
                    case "deleteMsg": {
                        type = 2;
                        msg = "删除成功";
                        break;
                    }
                    case "markUnread":{
                        type = 3;
                        msg = "标记未读成功";
                        break;
                    }
                }
                var msgCenterStr  = $("#allMsg").siblings('#msgCenter').text();
                if(msgCenterStr == '未读通知' && type == 3){
                    alertReturn('已为未读状态');
                }else if(msgCenterStr == '已读通知' && type == 1){
                    alertReturn('已为已读状态');
                }else{
                    if($("#allMsg").prop("checked")){

                        interface.batchDeal({ids: [], type: type,status:activeStatus}, function (resp) {
                            if(resp.code === 0){
                                alertReturn(msg);
                                noticetListFunc.init();
                                $("#allMsg").prop('checked',false);
                            }else{
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })

                    }else{
                        var noticeArr = [];
                        var type,msg;
                        $("#j_noticeList .item input:checked").each(function (index, item) {
                            noticeArr.push(Number($(item).parents('.item').attr('data-noticeid')));
                        })
                        interface.batchDeal({ids: noticeArr, type: type}, function (resp) {
                            if(resp.code === 0){
                                alertReturn(msg);
                                noticetListFunc.init();
                                $("#allMsg").prop('checked',false);
                            }else{
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                }


            } else {
                alertReturn("当前选择为空！");
            }
        })


        $('.notice .item').on('click', function (e) {
            if ($(e.target).attr('class') !== 'oneMsg') {
                var $this = $(this);
                var status = $this.attr('data-status');//status：消息状态 1：未读；2：已读；
                if (status == 1) {
                    $this.remove();
                    var signed = $('.signed').text();
                    var sign = $('.sign').text();
                    $('.signed').html(Number(signed) + 1);
                    $('.sign').html(Number(sign) - 1);
                }
                var noticeId = $this.attr('data-noticeId');

                var backTab = $(".mod-menu .item li.active").attr('data-status');
                window.location.href = 'p_notice_detail.html?noticeId=' + noticeId + '&tab=' + backTab;
            }
        })
    }

    /*协议状态*/
    noticetListFunc.count = function () {
        interface.noticeCount(function (resp) {
            if (resp.code == 0) {
                $('.total').html(resp.data.total);
                $('.signed').html(Number(resp.data.total) - Number(resp.data.unread));
                $('.sign').html(resp.data.unread);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    noticetListFunc.init();

});
