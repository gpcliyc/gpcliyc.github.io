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
    require("interface");
    var zic = require("zic");
    var webuploader = require("webuploader");
    var zic_type = require("zic_type");
    var area = require("area");
    var header = require("header");
    require("quickQuery-packer");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    require('underscore-min');
    require('intlTel');
    var utils = require("utils");
    var languagePackage = null;
    var isShowTab3 = 1;
    var cityselect = require('cityselect');

    var user = getUser();//获取登录状态
    var uIdCard = new UploadPic();
    var uIdCards = new UploadPic();
    var uIdCardss = new UploadPic();
    var uIdCardsss = new UploadPicType();
    var businessLicenseOnly = 1;// 是否三证合一,1是0否;
    var userId = '';//用户id
    var personalFunc = {};
    var data_arguments = {};
    personalFunc.init = function () {
        this.template();
        // this.selectLanguage();
        this.renderBlock();
        this.intlTel();
        this.judge();//判断状态
        // this.operation();

    }
    var arriveBankArray = new Array("", "", "");
    arriveBankArray[0] = new Array("0", "中国工商银行", "");
    arriveBankArray[1] = new Array("1", "中国农业银行", "");
    arriveBankArray[2] = new Array("2", "中国建设银行", "");
    arriveBankArray[3] = new Array("3", "招商银行", "");
    arriveBankArray[4] = new Array("4", "中国银行", "");
    arriveBankArray[5] = new Array("5", "中国邮政储蓄银行", "");
    arriveBankArray[6] = new Array("6", "交通银行", "");
    arriveBankArray[7] = new Array("7", "中信银行", "");
    arriveBankArray[8] = new Array("8", "中国民生银行", "");
    arriveBankArray[9] = new Array("9", "中国光大银行", "");
    arriveBankArray[10] = new Array("10", "兴业银行", "");
    arriveBankArray[11] = new Array("11", "浦发银行", "");
    arriveBankArray[12] = new Array("12", "广发银行", "");
    arriveBankArray[13] = new Array("13", "平安银行", "");
    arriveBankArray[14] = new Array("14", "华夏银行", "");
    arriveBankArray[15] = new Array("15", "北京银行", "");
    arriveBankArray[16] = new Array("16", "上海银行", "");
    arriveBankArray[17] = new Array("17", "江苏银行", "");
    arriveBankArray[18] = new Array("18", "北京农商银行", "");
    arriveBankArray[19] = new Array("19", "日照银行股份有限公司", "");
    arriveBankArray[20] = new Array("20", "江苏省农村信用社联合社", "");
    window.onload = function () {
        $quickQuery(arriveBankArray, {"isPage": false});
    }

    window.onbeforeunload = function () {
        if (!$(".login-out").hasClass("login-false")) {
            var companyId = $('#_companyId').val();//公司ID
            var companyType = trim($('.company-type').val());//公司分类value值
            var companyTypeName = "";//公司分类名称
            var companyName = trim($('.compantName').val());//公司名称
            var businessLicenseNum = trim($('.businessLicenseNum').val());//营业执照注册号 （三证合一时必填）
            var businessLicenseNumImage = $('.png-box1 .file-item').attr('src');//营业执照注册证（三证合一时必填）
            var businessLicenseNumImageName = $('.png-box1 .file-item').attr('data-name');
            var organizationCode = trim($('.organizationCode').val());//组织机构代码（三证不合一时必填）
            var organizationCodeImage = $('.png-box2 .file-item').attr('src');//组织机构代码证(三证不合一时必填) ,
            var organizationCodeImageName = $('.png-box2 .file-item').attr('data-name');
            var dutyParagraphImage = $('.png-box3 .file-item').attr('src');//税务登记证（三证不合一时必填）
            var dutyParagraphImageName = $('.png-box3 .file-item').attr('data-name');//税务登记证（三证不合一时必填）
            var otherBusinessLicenseImage = $('.png-box4 .file-item').attr('src');//营业执照--其他证件
            var otherBusinessLicenseImageName = $('.png-box4 .file-item').attr('data-name');

            var foreignBusinessLicenseImage = $('.png-box5 .file-item').attr('src');//海外注册证件
            var foreignBusinessLicenseImageName = $('.png-box5 .file-item').attr('data-name');
            var foreignOtherBusinessLicenseImage = $('.png-box6 .file-item').attr('src');//海外注册证件--其他证件
            var foreignOtherBusinessLicenseImageName = $('.png-box6 .file-item').attr('data-name');

//            var stampImg = $('.png-box4 img').attr('src');//协议印章
            var dutyParagraph = trim($('.dutyParagraph').val());//税号（三证不合一时必填）
            var countryType = $('#choose_country').val();//公司地址:国家 ,
            var province = $('.province').val();//公司地址:省
            var city = $('.city').val();//公司地址:市 ,
            var addrDetail = trim($('.addrDetail').val());//公司地址详情 ,
            var companyLegalPerson = trim($('.companyLegalPerson').val());//公司法人 ,
            var companyPhone = trim($('.companyPhone').val());//公司电话
            var bankCard = trim($('.bankCard').val());
            var reg = new RegExp(" ", "g"); //创建正则RegExp对象
            bankCard = bankCard.replace(reg, '');
            var bankName = trim($('.bankName').val());//开户行
            var bankUser = trim($('.bankUser').val());
            var bankBranch = trim($('.bankBranch').val());
            // var bankCity = $('.bankCity').val();
            // var bankProvince = $('.bankProvince').val();
            var connectName = trim($('.connectName').val());//联系人信息:联系人姓名 ,
            var connectIdcard = trim($('.connectIdcard').val());//联系人信息:证件号 ,
            var connectTelephone = trim($('.connectTelephone').val());//联系人信息:手机号(默认注册手机号) ,
            var connectEmail = trim($('.connectEmail').val());//联系人信息:邮箱 ,
            var companyList = {};
            var companyTypeList = $('.list_companyArea .company-type option');

            var foreignCountry = $(".foreign_country").val(); //海外国家
            var foreignRegistrNum = trim($(".foreignRegistrNum").val());//海外公司注册号
            var foreignDutyNum = trim($(".foreignDutyNum").val());//海外公司税号
            var foreignCompanyLegalPerson = trim($(".foreignCompanyLegalPerson").val());//海外公司法人
            var foreignBankUser = trim($(".foreignBankUser").val());//海外公司开户名称
            var foreignBankCard = trim($(".foreignBankCard").val());//海外公司银行账号
            var foreignBankAddr = trim($(".foreignBankAddr").val());//海外公司银行地址
            var foreignSwiftCode = trim($(".foreignSwiftCode").val());//海外公司swift码

            var foreignCompanyPhone = trim($('.foreignCompanyPhone').val());
            var foreignCompanyPhoneTitle = $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var foreignCompanyPhoneClass = $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var foreignCompanyPhoneAreaCode = getAreaCode(foreignCompanyPhoneTitle);

            var companyPhoneTitle = $('.companyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var companyPhoneClass = $('.companyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var companyPhoneAreaCode = getAreaCode(companyPhoneTitle);
            var connectTelephoneTitle = $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var connectTelephoneClass = $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var connectTelephoneAreaCode = getAreaCode(connectTelephoneTitle);


            if (foreignCountry) {
                companyList.foreignCountry = foreignCountry;
            } else {
                companyList.foreignCountry = "请选择国家或地区"
            }
            if (foreignRegistrNum != "") {
                companyList.foreignRegistrNum = foreignRegistrNum;
            }
            if (foreignDutyNum != "") {
                companyList.foreignDutyNum = foreignDutyNum;
            }
            if (foreignCompanyLegalPerson != "") {
                companyList.foreignCompanyLegalPerson = foreignCompanyLegalPerson;
            }

            if (foreignBankUser != "") {
                companyList.foreignBankUser = foreignBankUser;
            }
            if (foreignBankCard != "") {
                companyList.foreignBankCard = foreignBankCard;
            }
            if (foreignBankAddr != "") {
                companyList.foreignBankAddr = foreignBankAddr;
            }
            if (foreignSwiftCode != "") {
                companyList.foreignSwiftCode = foreignSwiftCode;
            }
            if (foreignCompanyPhone != "") {
                companyList.foreignCompanyPhone = foreignCompanyPhone;
            }

            if (foreignCompanyPhoneAreaCode != "") {
                companyList.foreignCompanyPhoneAreaCode = foreignCompanyPhoneAreaCode;
            }
            if (companyPhoneAreaCode != "") {
                companyList.companyPhoneAreaCode = companyPhoneAreaCode;
            }
            if (connectTelephoneAreaCode != "") {
                companyList.connectTelephoneAreaCode = connectTelephoneAreaCode;
            }
            if (foreignCompanyPhoneTitle) {
                companyList.foreignCompanyPhoneTitle = foreignCompanyPhoneTitle;
            }
            if (foreignCompanyPhoneClass) {
                companyList.foreignCompanyPhoneClass = foreignCompanyPhoneClass;
            }
            if (companyPhoneTitle) {
                companyList.companyPhoneTitle = companyPhoneTitle;
            }
            if (companyPhoneClass) {
                companyList.companyPhoneClass = companyPhoneClass;
            }
            if (connectTelephoneClass) {
                companyList.connectTelephoneClass = connectTelephoneClass;
            }
            if (connectTelephoneTitle) {
                companyList.connectTelephoneTitle = connectTelephoneTitle;
            }


            if (companyType != "") {
                for (var i = 0; i < $(companyTypeList).length; i++) {
                    if (companyTypeList.eq(i).attr("value") == companyType) {
                        companyTypeName = companyTypeList.eq(i).text();
                    }
                }
            }
            if (countryType) {
                companyList.countryType = countryType;

            }
            if (companyId) {
                companyList.id = companyId;
            }
            if (addrDetail != "") {
                companyList.addrDetail = addrDetail;
            }
            if (bankCard != "") {
                companyList.bankCard = bankCard;
            }
            if (bankName != "") {
                companyList.bankName = bankName;
            }
            // if (bankCity != "" && bankCity !== null) {
            //     companyList.bankCity = bankCity;
            // }
            if (bankUser != "") {
                companyList.bankUser = bankUser;
            }
            if (bankName != "") {
                companyList.bankName = bankName;
            }
            if (bankBranch != "") {
                companyList.bankBranch = bankBranch;
            }
            // if (bankProvince != null) {
            //     companyList.bankProvince = bankProvince;
            // }
            if (businessLicenseNum != "") {
                companyList.businessLicenseNum = businessLicenseNum;
            }
            if (businessLicenseNumImage != "") {
                companyList.businessLicenseNumImage = businessLicenseNumImage;
            }
            if (businessLicenseNumImageName != "") {
                companyList.businessLicenseNumImageName = businessLicenseNumImageName;
            }

            if (otherBusinessLicenseImage != "") {
                companyList.otherBusinessLicenseImage = otherBusinessLicenseImage;
            }
            if (otherBusinessLicenseImageName != "") {
                companyList.otherBusinessLicenseImageName = otherBusinessLicenseImageName;
            }
            if (foreignBusinessLicenseImage != "") {
                companyList.foreignBusinessLicenseImage = foreignBusinessLicenseImage;
            }
            if (foreignBusinessLicenseImageName != "") {
                companyList.foreignBusinessLicenseImageName = foreignBusinessLicenseImageName;
            }

            if (foreignOtherBusinessLicenseImage != "") {
                companyList.foreignOtherBusinessLicenseImage = foreignOtherBusinessLicenseImage;
            }
            if (foreignOtherBusinessLicenseImageName != "") {
                companyList.foreignOtherBusinessLicenseImageName = foreignOtherBusinessLicenseImageName;
            }


            if ($('.ui-radio-options li:eq(1)').hasClass('checked')) {
                companyList.businessLicenseOnly = 0;
            }
            if (city != "" || city != "请选择") {
                companyList.city = city;
            }
            if (companyLegalPerson != "") {
                companyList.companyLegalPerson = companyLegalPerson;
            }
            if (companyName != "") {
                companyList.companyName = companyName;
            }
            if (companyPhone != "") {
                companyList.companyPhone = companyPhone;
            }
            if (companyType != "") {
                companyList.companyType = companyType;
            }
            if (companyTypeName != "") {
                companyList.companyTypeName = companyTypeName;
            }
            if (connectEmail != "") {
                companyList.connectEmail = connectEmail;
            }
            if (connectIdcard != "") {
                companyList.connectIdcard = connectIdcard;
            }
            if (connectName != "") {
                companyList.connectName = connectName;
            }
            if (connectTelephone != "") {
                companyList.connectTelephone = connectTelephone;
            }
            if (dutyParagraph != "") {
                companyList.dutyParagraph = dutyParagraph;
            }
            if (dutyParagraphImage != "") {
                companyList.dutyParagraphImage = dutyParagraphImage;
            }
            if (dutyParagraphImageName != "") {
                companyList.dutyParagraphImageName = dutyParagraphImageName;
            }
            if (organizationCode != "") {
                companyList.organizationCode = organizationCode;
            }
            if (organizationCodeImage != "") {
                companyList.organizationCodeImage = organizationCodeImage;
            }
            if (organizationCodeImageName != "") {
                companyList.organizationCodeImageName = organizationCodeImageName;
            }
            if (province != "" || province != "请选择") {
                companyList.province = province;
            }
//            if (stampImg != "") {
//                companyList.stampImg = stampImg;
//            }
            var companyArray = _GET_DATA('companyList') || {};
            companyArray['company_' + userId] = companyList;
            _SET_DATA('companyList', companyArray);

            return;
        }
    }

    personalFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_integral_mallNational/p_integral_mall.json', function (resp) {
            if (resp) {
                for (var i = resp.length - 1; i >= 0; i--) {
                    var keys = _.keys(resp[i]);
                    if (language === keys[0]) {
                        languagePackage = resp[i][language];
                        break;
                    }
                }
            }
        })
    }
    personalFunc.renderBlock = function () {
        $("#j_modBodyList").html(template('t:j_modBodyList'));
        var getSelectOption = require('../js/component/city/mainCity.js');//左侧菜单
        var province = getSelectOption.getSelectOption('province');//中国省市
        var foreignCounty = getSelectOption.getSelectOption('foreignCounty');//国外的国家
        var countryType = getSelectOption.getSelectOption('countryType');//国家类型
        // console.log(countryType);
//        $("#s_province").html(province);
        $(".foreign_country").html(foreignCounty);

        $("#choose_country").html(countryType);
        $("#choose_country").find("option").eq(0).attr("selected", true);
        // $("#city").citySelect({nodata:"none",required: false});
        personalFunc.initWebuploadList();


    }
    //webupload初始化，上传图片及pdf
    personalFunc.initWebuploadList = function () {
        var businessLicenseEl = "#businessLicenseImage .img-wrap";
        var businessLicenseInputEl = "#businessLicenseInput";
        // var $list=$("#businessLicenseImage .img-wrap");   /
        personalFunc.uploadFiles(businessLicenseEl, businessLicenseInputEl);

        var otherBusinessLicenseEl = "#otherBusinessLicenseImage .img-wrap";
        var otherBusinessLicenseInputEl = "#otherBusinessLicenseInput";
        personalFunc.uploadFiles(otherBusinessLicenseEl, otherBusinessLicenseInputEl)

        var organizeImageEl = "#organizeImage .img-wrap";
        var organizeInputEl = "#organizeInput";
        personalFunc.uploadFiles(organizeImageEl, organizeInputEl);

        var taxRegistrationImageEl = "#taxRegistrationImage .img-wrap";
        var taxRegistrationInputEl = "#taxRegistrationInput";
        personalFunc.uploadFiles(taxRegistrationImageEl, taxRegistrationInputEl);

        var foreignBusinessLicenseEl = "#foreignBusinessLicenseImage .img-wrap";
        var foreignBusinessLicenseInputEl = "#foreignBusinessLicenseInput";
        // var $list=$("#businessLicenseImage .img-wrap");   /
        personalFunc.uploadFiles(foreignBusinessLicenseEl, foreignBusinessLicenseInputEl);
        var foreignOtherBusinessLicenseEl = "#foreignOtherBusinessLicenseImage .img-wrap";
        var foreignOtherBusinessLicenseInputEl = "#foreignOtherBusinessLicenseInput";
        personalFunc.uploadFiles(foreignOtherBusinessLicenseEl, foreignOtherBusinessLicenseInputEl);


    }
    personalFunc.intlTel = function () {
        $(".companyPhone").intlTelInput({
            utilsScript: utils
        });

        $(".foreignCompanyPhone").intlTelInput({
            utilsScript: utils
        });
        $(".connectTelephone").intlTelInput({
            utilsScript: utils
        });

    }
    personalFunc.operation = function () {
        personalFunc.countryChange();
        personalFunc.countryRender();
        personalFunc.foreignCountryChange();

    }
    personalFunc.updateUploadStr = function (companyList) {
        if (companyList.businessLicenseNumImage) {
            $("#businessLicenseImage button.upload").html("重新上传");
        }
        if (companyList.organizationCodeImage) {
            $("#organizeImage button.upload").html("重新上传");
        }
        if (companyList.dutyParagraphImage) {
            $("#taxRegistrationImage button.upload").html("重新上传");
        }

        if (companyList.otherBusinessLicenseImage) {
            $("#otherBusinessLicenseImage button.upload").html("重新上传");
        }

        if (companyList.foreignBusinessLicenseImage) {
            $("#foreignBusinessLicenseImage button.upload").html("重新上传");
        }
        if (companyList.foreignOtherBusinessLicenseImage) {
            $("#foreignOtherBusinessLicenseImage button.upload").html("重新上传");
        }
    };
    personalFunc.foreignCountryChange = function () {
        $('.foreign_country').on('change', function () {
            var countryVal = $(this).val();
            if (countryVal != "请选择国家或地区") {
                var countryValObj = getIntlCountryArea(countryVal)
                var foreignCompanyPhone = trim($('.foreignCompanyPhone').val());
                var connectTelephone = trim($('.connectTelephone').val());
                if (countryValObj) {
                    //根据不同国家显示不同区号，去掉
//                    if(foreignCompanyPhone==""){
                    $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title", countryValObj.title);
                    $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", countryValObj.class);
//                    }
//                    if(connectTelephone == ""){
                    $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag").attr("title", countryValObj.title);
                    $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", countryValObj.class);
//                    }
                }
            }
            personalFunc.countryChangeRender(countryVal);
        });
    }
    personalFunc.countryChange = function () {
        $('#choose_country').on('change', function () {
            var countryVal = $(this).val();
            personalFunc.countryChangeRender(countryVal);
        });
    }
    personalFunc.countryRender = function () {
        var countryVal = $("#choose_country").val();
        personalFunc.countryChangeRender(countryVal);
    }
    personalFunc.countryChangeRender = function (countryVal) {
        if (countryVal == '中国') {
            if (!$(".foreign_country").hasClass('hide')) {
                $(".foreign_country").addClass('hide')
            }
            if ($(".inland_country").hasClass('hide')) {
                $(".inland_country").removeClass('hide')
            }
            if (!$(".foreign_area").hasClass('hide')) {
                $(".foreign_area").addClass('hide')
            }
            if ($(".inline_area").hasClass('hide')) {
                $(".inline_area").removeClass('hide')
            }
            $(".foreign-license-item").addClass('hide');
            $(".license-item").removeClass('hide');
            var countryValObj = getIntlCountryArea('中国');
            $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag").attr("title", countryValObj.title);
            $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", countryValObj.class);
        } else {
            if (!$(".inland_country").hasClass('hide')) {
                $(".inland_country").addClass('hide')
            }
            if ($(".foreign_country").hasClass('hide')) {
                $(".foreign_country").removeClass('hide')
            }
            if (!$(".inline_area").hasClass('hide')) {
                $(".inline_area").addClass('hide')
            }
            if ($(".foreign_area").hasClass('hide')) {
                $(".foreign_area").removeClass('hide')
            }
            $(".license-item").addClass('hide');
            $(".foreign-license-item").removeClass('hide');
        }
    }
    personalFunc.setLocalStorage = function (companyList) {
        var newList = {};
        if (companyList) {
            if (companyList.id) newList.id = companyList.id;
            if (companyList.companyName) newList.companyName = companyList.companyName;
            if (companyList.companyType) newList.companyType = companyList.companyType;
            if (companyList.addrDetail) newList.addrDetail = companyList.addrDetail;
            if (companyList.connectEmail) newList.connectEmail = companyList.connectEmail;
            if (companyList.connectIdcard) newList.connectIdcard = companyList.connectIdcard;
            if (companyList.connectName) newList.connectName = companyList.connectName;
            if (companyList.connectTelephone) newList.connectTelephone = companyList.connectTelephone;
            if (companyList.connectTelephoneAreaCode) newList.connectTelephoneAreaCode = companyList.connectTelephoneAreaCode;
            if (companyList.connectTelephoneAddr) {
                newList.connectTelephoneTitle = companyList.connectTelephoneAddr.title;
                newList.connectTelephoneClass = companyList.connectTelephoneAddr.class;
            }
            if (companyList.province && companyList.province != "" && companyList.province != "请选择") {
                newList.province = companyList.province;
                if (companyList.city && companyList.city != "" && companyList.city != "请选择") {
                    newList.city = companyList.city;
                }

            }
            // else{
            //     newList.province = "请选择";
            //     newList.city = "请选择";
            // }


            if (companyList.country == '中国') {
                newList.countryType = '中国';
                newList.foreignCountry = "请选择国家或地区";
                if (companyList.bankCard) newList.bankCard = companyList.bankCard;
                if (companyList.bankName) newList.bankName = companyList.bankName;
                if (companyList.bankUser) newList.bankUser = companyList.bankUser;
                if (companyList.bankBranch) newList.bankBranch = companyList.bankBranch;
                if (companyList.bankUser) newList.bankUser = companyList.bankUser;
                if (companyList.bankBranch) newList.bankBranch = companyList.bankBranch;
                if (companyList.businessLicenseNum) newList.businessLicenseNum = companyList.businessLicenseNum;
                if (companyList.businessLicenseNumImage) newList.businessLicenseNumImage = companyList.businessLicenseNumImage;
                if (companyList.businessLicenseNumFileName) newList.businessLicenseNumImageName = companyList.businessLicenseNumFileName;
                if (companyList.companyLegalPerson) newList.companyLegalPerson = companyList.companyLegalPerson;
                if (companyList.companyPhone) newList.companyPhone = companyList.companyPhone;
                if (companyList.companyPhoneAreaCode) newList.companyPhoneAreaCode = companyList.companyPhoneAreaCode;
                if (companyList.dutyParagraph) newList.dutyParagraph = companyList.dutyParagraph;
                if (companyList.dutyParagraphImage) newList.dutyParagraphImage = companyList.dutyParagraphImage;
                if (companyList.dutyParagraphFileName) newList.dutyParagraphImageName = companyList.dutyParagraphFileName;
                if (companyList.organizationCode) newList.organizationCode = companyList.organizationCode;
                if (companyList.organizationCodeImage) newList.organizationCodeImage = companyList.organizationCodeImage;
                if (companyList.organizationCodeFileName) newList.organizationCodeImageName = companyList.organizationCodeFileName;
                newList.businessLicenseOnly = companyList.businessLicenseOnly;
                if (companyList.otherDocuments) newList.otherBusinessLicenseImage = companyList.otherDocuments;
                if (companyList.otherDocumentsFileName) newList.otherBusinessLicenseImageName = companyList.otherDocumentsFileName;
                if (companyList.companyPhoneAddr) {
                    newList.companyPhoneTitle = companyList.companyPhoneAddr.title;
                    newList.companyPhoneClass = companyList.companyPhoneAddr.class;
                }
            } else {
                newList.countryType = '其他国家和地区';
                newList.foreignCountry = companyList.country;
                if (companyList.bankCard) newList.foreignBankCard = companyList.bankCard;
                if (companyList.bankUser) newList.foreignBankUser = companyList.bankUser;
                if (companyList.dutyParagraph) newList.foreignDutyNum = companyList.dutyParagraph;
                if (companyList.companyLegalPerson) newList.foreignCompanyLegalPerson = companyList.companyLegalPerson;
                if (companyList.companyPhone) newList.foreignCompanyPhone = companyList.companyPhone;
                if (companyList.companyPhoneAreaCode) newList.foreignCompanyPhoneAreaCode = companyList.companyPhoneAreaCode;
                if (companyList.registNum) newList.foreignRegistrNum = companyList.registNum;
                if (companyList.registNumDoc) newList.foreignBusinessLicenseImage = companyList.registNumDoc;
                if (companyList.registNumDocFileName) newList.foreignBusinessLicenseImageName = companyList.registNumDocFileName;
                if (companyList.bankAddr) newList.foreignBankAddr = companyList.bankAddr;
                if (companyList.swift) newList.foreignSwiftCode = companyList.swift;
                if (companyList.otherDocuments) newList.foreignOtherBusinessLicenseImage = companyList.otherDocuments;
                if (companyList.otherDocumentsFileName) newList.foreignOtherBusinessLicenseImageName = companyList.otherDocumentsFileName;
                if (companyList.companyPhoneAddr) {
                    newList.foreignCompanyPhoneTitle = companyList.companyPhoneAddr.title;
                    newList.foreignCompanyPhoneClass = companyList.companyPhoneAddr.class;
                }
            }

        }
        return newList;
    }
    personalFunc.fillImageWrap = function (el, url, name) {
        if (getUrlSuffix(url) == 'pdf') {
            var html = '<div data-name="' + name + '" class="file-item thumbnail" src="' + url + '"><div><div class="pdf-text">PDF</div><div class="info">' + name + '</div></div></div>';
        } else {
            var html = '<div data-name="' + name + '"  class="file-item thumbnail" src="' + url + '"><div><img src="' + url + '" alt=""></div></div>';
        }
        $("." + el + " .img-wrap").html(html);
    }
    personalFunc.setData = function (companyList) {
        var companyList;
        if (companyList) {
            $("#_companyId").val(companyList.id);
            companyList = personalFunc.setLocalStorage(companyList);
        } else {
            if (_GET_DATA('companyList')['company_' + userId]) {
                companyList = _GET_DATA('companyList')['company_' + userId];
            }
        }
        if (!companyList || !companyList.province) {
            $("#city").citySelect({nodata: "none", required: false});
        } else {
            $("#city").citySelect({prov: companyList.province, city: companyList.city});//初始化地区
        }
        if (companyList != undefined) {
            if (companyList.id) {
                $("#_companyId").val(companyList.id);
            }
            $('.company-type').val(companyList.companyType);//公司分类
            if (!companyList.companyTypeName) {
                if (companyList.companyType) {
                    var companyTypeName = '';
                    var companyTypeList = $('.list_companyArea .company-type option');
                    for (var i = 0; i < $(companyTypeList).length; i++) {
                        if (companyTypeList.eq(i).attr("value") == companyList.companyType) {
                            companyTypeName = companyTypeList.eq(i).text();
                            $('.company-type-commit').html(companyTypeName);
                        }
                    }
                }
            } else {
                $('.company-type-commit').html(companyList.companyTypeName);//公司分类
            }
            if (companyList.companyName) {
                var param = {};
                param.companyName = companyList.companyName;
                // if(companyList.)
                if (companyList.id) {
                    param.companyId = companyList.id;
                } else {
                    param.companyId = $("#_companyId").val();
                }
                interface.isCompanyExit(param, function (resp) {
                    if (resp.data && (resp.data.status == 1 || resp.data.status == 2)) {
                        $('.join').removeClass('hide');
                        $(".company-error").removeClass('hide');
                        $('.judge').addClass('hide');
                    }
                })
            }
            $('#choose_country').val(companyList.countryType);
            $('.compantName').val(companyList.companyName);//公司名称
            $('.compantName-commit').html(companyList.companyName);//公司名称
            $('.businessLicenseNum').val(companyList.businessLicenseNum);//营业执照注册号 （三证合一时必填）
            $('.businessLicenseNum-commit').html(companyList.businessLicenseNum);//营业执照注册号 （三证合一时必填）
            //营业执照注册证（三证合一时必填）
            if (companyList.businessLicenseNumImage) {
                personalFunc.fillImageWrap('png-box1', companyList.businessLicenseNumImage, companyList.businessLicenseNumImageName);
            }
            // $('.png-box1 img').attr('src', companyList.businessLicenseNumImage);
            $('.organizationCode').val(companyList.organizationCode);//组织机构代码（三证不合一时必填）
            $('.organizationCode-commit').html(companyList.organizationCode);//组织机构代码（三证不合一时必填）

            //组织机构代码证(三证不合一时必填) ,
            if (companyList.organizationCodeImage) {
                personalFunc.fillImageWrap('png-box2', companyList.organizationCodeImage, companyList.organizationCodeImageName);
            }

            //税务登记证（三证不合一时必填）
            if (companyList.dutyParagraphImage) {
                personalFunc.fillImageWrap('png-box3', companyList.dutyParagraphImage, companyList.dutyParagraphImageName);
            }

            if (companyList.otherBusinessLicenseImage) {
                personalFunc.fillImageWrap('png-box4', companyList.otherBusinessLicenseImage, companyList.otherBusinessLicenseImageName);
            }

            if (companyList.foreignBusinessLicenseImage) {
                personalFunc.fillImageWrap('png-box5', companyList.foreignBusinessLicenseImage, companyList.foreignBusinessLicenseImageName);
            }
            if (companyList.foreignOtherBusinessLicenseImage) {
                personalFunc.fillImageWrap('png-box6', companyList.foreignOtherBusinessLicenseImage, companyList.foreignOtherBusinessLicenseImageName);
            }


            // $('.png-box2 img').attr('src', companyList.organizationCodeImage);//组织机构代码证(三证不合一时必填) ,
            if (companyList.businessLicenseOnly == 0) {
                $(".together-untrue li").removeClass("checked");
                $(".together-untrue li.no_together").addClass("checked");
                $(".businessLicenseOnly-commit li").removeClass("checked");
                $(".businessLicenseOnly-commit li.no_together").addClass("checked");
                $(".businessLicenseOnly-commit li.no_together").removeClass("hide");
                $(".businessLicenseOnly-commit li.is_together").addClass("hide");
                $('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入15位营业执照注册号(字母或数字)');
                businessLicenseOnly = 0;
                $('.card-hide').show();
                $(".three-no").removeClass("hide");
                $(".other-buss-card").addClass('hide');
                $(".license-item-commit .other-license").addClass('hide');
            } else {
                $(".together-untrue li").removeClass("checked");
                $(".together-untrue li.is_together").addClass("checked");
                $(".businessLicenseOnly-commit li").removeClass("checked");
                $(".businessLicenseOnly-commit li.is_together").addClass("checked");
                $(".businessLicenseOnly-commit li.is_together").removeClass("hide");
                $(".businessLicenseOnly-commit li.no_together").addClass("hide");
                $('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入18位统一社会信用代码(字母或数字)');
                businessLicenseOnly = 1;
                $('.card-hide').hide();
                $(".three-no").addClass('hide');
                $(".other-buss-card").removeClass('hide');
                if (companyList.otherBusinessLicenseImage) {
                    $(".license-item-commit .other-license").removeClass('hide');
                }
            }

            $(".foreign_country").val(companyList.foreignCountry);//海外国家
            $(".foreignRegistrNum").val(companyList.foreignRegistrNum);//海外公司注册号
            $(".foreignDutyNum").val(companyList.foreignDutyNum);//海外公司税号
            $(".foreignCompanyLegalPerson").val(companyList.foreignCompanyLegalPerson);//海外公司法人
            $(".foreignBankUser").val(companyList.foreignBankUser);//海外公司开户名称
            $(".foreignBankCard").val(companyList.foreignBankCard);//海外公司银行账号
            $(".foreignBankCard").keyup();//触发海外公司银行账号格式化
            $(".foreignBankAddr").val(companyList.foreignBankAddr);//海外公司银行地址
            $(".foreignSwiftCode").val(companyList.foreignSwiftCode);//海外公司swift码
            $(".foreignCompanyPhone").val(companyList.foreignCompanyPhone);//海外公司swift码
            $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title", companyList.foreignCompanyPhoneTitle);
            $('.foreignCompanyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", companyList.foreignCompanyPhoneClass);
            $('.companyPhone').parent(".intl-tel-input").find(".selected-flag").attr("title", companyList.companyPhoneTitle);
            $('.companyPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", companyList.companyPhoneClass);
            $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag").attr("title", companyList.connectTelephoneTitle);
            $('.connectTelephone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class", companyList.connectTelephoneClass);

            $(".foreign_country-commit").html(companyList.foreignCountry);//海外国家
            $(".foreignRegistrNum-commit").html(companyList.foreignRegistrNum);//海外公司注册号
            $(".foreignDutyNum-commit").html(companyList.foreignDutyNum);//海外公司税号
            $(".foreignCompanyLegalPerson-commit").html(companyList.foreignCompanyLegalPerson);//海外公司法人
            $(".foreignBankUser-commit").html(companyList.foreignBankUser);//海外公司开户名称
            $(".foreignBankCard-commit").html(formatBankCard2(companyList.foreignBankCard));//海外公司银行账号
            $(".foreignBankAddr-commit").html(companyList.foreignBankAddr);//海外公司银行地址
            $(".foreignSwiftCode-commit").html(companyList.foreignSwiftCode);//海外公司swift码
            $(".foreignCompanyPhone-commit").html(companyList.foreignCompanyPhoneAreaCode + " " + companyList.foreignCompanyPhone);//海外公司swift码


            // $('.png-box3 img').attr('src', companyList.dutyParagraphImage);//税务登记证（三证不合一时必填）
//        $('.png-box4 img').attr('src', companyList.stampImg);//协议印章
            $('.dutyParagraph').val(companyList.dutyParagraph);//税号（三证不合一时必填）
            $('.dutyParagraph-commit').html(companyList.dutyParagraph);//税号（三证不合一时必填）
            // $('.country').val(companyList.country);//公司地址:国家 ,
            $('.province').val(companyList.province);//公司地址:省
            $('.province-commit').html(companyList.province);//公司地址:省
            $('.city').val(companyList.city);//公司地址:市 ,
            $('.city-commit').html(companyList.city);//公司地址:市 ,
            $('.addrDetail').val(companyList.addrDetail);//公司地址详情 ,
            $('.addrDetail-commit').html(companyList.addrDetail);//公司地址详情 ,
            $('.companyLegalPerson').val(companyList.companyLegalPerson);//公司法人 ,
            $('.companyLegalPerson-commit').html(companyList.companyLegalPerson);//公司法人 ,
            $('.companyPhone').val(companyList.companyPhone);//公司电话
            $('.companyPhone-commit').html(companyList.companyPhoneAreaCode + " " + companyList.companyPhone);//公司电话
            $('.bankCard').val(companyList.bankCard);
            $(".bankCard").keyup();//触发银行卡格式化
            $('.bankCard-commit').html(formatBankCard2(companyList.bankCard));
            //var reg = new RegExp(" ", "g"); //创建正则RegExp对象
            //bankCard = bankCard.replace(reg, '');
            $('.bankName').val(companyList.bankName);//开户行
            $('.bankName-commit').html(companyList.bankName);//开户行
            $('.bankUser').val(companyList.bankUser);
            $('.bankUser-commit').html(companyList.bankUser);
            $('.bankBranch').val(companyList.bankBranch);
            $('.bankBranch-commit').html(companyList.bankBranch);
            // $('.bankCity').val(companyList.bankCity);
            // $('.bankCity-commit').html(companyList.bankCity);
            // $('.bankProvince').val(companyList.bankProvince);
            // $('.bankProvince-commit').html(companyList.bankProvince);
            $('.connectName').val(companyList.connectName);//联系人信息:联系人姓名 ,
            $('.connectName-commit').html(companyList.connectName);//联系人信息:联系人姓名
            $('.connectIdcard').val(companyList.connectIdcard);//联系人信息:证件号 ,
            $('.connectIdcard-commit').html(companyList.connectIdcard);//联系人信息:证件号 ,
            $('.connectTelephone').val(companyList.connectTelephone);//联系人信息:手机号(默认注册手机号) ,
            $('.connectTelephone-commit').html(companyList.connectTelephoneAreaCode + " " + companyList.connectTelephone);//联系人信息:手机号(默认注册手机号) ,
            $('.connectEmail').val(companyList.connectEmail);//联系人信息:邮箱 ,
            $('.connectEmail-commit').html(companyList.connectEmail);//联系人信息:邮箱 ,

            if (companyList.countryType == "中国") {
                $(".inline_area-commit").removeClass('hide');
                $(".foreign_area-commit").addClass('hide');
                $(".license-item-commit").removeClass('hide');
                $(".foreign-license-item-commit").addClass('hide');
                // $("#city").citySelect({prov:companyList.province,city:companyList.city});//初始化地区
            } else {
                $(".inline_area-commit").addClass('hide');
                $(".foreign_area-commit").removeClass('hide');
                $(".license-item-commit").addClass('hide');
                $(".foreign-license-item-commit").removeClass('hide');
                if (companyList.foreignOtherBusinessLicenseImage) {
                    $(".foreign-license-item-commit .other-license").removeClass('hide');
                } else {
                    $(".foreign-license-item-commit .other-license").addClass('hide');
                }
            }
            personalFunc.updateUploadStr(companyList);
            personalFunc.dealwithImg();

        }
    }
    personalFunc.fillSuccessImage = function (companyList) {
        if (companyList.country == "中国") {
            if (companyList.businessLicenseNumImage) {
                personalFunc.fillImageWrap('png-box1', companyList.businessLicenseNumImage, companyList.businessLicenseNumFillName);
            }

            if (companyList.organizationCodeImage) {
                personalFunc.fillImageWrap('png-box2', companyList.organizationCodeImage, companyList.organizationCodeFillName);
            }

            //税务登记证（三证不合一时必填）
            if (companyList.dutyParagraphImage) {
                personalFunc.fillImageWrap('png-box3', companyList.dutyParagraphImage, companyList.dutyParagraphFillName);
            }

            if (companyList.otherDocuments) {
                personalFunc.fillImageWrap('png-box4', companyList.otherDocuments, companyList.otherDocumentsFileName);
            }
        } else {
            if (companyList.registNumDoc) {
                personalFunc.fillImageWrap('png-box5', companyList.registNumDoc, companyList.registNumDocFileName);
            }
            if (companyList.otherDocuments) {
                personalFunc.fillImageWrap('png-box6', companyList.otherDocuments, companyList.otherDocumentsFileName);
            }
        }


    }
    personalFunc.judge = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {

                userId = resp.data.id;//用户id

                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data, '公司认证'));

                //获取用户获取用户申请记录
                interface.companyDetail(function (companyresp) {
                    //授权角色:0无角色,1采购员,2管理员,3被公司禁用,4申请加入公司,5公司资质认证中
                    //已认证通过
                    if (resp.data.role == 2) {
                        var classStr = "apply-success";
                        // var classStr = "apply-company-stop";
                        if (companyresp.data.businessStatus == 2) {
                            classStr = "apply-company-stop";
                        }
                        $('.mod-certification.edit').addClass('hide');
                        $("#j_certification").removeClass('hide');
                        // $('.list_peopleArea').addClass('hide');
                        // $('.mod-certification-commit').addClass('hide');
                        // $('.mod-certification-commit-ok').addClass('hide');
                        personalFunc.show(companyresp.data, classStr);
                        personalFunc.fillSuccessImage(companyresp.data);
                    }
                    //认证中
                    else if (resp.data.role == 5) {
                        personalFunc.setData(companyresp.data); //调用缓存信息
                        personalFunc.edit(companyresp.data);
                        $('.mod-certification.edit').addClass('hide');
                        $('.list_peopleArea').addClass('hide');
                        $('.mod-certification-commit').addClass('hide');
                        $('.mod-certification-commit-ok').removeClass('hide');
                        $(".certify-edit").bind('click', function () {
                            personalFunc.setData(companyresp.data);
                            $('.mod-certification-commit-ok').addClass('hide');
                            $('.mod-certification.edit').removeClass('hide');
                        });
                        // $('.mod-certification.wait .theme2 p.btn-edit,.mod-certification.wait .item a.btn-edit').bind('click', function () {
                        //   $('.mod-certification.wait').addClass('hide');
                        //   $('.mod-certification.edit').removeClass('hide');
                        //   $('.mod-certification.edit .theme').addClass("theme2");
                        //   personalFunc.setData(companyresp.data); //调用缓存信息
                        //   personalFunc.edit(companyresp.data);
                        // });
                    }
                    //初始、被拒绝、被禁用
                    else {
                        //有申请记录
                        if (companyresp.data) {
                            $('.mod-certification.edit').removeClass('hide');
                            personalFunc.edit(companyresp.data);
                            var denyHtml = '<div class="deny-tip">您的上次申请没有通过，可以重新申请。</div>';
                            $('.mod-certification.edit').prepend(denyHtml);
                            personalFunc.setData(companyresp.data); //调用缓存信息
                        }
                        //无申请记录
                        else {
                            $('.mod-certification.edit').removeClass('hide');
                            personalFunc.edit(companyresp.data);
                            personalFunc.setData(); //调用缓存信息
                        }
                    }
                    personalFunc.operation();
                }, function (companyresp) {
                    alertReturn(companyresp.exception);
                });
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }

    /*认证成功--展示公司信息*/
    personalFunc.show = function (data, classStr) {
        $("#j_certification").html(template('t:j_certification', {list: data, classStr: classStr}));
        personalFunc.dealwithImg();
    }

    /*编辑公司信息--提交审核*/
    personalFunc.edit = function (companyList) {
        $('.connectTelephone').val(user.data.mobile);
        $('.connectName').val(!matchMobile(user.data.nickname) ? user.data.nickname : '');
        $('.connectIdcard').val(user.data.idcard ? user.data.idcard : '');
        $('.compantName').on('blur', function () {
            var name = trim($('.compantName').val());
            if (!name) {
                return false;
            }
            $('.judge').addClass('hide');
            $('.loading').removeClass('hide');
            interface.isCompanyExit(
                {
                    companyId: $('#_companyId').val(),
                    companyName: name
                }, function (resp) {
                    $('.loading').addClass('hide');
                    if (resp.data && (resp.data.status == 1 || resp.data.status == 2)) {
                        $('.join').removeClass('hide');
                        $(".company-error").removeClass('hide');
                        $('.judge').addClass('hide');
                        $('.submit-certify').removeClass('btn-primary');
                        btnStatus = 1;
                    } else {
                        $('.judge').removeClass('hide');
                        $('.join').addClass('hide');
                        $(".company-error").addClass('hide');
                        $('.submit-certify').addClass('btn-primary');
                        btnStatus = 0;
                    }
                }, function (resp) {
                    $('.loading').addClass('hide');
                    alertReturn(resp.exception);
                }
            )
        })
        // personalFunc.initUpload();
        // personalFunc.uploadFiles();
        personalFunc.optFunc();
        var empty = 0;

        var btnStatus = 0;//按钮状态0：按钮可以点击；1：按钮不可以点击
        //填写完整公司信息，点击下一步响应事件
        $(".submit-company-certify,.mod-certification .theme .tab2,.mod-certification .theme .tab3").bind("click", function () {
            empty = 0;
            // if (btnStatus == 1) {
            //     return false;
            // }
            var $this = $(this);
            if ($this.hasClass('tab2')) {
                if (!$('.list_peopleArea').hasClass('hide')) {
                    return false;
                }
            }
            if ($this.hasClass('tab3')) {
                if (!$('.mod-certification-commit').hasClass('hide')) {
                    return false;
                }
            }
            var countryType = $("#choose_country").val();
            var companyId = $('#_companyId').val();//公司id
            var companyType = trim($('.company-type').val());//公司分类
            var companyName = trim($('.compantName').val());//公司名称
            var businessLicenseNum = trim($('.businessLicenseNum').val());//营业执照注册号 （三证合一时必填）
            var businessLicenseNumImage = $('.png-box1 .file-item').attr('src');//营业执照注册证（三证合一时必填）
            var organizationCode = trim($('.organizationCode').val());//组织机构代码（三证不合一时必填）
            var organizationCodeImage = $('.png-box2 .file-item').attr('src');//组织机构代码证(三证不合一时必填) ,
            var dutyParagraphImage = $('.png-box3 .file-item').attr('src');//税务登记证（三证不合一时必填）
            var otherBusinessLicenseImage = $('.png-box4 .file-item').attr('src');//营业执照-其他证件
            var foreignBusinessLicenseImage = $('.png-box5 .file-item').attr('src');//海外注册证件
            var foreignOtherBusinessLicenseImage = $('.png-box6 .file-item').attr('src');//海外注册证件--其他证件
//            var stampImg = $('.png-box4 img').attr('src');//协议印章
            var dutyParagraph = trim($('.dutyParagraph').val());//税号（三证不合一时必填）
            var country = '';//公司地址:国家 ,
            var province = $('.province').val();//公司地址:省
            var city = $('.city').val();//公司地址:市 ,
            var addrDetail = trim($('.addrDetail').val());//公司地址详情 ,
            var companyLegalPerson = trim($('.companyLegalPerson').val());//公司法人 ,
            var companyPhone = trim($('.companyPhone').val());//公司电话
            var bankCard = trim($('.bankCard').val());
            var reg = new RegExp(" ", "g"); //创建正则RegExp对象
            bankCard = bankCard.replace(reg, '');
            var bankName = trim($('.bankName').val());//开户行
            var bankUser = trim($('.bankUser').val());
            var bankBranch = trim($('.bankBranch').val());
            // var bankCity = $('.bankCity').val();
            // var bankProvince = $('.bankProvince').val();
            //公司法人不能为空且只能为中文

            var foreignCountry = $(".foreign_country").val(); //海外国家
            var foreignRegistrNum = trim($(".foreignRegistrNum").val());//海外公司注册号
            var foreignDutyNum = trim($(".foreignDutyNum").val());//海外公司税号
            var foreignCompanyLegalPerson = trim($(".foreignCompanyLegalPerson").val());//海外公司法人
            var foreignBankUser = trim($(".foreignBankUser").val());//海外公司开户名称
            var foreignBankCard = trim($(".foreignBankCard").val());//海外公司银行账号
            var foreignBankAddr = trim($(".foreignBankAddr").val());//海外公司银行地址
            var foreignSwiftCode = trim($(".foreignSwiftCode").val());//海外公司swift码

            var foreignCompanyPhone = trim($('.foreignCompanyPhone').val());

            if (!companyType) {
                $('.company-type').siblings('.error').html('*公司分类不能为空');
                $('.company-type').addClass('red');
                empty = 1;
            }

            if (addrDetail == '') {
                $('.addrDetail').next('.error').html('*公司地址不能为空');
                $('.addrDetail').addClass('red');
                empty = 1;
            } else {
                if (!isBankAddr(addrDetail)) {
                    $('.addrDetail').next('.error').html('*格式错误');
                    $('.addrDetail').addClass('red');
                    empty = 1;
                }
            }
            if (countryType == '中国') {
                $('.list_companyArea .detail li>div>input.need').each(function () {
                    if (!trim($(this).val())) {
                        var errorHtml = $(this).parent('div').siblings('label').html();
                        errorHtml = errorHtml.substring(0, errorHtml.length - 1);
                        $(this).siblings('.error').html('*' + errorHtml + '不能为空');
                        $(this).addClass('red');
                        empty = 1;
                    }
                })
                //开户名称
                if (!isBankAddr(bankUser)) {
                    $('.bankUser').siblings('.error').html('*格式错误');
                    $('.bankUser').addClass('red');
                    empty = 1;
                }
                //开户行
                if (!isBankAddr(bankName)) {
                    $('.bankName').siblings('.error').html('*格式错误');
                    $('.bankName').addClass('red');
                    empty = 1;
                }
                if (bankName.length > 20) {
                    $('.bankName').siblings('.error').html('*开户行长度不能超过20个字');
                    $('.bankName').addClass('red');
                    empty = 1;
                }
                if (!isBankAddr(companyLegalPerson)) {
                    $('.companyLegalPerson').siblings('.error').html('*格式错误');
                    $('.companyLegalPerson').addClass('red');
                    empty = 1;
                }
                //卡号验证
                if (!bankCard) {
                    $('.bankCard').siblings('.error').html('*银行账号不能为空');
                    $('.bankCard').addClass('red');
                    empty = 1;
                } else if (!isNumAndLetter(bankCard)) {
                    $('.bankCard').siblings('.error').html('*格式错误');
                    $('.bankCard').addClass('red');
                    empty = 1;
                }
                //支行名称只能为中文
                if (!isBankAddr(bankBranch)) {
                    $('.bankBranch').siblings('.error').html('*格式错误');
                    $('.bankBranch').addClass('red');
                    empty = 1;
                }
                if (bankBranch.length > 100) {
                    $('.bankBranch').siblings('.error').html('*支行名称长度不能超过100个字');
                    $('.bankBranch').addClass('red');
                    empty = 1;
                }
                if (province == '请选择' || province == '' || city == '请选择' || city == '') {
                    $('.province').siblings('.error').eq(0).html('*省市不能为空');
                    // $('.province').addClass('red');
                    //$('.addrDetail').addClass('red');
                    empty = 1;
                }
                if (companyPhone == '') {
                    $('.companyPhone').parent(".intl-tel-input").next('.error').html('*公司电话不能为空');
                    $('.companyPhone').addClass('red');
                    empty = 1;
                } else {
                    if (!matchIntlMobile(companyPhone)) {
                        $('.companyPhone').parent(".intl-tel-input").next('.error').html('*格式错误');
                        $('.companyPhone').addClass('red');
                        empty = 1;
                    }
                }
                if (!$(".company-error").hasClass('hide')) {
                    empty = 1;
                }
                if (businessLicenseOnly == 1) {
                    if (!businessLicenseNum) {
                        $('.businessLicenseNum').siblings('.error').html('*社会信用代码不能为空');
                        $('.businessLicenseNum').addClass('red');
                        empty = 1;
                    } else if (!isSocialCreditNum(businessLicenseNum)) {
                        $('.businessLicenseNum').siblings('.error').html('*社会信用代码有误');
                        $('.businessLicenseNum').addClass('red');
                        empty = 1;
                    }
                    if (!businessLicenseNumImage) {
                        $('.fix-error1').html('请上传营业执照');
                        empty = 1;
                    }
//                if (!stampImg) {
//                    $('.fix-error4').html('请上传协议印章');
//                    empty = 1;
//                }
                } else {

                    if (!isBusinessLicenseNum(businessLicenseNum)) {
                        $('.businessLicenseNum').siblings('.error').html('*营业执照注册号有误');
                        $('.businessLicenseNum').addClass('red');
                        empty = 1;
                    }
                    if (!organizationCode) {
                        $('.organizationCode').siblings('.error').html('*组织机构代码不能为空');
                        $('.organizationCode').addClass('red');
                        empty = 1;
                    }
                    if (!dutyParagraph) {
                        $('.dutyParagraph').siblings('.error').html('*税号不能为空');
                        $('.dutyParagraph').addClass('red');
                        empty = 1;
                    }
                    if (!businessLicenseNumImage) {
                        $('.fix-error1').html('请上传营业执照');
                        empty = 1;
                    }
                    if (!organizationCodeImage) {
                        $('.fix-error2').html('请上传组织机构代码证');
                        empty = 1;
                    }
                    if (!dutyParagraphImage) {
                        $('.fix-error3').html('请上传税务登记证');
                        empty = 1;
                    }
                }

            } else {
                $('.list_companyArea .detail li>div>input.foreign-need').each(function () {
                    if (!trim($(this).val())) {
                        var errorHtml = $(this).parent('div').siblings('label').html();
                        errorHtml = errorHtml.substring(0, errorHtml.length - 1);
                        $(this).siblings('.error').html('*' + errorHtml + '不能为空');
                        $(this).addClass('red');
                        empty = 1;
                    }
                })
                if (foreignCountry == '请选择国家或地区') {
                    $('.foreign_country').siblings('.error').eq(0).html('*国家不能为空');
                    $('.foreign_country').addClass('red');
                    empty = 1;
                }
                if (foreignCompanyLegalPerson) {
                    if (!isBankAddr(foreignCompanyLegalPerson)) {
                        $('.foreignCompanyLegalPerson').siblings('.error').html('*格式错误');
                        $('.foreignCompanyLegalPerson').addClass('red');
                        empty = 1;
                    }
                }
                if (foreignCompanyPhone == '') {
                    $('.foreignCompanyPhone').parent(".intl-tel-input").next('.error').html('*公司电话不能为空');
                    $('.foreignCompanyPhone').addClass('red');
                    empty = 1;
                } else {
                    if (!matchIntlMobile(foreignCompanyPhone)) {
                        $('.foreignCompanyPhone').parent(".intl-tel-input").next('.error').html('*格式错误');
                        $('.foreignCompanyPhone').addClass('red');
                        empty = 1;
                    }
                }
                if (foreignBankCard) {
                    if (!isNumAndLetter(foreignBankCard)) {
                        $('.foreignBankCard').siblings('.error').eq(0).html('*格式错误');
                        $('.foreignBankCard').addClass('red');
                        empty = 1;
                    }
                }
                if (foreignBankAddr) {
                    if (!isBankAddr(foreignBankAddr)) {
                        $('.foreignBankAddr').siblings('.error').html('*格式错误');
                        $('.foreignBankAddr').addClass('red');
                        empty = 1;
                    }
                }
                if (!foreignBusinessLicenseImage) {
                    $('.fix-error5').html('请上传注册证件');
                    empty = 1;
                }

            }


            if (empty == 1) {
                isShowTab3 = 0;
                alertReturn('填写信息有误')
                return false;
            } else {
                isShowTab3 = 1;
                onbeforeunload();
                personalFunc.setData(); //调用缓存信息,渲染页面
                $('.mod-certification.wait').addClass("commit-ok");
                if ($('.mod-certification.edit').hasClass('commit-ok')) {
                    if ($this.hasClass('tab3')) {
                        $('.mod-certification.edit').addClass('hide');
                        $('.mod-certification.wait').addClass('hide');
                        $('.mod-certification-commit').removeClass('hide');
                    }
                } else {
                    $('.mod-certification.edit').addClass('hide');
                    $('.mod-certification-commit').addClass('hide');
                    $('.mod-certification.wait').removeClass('hide');
                }
            }
        });
        //跳转到第一步
        $(".mod-certification .theme .tab1").bind("click", function () {
            $('.list_peopleArea').addClass('hide');
            $('.mod-certification-commit').addClass('hide');
            $('.mod-certification.edit').removeClass('hide');
        });

        //填写完整个人信息，点击下一步响应事件
        $(".submit-people-certify,.mod-certification .theme .tab3").bind("click", function () {
            empty = 0;
            // if (btnStatus == 1) {
            //     return false;
            // }
            var $this = $(this);
            if ($this.hasClass('tab1')) {
                if (!$('.mod-certification.edit').hasClass('hide')) {
                    return false;
                }
            }
            if ($this.hasClass('tab3')) {
                if (!$('.mod-certification-commit').hasClass('hide')) {
                    return false;
                }
            }
            // 点击tab1[NO.1公司信息]时，不做验证, 可直接返回
            if (!$this.hasClass('tab1')) {
                var connectName = trim($('.connectName').val());//联系人信息:联系人姓名 ,
                var connectIdcard = trim($('.connectIdcard').val());//联系人信息:证件号 ,
                var connectTelephone = trim($('.connectTelephone').val());//联系人信息:手机号(默认注册手机号) ,
                var connectEmail = trim($('.connectEmail').val());//联系人信息:邮箱 ,
                if (connectIdcard) {
                    if (!matchIdCard(connectIdcard)) {
                        $('.connectIdcard').siblings('.error').html('*格式错误');
                        $('.connectIdcard').addClass('red');
                        empty = 1;
                    }
                }
                if (connectName) {
                    if (!isBankAddr(connectName)) {
                        $('.connectName').siblings('.error').html('*格式错误');
                        $('.connectName').addClass('red');
                        empty = 1;
                    }
                }
                if (connectTelephone == '') {
                    $('.connectTelephone').parent(".intl-tel-input").next('.error').html('*公司电话不能为空');
                    $('.connectTelephone').addClass('red');
                    empty = 1;
                } else {
                    if (!matchMobile(connectTelephone)) {
                        $('.connectTelephone').parent(".intl-tel-input").next('.error').html('*格式错误');
                        $('.connectTelephone').addClass('red');
                        empty = 1;
                    }
                }
                if (connectEmail) {
                    if (!isMail(connectEmail)) {
                        $('.connectEmail').siblings('.error').html('*格式错误');
                        $('.connectEmail').addClass('red');
                        empty = 1;
                    }
                }
                $('.list_peopleArea .detail li>div>input.need').each(function () {
                    if (!trim($(this).val())) {
                        var errorHtml = $(this).parent('div').siblings('label').html();
                        errorHtml = errorHtml.substring(0, errorHtml.length - 1);
                        $(this).siblings('.error').html('*' + errorHtml + '不能为空');
                        $(this).addClass('red');
                        empty = 1;
                    }
                });
                if (empty == 1) {
                    alertReturn('填写信息有误')
                    return false;
                }
            }

            onbeforeunload();
            personalFunc.setData(); //调用缓存信息,渲染页面
            $('.list_peopleArea').addClass("commit-ok");
            if ($this.hasClass('tab1')) {
                $('.list_peopleArea').addClass('hide');
                $('.mod-certification-commit').addClass('hide');
                $('.mod-certification.edit').removeClass('hide');
            } else {
                if (isShowTab3 == 1) {
                    $('.list_peopleArea').addClass('hide');
                    $('.mod-certification.edit').addClass('hide');
                    $('.mod-certification-commit').removeClass('hide');
                }

            }
        });
        $('.submit-certify').on('click', function () {
            var companyList = {};
            var $this = $(this);
            if (_GET_DATA('companyList')['company_' + userId]) {
                companyList = _GET_DATA('companyList')['company_' + userId];

            }
            var para = {};
            if (companyList) {
                if (companyList.id) para.id = companyList.id;
                para.companyName = companyList.companyName;
                para.companyType = companyList.companyType;
                para.addrDetail = companyList.addrDetail;
                para.connectEmail = companyList.connectEmail;
                para.connectIdcard = companyList.connectIdcard;
                para.connectName = companyList.connectName;
                para.connectTelephone = companyList.connectTelephone;
                para.connectTelephoneAreaCode = companyList.connectTelephoneAreaCode;
                para.connectTelephoneAddr = {
                    title: companyList.connectTelephoneTitle,
                    class: companyList.connectTelephoneClass
                }

                if (companyList.countryType == "中国") {
                    para.bankCard = trimAll(companyList.bankCard);
                    para.bankName = companyList.bankName;
                    para.bankUser = companyList.bankUser;
                    para.bankBranch = companyList.bankBranch;
                    para.businessLicenseNum = companyList.businessLicenseNum;
                    para.businessLicenseNumImage = companyList.businessLicenseNumImage;
                    para.businessLicenseOnly = companyList.businessLicenseOnly;
                    para.companyLegalPerson = companyList.companyLegalPerson;

                    para.companyPhone = companyList.companyPhone;
                    para.companyPhoneAreaCode = companyList.companyPhoneAreaCode;


                    para.country = '中国';
                    para.dutyParagraph = companyList.dutyParagraph;
                    para.dutyParagraphImage = companyList.dutyParagraphImage;
                    para.organizationCode = companyList.organizationCode;
                    para.organizationCodeImage = companyList.organizationCodeImage;
                    para.province = companyList.province;
                    para.city = companyList.city;


                    para.companyPhoneAddr = {
                        title: companyList.companyPhoneTitle,
                        class: companyList.companyPhoneClass
                    }
                    if (companyList.otherBusinessLicenseImage) para.otherDocuments = companyList.otherBusinessLicenseImage;

                } else {
                    para.country = companyList.foreignCountry;
                    para.bankCard = trimAll(companyList.foreignBankCard);
                    para.bankUser = companyList.foreignBankUser;
                    para.dutyParagraph = companyList.foreignDutyNum;
                    para.companyLegalPerson = companyList.foreignCompanyLegalPerson;
                    para.companyPhone = companyList.foreignCompanyPhone;
                    para.companyPhoneAreaCode = companyList.foreignCompanyPhoneAreaCode;
                    para.registNum = companyList.foreignRegistrNum;
                    para.registNumDoc = companyList.foreignBusinessLicenseImage;
                    para.bankAddr = companyList.foreignBankAddr;
                    para.swift = companyList.foreignSwiftCode;
                    if (companyList.foreignOtherBusinessLicenseImage) para.otherDocuments = companyList.foreignOtherBusinessLicenseImage;
                    para.companyPhoneAddr = {
                        title: companyList.foreignCompanyPhoneTitle,
                        class: companyList.foreignCompanyPhoneClass
                    }
                }
            } else {
                alertReturn('填写信息有误')
                return false;
            }

            if (btnStatus == 1) {
                return false;
            }

            btnStatus = 1;
            //$this.html('提交中...');
            //$this.addClass('btn-inverse').removeClass('btn-primary');
            interface.certify(para, function (resp) {
                if (resp.code == 0) {
                    //window.location.href = '/';
//                    var user = getUser();
//                    user.data.nickname = connectName;
//                    user.data.mobile = connectTelephone;
//                    user.data.connectPhone = connectTelephone;
//                    user.data.idcard = connectIdcard;
//                    user.data.role = 5;//资质认证中
                    localStorage.removeItem("companyList")//提交成功后清除缓存
                    setUser();
                    $('.mod-certification.edit').addClass('hide');
                    $('.mod-certification.wait').removeClass('hide');
                    personalFunc.judge();
                    window.location.reload();
                } else {
                    btnStatus = 0;
                    $this.html('提交认证资料');
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                btnStatus = 0;
                $this.html('提交认证资料');
                $this.addClass('btn-primary').removeClass('btn-inverse');
                alertReturn(resp.exception);
            })
        })
    }
    personalFunc.getTokens = function () {
        var user = getUser();
        var tokens = "";
        if (user && user.login) {
            tokens = user.data.accessToken;
        }
        return tokens;
    }
    personalFunc.defineUploaderObj = function (el, getTokens) {
        var uploaderObj = {
            auto: true,
            swf: '../../plugin/webuploader/Uploader.swf',
            server: seajs.host + '/file/uploadFiles',
            pick: el,
            fileSingleSizeLimit: 1024 * 1024 * 10,
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png,pdf',
                mimeTypes: 'image/*,application/pdf'
            },
            formData: {
                'DelFilePath': '', //定义参数
                url: ''
            },
            fileVal: 'files', //上传域的名称
            headers: {
                "X-Access-Auth-Token": getTokens
            },
            compress: false,
            method: 'POST',
            duplicate: true,
            thumb: {
                width: 200,
                height: 200,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,
                // 是否允许裁剪。
                crop: false,
            }
        }
        return uploaderObj;
    }
    personalFunc.uploadFiles = function (el, inputEl) {
        /*init webuploader*/
        var $list = $(el);
        // var $list=$("#businessLicenseImage .img-wrap");   //这几个初始化全局的百度文档上没说明，好蛋疼。ß
        var getTokens = personalFunc.getTokens();
        var percentages = {};
        var inputUploader = personalFunc.defineUploaderObj(inputEl);
        var uploader = WebUploader.create(inputUploader, getTokens);
        uploader.on("error", function (type) {
            if (type == "Q_EXCEED_SIZE_LIMIT") {
                alertReturn("上传文件内容超过10M，请您重新上传");
            } else {
                alertReturn("上传文件内容超过10M，请您重新上传");
            }
        });
        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {  // webuploader事件.当选择文件后，文件被加载到文件队列中，触发该事件。等效于 uploader.onFileueued = function(file){...} ，类似js的事件定义。
            var $li = $(
                '<div id="' + file.id + '" data-name="' + file.name + '" class="file-item thumbnail">' +
                '<img>' +
                '</div>'
                ),
                $img = $li.find('img');
            // $list为容器jQuery实例
            $list.html($li);
            var currentEl = el.replace(" .img-wrap", "")
            $(currentEl + ' button.upload').html('重新上传');
            $(".show-loading-content").show();
            showLoading('.loadingA');
            $(currentEl).siblings('.error').html('');
            percentages[file.id] = [file.size, 0];
            // 如果为非图片文件，可以不用调用此方法。
            // thumbnailWidth x thumbnailHeight 为 100 x 100
            uploader.makeThumb(file, function (error, src) {   //webuploader方法
                if (error) {
                    $img.replaceWith('<div><div class="pdf-text">PDF</div><div class="info">' + file.name + '</div></div>');
                    return;
                }
                $img.replaceWith('<img src="' + src + '">');
            });
        });
        //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
        uploader.on('uploadBeforeSend', function (obj, data) {
            data.formData = {"name": 'files'};
        });
        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on('uploadSuccess', function (file, data) {
            if (data.code == 0) {
                var dataSrc = data.data[0];
                $('#' + file.id).attr("src", dataSrc);
                $('#' + file.id + " img").attr("src", dataSrc);
                hideLoading(".loadingA");
                $(".show-loading-content").hide();

            }
        });
        // 文件上传失败，显示上传出错。
        uploader.on('uploadError', function (file) {
            var $li = $('#' + file.id),
                $error = $li.find('div.error');
            // 避免重复创建
            if (!$error.length) {
                $error = $('<div class="error"></div>').appendTo($li);
            }

            hideLoading(".loadingA");
            $(".show-loading-content").hide();
            $error.text('上传失败');
        });
    }


    personalFunc.optFunc = function () {
        $(".bankCard, .foreignBankCard").on("keyup", formatBankCard);//银行卡号格式化
        //单选框
        $('.ui-radio-options li').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('checked')) {
                $this.addClass('checked').siblings().removeClass('checked');
                if ($('.ui-radio-options li:eq(0)').hasClass('checked')) {
                    businessLicenseOnly = 1;
                } else {
                    businessLicenseOnly = 0;
                }
                if (businessLicenseOnly == 0) {
                    $('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入15位营业执照注册号(字母或数字)')
                    $('.card-hide').show();
                    $(".other-buss-card").addClass('hide');

                } else {
                    $('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入18位统一社会信用代码(字母或数字)')
                    $('.card-hide').hide();
                    $(".other-buss-card").removeClass('hide');
                }
            }
        })
        $('.detail li>div input.companyPhone,.detail li>div input.foreignCompanyPhone,.detail li>div input.connectTelephone').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var phoneVal = trim($this.val());
                if (!matchIntlMobile(phoneVal)) {
                    $this.parent(".intl-tel-input").next('.error').html('*格式错误');
                    $this.addClass('red');
                }
            }
        })

        $('.detail li>div input.businessLicenseNum').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var str = trim($this.val());
                if (businessLicenseOnly == 1) {
                    if (!isSocialCreditNum(str)) {
                        $this.siblings('.error').html('*格式错误');
                        $this.addClass('red');
                    }
                } else {
                    if (!isBusinessLicenseNum(str)) {
                        $this.siblings('.error').html('*格式错误');
                        $this.addClass('red');
                    }
                }


            }
        })

        $('.detail li>div input.isBankAddr').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var str = trim($this.val());
                if (!isBankAddr(str)) {
                    $this.siblings('.error').html('*格式错误');
                    $this.addClass('red');
                }
            }
        })
        $('.detail li>div input.addrDetail').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var str = trim($this.val());
                if (!isBankAddr(str)) {
                    $this.next('.error').html('*格式错误');
                    $this.addClass('red');
                }
            }
        })
        $('.detail li>div input.connectIdcard,.detail li>div input.foreignBankCard,.detail li>div input.bankCard').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var str = trim($this.val());
                if (!isNumAndLetter(str)) {
                    $this.siblings('.error').html('*格式错误');
                    $this.addClass('red');
                }
            }
        })
        $('.detail li>div input.connectEmail').on('blur', function () {
            var $this = $(this);
            if ($this.val()) {
                var str = trim($this.val());
                if (!isMail(str)) {
                    $this.siblings('.error').html('*格式错误');
                    $this.addClass('red');
                }
            }
        })


        $('.detail li>div input').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })
        $('.detail li>div input.maxLen-50').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                var val = trim($this.val());
                var valRealLen = val.length;
                var valLen = strLen(val);
                if (valLen > 100) {
                    $this.val(cutstr(val, 100));
                }
            }
        })
        $('.detail li>div input.maxLen-100').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                var val = trim($this.val());
                var valRealLen = val.length;
                var valLen = strLen(val);
                if (valLen > 200) {
                    $this.val(cutstr(val, 200));
                }
            }
        })
        $('.detail li>div input.companyPhone,.detail li>div input.foreignCompanyPhone,.detail li>div input.connectTelephone').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.parent(".intl-tel-input").siblings('.error').html('');
            }
        })
        $('.detail li>div  select').focus(function () {
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })
        $('.detail li>div  .bankName').focus(function () {
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })
    }

    /*处理图片--获取图片的宽高来添加样式*/
    personalFunc.dealwithImg = function () {
        $('.img-wrap img').each(function () {
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
    personalFunc.template = function () {
        template.helper('dateFormat', function (date) {
            return dateFormat(date);
        });
    }
    personalFunc.init();

});
