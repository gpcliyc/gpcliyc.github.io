/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
//    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");

    var http = require("http");
    var My97DatePicker = require('My97DatePicker');
    var previewImages = require('preViewImages');
    require("interface");
    require("pagination");
    var global = require("global");
    var header = require("header");
    require('bootstrap');
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require("floatTool");
    var user = getUser();
    require('zic');
    var UploadIdentity = new UploadPic();
    var orderId = 0;
    var petrolType = 1;
    var orderListFunc = {};
    var numberPatt = /^\d+(\.\d+)?$/;//判断小数或者整数的正则
    var languagePackage = null;
    /*初始化*/
    orderListFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.count(); //订单状态
        this.selectOpt();//选择条件
        this.opt();
        this.orderList(1); //订单列表
    }

    orderListFunc.selectLanguage = function () {
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
    orderListFunc.renderBlock = function () {
        $("#j_leftMenuBlock").html(template('t:j_leftMenuBlock'));
        $("#j_orderListSeachBlock").html(template('t:j_orderListSeachBlock'));


    }
    orderListFunc.bindofflineEvent = function () {
        $("#j_orderList").find('button').unbind().bind('click', function (e) {
            var btn = trim($(this).attr('class'));
            orderId = $(e.currentTarget).parents('.item').attr('data-orderid');
            interface.orderDetail({
                orderId: orderId
            }, function (resp) {
                if (resp.code == 0) {
                    var data = resp.data;
                    switch (btn) {
                        case "checking":
                            orderListFunc.checkingGoodsInfo(data);
                            break;
                        case "over":
                            orderListFunc.checkedGoodsInfo(data);
                            break;
                        case "pass":
                            orderListFunc.passGoodsInfo(data);
                            break;
                        case "ok":
                            orderListFunc.confirmGoodsInfo(data);
                            break;
                        case "p_order_confirm":
                            orderListFunc.confirmShipments(data);
                            orderListFunc.inputBind();
                            break;
                        case "checkCertificate":
                            orderListFunc.passGoodsInfo(data);
                            break;
                    }

                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        })
    };
    //查看缩略图
    orderListFunc.checkthumbnail = function (e) {
        interface.queryCertificate({
            orderId: orderId
        }, function (resp) {
            var imgsArr = resp.data.imgs;
            var imgStrArr = [], currentImg;
            for (var i = 0; i < imgsArr.length; i++) {
                imgStrArr.push(imgsArr[i].imgSrc);
            }
            previewImages.render({
                imgArr: imgStrArr,//所有照片
                thiselement: $(e.currentTarget),//当前显示的照片
                showPre: true
            });

        }, function (err) {
            alertReturn(err.exception);
        });
    };
    //确认收货
    orderListFunc.confirmGoodsInfo = function (data) {
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
                    '<div class="img-wrap"><i class="offLineClose" title="'+languagePackage['删除']+'" ></i><img  src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
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
                '<p><span class="fts-14 color-9d">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-9d">（'+languagePackage['请上传本次订单所收款项的发票或相关提货单，平台将对本次订单进行有效审核']+'）</span></p>' +
                '<dl class="clearfloat">' +
                '<dt><span class="color-red"></span></dt>' +
                '<dd>' +
                '<div style="position:relative;">' +
                '<button id="uploadIdentity" class="offLineBtn" name="uploadIdentity">+'+languagePackage['上传交易凭证']+'</button>' +
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
                textOkeyId: 'at_order_cgi_textOkeyId',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_order_cgi_textCancelId',
                closeId: 'at_order_cgi_closeId',
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
                            orderListFunc.uploadOneMore(data);
                        }
                    }, function (err) {
                        alertReturn(languagePackage['提交失败']);
                    });
                }
            });
            $('#imgWrap').delegate('.offLineClose', 'click', function (e) {
                $(e.currentTarget).parents('.png-box').remove();
            });
            $('body #img_input').unbind().bind('click', function (e) {
                orderListFunc.uploadIdentity();
            });
         }, function (err) {
        });
    }
    //凭证审核中
    orderListFunc.checkingGoodsInfo = function (data) {
        this.uploadOneMore(data);
        $('#imgWrap img').unbind().bind('click', function (e) {
            var imgSrc = $(e.currentTarget).attr('src');
            orderListFunc.checkthumbnail(e);
        })
    };
    //凭证未通过
    orderListFunc.checkedGoodsInfo = function (data) {
        var params = {
            orderId: orderId
        }
        interface.queryCertificate(params, function (resp) {
                var tempImgsObj = [];
                var imgsHtml = "";
                if (resp.code === 0 && resp.data) {
                    tempImgsObj = resp.data.imgs;
                }
                for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                    imgsHtml += '<div class="png-box" >' +
                        '<div class="img-wrap"><img  src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                        '</div>' +
                        '</div>';
                }
                var html = '<h5 class="fts-14 color-9d" style="margin-top: 20px">'+languagePackage['提货信息']+'</h5>' +
                    '<p class="fts-14">' +
                    '<span>'+languagePackage['实际提货量']+':</span>' +
                    '<span ><em>' + data.finishQuantity + '</em>'+languagePackage['吨']+'</span>' +
                    '</p>' +
                    '<p class="fts-14 border_bottom">' +
                    ' <span>'+languagePackage['实际提货金额']+':</span>' +
                    '<span >' + data.finishPrice + languagePackage['元']+'</span>' +
                    '</p>' +
                    '<p class="color-9d"><span class="fts-14">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-red">（'+languagePackage['审核未通过']+'）</span></p>' +
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
                    textOkey: textOkey,
                    textOkeyId: 'at_order_cxsc',
                    textCancel: languagePackage['关闭'],
                    textCancelId: 'at_order_cxsc_cid',
                    closeId: 'at_order_cxsc_closeId',
                    content: html,
                    funcOkey: function () {
                        d.remove();
                        orderListFunc.confirmGoodsInfo(data);
                    }
                })
                $('#imgWrap img').unbind().bind('click', function (e) {
                    var imgSrc = $(e.currentTarget).attr('src');
                    orderListFunc.checkthumbnail(e);
                })

            }, function (err) {
                alertReturn(err.exception);
            }
        );
    }
    ;
//凭证已经通过
    orderListFunc.passGoodsInfo = function (data) {
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
                orderListFunc.checkthumbnail(e);
            })
        }, function (err) {
            alertReturn(err.exception);
        });
    }
//获取剩余时间
    orderListFunc.getLeftTime = function (createTime) {
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
    /**
     **重新上传
     **/
    orderListFunc.uploadOneMore = function (data) {
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
            var leftTime = orderListFunc.getLeftTime(resp.data.createTime),
                leftTimeStr = leftTime.hour > 0 ? languagePackage["剩余"] + leftTime.hour + languagePackage["小时"] + leftTime.min + languagePackage["分钟"] : languagePackage["剩余"] + leftTime.min + languagePackage["分钟"],

                imgsHtml = "";
            for (var i = 0, len = tempImgsObj.length; i < len; i++) {
                imgsHtml += '<div class="png-box" >' +
                    '<div class="img-wrap" ><img  class="cursor" src="' + tempImgsObj[i].imgSrc + '" data-id="' + tempImgsObj[i].id + '"/>' +
                    '</div>' +
                    '</div>';
            }
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
                '<p class="color-9d"><span class="fts-14 ">'+languagePackage['交易凭证']+'</span> <span class="fts-14 color-41">（'+languagePackage['审核中'] + '<span class="color-9d fts-12">' + leftTimeStr + '</span>' + '）</span><span></span></p>' +
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
                textOkeyId: 'at_order_cxscid',
                textCancel: languagePackage['关闭'],
                textCancelId: 'at_order_cancelId',
                closeId: 'at_order_closeId',
                funcOkey: function () {
                    d.remove();
                    orderListFunc.confirmGoodsInfo(data);
                },
                funcCancel:function () {
                    window.location.reload();
                }
            })
            $('#imgWrap img').unbind().bind('click', function (e) {
                var imgSrc = $(e.currentTarget).attr('src');
                orderListFunc.checkthumbnail(e);
            })
        }, function (err) {
            alertReturn(err.exception);
        })
    }
    /**
     * 上传凭证
     * */
    orderListFunc.uploadIdentity = function () {
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

    orderListFunc.bindEvent = function (data) {
        var _this = this;
        $("#p_order_confirm").unbind().bind('click', function (e) {
            var orderNum = $(e.currentTarget).attr('data-orderNum');
            // var data_bagamount = $(e.currentTarget).attr('data-bagamount');
            var _data = {};
            for (var i = 0; i < data.length; i++) {
                if (data[i].orderNum === orderNum) {
                    _data = data[i];
                    break;
                }
            }
            // _data.bagamount = data_bagamount;
            _this.confirmShipments(_data);
        })
    };
    orderListFunc.inputBind = function () {
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
    orderListFunc.confirmShipments = function (data) {
        var bagamount = data.bagAmount;
        var sumQuantity  = data.quantity;
        var singleBag = floatTool.divide(Number(bagamount),Number(sumQuantity),'divide');
        var isHideStr = '';
        if(bagamount>0){
            isHideStr = '';
        }else{
            isHideStr = 'hide';
        }
        var html = '<div class="p_order_container '+languagePackage['p_order_container-block']+'">' +
            '<h5 class="fts-14 color-9d p_order_real_title">'+languagePackage['请根据双方签署协议的总中标量，填写本次实际的总交易量。如实际中标单价与发货单价不同，请及时修改。']+'</h5>' +
            '<div class="container_list"><label class="fts-14">'+languagePackage['实际发货量']+'：</label>' +
            '<input type="text" class="p_order_input" data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="p_order_realQuan" placeholder="'+languagePackage['请输入实际发货量']+'">' +
            '<span class="unit">'+languagePackage['吨']+'</span><span class="error"></span></div>' +
            '<div class="container_list"><label class="fts-14">'+languagePackage['实际发货单价']+'：</label>' +
            '<input type="text" class="p_order_input " data-id=' + data.id + ' data-orderNum=' + data.orderNum + '  id="single_tonne_price" value="'+data.buyPrice +'" disabled="disabled" >' +
            '<span class="unit">'+languagePackage['元/吨']+'</span><span class="edit_single_price" id="at_order_esp" name="at_order_esp">'+languagePackage['修改单价']+'</span><span class="error"></span></div>'+
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
            textOkeyId: 'at_fh_textOkeyId',
            textCancel: languagePackage['取消'],
            textCancelId: 'at_fh_textCancelId',
            closelId: 'at_fh_closelId',
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
                        orderListFunc.init();
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

    orderListFunc.selectOpt = function () {
        //处理选择筛选--所有种类、所有产地
        $(".mod-menu .item li").on('click', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            orderListFunc.orderList(1);
        });
    }

    orderListFunc.opt = function () {
        $('.find').on('click', function () {//查询按钮
            orderListFunc.orderList(1);
        })

        $(document).keyup(function (event) {//回车查询按钮
            if (event.keyCode == 13) {
                $('.find').click();
            }
        });

        $('.reset').on('click', function () {//重置按钮
            $('.orderNum').val('');
            $('.tenderName').val('');
            $('.companyName').val('');
            $("#bidType").val(',');
            $("#bidType").find("option").eq(0).attr("selected", true);

            orderListFunc.orderList(1);
        })
    }

    /*订单列表*/
    orderListFunc.orderList = function (page) {
        var pagenum, _this = this;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var orderNum = $('.orderNum').val();
        var tenderName = $('.tenderName').val();
        var companyName = $('.companyName').val();
        var petrolType = $("#bidType option:selected").val().split(',')[0];//1石油焦,2煅后焦
        var type = $("#bidType option:selected").val().split(',')[1];//1供给标协议,2需求标协议

//        switch (type) {
//            case "全部招标":
//                type = '';
//                petrolType = '';
//                break;
//            case "石油焦-供应招标":
//                type = 1;
//                petrolType = 1;
//                break;
//            case "石油焦-采购招标":
//                type = 2;
//                petrolType = 1;
//                break;
//            case "煅后焦-供应招标":
//                type = 1;
//                petrolType = 2;
//                break;
//            case "煅后焦-采购招标":
//                type = 2;
//                petrolType = 2;
//                break;
//        }
        var loading = "loading";
        interface.orderList({
            status: status,
            pageSize: 10,
            pageNum: pagenum,
            orderNum: orderNum,
            tenderName: tenderName,
            companyName: companyName,
            type: type,
            petrolType:petrolType
        }, function (resp) {
            if (resp.data.content.length > 0) {
                $("#j_orderList").html(template('t:j_orderList', {list: resp.data.content, userData: user.data}));
                _this.bindEvent(resp.data.content);
                _this.bindofflineEvent();//线下支付,凭证审核
                $("#pagination").pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 10, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: orderListFunc.orderList_pageCallback,
                    prev_text: languagePackage["上一页"],
                    next_text: languagePackage["下一页"],
                });
                if (resp.data.totalPages == 1) {
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }

                $('.status .clock').each(function () {
                    var endTime = $(this).attr('data-time');
                    var status = $(this).attr('data-oStatus');
                    countDown($(this), endTime, status);
                });
                orderListFunc.orderListListOptBtn();
                orderListFunc.dealwithImg();
                orderListFunc.bindFollow();
            } else {
                $("#j_orderList").html('<div class="no-data">'+languagePackage['没有相关订单信息']+'</div>');
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading)
    }

    orderListFunc.orderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        orderListFunc.orderList(page_id + 1);
    }

    /*订单状态*/
    orderListFunc.count = function () {
        interface.orderCount({}, function (resp) {
            if (resp.code == 0) {
                $('.total').html(resp.data.total);
                $('.waitforpay').html(resp.data.waitforpay);
                $('.waitfordelivery').html(resp.data.waitfordelivery);
                $('.delivery').html(resp.data.delivery);
                $('.waitforcheck').html(resp.data.waitforcheck);
                $('.success').html(resp.data.success);
                $('.failed').html(resp.data.failed);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

//按钮操作
    orderListFunc.orderListListOptBtn = function (orderDeliveryId) {
        $(".update").on('click', function () {//更新提货记录
            var $this = $(this);
            var orderDeliveryId = $this.parents('.item').attr('data-orderDeliveryId');
            var orderId = $this.parents('.item').attr('data-orderId');
//            window.location.href = 'p_delivery_detail.html?orderId=' + orderId+'&detailId='+orderDeliveryId;
            window.open('p_delivery_detail.html?orderId=' + orderId+'&detailId='+orderDeliveryId);

        });

        /*提交订单(填写收货人信息)--（立即付款）*/
        $('.submit').on('click', function () {
            var $this = $(this);
            //var successQuantity = $this.parents('.item').attr('data-successQuantity');//中标量
            var orderId = $this.parents('.item').attr('data-orderId');
            interface.orderDetail({
                orderId: orderId
            }, function (resp) {
                if (resp.code == 0) {
                    var data = resp.data;
                    //if (data.deliveryConnectName) {//根据联系人姓名是否填写来判断是否弹出编辑收货人信息窗口
                    orderListFunc.pation(data);
                    //} else {
                    //    orderListFunc.submitIofo($this, successQuantity, data);
                    //}
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });

        /*去提货*/
        $('.carry-goods').on('click', function () {
            var $this = $(this);
            var successQuantity = $this.parents('.item').attr('data-successQuantity');//中标量
            var orderId = $this.parents('.item').attr('data-orderId');
//            window.location.href = 'p_apply_delivery.html?orderId=' + orderId;
            window.open('p_apply_delivery.html?orderId=' + orderId);
        });


        /**
         *评价*
         **/
        $('.btn-evaluate').on('click', function () {
            var $this = $(this);
            var orderId = $this.parents('.item').attr('data-orderId');
            evaluateDialog(orderId,false,languagePackage);
        });



        //结算尾款(完成状态下)
        $('.settlement-end').on('click', function () {
            var $this = $(this);
            var orderId = $this.parents('.item').attr('data-orderId');
            interface.goodsInfo({
                orderId: orderId
            }, function (resp) {
                if (resp.code == 0) {
                    var goodsData = resp.data;
                    orderListFunc.settlementEnd(goodsData);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }

    /**
     * 尾款支付弹框
     */
    orderListFunc.settlementEnd = function (goodsData) {
        var leftPrice = Number(goodsData.finishPrice) - Number(goodsData.payedPrice);
        interface.currentUserInfo(function (resp) {//查询个人接口获取余额
            if (resp.code == 0) {
                var useableBalace = resp.data.useableBalace;
                var html = '<div class="settlement-box">' +
                    '<h1>'+languagePackage['恭喜您，交易成功！']+'</h1>' +
                    '<p class="desc">' +
                    languagePackage['本次交易您的实际提货量超出中标量，将有']+'<span class="color-red">' + leftPrice.toFixed(2) + '</span>'+languagePackage['元尾款需要支付，具体交易数据查看以下列表。']+'' +
                    '</p>' +
                    '<div class="list">' +
                    '<h3>' + goodsData.tenderName + '</h3>' +
                    '<ul class="clearfloat color-9d">' +
                    '<li>'+languagePackage['中标量']+'：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>'+languagePackage['吨']+'</li>' +
                    '<li>'+languagePackage['已付金额']+'：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>'+languagePackage['元']+'</li>' +
                    '<li>'+languagePackage['实际提货量']+'：<span class="color-red">' + goodsData.finishQuantity.toFixed(2) + '</span>'+languagePackage['吨']+'</li>' +
                    '<li>'+languagePackage['实际提货金额']+'：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>'+languagePackage['元']+'</li>' +
                    '</ul>' +
                    '<p class="left-cash">'+languagePackage['结算尾款']+'：<span class="color-red">' + leftPrice.toFixed(2) + '</span>'+languagePackage['元']+'</p>' +
                    '</div>' +
                    '</div>';
                var d = dialogOpt({
                    title: languagePackage['结算尾款'],
                    class: 'settlement-dialog',
                    content: html,
                    textOkey: languagePackage['结算'],
                    textCancel: languagePackage['取消'],
                    funcOkey: function () {
                        orderListFunc.settlementPay(goodsData, leftPrice, useableBalace);
                        d.remove();
                    }
                });
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

   /**
     * 结算支付*
     * */
    orderListFunc.settlementPay = function (goodsData, leftPrice, useableBalace) {
        var payClass = '';
        if (Number(leftPrice) > Number(useableBalace)) {
            payClass = 'disabled';
        } else {
            payClass = 'checked';
        }
        var bankListHtml = gpc_getBanksHtml();
        var tipsHtml = '<div class="pay-type">' +
            '<div class="pay-top">' +
            '<h1>' + goodsData.tenderName + '</h3>' +
            '<h3>'+languagePackage['订单号']+'：' + goodsData.orderNum + '</h3>' +
            '<p>'+languagePackage['结算尾款']+'：<span class="color-red">' + leftPrice.toFixed(2) + '</span>'+languagePackage['元']+'</p>' +
            '</div>' +
            '<div class="pay-bottom">' +
            '<h3>'+languagePackage['余额支付']+'</h3>' +
            '<ul class="m-personal">' +
            '<li data-type="1" class="' + payClass + ' balance-pay">' +
            '<i class=""></i><label>'+languagePackage['账户余额']+'<span>' + useableBalace.toFixed(2) + '</span>'+languagePackage['元']+'</label>' +
            '</li>' +
            '</ul>' +
            '<h3>'+languagePackage['网银支付']+'</h3>' +
            '<ul class="m-bank">' +
            '<li data-thirdPayType="B2C" data-type="1">' +
            '<i></i><label>'+languagePackage['个人网银']+'</label>' +
            '</li>' +
            '<li data-thirdPayType="B2B" data-type="2">' +
            '<i></i><label>'+languagePackage['企业网银']+'</label>' +
            '</li>' +
            '</ul>' +
            '<div class="bank-list">' + bankListHtml +
            '<div class="bank-more"><h1>'+languagePackage['更多银行']+'</h1></div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var d1 = dialogOpt({
            title: languagePackage['结算尾款'],
            class: 'settlementPay-dialog',
            content: tipsHtml,
            textOkey: languagePackage['立即支付'],
            textCancel: languagePackage['取消'],
            funcOkey: function () {
                var thirdType = $('.pay-type .m-bank li.checked').attr('data-type');
                var payType = $('.pay-type .m-personal li.checked').attr('data-type');
                var isPay = 2;  //结算尾款

                var id = goodsData.id;
                if (!(payType || thirdType)) {
                    alertReturn(languagePackage['请选择支付方式']);
                    return false;
                } else {
                    if (!payType) {
                        var thirdPayType = $('.pay-type .m-bank li.checked').attr('data-thirdPayType');
                        var bankId = $('.pay-type .pay-bottom .bank-list span.checked').attr('data-id');
                        if (!bankId) {
                            alertReturn(languagePackage['请选择银行']);
                            return false;
                        }
                    }
                }
                var params = {
                    leftPrice: leftPrice,
                    bankId: bankId,
                    thirdType: thirdType,
                    payType: payType,
                    id: id,
                    isPay: isPay

                };
                orderListFunc.tradePasswordDialog(params);
                d1.remove();
            }
        });
        orderBankOperate(); //选择支付方式和银行
    }

    //密码弹框
    orderListFunc.tradePasswordDialog = function (options)/*(leftPrice, bankId, thirdType, payType, id, isPay)*/ {
        var settings = {
            leftPrice: null,
            bankId: "",
            thirdType: "",
            payType: "",
            id: "",
            isPay: ""
        };
        $.extend(true, settings, options);
        //如果是线下交易，则不需要密码验证
        if (settings.isPay === 3) {
            interface.payOrder({
                orderId: settings.id,
                payType: 0//线下转账
            }, function (resp) {
                var tips = '<p class="order-notice fts-20">'+languagePackage['提交成功']+'</p><p class="order-noticeSub color-9d">'+languagePackage['请尽快联系卖家，完成线下转账，并进行预约提货！卖家认证的开户银行信息及联系电话可在相关订单详情进行查看。']+'</p>' +
                    '<ul class="order-detailInfo fts-14">' +
                    '<li><span>'+languagePackage['订单号']+':</span><span>' + (settings.baseData.orderNum || languagePackage['暂无']) + '</span></li>' +
                    '<li><span>'+languagePackage['线下转账']+':</span><span>' + ((formatCurrency(settings.baseData.sumPrice) + languagePackage["元"] ) || languagePackage["暂无"]) + '</span></li></ul>';
                dialogOpt({
                    title: languagePackage['订单通知'],
                    class: "staff-modify",
                    content: tips,
                    textOkey: languagePackage['关闭'],
                    btnClass: 'btn1',
                    funcOkey: function () {
                        alertReturn("");
//                        window.location.href = 'p_order_detail_offLine.html?orderId=' + settings.id;
                        window.open('p_order_detail_offLine.html?orderId=' + settings.id);
                    }
                })
            }, function (resp) {
                alertReturn(resp.exception);
            });
        } else {
            var html = '<div class="password-box">' +
                '<input class="trade-passwd" type="password"/>' +
                '<a href="p_trade_password.html" target="_blank">'+languagePackage['忘记交易密码?']+'</a>' +
                '</div>';
            if (!settings.payType && settings.payType !== 0) {
                settings.payType = 2;
            }
            var d1 = dialogOpt({
                title: languagePackage['交易密码'],
                class: 'password-dialog',
                content: html,
                textOkey: languagePackage['确认'],
                textCancel: languagePackage['取消'],
                funcOkey: function () {
                    var tradePassword = $(".password-dialog .trade-passwd").val();
                    if (!tradePassword) {
                        alertReturn(languagePackage['请输入支付密码']);
                        return false;
                    }
                    if (settings.isPay == 1) {
                        interface.payOrder({
                            thirdPayType: settings.thirdType,
                            orderId: settings.id,
                            payType: settings.payType,
                            bankId: settings.bankId,
                            tradePassword: tradePassword
                        }, function (resp) {
                            if (resp.code == 0) {
                                if (settings.payType == 2) {
                                    openwin(resp.data);
                                    d1.remove();
                                    var tipsHtml = '<p>'+languagePackage['您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口']+'</p>' +
                                        '<a class="tips-a">'+languagePackage['已完成支付']+'</a>';
                                    dialogOpt({
                                        title: languagePackage['登录网上银行支付'],
                                        class: 'tips-dialog',
                                        content: tipsHtml,
                                        textOkey: languagePackage['关闭'],
                                        btnClass: 'btn1',
                                        funcOkey: function () {
                                            window.location.reload();
                                        }
                                    })

                                    $('.tips-a').on('click', function () {
                                        window.location.reload();
                                    });
                                } else {
                                    orderListFunc.count();
                                    orderListFunc.orderList();
                                    orderListFunc.firstPay(settings);
                                    d1.remove();
                                }
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        }, false);
                    } else if (settings.isPay == 2) {
                        interface.settle({
                            id: settings.id,
                            payType: settings.payType,
                            thirdPayType: settings.thirdType,
                            bankId: settings.bankId,
                            tradePassword: tradePassword
                        }, function (resp) {
                            if (resp.code == 0) {
                                if (settings.payType == 2) {
                                    openwin(resp.data);
                                    d1.remove();
                                    var tipsHtml = '<p>'+languagePackage['您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口']+'</p>' +
                                        '<a class="tips-a">'+languagePackage['已完成支付']+'</a>';
                                    dialogOpt({
                                        title: languagePackage['登录网上银行支付'],
                                        class: 'tips-dialog',
                                        content: tipsHtml,
                                        textOkey: languagePackage['关闭'],
                                        btnClass: 'btn1',
                                        funcOkey: function () {
                                            window.location.reload();
                                        }
                                    })

                                    $('.tips-a').on('click', function () {
                                        window.location.reload();
                                    });
                                } else {
                                    orderListFunc.count();
                                    orderListFunc.orderList();
                                    orderListFunc.secondPay(settings.leftPrice, settings.id);
                                    d1.remove();
                                }
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        }, false);
                    }
                }
            });
        }
    }


//首次支付成功提示
    orderListFunc.firstPay = function (settings) {
        var tipsHtml = '<h1>'+languagePackage['支付成功！']+'</h1>' +
            '<h2>'+languagePackage['请尽快提交提货申请，以便卖家做好提货准备。']+'</h2>' +
            '<ul class="order-detailInfo fts-14">' +
            '<li><label>'+languagePackage['订单号']+':</label><span>' + (settings.baseData.orderNum || languagePackage["暂无"]) + '</span></li>' +
            '<li><label>'+languagePackage['在线支付']+':</label><span>' + (settings.baseData.sumPrice || languagePackage["暂无"]) + '</span></li></ul>';
        var d2 = dialogOpt({
            title: languagePackage['付款通知'],
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: languagePackage['关闭'],
            funcOkey: function () {
                d2.remove();
            }
        });
    }

//尾款结算成功提示
    orderListFunc.secondPay = function (leftPrice, id) {
        var tipsHtml = '<h1>'+languagePackage['支付尾款成功！']+'</h1>' +
            '<h2'+languagePackage['本次交易您的实际提货量超出中标量，已成功支付']+'><i class="red">' + leftPrice.toFixed(2) + ''+languagePackage['元']+'</i>'+languagePackage['尾款。']+'</h2>';
        var d2 = dialogOpt({
            title: languagePackage['结算通知'],
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: languagePackage['评价'],
            textCancel: languagePackage['关闭'],
            funcOkey: function () {
                evaluateDialog(id);
                d2.remove();
            }
        });
    }

//没有设置密码
    orderListFunc.noPassword = function (id) {
        var tipsHtml = '<h2 class="noPassword">'+languagePackage['您还未设置交易密码，不具备相关交易资格，请先前往个人中心进行交易密码设置～']+' </h2>';
        var d2 = dialogOpt({
            title: languagePackage['提示'],
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: languagePackage['去设置'],
            textCancel: languagePackage['取消'],
            funcOkey: function () {
                d2.remove();
//                window.location.href = 'p_trade_password.html?orderId=' + id + '&from=noPassword';
                window.open('p_trade_password.html?orderId=' + id + '&from=noPassword');
            }
        });
    }

    /**
     *提货记录弹框*
     **/
    orderListFunc.records = function (orderId) {
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
    /**
     *提交提货人信息弹框*
     **/
    orderListFunc.submitIofo = function ($this, successQuantity, data) {
        var carHtml = '';
        interface.carList({
            pageSize: 0
        }, function (resp) {
            if (resp.code == 0) {
                var carList = resp.data.content;
                for (var i = 0; i < carList.length; i++) {
                    carHtml += "<span data-id='" + carList[i].id + "' data-carNum='" + carList[i].carNum + "'><i></i>" + carList[i].carNum + "<b></b></span>";
                }
                orderListFunc.showCarDialog($this, successQuantity, data, carHtml);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }

    /**
     *提交提货人信息弹框显示*
     **/
    orderListFunc.showCarDialog = function ($this, successQuantity, data, carHtml) {
        var infoHtml = '<div class="wrap">' +
            '<div class="title-info"><p class="color-36">'+languagePackage['剩余提货量']+'：' + Number(data.quantity - data.totalSubmitQuantity) + languagePackage['吨']+'</p><p class="color-9d">'+languagePackage['中标量']+'：' + successQuantity + languagePackage['吨']+'</p></div>' +
            '<ul>' +
            '<li><label>'+languagePackage['提货量']+'<i class="red">*</i></label><input class="submitQuantity" type="text"/></li>' +
            '<li><label>'+languagePackage['提货联系人']+'<i class="red">*</i></label><input class="deliveryConnectName" type="text"/></li>' +
            '<li><label>'+languagePackage['联系电话']+'<i class="red">*</i></label><input class="deliveryConnectPhone" type="text"/></li>' +
            '<li><label>'+languagePackage['提货日期']+'<i class="red">*</i></label><input class="deliveryConnectTime" type="text" placeholder="'+languagePackage['点击选择时间']+'" readonly="readonly" onClick="WdatePicker({dateFmt:\'yyyy-MM-ddTHH:mm:ss\'})"/></li>' +
            '<li><label>'+languagePackage['提货车辆']+'<i class="red">*</i></label><div class="radio-options">'
            + carHtml +
            '</div>'+
            '<li><label style="visibility: hidden">'+languagePackage['新增车辆']+'</label><input type="text" placeholder="'+languagePackage['例:京A12345']+'" id="input_addCar"><button class="btnAddCar">'+languagePackage['新增车辆']+'</button></li>'+
            '</li>' +
            '<li class="remark-box"><label>'+languagePackage['备注']+'</label><textarea class="deliveryConnectMark" rows="3" cols="80" placeholder="'+languagePackage['请填写提货等备注信息。']+'"></textarea></li>' +
            '</ul>' +
            '</div>';

        var d = dialogOpt({
            title: languagePackage['填写提货单'],
            class: 'edit-dialog',
            content: infoHtml,
            textOkey: languagePackage['提交'],
            textOkeyId: 'at_order_thdokid',
            textCancel: languagePackage['取消'],
            textCancelId: 'at_order_thdccid',
            closeId: 'at_order_thdccid',
            btn: 'btn2',
            funcOkey: function () {
                var deliveryConnectPhone = trim($('.deliveryConnectPhone').val());
                var deliveryConnectName = trim($('.deliveryConnectName').val());
                var deliveryConnectTime = trim($('.deliveryConnectTime').val());
                var deliveryConnectMark = trim($('.deliveryConnectMark').val());
                var submitQuantity = trim($('.submitQuantity').val());
                var carsNum = "";
                var carList = $(".edit-dialog ul li .radio-options span i.checked");
                for (var i = 0; i < carList.length; i++) {
                    carsNum += carList.eq(i).parent("span").attr("data-carNum") + ",";
                }
                var cars = carsNum.substring(0, carsNum.length - 1);
                var date = new Date();  //获取当日时间
                if (!submitQuantity) {
                    alertReturn(languagePackage['本次提货量不能为空']);
                    return false;
                }

                if (submitQuantity < 30) {
                    alertReturn(languagePackage['本次提货量不能小于30']);
                    return false;
                }

                if (submitQuantity > Number(data.quantity - data.totalSubmitQuantity)) {
                    alertReturn(languagePackage['本次提货量不能大于剩余提货量']);
                    return false;
                }

                if (!deliveryConnectName) {
                    alertReturn(languagePackage['提货联系人不能为空']);
                    return false;
                }
                if (!deliveryConnectPhone) {
                    alertReturn(languagePackage['联系电话不能为空']);
                    return false;
                }

                if (!deliveryConnectTime) {
                    alertReturn(languagePackage['提货日期不能为空']);
                    return false;
                }

                if (deliveryConnectTime < dateYMDHMSFormat(date)) {
                    alertReturn(languagePackage['提货日期不能小于当日时间']);
                    return false;
                }
                if (carList.length == 0) {
                    alertReturn(languagePackage['请选择提货车辆']);
                    return false;
                }
                //创建提货单
                interface.createDelivery({
                    id: data.id,
                    submitQuantity: submitQuantity,
                    cars: cars,
                    deliveryConnectPhone: deliveryConnectPhone,
                    deliveryConnectName: deliveryConnectName,
                    deliveryConnectMark: deliveryConnectMark,
                    deliveryDate: deliveryConnectTime
                }, function (resp) {
                    if (resp.code == 0) {
                        alertReturn(languagePackage['成功提交提货信息，等待卖家联系']);
                        orderListFunc.count();
                        orderListFunc.orderList();
                        //orderListFunc.pation($this, data);
                        d.remove();
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                })
            }
        });
        if ($("input.addCar").length == 0 && $(".edit-dialog ul li .radio-options span").length == 0) {
            $(".edit-dialog .radio-options").append('<span><input class="addCar" type="text"/><b></b></span>');
            orderListFunc.addCar();

        }
        orderListFunc.checkBoxCar();
        orderListFunc.delCar();
        orderListFunc.addCar();
     }

    /**
     *选择提货车辆*
     **/
    orderListFunc.checkBoxCar = function () {
        $(".edit-dialog ul li .radio-options span i").on('click', function () {
            var $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
            } else {
                $this.addClass('checked');
            }
        });
    }
    /**
     *添加提货车辆*
     **/
    orderListFunc.addCar = function () {
        $(".edit-dialog ul li .btnAddCar").off('click').on('click', function () {
            var carNum = $("#input_addCar").val();
            if (!carNum) {
                alertReturn(languagePackage['提货车不能为空']);
                return false;
            }
            carNum = carNum.toLocaleUpperCase();
            if (!isCarNumber(carNum)) {
                alertReturn(languagePackage['请输入正确的车牌格式']);
                return false;
            }
            interface.addCar({
                carNum: carNum
            }, function (resp) {
                if (resp.code == 0) {
                    //alertReturn("添加提货车成功");
                    $(".edit-dialog ul li .radio-options input").remove();
                    //重新加载提货车辆
                    var carHtml = "";
                    interface.carList({
                        pageSize: 0
                    }, function (resp) {
                        if (resp.code == 0) {
                            var carList = resp.data.content;
                            for (var i = 0; i < carList.length; i++) {
                                carHtml += "<span data-id='" + carList[i].id + "' data-carNum='" + carList[i].carNum + "'><i></i>" + carList[i].carNum + "<b></b></span>";
                            }
                            $(".edit-dialog ul li .radio-options").html(carHtml);
                            orderListFunc.checkBoxCar();
                            orderListFunc.delCar();
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    });
                }else{
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }

    /**
     *删除提货车辆*
     **/
    orderListFunc.delCar = function () {
        $(".edit-dialog ul li .radio-options span").unbind("mouseover").bind("mouseover", function () {
            var $this = $(this);
            $this.find("b").show();
        }).unbind("mouseout").bind("mouseout", function () {
            var $this = $(this);
            $this.find("b").hide();
        });

        $(".edit-dialog ul li .radio-options span b").on('click', function () {
            var $this = $(this);
            var id = $this.parent("span").attr("data-id");
            $this.parent("span").remove();
            interface.delCar({
                id: id
            }, function (resp) {
                if (resp.code == 0) {

                    $this.parent("span").remove();

                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }
    /**
     *立即付款弹框*
     **/
    orderListFunc.pation = function (data) {
        //gpc_immediatePayment(data);
//        window.location.href = "p_order_pay.html?orderId="+data.id;
        window.open("p_order_pay.html?orderId="+data.id);
    }

    /*倒计时*/
    function countDown(el, endTime) {
        var interval = new Date(endTime - (new Date()).getTime());
        if (interval.getTime() < 0) {
        } else {
            var d = 0;
            var h = 0;
            var m = 0;
            d = Math.floor(interval / 1000 / 60 / 60 / 24);
            h = Math.floor(interval / 1000 / 60 / 60 % 24);
            m = Math.floor(interval / 1000 / 60 % 60);
            var status = el.attr('data-oStatus');
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

    /*
     * 选择支付方式
     */
    orderListFunc.choicePayType = function (resp) {
        var $a = $("#payType li a"),
            $payOnline = $("#payType li").find('#payOnline'),
            $payOther = $("#payType li").find('#payOther');
        $a.unbind().bind({
            'click': function (e) {
                var payType = $.trim($(e.currentTarget).attr('id'));
                switch (payType) {
                    case "payOnline":
                        addBg($payOnline);
                        removeBg($payOther);
                        showPayonline();
                        break;
                    case "payOther":
                        addBg($payOther);
                        removeBg($payOnline);
                        showPayOther();
                        break;
                    default:
                        addBg($payOnline);
                        removeBg($payOther);
                        showPayonline();
                        break;
                }
            }
        });
        function addBg(obj) {
            if (!obj.hasClass('pay-Active')) {
                obj.addClass('pay-Active');
            }
        }

        function removeBg(obj) {
            if (obj.hasClass('pay-Active')) {
                obj.removeClass('pay-Active');
            }
        }

        function showPayonline() {
            $('#payType-payOnline').addClass('show').removeClass('hide');
            $('#payType-payOther').addClass('hide').removeClass('show');
        }

        function showPayOther() {
            $('#payType-payOther').addClass('show').removeClass('hide');
            $('#payType-payOnline').addClass('hide').removeClass('show');
        }
    };
    /*处理图片--获取图片的宽高来添加样式*/
    orderListFunc.dealwithImg = function () {
        $('.photo img').each(function () {
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

    orderListFunc.template = function () {
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
        template.helper('isTimeDelay', function (time) {
            var nowTime = new Date().getTime();
            var z = "";
            if (time > nowTime) {
                z = languagePackage["剩余提货时间"];
            } else {
                z = languagePackage["延时未完成发货"];
            }
            return z;
        });

        template.helper('returnZhengshu', function (obj) {
            var z = returnZhengshu(obj);
            return z;
        });

        template.helper('isNotDelay', function (time) {
            var nowTime = new Date().getTime();
            return nowTime < time;
        });
        template.helper('multiply', function (num1, num2) {
            var result = floatTool.multiply(Number(num1),Number(num2));
            return floatTool.toFixed(result,2)
        });
    }

//绑定关注取消关注事件
    orderListFunc.bindFollow = function () {
        $('.focus_on').off('click').on('click', function () {
            var _this = $(this);
            var userId = _this.attr('data-userid');
            if (trim(_this.text()) == languagePackage['关注']) {
                //关注
                interface.follow({
                    userId: userId
                }, function (resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['已关注']);
                        _this.addClass('special');
                        $('#j_orderList').find('.focus_on').each(function () {
                            if (userId == $(this).attr('data-userid')) {
                                $(this).text(languagePackage['已关注']);
                                $(this).addClass('special');
                                console.log($(this).siblings('.focus_on_text').text());
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

    orderListFunc.init();
    module.exports = orderListFunc;
})
;
