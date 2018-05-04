/**
 * Created by like on 2017/6/21.
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var global = require("global");
    var header = require("header");
    require('underscore-min');
    require("interface");
    require("pagination");
    require("http");
    require('bootstrap');
    require("floatTool");//去除js运算精度问题
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require('intlTel');
    var initPhoneAddr = {
        title:'China（中国）: +86',
        class:'iti-flag cn'
    }
    var utils =  require("utils");
    var languagePackage = null;
    var user = getUser(),
        invoiceFlag_person = true,
        invoiceFlag_company = true,
        cityselect = require('cityselect'),
        data,//订单信息
        quantity,
        conpousType = 0,
        sumPrice,
        finalPrice,
        packType=1,// 打包方式:1散货,2吨袋
        bagAccount = 0 ,//吨袋总金额
        orderId = request('orderId'),
        settings = {
            thirdPayType: "",
            couponId: "",
            orderId: orderId,
            payType: "",
            bankId: "",
            isPay: 1,
            tradePassword: ""
        },
        orderPay = {
            init: function () {
                var me = this;
                orderId = orderId;
                interface.orderDetail({orderId: orderId}, function (resp) {
                    if (resp.code === 0) {
                        data = resp.data;
                        quantity = resp.data.quantity;//总吨数，计算优惠金额的时候使用
                        sumPrice = resp.data.sumPrice;//总价格
                        finalPrice = sumPrice;
                        me.helperTemplate();
                        me.selectLanguage();
                        me.renderBlock(resp.data);
                        me.showTimeLimit();
                        me.orderInfo(resp.data);
                        me.packageInfo(resp.data);
                        me.billInfo(resp.data);
                        me.payInfo(resp.data);
                        me.navInfo(resp.data);
                        me.payAccountInfo(resp.data);
                        me.couponInfo();
                        me.bindEvent(data);//绑定事件
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                })
            },
            dealIsOffline:function (data) {
                if(data){

                    if(data.supplier.company||data.buyer.company){
                        var isOff,isOffBuyer=false,isOffSupplier=false;
                        if(data.supplier.company) {
                            var supplier = data.supplier.company.country;
                            if (!(supplier == languagePackage['中国'])) {
                                isOffSupplier = true;
                            }else{
                                isOffSupplier = false;
                            }
                        }else if(data.buyer.company) {
                            var buyer = data.buyer.company.country;
                            if (!(buyer == languagePackage['中国'])) {
                                isOffBuyer = true;
                            }else{
                                isOffBuyer = false;
                            }
                        }
                        isOff = isOffBuyer||isOffSupplier;
                        return isOff;
                    }else{
                        return false;
                    }
                    // if(data.supplier.company&&data.buyer.company){
                    //     var supplier = data.supplier.company.country,
                    //         buyer = data.buyer.company.country;
                    //     if(!(supplier == languagePackage['中国']&&buyer==languagePackage['中国'])){
                    //         return false;
                    //     }else{
                    //         return true;
                    //     }
                    // }else{
                    //     return false;
                    // }
                }
            },
            selectLanguage:function () {
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
            },
            renderBlock : function (json) {
                $("#payBtnBlock").html(template('t:payBtnBlock'));
                var getSelectOption = require('../js/component/city/mainCity.js');//左侧菜单
                // var province = getSelectOption.getSelectOption('province');//中国省市
                var foreignCounty = getSelectOption.getSelectOption('foreignCounty');//国外的国家
                var countryType = getSelectOption.getSelectOption('countryType2');//国家类型
                // $("#s_province").html(province);
                $(".foreign_country").html(foreignCounty);
                $("#country").html(countryType);
                if(json.receiveCountry){
                    if(json.receiveCountry != languagePackage['中国']){
                        $("#country").val(languagePackage['其他国家和地区']);
                        $(".inland_country").addClass('hide');
                        $(".foreign_country").removeClass('hide');
                        $(".foreign_country").val(json.receiveCountry);
                    }
                }

        },
          intlTel:function (data) {
            $("#companyPhone").intlTelInput({
                utilsScript: utils
            });
              $("#receivePhone").intlTelInput({
                  utilsScript: utils
              });
              if(!data.companyPhoneAreaCode){
                  $('#companyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title",initPhoneAddr.title);
                  $('#companyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",initPhoneAddr.class);
                  $('#receivePhone').parent(".intl-tel-input").find(".selected-flag").attr("title",initPhoneAddr.title);
                  $('#receivePhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",initPhoneAddr.class);
              }else{
                  $('#companyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title",data.companyPhoneAddr.title);
                  $('#companyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",data.companyPhoneAddr.class);
                  $('#receivePhone').parent(".intl-tel-input").find(".selected-flag").attr("title",data.receivePhoneAddr.title);
                  $('#receivePhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",data.receivePhoneAddr.class);
              }
        },
            navInfo: function (datas) {
                if (datas) {
                    $("#nav-title").html(template('t:nav-title', {data: datas}));
                }
            },
            showTimeLimit: function () {
                interface.commonData({'type':'ORDER_TASK_TIME1'}, function (resp) {
                    if (resp.code === 0) {
                        $("#ORDER_TASK_TIME1").html(resp.data);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });

//                if (datas) {
//                    $("#order-detail").html(template('t:order-detail', {data: datas}));
//                }
            },
            orderInfo: function (datas) {
                if (datas) {
                    $("#order-detail").html(template('t:order-detail', {data: datas}));
                }
            },
            packageInfo:function (datas) {
                if(datas){
                    $("#pack-detail").html(template('t:pack-detail', {data: datas,packType:packType}));
                }
            },
            billInfo: function (datas) {
                if (datas) {
                    interface.getInvoice({}, function (resp) {
                        if (resp.code === 0) {
                            $("#bill-detail").html(template('t:bill-detail', {
                                data: datas,
                                bill: resp.data
                            }));
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    });

                }
            },
            payInfo: function (datas) {
                if (datas) {
                    var isOffline = this.dealIsOffline(datas);
                    var b2bBankList = this.getBankList('B2B'),
                        b2cBankList = this.getBankList('B2C');
                        bagAccount = packType == 2? floatTool.multiply(datas.tenderBean.bagPrice,datas.quantity ):0;
                    /*获取优惠券*/
                    $("#pay-detail").html(template('t:pay-detail', {
                        data: datas,
                        b2bBankList: b2bBankList,
                        b2cBankList: b2cBankList,
                        user: user.data,
                        packType:packType,
                        bagAccount:bagAccount,
                        isOffline:isOffline
                    }));
                }
            },
            couponInfo: function (params) {
                var me = this,
                    param = {
                        orderId: orderId,
                        quantity: quantity,
                        order: 'ASC',
                        pageNum: 1,
                        pageSize: 10,
                        sort: "",
                        status: 1,//状态:1未使用,2已使用,3已过期 ,
                        useType: isEnUS()?5:4,// (string, optional): 使用限制:1仅线上支付,2仅线下支付,3都可以,4线上可用(1+3),5线下可用(2+3) ,
                        userId: user.data.id //(integer, optional): 用户id
                    } ;
                param = $.extend(param, params || {});
                interface.couponsList(param, function (resp) {
                    if (resp.code === 0) {
                        $("#coupons-list").html(template('t:coupons-list', {
                            list: resp.data.content
                        }))
                        conpousType = 0;
                        me.reAccountBill();
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                });
            },
            payAccountInfo: function (datas) {
                var me = this;
                if (datas) {
                    $("#pay-account").html(template('t:pay-account', {
                        data: datas
                    }));
                    me.accountBill();
                }
            },
            helperTemplate: function () {
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
                template.helper('formatCurrency', function (num) {
                    return formatCurrency(num);
                });
               template.helper('JSONStringify', function (obj) {
                    return JSON.stringify(obj);
                });
                //信誉值等级
                template.helper('reputationValueLevel', function (value) {
                    return reputationValueLevel(value);
                });
                /**
                 * 根据金额、状态判断样式class
                 */
                template.helper('getDlClass', function (coupon) {
                    if (coupon.status == 3) {
                        return "overdue";
                    }
                    if (coupon.amount == 20) {
                        return "twenty";
                    }
                    if (coupon.amount == 15) {
                        return "fifteen ";
                    }
                    return "";
                });
                /**
                 * 获取支付类型
                 */
                template.helper('getUseType', function (useType) {
                    if (useType == 1) {
                        return languagePackage["线上支付"];
                    }
                    if (useType == 2) {
                        return languagePackage["线下支付"];
                    }
                    if (useType == 3) {
                        return languagePackage["线上/线下支付"];
                    }
                    return "";
                });

            },
            bindEvent: function (data) {
                this.choiceBank();
                this.showTab();
                this.choiceCouponsImg();
                this.choicePay();
                this.choiceCoupons();
                this.alterInvoice(data);
                this.choicePackageType();
            },
            alterInvoice: function (data) {
                var me = this;
                $('.mod-body').undelegate().delegate('button#alterInvoice', 'click', function (e) {
                    var json = JSON.parse($("#alterInvoice").attr('data-json')),
                        tpl = template('t:invoice', {
                            json: json
                        }),
                        d = dialogOpt({
                            title: languagePackage['发票信息'],
                            class: "dialogOpt-lg",
                            content: tpl,
                            textOkey: languagePackage['确认'],
                            textCancel: languagePackage['取消'],
                            funcOkey: function () {
                                var params = me.getInvoiceParams(json);
                                var flag = false;
                                invoiceFlag_company = $('#tab1 .c_title').get().some(function (item, index) {
                                    return $(item).attr('data-flag') === 'false';

                                })
                                invoiceFlag_company = $('#tab1 .c_title').get().every(function (item, index) {
                                    return ($(item).attr('data-flag') === 'true' || $(item).attr('data-flag') == null);
                                })
                                invoiceFlag_person = $('#tab2 .c_title').get().some(function (item, index) {
                                    return $(item).attr('data-flag') === 'false';
                                })
                                invoiceFlag_person = $('#tab2 .c_title').get().every(function (item, index) {
                                    return ($(item).attr('data-flag') === 'true' || $(item).attr('data-flag') == null);
                                })
                                if ($(".tab-content #tab1").hasClass('active')) {
                                    flag = invoiceFlag_company;
                                    $('.tab-content input.need').each(function () {
                                        if (!($(this).val())) {
                                            var obj = $(this);
                                            obj.siblings('.c_title').attr('data-flag', false);
                                            obj.addClass('border_error');
                                            obj.siblings('.error').addClass('show').removeClass('hide');
                                            obj.siblings('.success').addClass('hide').removeClass('show');
                                            flag = false;
                                        }
                                    })
                                    var country = $("#country").val();
                                    if(country ==  languagePackage['中国']){
                                        var province = $("#receiveProvince").val();
                                        var city =  $("#receiveCity").val();
                                        if(province == languagePackage["请选择"]||city ==languagePackage["请选择"]||province == ""||city == ""){
                                            $("#address").siblings('.c_title').attr('data-flag', false);
                                            $("#address").siblings('.error').addClass('show').removeClass('hide');
                                            $("#address").siblings('.success').addClass('hide').removeClass('show');
                                            flag = false;
                                        }
                                    }else{
                                        var foreignCountry = $(".foreign_country").val();
                                        if(foreignCountry == languagePackage["请选择国家或地区"]){
                                            $("#address").siblings('.c_title').attr('data-flag', false);
                                            $("#address").siblings('.error').addClass('show').removeClass('hide');
                                            $("#address").siblings('.success').addClass('hide').removeClass('show');
                                            flag = false;
                                        }
                                    }
                                }
                                if ($(".tab-content #tab2").hasClass('active')) {
                                    flag = invoiceFlag_person;
                                }
                                if (flag) {
                                    interface.editInvoice(params, function (resp) {
                                        if (resp.code === 0) {
                                            alertReturn(languagePackage["修改发票信息成功"]);
                                            d.remove();
                                            me.init();
                                        } else {
                                            alertReturn(resp.exception);
                                        }
                                    }, function (resp) {
                                        alertReturn(resp.exception);
                                    });
                                } else {
                                    alertReturn(languagePackage["发票信息填写有误"]);
                                    return;
                                }

                            },
                            funcCancel: function () {
                                d.remove();
                                me.init();
                            }
                        });
                    if (!json.receiveProvince) {
                        $("#address").citySelect({nodata: "none", required: false});
                    } else {
                        $("#address").citySelect({prov: json.receiveProvince, city: json.receiveCity});//初始化地区
                    }

                    me.renderBlock(json);
                    me.intlTel(json);
                    me.bindInvoiceEvent();//绑定事件
                })
            },
            choicePackageType:function () {
                var me = this ;
                $(".package-type input[name='packType']").off('click').on('click',function (e) {
                    packType = Number($(this).val());
                    me.init();
                })
            },
            choiceBank: function () {
                $('.bank-list span i').off('click').on('click', function (e) {
                    $(this).parent('span').toggleClass('checked').siblings('span').removeClass('checked');
                })
            },
            choiceCouponsImg: function () {
                $('#userCoupon').off('click').on('click', function (ev) {
                    $('.coupons').slideToggle('slow');
                    if ($(this).attr('class').indexOf('glyphicon-menu-down') > 0) {

                        $(this).attr('class', 'glyphicon glyphicon-menu-up');
                    } else {
                        $(this).attr('class', 'glyphicon glyphicon-menu-down');
                    }
                })
            },
            choicePay: function () {
                var me = this;
                $("#pay-rightNow").off('click').on('click', function (e) {
                    if (me.showPayType()) {
                        me.tradePassword(settings);
                    }
                })
            },
            choiceCoupons: function () {
                var me = this;
                $('#coupons-list').delegate('dl', 'click', function (e) {
                    conpousType = $(this).attr('id');
                    settings.couponId = $(this).attr('data-couponsid');
                    $(this).toggleClass('couponsChecked').siblings('dl').removeClass('couponsChecked');
                    if (!$(this).hasClass('couponsChecked')) {
                        conpousType = 0;
                        settings.couponId = null;
                    }
                    me.reAccountBill();
                })
            },
            getInvoiceParams: function (json) {
                var type = $('#tab1').hasClass('active') ? 1 : 2,
                    companyPhoneTitle = $('#companyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title"),
                    companyPhoneClass = $('#companyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class"),
                    receivePhoneTitle = $('#receivePhone').parent(".intl-tel-input").find(".selected-flag").attr("title"),
                    receivePhoneClass = $('#receivePhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class"),
                    countryType = $("#country").val(),
                    foreginCountry = $('.foreign_country').val(),
                    country="";
                    if(countryType ==  languagePackage['中国']){
                        country =  languagePackage['中国'];
                    }else{
                        country = foreginCountry;
                    }
                    var params = {
                        id: json.id,
                        type: type,
                        receiveCountry:country,
                        companyName: $(".detail input#companyName").val(),
                        companyTax: $(".detail input#companyTax").val(),
                        companyBank: $(".detail input#companyBank").val(),
                        companyBankCard: $(".detail input#companyBankCard").val(),
                        companyAddr: $(".detail input#companyAddr").val(),
                        companyPhone: $(".detail input#companyPhone").val(),
                        companyPhoneAreaCode:getAreaCode(companyPhoneTitle),
                        receiveUserName: $(".detail input#receiveUserName").val(),
                        receivePhone: $(".detail input#receivePhone").val(),
                        receivePhoneAreaCode:getAreaCode(receivePhoneTitle),
                        receiveProvince: $(".detail select#receiveProvince").val(),
                        receiveCity: $(".detail  select#receiveCity").val(),
                        // receiveCounty:$(".detail #receiveCounty").val(),
                        receiveAddr: $(".detail input#receiveAddr").val(),
                        invoiceTitle: $(".detail #invoiceTitle").val(),
                        companyPhoneAddr:{
                            title:companyPhoneTitle,
                            class:companyPhoneClass,
                        },
                        receivePhoneAddr:{
                            title:receivePhoneTitle,
                            class:receivePhoneClass,
                        }
                    }

                return params;
            },
            bindInvoiceEvent: function () {
                function showErrorTip(obj) {
                    obj.siblings('.c_title').attr('data-flag', false);
                    obj.addClass('border_error');
                    obj.siblings('.error').addClass('show').removeClass('hide');
                    obj.siblings('.success').addClass('hide').removeClass('show');
                }

                function showSuccessTip(obj) {
                    obj.siblings('.c_title').attr('data-flag', true);
                    obj.removeClass('border_error');
                    obj.siblings('.success').addClass('show').removeClass('hide');
                    obj.siblings('.error').addClass('hide').removeClass('show');
                }
                function showPhoneErrorTip(obj) {
                    var obj = obj.parent('.intl-tel-input');
                    obj.siblings('.c_title').attr('data-flag', false);
                    obj.addClass('border_error');
                    obj.siblings('.error').addClass('show').removeClass('hide');
                    obj.siblings('.success').addClass('hide').removeClass('show');
                }

                function showPhoneSuccessTip(obj) {
                    var obj = obj.parent('.intl-tel-input');
                    obj.siblings('.c_title').attr('data-flag', true);
                    obj.removeClass('border_error');
                    obj.siblings('.success').addClass('show').removeClass('hide');
                    obj.siblings('.error').addClass('hide').removeClass('show');
                }
                function countryChangeRender(countryVal) {
                    $("#country").removeClass('border_error');
                    // $("#address").find('.c_title').attr('data-flag', true);
                    $("#address").siblings('.error').addClass('hide').removeClass('show');
                    $("#address").siblings('.success').addClass('show').removeClass('hide');
                    if(countryVal ==  languagePackage['中国']){
                        if(!$(".foreign_country").hasClass('hide')){
                            $(".foreign_country").addClass('hide');
                        }
                        if($(".inland_country").hasClass('hide')){
                            $(".inland_country").removeClass('hide')
                        }

                    }else{
                        var foreignCountry = $(".foreign_country").val();
                        if(!$(".inland_country").hasClass('hide')){
                            $(".inland_country").addClass('hide')
                        }
                        if($(".foreign_country").hasClass('hide')){
                            $(".foreign_country").removeClass('hide');
                        }
                        var country  =  $(".foreign_country").val();
                        if(country ==  languagePackage['请选择国家或地区']){
                            // $(".foreign_country").addClass('border_error');
                            $("#address").siblings('.c_title').attr('data-flag', false);
                            // $("#address").siblings('.error').addClass('show').removeClass('hide');
                            $("#address").siblings('.success').addClass('hide').removeClass('show');
                        }

                    }
                }
                /*检查下拉框地址*/
                $(".detail select").not($('.detail select.country')).off('blur').on('blur', function () {
                    var value = $(this).find('option:selected').val();
                    if (!value) {

                        // $(this).addClass('border_error');
                        $("#address").siblings('.c_title').attr('data-flag', false);
                        $("#address").siblings('.error').addClass('show').removeClass('hide');
                        $("#address").siblings('.success').addClass('hide').removeClass('show');
                    } else {
                        if(value== languagePackage['请选择国家或地区']||value== languagePackage['请选择']){
                            // $(this).addClass('border_error');
                            $("#address").siblings('.c_title').attr('data-flag', false);
                            $("#address").siblings('.error').addClass('show').removeClass('hide');
                            $("#address").siblings('.success').addClass('hide').removeClass('show');
                        }else{
                            // $(this).removeClass('border_error');
                            if(!$(this).hasClass("prov")){
                                $("#address").siblings('.c_title').attr('data-flag', true);
                                $("#address").siblings('.error').addClass('hide').removeClass('show');
                                $("#address").siblings('.success').addClass('show').removeClass('hide');
                            }

                        }

                    }
                });
                $('#country').on('change',function(){
                    var countryVal = $(this).val();
                    countryChangeRender(countryVal);
                });
                $(".detail input").off().on('blur keyup', function () {
                    var id = $(this).attr('id'),
                        value = $(this).val();
                    switch (id) {
                        case "companyTax":
                        case "companyBank":
                        case "companyAddr":
                        case "receiveUserName":
                        case "receiveAddr":
                        case "companyName": {
                            if (!value) {
                                invoiceFlag_company = false;
                                showErrorTip($(this));

                            } else {
                                showSuccessTip($(this));
                            }
                            break;
                        }
                        case "invoiceTitle": {
                            if (!value) {
                                invoiceFlag_person = false;
                                showErrorTip($(this));

                            } else {
                                showSuccessTip($(this));
                            }
                            break;
                        }
                        case "companyBankCard": {
                            if (!isNumAndLetter(value)) {
                                invoiceFlag_company = false;
                                showErrorTip($(this));
                            } else {
                                showSuccessTip($(this));
                            }
                            break;
                        }
                        case "companyPhone": {
                            if (!matchIntlMobile(value)) {
                                invoiceFlag_company = false;
                                showPhoneErrorTip($(this));

                            } else {
                                showPhoneSuccessTip($(this));
                            }
                            break;
                        }
                        case "receivePhone": {
                            if (!matchIntlMobile(value)) {
                                invoiceFlag_company = false;
                                showPhoneErrorTip($(this));
                            } else {
                                showPhoneSuccessTip($(this));
                            }
                            break;
                        }
                    }
                })
            },
            reAccountBill: function () {
                var finallAccount = floatTool.add(floatTool.subtract(sumPrice,floatTool.multiply(quantity,conpousType)),bagAccount),
                    num = formatCurrency(finallAccount);
                finalPrice = finallAccount;
                $("#couponsSum").text("-¥ " + formatCurrency(floatTool.multiply(quantity,conpousType)));
                $("#finalAccount").text("¥ " + num);
                //余额支付时判断显示提示余额是否足够
                if ($("#balance_pay").attr('class') === 'active') {
                    if (finalPrice > user.data.useableBalace) {
                        $('#balance .balance-pay span').addClass('color-red');
                        $('#balance .balance-pay p').show();
                    } else {
                        $('#balance .balance-pay span').removeClass('color-red');
                        $('#balance .balance-pay p').hide();
                    }
                }
            },
            accountBill: function () {
                var num = formatCurrency(sumPrice);
                $("#finalAccount").text("¥ " + num);
            },
            showTab: function () {
                var me = this;
                $('#myPayTab a:first,#myBankTab a:first').tab('show');//初始化显示哪个tab
                $('#myPayTab a,#myBankTab a').click(function (e) {
                    e.preventDefault();//阻止a链接的跳转行为
                    $(this).tab('show');//显示当前选中的链接及关联的content
                    if ($("#payOnline").hasClass('active')) {
                        me.couponInfo({status: 1, useType: 4, userId: user.data.id});
                    }
                    if ($("#payOffline").hasClass('active')) {
                        me.couponInfo({status: 1, useType: 5, userId: user.data.id});
                    }
                })
            },
            showPayType: function () {
                // bankId (string, optional): 银行编码，非必填 ,
                //     couponId (integer, optional): 优惠券ID，非必填 ,
                //     orderId (integer, optional): 订单id，必填 ,
                //     payType (string, optional): 支付方式:0线下转账,1余额,2网银转账，必填 ,
                //     thirdPayType (string, optional): 1:(个人网银)B2C, 2:(企业网银)B2B，非必填 ,
                //     tradePassword (string, optional): 交易密码，线上支付必填
                /*线上支付*/
                if ($("#payOnline").attr('class') === 'active') {

                    if ($("#companyBank_pay").attr('class') === 'active') {
                        settings.thirdPayType = 2;
                        settings.isPay = 1;//银行转账
                        settings.payType = 2;
                        settings.bankId = $('#companyBank .bank-list span.checked').attr('data-id');
                        if (!settings.bankId) {
                            alertReturn(languagePackage['请选择银行']);
                            return false;
                        }
                    } else if ($("#personBank_pay").attr('class') === 'active') {
                        settings.thirdPayType = 1;
                        settings.isPay = 1;//银行转账
                        settings.payType = 2;
                        settings.bankId = $('#personBank .bank-list span.checked').attr('data-id');
                        if (!settings.bankId) {
                            alertReturn(languagePackage['请选择银行']);
                            return false;
                        }
                    } else if ($("#balance_pay").attr('class') === 'active') {
                        if (finalPrice > user.data.useableBalace) {
                            alertReturn('余额不足');
                            return false;
                        }
                        settings.isPay = 4;//余额支付
                        settings.payType = 1;//余额支付
                        //settings.thirdPayType = 1;
                    }

                }
                /*线下支付*/
                if ($("#payOffline").attr('class') === 'active') {
                    settings.isPay = 3;//线下转账
                    settings.payType = 0;//线下转账
                }
                return true;
            },
            tradePassword: function (settings) {
                var me = this;
                if (settings.isPay === 3) {
                    //线下支付，不需要密码
                    interface.payOrder({
                        packType:packType,
                        orderId: orderId,
                        couponId: settings.couponId,
                        payType: 0//线下转账
                    }, function (resp) {
                        var tips = '<p class="order-notice fts-20">'+languagePackage['提交成功']+'</p><p class="order-noticeSub color-9d">'+languagePackage['请尽快联系卖家，完成线下转账，并进行预约提货！卖家认证的开户银行信息及联系电话可在相关订单详情进行查看。']+'</p>' +
                            '<ul class="order-detailInfo fts-14">' +
                            '<li><span>'+languagePackage['订单号']+':</span><span>' + data.orderNum + '</span></li>' +
                            '<li><span>'+languagePackage['线下转账']+':</span><span>' + formatCurrency(sumPrice) +languagePackage['元'] + '</span></li></ul>';
                        dialogOpt({
                            title: languagePackage['订单通知'],
                            class: "staff-modify",
                            content: tips,
                            textOkey: languagePackage['关闭'],
                            btnClass: 'btn1',
                            funcOkey: function () {
                                alertReturn(languagePackage["支付成功!"]);
                                setTimeout(function () {
                                    window.location.href = 'p_order_detail_offLine.html?orderId=' + orderId;
                                }, 2000);
                            }
                        })
                    }, function (resp) {
                        alertReturn(resp.exception);
                    });
                } else {
                    var html = '<div class="password-box">' +
                        '<h1>'+languagePackage['请输入交易密码']+'</h1>' +
                        '<input class="trade-passwd" type="password"/>' +
                        '<a href="p_trade_password.html" target="_blank">'+languagePackage['忘记交易密码']+'?</a>' +
                        '</div>';
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
                            //payType: 支付方式:1余额,2网银转账,0线下转账
                            // bankId (string, optional): 银行编码，非必填 ,
                            //     couponId (integer, optional): 优惠券ID，非必填 ,
                            //     orderId (integer, optional): 订单id，必填 ,
                            //     payType (string, optional): 支付方式:0线下转账,1余额,2网银转账，必填 ,
                            //     thirdPayType (string, optional): 1:(个人网银)B2C, 2:(企业网银)B2B，非必填 ,
                            //     tradePassword (string, optional): 交易密码，线上支付必填
                            if (settings.isPay == 1) {//银行支付
                                interface.payOrder({
                                    packType:packType,
                                    thirdPayType: settings.thirdPayType,
                                    orderId: settings.orderId,
                                    payType: settings.payType,
                                    bankId: settings.bankId,
                                    couponId: settings.couponId,
                                    tradePassword: tradePassword
                                }, function (resp) {
                                    if (resp.code == 0) {
                                        if (settings.payType == 2) {//网银转账
                                            openwin(resp.data);
                                            d1.remove();
                                            var tipsHtml = '<p>'+languagePackage['您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口']+' </p>' +
                                                '<p class="fts-14 color-9d">'+languagePackage['您支付成功后，可点击下方按钮进行下一步操作。']+'</p>' +
                                                '<p class="payProblem"><a class="tips-a">'+languagePackage['已完成支付，进行下一步']+' &gt;&gt;</a></p>' +
                                                '<p><a href="javascript:;" class="color-41 fts-14" id="choiceOtherPayType">'+languagePackage['支付遇到问题,选择其他支付方式']+'&gt;&gt;</a></p>';
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
                                            $('#choiceOtherPayType').off('click').on('click', function () {
                                                window.location.reload();
                                            });
                                            $('.tips-a').off('click').on('click', function () {
                                                interface.isPayed({
                                                    orderId: orderId
                                                }, function (resp) {
                                                    if (resp.code === 0) {
                                                        if (resp.data.payed) {
                                                            me.firstPay(resp.data.orderNum);
                                                        } else {
                                                            alertReturn(languagePackage["支付未完成"]);
                                                        }
                                                    } else {
                                                        alertReturn(resp.exception);
                                                    }
                                                }, function (resp) {
                                                    alertReturn(resp.exception);
                                                })
                                            });
                                        } else {
                                            me.firstPay(resp.data.orderNum);
                                            d1.remove();
                                        }
                                    } else {
                                        alertReturn(resp.exception);
                                    }
                                }, function (resp) {
                                    alertReturn(resp.exception);
                                }, false);
                            } else if (settings.isPay == 2) {// var isPay = 2;  //结算尾款
                                interface.finishEndOrder({
                                    id: settings.orderId,
                                    payType: settings.payType,
                                    thirdPayType: settings.thirdType,
                                    bankId: settings.bankId,
                                    couponId: settings.couponId,
                                    tradePassword: tradePassword
                                }, function (resp) {
                                    if (resp.code == 0) {
                                        if (settings.payType == 2) {
                                            openwin(resp.data);
                                            d1.remove();
                                            var tipsHtml = '<p>'+languagePackage['您在新的网上银行页面进行支付；支付完成前请不要关闭该窗口']+' </p>' +
                                                '<p class="fts-14 color-9d">'+languagePackage['您支付成功后，可点击下方按钮进行下一步操作。']+'</p>' +
                                                '<p class="payProblem"><a class="tips-a">'+languagePackage['已完成支付，进行下一步']+' &gt;&gt;</a></p>' +
                                                '<p><a href="javascript:;" class="color-41 fts-14" id="choiceOtherPayType">'+languagePackage['支付遇到问题,选择其他支付方式']+'&gt;&gt;</a></p>';
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
                                            $('#choiceOtherPayType').off('click').on('click', function () {
                                                window.location.reload();
                                            });
                                            $('.tips-a').off('click').on('click', function () {
                                                interface.isPayed({
                                                    orderId: orderId
                                                }, function (resp) {
                                                    if (resp.code === 0) {
                                                        if (resp.data.payed) {
                                                            me.firstPay(resp.data.orderNum);
                                                        } else {
                                                            alertReturn(languagePackage["支付未完成"]);
                                                        }
                                                    } else {
                                                        alertReturn(resp.exception);
                                                    }
                                                }, function (resp) {
                                                    alertReturn(resp.exception);
                                                })
                                            });
                                        } else {
                                            me.secondPay(settings.leftPrice || "", orderId);
                                            d1.remove();
                                        }
                                    } else {
                                        alertReturn(resp.exception);
                                    }
                                }, function (resp) {
                                    alertReturn(resp.exception);
                                }, false);
                            } else if (settings.isPay == 4) {//余额支付
                                interface.payOrder({
                                    packType:packType,
                                    thirdPayType: settings.thirdPayType,
                                    orderId: settings.orderId,
                                    payType: settings.payType,
                                    bankId: settings.bankId,
                                    couponId: settings.couponId,
                                    tradePassword: tradePassword
                                }, function (resp) {
                                    if (resp.code === 0) {
                                        d1.remove();
                                        me.firstPay(data.orderNum);
                                    } else {
                                        alertReturn(resp.exception);
                                    }
                                }, function (resp) {
                                    alertReturn(resp.exception);
                                })
                            }
                        }
                    });
                }
            },
            //首次支付成功提示
            firstPay: function (orderNum) {
                var tipsHtml = '<h1>'+languagePackage['支付成功！']+'</h1>' +
                    '<h2>'+languagePackage['请尽快提交提货申请，以便卖家做好提货准备。']+'</h2>' +
                    '<ul class="order-detailInfo fts-14">' +
                    '<li><label>'+languagePackage['订单号']+':</label><span>' + orderNum + '</span></li>' +
                    '<li><label>'+languagePackage['在线支付']+':</label><span>' + formatCurrency(finalPrice) + languagePackage['元']+'</span></li></ul>';
                var d2 = dialogOpt({
                    title: languagePackage['付款通知'],
                    class: 'tips-dialog',
                    content: tipsHtml,
                    textOkey: languagePackage['关闭'],
                    funcOkey: function () {
                        d2.remove();
                        window.location.href = "p_order_detail.html?orderId=" + orderId;
                    }
                });
            },
            //尾款结算成功提示
            secondPay: function (leftPrice, id) {
                var tipsHtml = '<h1>'+languagePackage['支付尾款成功！']+'</h1>' +
                    '<h2>'+languagePackage['本次交易您的实际提货量超出中标量，已成功支付']+'<i class="red">' + leftPrice.toFixed(2) + ''+languagePackage['元']+'</i>'+languagePackage['尾款。']+'</h2>';
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
            },
            getBankList: function (type) {
                var bankList = "";
                return type === 'B2C' ?
                    bankList = [
                        {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                        {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                        {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                        {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                        {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                        {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                        {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                        {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                        {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                        {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                        {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                        {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                        {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                        {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                        {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                        {name: "恒丰银行", imageUrl: "../images/bank/bank16.gif", id: "EGB"},
                        {name: "浙商银行", imageUrl: "../images/bank/bank17.gif", id: "CZB"},
                        {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                        {name: "上海银行", imageUrl: "../images/bank/bank19.gif", id: "SHB"},
                        {name: "厦门银行", imageUrl: "../images/bank/bank20.jpg", id: "XMB"}
                    ]
                    : bankList = [
                        {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                        {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                        {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                        {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                        {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                        {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                        {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                        {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                        {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                        {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                        {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                        {name: "青岛银行", imageUrl: "../images/bank/bank21.gif", id: "QDB"},
                        {name: "徽商银行", imageUrl: "../images/bank/bank22.png", id: "AHHSB"},
                        {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                        {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                        {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                        {name: "天津银行", imageUrl: "../images/bank/bank23.png", id: "TJB"},
                        {name: "宁波银行", imageUrl: "../images/bank/bank24.gif", id: "NBCB"},
                        {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                        {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                        {name: "杭州银行", imageUrl: "../images/bank/bank25.jpg", id: "HCCB"}
                    ];
            }

        };
    orderPay.init();
});
