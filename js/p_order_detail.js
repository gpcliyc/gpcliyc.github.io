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
    var My97DatePicker = require('My97DatePicker');
    require("interface");
    require("pagination");
    var global = require("global");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require("floatTool");

    /**
     *初始化部分变量*
     **/
    var user = getUser();
    var orderId = request('orderId');
    var payType = request('payType');
    var singlePrice;//单价
    var buckleWaterRate;//扣水量
    var invoice_title = '';//订单发票
    var invoice_detail_html = '';
    var orderDetalFunc = {};

    /**
     *初始化*
     **/
    orderDetalFunc.init = function () {
        this.detail();//订单详情
        this.template();
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
                //线下支付跳转至线下支付详情页
                if(data.payType==0){
//                	window.location.href='/p_order_detail_offLine.html?orderId='+data.id;
                	window.open('/p_order_detail_offLine.html?orderId='+data.id);
                	return ;
                }
                singlePrice = data.buyPrice;//单价
                buckleWaterRate = data.tenderBean.buckleWaterRate;//扣水量
                var Moneystaus = data.status;
                var finalPaymentStatus = data.finalPaymentStatus;
                var bagAmount = data.bagAmount;
                orderDetalFunc.detailLeft(data);
                orderDetalFunc.detailRight(data);
                orderDetalFunc.detailProgress(data);//提货信息详情
                orderDetalFunc.deliveryList(data.orderType);//提货信息详情
                orderDetalFunc.detailMiddle(data);
                orderDetalFunc.detailBottom(data);
                //存在发票则显示
                if(data.invoiceBean){
                    //type类型:1增值税发票,2普通发票
                    if(data.invoiceBean.type==1){
                        $(".invoice_title").html("增值税发票 " + data.invoiceBean.companyName);
                        $('.invoice_detail').removeClass('hide');
                    }else{
                        $(".invoice_title").html("普通发票 " + data.invoiceBean.invoiceTitle);
                    }
                    $('.block_invoice').removeClass('hide');
                    orderDetalFunc.detailInvoice(data);
                }
                var appentStr = orderDetalFunc.dealMoney(data,Moneystaus,finalPaymentStatus,bagAmount);
                $('.block-detail').append(appentStr);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }
    /**
     *编辑提货信息*
     **/
    orderDetalFunc.secondOpt = function (data) {
        $('.edit,.carry-goods').on('click', function () {
            // orderDetalFunc.submitIofo(data)
//            window.location.href = 'p_apply_delivery.html?orderId=' + orderId;
            window.open('p_apply_delivery.html?orderId=' + orderId);
        })
    }

    orderDetalFunc.submitIofo = function (data) {
        var carHtml = '';
        interface.carList({
            pageSize: 0
        }, function (resp) {
            if (resp.code == 0) {
                var carList = resp.data.content;
                for (var i = 0; i < carList.length; i++) {
                    carHtml += "<span data-id='" + carList[i].id + "' data-carNum='" + carList[i].carNum + "'><i></i>" + carList[i].carNum + "<b></b></span>";
                }
                orderDetalFunc.showCarDialog(data, carHtml);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }

    /**
     *提交提货人信息弹框显示*
     **/
    orderDetalFunc.showCarDialog = function (data, carHtml) {
        var infoHtml = '<div class="wrap">' +
            '<div class="title-info"><p class="color-36">剩余提货量：' + Number(data.quantity - data.totalSubmitQuantity) + '吨</p><p class="color-9d">中标量：' + data.quantity + '吨</p></div>' +
            '<ul>' +
            '<li><label>提货量<i class="red">*</i></label><input class="submitQuantity" type="text"/></li>' +
            '<li><label>提货联系人<i class="red">*</i></label><input class="deliveryConnectName" type="text"/></li>' +
            '<li><label>联系电话<i class="red">*</i></label><input class="deliveryConnectPhone" type="text"/></li>' +
            '<li><label>提货日期<i class="red">*</i></label><input class="deliveryConnectTime" type="text" readonly="readonly" onClick="WdatePicker({dateFmt:\'yyyy-MM-dd HH:mm:ss\'})"/></li>' +
            '<li><label>提货车辆<i class="red">*</i></label><div class="radio-options">'
            + carHtml +
            '</div>'+
            '</li>' +
             '<li><label style="visibility: hidden">新增车辆</label><input type="text" placeholder="例:京A12345" id="input_addCar"><button class="btnAddCar">新增车辆</button></li>'+
            '<li class="remark-box"><label>备注</label><textarea class="deliveryConnectMark" rows="3" cols="80" placeholder="请填写提货等备注信息。"></textarea></li>' +
            '</ul>' +
            '</div>';

        var d = dialogOpt({
            title: '填写提货单',
            class: 'edit-dialog',
            content: infoHtml,
            textOkey: '提交',
            textCancel: '取消',
            btn: 'btn2',
            funcOkey: function () {
                var deliveryConnectPhone = trim($('.deliveryConnectPhone').val());
                var deliveryConnectName = trim($('.deliveryConnectName').val());
                var deliveryConnectTime = trim($('.deliveryConnectTime').val().replace(' ', 'T'));
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
                    alertReturn('本次提货量不能为空');
                    return false;
                }

                if (submitQuantity < 30) {
                    alertReturn('本次提货量不能小于30');
                    return false;
                }

                if (submitQuantity > Number(data.quantity - data.totalSubmitQuantity)) {
                    alertReturn('本次提货量不能大于剩余提货量');
                    return false;
                }

                if (!deliveryConnectName) {
                    alertReturn('提货联系人不能为空');
                    return false;
                }
                if (!deliveryConnectPhone) {
                    alertReturn('联系电话不能为空');
                    return false;
                }

                if (!deliveryConnectTime) {
                    alertReturn('提货日期不能为空');
                    return false;
                }

                if (deliveryConnectTime < dateYMDHMSFormat(date)) {
                    alertReturn('提货日期不能小于当日时间');
                    return false;
                }
                if (carList.length == 0) {
                    alertReturn('请选择提货车辆');
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
                        alertReturn('成功提交提货信息，等待卖家联系');
                        orderDetalFunc.detail();
                        //orderDetalFunc.pation($this, data);
                        d.remove();
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                })
            }
        });
        // if ($("input.addCar").length == 0 && $(".edit-dialog ul li .radio-options span").length == 0) {
        //     $(".edit-dialog .radio-options").append('<input class="addCar" type="text"/>');
        //     orderDetalFunc.addCar();
        // }
        orderDetalFunc.checkBoxCar();
        orderDetalFunc.delCar();
        orderDetalFunc.addCar();
        // $(".edit-dialog ul li .btnAddCar").off('click').on('click', function () {
        //     if ($("input.addCar").length == 0) {
        //         $(".edit-dialog .radio-options").append('<input class="addCar" type="text"/>');
        //
        //     }
        // });
 }

    /**
     *选择提货车辆*
     **/
    orderDetalFunc.checkBoxCar = function () {
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
    orderDetalFunc.addCar = function () {
        $(".edit-dialog ul li .btnAddCar").off('click').on('click', function () {
            var carNum = $("#input_addCar").val();
            if (!carNum) {
                alertReturn('提货车不能为空');
                return false;
            }
            carNum = carNum.toLocaleUpperCase();
            if (!isCarNumber(carNum)) {
                alertReturn('请输入正确的车牌格式');
                return false;
            }
            interface.addCar({
                carNum: carNum
            }, function (resp) {
                if (resp.code == 0) {
                    //alertReturn("添加提货车成功");
                   // $(".edit-dialog ul li .radio-options input").remove();
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
                            orderDetalFunc.checkBoxCar();
                            orderDetalFunc.delCar();
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
    orderDetalFunc.delCar = function () {
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
                    //alertReturn("删除提货车成功");
                    $this.parent("span").remove();
                    // if ($("input.addCar").length == 0 && $(".edit-dialog ul li .radio-options span").length == 0) {
                    //     $(".edit-dialog .radio-options").append('<input class="addCar" type="text"/>');
                     //   orderDetalFunc.addCar();
                    // }
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }

    /**
     *详情上左部分*
     **/
    orderDetalFunc.detailLeft = function (data) {
        var endTime
        if (data.status == 1) {
            endTime = data.payEndTime;
        } else if (data.status == 2) {
            endTime = data.submitEndTime;
        } else if (data.status == 6) {
            endTime = data.deliveryEndTime;
        }
        else if (data.status == 3) {
            endTime = data.orderFinishTime;
        }

        $("#j_detailLeft").html(template('t:j_detailLeft', {data: data, userData: user.data}));
        countDown($('.clock'), endTime);

        $('#submit').on('click', function () {//提交订单
          // orderDetalFunc.pation(data);
//            window.location.href = "p_order_pay.html?orderId="+data.id;
            window.open("p_order_pay.html?orderId="+data.id);
        });
 //提醒买家付款或者验收
        $('.progress-l .btn-tips').on('click', function () {
            var timeHtml = '<div class="m-tips">确认提醒？</div>';
            var id = $(this).attr("data-id");
            var type = $(this).attr("data-type");
            var d = dialogOpt({
                title: '提示',
                class: 'order-tips',
                content: timeHtml,
                textOkey: '确定',
                textOkeyId: 'at_d_okid',
                textCancel: '取消',
                textCancelId: 'at_d_cancelid',
                btn: 'btn2',
                closeId: 'at_d_closeid',
                funcOkey: function () {
                    interface.confirmRemindBuyerPay({
                        id: id,
                        type: type
                    }, function (resp) {
                        d.remove();
                        orderDetalFunc.detail();
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            });
        });

        $("#update").on('click', function () {//更新提货记录
            var _orderDeliveryId = data.orderDeliveryId;
            interface.deliveryDetailList({
                id: _orderDeliveryId
            }, function (resp) {
                if (resp.code == 0) {
                    var data = resp.data;
                    //确认提货量
                    var countHtml = '<ul class="countBox">\
                         <div class="bid-com">\
                             <h3>提货信息</h3>\
                             <div class="submitQuantity"><span>' + data.submitQuantity + '吨</span><em>（提货量）</em></div>\
                             <div class="clearfloat">\
                                <p>\
                                    <label>提货人：</label>\
                                    <span>' + data.name + '</span>\
                                </p>\
                                <p>\
                                    <label>联系方式：</label>\
                                    <span>' + data.phone + '</span>\
                                </p>\
                                <p>\
                                    <label>提货时间：</label>\
                                    <span>' + dateFormat(data.submitTime) + '</span>\
                                </p>\
                             </div>\
                         </div>\
                         <div class="s-amount clearfloat">\
                             <p><span class="color-9d">买家剩余提货量：</span><em>' + data.limitSubmitQuantity + '</em>吨</p>\
                             <p><span class="color-9d">买家剩余提货金额 ：</span>¥<em>' + data.limitSubmitQuantityPrize + '</em></p>\
                             <p><span class="color-9d">买家已提货次数 ：</span><em>' + data.submitCount + '</em>次</p>\
                         </div>\
                         <ul class="s-input">\
                             <li><label>本次实际提货量：</label><input class="quantity" type="text"/>吨</li>\
                             <li><label>实际提货金额：</label><input readonly class="price" type="text"/>元</li>\
                         </ul>\
                         <div class="remark-box">\
                         <label for="">备注：</label>\
                         <textarea rows="3" cols="80" placeholder="请填写发货等备注信息。"></textarea>\
                         </div>\
                    </div>';

                    var d1 = dialogOpt({
                        title: '发货信息',
                        class: 'confirm-count',
                        content: countHtml,
                        textOkey: '提交',
                        textCancel: '取消',
                        btn: 'btn2',
                        funcOkey: function () {
                            var $this = $(this);
                            if ($this.hasClass('not')) {
                                return false;
                            }
                            var quantity = trim($('.quantity').val());
                            var price = trim($('.price').val());
                            var deliveryRemark = trim($('.remark-box textarea').val());
                            if (!trim(quantity)) {
                                alertReturn('请输入本次实际提货量');
                                return false;
                            } else {
                                if (!isInteger(trim(quantity))) {
                                    alertReturn('本次实际提货量必须为大于0的数字');
                                    return false;
                                }
                            }
                            if (quantity.indexOf('.') > 0 && quantity.toString().split(".")[1].length > 3) {
                                alertReturn('本次实际提货量最多有三位小数');
                                return false;
                            }
                            if (deliveryRemark.length > 120) {
                                alertReturn('备注信息不得超出120字符限制');
                                return false;
                            }
                            //} else if (finish == "") {
                            //    alertReturn('请勾选发货状态');
                            //    return false;
                            //}
                            $this.addClass('not');
                            interface.delivery({
                                quantity: quantity,
                                price: price,
                                id: _orderDeliveryId,
                                deliveryRemark: deliveryRemark
                            }, function (resp) {
                                if (resp.code == 0) {
//                                    if (finish == 'true') {
//                                        alertReturn('已完成发货，等待买家确认收货');
//                                    } else if (finish == 'false') {
//                                        alertReturn('成功提交发货信息');
//                                    }
                                    alertReturn('成功提交发货信息');
                                    d1.remove();
                                    orderDetalFunc.detail();
                                } else {
                                    alertReturn(resp.exception);
                                }
                                $this.removeClass('not');
                            }, function (resp) {
                                $this.removeClass('not');
                                alertReturn(resp.exception);
                            })
                        }
                    });
                    //输入实际提货量显示实际提货金额
                    $('.countBox .quantity').on('input', function () {
                        var quantity = trim($(".quantity").val());
                        if (quantity == "") {
                            $(".countBox .price").val("");
                        } else {
                            if (quantity.indexOf('.') > 0 && quantity.toString().split(".")[1].length > 3) {
                                $(".quantity").val(Math.floor(Number(quantity) * 1000) / 1000);
                                return false;
                            }
//                            var totalCash = Number(quantity) * (1 - buckleWaterRate) * singlePrice//实际提货金额
                            var totalCash = Number(quantity) * singlePrice//实际提货金额
                            $(".countBox .price").val(f_double(totalCash));
                        }
                    });

                    //for ie
                    if (document.all) {
                        $('.countBox .quantity').each(function () {
                            var quantity = trim($(".quantity").val());
                            if (this.attachEvent) {
                                this.attachEvent('onpropertychange', function (e) {
                                    if (e.propertyName != 'value') return;
                                    if (quantity.indexOf('.') > 0 && quantity.toString().split(".")[1].length > 3) {
                                        $(".quantity").val(Math.floor(Number(quantity) * 1000) / 1000);
                                        return false;
                                    }
//                                    var totalCash = Number(quantity) * (1 - buckleWaterRate) * singlePrice//实际提货金额
                                    var totalCash = Number(quantity) * singlePrice//实际提货金额
                                    $(".countBox .price").val(f_double(totalCash));
                                });
                            }
                        })
                    }

                    //单选框
                    $('.ui-radio-options li').on('click', function () {
                        var $this = $(this);
                        if ($('.ui-radio-options li').hasClass('checked')) {
                            if ($this.siblings("li").hasClass('checked')) {
                                if (!$this.hasClass('checked')) {
                                    $('.ui-radio-options li').removeClass('checked');
                                    $this.addClass('checked');
                                }
                            }
                        } else {
                            $this.addClass('checked');
                        }
                    });
                }
            });

            orderDetalFunc.records();
        });

//        $('#finish').on('click', function () {//最后一次确认提货
//            orderDetalFunc.lastConfirm();
//        });

        /**
         *评价*
         **/
        $('.btn-evaluate').on('click', function () {
            evaluateDialog(orderId);
        });
        $('.btn-check').on('click', function () {
            evaluateDialog(orderId,true);
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

        //结算尾款(完成状态下)
        $('#settlement-end').on('click', function () {
            var $this = $(this);
            //var orderId = $this.parents('.item').attr('data-orderId');
            interface.goodsInfo({
                orderId: orderId
            }, function (resp) {
                if (resp.code == 0) {
                    var goodsData = resp.data;
                    orderDetalFunc.settlementEnd(goodsData);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });

        $("#delay").on('click', function () {//延迟收货时间
            var timeHtml = '<div class="delay-timeBox">\
                            <p>剩余提货时间：<span class="a-clock"></span></p>\
                            <div class="day">\
                                <label>延迟提货时间：</label>\
                                <input class="delayDays" type="text">天\
                            </div>\
                         </div>';
            var d = dialogOpt({
                title: '延迟提货时间',
                class: 'delay-time',
                content: timeHtml,
                textOkey: '提交',
                textCancel: '取消',
                btn: 'btn2',
                funcOkey: function () {
                    var $this = $(this);
                    if ($this.hasClass('not')) {
                        return false;
                    }
                    var delayDays = trim($('.delayDays').val());
                    if (!isZhengShu(delayDays)) {
                        alertReturn('最多延迟4天，请填写整数');
                        return false;
                    }
                    $this.addClass('not');
                    interface.delayOrder({
                        delayDays: delayDays,
                        id: orderId
                    }, function (resp) {
                        if (resp.code == 0) {
                            d.remove();
                            alertReturn('已成功延迟' + delayDays + '天收货时间');
                            orderDetalFunc.detail();
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

        $(".complain").on('click', function () {//申诉
            var optionHtml;
            if (data.orderType == 2) {
                optionHtml = '<option value="">请选择申诉原因</option>' +
                    '<option value="1">1、卖家迟迟不能更新提货信息 </option>' +
                    '<option value="2">2、卖家更新的提货信息误差太大 </option>' +
                    '<option value="3">3、卖家实际货物与描述不符 </option>' +
                    '<option value="4">4、卖家服务很差 </option>' +
                    '<option value="9">5、其他 </option>';
            } else if (data.orderType == 1) {
                optionHtml = '<option value="">请选择申诉原因</option>' +
                    '<option value="5">1、买家迟迟不来提货 </option>' +
                    '<option value="6">2、买家迟迟不能确认提货 </option>' +
                    '<option value="7">3、买家提货人信息有误 </option>' +
                    '<option value="8">4、买家态度不友好 </option>' +
                    '<option value="9">5、其他 </option>';
            }

            var timeHtml = '<div class="complain-box">' +
                '<label>申诉原因：</label>' +
                '<select id="at_od_ssyy" name="at_od_ssyy">' +
                '' + optionHtml + '' +
                '<textarea placeholder="在这里填写您的具体申诉原因"></textarea>' +
                '</select>' +
                '</div>';
            var d = dialogOpt({
                title: '订单申诉',
                class: 'complain-dialog',
                content: timeHtml,
                textOkey: '提交',
                textOkeyId: 'at_od_ssokid',
                textCancel: '取消',
                textCancelId: 'at_od_ssccid',
                closeId: 'at_od_sscloseid',
                btn: 'btn2',
                funcOkey: function () {
                    var $this = $(this);
                    if ($this.hasClass('not')) {
                        return false;
                    }
                    var type = $('.complain-box select').val();
                    if (!type) {
                        alertReturn('请选择申诉原因');
                        return false;
                    }
                    var detail = trim($('.complain-box textarea').val());
                    if (!detail) {
                        alertReturn('请填写申诉具体原因');
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
                            alertDialog('您的申诉提交成功，请耐心等候，我们会在24小时内解决您的问题。如情况比较紧急，请直接电话联系客服，以便快速处理问题。');
                            $(".progress-l .func-a :eq(0)").unbind("click").removeClass('complain').addClass('gray').html('已申诉');
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
     * 结算尾款
     */
    orderDetalFunc.settlementEnd = function (goodsData) {
        var leftPrice = Number(goodsData.finishPrice) - Number(goodsData.payedPrice);
        interface.currentUserInfo(function (resp) {//查询个人接口获取余额
            if (resp.code == 0) {
                var useableBalace = resp.data.useableBalace;
                var html = '<div class="settlement-box">' +
                    '<h1>恭喜您，交易成功！</h1>' +
                    '<p class="desc">' +
                    '本次交易您的实际提货量超出中标量，将有<span class="color-red">' + leftPrice.toFixed(2) + '</span>元尾款需要支付，具体交易数据查看以下列表。' +
                    '</p>' +
                    '<div class="list">' +
                    '<h3>' + goodsData.tenderName + '</h3>' +
                    '<ul class="clearfloat color-9d">' +
                    '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
                    '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
                    '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(3) + '</span>吨</li>' +
                    '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
                    '</ul>' +
                    '<p class="left-cash">结算尾款：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</p>' +
                    '</div>' +
                    '</div>';
                var d = dialogOpt({
                    title: '结算尾款',
                    class: 'settlement-dialog',
                    content: html,
                    textOkey: '立即支付',
                    textCancel: '取消',
                    funcOkey: function () {
                        orderDetalFunc.settlementPay(goodsData, leftPrice, useableBalace);
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
     *详情上右部分*
     **/
    orderDetalFunc.detailRight = function (data) {
        $("#j_detailRight").html(template('t:j_detailRight', {data: data}));
    }


    //提货进度
    orderDetalFunc.detailProgress = function (data) {
        data.remainQuan = floatTool.subtract(Number(data.quantity),Number(data.totalSubmitQuantity));
        data.remainQuan = data.remainQuan < 0 ? 0 : data.remainQuan
//        data.remainQuan = floatTool.toFixed(data.remainQuan ,3);
        $("#j_goods-progress").html(template('t:j_goods-progress', {data: data, status: data.status}));
        var width = data.finishQuantity / data.quantity * 100;
        var width1 = data.totalDeliveryQuantity / data.quantity * 100;   //卖家已发货总量(吨) ,
        width = width > 100 ? 100 : width;
        width1 = width1 > 100 ? 100 : width1;
        $('.goods-progress .progress span.finished').css('width', width + '%');
        $('.goods-progress .progress span.delivery').css('width', width1 + '%');
        $(".goods-progress .progress").unbind("mouseover").bind("mouseover", function () {
            var $this = $(this);
            $this.find(".progress_details").show();
        }).unbind("mouseout").bind("mouseout", function () {
            var $this = $(this);
            $this.find(".progress_details").hide();
        });
    }

    //查询提货记录
    orderDetalFunc.deliveryList = function (orderType) {
        interface.deliveryList({
            orderId: orderId
        }, function (resp) {
            if (resp.data.length > 0) {
                $("#j_delivery_list").html(template('t:j_delivery_list', {list: resp.data, orderType: orderType}));
                orderDetalFunc.deliveryListCheck(orderType); //验收提货单
                orderDetalFunc.deliveryListDetails(orderType); //提货单详情
                orderDetalFunc.deliveryListDel(orderType); //删除提货单
            }else{
                $("#j_delivery_list").html('');
            }
        });
    }

    //删除提货单
    orderDetalFunc.deliveryListDel = function (orderType) {
        $('.order-detail .delivery-list table td .btn-del').on('click', function () {
            var id = $(this).parents("tr").attr("data-id");
            var countHtml = ' <div class="bid-com">确定删除该提货单吗？ </div>';
            var d1 = dialogOpt({
                title: '提示',
                class: 'deliveryListDel',
                content: countHtml,
                textOkey: '确定',
                textCancel: '取消',
                btn: 'btn2',
                funcOkey: function () {
                    interface.deliveryListDel({
                        id: id
                    }, function (resp) {
                        if (resp.code == 0) {
                            d1.remove();
                            orderDetalFunc.deliveryList(orderType);
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    });
                }
            });
        });
    }
    //提货单详情
    orderDetalFunc.deliveryListDetails = function (orderType) {
        $('.order-detail .delivery-list table td .btn-details').on('click', function () {
            var id = $(this).parents("tr").attr("data-id");
            var status = $(this).parents("tr").attr("data-status");
//            window.location.href = 'p_delivery_detail.html?orderId='+orderId+"&detailId="+id;
            window.open('p_delivery_detail.html?orderId='+orderId+"&detailId="+id);
            // interface.deliveryDetailList({
            //     id: id
            // }, function (resp) {
            //     var data = resp.data;
            //     if (resp.data.cars != null) {
            //         if (resp.data.cars.indexOf(",") > 1) {
            //             var cars = resp.data.cars.replace(/,/g, '、');
            //         } else {
            //             var cars = resp.data.cars;
            //         }
            //     } else {
            //         var cars = "";
            //     }
            //     if (status == 1) { //未发货
            //         var countHtml = ' <div class="bid-com">\
            //                  <h1>待发货</h1>\
            //               <div class="quantity"><span>' + data.submitQuantity + '吨</span><em>（提货量）</em></div>\
            //                  <div class="clearfloat">\
            //                     <p>\
            //                         <label>提货人：</label>\
            //                         <span>' + data.name + '</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>联系电话：</label>\
            //                         <span>' + data.phone + '</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>提货日期：</label>\
            //                         <span>' + dateFormat(data.submitTime) + '</span>\
            //                     </p>\
            //                     <p>\
            //                      <label>提货车辆：</label>\
            //                      <span>' + cars + '</span>\
            //                     </p>\
            //                      <p>\
            //                          <label>所属公司：</label>\
            //                          <span>' + data.buyer + '</span>\
            //                      </p>\
            //                      <p>\
            //                          <label>备注：</label>\
            //                          <span>' + data.submitRemark + '</span>\
            //                      </p>\
            //                  </div>\
            //         </div>';
            //     } else if (status == 2) { //待验收
            //         var countHtml = ' <div class="bid-com">\
            //                 <h1>待验收</h1>\
            //                 <h3>发货信息</h3>\
            //                  <div class="quantity"><span>' + data.quantity + '吨</span><em>（实际发货量）</em></div>\
            //                  <div class="clearfloat">\
            //                     <p>\
            //                         <label>提货单价：</label>\
            //                         <span>' + data.buyPrice + '元</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>剩余提货量：</label>\
            //                         <span>' + data.limitSubmitQuantity + '吨</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>指标含量：</label>\
            //                         <span>' + data.content + '</span>\
            //                     </p>\
            //                     <p>\
            //                      <label>发货时间：</label>\
            //                      <span>' + dateYMDHMSFormat(data.deliveryTime) + '</span>\
            //                     </p>\
            //                      <p>\
            //                          <label>所属公司：</label>\
            //                          <span>' + data.supplier + '</span>\
            //                      </p>\
            //                      <p>\
            //                          <label>备注：</label>\
            //                          <span>' + data.deliveryRemark + '</span>\
            //                      </p>\
            //                  </div>\
            //         </div>';
            //     } else if (status == 3) { //已验收
            //         var countHtml = ' <div class="bid-com">\
            //                  <h1 >已验收</h1>\
            //                  <h3>发货信息</h3>\
            //                  <div class="quantity"><span>' + data.quantity + '吨</span><em>（实际发货量）</em></div>\
            //                  <div class="clearfloat">\
            //                     <p>\
            //                         <label>提货单价：</label>\
            //                         <span>' + data.buyPrice + '元</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>剩余提货量：</label>\
            //                         <span>' + data.limitSubmitQuantity + '吨</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>指标含量：</label>\
            //                         <span>' + data.content + '</span>\
            //                     </p>\
            //                     <p>\
            //                      <label>发货时间：</label>\
            //                      <span>' + dateYMDHMSFormat(data.deliveryTime) + '</span>\
            //                     </p>\
            //                      <p>\
            //                          <label>所属公司：</label>\
            //                          <span>' + data.supplier + '</span>\
            //                      </p>\
            //                      <p>\
            //                          <label>备注：</label>\
            //                          <span>' + data.deliveryRemark + '</span>\
            //                      </p>\
            //                  </div>\
            //                  <h2>提货信息</h2>\
            //                  <div class="quantity"><span>' + data.submitQuantity + '吨</span><em>（提货量）</em></div>\
            //                  <div class="clearfloat">\
            //                     <p>\
            //                         <label>提货人：</label>\
            //                         <span>' + data.name + '</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>联系电话：</label>\
            //                         <span>' + data.phone + '</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>提货日期：</label>\
            //                         <span>' + dateFormat(data.submitTime) + '</span>\
            //                     </p>\
            //                     <p>\
            //                      <label>提货车辆：</label>\
            //                      <span>' + cars + '</span>\
            //                     </p>\
            //                      <p>\
            //                          <label>所属公司：</label>\
            //                          <span>' + data.buyer + '</span>\
            //                      </p>\
            //                      <p>\
            //                          <label>备注：</label>\
            //                          <span>' + data.submitRemark + '</span>\
            //                      </p>\
            //                  </div>\
            //         </div>';
            //     }
            //     <!--orderType:1:卖家；2：买家-->
            //
            //     if (orderType == 1) {
            //         var d1 = dialogOpt({
            //             title: '发货单',
            //             class: 'deliveryListCheck',
            //             content: countHtml,
            //             textCancel: '关闭',
            //             btn: 'btn2',
            //             funcOkey: function () {
            //                 d1.remove();
            //             }
            //         });
            //     } else if (orderType == 2) {
            //         var d1 = dialogOpt({
            //             title: '提货单',
            //             class: 'deliveryListCheck',
            //             content: countHtml,
            //             textCancel: '关闭',
            //             btn: 'btn2',
            //             funcOkey: function () {
            //                 d1.remove();
            //             }
            //         });
            //     }
            // });
        });
    }

    //验收提货单
    orderDetalFunc.deliveryListCheck = function (orderType) {
        $('.order-detail .delivery-list table td .btn-check').on('click', function () {
            var id = $(this).parents("tr").attr("data-id");
//            window.location.href = 'p_delivery_detail.html?orderId='+orderId+"&detailId="+id;
            window.open('p_delivery_detail.html?orderId='+orderId+"&detailId="+id);
            // interface.deliveryDetailList({
            //     id: id
            // }, function (resp) {
            //     var data = resp.data;
            //     var countHtml = ' <div class="bid-com">\
            //                 <h1>待验收</h1>\
            //                 <h3>发货信息</h3>\
            //                  <div class="quantity"><span>' + data.quantity + '吨</span><em>（实际发货量）</em></div>\
            //                  <div class="clearfloat">\
            //                     <p>\
            //                         <label>提货单价：</label>\
            //                         <span>' + data.buyPrice + '元</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>剩余提货量：</label>\
            //                         <span>' + data.limitSubmitQuantity + '吨</span>\
            //                     </p>\
            //                     <p>\
            //                         <label>指标含量：</label>\
            //                         <span>' + data.content + '</span>\
            //                     </p>\
            //                     <p>\
            //                      <label>发货时间：</label>\
            //                      <span>' + dateYMDHMSFormat(data.deliveryTime) + '</span>\
            //                     </p>\
            //                      <p>\
            //                          <label>所属公司：</label>\
            //                          <span>' + data.supplier + '</span>\
            //                      </p>\
            //                      <p>\
            //                          <label>备注：</label>\
            //                          <span>' + data.deliveryRemark + '</span>\
            //                      </p>\
            //                  </div>\
            //         </div>';
            //     var d1 = dialogOpt({
            //         title: '发货单',
            //         class: 'deliveryListCheck',
            //         content: countHtml,
            //         textOkey: '确认收货',
            //         textCancel: '取消',
            //         btn: 'btn2',
            //         funcOkey: function () {
            //             interface.ensureDelivery({
            //                 id: id
            //             }, function (resp) {
            //                 if (resp.code == 0) {
            //                     d1.remove();
            //                     orderDetalFunc.deliveryList(orderType);
            //                     alertReturn("恭喜您，单次提货验收成功。");
            //                 } else {
            //                     alertReturn(resp.exception);
            //                 }
            //             }, function (resp) {
            //                 alertReturn(resp.exception);
            //             });
            //         }
            //     });
            // });
        });
    }
    /**
     *详情中间部分*
     **/
    orderDetalFunc.detailMiddle = function (data) {
        $("#j_detailMiddle").html(template('t:j_detailMiddle', {data: data}));
        orderDetalFunc.secondOpt(data);
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
                    dialogOpt({
                        title: '提货记录',
                        class: 'bid-record',
                        content: html,
                        textOkey: '关闭',
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
        $("#j_detailBottom").html(template('t:j_detailBottom', {data: data, _userId: user.data.id}));
        orderDetalFunc.dealwithImg();
        orderDetalFunc.bindFollow();
        $('.block-detail table tr td span.enter_details').on('click', function () {
            var id = $(this).attr("data-id");
            var userId = $(this).attr("data-userId");
            var type = $(this).attr("data-type");
            if (user && user.login && user.data.id == userId) {
//                window.location.href = 'p_bid_detail_seller.html?tenderId=' + id + '&from=order&type='+type;
                window.open('p_bid_detail_seller.html?tenderId=' + id + '&from=order&type='+type);
            } else {
//                window.location.href = 'p_bid_detail_buyer.html?tenderId=' + id + '&from=order&type='+type;
                window.open('p_bid_detail_buyer.html?tenderId=' + id + '&from=order&type='+type);
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
    **发票详情处理
     */
    orderDetalFunc.detailInvoice=function(data){
        var invoice_list = data.invoiceBean;
        if(invoice_list){
            var addr = '';
            if(invoice_list.receiveCountry == '中国'){
                addr = '-'+invoice_list.receiveProvince+'-'+invoice_list.receiveCity;
            }else{
                addr = '';
            }
            addr = invoice_list.receiveCountry+addr;
            var companyPhone =invoice_list.companyPhoneAreaCode?invoice_list.companyPhoneAreaCode+' '+invoice_list.companyPhone:'+86'+' '+invoice_list.companyPhone;
            var receivePhone =invoice_list.receivePhoneAreaCode?invoice_list.receivePhoneAreaCode+' '+invoice_list.receivePhone:'+86'+' '+invoice_list.receivePhone;
            var invoice_list_html = '';
            invoice_list_html = '<div class="invoice_dialog">'+
                    '<p class="invoice_tip">此处发票信息为买家所提供，具体开票方式请联系买家进行确认～</p>' +
                    '<div class="company_message"><h1>公司信息</h1><ul>' +
                    '<li><span class="asterisk">*</span><label>公司名称：</label>'+invoice_list.companyName+'</li>' +
                    '<li><span class="asterisk">*</span><label>公司税号：</label>'+invoice_list.companyTax+'</li>' +
                    '<li><span class="asterisk">*</span><label>开户银行：</label>'+invoice_list.companyBank+'</li>' +
                    '<li><span class="asterisk">*</span><label>银行账号：</label>'+invoice_list.companyBankCard +'</li>' +
                    '<li><span class="asterisk">*</span><label>公司地址：</label>'+invoice_list.companyAddr+'</li>' +
                    '<li><span class="asterisk">*</span><label>联系电话：</label>'+companyPhone+'</li></ul>' +
                    '</div>' +
                    '<div class="send_address"><h1>寄送地址</h1><ul>' +
                    '<li><span class="asterisk">*</span><label>收票人姓名：</label>'+invoice_list.receiveUserName+'</li>' +
                    '<li><span class="asterisk">*</span><label>收票人手机：</label>'+receivePhone+'</li>' +
                    '<li><span class="asterisk">*</span><label>寄送地址：</label>'+ addr+'-'+invoice_list.receiveAddr+'</li></ul>' +
                    '</div>' +
                    '</div>';
            invoice_detail_html = invoice_list_html;
            $(".invoice_detail").bind('click',function () {
                var html = invoice_list_html;
                var d1 = dialogOpt({
                    title: '发票详情',
                    class: 'invoice_detail_area',
                    content: html,
                    textOkey: '',
                    textCancel: '关闭',
                    funcOkey:''
                });
            });
        }
    }
    orderDetalFunc.dealMoney=function(data,staus,finalPaymentStatus,bagAmount){
        var htmlStr = '<div class="clearfloat trade_money_area"><p><span class="trade_money_detail have_trade">'
        data.realPayedAmount = formatCurrency(data.realPayedAmount);
        data.couponAmount = formatCurrency(data.couponAmount);
        data.sumPrice = formatCurrency(data.sumPrice);
        data.finalPayment = formatCurrency(data.finalPayment);
//        bagAmount = formatCurrency(bagAmount);
        function dealPaymentStatus(status,finalPayment){
            var statusObj = {};
            if(status == 1||status == 6){
                statusObj.sumPriceStr = '预付金额：';
                statusObj.finalPaymentStr = '尾款：';
                statusObj.MonStr = '￥'+finalPayment;
            }else if(status == 2){
                    statusObj.sumPriceStr = '预付金额（已付款）：';
                    statusObj.finalPaymentStr = '尾款（等待付款）：';
                    statusObj.MonStr = '￥'+finalPayment;
            }else if(status == 3){
                statusObj.sumPriceStr = '预付金额（已付款）：';
                statusObj.finalPaymentStr = '尾款（已付款）：';
                statusObj.MonStr = '￥'+finalPayment;
            }else if(status == 4){
                statusObj.sumPriceStr = '预付金额（已付款）：';
                statusObj.finalPaymentStr = '尾款（等待退款）：';
                statusObj.MonStr = '-￥'+finalPayment;
            }else if(status == 5){
                statusObj.sumPriceStr = '预付金额（已付款）：';
                statusObj.finalPaymentStr = '尾款（已退款）：';
                statusObj.MonStr = '-￥'+finalPayment;
            }
            return statusObj;
        }
        var dealStr = dealPaymentStatus(finalPaymentStatus,data.finalPayment);
        if(staus == 1){
            htmlStr +='应付总额：</span><span class="have_trade_money">￥'+data.sumPrice+'</span></p>' +
                    '<div><span class="trade_money_detail trade_grey">商品总额：</span><span>￥'+data.sumPrice+'</span></div>'+
                    '<div><span class="trade_money_detail trade_grey">优惠券：</span><span>-￥'+data.couponAmount+'</span></div>'+
                    '</div>';

        }else{
            htmlStr += '已付款：</span><span class="have_trade_money">￥'+data.realPayedAmount+'</span></p>' +
                '<p><span class="trade_money_detail trade_grey">'+dealStr.sumPriceStr+'</span><span>￥'+data.sumPrice+'</span></p>'+
                '<p><span class="trade_money_detail trade_grey">'+dealStr.finalPaymentStr+'</span><span>'+dealStr.MonStr +'</span></p>'+
                '<p><span class="trade_money_detail trade_grey">优惠券：</span><span>-￥'+data.couponAmount+'</span></p>';
            if(bagAmount){
                if(bagAmount>0){
                    htmlStr += '<div><span class="trade_money_detail trade_grey">吨袋：</span><span>￥'+ formatCurrency(bagAmount)+'</span></div>'+
                        '</div>'
                }
            }else{
                htmlStr +='</div>'
            }
        }
        return htmlStr;
    }
    orderDetalFunc.checkDetail = function (json) {
        var contract = require('./p_contract.js').contractListFunc;
        var identity = contract.getParterAndMeInfo(json.contractBean);
        var buyerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.name + "</h4></div><div class='offline-item1 offline-tooltip'><img src=" + json['contractBean'][identity.pre + "UploadUrl"] + " alt=''></div><div class='offline-item1 color-success'><p>上传成功！</p></div></div>";
        var suppilerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.parter + "</h4></div><div class='offline-item1 offline-tooltip'><img src=" + json['contractBean'][identity.parterPre + "UploadUrl"] + " alt=''></div><div class='offline-item1 color-success'><p>上传成功！</p></div></div>";
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>双方上传协议成功！</h4>" +
            "</div>" + buyerHtml + suppilerHtml;
        var line_opt = dialogOpt({
            title: '查看详情',
            class: 'dialogOpt-lg',
            content: html,
            textCancel: '关闭',
            funcCancel: function () {
                line_opt.remove();
            }

        });
        contract.bindOfflineEvent(json.contractBean);
    }
    /**
     *立即付款弹框*
     **/
    orderDetalFunc.pation = function (data) {
        gpc_immediatePayment(data);
    }

    //密码弹框
    orderDetalFunc.tradePasswordDialog = function (leftPrice, bankId, thirdType, payType, id, isPay) {
        var html = '<div class="password-box">' +
            '<h1>请输入交易密码</h1>' +
            '<input class="trade-passwd" type="password"/>' +
            '<a href="p_trade_password.html" target="_blank">忘记交易密码?</a>' +
            '</div>';
        if (!payType) {
            payType = 2;
        }
        var d1 = dialogOpt({
            title: '交易密码',
            class: 'password-dialog',
            content: html,
            textOkey: '确认',
            textCancel: '取消',
            funcOkey: function () {
                var tradePassword = $(".password-dialog .trade-passwd").val();
                if (!tradePassword) {
                    alertReturn('请输入支付密码');
                    return false;
                }
                if (isPay == 1) {
                    interface.payOrder({
                        thirdPayType: thirdType,
                        orderId: id,
                        payType: payType,
                        bankId: bankId,
                        tradePassword: tradePassword
                    }, function (resp) {
                        if (resp.code == 0) {
                            if (payType == 2) {
                                openwin(resp.data);
                                d1.remove();
                                var tipsHtml = '<p>您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口 </p>' +
                                    '<a class="tips-a">已完成支付</a>';
                                dialogOpt({
                                    title: '登录网上银行支付',
                                    class: 'tips-dialog',
                                    content: tipsHtml,
                                    textOkey: '关闭',
                                    btnClass: 'btn1',
                                    funcOkey: function () {
                                        window.location.reload();
                                    }
                                })

                                $('.tips-a').on('click', function () {
                                    window.location.reload();
                                });
                            } else if(payType == 1){
                                orderDetalFunc.detail();
                                orderDetalFunc.firstPay();
                                d1.remove();
                            } else if(payType == 0){
                                window.location='p_order_detail_offLine.html?orderId='+id;
                            }
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    }, false);
                } else if (isPay == 2) {
                    interface.settle({
                        id: id,
                        payType: payType,
                        thirdPayType: thirdType,
                        bankId: bankId,
                        tradePassword: tradePassword
                    }, function (resp) {
                        if (resp.code == 0) {
                            if (payType == 2) {
                                openwin(resp.data);
                                d1.remove();
                                var tipsHtml = '<p>您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口 </p>' +
                                    '<a class="tips-a">已完成支付</a>';
                                dialogOpt({
                                    title: '登录网上银行支付',
                                    class: 'tips-dialog',
                                    content: tipsHtml,
                                    textOkey: '关闭',
                                    btnClass: 'btn1',
                                    funcOkey: function () {
                                        window.location.reload();
                                    }
                                })

                                $('.tips-a').on('click', function () {
                                    window.location.reload();
                                });
                            } else {
                                orderDetalFunc.detail();
                                orderDetalFunc.secondPay(leftPrice, id);
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

    //首次支付成功提示
    orderDetalFunc.firstPay = function () {
        var tipsHtml = '<h1>支付成功！</h1>' +
            '<h2>请尽快提交提货申请，以便卖家做好提货准备。</h2>';
        var d2 = dialogOpt({
            title: '付款通知',
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: '关闭',
            funcOkey: function () {
                d2.remove();
            }
        });
    }

    //尾款结算成功提示
    orderDetalFunc.secondPay = function (leftPrice, id) {
        var tipsHtml = '<h1>支付尾款成功！</h1>' +
            '<h2>本次交易您的实际提货量超出中标量，已成功支付<i class="red">' + leftPrice.toFixed(2) + '元</i>尾款。</h2>';
        var d2 = dialogOpt({
            title: '结算通知',
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: '评价',
            textCancel: '关闭',
            funcOkey: function () {
                evaluateDialog(id);
                d2.remove();
            }
        });
    }


    //没有设置密码
    orderDetalFunc.noPassword = function (id) {
        var tipsHtml = '<h2 class="noPassword">您还未设置交易密码，不具备相关交易资格，请先前往个人中心进行交易密码设置～ </h2>';
        var d2 = dialogOpt({
            title: '提示',
            class: 'tips-dialog',
            content: tipsHtml,
            textOkey: '去设置',
            textCancel: '取消',
            funcOkey: function () {
                d2.remove();
//                window.location.href = 'p_trade_password.html?orderId=' + id + '&from=noPassword';
                window.open('p_trade_password.html?orderId=' + id + '&from=noPassword');
            }
        });
    }

    /**
     * 最后一次确认提货*
     * */
//    orderDetalFunc.lastConfirm = function () {
//        interface.goodsInfo({
//            orderId: orderId
//        }, function (resp) {
//            if (resp.code == 0) {
//                var goodsData = resp.data;
//                var leftQuantitty = Number(goodsData.quantity) - Number(goodsData.finishQuantity);
//                var leftPrice = floatTool.subtract(Number(goodsData.sumPrice), Number(goodsData.finishPrice));
//                var infoHtml = '<div class="goods-box">' +
//                    '<div class="count">提货次数：<span class="color-red">' + goodsData.deliveryCount + '</span>次</div>' +
//                    '<h1 class="clearfloat">' +
//                    '<span class="fl">提货进度 : ' + goodsData.finishQuantity + '吨 / ' + goodsData.quantity + '吨</span>' +
//                    '</h1>' +
//                    '<div class="progress">' +
//                    '<span class="finished"></span>' +
//                    '</div>' +
//                    '<ul class="clearfloat">' +
//                    '<li>已提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(2) + '</span>吨</li>' +
//                    '<li>已提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
//                    '</ul>' +
//                    '<ul class="clearfloat padding">' +
//                    '<li>剩余提货量：<span class="color-red">' + leftQuantitty.toFixed(2) + '</span>吨</li>' +
//                    '<li>剩余提货金额：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</li>' +
//                    '</ul>' +
//                    '</div>'
//                var d = dialogOpt({
//                    title: '提货信息',
//                    class: 'goods-info-dialog',
//                    content: infoHtml,
//                    textOkey: '确认收货',
//                    textCancel: '取消',
//                    btn: 'btn2',
//                    funcOkey: function () {
//                        interface.finishOrder({
//                            id: orderId
//                        }, function (resp) {
//                            if (resp.code == 0) {
//                                d.remove();
//                                orderDetalFunc.detail();//订单详情
//                                //获取最新数据
//                                goodsData.finishPrice = resp.data.finishPrice;
//                                goodsData.finishQuantity = resp.data.finishQuantity;
//                                orderDetalFunc.settlement(goodsData);
//                            } else {
//                                alertReturn(resp.exception);
//                            }
//                        }, function (resp) {
//                            alertReturn(resp.exception);
//                        })
//                    }
//                })
//                var width = goodsData.finishQuantity / goodsData.quantity * 100;
//                width = width > 100 ? 100 : width;
//                $('.progress span').css('width', width + '%');
//            } else {
//                alertReturn(resp.exception);
//            }
//        }, function (resp) {
//            alertReturn(resp.exception);
//        })
//    }

    /**
     * 结算*
     * */
//    orderDetalFunc.settlement = function (goodsData) {
//        var id = goodsData.id;  //调用评论弹框
//        if (Number(goodsData.finishPrice) < Number(goodsData.payedPrice)) {//退款
//            var leftPrice = Number(goodsData.payedPrice) - Number(goodsData.finishPrice);
//            var html = '<div class="settlement-box">' +
//                '<h1>恭喜您，交易成功！</h1>' +
//                '<p class="desc">' +
//                '本次交易您的实际提货量低于中标量，将有<span class="color-red">' + leftPrice.toFixed(2) + '</span>元尾款退入账户余额中（如公司交易，将退入公司账号余额中），请及时查看。具体交易数据查看以下列表。' +
//                '</p>' +
//                '<div class="list">' +
//                '<h3>' + goodsData.tenderName + '</h3>' +
//                '<ul class="clearfloat color-9d">' +
//                '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
//                '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
//                '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(2) + '</span>吨</li>' +
//                '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
//                '</ul>' +
//                '<p class="left-cash">退还尾款：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</p>' +
//                '</div>' +
//                '</div>';
//            var d = dialogOpt({
//                title: '结算尾款',
//                class: 'settlement-dialog',
//                content: html,
//                textOkey: '评价',
//                textCancel: '关闭',
//                funcOkey: function () {
//                    //评价弹框-待完成
//                    d.remove();
//                    evaluateDialog(id);
//                }
//            })
//        } else if (Number(goodsData.finishPrice) > Number(goodsData.payedPrice)) {//补款-结算尾款
//            var leftPrice = Number(goodsData.finishPrice) - Number(goodsData.payedPrice);
//            interface.currentUserInfo(function (resp) {//查询个人接口获取余额
//                if (resp.code == 0) {
//                    var useableBalace = resp.data.useableBalace;
//                    var html = '<div class="settlement-box">' +
//                        '<h1>恭喜您，交易成功！</h1>' +
//                        '<p class="desc">' +
//                        '本次交易您的实际提货量超出中标量，将有<span class="color-red">' + leftPrice.toFixed(2) + '</span>元尾款需要支付。具体交易数据查看以下列表。' +
//                        '</p>' +
//                        '<div class="list">' +
//                        '<h3>' + goodsData.tenderName + '</h3>' +
//                        '<ul class="clearfloat color-9d">' +
//                        '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
//                        '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
//                        '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(2) + '</span>吨</li>' +
//                        '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
//                        '</ul>' +
//                        '<p class="left-cash">结算尾款：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</p>' +
//                        '</div>' +
//                        '</div>';
//                    var d = dialogOpt({
//                        title: '结算通知',
//                        class: 'settlement-dialog',
//                        content: html,
//                        textOkey: '结算',
//                        textCancel: '取消',
//                        funcOkey: function () {
//                            orderDetalFunc.settlementPay(goodsData, leftPrice, useableBalace);
//                            d.remove();
//                        }
//                    });
//                } else {
//                    alertReturn(resp.exception);
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            })
//        } else {//提货量等于中标量
//            var html = '<div class="settlement-box">' +
//                '<h1>恭喜您，交易成功！</h1>' +
//                '<p class="desc">' +
//                '本次交易您的实际提货量与中标量相同，没有金额差价，请及时查看订单详情。具体交易数据查看以下列表。' +
//                '</p>' +
//                '<div class="list">' +
//                '<h3>' + goodsData.tenderName + '</h3>' +
//                '<ul class="clearfloat color-9d">' +
//                '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
//                '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
//                '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(2) + '</span>吨</li>' +
//                '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
//                '</ul>' +
//                //'<p class="left-cash">结算尾款：<span class="color-red">0.00</span>元</p>' +
//                '</div>' +
//                '</div>';
//            var d = dialogOpt({
//                title: '结算尾款',
//                class: 'settlement-dialog',
//                content: html,
//                textOkey: '评价',
//                textCancel: '关闭',
//                funcOkey: function () {
//                    //评价弹框-待完成
//                    d.remove();
//                    evaluateDialog(id);
//                }
//            });
//        }
//    }

    /**
     * 结算支付*
     * */
    orderDetalFunc.settlementPay = function (goodsData, leftPrice, useableBalace) {
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
            '<h3>订单号：' + goodsData.orderNum + '</h3>' +
            '<p>结算尾款：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</p>' +
            '</div>' +
            '<div class="pay-bottom">' +
            '<h3>余额支付</h3>' +
            '<ul class="m-personal">' +
            '<li data-type="1" class="' + payClass + ' balance-pay">' +
            '<i class=""></i><label>账户余额<span>' + useableBalace.toFixed(2) + '</span>元</label>' +
            '</li>' +
            '</ul>' +
            '<h3>网银支付</h3>' +
            '<ul class="m-bank">' +
            '<li data-thirdPayType="B2C" data-type="1">' +
            '<i></i><label>个人网银</label>' +
            '</li>' +
            '<li data-thirdPayType="B2B" data-type="2">' +
            '<i></i><label>企业网银</label>' +
            '</li>' +
            '</ul>' +
            '<div class="bank-list">' + bankListHtml +
            '<div class="bank-more"><h1>更多银行</h1></div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var d1 = dialogOpt({
            title: '结算尾款',
            class: 'settlementPay-dialog',
            content: tipsHtml,
            textOkey: '立即支付',
            textCancel: '取消',
            funcOkey: function () {
                var thirdType = $('.pay-type .m-bank li.checked').attr('data-type');
                var payType = $('.pay-type .m-personal li.checked').attr('data-type');
                var id = goodsData.id;
                var isPay = 2;  //结算尾款

                if (!(payType || thirdType)) {
                    alertReturn('请选择支付方式');
                    return false;
                } else {
                    if (!payType) {
                        var thirdPayType = $('.pay-type .m-bank li.checked').attr('data-thirdPayType');
                        var bankId = $('.pay-type .pay-bottom .bank-list span.checked').attr('data-id');
                        if (!bankId) {
                            alertReturn('请选择银行');
                            return false;
                        }
                    }
                }
                orderDetalFunc.tradePasswordDialog(leftPrice, bankId, thirdType, payType, id, isPay);
                d1.remove();
            }
        });

        if (Number(leftPrice) > Number(useableBalace)) {
            $('.no-tip').removeClass('hide');
            $('.online-pay').addClass('checked');
        } else {
            $('.pay-tip').removeClass('hide');
            $('.balance-pay').addClass('checked');
        }

        orderBankOperate(); //选择支付方式和银行
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
                el.text(d + '天' + h + '小时' + m + '分钟');
            } else {
                el.text(h + '小时' + m + '分钟');
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
            if (trim(_this.text()) == '关注') {
                //关注
                interface.follow({
                    userId: userId
                }, function (resp) {
                    if (resp.code == 0) {
                        _this.text('已关注');
                        _this.addClass('special');
                        _this.siblings('.focus_on_text').text('已接收该商家发布招标通知');
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
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

    orderDetalFunc.template = function () {
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
        //获取支付方式 0线下,1余额,2银行转账,
        template.helper('getPayType', function (payType) {
        	if(payType==0){
        		return "线下转账";
        	}
        	if(payType==1){
        		return "余额支付";
        	}
        	if(payType==2){
        		return "网银支付";
        	}
        });
    }

    orderDetalFunc.init();
});

