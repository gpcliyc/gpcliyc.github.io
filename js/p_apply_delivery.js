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
    require('underscore-min');
    require('intlTel');
    var utils =  require("utils");
    /**
     *init
     **/
    var loading = "loading";
    var user = getUser();
    var orderId = request('orderId');//订单id
    var p_applyFn = {};
    var textArr = ['买家发起提货','卖家进行发货','买家开始验收','提货完成'];
    /*初始化*/
    p_applyFn.init = function (){
        var html = timeLineFn(textArr,1);
        $(".apply_flow").html(html);
        this.detailFn();
        this.intlTel();

    };
    //添加电话区号
    p_applyFn.intlTel = function () {
        $(".deliveryConnectPhone").intlTelInput({
            utilsScript: utils
        });
    }
    /**
     *@textArr 传入的文本数组//as:['开始','结束']
     * @status 当前的状态//as:1,2,3
     * 返回时间轴html
     */

    p_applyFn.detailFn = function () {
        interface.orderDetail({
            orderId: orderId
        }, function (resp) {
            if (resp.code == 0) {
                var data = resp.data;
                p_applyFn.parseData(data);
                $('.apply_content .surplus_quantity').html(data.surplusNum);
                $('.buy_price').html(data.buyPrice);
                $('.apply_content .sum_order_quantity').html(data.orderDeliveryCount);
                p_applyFn.orderMessage(data);//订单信息
                p_applyFn.gainCurrentCar(data);//获取当前已有车辆
                p_applyFn.submit(data);//提交提货流程
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
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
     *处理订单中的数据
     */
    p_applyFn.parseData = function(data){
        var surplusNum = floatTool.subtract(data['quantity'],data['totalSubmitQuantity']);
        data['surplusNum'] = floatTool.toFixed(surplusNum,3);
    };
    /*
    **获取当前车辆
     */
    p_applyFn.gainCurrentCar = function (data) {
        var carHtml = '';
        interface.carList({
            pageSize: 0
        }, function (resp) {
            if (resp.code == 0) {
                var carList = resp.data.content;
                for (var i = 0; i < carList.length; i++) {
                    carHtml += "<span data-id='" + carList[i].id + "' data-carNum='" + carList[i].carNum + "'><i id='at_ad_car"+i+"' name='at_ad_car"+i+"'></i>" + carList[i].carNum + "<b id='at_ad_delcar"+i+"' name='at_ad_delcar"+i+"'></b></span>";
                }
                $(".apply_detail ul li .radio-options").html(carHtml);
                p_applyFn.addCar();//添加提货车辆
                p_applyFn.delCar();//删除提货车辆
                p_applyFn.checkBoxCar();//选中车辆
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }
    /**
     *添加提货车辆*
     **/
    p_applyFn.addCar = function () {
        $(".apply_detail ul li .btnAddCar").off('click').on('click', function () {
            var carNum = $("#input_addCar").val();
            if (!carNum) {
                alertReturn('提货车不能为空');
                return false;
            }
            carNum = carNum.toLocaleUpperCase();
            //车牌规则
             if (!isCarNumber(carNum)) {
                alertReturn('请输入正确的车牌格式');
                 return false;
             }
            interface.addCar({
                carNum: carNum
            }, function (resp) {
                if (resp.code == 0) {
                    var carHtml = "";
                    interface.carList({
                        pageSize: 0
                    }, function (resp) {
                        if (resp.code == 0) {
                            var carList = resp.data.content;
                            for (var i = 0; i < carList.length; i++) {
                                carHtml += "<span data-id='" + carList[i].id + "' data-carNum='" + carList[i].carNum + "'><i></i>" + carList[i].carNum + "<b></b></span>";
                            }
                            $(".apply_detail ul li .radio-options").html(carHtml);
                            p_applyFn.checkBoxCar();
                            p_applyFn.delCar();
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
    p_applyFn.delCar = function () {
        $(".apply_detail ul li .radio-options span").unbind("mouseover").bind("mouseover", function () {
            var $this = $(this);
            $this.find("b").show();
        }).unbind("mouseout").bind("mouseout", function () {
            var $this = $(this);
            $this.find("b").hide();
        });

        $(".apply_detail ul li .radio-options span b").on('click', function () {
            var $this = $(this);
            var id = $this.parent("span").attr("data-id");
            $this.parent("span").remove();
            interface.delCar({
                id: id
            }, function (resp) {
                if (resp.code == 0) {
                    //alertReturn("删除提货车成功");
                    $this.parent("span").remove();
                    if ($(".apply_detail ul li .radio-options span").length == 0) {
                      p_applyFn.addCar();
                    }
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        });
    }
    /**
     *选择提货车辆*
     **/
    p_applyFn.checkBoxCar = function () {
        $(".apply_detail ul li .radio-options span i").on('click', function () {
            var $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
            } else {
                $this.addClass('checked');
            }
            var carList = $(".apply_detail ul li .radio-options span i.checked");
            if(carList.length>0){
                $(".apply_detail ul li .radio-options").siblings('.error').html('');
            }
        });
    }
    p_applyFn.submit=function(data){
        $(".apply_detail .apply_sumit").on('click',function () {
            var empty = 0;
            var deliveryConnectPhone = trim($('.deliveryConnectPhone').val());
            var deliveryConnectName = trim($('.deliveryConnectName').val());
            var deliveryConnectTime = trim($('.deliveryConnectTime').val().replace(' ', 'T'));
            var deliveryConnectMark = trim($('.deliveryConnectMark').val());
            var deliveryConnectIdCard = trim($('.deliveryConnectIdCard').val());
            var submitQuantity = trim($('.submitQuantity').val());
            var deliveryConnectPhoneTitle = $('.deliveryConnectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var deliveryConnectPhoneClass = $('.deliveryConnectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var deliveryConnectPhoneAreaCode = getAreaCode(deliveryConnectPhoneTitle);
            // var idcard = trim($('.idcard').val());
            var carsNum = "";
            var carList = $(".apply_detail ul li .radio-options span i.checked");
            for (var i = 0; i < carList.length; i++) {
                carsNum += carList.eq(i).parent("span").attr("data-carNum") + ",";
            }
            var cars = carsNum.substring(0, carsNum.length - 1);
            var date = new Date();  //获取当日时间
            if(!submitQuantity){
                $('.submitQuantity').siblings('.error').html('*本次提货量不能为空');
                $('.submitQuantity').addClass('red');
                empty=1;
            }else if(submitQuantity<30){
                $('.submitQuantity').siblings('.error').html('*本次提货量不能小于30');
                $('.submitQuantity').addClass('red');
                empty=1;
            }else if(submitQuantity > Math.abs(Number(data.quantity - data.totalSubmitQuantity))){
                $('.submitQuantity').siblings('.error').html('*本次提货量不能大于剩余提货量');
                $('.submitQuantity').addClass('red');
                empty=1;
            }
            if (!deliveryConnectName) {
                $('.deliveryConnectName').siblings('.error').html('*提货联系人不能为空');
                $('.deliveryConnectName').addClass('red');
                empty=1;
            }
            if(!deliveryConnectIdCard){
                $('.deliveryConnectIdCard').siblings('.error').html('*身份证号不能为空');
                $('.deliveryConnectIdCard').addClass('red');
                empty=1;
            }else if(!isNumAndLetter(deliveryConnectIdCard)){
                $('.deliveryConnectIdCard').siblings('.error').html('*身份证号格式不正确');
                $('.deliveryConnectIdCard').addClass('red');
                empty=1;
            }
            if (deliveryConnectPhone) {
                if (!matchMobile(deliveryConnectPhone)) {
                    $('.deliveryConnectPhone').parent(".intl-tel-input").next('.error').html('*手机号格式不正确');
                    $('.deliveryConnectPhone').addClass('red');
                    // $('.connectPhone').siblings('.error').html('*手机号格式不正确');
                    // $('.connectPhone').addClass('red');
                    empty = 1;
                }
            }else{
                $('.deliveryConnectPhone').parent(".intl-tel-input").next('.error').html('*联系电话不能为空');
                $('.deliveryConnectPhone').addClass('red');
                empty = 1;
            }

            // if (!deliveryConnectPhone) {
            //     $('.deliveryConnectPhone').siblings('.error').html('*联系电话不能为空');
            //     $('.deliveryConnectPhone').addClass('red');
            //     empty=1;
            // }else if(!matchMobile(deliveryConnectPhone)){
            //     $('.deliveryConnectPhone').siblings('.error').html('*手机号格式不正确');
            //     $('.deliveryConnectPhone').addClass('red');
            //     empty=1;
            // }
            if (!deliveryConnectTime) {
                $('.deliveryConnectTime').siblings('.error').html('*提货日期不能为空');
                $('.deliveryConnectTime').addClass('red');
                empty=1;
            }else if(deliveryConnectTime < dateYMDHMSFormat(date)){
                $('.deliveryConnectTime').siblings('.error').html('*提货日期不能小于当日时间');
                $('.deliveryConnectTime').addClass('red');
                empty=1;
            }
            if (carList.length == 0) {
                $(".apply_detail ul li .radio-options").siblings('.error').html('*请选择提货车辆');
                empty=1;
            }
            if (deliveryConnectMark.length > 150) {
                $('.deliveryConnectMark').siblings('.error').html('备注信息不得超出150字符');
                empty=1;
            }
            if(empty ==1){
                alertReturn('填写信息有误')
                return false;
            }
            //创建提货单
            interface.createDelivery({
                id: data.id,
                submitQuantity: submitQuantity,
                cars: cars,
                deliveryConnectPhone: deliveryConnectPhone,
                idcard:deliveryConnectIdCard,
                deliveryConnectName: deliveryConnectName,
                deliveryConnectMark: deliveryConnectMark,
                deliveryDate: deliveryConnectTime,
                deliveryConnectPhoneAreaCode:deliveryConnectPhoneAreaCode,
                deliveryConnectPhoneAddr:{
                    title:deliveryConnectPhoneTitle,
                    class:deliveryConnectPhoneClass
                }
            }, function (resp) {
                if (resp.code == 0) {
                    alertReturn('成功提交提货信息，等待卖家联系');
                    if(resp.data){
                        var detailId = resp.data;
                        window.location.href = 'p_delivery_detail.html?orderId='+orderId+"&detailId="+detailId;
                    }
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            },loading)
        })
    }
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
    $('input.deliveryConnectPhone').on('keyup', function () {
        var $this = $(this);
        if ($this.val()) {
            $this.removeClass('red');
            $this.parent(".intl-tel-input").siblings('.error').html('');
        }
    })
    $('.apply_detail ul li input').on('keyup', function () {
        var $this = $(this);
        if ($this.val()) {
            $this.removeClass('red');
            $this.siblings('.error').html('');
        }
    })
    $(".apply_main .p_order_detail").on('click',function (){
        window.location.href = 'p_order_detail.html?orderId=' + orderId;
    })
    $(".deliveryConnectTime").on('click',function () {
        WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'});
        var $this = $(this);
        if ($this.val()) {
            $this.removeClass('red');
            $this.siblings('.error').html('');
        }
    })
    $(".apply_detail .apply_btn .cancel").on('click',function (){
        window.location.href = 'p_order_detail.html?orderId=' + orderId;
    })
    $("#test").on('click',function (){
        window.location.href = 'p_help_center2.html?type=2';
    })
    p_applyFn.init();
});
