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
    require('underscore-min');
    var paginations = require("pagination");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var languagePackage = null;

    /**
     *初始化一些变量*
     **/
    var user = getUser();//获取缓存登录
    var startPrice;//底价
    var currentBuyPrice;//当前出价
    var o_startPrice;//当前出价
    var tenderId = request('tenderId');//标ID
    var endTime;//倒计时结束时间
    var currentTime = new Date().getTime();//当前时间
    var from = request('from');//从那个页面进入到本页面
    var type = request('type');//标类型 1：供应标；2：采购标
    var currentHour = new Date().getHours();//当前的小时
    var contractId ;//协议ID

    var buyerFunc = {};

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
    buyerFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();

        this.initBackTitle();
        this.tab(); //tab
        //this.countsDown();//
        this.detail();//招标详情
        this.bidTenders(1, 1);//我的出价列表及当前中标列表
    }

    buyerFunc.selectLanguage = function () {
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
    buyerFunc.renderBlock = function () {
        $("#rightTab").html(template('t:rightTab'));
    }

    /**
     *从哪个页面进入到本页面*
     **/
    buyerFunc.initBackTitle = function () {
        interface.tenderDetail({id: tenderId},function (resp) {
            if(resp.code == 0){
                var titleHtml = '';
                var petrolType = request('petrolType')||"";
                if (from == 'hall'&& petrolType ==1 ) {
                    titleHtml = '<a href="javascript:void(0)">'+languagePackage['石油焦大厅']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }else if(from == 'hall'&& petrolType ==2){
                    titleHtml = '<a href="javascript:void(0)">'+languagePackage['煅后焦大厅']+'</a> &gt; <span class="color-41">'+languagePackage['竞价详情']+'</span><span class="color-9d" style="float: right">'+languagePackage['招标编号']+'：'+resp.data.tenderNum+'</span>';
                }else if(from == 'hall'&& petrolType ==3){
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
                if (from == 'hall') {
                    $('.bid-detail .title a').on('click', function () {
                        var pagenum = request('pagenum');
                        var queryType = request('queryType');
                        petrolType = request('petrolType')||"";
                        window.location.href = 'p_bid_hall.html?tenderId=' + tenderId + '&type=' + type + '&from=hall'+ '&pagenum='+ pagenum + '&queryType='+ queryType+"&petrolType="+petrolType;
                    })
                }
            }else{
                alertReturn(resp.exception);
            }

        },function (resp) {
            alertReturn(resp.exception);
        });
    }

    /**tab**/
    buyerFunc.tab = function () {
        $(".tab ul li").on('click', function () {
            $(this).addClass("current-s").siblings("li").removeClass("current-s");
            var thisHtml = $(this).html();
            switch (thisHtml) {
                case languagePackage["我的出价"]:
                    $(".myPrice").show();
                    $(".myBid").hide();
                    buyerFunc.bidTenders(1, 1);
                    break;
                case languagePackage["当前中标"]:
                    $(".myPrice").hide();
                    $(".myBid").show();
                    buyerFunc.bidTenders(1, 2);
                    break;
            }
        })
    }

    /**
     *招标详情*
     **/
    buyerFunc.detail = function () {
        interface.tenderDetail({
            id: tenderId
        }, function (resp) {
            console.log(resp);
            if (resp.code == 0) {
                startPrice = resp.data.reservePrice;//底价
                currentBuyPrice = resp.data.buyPrice ? f_double(resp.data.buyPrice) : '0';//当前出价
//                o_startPrice = resp.data.buyPrice ? f_double(resp.data.buyPrice) : resp.data.reservePrice;//当前出价
                o_startPrice = resp.data.startPrice;//起投出价
                resp.data.o_startPrice = o_startPrice;
                $("#j_bidGoods").html(template('t:j_bidGoods', {data: resp.data, type: type, user: user}));
                var p_bid_detail = require('../js/component/p_bid_detail/p_bid_detail.js');
                // p_bid_detail.helper(languagePackage);
                $("#bid_detail").html(p_bid_detail.render(resp.data,languagePackage).el);
                buyerFunc.priceChange();
                buyerFunc.inputAmount();
                buyerFunc.optBtn();
                buyerFunc.purchase(resp);
                buyerFunc.bindFollow();
                var str = $('.substring span').text();
                $('.substring span').html(str.substring(0, str.lastIndexOf('、')));//去除最后一个、
                //buyerFunc.judgeCount(resp);//倒计时判断

                if(resp.data.status == 2) {
                    var endTime = $('.count-time').html();
                    countDown($('.count-time'), endTime);
                }
                buyerFunc.dealwithImg();//处理图片
                //进入竞价规则页面
                $(".enter-bidding-rule").on('click', function () {
                    window.open('p_bidding_rule.html');
                });

                contractId = resp.data.contractId;//协议id

                //更新网页标题
                $('head title').html(resp.data.title+(isZhCN()?'-焦易网':'-GPC Market'));
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    buyerFunc.optBtn = function () {
        $('.produce .m-content,.produce .content-menu').unbind("mouseover").bind("mouseover", function () {
            if($(".m-content").html().indexOf("...") > 0){
                $('.produce .content-menu').show();
            }        }).unbind("mouseout").bind("mouseout", function () {
            $('.produce .content-menu').hide();
        });

        $('.btn-sign').on('click', function () {//去签协议
        	window.location.href = 'p_contract.html?tab=1';
        })
    }

    /**
     *加减*
     **/
    buyerFunc.priceChange = function () {
        $('.minus').on('click', function () {
            var buyAmount = $('.buy-amount').val();
            var count = parseInt($('.buyPrice').val());
            if (count > 0) {
                count -= 5;
                $('.buyPrice').val(count);
                var inputPrice = $('.buyPrice').val();
                var totalPrice;
                if (type == 1) {
                    totalPrice = Number(o_startPrice) + Number(inputPrice);
                } else if (type == 2) {
                    totalPrice = Number(o_startPrice) - Number(inputPrice);
                }
                $('.total-amount').html(f_double(totalPrice * buyAmount));
            }
        });

        $('.plus').on('click', function () {
            var buyAmount = $('.buy-amount').val();
            var count = parseInt($('.buyPrice').val());
            if(isNaN(count)){
                count =0
                $('.num_inp input').val("0");
            }
            count += 5;
            if (Number(count) >= Number(o_startPrice)) {
                return false;
            }
            $('.buyPrice').val(count);
            var inputPrice = $('.buyPrice').val();
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
    buyerFunc.inputAmount = function () {
        $('.buy-amount').on('input', function () {
            var $this = $(this);
            var buyAmount = trim($this.val());
            var inputVal = trim($this.val());
            if (!isZhengshu(inputVal)) {
                $this.val('');
                $(".total-amount").html(f_double(0.00));
            } else {
                $this.val(Number(inputVal));
                var inputPrice = $('.buyPrice').val();
                var totalPrice;
                if (type == 1) {
                    totalPrice = Number(o_startPrice) + Number(inputPrice);
                } else if (type == 2) {
                    totalPrice = Number(o_startPrice) - Number(inputPrice);
                }
                $(".total-amount").html(f_double(totalPrice * buyAmount));

            }
        });

        $('.buyPrice').on('input', function () {
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
        //for ie
        // if (document.all) {
        //     $('.buy-amount').each(function () {
        //         var $this = $(this);
        //         var buyAmount = trim($this.val());
        //         var inputVal = trim($this.val());
        //         if (this.attachEvent) {
        //             this.attachEvent('onpropertychange', function (e) {
        //                 if (e.propertyName != 'value') return;
        //                 if (!isZhengshu(inputVal)) {
        //                     $this.val('');
        //                     $(".total-amount").html(f_double(0.00));
        //                 } else {
        //                     $this.val(Number(inputVal));
        //                     var inputPrice = $('.buyPrice').val();
        //                     var totalPrice;
        //                     if (type == 1) {
        //                         totalPrice = Number(o_startPrice) + Number(inputPrice);
        //                     } else if (type == 2) {
        //                         totalPrice = Number(o_startPrice) - Number(inputPrice);
        //                     }
        //                     $(".total-amount").val(f_double(totalPrice * buyAmount));
        //                 }
        //             });
        //         }
        //     })
        // }
    }

    /**
     *出价按钮*
     **/
    buyerFunc.purchase = function (resp) {
        //var btnStatus = 0;//按钮状态0：可以点击；1：不可以点击
        $('#purchase').unbind('click').bind('click', function () {
            //if (btnStatus == 1) {
            //    return false;
            //}
            var $this = $(this);
            var buyPrice;
            var obuyQuantity = trim($('.buy-amount').val());
            var minBuyQuantity = Number(commonData('MIN_BUY_QUANTITY'));//最小申买量
            if (type == 1) {
                buyPrice = trim(f_double(Number(o_startPrice) + Number($('.buyPrice').val())));
                if (!isInteger(obuyQuantity)) {
                    alertReturn(languagePackage['申买数量必须为数字且大于0']);
                    return false;
                }
                if (Number(obuyQuantity) < minBuyQuantity || Number(obuyQuantity) > Number(resp.data.totalQuantity)) {
                    alertReturn(languagePackage['申买数量必须在minBuyQuantity-maxBuyQuantity']
                    .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity',resp.data.totalQuantity));
                    return false;
                }
                //出价必需大于等于中标最低价
                if (Number(buyPrice) < Number(o_startPrice)) {
                  alertReturn(languagePackage['出价必需大于等于中标最低价']);
                  return false;
                }
                if (resp.data.buyQuantity) {
                    if (Number(buyPrice) < Number(currentBuyPrice)) {
                        alertReturn(languagePackage['出价必需大于等于中标最低价']);
                        return false;
                    }
                    //减少标时出价不能小于等于当前出价
                    if(Number(obuyQuantity) < Number(resp.data.buyQuantity) && Number(buyPrice) <= Number(currentBuyPrice)){
                      alertReturn(languagePackage['出价价格必须大于当前出价']);
                      return false;
                    }
                }
            } else {
                buyPrice = trim(f_double(Number(o_startPrice) - Number($('.buyPrice').val())));
                if (!isInteger(obuyQuantity)) {
                    alertReturn(languagePackage['供应数量数量必须为数字且大于0']);
                    return false;
                }
                if (Number(obuyQuantity) < minBuyQuantity || Number(obuyQuantity) > Number(resp.data.totalQuantity)) {
                    alertReturn(languagePackage['供应数量必须在minBuyQuantity-maxBuyQuantity']
                    .replace('minBuyQuantity', minBuyQuantity).replace('maxBuyQuantity',resp.data.totalQuantity));
                    return false;
                }
                //出价必需小于等于中标最高价
                if (Number(buyPrice) > Number(o_startPrice)) {
                  alertReturn(languagePackage['出价必需小于等于中标最高价']);
                  return false;
                }
                if (resp.data.buyQuantity) {
                	if (Number(buyPrice) <= 0) {
                		alertReturn(languagePackage['出价价格必须大于0']);
                		return false;
                	}
                  if (Number(buyPrice) > Number(currentBuyPrice)) {
                      alertReturn(languagePackage['出价价格必须小于等于当前出价']);
                      return false;
                  }
                  //减少标时出价不能大于等于当前出价
                  if(Number(obuyQuantity) < Number(resp.data.buyQuantity) && Number(buyPrice) >= Number(currentBuyPrice)){
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
              if (resp.code == 0) {
                //确认出价
                if (type == 1) {  // 1供应 2采购
                    var currentBid = Number(o_startPrice) + Number($("input.buyPrice").val());
                } else if (type == 2) {
                    var currentBid = Number(o_startPrice) - Number($("input.buyPrice").val());
                }
                var totalAmount =$('.total-amount').html();
                var html1 = '<div>' +
                    '<h1>'+languagePackage['当前出价']+'</h1>' +
                    '<h2>'+ currentBid +languagePackage['元']+'</h2>' +
                    '<p><span>'+languagePackage['申买数量']+' : '+ obuyQuantity +languagePackage['吨']+'</span><span>'+languagePackage['总共出价']+' : '+ totalAmount +languagePackage['元']+'</span></p>' +
                    '</div>';
                var d1 = dialogOpt({
                    title: languagePackage['确认出价'],
                    class: 'widthdraw_ok',
                    content: html1,
                    textOkey: languagePackage['确认'],
                    textOkeyId: 'at_bid_db_d1_textOkeyId',
                    textCancel: languagePackage['取消'],
                    textCancelId: 'at_bid_db_d1_textCancelId',
                    closeId: 'at_bid_db_d1_closeId',
                    funcOkey: function () {
                        interface.bidTender(param, function (resp) {
                            if (resp.code == 0) {
                                alertReturn(languagePackage['出价成功']);
                                buyerFunc.detail();
                                d1.remove();
                            } else {
                                alertReturn(resp.exception);
                                //btnStatus = 0;
                                //$this.removeClass('btn-inverse').addClass('btn-primary');
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                            //btnStatus = 0;
                            //$this.removeClass('btn-inverse').addClass('btn-primary');
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
        });
    }

    /**
     *我的竞价列表*
     **/
    buyerFunc.bidTenders = function (page, tab) {
        if (user.login) {
            var pagenum;
            if (page) {
                pagenum = page;
            } else {
                pagenum = $("#pageNum1").val();
            }
            if (tab == 2) {
                interface.bidTenderList({
                    pageNum: pagenum,
                    pageSize: 10,
                    userId: user.data.id
                }, function (resp) {
                    if (resp.data.content.length > 0) {
                        $("#j_bidedList").html(template('t:j_bidedList', {list: resp.data.content}));
                        $("#pagination2").pagination(resp.data.totalElements, {
                            num_edge_entries: 1,//此属性控制省略号后面的个数
                            num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                            items_per_page: 10, // 每页显示的条目数
                            current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                            callback: buyerFunc.bidTenderList2_pageCallback,
                            prev_text: "<<",
                            next_text: ">>"
                        });
                        if (resp.data.totalPages == 1) {
                            $('#pagination2').html('');
                            $('#pageNum2').val(1);
                        }

                        $('#j_bidedList tr').hover(function () {//hover每一行，去掉三个点的样式
                            var $this = $(this);
                            $this.find('.td-title').removeClass('overflow');
                        }, function () {
                            var $this = $(this);
                            $this.find('.td-title').addClass('overflow');
                        })
                    } else {
                        $("#j_bidedList").html("<tr><td colspan='3' class='tc color-9d fts-14'>"+languagePackage['暂无出价信息']+"</td></tr>");
                        $('#pagination2').html('');
                        $('#pageNum2').val(1);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                })
            }
            if (tab == 1) {
                interface.bidTenderList({
                    pageNum: pagenum,
                    pageSize: 10,
                    tenderId: tenderId,
                    userId: user.data.id
                }, function (resp) {
                    if (resp.data.content.length > 0) {
                        $("#j_priceList").html(template('t:j_priceList', {list: resp.data.content}));
                        $("#pagination1").pagination(resp.data.totalElements, {
                            num_edge_entries: 1,//此属性控制省略号后面的个数
                            num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                            items_per_page: 10, // 每页显示的条目数
                            current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                            callback: buyerFunc.bidTenderList1_pageCallback,
                            prev_text: "<<",
                            next_text: ">>"
                        });
                        if (resp.data.totalPages == 1) {
                            $('#pagination1').html('');
                            $('#pageNum1').val(1);
                        }

                        $('#j_priceList tr').hover(function () {//hover每一行，去掉三个点的样式
                            var $this = $(this);
                            $this.find('.td-title').removeClass('overflow');
                        }, function () {
                            var $this = $(this);
                            $this.find('.td-title').addClass('overflow');
                        })
                    } else {
                        $("#j_priceList").html("<tr><td colspan='3' class='tc color-9d fts-14'>"+languagePackage['暂无竞标信息']+"</td></tr>");
                        $('#pagination1').html('');
                        $('#pageNum1').val(1);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                })
            }
        } else {
            $("#j_priceList").html("<tr><td colspan='3' class='tc color-9d fts-14'>未登录</td></tr>");
            $("#j_bidedList").html("<tr><td colspan='3' class='tc color-9d fts-14'>未登录</td></tr>");
        }
    }

    buyerFunc.bidTenderList1_pageCallback = function (page_id) {
        $("#pageNum1").val(page_id + 1);
        buyerFunc.bidTenders(page_id + 1);
    }

    buyerFunc.bidTenderList2_pageCallback = function (page_id) {
        $("#pageNum2").val(page_id + 1, 1);
        buyerFunc.bidTenders(page_id + 1, 2);
    }


    /**
     *标的倒计时--获取endTime *
     **/
    //buyerFunc.countsDown = function () {
    //    var commonType;
    //    if (type == 1) {
    //        commonType = 'BID_TENDER_TIME';
    //    } else if (type == 2) {
    //        commonType = 'BID_TENDER_TIME_DEMAND';
    //    }
    //    interface.commonData({
    //        type: commonType
    //    }, function (resp) {
    //        if (resp.code == 0) {
    //            var array = resp.data.split(',');
    //            if (Number(currentTime) >= Number(array[0] + '000') && Number(currentTime) <= Number(array[1] + '000')) {
    //                endTime = array[1] + '000';
    //            } else if (Number(currentTime) >= Number(array[2] + '000') && Number(currentTime) <= Number(array[3] + '000')) {
    //                endTime = array[3] + '000';
    //            } else if (Number(currentTime) >= Number(array[1] + '000') && Number(currentTime) <= Number(array[2] + '000')) {
    //                endTime = array[2] + '000';
    //            } else if (Number(currentTime) < Number(array[0] + '000')) {
    //                endTime = array[0] + '000';
    //            }
    //            buyerFunc.detail();
    //        } else {
    //            alertReturn(resp.exception);
    //        }
    //    }, function (resp) {
    //        alertReturn(resp.exception);
    //    })
    //}


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
     *倒计时*
     **/
    //function countDown(el, endTime, text) {
    //    var interval = new Date(endTime - (new Date()).getTime());
    //    if (interval.getTime() < 0) {
    //        el.hide();
    //        el.siblings('.block').hide();
    //        el.siblings('p').html(text);
    //        //buyerFunc.detail();
    //        return false;
    //    } else {
    //        var h = Math.floor(interval / 1000 / 60 / 60 % 24);
    //        var m = Math.floor(interval / 1000 / 60 % 60);
    //        var s = Math.floor(interval / 1000 % 60);
    //        if (m < 10) {
    //            m = '0' + m;
    //        }
    //        if (s < 10) {
    //            s = '0' + s;
    //        }
    //        el.text(h + '：' + m + '：' + s);
    //        setTimeout(function () {
    //            countDown(el, parseInt(endTime), text);
    //        }, 1000);
    //    }
    //}

    /**
     *处理图片--获取图片的宽高来添加样式*
     **/
    buyerFunc.dealwithImg = function () {
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



    buyerFunc.template = function(){
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
        template.helper('returnZhengshu',function(obj){
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
    buyerFunc.bindFollow = function () {
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

    buyerFunc.init();
});
