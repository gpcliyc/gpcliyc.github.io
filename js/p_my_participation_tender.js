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
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();//获取缓存登录
    var endTime;//倒计时结束时间
    var currentHour = new Date().getHours();//当前的小时
    var currentTime = new Date().getTime();//当前时间
    var startPrice;//底价
    var o_startPrice;//当前出价

    var participationTenderFunc = {};

    /**
     * 初始化倒计时所用变量*
     **/
    var endYear = new Date().getFullYear();
    var endMonth = new Date().getMonth() + 1;
    var endDay = new Date().getDate() + 1;
    var endHour;
    var endMinute;
    var stringTime;
    var languagePackage = null;

    /**
     *初始化*
     **/
    participationTenderFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.selectOpt();
        this.tenderList(1); //招标列表
        this.count();//我发布的招标各状态数量
    }

    /**
     * 语言选择
     */
    participationTenderFunc.selectLanguage = function () {
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
    
    /**
     * 左边搜索条件翻译
     */
    participationTenderFunc.renderBlock = function () {
        $("#j_mod-menu").html(template('t:j_mod-menu'));
        $("#theme_bg-color").html(template('t:theme_bg-color'));
//        $("#j_orderListSeachBlock").html(template('t:j_orderListSeachBlock'));
    }

    /**
     *我发布的招标各状态数量*
     **/
    participationTenderFunc.count = function () {
        interface.collectCount(function (resp) {
            //bidding: 竞价中 ,fail : 未中标 ,publicity: 公示中 ,success: 已中标 ,total: 全部参与
            if (resp.code == 0) {
                $('.mod-menu .total').html(resp.data.total);
                $('.mod-menu .publicity').html(resp.data.publicity);
                $('.mod-menu .finish').html(resp.data.success);
                $('.mod-menu .fail').html(resp.data.fail);
                $('.mod-menu .bidding').html(resp.data.bidding);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    participationTenderFunc.selectOpt = function () {
        //处理选择筛选--所有种类、所有产地
        $(".mod-menu .item li").on('click', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            participationTenderFunc.tenderList(1);
        });
    }

    /**
     *招标列表*
     **/
    participationTenderFunc.tenderList = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var loading = "loading";
        interface.collectTenderList({
                type: status,
                pageSize: 10,
                pageNum: pagenum
            }, function (resp) {
                if (resp.data.content.length > 0) {
                    $("#j_tender_list").html(template('t:j_tender_list', {list: resp.data.content, userList: user}));
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: participationTenderFunc.tenderList_pageCallback,
                        prev_text: languagePackage["上一页"],
                        next_text: languagePackage["下一页"]
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }

                    $('.item .detail .title,.item .bid-cover').on('click', function () {//点击标的标题和封面进入详情...
                        var $this = $(this);
                        var tenderId = $this.parents('.item').attr('data-tenderId');
                        var userId = $this.parents('.item').attr('data-userId');
                        var type = $this.parents('.item').attr('data-bidType');//1:供应表；2：采购标；
                        if (user && user.login && user.data.id == userId) {
                            window.open('p_bid_detail_seller.html?tenderId=' + tenderId + '&type=' + type + '&from=join');
                        } else {
                            window.open('p_bid_detail_buyer.html?tenderId=' + tenderId + '&type=' + type + '&from=join');
                        }
                    });
                    participationTenderFunc.dealwithImg();//处理图片--获取图片的宽高来添加样式
                    participationTenderFunc.opt();
                    participationTenderFunc.showCountDown();
                    participationTenderFunc.bindFollow();
                } else {
                    $("#j_tender_list").html('<div class="no-data">'+languagePackage['没有相关招标信息']+'</div>');
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading
        )
    }

    participationTenderFunc.tenderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        participationTenderFunc.tenderList(page_id + 1);
    }

    /**
     *处理图片--获取图片的宽高来添加样式*
     **/
    participationTenderFunc.dealwithImg = function () {
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

    /**
     *招标列表按钮*
     **/
    participationTenderFunc.opt = function () {
        $('.btn-sign').on('click', function () {//去签协议
        	window.open('p_contract.html?tab=1');//协议页面tab=0代表全部协议；tab=1代表待签协议；tab=2代表已签协议
//            var $this = $(this);
//            var contractId = $this.parents('.item').attr('data-contractId');
//            interface.getSignUrl({
//                id: contractId
//            }, function (resp) {
//                if (resp.code == 0) {
//                    window.open(resp.data);
//                } else {
//                    alertReturn(resp.exception);
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            }, false);
        });

        $('.btn-offer').on('click', function () {//出价
            if (user.login) {
                var $this = $(this);
                var tenderId = $this.parents('.item').attr('data-tenderId');
                var type = $this.parents('.item').attr('data-bidType');//1供给标(供方发布),2需求标(需方发布) ,
                interface.tenderDetail({
                    id: tenderId
                }, function (resp) {
                    if (resp.code == 0) {
                        //var btnStatus = 0;//按钮状态0：可以点击；1：不可以点击
                        startPrice = resp.data.reservePrice;
                        var successBuyQuantity = resp.data.successBuyQuantity ? f_double(resp.data.successBuyQuantity) : '0.00';//中标量、
                        var buyQuantity = resp.data.buyQuantity ? f_double(resp.data.buyQuantity) : '0.00';//申买量
                        var currentBuyPrice = resp.data.buyPrice ? f_double(resp.data.buyPrice) : '0';//当前出价
                        o_startPrice = resp.data.buyPrice ? f_double(resp.data.buyPrice) : resp.data.reservePrice;//当前出价
                        var buyAmountHtml;//申买数量
                        if (resp.data.buyQuantity) {
                            buyAmountHtml = '<input class="buy-amount" type="text" value="' + resp.data.buyQuantity + '"/>';
                        } else {
                            buyAmountHtml = '<input class="buy-amount" type="text"/>'
                        }

                        var operationHtml;//加减符号type:1为加号；type=2为减号
                        if (type == 1) {
                            operationHtml = '+';
                        } else if (type == 2) {
                            operationHtml = '-';
                        }

                        var competeBuyHtml;
                        if (resp.data.type == 1) {
//                            competeBuyHtml = '<input type="text" value="' + (resp.data.criticalPrice - o_startPrice) + '" id="num" />';
                        	competeBuyHtml = '<input type="text" value="0" id="num" />';
                        } else {
//                            competeBuyHtml = '<input type="text" value="' + (o_startPrice - resp.data.criticalPrice) + '" id="num" />';
                            competeBuyHtml = '<input type="text" value="0" id="num" />';
                        }
                        var minBuyQuantity = Number(commonData('MIN_BUY_QUANTITY'));//最小申买量
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
                            var content =
                                '<div class=left-time>' +
                                '<div class=bidding>'+languagePackage['竞价中']+'</div>' +
                                '<div class="w-time">' +
                                '<p class="j-endtime">' + resp.data.endTime + '</p>' +
                                '<i class="clock"></i>' +
                                '</div>' +
                                    // '<div class="line-company">供应商：' + resp.data.companyName + '</div>' +
                                    // '<div class="line-company">信誉值：' + resp.data.reputationValue + '</div>' +
                                '<div class="w-supplier fl-none">' +
                                '<p><tt>' + typeName + '：</tt><em class="em-12">' + resp.data.companyName + '</em><span class="s-credibility-' + reputationClass + '"></span></p>' +
                                '<div class="w-credibility" style="right: 0; left: auto;">' +
                                '<h4>' + resp.data.companyName + '</h4>' +
                                '<h5><tt>' + returnZhengshu(resp.data.star) + '</tt><i>' + resp.data.orderSuccessCount + languagePackage['单']+'</i></h5>' +
                                '<dl>' +
                                '<dt class="w-credibility-' + reputationClass + '"></dt>' +
                                '<dd>'+languagePackage['信誉值']+'：' + resp.data.reputationValue + '</dd>' +
                                '</dl>' +
                                '</div>' +
                                '</div>' +
                                '<a class="enter-bidding-rule" href="javascript:;">'+languagePackage['竞价规则']+'</a>' +
                                '</div>' +
                                '<div class="bid-top clearfloat">' +
                                '<h1 class="fts-14">' + resp.data.title + '</h1>' +
                                '<div class="place-water">' +
                                '<div class="place"><label>'+languagePackage['产地']+'：</label>' + resp.data.productArea + '</div>' +
                                '<div><label>'+languagePackage['扣水量']+'：</label>' + (resp.data.buckleWaterRate * 100).toFixed(1) + '%</div>' +
                                '</div>' +
                                '<div class="start-time"><p><label>'+languagePackage['出厂底价']+' </label>￥<span class="color-42">' + resp.data.reservePrice + '</span>'+languagePackage['元/吨']+'</p></div>' +
                                '<div class="a-amount">' +
                                '<p><label>'+languagePackage['竞买量']+' </label>' + resp.data.totalQuantity + ''+languagePackage['吨']+'</p>' +
                                '<p><label>'+languagePackage['申买量']+' </label>' + resp.data.totalBuyQuantity + ''+languagePackage['吨']+'</p>' +
                                '<p><label>'+languagePackage['起订量']+' </label>'+ minBuyQuantity +languagePackage['吨']+'</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="bid-bottom clearfloat">' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的出价']+'：</label><span class="color-42">' + currentBuyPrice + '</span>'+languagePackage['元/吨']+'</div>' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的申买量']+'：</label><span class="color-42">' + buyQuantity + '</span>'+languagePackage['元/吨']+'</div>' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的中标量']+'：</label><span class="color-42">' + successBuyQuantity + '</span>'+languagePackage['吨']+'</div>' +
                                '<div class="even clearfloat"><label>'+languagePackage['申买数量']+'：</label>' + buyAmountHtml + '</div>' +
                                '<div class="even clearfloat">' +
                                '<label class="vm">'+languagePackage['竞买出价']+'：</label>' +
                                '<div class="num_add_reduce clearfloat">' +
                                '<span class="start-price">' + o_startPrice + languagePackage['元/吨']+'<span>' + operationHtml + '</span></span>' +
                                '<div class="reduce"></div>' +
                                '<div class="num_inp">' + competeBuyHtml + '</div>' +
                                '<div class="add"></div>' +
                                '</div>' +
                                '<div class="m-criticalPrice"><label>'+languagePackage['当前中标底价']+'：</label>' + resp.data.criticalPrice  + languagePackage['元/吨']+'</div>' +
                                '</div>' +
                                '<div class="even clearfloat"><label>'+languagePackage['总共出价']+'：</label><span class="total-amount">' + (resp.data.buyPrice ? (Number(o_startPrice) + 5) * (Number(resp.data.buyQuantity)) : 0) + '</span>'+languagePackage['元']+'</div>' +
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
                                '<div class="bidding">'+languagePackage['竞价中']+'</div>' +
                                '<div class="w-time">' +
                                '<p class="j-endtime">' + resp.data.endTime + '</p>' +
                                '<i class="clock"></i>' +
                                '</div>' +
                                    // '<div class="line-company">采购方：' + resp.data.companyName + '</div>' +
                                    // '<div class="line-company">信誉值：' + resp.data.reputationValue + '</div>' +
                                '<div class="w-supplier fl-none">' +
                                '<p><tt>' + typeName + '：</tt><em class="em-12">' + resp.data.companyName + '</em><span class="s-credibility-' + reputationClass + '"></span></p>' +
                                '<div class="w-credibility" style="right: 0; left: auto;">' +
                                '<h4>' + resp.data.companyName + '</h4>' +
                                '<h5><tt>' + returnZhengshu(resp.data.star) + '</tt><i>' + resp.data.orderSuccessCount + languagePackage['单']+'</i></h5>' +
                                '<dl>' +
                                '<dt class="w-credibility-' + reputationClass + '"></dt>' +
                                '<dd>'+languagePackage['信誉值']+'：' + resp.data.reputationValue + '</dd>' +
                                '</dl>' +
                                '</div>' +
                                '</div>' +
                                '<a class="enter-bidding-rule" href="javascript:;">'+languagePackage['竞价规则']+'</a>' +
                                '</div>' +
                                '<div class="bid-top clearfloat">' +
                                '<h1 class="fts-14">' + resp.data.title + '</h1>' +
                                '<div class="place-water">' +
                                '<div class="place"><label>'+languagePackage['产地']+'：</label>' + resp.data.productArea + '</div>' +
                                '<div><label>'+languagePackage['扣水量']+'：</label>' + (resp.data.buckleWaterRate * 100).toFixed(1) + '%</div>' +
                                '</div>' +
                                '<div class="start-time"><p><label>'+languagePackage['出厂底价']+'：</label>￥<span class="color-42">' + resp.data.reservePrice + '</span>'+languagePackage['元/吨']+'</p></div>' +
                                '<div class="a-amount">' +
                                '<p><label>'+languagePackage['采购量']+'：</label>' + resp.data.totalQuantity + languagePackage['吨']+'</p>' +
                                '<p><label>'+languagePackage['供应量']+' </label>' + resp.data.totalBuyQuantity + languagePackage['吨']+'</p>' +
                                '<p><label>'+languagePackage['起订量']+'：</label>'+ minBuyQuantity +languagePackage['吨']+'</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="bid-bottom clearfloat">' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的出价']+'：</label><span class="color-42">' + currentBuyPrice + '</span>'+languagePackage['元/吨']+'</div>' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的供应量']+'：</label><span class="color-42">' + buyQuantity + '</span>'+languagePackage['元/吨']+'</div>' +
                                '<div class="odd clearfloat"><label>'+languagePackage['我的中标量']+'：</label><span class="color-42">' + successBuyQuantity + '</span>'+languagePackage['吨']+'</div>' +
                                '<div class="even clearfloat"><label>'+languagePackage['供应数量']+'：</label>' + buyAmountHtml + '</div>' +
                                '<div class="even clearfloat">' +
                                '<label class="vm">'+languagePackage['竞卖出价']+'：</label>' +
                                '<div class="num_add_reduce clearfloat">' +
                                '<span class="start-price">' + o_startPrice + languagePackage['元/吨']+'<span>' + operationHtml + '</span></span>' +
                                '<div class="reduce"></div>' +
                                '<div class="num_inp">' + competeBuyHtml + '</div>' +
                                '<div class="add"></div>' +
                                '</div>' +
                                '<div class="m-criticalPrice"><label>'+languagePackage['当前中标底价']+'：</label>' + resp.data.criticalPrice  + languagePackage['元/吨']+'</div>' +
                                '</div>' +
                                '<div class="even clearfloat"><label>'+languagePackage['总共出价']+'：</label><span class="total-amount">' + (resp.data.buyPrice ? (Number(o_startPrice) - 5) * (Number(resp.data.buyQuantity)) : 0) + '</span>'+languagePackage['元']+'</div>' +
                                '</div>';
                        }

                        if (type == 1) {
                            var offerBtn = "offer1";
                        } else if (type == 2) {
                            var offerBtn = "offer2";
                        }

                        var d = dialogOpt({
                            title: languagePackage['竞标出价'],
                            class: 'bid-purchase',
                            offerBtn: offerBtn,
                            content: content,
                            textOkey: languagePackage['出价'],
                            textCancel: languagePackage['取消'],
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
                                        .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity',resp.data.totalQuantity));
                                        return false;
                                    }

                                    if (resp.data.buyQuantity) {
                                        if (Number(buyPrice) <= Number(currentBuyPrice)) {
                                            alertReturn(languagePackage['出价价格必须大于当前出价']);
                                            return false;
                                        }
                                    }
                                } else {
                                    buyPrice = trim(f_double(Number(o_startPrice) - Number($('.num_inp input').val())));
                                    if (!isInteger(obuyQuantity)) {
                                        alertReturn(languagePackage['供应数量数量必须为数字且大于0']);
                                        return false;
                                    }
                                    if (Number(obuyQuantity) < minBuyQuantity || Number(obuyQuantity) > Number(resp.data.totalQuantity)) {
                                        alertReturn(languagePackage['供应数量必须在minBuyQuantity-maxBuyQuantity']
                                        .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity',resp.data.totalQuantity));
                                        return false;
                                    }
                                    if (resp.data.buyQuantity) {
                                        if (Number(buyPrice) >= Number(currentBuyPrice)) {
                                            alertReturn(languagePackage['出价价格必须小于当前出价']);
                                            return false;
                                        }
                                        if (Number(buyPrice) <= 0) {
                                            alertReturn(languagePackage['出价价格必须大于0']);
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
                                  if (resp.code == 0) {
                                    if (type == 1) {  // 1供应 2采购
                                      var currentBid = Number(o_startPrice) + Number($(".num_inp input").val());
	                                  } else if (type == 2) {
	                                      var currentBid = Number(o_startPrice) - Number($(".num_inp input").val());
	                                  }
	                                  var totalAmount = $('.total-amount').html();
	                                  d.remove();
	                                  var html1 = '<div>' +
	                                      '<h1>'+languagePackage['当前出价']+'</h1>' +
	                                      '<h2>' + currentBid + '元</h2>' +
	                                      '<p><span>'+languagePackage['申买数量']+' : ' + obuyQuantity + languagePackage['吨']+'</span><span>'+languagePackage['总共出价']+' : ' + totalAmount + languagePackage['元']+'</span></p>' +
	                                      '</div>';
	                                  var d1 = dialogOpt({
	                                      title: languagePackage['确认出价'],
	                                      class: 'widthdraw_ok',
	                                      content: html1,
	                                      textOkey: languagePackage['确认'],
	                                      textCancel: languagePackage['取消'],
	                                      funcOkey: function () {
	                                          interface.bidTender(param, function (resp) {
	                                              if (resp.code == 0) {
	                                                  alertReturn(languagePackage['出价成功']);
	                                                  if ($this.parents('.item').find('.apply-amount').length > 0) {
	                                                      $this.parents('.item').find('.apply-amount span.fts-16').html(obuyQuantity);
	                                                      $this.parents('.item').find('.success-amount span').html(resp.data);
	                                                  } else {
	                                                      $this.parents('.item').find('.purchase').append('<p class="apply-amount"><label>'+languagePackage['申买量']+'：</label><span class="color-41"><span class="fts-16">' + obuyQuantity + '</span>'+languagePackage['吨']+'</span></p><p class="success-amount"><label>'+languagePackage['中标量']+'：</label><span>' + resp.data + '</span>'+languagePackage['吨']+'</p>');
	                                                  }
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
                                  } else {
                                      alertReturn(resp.exception);
                                  }
	                              }, function (resp) {
	                                  //code = 3，只能投竞价中的标，刷新页面
	                                  if (resp.code == 3) {
	                                      alertReturn(resp.exception, function reload(){window.location.reload()})
	                                  }else{
	                                      alertReturn(resp.exception);
	                                  }
	                              });
                            }
                        });
                        participationTenderFunc.priceChange(type);
                        participationTenderFunc.inputAmount(type);

                        if (resp.data.status == 2) {
                            var endTime = $('.left-time .j-endtime').html();
                            countDown($('.left-time .j-endtime'), endTime);
                        }

                        //进入竞价规则页面
                        $(".enter-bidding-rule").on('click', function () {
                            window.open('p_bidding_rule.html');
                        });
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            } else {
                alertReturn(languagePackage['请登录']);
            }
        })
    }



    /*加减*/
    participationTenderFunc.priceChange = function (type) {
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

    /*输入申买量*/
    participationTenderFunc.inputAmount = function (type) {
        //输入申买量
        $('.buy-amount').on('input', function () {
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

        $('.num_inp input').on('input', function () {
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

    /*
     *渲染倒计时*
     **/
    participationTenderFunc.showCountDown = function () {
        $('.j-count').each(function () {
            var $this = $(this);
            var status = $this.parents(".item").attr("data-status");
            if (status == 2) {
                var endTime = $this.html();
                countDown($(this), endTime);
            }
        });
    }
    /*倒计时*/
    function countDown(el, endTime) {
        var interval = new Date(endTime - new Date().getTime());
        if (interval.getTime() <= 0) {
            window.location.reload();
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

    participationTenderFunc.template = function () {
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
    }

    //绑定关注取消关注事件
    participationTenderFunc.bindFollow = function () {
        $('.focus_on').off('click').on('click', function(){
            var _this = $(this);
            var userId = _this.attr('data-userid');
            if (_this.text() == languagePackage['关注']) {
                //关注
                interface.follow({
                    userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['取消关注']);
                        $('#j_tender_list').find('.focus_on').each(function() {
                            if (userId == $(this).attr('data-userid')) {
                                $(this).text(languagePackage['取消关注']);
                            }
                        });
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            } else if (_this.text() == languagePackage['取消关注']) {
                //取消关注
                interface.followCancel({
                    userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['关注']);
                        $('#j_tender_list').find('.focus_on').each(function() {
                            if (userId == $(this).attr('data-userid')) {
                                $(this).text(languagePackage['关注']);
                            }
                        });
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            }
        });
    }

    participationTenderFunc.init();
})
;
