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
    var header = require("header");
    var zic = require("zic");
    var area = require("area");
    var cityselect = require('cityselect');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var uIdCard = new UploadPic();
    var uIdCards = new UploadPic();
    var uIdCardss = new UploadPic();
    var businessLicenseOnly = 1;// 是否三证合一,1是0否;

    var certificationFunc = {};

    certificationFunc.init = function () {
        this.judge();//判断状态
    }

    certificationFunc.judge = function () {
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                if (resp.data.companyId != 0) {
                    interface.companyDetail(function (resp) {//status 状态:1待审核,2审核通过,3审核不通过
                        $('.mod-certification.show').removeClass('hide');
                        if (resp.code == 0) {
                            certificationFunc.show(resp.data);
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                } else {
                    interface.companyDetail(function (resp) {//status 状态:1待审核,2审核通过,3审核不通过
                        if (resp.code == 0) {
                            if (resp.data.status == 1) {
                                $('.mod-certification.wait').removeClass('hide');
                                certificationFunc.wait();
                            } else if (resp.data.status == 2) {
                                $('.mod-certification.show').removeClass('hide');
                                certificationFunc.show(resp.data);
                            } else if (resp.data.status == 3) {
                                $('.mod-certification.deny').removeClass('hide');
                                certificationFunc.deny();
                            } else {
                                $('.mod-certification.edit').removeClass('hide');
                                certificationFunc.edit();
                            }

                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    certificationFunc.show = function (data) {
        $("#j_certification").html(template('t:j_certification', {list: data}));
    }

    certificationFunc.deny = function () {

    }

    certificationFunc.wait = function () {

    }

    certificationFunc.edit = function () {
        $('.compantName').on('blur', function () {
            var name = trim($('.compantName').val());
            if (!name) {
                return false;
            }
            $('.loading').removeClass('hide');
            interface.isCompanyExit(
                {
                    name: name
                }, function (resp) {
                    $('.loading').addClass('hide');
                    if (resp.data.status == 2) {
                        $('.join').removeClass('hide');
                    } else {
                        $('.judge').removeClass('hide');
                    }
                }, function (resp) {
                    $('.loading').addClass('hide');
                    alertReturn(resp.exception);
                }
            )
        })
        certificationFunc.initUpload();
        certificationFunc.optFunc();
        var empty = 0;
        _init_area();//初始化地区
        var btnStatus = 0;//按钮状态0：按钮可以点击；1：按钮不可以点击
        $('.submit-certify').on('click', function () {
            empty = 0;
            if (btnStatus == 1) {
                return false;
            }
            var $this = $(this);
            var companyType = trim($('.company-type').val());//公司分类
            var companyName = trim($('.compantName').val());//公司名称
            var businessLicenseNum = trim($('.businessLicenseNum').val());//营业执照注册号 （三证合一时必填）
            var businessLicenseNumImage = $('.png-box1 img').attr('src');//营业执照注册证（三证合一时必填）
            var organizationCode = trim($('.organizationCode').val());//组织机构代码（三证不合一时必填）
            var organizationCodeImage = $('.png-box2 img').attr('src');//组织机构代码证(三证不合一时必填) ,
            var dutyParagraphImage = $('.png-box3 img').attr('src');//税务登记证（三证不合一时必填）
            var stampImg = $('.png-box4 img').attr('src');//协议印章
            var dutyParagraph = trim($('.dutyParagraph').val());//税号（三证不合一时必填）
            var country = $('.country').val();//公司地址:国家 ,
            var province = $('.province').val();//公司地址:省
            var city = $('.city').val();//公司地址:市 ,
            var addrDetail = trim($('.addrDetail').val());//公司地址详情 ,
            var companyLegalPerson = trim($('.companyLegalPerson').val());//公司法人 ,
            var companyPhone = trim($('.companyPhone').val());//公司电话
            var bankCard = trim($('.bankCard').val());//银行账号
            var bankName = trim($('.bankName').val());//开户行
            var connectName = trim($('.connectName').val());//联系人信息:联系人姓名 ,
            var connectIdcard = trim($('.connectIdcard').val());//联系人信息:证件号 ,
            var connectTelephone = trim($('.connectTelephone').val());//联系人信息:手机号(默认注册手机号) ,
            var connectEmail = trim($('.connectEmail').val());//联系人信息:邮箱 ,
            //卡号验证
            if (!isBankCard(bankCard)) {
               $('.bankCard').siblings('.error').html('*银行卡号必须是8~28位数字');
               $('.bankCard').addClass('red');
               empty = 1;
           }
            if (!companyType) {
                $('.company-type').siblings('.error').html('*公司分类不能为空');
                $('.company-type').addClass('red');
                empty = 1;
            }
            $('.detail li>div>input.need').each(function () {
                if (!trim($(this).val())) {
                    var errorHtml = $(this).parent('div').siblings('label').html();
                    errorHtml = errorHtml.substring(0, errorHtml.length - 1);
                    $(this).siblings('.error').html('*' + errorHtml + '不能为空');
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            if(!isChinese(bankName)){
            	$('.bankName').siblings('.error').html('*开户行只能为中文');
            	$('.bankName').addClass('red');
            	empty = 1;
            }
            if ($('#s_province').val() == '省份' || $('#s_city').val() == '省份' || addrDetail == '') {
                $('.addrDetail').siblings('.error').html('*公司地址不能为空');
                $('.addrDetail').addClass('red');
                empty = 1;
            }
            if (connectIdcard) {
                if (!matchIdCard(connectIdcard)) {
                    $('.connectIdcard').siblings('.error').html('*身份证号格式不正确');
                    $('.connectIdcard').addClass('red');
                    empty = 1;
                }
            }
            if (connectTelephone) {
                if (!matchMobile(connectTelephone)) {
                    $('.connectTelephone').siblings('.error').html('*手机号格式不正确');
                    $('.connectTelephone').addClass('red');
                    empty = 1;
                }
            }
            if (businessLicenseOnly == 1) {
                if (!businessLicenseNum) {
                    $('.businessLicenseNum').siblings('.error').html('*营业执照注册号不能为空');
                    $('.businessLicenseNum').addClass('red');
                    empty = 1;
                }
                if (!businessLicenseNumImage) {
                    $('.fix-error1').html('请上传营业执照');
                    empty = 1;
                }
                if (!stampImg) {
                    $('.fix-error4').html('请上传协议印章');
                    empty = 1;
                }
            } else {
                if (!businessLicenseNum) {
                    $('.businessLicenseNum').siblings('.error').html('*营业执照注册号不能为空');
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
                if (!stampImg) {
                    $('.fix-error4').html('请上传协议印章');
                    empty = 1;
                }
            }
            if (empty == 1) {
                alertReturn('填写信息有误')
                return false;
            }

            btnStatus = 1;
            $this.html('提交中...');
            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.certify({
                addrDetail: addrDetail,
                bankCard: bankCard,
                bankName: bankName,
                businessLicenseNum: businessLicenseNum,
                businessLicenseNumImage: businessLicenseNumImage,
                businessLicenseOnly: businessLicenseOnly,
                city: city,
                companyLegalPerson: companyLegalPerson,
                companyName: companyName,
                companyPhone: companyPhone,
                companyType: companyType,
                connectEmail: connectEmail,
                connectIdcard: connectIdcard,
                connectName: connectName,
                connectTelephone: connectTelephone,
                country: '中国',
                dutyParagraph: dutyParagraph,
                dutyParagraphImage: dutyParagraphImage,
                organizationCode: organizationCode,
                organizationCodeImage: organizationCodeImage,
                province: province,
                stampImg: stampImg
            }, function (resp) {
                if (resp.code == 0) {
//	                	var user = getUser();
//	                  user.data.nickname = connectName;
//	                  user.data.mobile = connectTelephone;
//	                  user.data.connectPhone = connectTelephone;
//	                  user.data.idcard = connectIdcard;
//	                  user.data.role = 5;//资质认证中
	                  setUser();
                    window.location.href = '/';
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


    certificationFunc.initUpload = function () {
        uIdCard.init({
            input: document.querySelector('#img_input'),
            callback: function (base64) {
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify({
                        image: base64
                    }),
                    beforeSend: function (xhr) {
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    $('.alert_dialog').remove();
                    var html = '<img src="' + resp.data + '"/>';
                    $('.png-box1 .img-wrap').html(html);
                    $('.upload1').html('重新添加');
                    $('.fix-error1').html('');
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertDialog('图片上传中...');
            }
        });

        uIdCards.init({
            input: document.querySelector('#img_inputs'),
            callback: function (base64) {
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify({
                        image: base64
                    }),
                    beforeSend: function (xhr) {
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    $('.alert_dialog').remove();
                    var html = '<img src="' + resp.data + '"/>';
                    $('.png-box2 .img-wrap').html(html);
                    $('.fix-error2').html('');
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertDialog('图片上传中...');
            }
        });

        uIdCardss.init({
            input: document.querySelector('#img_inputss'),
            callback: function (base64) {
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify({
                        image: base64
                    }),
                    beforeSend: function (xhr) {
                        var type;
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    $('.alert_dialog').remove();
                    var html = '<img src="' + resp.data + '"/>';
                    $('.png-box3 .img-wrap').html(html);
                    $('.upload3').html('重新添加');
                    $('.fix-error3').html('');
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertDialog('图片上传中...');
            }
        });

        uIdCardss.init({
            input: document.querySelector('#img_inputsss'),
            callback: function (base64) {
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify({
                        image: base64
                    }),
                    beforeSend: function (xhr) {
                        var type;
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    $('.alert_dialog').remove();
                    var html = '<img src="' + resp.data + '"/>';
                    $('.png-box4 .img-wrap').html(html);
                    $('.upload4').html('重新添加');
                    $('.fix-error4').html('');
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertDialog('图片上传中...');
            }
        });
    }

    certificationFunc.optFunc = function () {
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
                		$('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入15位营业执照注册号(字母)')
                    $('.card-hide').show();
                } else {
                		$('.ui-radio-options').siblings('.color-9d:eq(1)').html('请输入18位统一社会信用代码(字母或数字')
                    $('.card-hide').hide();
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

        $('.detail li>div  select').focus(function () {
            var $this = $(this);
            $this.removeClass('red');
            $this.siblings('.error').html('');
        })
    }

    certificationFunc.init();
});
