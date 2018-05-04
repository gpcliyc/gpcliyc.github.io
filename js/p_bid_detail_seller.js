/***
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-29 14:44:43
 **/
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
    require('underscore-min');
    require("sea-text");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();


    /**
     *初始化一些变量*
     **/
    var user = getUser();//获取缓存登录
    var tenderId = request('tenderId');//标ID
    var endTime;//倒计时结束时间
    var currentTime = new Date().getTime();//当前时间
    var totalBidCount;//总出价次数
    var totalBidUser;//总出价人数
    var from = request('from');//从哪个页面进入到本页面
    var type = request('type');//标类型1：供应标；2：采购标
    var currentHour = new Date().getHours();//当前的小时
    var _tender;//标详情对象
    var languagePackage = null;

    var sellerFunc = {};

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
    sellerFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();


        this.initBackTitle();//从哪个页面进入到本页面
        this.detail();//标的倒计时
        this.bidTenders();//投标人列表
    }
    sellerFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_interNational/p_bid_hall.json',function (resp) {
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
    sellerFunc.renderBlock = function () {
        $("#listHead").html(template('t:listHead'));
    }
    /**
     *从哪个页面进入到本页面*
     **/
    sellerFunc.initBackTitle = function () {
        interface.tenderDetail({id: tenderId},function (resp) {
            if(resp.code == 0){
                var titleHtml = '';
                var petrolType = request('petrolType')||"";
                if (from == 'hall'&& petrolType ==1 ) {
                    titleHtml = '<a href="javascript:void(0)">'+languagePackage['石油焦大厅']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }else if(from == 'hall'&& petrolType ==2){
                    titleHtml = '<a href="javascript:void(0)">'+languagePackage['煅后焦大厅']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                } else if(from == 'hall'&& petrolType ==3){
                    titleHtml = '<a href="javascript:void(0)">'+languagePackage['焦炭大厅']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                } else if (from == 'publish') {
                    titleHtml = '<a href="p_my_publish_tender.html">'+languagePackage['我发布的招标']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                } else if (from == 'join') {
                    titleHtml = '<a href="p_my_participation_tender.html">'+languagePackage['我参与的招标']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                } else if (from == 'history') {
                    titleHtml = '<a href="javascript:history.go(-1)">'+languagePackage['历史招标']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                } else if (from == 'center') {
                    titleHtml = '<a href="javascript:history.go(-1)">'+languagePackage['通知中心']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }else if (from == 'order') {
                    titleHtml = '<a href="javascript:history.go(-1)">'+languagePackage['订单详情']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }else if (from == 'contract') {
                    titleHtml = '<a href="javascript:history.go(-1)">'+languagePackage['我的协议']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }
                $('.bid-detail .title').html(titleHtml);
                if (from == 'hall') {''
                    $('.bid-detail .title a').on('click', function () {
                        var pagenum = request('pagenum');
                        var queryType = request('queryType');
                        petrolType = request('petrolType')||"";
                        window.location.href = 'p_bid_hall.html?tenderId=' + tenderId + '&type=' + type + '&from=hall'+ '&pagenum='+ pagenum + '&queryType='+ queryType+"&petrolType="+petrolType;
                    })
                }
                var p_bid_detail = require('../js/component/p_bid_detail/p_bid_detail.js');
                $("#bid_detail").html(p_bid_detail.render(resp.data,languagePackage).el);
                //更新网页标题
                $('head title').html(resp.data.title+(isZhCN()?'-焦易网':'-GPC Market'));
             }else{
                alertReturn(resp.exception);
            }

        },function (resp) {
            alertReturn(resp.exception);
        });

    }


    /**
     招标详情
     **/
    sellerFunc.detail = function () {
        interface.tenderDetail(
            {id: tenderId},
            function (resp) {
                if (resp.code == 0) {
                    _tender = resp.data;
                    $("#j_bidGoods").html(template('t:j_bidGoods', {data: _tender, type: type}));
                    totalBidCount = resp.data.totalBidCount;
                    totalBidUser = resp.data.totalBidUser;
                    $('.list .head p span:eq(0) em').html(totalBidUser);
                    $('.list .head p span:eq(1) em').html(totalBidCount);
                    //var str = $('.substring span').text();
                    //$('.substring span').html(str.substring(0, str.lastIndexOf('、')));//去除最后一个顿号
                    // var objString = $('.m-content').html();
                    // if(objString.length > 30){
                    //     $('.m-content').css("cursor"," pointer");
                    //     $('.m-content').html(objString.substring(0,30) + "...");//超出部分省略号代替
                    // }
                    if (resp.data.status == 2) {
                        var endTime = $('.count-time').html();
                        countDown($('.count-time'), endTime);
                    }
                    //sellerFunc.judgeCount(resp);
                    sellerFunc.dealwithImg();
                    sellerFunc.optBtn();
                    //进入竞价规则页面
                    $(".enter-bidding-rule").on('click', function () {
                        window.open('p_bidding_rule.html');
                    });
                    $("#j_thead").html(template('t:j_thead', {tender: _tender}));
                    if (_tender.status == 2) {
                        $('.bid-detail .list table thead tr th').attr('style', 'width:16.6%');
                    }
                } else {
                    alertReturn(resp.exception);
                }
            },
            function (resp) {
                alertReturn(resp.exception);
            },
            false//同步
        );
    };

    /**
     *详情按钮*
     **/
    sellerFunc.optBtn = function () {
        $('.detail .m-content,.detail .content-menu').unbind("mouseover").bind("mouseover", function () {
            if($(".m-content").html().indexOf("...") > 0){
                $('.content-menu').show();
            }        }).unbind("mouseout").bind("mouseout", function () {
            $('.content-menu').hide();
        });

        $('.company .cancle').unbind('click').bind('click', function () {
            var $this = $(this);
            var d = dialogOpt({
                title: languagePackage['提示'],
                class: 'cancle-bid',
                content: '<p>'+languagePackage['确定要取消该招标吗']+'？</p>',
                textOkey: languagePackage['确定'],
                textOkeyId: 'at_bds_okid',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_bds_cancelid',
                closeId: 'at_bds_closeid',
                funcOkey: function () {
                    interface.cancleTender({
                        tenderId: tenderId
                    }, function (resp) {
                        if (resp.code == 0) {
                            alertReturn(languagePackage['取消成功']);
                            sellerFunc.bidTenders();
                            $('.cancle').remove();
                            $('.bidding').html('<p> '+languagePackage['已取消']+' </p>')
                            //$this.remove();
                            d.remove();
                            setUser();
                            // $('.bidding p').html('已取消');
                            //$('.bidding img').remove();
                            //$('.bidding span').remove();
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            })
        });

        $('.btn-sign').on('click', function () {//去签协议
            window.location.href = 'p_contract.html?tab=1';//协议页面tab=0代表全部协议；tab=1代表待签协议；tab=2代表已签协议
         })
    }

    /**
     *我的竞价列表*
     **/
    sellerFunc.bidTenders = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var loading = "loading";
        interface.bidTenderList({
            pageNum: pagenum,
            pageSize: 10,
            tenderId: tenderId
        }, function (resp) {
            if (resp.data.content.length > 0) {
                $('.bid-detail .list').show();
                $("#j_list").html(template('t:j_list', {list: resp.data.content, tender: _tender}));
//                console.log(_tender);
                if (_tender.status == 2) {
                    $('.bid-detail .list table thead tr th, .bid-detail .list table tbody tr td').attr('style', 'width:16.6%');
                }
                $("#pagination").pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 10, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: sellerFunc.bidTenders_pageCallback
                });

                if (resp.data.totalPages == 1) {//当总页数为1时隐藏分页
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
                sellerFunc.bindFollow();
            } else {
                $("#j_list").html("<tr><td colspan='6' style='width: 100%;' class='tc color-9d fts-14'>"+languagePackage['暂无竞价信息']+"</td></tr>");
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading)
    }

    sellerFunc.bidTenders_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        sellerFunc.bidTenders(page_id + 1);
    }

    /*倒计时*/
    function countDown(el, endTime) {
        var interval = new Date(endTime - new Date().getTime());
        if (interval.getTime() <= 0) {
//            window.location.reload();
        } else {
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
            setTimeout(function () {
                countDown(el, parseInt(endTime));
            }, 1000);
        }
    }



    /**
     *处理图片--获取图片的宽高来添加样式*
     **/
    sellerFunc.dealwithImg = function () {
        $('.goods-img img').each(function () {
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
    sellerFunc.template = function () {
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
        template.helper('returnZhengshu', function (obj) {
            var z = returnZhengshu(obj);
            return z;
        });
        template.helper('formatCurrency',function (obj) {
            if(!obj){
                return '--';
            }
            return formatCurrency(obj);
        })
    }

    //绑定关注取消关注事件
    sellerFunc.bindFollow = function () {
        $('.focus_on').off('click').on('click', function(){
            var _this = $(this);
            var userId = _this.attr('data-userid');
            if (trim(_this.text()) == languagePackage['关注']) {
                //关注
                interface.follow({
                    userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['已关注']);
                        _this.addClass('special');
                        _this.siblings('.focus_on_text').text(languagePackage['已接收该商家发布招标通知']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
             } //else if (_this.text() == '取消关注') {
            //     //取消关注
            //     interface.followCancel({
            //         userId: userId
            //     }, function(resp) {
            //         if (resp.code == 0) {
            //             _this.text('关注');
            //         } else {
            //             alertReturn(resp.exception);
            //         }
            //     }, function(resp) {
            //         alertReturn(resp.exception);
            //     });
            // }
        });
    }

    sellerFunc.init();
});
