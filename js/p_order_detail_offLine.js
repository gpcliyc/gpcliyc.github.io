/**
 * Created by like on 2017/5/11.
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var previewImages = require('preViewImages');
    var http = require("http");
    var My97DatePicker = require('My97DatePicker');
    require("interface");
    require("pagination");
    var global = require("global");
    var header = require("header");
    var contractJs = require('../js/p_contract.js').contractListFunc;
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require("floatTool");
    require('zic');
    require('bootstrap');
    /**
     *初始化部分变量*
     **/
    var user = getUser();
    var orderId = request('orderId');
    var singlePrice;//单价
    var buckleWaterRate;//扣水量
    var invoice_title = '';//订单发票
    var invoice_detail_html = '';
    var UploadIdentity = new UploadPic();
    var orderDetalFunc = {};
    var imgsObj = [];
    var tempImgsObj = [];
    var numberPatt = /^\d+(\.\d+)?$/;//判断小数或者整数的正则
    var languagePackage = null;
    /**
     *初始化*
     **/
    orderDetalFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.detail();//订单详情

    }
    orderDetalFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_orderNational/p_order.json',function (resp) {
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
    orderDetalFunc.renderBlock = function () {
        $("#j_orderDetailTitle").html(template('t:j_orderDetailTitle'));
        $("#j_blockInvoice").html(template('t:j_blockInvoice'));


    }
    /**
     *订单详情部分*
     **/
    orderDetalFunc.detail = function () {
        interface.orderDetail({
            orderId: orderId
        }, function (resp) {
            if (resp.code == 0) {
                var data = resp.data;
                singlePrice = data.buyPrice;//单价
                buckleWaterRate = data.tenderBean.buckleWaterRate;//扣水量
                orderDetalFunc.detailLeft(data);
                orderDetalFunc.detailRight(data);
                orderDetalFunc.detailMiddle(data);
                orderDetalFunc.detailBottom(data);
              	orderDetalFunc.detailNotice(data);
                orderDetalFunc.bindEvent(data);
                //存在发票则显示
                if(data.invoiceBean){
                    //type类型:1增值税发票,2普通发票
                    if(data.invoiceBean.type==1){
                        $(".invoice_title").html(languagePackage["增值税发票"]+" "+ data.invoiceBean.companyName);
                        $('.invoice_detail').removeClass('hide');
                    }else{
                        $(".invoice_title").html(languagePackage["普通发票"]+" " + data.invoiceBean.invoiceTitle);
                    }
                    $('.block_invoice').removeClass('hide');
                    orderDetalFunc.detailInvoice(data);
                }
                var appentStr = orderDetalFunc.dealMoney(data);
                $('.block-detail').append(appentStr);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }
    //查看缩略图
    orderDetalFunc.checkthumbnail = function (e) {
        interface.queryCertificate({
            orderId: orderId
        }, function (resp) {
            var imgsArr = resp.data.imgs;
            var imgStrArr = [], currentImg ;
            for (var i = 0; i < imgsArr.length; i++) {
                imgStrArr.push(imgsArr[i].imgSrc ) ;
            }
            previewImages.render({
                imgArr:imgStrArr,
                thiselement:$(e.currentTarget),
                showPre:true
            });
         }, function (err) {
            alertReturn(err.exception);
        });
    };
    orderDetalFunc.bindEvent = function (data, flag) {
        $(".order-detail").find('button').unbind().bind('click', function () {
            var btn = trim($(this).attr('id'));
            switch (btn) {
                case "checking":
                    orderDetalFunc.checkingGoodsInfo(data);
                    break;
                case "over":
                    orderDetalFunc.checkedGoodsInfo(data);
                    break;
                case "pass":
                    orderDetalFunc.passGoodsInfo(data);
                    break;
                case "ok":
                    orderDetalFunc.confirmGoodsInfo(data);
                    break;
                case "confirm":
                    orderDetalFunc.confirmShipments(data);
                    orderDetalFunc.inputBind();
                    break;
                case "checkCertificate":
                    orderDetalFunc.passGoodsInfo(data);
                    break;
                case "evaluate1":
                case "evaluate2":
                    evaluateDialog(orderId,false,languagePackage);
                break;
                case "checkEvaluate1":
                case "checkEvaluate2":
                    evaluateDialog(orderId,true,languagePackage);
                    break;
            }
        })
    };
    orderDetalFunc.inputBind = function () {
        $("#p_order_realQuan").bind('keyup change',function (e) {
            var $this = $(this);
            var tonne_price= Number(trim($("#order_tonne_price").attr("singlebag")));
            var realQuan = trim($this.val());
            if(realQuan&&realQuan.length>0){
                if(numberPatt.test(realQuan)){
                    if (realQuan.indexOf('.') > 0 && realQuan.toString().split(".")[1].length > 3) {
                        $this.siblings('.error').html(languagePackage['*本次实际提货量最多有三位小数']);
                        $this.addClass('red');
                        $("#p_order_realSumPrice").val('');
                    }else{
                        $this.siblings('.error').html('');
                        $this.removeClass('red');
                        if($("#single_tonne_price").hasClass("red")){
                            $("#p_order_realSumPrice").val('');
                        }else{
                            var realPrice = trim($("#single_tonne_price").val());
                            if(realPrice.length>0){
                                var sumPrice  = floatTool.multiply(Number(realQuan),Number(realPrice));
                                sumPrice = floatTool.toFixed(sumPrice,2);
                                $("#p_order_realSumPrice").val(sumPrice);
                                if(!$(".tonne_content").hasClass("hide")){
                                    var tonne_price_sum = floatTool.multiply(tonne_price,Number(realQuan),'multiply');
                                    $("#order_tonne_price").val(tonne_price_sum);
                                    var sumNumber = parseFloat(Number(tonne_price_sum)+Number(sumPrice));
                                    $(".sum_price_content .sum_price").html(formatCurrency(sumNumber));
                                }else{
                                    $(".sum_price_content .sum_price").html(formatCurrency(sumPrice));
                                }
                            }
                        }
                    }
                }else{
                    $this.siblings('.error').html('*'+languagePackage['请输入正确数字']);
                    $this.addClass('red');
                    $("#p_order_realSumPrice").val('');
                }
            }else{
                $this.siblings('.error').html('');
                $this.removeClass('red');
                $("#p_order_realSumPrice").val('');
                if(!$(".tonne_content ").hasClass("hide")){
                    $(".sum_price_content .sum_price").html(formatCurrency(tonne_price));
                }else{
                    $(".sum_price_content .sum_price").html(formatCurrency(0));
                }
            }
        })
        $("#single_tonne_price").bind('keyup change',function (e) {
            var $this = $(this);
            var tonne_price= Number(trim($("#order_tonne_price").attr("singlebag")));
            var realPrice = trim($this.val());
            if(realPrice&&realPrice.length>0){
                if(numberPatt.test(realPrice)){
                    if (realPrice.indexOf('.') > 0 && realPrice.toString().split(".")[1].length > 2) {
                        $this.siblings('.error').html('*'+languagePackage['本次实际发货单价最多有二位小数']);
                        $this.addClass('red');
                        $("#p_order_realSumPrice").val('');
                    }else{
                        $this.siblings('.error').html('');
                        $this.removeClass('red');
                        if($("#p_order_realQuan").hasClass("red")){
                            $("#p_order_realSumPrice").val('');
                        }else{
                            var realQuan = trim($("#p_order_realQuan").val());
                            if(realQuan.length>0){
                                var sumPrice  = floatTool.multiply(Number(realQuan),Number(realPrice));
                                sumPrice = floatTool.toFixed(sumPrice,2);
                                $("#p_order_realSumPrice").val(sumPrice);
                                if(!$(".tonne_content ").hasClass("hide")){
                                    var tonne_price_sum = floatTool.multiply(tonne_price,Number(sumPrice),'multiply');
                                    var sumNumber = parseFloat(Number(tonne_price_sum) +Number(sumPrice));
                                    $(".sum_price_content .sum_price").html(formatCurrency(sumNumber));
                                }else{
                                    $(".sum_price_content .sum_price").html(formatCurrency(sumPrice));
                                }
                            }
                        }
                    }
                }else{
                    $this.siblings('.error').html('*'+languagePackage['请输入正确数字']);
                    $this.addClass('red');
                    $("#p_order_realSumPrice").val('');
                    if(!$(".tonne_content").hasClass("hide")){
                        $(".sum_price_content .sum_price").html(formatCurrency(tonne_price));
                    }else{
                        $(".sum_price_content .sum_price").html(formatCurrency(0));
                    }
                }
            }else{
                $this.siblings('.error').html('');
                $this.removeClass('red');
                $("#p_order_realSumPrice").val('');
            }
        })
        $(".p_order_container .edit_single_price").on("click",function () {
            var $this = $(this);
            $("#single_tonne_price").attr("disabled",false);
            $this.addClass("hide");
        })
    }
    orderDetalFunc.confirmShipments = function (data) {
        var bagamount = data.bagAmount;
        var sumQuantity  = data.quantity;
        var singleBag = floatTool.divide(Number(bagamount),Number(sumQuantity),'divide');
        singleBag = floatTool.toFixed(singleBag,3);
        var isHideStr = '';
        if(bagamount>0){
            isHideStr = '';
        }else{
            isHideStr = 'hide';
        }
        // var html = '<div class="p_order_container">' +
        //     '<h5 class="fts-14 color-9d p_order_real_title">请根据双方签署协议的总中标量，填写本次实际的总交易量。如实际中标单价与发货单价不同，请及时修改。</h5>' +
        //     '<div class="container_list"><label class="fts-14">实际发货量：</label><input type="text" class="p_order_input" data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="p_order_realQuan" placeholder="请输入实际发货量"><span class="unit">吨</span><span class="error"></span></div>' +
        //     '<div class="container_list"><label class="fts-14">实际发货单价：</label><input type="text" class="p_order_input " data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="single_tonne_price" value="'+data.buyPrice +'" disabled="disabled" ><span class="unit">元/吨</span><span class="edit_single_price">修改单价</span><span class="error"></span></div>'+
        //     '<div class="container_list"><label class="fts-14">实际发货总额：</label><input type="text" class="p_order_input" id="p_order_realSumPrice" disabled="disabled"><span class="unit">元</span></div>' +
        //     '<div class="container_list tonne_content  '+isHideStr+'"><label class="fts-14 ">吨袋总额：</label><input type="text" class="p_order_input " id="order_tonne_price" disabled="disabled"  singleBag="'+singleBag+'"><span class="unit">元</span><span class="error"></span></div>' +
        //     ' <div class="sum_price_content"><h1>总计：<span class="sum_price">0.00</span>元</h1></div></div>';
        var html = '<div class="p_order_container">' +
            '<h5 class="fts-14 color-9d p_order_real_title">'+languagePackage['请根据双方签署协议的总中标量，填写本次实际的总交易量。如实际中标单价与发货单价不同，请及时修改。']+'</h5>' +
            '<div class="container_list"><label class="fts-14">'+languagePackage['实际发货量']+'：</label>' +
            '<input type="text" class="p_order_input" data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="p_order_realQuan" placeholder="'+languagePackage['请输入实际发货量']+'">' +
            '<span class="unit">'+languagePackage['吨']+'</span><span class="error"></span></div>' +
            '<div class="container_list"><label class="fts-14">'+languagePackage['实际发货单价']+'：</label>' +
            '<input type="text" class="p_order_input " data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="single_tonne_price" value="'+data.buyPrice +'" disabled="disabled" >' +
            '<span class="unit">'+languagePackage['元/吨']+'</span><span class="edit_single_price" id="at_odo_ep" name="at_odo_ep">'+languagePackage['修改单价']+'</span><span class="error"></span></div>'+
            '<div class="container_list"><label class="fts-14">'+languagePackage['实际发货总额']+'：</label>' +
            '<input type="text" class="p_order_input" id="p_order_realSumPrice" disabled="disabled"><span class="unit">'+languagePackage['元']+'</span></div>' +
            '<div class="container_list tonne_content  '+isHideStr+'"><label class="fts-14 ">'+languagePackage['吨袋总额']+'：</label>' +
            '<input type="text" class="p_order_input " id="order_tonne_price" disabled="disabled"  singleBag="'+singleBag+'"><span class="unit">'+languagePackage['元']+'</span><span class="error"></span></div>' +
            ' <div class="sum_price_content"><h1>'+languagePackage['总计']+'：<span class="sum_price">0.00</span>'+languagePackage['元']+'</h1></div></div>';

        var d1 = dialogOpt({
            title: languagePackage['确认发货'],
            class: 'dialogOpt_common',
            content: html,
            textOkey: languagePackage['提交'],
            textOkeyId: 'at_odo_textOkeyId',
            textCancel: languagePackage['取消'],
            textCancelId: 'at_odo_textCancelId',
            closeId: 'at_odo_closeId',
            btn: 'btn2',
            funcOkey: function () {
                var empty = 0;
                var realQuan = trim($("#p_order_realQuan").val());
                var realPrice =trim($("#single_tonne_price").val());
                if(realQuan.length<1){
                    $("#p_order_realQuan").siblings('.error').html(languagePackage['请填写本次实际提货量']);
                    $("#p_order_realQuan").addClass('red');
                    empty =1;
                }
                if(realPrice.length<1){
                    $("#single_tonne_price").siblings('.error').html(languagePackage['请填写实际发货单价']);
                    $("#single_tonne_price").addClass('red');
                    empty =1;
                }
                if($("#p_order_realQuan").hasClass("red")||$("#single_tonne_price").hasClass("red")){
                    empty =1;
                }
                if(empty ==1){
                    alertReturn(languagePackage['填写信息有误']);
                    return false;
                }
                var params = {
                    id: $("#p_order_realQuan").attr('data-id'),
                    quantity: realQuan,
                    realPrice :realPrice
                };
                interface.offlineDelivery(params, function (resp) {
                    if (resp.code === 0) {
                        d1.remove();
                        // window.location.reload();
                        alertReturn(languagePackage['发货成功，等待买家验收。']);
                        orderDetalFunc.init();
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (err) {
                    alertReturn(err.exception);
                });

            }
        });
        $("#p_order_realSumOrder").unbind().bind('keyup change', function (e) {
            var sumOrder = $('#p_order_realSumOrder').val().trim();
            var orderNum = $(e.currentTarget).attr('data-orderNum');
            if ($.isNumeric(sumOrder)) {
                var buyPrice = data.buyPrice,
                    count = parseFloat(buyPrice * sumOrder);
                    count = floatTool.toFixed(count,2);
                $("#p_order_realSumPrice").val(count);
            } else {
                $("#p_order_realSumPrice").val(0);
            }
        })
    }
    //确认收货
    orderDetalFunc.confirmGoodsInfo = function (data) {
        var params = {
            orderId: orderId
        }
        var bagAmount = data.bagAmount;
        var SingleBagAmount = Number(bagAmount)/Number(data.quantity);
        var SumBagAmount = SingleBagAmount*Number(data.finishQuantity);
        var sumPrice = formatCurrency(Number(SumBagAmount)+Number(data.finishPrice));
        var isExist = '';
        if(bagAmount>0){
            isExist = '';
        }else{
            isExist = 'hide'
        }
        interface.queryCertificate(params, function (resp) {
            var tempImgsObj = [];
            var imgsHtml = "";
            if (resp.code === 0 && resp.data) {
                tempImgsObj = resp.data.imgs;
            }
            for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                imgsHtml += '<div class="png-box" >' +
                    '<div class="img-wrap"><i class="offLineClose" title="删除" ></i><img  src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
            // var html = '<div class="offLine_gain_goods"><h5 class="fts-14 color-9d" style="margin-top: 20px">提货信息</h5>' +
            //     '<p class="fts-14">' +
            //     '<label>实际提货量：</label>' +
            //     '<span><em>' + fmoney(data.finishQuantity,3) + '</em>吨<span>（单价：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>元/吨）</span></span>' +
            //     '</p>' +
            //     '<p class="fts-14">' +
            //     ' <label>实际提货金额：</label>' +
            //     '<span >' + formatCurrency(data.finishPrice) + '元</span>' +
            //     '<span class="'+isExist+'"><label class="pl_30">吨袋总额：</label>' +
            //     '<span >' + formatCurrency(SumBagAmount) + '元</span></span>'+
            //     '</p>' +
            //     '<p class="fts-14 border_bottom"><span>总计：<span class="offLine_sumPrice">'+sumPrice+'</span>元</span></p>'+
            //     '<p><span class="fts-14 color-9d">交易凭证</span> <span class="fts-14 color-9d">（请上传本次订单所收款项的发票或相关提货单，平台将对本次订单进行有效审核）</span></p>' +
            //     '<dl class="clearfloat">' +
            //     '<dt><span class="color-red"></span></dt>' +
            //     '<dd>' +
            //     '<div style="position:relative;">' +
            //     '<button  id="uploadIdentity" class="offLineBtn">+上传交易凭证</button>' +
            //     '<input id="img_input" class="img_input" type="file" multiple="multiple" accept="image/*">' +
            //     '</div>' +
            //     '</dd>' +
            //     '</dl>' +
            //     '<div id="imgWrap">' + imgsHtml +
            //     '</div></div>';
            var html = '<div class="offLine_gain_goods '+languagePackage['offLine-goods-transaction']+'"><h5 class="fts-14 color-9d" style="margin-top: 20px">'+languagePackage['提货信息']+'</h5>' +
                '<p class="fts-14">' +
                '<label>'+languagePackage['实际提货量']+'：</label>' +
                '<span><em>' + formatCurrency(data.finishQuantity) + '</em>'+languagePackage['吨']+'<span>（'+languagePackage['单价']+'：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>'+languagePackage['元/吨']+'）</span></span>' +
                '</p>' +
                '<p class="fts-14">' +
                ' <label>'+languagePackage['实际提货金额']+'：</label>' +
                '<span >' + formatCurrency(data.finishPrice) + languagePackage['元']+'</span>' +
                '<span class="'+isExist+'"><label class="pl_30">'+languagePackage['吨袋总额']+'：</label>' +
                '<span >' + formatCurrency(SumBagAmount) + languagePackage['元']+'</span></span>'+
                '</p>' +
                '<p class="fts-14 border_bottom"><span>'+languagePackage['总计']+'：<span class="offLine_sumPrice">'+sumPrice+'</span>'+languagePackage['元']+'</span></p>'+
                '<p><span class="fts-14 color-9d">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-9d">（'+languagePackage['请上传本次订单所收款项的发票或相关提货单，平台将对本次订单进行有效审核']+'）</span></p>' +
                '<dl class="clearfloat">' +
                '<dt><span class="color-red"></span></dt>' +
                '<dd>' +
                '<div style="position:relative;">' +
                '<button  id="uploadIdentity" class="offLineBtn">+'+languagePackage['上传交易凭证']+'</button>' +
                '<input id="img_input" class="img_input" type="file" multiple="multiple" accept="image/*">' +
                '</div>' +
                '</dd>' +
                '</dl>' +
                '<div id="imgWrap">' + imgsHtml +
                '</div></div>';
            var d = dialogOpt({
                title: languagePackage['确认收货'],
                class: 'alert_orderConfirm',
                content: html,
                textOkey: languagePackage['提交'],
                textOkeyId: 'at_odo_qrshokid',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_odo_qrshccid',
                closeId: 'at_odo_qrshcoid',
                funcOkey: function () {
                    var idArr = [];
                    var $imgs = $("#imgWrap").find('.img-wrap img');
                    $.each($imgs, function (index, item) {
                        idArr.push($(item).attr('data-id'));
                    })
                    var params = {
                        id: orderId,
                        imgids: idArr.toString() || ""
                    };
                    interface.submitCertificate(params, function (resp) {
                        if (resp.code === 0) {
                            d.remove();
                            alertReturn(languagePackage['提交成功,等待平台审核交易凭证!']);
                            orderDetalFunc.uploadOneMore(data);
                        }
                    }, function (err) {
                        alertReturn(languagePackage['提交失败']);
                    });
                }
            });
            $('#imgWrap').delegate('.offLineClose', 'click', function (e) {
                $(e.currentTarget).parents('.png-box').remove();
            });
            // $('#imgWrap img').unbind().bind('click', function (e) {
            //     var imgSrc = $(e.currentTarget).attr('src');
            //     orderDetalFunc.checkthumbnail(e);
            // })
            orderDetalFunc.uploadIdentity();
        }, function (err) {
        });
    }
    //凭证审核中
    orderDetalFunc.checkingGoodsInfo = function (data) {
        this.uploadOneMore(data);

    };
    //凭证未通过
    orderDetalFunc.checkedGoodsInfo = function (data) {
        var params = {
            orderId: orderId
        }
        var bagAmount = data.bagAmount;
        var SingleBagAmount = Number(bagAmount)/Number(data.quantity);
        var SumBagAmount = SingleBagAmount*Number(data.finishQuantity);
        var sumPrice = formatCurrency(Number(SumBagAmount)+Number(data.finishPrice));
        var isExist = '';
        if(bagAmount>0){
            isExist = '';
        }else{
            isExist = 'hide'
        }
        interface.queryCertificate(params, function (resp) {
            var tempImgsObj = [];
            var imgsHtml = "";
            if (resp.code === 0 && resp.data) {
                tempImgsObj = resp.data.imgs;
            }
            for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                imgsHtml += '<div class="png-box" >' +
                    '<div class="img-wrap"><img class="cursor"  src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
            // var html = '<h5 class="fts-16 color-9d" style="margin-top: 20px">提货信息</h5>' +
            //     '<p class="fts-16">' +
            //     '<label>实际提货量</label>' +
            //     '<span><em>' + fmoney(data.finishQuantity,3) + '</em>吨</span>' +
            //     '</p>' +
            //     '<p class="fts-16 border_bottom">' +
            //     ' <label>实际提货金额</label>' +
            //     '<span>' + data.finishPrice + '元</span>' +
            //     '</p>' +
            //     '<p class="color-9d"><span class="fts-16">交易凭证</span> <span class="fts-14 color-red">（审核未通过）</span></p>' +
            //     '<p class="color-9d"><span class="fts-14 color-9d">备注：' + resp.data.remark + '</span></p>' +
            //     '<dl class="clearfloat">' +
            //     '<dt><span class="color-red"></span></dt>' +
            //     '<dd>' +
            //     '<div style="position:relative;">' +
            //     '</div>' +
            //     '</dd>' +
            //     '</dl>' +
            //     '<div id="imgWrap">' + imgsHtml +
            //     '</div>';
            var html = '<h5 class="fts-16 color-9d" style="margin-top: 20px">'+languagePackage['提货信息']+'</h5>' +
                '<p class="fts-14">' +
                '<span>'+languagePackage['实际提货量']+':</span>' +
                '<span ><em>' + fmoney(data.finishQuantity,3) + '</em>'+languagePackage['吨']+'</span>' +
                '</p>' +
                '<p class="fts-16 border_bottom">' +
                ' <span>'+languagePackage['实际提货金额']+':</span>' +
                '<span >' + data.finishPrice + languagePackage['元']+'</span>' +
                '</p>' +
                '<p class="color-9d"><span class="fts-16">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-red">（'+languagePackage['审核未通过']+'）</span></p>' +
                '<p class="color-9d"><span class="fts-14 color-9d">'+languagePackage['备注']+'：' + resp.data.remark + '</span></p>' +
                '<dl class="clearfloat">' +
                '<dt><span class="color-red"></span></dt>' +
                '<dd>' +
                '<div style="position:relative;">' +
                '</div>' +
                '</dd>' +
                '</dl>' +
                '<div id="imgWrap">' + imgsHtml +
                '</div>';
            var textOkey = data.orderType === 1 ? "" : languagePackage["重新上传"];
            var d = dialogOpt({
                title: languagePackage['确认收货'],
                class: 'alert_orderConfirm',
                content: html,
                textOkey: textOkey,
                textOkeyId: 'at_odo_cxscokid',
                textCancel: languagePackage['关闭'],
                textCancelId: 'at_odo_cxscccid',
                closeId: 'at_odo_closeid',
                funcOkey: function () {
                    d.remove();
                    orderDetalFunc.confirmGoodsInfo(data);
                }
            })
 $('#imgWrap img').unbind().bind('click', function (e) {
                var imgSrc = $(e.currentTarget).attr('src');
                orderDetalFunc.checkthumbnail(e);
            })

        }, function (err) {

        });
    };
    //获取剩余时间
    orderDetalFunc.getLeftTime = function (createTime) {
        var hour,
            min,
            leftTime = (24 - (new Date().getTime() - createTime) / (1000 * 60 * 60)).toString();
        hour = leftTime.split('.')[0];
        min = (parseFloat('0.' + leftTime.split('.')[1]) * 60).toFixed(0);
        return {
            hour: hour,
            min: min
        }
    }
    //凭证已经通过
    orderDetalFunc.passGoodsInfo = function (data) {
        var params = {
            orderId: orderId
        }
        var bagAmount = data.bagAmount;
        var SingleBagAmount = Number(bagAmount)/Number(data.quantity);
        var SumBagAmount = SingleBagAmount*Number(data.finishQuantity);
        var sumPrice = formatCurrency(Number(SumBagAmount)+Number(data.finishPrice));
        var isExist = '';
        if(bagAmount>0){
            isExist = '';
        }else{
            isExist = 'hide'
        }
        interface.queryCertificate(params, function (resp) {
            var tempImgsObj = [];
            var imgsHtml = "";
            if (resp.code === 0 && resp.data) {
                tempImgsObj = resp.data.imgs;
            }
            for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                imgsHtml += '<div class="png-box" >' +
                    '<div class="img-wrap"><img  class="cursor" src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
            // var html = '<div class="offLine_gain_goods"><h5 class="fts-14 color-9d" style="margin-top: 20px">提货信息</h5>' +
            //     '<p class="fts-14">' +
            //     '<label>实际提货量：</label>' +
            //     '<span><em>' + fmoney(data.finishQuantity,3) + '</em>吨<span>（单价：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>元/吨）</span></span>' +
            //     '</p>' +
            //     '<p class="fts-14">' +
            //     ' <label>实际提货金额：</label>' +
            //     '<span >' + formatCurrency(data.finishPrice) + '元</span>' +
            //     '<span class="'+isExist+'"><label class="pl_30">吨袋总额：</label>' +
            //     '<span >' + formatCurrency(SumBagAmount) + '元</span></span>'+
            //     '</p>' +
            //     '<p class="fts-14 border_bottom"><span>总计：<span class="offLine_sumPrice">'+sumPrice+'</span>元</span></p>'+
            //     '<p><span class="fts-16">交易凭证</span> <span class="fts-14 color-审核未通过41" >（审核通过）</span></p>' +
            //     '<dl class="clearfloat">' +
            //     '<dt><span class="color-red"></span></dt>' +
            //     '</dl>' +
            //     '<div id="imgWrap">' + imgsHtml +
            //     '</div></div>';
            //
            var html = '<div class="offLine_gain_goods"><h5 class="fts-14 color-9d" style="margin-top: 20px">'+languagePackage['提货信息']+'</h5>' +
                '<p class="fts-14">' +
                '<label>'+languagePackage['实际提货量']+'：</label>' +
                '<span><em>' + formatCurrency(data.finishQuantity) + '</em>'+languagePackage['吨']+'<span>（'+languagePackage['单价']+'：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>'+languagePackage['元/吨']+'）</span></span>' +
                '</p>' +
                '<p class="fts-14">' +
                ' <label>'+languagePackage['实际提货金额']+'：</label>' +
                '<span >' + formatCurrency(data.finishPrice) + languagePackage['元']+'</span>' +
                '<span class="'+isExist+'"><label class="pl_30">'+languagePackage['吨袋总额']+'：</label>' +
                '<span >' + formatCurrency(SumBagAmount) + languagePackage['元']+'</span></span>'+
                '</p>' +
                '<p class="fts-14 border_bottom"><span>'+languagePackage['总计']+'：<span class="offLine_sumPrice">'+sumPrice+'</span>'+languagePackage['元']+'</span></p>'+
                '<p><span class="fts-16">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-审核未通过41" >（'+languagePackage['审核通过']+'）</span></p>' +
                '<dl class="clearfloat">' +
                '<dt><span class="color-red"></span></dt>' +
                '</dl>' +
                '<div id="imgWrap">' + imgsHtml +
                '</div></div>';
            var d = dialogOpt({
                title: languagePackage['确认收货'],
                class: 'alert_orderConfirm',
                content: html,
                textCancel: languagePackage['关闭']
            });
            $('#imgWrap img').unbind().bind('click', function (e) {
                var imgSrc = $(e.currentTarget).attr('src');
                orderDetalFunc.checkthumbnail(e);
            })
        }, function (err) {
            alertReturn(err.exception);
        });
    }

    /**
     **重新上传
     **/
    orderDetalFunc.uploadOneMore = function (data) {
        var bagAmount = data.bagAmount;
        var SingleBagAmount = Number(bagAmount)/Number(data.quantity);
        var SumBagAmount = SingleBagAmount*Number(data.finishQuantity);
        var sumPrice = formatCurrency(Number(SumBagAmount)+Number(data.finishPrice));
        var isExist = '';
        if(bagAmount>0){
            isExist = '';
        }else{
            isExist = 'hide'
        }
        interface.queryCertificate({
            orderId: orderId
        }, function (resp) {
            var tempImgsObj = [];
            if (resp.code === 0 && resp.data) {
                tempImgsObj = resp.data.imgs;
            }
            var leftTime = orderDetalFunc.getLeftTime(resp.data.createTime),
                // leftTimeStr = leftTime.hour > 0 ? "剩余" + leftTime.hour + "小时" + leftTime.min + "分钟" : "剩余" + leftTime.min + "分钟",
                leftTimeStr = leftTime.hour > 0 ? languagePackage["剩余"] + leftTime.hour + languagePackage["小时"] + leftTime.min + languagePackage["分钟"] : languagePackage["剩余"] + leftTime.min + languagePackage["分钟"],

                imgsHtml = "";
            for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                imgsHtml += '<div class="png-box" >' +
                    '<div class="img-wrap" ><img  class="cursor" src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
            // var html = '<div class="offLine_gain_goods"><h5 class="fts-14 color-9d" style="margin-top: 20px">提货信息</h5>' +
            //     '<p class="fts-14">' +
            //     '<label>实际提货量：</label>' +
            //     '<span><em>' + fmoney(data.finishQuantity,3) + '</em>吨<span>（单价：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>元/吨）</span></span>' +
            //     '</p>' +
            //     '<p class="fts-14">' +
            //     ' <label>实际提货金额：</label>' +
            //     '<span >' + formatCurrency(data.finishPrice) + '元</span>' +
            //     '<span class="'+isExist+'"><label class="pl_30">吨袋总额：</label>' +
            //     '<span >' + formatCurrency(SumBagAmount) + '元</span></span>'+
            //     '</p>' +
            //     '<p class="fts-14 border_bottom"><span>总计：<span class="offLine_sumPrice">'+sumPrice+'</span>元</span></p>'+
            //     '<p class="color-9d"><span class="fts-14 ">交易凭证</span> <span class="fts-14 color-41">（审核中' + '<span class="color-9d fts-12">' + leftTimeStr + '</span>' + '）</span><span></span></p>' +
            //     '<dl class="clearfloat">' +
            //     '<dt><span class="color-red"></span></dt>' +
            //     '</dl>' +
            //     '<div id="imgWrap">' + imgsHtml +
            //     '</div></div>';
            var html = '<div class="offLine_gain_goods"><h5 class="fts-14 color-9d" style="margin-top: 20px">'+languagePackage['提货信息']+'</h5>' +
                '<p class="fts-14">' +
                '<label>'+languagePackage['实际提货量']+'：</label>' +
                '<span><em>' + fmoney(data.finishQuantity,3) + '</em>'+languagePackage['吨']+'<span>（'+languagePackage['单价']+'：<em>'+formatCurrency(data.finishPrice/data.finishQuantity)+'</em>'+languagePackage['元/吨']+'）</span></span>' +
                '</p>' +
                '<p class="fts-14">' +
                ' <label>'+languagePackage['实际提货金额']+'：</label>' +
                '<span >' + formatCurrency(data.finishPrice) + languagePackage['元']+'</span>' +
                '<span class="'+isExist+'"><label class="pl_30">'+languagePackage['吨袋总额']+'：</label>' +
                '<span >' + formatCurrency(SumBagAmount) + languagePackage['元']+'</span></span>'+
                '</p>' +
                '<p class="fts-14 border_bottom"><span>'+languagePackage['总计']+'：<span class="offLine_sumPrice">'+sumPrice+'</span>'+languagePackage['元']+'</span></p>'+
                '<p class="color-9d"><span class="fts-14 ">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-41">（'+languagePackage['审核中'] +' '+ '<span class="color-9d fts-12">' + leftTimeStr + '</span>' + '）</span><span></span></p>' +
                '<dl class="clearfloat">' +
                '<dt><span class="color-red"></span></dt>' +
                '</dl>' +
                '<div id="imgWrap">' + imgsHtml +
                '</div></div>';
            var textOkey = data.orderType === 1 ? "" : languagePackage["重新上传"];
            var d = dialogOpt({
                title: languagePackage['确认收货'],
                class: 'alert_orderConfirm',
                content: html,
                textOkey: textOkey,
                textOkeyId: 'at_odo_cxscokid2',
                textCancel: languagePackage['关闭'],
                textCancelId: 'at_odo_cxscccid2',
                closeId: 'at_odo_cxsccoid2',
                funcOkey: function () {
                    d.remove();
                    orderDetalFunc.confirmGoodsInfo(data);
                },
                funcCancel:function () {
                    window.location.reload();
                }
            })
            $('#imgWrap img').unbind().bind('click', function (e) {
                var imgSrc = $(e.currentTarget).attr('src');
                orderDetalFunc.checkthumbnail(e);
            })
        }, function (err) {
            alertReturn(err.exception);
        })
    }

    /**
     * 上传凭证
     * */
    orderDetalFunc.uploadIdentity = function () {
        UploadIdentity.init({
            input: document.querySelector('#img_input'),
            callback: function (base64) {
                var data_base64 = Object.prototype.toString.call(base64) === "[object Array]" ? {images: base64} : {image: base64};
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify(data_base64),
                    beforeSend: function (xhr) {
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    var imgSrc = $.isArray(resp.data) ? resp.data : [resp.data];
                    if (resp.code === 0) {
                        interface.uploadCertificateImg({
                            imgSrc: imgSrc
                        }, function (resp) {
                            var data_id = Object.prototype.toString.call(resp.data) === "[object Array]" ? resp.data : [resp.data];
                            var html = [];
                            _.each(data_id, function (item, index) {
                                html.push('<div class="png-box" >' +
                                    '<div class="img-wrap" ><i class="offLineClose"></i><img style="height: 100%;width: 100%;" src="' + imgSrc[index] + '" data-id="' + data_id[index] + '"/>' +
                                    '</div>' +
                                    '</div>');
                            })
                            $('.alert_dialog').remove();
                            $('#imgWrap').append(html.join(''));
                        }, function (err) {
                            alertReturn(err.exception);
                        });


                    }
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertDialog(languagePackage['图片上传中...']);
            }
        });
    }

    /**
     *详情上左部分*
     **/
    orderDetalFunc.detailLeft = function (data) {
        $("#j_detailLeft").html(template('t:j_detailLeft', {data: data}));
        /**
         *评价*
         **/
        $('.btn-evaluate').on('click', function () {
            evaluateDialog(orderId,false,languagePackage);
        });

//        $('#settlement').on('click', function () {//结算
//            interface.goodsInfo({
//                orderId: orderId
//            }, function (resp) {
//                if (resp.code == 0) {
//                    var goodsData = resp.data;
//                    orderDetalFunc.settlement(goodsData);
//                } else {
//                    alertReturn(resp.exception);
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            })
//        });

        $(".complain").on('click', function () {//申诉
            var optionHtml;
            if (data.orderType == 2) {
                optionHtml = '<option value="">'+languagePackage['请选择申诉原因']+'</option>' +
                    '<option value="1">'+languagePackage['1、卖家迟迟不能更新提货信息']+' </option>' +
                    '<option value="2">'+languagePackage['2、卖家更新的提货信息误差太大']+' </option>' +
                    '<option value="3">'+languagePackage['3、卖家实际货物与描述不符']+' </option>' +
                    '<option value="4">'+languagePackage['4、卖家服务很差']+' </option>' +
                    '<option value="9">'+languagePackage['5、其他']+' </option>';
            } else if (data.orderType == 1) {
                optionHtml = '<option value="">'+languagePackage['请选择申诉原因']+'</option>' +
                    '<option value="5">'+languagePackage['1、买家迟迟不来提货']+' </option>' +
                    '<option value="6">'+languagePackage['2、买家迟迟不能确认提货']+' </option>' +
                    '<option value="7">'+languagePackage['3、买家提货人信息有误']+' </option>' +
                    '<option value="8">'+languagePackage['4、买家态度不友好']+' </option>' +
                    '<option value="9">'+languagePackage['5、其他']+' </option>';
            }

            var timeHtml = '<div class="complain-box">' +
                '<label>'+languagePackage['申诉原因']+'：</label>' +
                '<select id="at_odo_ssyy" name="at_odo_ssyy">' +
                '' + optionHtml + '' +
                '<textarea placeholder="'+languagePackage['在这里填写您的具体申诉原因']+'"></textarea>' +
                '</select>' +
                '</div>';
            var d = dialogOpt({
                title: languagePackage['订单申诉'],
                class: 'complain-dialog',
                content: timeHtml,
                textOkey: languagePackage['提交'],
                textOkeyId: 'at_odo_ssokid',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_odo_ssccid',
                closeId: 'at_odo_sscloseid',
                btn: 'btn2',
                funcOkey: function () {
                    var $this = $(this);
                    if ($this.hasClass('not')) {
                        return false;
                    }
                    var type = $('.complain-box select').val();
                    if (!type) {
                        alertReturn(languagePackage['请选择申诉原因']);
                        return false;
                    }
                    var detail = trim($('.complain-box textarea').val());
                    if (!detail) {
                        alertReturn(languagePackage['请填写申诉具体原因']);
                        return false;
                    }
                    $this.addClass('not');
                    interface.complain({
                        detail: detail,
                        orderId: orderId,
                        type: type
                    }, function (resp) {
                        if (resp.code == 0) {
                            d.remove();
                            alertDialog(languagePackage['您的申诉提交成功，请耐心等候，我们会在24小时内解决您的问题。如情况比较紧急，请直接电话联系客服，以便快速处理问题。']);
                            $(".progress-l .func-a :eq(0)").unbind("click").removeClass('complain').addClass('gray').html(languagePackage['已申诉']);
                        } else {
                            alertReturn(resp.exception);
                        }
                        $this.removeClass('not');
                    }, function (resp) {
                        $this.removeClass('not');
                        alertReturn(resp.exception);
                    })
                }
            })
            endTime = data.deliveryEndTime;
            countDown($('.a-clock'), endTime);
        })
    }
    /**
     *提示部分
     **/
    orderDetalFunc.detailNotice = function (data) {
//    只有状态为提货中时才有提示
      if(data.status==6||data.status===3){
        $("#j_detailNotice").html(template('t:j_detailNotice', {data: data}));
        $("#j_detailNotice").find('span').unbind().bind({
            'mouseover': function (e) {
                $('#j_detailNotice .w-credibility').show();
            },
            'mouseout': function () {
                $('#j_detailNotice .w-credibility').hide();
            }
        });
      }else{
      	$("#j_detailNotice").remove();
      }
    }

    /**
     *详情上右部分*
     **/
    orderDetalFunc.detailRight = function (data) {
        $("#j_detailRight").html(template('t:j_detailRight', {data: data}));
    }

    /**
     *详情中间部分*
     **/
    orderDetalFunc.detailMiddle = function (data) {
        $("#j_detailMiddle").html(template('t:j_detailMiddle', {data: data}));
        orderDetalFunc.records();
    }

    /**
     *提货记录弹框*
     **/
    orderDetalFunc.records = function () {
        $('.get-record').on('click', function () {
            interface.record({
                id: orderId
            }, function (resp) {
                if (resp.code == 0) {
                    var list = '';
                    for (var i = 0; i < resp.data.length; i++) {
                        list += '<tr><td>' + resp.data[i].name + '</td>\
                    <td>' + resp.data[i].quantity + '</td>\
                    <td>' + resp.data[i].price + '</td>\
                    <td>' + dateYMDHMSFormat(resp.data[i].createTime) + '</td></tr>'
                    }
                    /**
                    var html = '<div class="record_wrap">\
                    <table>\
                    <thead>\
                    <tr>\
                    <th>提货人</th>\
                    <th>提货量（吨）</th>\
                    <th>提货金额（元）</th>\
                    <th>交易时间</th>\
                    </tr>\
                    </thead>\
                    <tbody id="j_employeesList">\
                   ' + list + '\
                    </tbody>\
                    </table>\
                    <div class="clear-fixed fenye">\
                    <div id="pagination" class="pagination"></div>\
                    <input type="hidden" id="pageNum" value="1">\
                    </div></div><div class="record-count">提货次数：' + resp.data.length + '次</div>';
                     **/
                    var html = '<div class="record_wrap">'+
                        '<table>'+
                        '<thead>'+
                        '<tr>'+
                        '<th>'+languagePackage['提货人']+'</th>'+
                        '<th'+languagePackage['提货量']+'>（'+languagePackage['吨']+'）</th>'+
                        '<th>'+languagePackage['提货金额']+'（'+languagePackage['元']+'）</th>'+
                        '<th>'+languagePackage['交易时间']+'</th>'+
                        '</tr>'+
                        '</thead>'+
                        '<tbody id="j_employeesList">'+ list +
                        '</tbody>'+
                        '</table>'+
                        '<div class="clear-fixed fenye">'+
                        '<div id="pagination" class="pagination"></div>'+
                        '<input type="hidden" id="pageNum" value="1">'+
                        '</div></div><div class="record-count">'+languagePackage['提货次数']+'：' + resp.data.length + ''+languagePackage['次']+'</div>';

                    dialogOpt({
                        title: languagePackage['提货记录'],
                        class: 'bid-record',
                        content: html,
                        textOkey: languagePackage['关闭'],
                        btnClass: 'btn1'
                    })
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            })
        })
    }

    orderDetalFunc.detailBottom = function (data) {
        console.log(data)
        $("#j_detailBottom").html(template('t:j_detailBottom', {data: data, _userId: user.data.id}));
        orderDetalFunc.dealwithImg();
        orderDetalFunc.bindFollow();
        $('.block-detail table tr td span.enter_details').on('click', function () {
            var id = $(this).attr("data-id");
            var userId = $(this).attr("data-userId");
            var type = $(this).attr("data-type");
            if (user && user.login && user.data.id == userId) {
                window.location.href = 'p_bid_detail_seller.html?tenderId=' + id + '&from=order&type='+type;
            } else {
                window.location.href = 'p_bid_detail_buyer.html?tenderId=' + id + '&from=order&type='+type;
            }
        });
        /*线下交易查看一些详情*/
        if(data.contractBean.buyerUploadUrl||data.contractBean.supplierUploadUrl){
            $("#check_detail").unbind('click').bind('click',function (e) {
                e.preventDefault();
                orderDetalFunc.checkDetail(data);
            })
        }

    }
    /*
    *处理付款明细
     */
    orderDetalFunc.dealMoney=function(data){
        var htmlStr = '<div class="clearfloat trade_money_area"><div><span class="trade_money_detail have_trade">'
        var bagAmount = data.bagAmount;
        var SingleBagAmount = Number(bagAmount)/Number(data.quantity);
        var SumBagAmount = SingleBagAmount*Number(data.finishQuantity);
        var sumPrice = formatCurrency(Number(SumBagAmount)+Number(data.sumPrice));
        var isExist = '';
        if(bagAmount>0){
            isExist = '';
        }else{
            isExist = 'hide'
        }
        // data.realPayedAmount = formatCurrency(data.realPayedAmount);
        data.couponAmount = formatCurrency(data.couponAmount);
        // data.sumPrice = formatCurrency(data.sumPrice);
        // data.finalPayment = formatCurrency(data.finalPayment);
            htmlStr += languagePackage['已付总额'] + '：</span><span class="have_trade_money">￥'+sumPrice+'</span></div>' +
                '<div><span class="trade_money_detail trade_grey">'+languagePackage['商品总额']+'：</span><span>￥'+formatCurrency(data.sumPrice)+'</span></div>'+
                '<div class="'+isExist+'"><span class="trade_money_detail trade_grey">'+languagePackage['吨袋总额']+'：</span><span>￥'+formatCurrency(SumBagAmount)+'</span></div>'+
                '<div><span class="trade_money_detail trade_grey">'+languagePackage['优惠券']+'：</span><span>-￥'+data.couponAmount+'</span></div>'+
                '</div>';
        return htmlStr;
    }
    /*
    **发票详情处理
     */
    orderDetalFunc.detailInvoice=function(data){
        var invoice_list = data.invoiceBean;
        if(invoice_list){
            var invoice_list_html = '';
            var companyPhone =invoice_list.companyPhoneAreaCode?invoice_list.companyPhoneAreaCode+' '+invoice_list.companyPhone:'+86'+' '+invoice_list.companyPhone;
            var receivePhone =invoice_list.receivePhoneAreaCode?invoice_list.receivePhoneAreaCode+' '+invoice_list.receivePhone:'+86'+' '+invoice_list.receivePhone;
            var receiveAddr = (invoice_list.receiveProvince?(invoice_list.receiveProvince+'-'):'')+(invoice_list.receiveCity?(invoice_list.receiveCity+'-'):'')+invoice_list.receiveAddr;
            invoice_list_html = '<div class="invoice_dialog">'+
                '<p class="invoice_tip">'+languagePackage['此处发票信息为买家所提供，具体开票方式请联系买家进行确认～']+'</p>' +
                '<div class="company_message"><h1>'+languagePackage['公司信息']+'</h1><ul>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['公司名称']+'：</label>'+invoice_list.companyName+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['公司税号']+'：</label>'+invoice_list.companyTax+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['开户银行']+'：</label>'+invoice_list.companyBank+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['银行账号']+'：</label>'+invoice_list.companyBankCard +'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['公司地址']+'：</label>'+invoice_list.companyAddr+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['联系电话']+'：</label>'+companyPhone+'</li></ul>' +
                '</div>' +
                '<div class="send_address"><h1>'+languagePackage['寄送地址']+'</h1><ul>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['收票人姓名']+'：</label>'+invoice_list.receiveUserName+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['收票人手机']+'：</label>'+receivePhone+'</li>' +
                '<li><span class="asterisk">*</span><label>'+languagePackage['寄送地址']+'：</label>'+receiveAddr+'</li></ul>' +
                '</div>' +
                '</div>';
            invoice_detail_html = invoice_list_html;
            $(".invoice_detail").bind('click',function () {
                var html = invoice_list_html;
                var d1 = dialogOpt({
                    title: languagePackage['发票详情'],
                    class: 'invoice_detail_area',
                    content: html,
                    textOkey: '',
                    textCancel: languagePackage['关闭'],
                    funcOkey:''
                });
            });
        }
    }
    orderDetalFunc.checkDetail = function (json) {
        var contract = contractJs;
        var identity = contract.getParterAndMeInfo(json.contractBean);
        var buyerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.name + "</h4></div><div class='offline-item1 offline-tooltip'><img src=" + json['contractBean'][identity.pre + "UploadUrl"] + " alt=''></div><div class='offline-item1 color-success'><p>"+languagePackage['上传成功！']+"</p></div></div>";
        var suppilerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.parter + "</h4></div><div class='offline-item1 offline-tooltip'><img src=" + json['contractBean'][identity.parterPre + "UploadUrl"] + " alt=''></div><div class='offline-item1 color-success'><p>"+languagePackage['上传成功！']+"</p></div></div>";
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>"+languagePackage['双方上传协议成功！']+"</h4>" +
            "</div>" + buyerHtml + suppilerHtml;
        var line_opt = dialogOpt({
            title: languagePackage['查看详情'],
            class: 'dialogOpt-lg',
            content: html,
            textCancel: languagePackage['关闭'],
            funcCancel: function () {
                line_opt.remove();
            }

        });
        contract.bindOfflineEvent(json.contractBean);
    }

    /*倒计时*/
    function countDown(el, endTime) {
        var interval = endTime - (new Date()).getTime();
        if (interval < 0) {
            //window.location.reload();
        } else {
            var d = 0;
            var h = 0;
            var m = 0;
            d = Math.floor(interval / 1000 / 60 / 60 / 24);
            h = Math.floor(interval / 1000 / 60 / 60 % 24);
            m = Math.floor(interval / 1000 / 60 % 60);
            var status = el.attr('data-status');
            if (d > 0) {
                el.text(d + languagePackage['天'] + h + languagePackage['小时'] + m + languagePackage['分钟']);
            } else {
                el.text(h + languagePackage['小时'] + m + languagePackage['分钟']);
            }
            setTimeout(function () {
                countDown(el, parseInt(endTime));
            }, 1000);
        }
    }

    /*处理图片--获取图片的宽高来添加样式*/
    orderDetalFunc.dealwithImg = function () {
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

    //绑定关注取消关注事件
    orderDetalFunc.bindFollow = function () {
        $('.focus_on').off('click').on('click', function () {
            var _this = $(this);
            var userId = _this.attr('data-userid');
            if ( trim(_this.text()) == languagePackage['关注']) {
                //关注
                interface.follow({
                    userId: userId
                }, function (resp) {
                    if (resp.code == 0) {
                        $(this).text(languagePackage['已关注']);
                        $(this).addClass('special');
                        _this.siblings('.focus_on_text').text(languagePackage['已接收该商家发布招标通知']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            } //else if (trim(_this.text()) == '取消关注') {
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

    orderDetalFunc.template = function () {
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
        template.helper('dateYMDHMSFormat', function (obj) {
            var z = dateYMDHMSFormat(obj);
            return z;
        });
        //获取商家名称，有公司则返回公司名，否则返回用户名
        template.helper('getCompanyName', function (user) {
        	if(user.companyName){
        		return user.companyName;
        	}
        	return user.nickname;
        });
        //信誉值等级
        template.helper('reputationValueLevel', function (value) {
        	return reputationValueLevel(value);
        });
    }

    orderDetalFunc.init();

    module.exports = orderDetalFunc;
});


