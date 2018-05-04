/**
 * @authors sfj
 * @date    2016-08-28
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    require("interface");
    var bootstrap = require("bootstrap");
    var header = require('header');
    var area = require("area");
    var cityselect = require('cityselect');
    require("pagination");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var filter = require('filter');
    filter.showLoginStatus();
    require('underscore-min');
    require('intlTel');
    var utils =  require("utils");
    var languagePackage = null;
    var user = getUser();//获取登录状态
    var goodsId = request('goodsId');//获取商品I
    var indexTab = request('indexTab');//登录注册tab；1：登录tab；2：注册tab；
    var goodsConvert = {};

    goodsConvert.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.intlTel();
        // this.areaInit();
        this.operation();

    }
    goodsConvert.template = function () {

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
    }
    goodsConvert.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_integral_mallNational/p_integral_mall.json',function (resp) {
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
    goodsConvert.renderBlock = function () {
        $("#goods_convert_area").html(template('t:goods_convert_area'));
        var getSelectOption = require('../js/component/city/mainCity.js');//左侧菜单
        var province = getSelectOption.getSelectOption('province');//中国省市
        var foreignCounty = getSelectOption.getSelectOption('foreignCounty');//国外的国家
        var countryType = getSelectOption.getSelectOption('countryType2');//国家类型
        $("#s_province").html(province);
        $(".foreign_country").html(foreignCounty);
        $("#choose_country").html(countryType);

    }
    goodsConvert.intlTel = function () {
        $("#phone").intlTelInput({
            utilsScript: utils
        });
    }
    //城市初始化
    // goodsConvert.areaInit = function () {
    //     $("#city").citySelect({nodata: "none", required: false});
    // }
    goodsConvert.operation = function () {
        goodsConvert.countryChange();
        goodsConvert.submit();
        goodsConvert.removeRed();
        goodsConvert.return();
        goodsConvert.strLimit();
    }
    goodsConvert.countryChange = function () {
        $('#choose_country').on('change',function(){
            var countryVal = $(this).val();
            if(countryVal == languagePackage['中国']){
                if(!$(".foreign_country").hasClass('hide')){
                    $(".foreign_country").addClass('hide')
                }
                if($(".inland_country").hasClass('hide')){
                    $(".inland_country").removeClass('hide')
                }
            }else{
                if(!$(".inland_country").hasClass('hide')){
                    $(".inland_country").addClass('hide')
                }
                if($(".foreign_country").hasClass('hide')){
                    $(".foreign_country").removeClass('hide')
                }
            }
        });
    }
    goodsConvert.strLimit = function(){
        $('.convert_detail li>div input.maxLen-50').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                var val = trim($this.val());
                var valRealLen = val.length;
                var valLen = strLen(val);
                if(valLen>50){
                    $this.val(cutstr(val,50));
                }
            }
        })
        $('.convert_detail li>div input.maxLen-150').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                var val = trim($this.val());
                var valRealLen = val.length;
                var valLen = strLen(val);
                if(valLen>120){
                    $this.val(cutstr(val,120));
                }
            }
        })
    }
    goodsConvert.submit = function () {
        $(".convert_submit .goods_submit").unbind('click').bind('click',function (){
            var empty = 0;
            var phone  = trim( $('.phone').val());
            var areaCode = $('.phone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            areaCode = getAreaCode(areaCode);
            var receiver  = trim($('.receiver ').val());
            var province = ($('#s_province').val()==languagePackage['请选择'])?"":$('#s_province').val();//省
            // var city = $('#s_city').val();//市
            var addr = $('.addr_detail').val();//市
            var countryType =  $('#choose_country').val();
            var country = "";
            if(countryType == languagePackage['中国']){
                country = countryType;
                if(province==""){
                    $('.province').siblings('.error').html(languagePackage['*省市不能为空']);
                    empty = 1;
                }
            }else{
                country = $(".foreign_country").val();
                if(country == languagePackage['请选择国家或地区']){
                    $('.foreign_country').siblings('.error').html(languagePackage['*国家或地区不能为空']);
                    empty = 1;
                }
            }
            if (addr == '') {
                $('.addr_detail').siblings('.error').html(languagePackage['*收件地址不能为空']);
                $('.addr_detail').addClass('red');
                empty = 1;
            }else{
                if(!isBankAddr(addr)){
                    $('.addr_detail').siblings('.error').html(languagePackage['*格式错误']);
                    $('.addr_detail').addClass('red');
                    empty = 1;
                }
            }

            if (phone) {
                if (!matchMobile(phone)) {
                    $('.phone').parent(".intl-tel-input").siblings('.error').html(languagePackage['*格式错误']);
                    $('.phone').addClass('red');
                    empty = 1;
                }
            }else{
                $('.phone').parent(".intl-tel-input").siblings('.error').html(languagePackage['*收件电话不能为空']);
                $('.phone').addClass('red');
                empty = 1;
            }
            if (!receiver) {
                $('.receiver').siblings('.error').html(languagePackage['*收件人不能为空']);
                $('.receiver').addClass('red');
                empty = 1;
            }else{
                if(!isBankAddr(receiver)){
                    $('.receiver').siblings('.error').html(languagePackage['*格式错误']);
                    $('.receiver').addClass('red');
                    empty = 1;
                }
            }
            if (empty == 1) {
                alertReturn(languagePackage['填写信息有误']);
                return false;
            }
            phone = areaCode+' '+phone;
            var para={
                addr:addr,
                goodsId:goodsId,
                phone:phone,
                receiver:receiver,
                country:country
            }
            if(countryType == languagePackage['中国']){
                // para.city = city;
                para.province = province;

            }
            interface.goodsConvert(para,function (resp) {
                if (resp.code == 0){
                    setUser(user,function (resp) {
                        alertReturn(languagePackage['提交成功，等待平台发货'], function call(){window.location.href = 'p_integral_mall.html';});
                    });
                }else{
                    alertReturn(resp.exception);
                }
            },function (resp) {

            })
        })
    }
    goodsConvert.removeRed=function () {
        $('.convert_detail li>div input').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })
        $('.convert_detail li>div input.phone').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $('.phone').parent(".intl-tel-input").siblings('.error').html('');
            }
        })
        $('.convert_detail li>div  select').focus(function () {
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })
}
    goodsConvert.return= function () {
        $(".convert_submit .cancel").unbind('click').bind('click',function (){
            window.location.href="p_integral_mall.html";
            // window.location.reload="p_integral_mall.html";
        })
    }



    goodsConvert.init();
});
