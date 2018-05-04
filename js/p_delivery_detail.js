/**
 *@authors Song
 * @date 2017-07-06
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var My97DatePicker = require('My97DatePicker');
    var http = require("http");
    require("interface");
    require("pagination");
    var global = require("global");
    var header = require("header");
    require("floatTool");//去除js运算精度问题
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    /**
     *init
     **/
    var loading = "loading";
    var user = getUser();
    var orderId = request('orderId');//订单id
    var detailId = request('detailId');//订单详情id
    var p_applyFn = {};
    var orderInfo ;
    var textArr = ['买家发起提货','卖家进行发货','买家开始验收','提货完成'];
    /*初始化*/
    p_applyFn.init = function (){
        p_applyFn.detailFn();
    };
    p_applyFn.detailFn = function () {
        interface.orderDetail({
            orderId: orderId
        }, function (resp) {
            if (resp.code == 0) {
                var data = resp.data;
                orderInfo = data;
                p_applyFn.parseData(data);
                p_applyFn.orderMessage(data);
                var needData = data;

                if(data.orderType == 1){//卖家
                    interface.deliveryDetailList({
                        id: detailId
                    }, function (resp) {
                        var data = resp.data;
                        if (resp.data.cars != null) {
                            if (resp.data.cars.indexOf(",") > 1) {
                                resp.data.cars = resp.data.cars.replace(/,/g, '、');
                            } else {
                                resp.data.cars = resp.data.cars;
                            }
                        } else {
                            resp.data.cars = "";
                        }
                        if(data.status ==1){
                            data.statusContent = '待发货';
                        }else if(data.status == 2){
                            data.statusContent = '待验收';
                        }else if(data.status == 3){
                            data.statusContent = '已验收';
                        }else if(data.status == 4){
                            data.statusContent = '已驳回';
                        }
                        data.downloadName = '下载发货单';
                        p_applyFn.BuyerTakeGoods(needData);
                        p_applyFn.takeGoodsMessage(data);
                        p_applyFn.gainGoodsMessage(data);
                        p_applyFn.SupplierGoodsTitle(data);
                        if(data.status){
                            if(data.status ==1 ){
                                var html1 = timeLineFn(textArr,2);
                                $(".apply_flow").html(html1);
                                $("#j_supplier_take_goods").removeClass("hide");
                                $("#j_order_title1").removeClass("hide");
                                $("#j_take_goods").removeClass("hide");
                                $("#j_gain_goods").addClass("hide");
                            }else if(data.status ==2 ){
                                var html2 = timeLineFn(textArr,3);
                                $(".apply_flow").html(html2);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_take_goods").addClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                            }else if(data.status == 3 ){
                                var html3 = timeLineFn(textArr,4);
                                $(".apply_flow").html(html3);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                            } else if(data.status == 4 ){
                                var html4 = timeLineFn(textArr,2);
                                $(".apply_flow").html(html4);
                                p_applyFn.rejectTem(data);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                                $(".order_reject .re_gain_goods").removeClass("hide");
                            }
                        }
                        p_applyFn.clcikEvent();
                    });
                }else if(data.orderType == 2){ //买家
                    interface.deliveryDetailList({
                        id: detailId
                    }, function (resp) {
                        var data = resp.data;
                        if (resp.data.cars != null) {
                            if (resp.data.cars.indexOf(",") > 1) {
                                resp.data.cars = resp.data.cars.replace(/,/g, '、');
                            } else {
                                resp.data.cars = resp.data.cars;
                            }
                        } else {
                            resp.data.cars = "";
                        }
                        if(data.status == 2){
                            data.statusContent = '待验收';
                        }else if(data.status == 3){
                            data.statusContent = '已验收';
                        }else if(data.status == 4){
                            data.statusContent = '已驳回';
                        }
                        data.downloadName = '下载提货单';
                        p_applyFn.takeGoodsMessage(data);
                        p_applyFn.gainGoodsMessage(data);
                        p_applyFn.buyerGoodsTitle(data);
                        if(data.status){
                            if(data.status ==1 ){
                                var html1 = timeLineFn(textArr,2);
                                $(".apply_flow").html(html1);
                                $("#j_order_title1").removeClass("hide");
                                $("#j_take_goods").removeClass("hide");
                            }else if(data.status ==2 ){
                                var html2 = timeLineFn(textArr,3);
                                $(".apply_flow").html(html2);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                                $(".buyer_gain_btn").removeClass("hide");
                            }else if(data.status == 3 ){
                                var html3 = timeLineFn(textArr,4);
                                $(".apply_flow").html(html3);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                            } else if(data.status == 4 ){
                                var html4 = timeLineFn(textArr,2);
                                $(".apply_flow").html(html4);
                                p_applyFn.rejectTem(data);
                                $("#j_order_title2").removeClass("hide");
                                $("#j_gain_goods").removeClass("hide");
                            }
                        }
                        p_applyFn.clcikEvent();
                    });
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });

    }
    /**
    *处理订单中的数据
     */
    p_applyFn.parseData = function(data){
        var surplusNum = floatTool.subtract(data['quantity'],data['totalSubmitQuantity']);
        data['surplusNum'] = floatTool.toFixed(surplusNum,3);
    };
    /**
     * 买家驳回模板
     */
    p_applyFn.rejectTem = function (data) {
        $("#j_order_reject").html(template('t:j_order_reject',{data:data}));
    }
    /**
     *订单信息模板
     **/
    p_applyFn.orderMessage=function(data){
        if (data) {
            $("#j_order_message").html(template('t:j_order_message',{data:data}));
        }
    }
    /**
     *提货单信息模板
     **/
    p_applyFn.takeGoodsMessage = function (data) {
        $("#j_take_goods").html(template('t:j_take_goods',{data:data}));
    }
    /**
     *发货单信息模板
     **/
    p_applyFn.gainGoodsMessage = function (data) {
        $("#j_gain_goods").html(template('t:j_gain_goods',{data:data}));
    }
    /**
     *买家title模板
     **/
    p_applyFn.buyerGoodsTitle = function (data) {
        //提货单下载地址
        data.DownUrl = seajs.host + "/order/downDelivery/"+detailId+"/1";
        $("#j_order_title1").html(template('t:j_order_title1',{data:data}));
        $("#j_order_title2").html(template('t:j_order_title2',{data:data}));
    }
    /**
     *卖家title模板
     **/
    p_applyFn.SupplierGoodsTitle= function (data){
        //提货单下载地址
        data.DownUrl = seajs.host + "/order/downDelivery/"+detailId+"/1";
        $("#j_order_title1").html(template('t:j_order_supplier_title1',{data:data}));
        //发货单下载地址
        data.DownUrl = seajs.host + "/order/downDelivery/"+detailId+"/2";
        $("#j_order_title2").html(template('t:j_order_title2',{data:data}));
    }/**
     *买家发货模板
     **/
    p_applyFn.BuyerTakeGoods=function (data){
        $("#j_supplier_take_goods").html(template('t:j_supplier_take_goods',{data:data}));
    }
    p_applyFn.clcikEvent = function () {
        //订单信息 提货单信息切换
        $(".order_message .order_title span").on('click',function () {
            var $this = $(this);
            var BtnList = $(".order_message .order_title span");
            var messList = $(".message_area .message_btn");
            $.each(BtnList, function(Index, BtnItem) {
                if($(BtnItem).hasClass("active")){
                    $(BtnItem).removeClass("active");
                }
            });
            $.each(messList, function(Index, messItem) {
                if(!$(messItem).hasClass("hide")){
                    $(messItem).addClass("hide");
                }
            });
            $this.addClass("active");
            if($this.hasClass("order_message_btn")){
                $(".message_area .order_message_deail").removeClass('hide');
            }else if($this.hasClass("take_goods_message_btn")){
                $(".message_area .take_goods_message").removeClass('hide');
            }else if($this.hasClass("gain_goods_message_btn")){
                $(".message_area .gain_goods_message").removeClass('hide');
            }
        })
        //删除、下载本次提货单
        $(".del_down_btn a").on("click",function () {
            var $this = $(this);
            var dataId = $this.attr("data_id");
            if($this.hasClass("del_order")){
                var countHtml = ' <div class="bid-com">您确认删除提货单，并取消本次的提货申请吗？</div>';
                var d1 = dialogOpt({
                    title: '通知',
                    class: 'deliveryListDel',
                    content: countHtml,
                    textOkey: '确定',
                    textCancel: '取消',
                    btn: 'btn2',
                    funcOkey: function () {
                        interface.deliveryListDel({
                            id: dataId
                        }, function (resp) {
                            if (resp.code == 0) {
                                d1.remove();
                                window.location.href = 'p_order_detail.html?orderId=' + orderId;
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        });
                    }
                });
            }
        })
        //发货提交
        $(".apply_detail .apply_sumit").on('click',function (){
            var quantity = $('.submitQuantity').val();
            var deliveryMark = trim($('.deliveryConnectMark').val());
            var empty = 0;

            if (!trim(quantity)) {
                $('.submitQuantity').siblings('.error').html('*请输入本次实际发货量 ');
                empty=1;
            } else {
                if (!isInteger(trim(quantity))) {
                    $('.submitQuantity').siblings('.error').html('*本次实际发货量必须为大于0的数字');
                    empty=1;
                }
            }
            if (quantity.indexOf('.') > 0 && quantity.toString().split(".")[1].length > 3) {
                $('.submitQuantity').siblings('.error').html('*本次实际发货量最多有三位小数');
                empty=1;
            }
            if (deliveryMark.length > 150) {
                $('.deliveryConnectMark').siblings('.error').html('*备注信息不得超出150字符');
                empty=1;
            }
            if(empty ==1){
                alertReturn('填写信息有误')
                return false;
            }
            interface.delivery({
                quantity: quantity,
                id: detailId,
                deliveryRemark: deliveryMark
            }, function (resp) {
                if (resp.code == 0) {
                    alertReturn('成功提交发货信息');
                    //保证IE浏览器能够刷新
                    window.location.href =window.location.href;
                    window.location.reload(true);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            },loading)
        })
        //买家确认收货及驳回收货信息
        $(".order_message .buyer_gain_btn a").on('click',function () {
            var $this = $(this);
            var gianQuan = $(".gain_goods_message .order_quantity").html();//发货量
            var takeQuan = $(".take_goods_message .order_quantity").html();//提货量
            if($this.hasClass("gain_submit")){
                var countHtml = ' <div class="bid-com">您本次预提货：'+takeQuan+'／实提货：'+gianQuan+'，确认收货吗？</div>';
                var d1 = dialogOpt({
                    title: '确认收货',
                    class: 'deliveryListDel',
                    content: countHtml,
                    textOkey: '确认',
                    textCancel: '取消',
                    btn: 'btn2',
                    funcOkey: function () {
                        interface.ensureDelivery({
                            id: detailId
                        }, function (resp) {
                            if (resp.code == 0) {
                                if(resp.data.status == 4){
                                    // window.location.reload();
                                    d1.remove();
                                    resp.data.tenderName = orderInfo.tenderBean.title;
                                    settlement(resp.data);

                                }else{
                                    alertReturn("恭喜您，单次提货验收成功。");
                                    window.location.reload();
                                }
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        });
                    }
                });
            }else if($this.hasClass("gain_cancel")){
                var countHtml = '<div class="reject_area"><div class="reject_reason"><span>驳回原因：</span>'+
                    '<select name="" class="reject_option">'+
                    '<option name="" value="卖家发货吨位与买家实际收货吨位不符">卖家发货吨位与买家实际收货吨位不符</option>'+
                    '<option name="" value="买家还未提货">买家还未提货</option>'+
                    '<option name="" value="其他">其他</option>'+
                    '</select></div>'+
                    '<p class="reject_tips_title"><span>备注：</span></p>'+
                    '<textarea class="deliveryConnectMark" rows="3" cols="80" placeholder="填写本次驳回发货单的原因，便于卖家理解～（选填～150字符限制）"></textarea></div>';
                var d1 = dialogOpt({
                    title: '驳回发货原因',
                    class: 'deliveryReject',
                    content: countHtml,
                    textOkey: '提交',
                    textCancel: '取消',
                    btn: 'btn2',
                    funcOkey: function () {
                        var rejectOption = $(".reject_area .reject_option").val();
                        var rejectMark = trim($(".reject_area textarea").val());
                        if (rejectMark.length > 150) {
                            alertReturn('备注信息不得超出150字符限制');
                            return false;
                        }
                        interface.rejectDelivery({
                            id: detailId,
                            rejectDetail:rejectMark,
                            rejectReason:rejectOption
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn("驳回提货成功");
                                window.location.reload();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        });
                    }
                });

            }
        })
        $(".apply_main .p_order_detail").on('click',function (){
            window.location.href = 'p_order_detail.html?orderId=' + orderId;
        })
        //重新发货
        $(".order_reject .re_gain_btn").on("click",function () {
            $(".order_reject").addClass("hide");
            $("#j_supplier_take_goods").removeClass("hide");
        })
        //返回上一级
        $(".apply_detail .apply_btn .cancel").on('click',function (){
            window.location.href = 'p_order_detail.html?orderId=' + orderId;
        })
        $('.deliveryConnectMark').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                if(trim($this.val()).length<=150){
                    $this.removeClass('red');
                    $this.siblings('.error').html('');
                }
            }else{
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })
        $('.submitQuantity').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })
    }

    /**
     * 尾款结算弹框
     */
    function settlement(goodsData) {
        var id = goodsData.id;  //调用评论弹框
        if (Number(goodsData.finishPrice) < Number(goodsData.payedPrice)) {//退款
            var leftPrice = Number(goodsData.payedPrice) - Number(goodsData.finishPrice);
            var html = '<div class="settlement-box">' +
                '<h1>恭喜您，交易成功！</h1>' +
                '<p class="desc">' +
                '本次交易您的实际提货量低于中标量，将有<span class="color-red">' + leftPrice.toFixed(2) + '</span>元尾款退入账户余额中（如公司交易，将退入公司账号余额中），请及时查看。具体交易数据查看以下列表。' +
                '</p>' +
                '<div class="list">' +
                '<h3>' + goodsData.tenderName + '</h3>' +
                '<ul class="clearfloat color-9d">' +
                '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
                '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
                '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(3) + '</span>吨</li>' +
                '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
                '</ul>' +
                '<p class="left-cash">退还尾款：<span class="color-red">' + leftPrice.toFixed(2) + '</span>元</p>' +
                '</div>' +
                '</div>';
            var d = dialogOpt({
                title: '结算尾款',
                class: 'settlement-dialog',
                content: html,
                textOkey: '评价',
                textCancel: '关闭',
                funcOkey: function () {
                    //评价弹框-待完成
                    d.remove();
                    evaluateDialog(id);
                },
                funcCancel:function () {
                    d.remove();
                    window.location.reload();
                }
            })
        } else if (Number(goodsData.finishPrice) > Number(goodsData.payedPrice)) {//补款-结算尾款
            var leftPrice = Number(goodsData.finishPrice) - Number(goodsData.payedPrice);
            interface.currentUserInfo(function (resp) {//查询个人接口获取余额
                if (resp.code == 0) {
                    var useableBalace = resp.data.useableBalace;
                    var html = '<div class="settlement-box">' +
                        '<h1>恭喜您，交易成功！</h1>' +
                        '<p class="desc">' +
                        '本次交易您的实际提货量超出中标量，将有<span class="color-red">' + leftPrice.toFixed(2) + '</span>元尾款需要支付。具体交易数据查看以下列表。' +
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
                        title: '结算通知',
                        class: 'settlement-dialog',
                        content: html,
                        textOkey: '结算',
                        textCancel: '取消',
                        funcOkey: function () {
                            settlementPay(goodsData, leftPrice, useableBalace);
                            d.remove();
                        },
                        funcCancel:function () {
                            d.remove();
                            window.location.reload();
                        }
                    });
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            })
        } else {//提货量等于中标量
            var html = '<div class="settlement-box">' +
                '<h1>恭喜您，交易成功！</h1>' +
                '<p class="desc">' +
                '本次交易您的实际提货量与中标量相同，没有金额差价，请及时查看订单详情。具体交易数据查看以下列表。' +
                '</p>' +
                '<div class="list">' +
                '<h3>' + goodsData.tenderName + '</h3>' +
                '<ul class="clearfloat color-9d">' +
                '<li>中标量：<span class="color-red">' + goodsData.quantity.toFixed(2) + '</span>吨</li>' +
                '<li>已付金额：<span class="color-red">' + goodsData.payedPrice.toFixed(2) + '</span>元</li>' +
                '<li>实际提货量：<span class="color-red">' + goodsData.finishQuantity.toFixed(3) + '</span>吨</li>' +
                '<li>实际提货金额：<span class="color-red">' + goodsData.finishPrice.toFixed(2) + '</span>元</li>' +
                '</ul>' +
                //'<p class="left-cash">结算尾款：<span class="color-red">0.00</span>元</p>' +
                '</div>' +
                '</div>';
            var d = dialogOpt({
                title: '结算尾款',
                class: 'settlement-dialog',
                content: html,
                textOkey: '评价',
                textCancel: '关闭',
                funcOkey: function () {
                    //评价弹框-待完成
                    d.remove();
                    evaluateDialog(id);
                },
                funcCancel:function () {
                    d.remove();
                    window.location.reload();
                }
            });
        }
    };

    /**
     * 结算支付
     */
    function settlementPay(goodsData, leftPrice, useableBalace) {
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
                tradePasswordDialog(leftPrice, bankId, thirdType, payType, id, isPay);
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
    };

    //密码弹框
    function tradePasswordDialog(leftPrice, bankId, thirdType, payType, id, isPay) {
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
                            p_applyFn.detailFn();
                            secondPay(leftPrice, id);
                            d1.remove();
                        }
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                }, false);
            }
        });
    };

    //尾款结算成功提示
    secondPay = function secondPay(leftPrice, id) {
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
    };

    p_applyFn.init();
});
