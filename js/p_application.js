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
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require('underscore-min');
    require('intlTel');
    var utils =  require("utils");

    var user = getUser();//获取登录状态
    var uIdCard = new UploadPic();
    var companyId;//公司id
    var applyFunc = {};

    applyFunc.init = function () {
        this.judge();//判断状态
        this.template();

    }
    //添加电话区号
    applyFunc.intlTel = function () {
        $(".connectPhone").intlTelInput({
            utilsScript: utils
        });
    }
    window.onbeforeunload = function () {
        if (!$(".login-out").hasClass("login-false")) {
            var companyName = trim($('.compantName').val());//公司名称
            var idcardImage = $('.png-box1 img').attr('src');//
            var nickname = trim($('.nickname').val());//联系人信息:联系人姓名 ,
            var connectIdcard = trim($('.connectIdcard').val());//联系人信息:证件号 ,
            var connectPhone = trim($('.connectPhone').val());//联系人信息:手机号(默认注册手机号) ,
            var connectEmail = trim($('.connectEmail').val());//联系人信息:邮箱
            var department = trim($('.department').val());
            var position = trim($('.position').val());
            var connectPhoneTitle = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var connectPhoneClass = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var connectPhoneAreaCode = getAreaCode(connectPhoneTitle);
            var applicationList = {};
            if(connectPhoneAreaCode != ""){
                applicationList.connectPhoneAreaCode = connectPhoneAreaCode;
            }
            if(connectPhoneClass){
                applicationList.connectPhoneClass = connectPhoneClass;
            }
            if(connectPhoneTitle){
                applicationList.connectPhoneTitle = connectPhoneTitle;
            }

            if (companyName != "") {
                applicationList.companyName = companyName;
            }
            if (idcardImage != "") {
                applicationList.idcardImage = idcardImage;
            }
            if (nickname != "") {
                applicationList.nickname = nickname;
            }
            if (connectIdcard != "") {
                applicationList.connectIdcard = connectIdcard;
            }
            if (connectPhone != "") {
                applicationList.connectPhone = connectPhone;
            }
            if (connectEmail != "") {
                applicationList.connectEmail = connectEmail;
            }
            if (department != "") {
                applicationList.department = department;
            }
            if (position != "") {
                applicationList.position = position;
            }
            applicationList.companyId = companyId;
            _SET_DATA('applicationList', JSON.stringify(applicationList));
            return;
        }
    }


    applyFunc.setData = function () {
        var applicationList;
        if (judge(JSON.parse(_GET_DATA('applicationList')))) {
            applicationList = JSON.parse(_GET_DATA('applicationList'));
        }
        if(applicationList != undefined){
            $('.compantName').val(applicationList.companyName);//公司名称
            $('.png-box1 img').attr('src', applicationList.idcardImage);//
            $('.nickname').val(applicationList.nickname);//联系人信息:联系人姓名 ,
            $('.connectIdcard').val(applicationList.connectIdcard);//联系人信息:证件号 ,
            $('.connectPhone').val(applicationList.connectPhone);//联系人信息:手机号(默认注册手机号) ,
            $('.connectEmail').val(applicationList.connectEmail);//联系人信息:邮箱
            $('.department').val(applicationList.department);
            $('.position').val(applicationList.position);
            if(applicationList.connectPhoneTitle){
                $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title",applicationList.connectPhoneTitle);
                $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",applicationList.connectPhoneClass);
            }

            companyId = applicationList.companyId
            applyFunc.dealwithImg();
        }
    }

    applyFunc.judge = function () {
        //companyId！=0，表示申请加入通过；companyId =0，parentId！=0，表示审核中；companyId =0，parentId=0，表示被拒绝
        //授权角色:1采购员,2管理员,3被禁用的,4申请加入公司 ,
        interface.currentUserInfo(function (resp) {
            // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
            var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
            $("#j_modMenu").html(leftMenu.leftShow(resp.data,'员工认证'));
            if (resp.data.companyId != 0) {
                console.log(resp.data.role)
                if (resp.data.role == 1 || resp.data.role == 2) {
                    // var classStr = "user_stop";
                    var classStr = "apply-success";
                    $('.mod-certification.show').removeClass('hide');//展示信息
                    applyFunc.show(resp.data,classStr);
                } else if (resp.data.role == 4) {
                    $('.mod-certification.edit').addClass('hide');
                    $('.mod-certification.wait').removeClass('hide');//展示等待状态
                    $('.mod-certification.wait .theme2 p.btn-edit,.mod-certification.wait .item a.btn-edit').bind('click', function () {
                        $('.mod-certification.wait').addClass('hide');
                        $('.mod-certification.edit').removeClass('hide');
                        applyFunc.edit(resp.data);
                        applyFunc.setData();
                        $('.mod-certification.edit .theme').removeClass("theme1").addClass("theme2");
                    });
                } else if (resp.data.role == 3) {
                    // $('.mod-certification.edit').removeClass('hide');//展示编辑页面
                    // applyFunc.edit(resp.data);
                    // applyFunc.setData();
                    var classStr = "user_stop";
                    $('.mod-certification.show').removeClass('hide');//展示信息
                    applyFunc.show(resp.data,classStr);
                }
            } else {
                $('.mod-certification.edit').removeClass('hide');//展示编辑页面
                applyFunc.edit(resp.data);
                applyFunc.setData();

            }
            // applyFunc.intlTel();
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /*认证成功--展示公司信息*/
    applyFunc.show = function (data,classStr) {
        $("#j_show").html(template('t:j_show', {list: data,classStr:classStr}));
        applyFunc.dealwithImg();
    }

    /*编辑公司信息--提交审核*/
    applyFunc.edit = function (data) {
        $("#j_edit").html(template('t:j_edit', {list: data}));
        applyFunc.intlTel();
        if(data.connectPhoneAddr){
            var connectPhoneAddr = data.connectPhoneAddr;
            $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title",connectPhoneAddr.title);
            $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",connectPhoneAddr.class);
        }
        if (trim($('.compantName').val())) {
            $('.judge-no').addClass('hide');
            $('.join-yes').addClass('hide');
            $('.loading').removeClass('hide');
            interface.isCompanyExit(
                {
                	companyName: trim($('.compantName').val())
                }, function (resp) {
                    $('.loading').addClass('hide');
                    if (resp.data && resp.data.status == 2) {
                        $('.join-yes').removeClass('hide');
                        $('.judge-no').addClass('hide');
                        $('.submit-certify').addClass('btn-primary');
                        btnStatus = 0;
                        companyId = resp.data.companyId;
                    } else {
                        $('.judge-no').removeClass('hide');
                        $('.join-yes').addClass('hide');
                        $('.submit-certify').removeClass('btn-primary');
                        btnStatus = 1;
                    }
                }, function (resp) {
                    $('.loading').addClass('hide');
                    alertReturn(resp.exception);
                }
            )
        }
        $('.compantName').on('blur', function () {
            var name = trim($('.compantName').val());
            if (!name) {
                return false;
            }
            $('.judge-no').addClass('hide');
            $('.join-yes').addClass('hide');
            $('.loading').removeClass('hide');
            interface.isCompanyExit(
                {
                	companyName: name
                }, function (resp) {
                    $('.loading').addClass('hide');
                    if (resp.data && resp.data.status == 2) {
                        $('.join-yes').removeClass('hide');
                        $('.judge-no').addClass('hide');
                        $('.submit-certify').addClass('btn-primary');
                        btnStatus = 0;
                        companyId = resp.data.companyId;
                    } else {
                        $('.judge-no').removeClass('hide');
                        $('.join-yes').addClass('hide');
                        $('.submit-certify').removeClass('btn-primary');
                        btnStatus = 1;
                    }
                }, function (resp) {
                    $('.loading').addClass('hide');
                    alertReturn(resp.exception);
                }
            )
        })
        applyFunc.initUpload();
        applyFunc.optFunc();
        var empty = 0;
        var btnStatus = 0;//按钮状态0：按钮可以点击；1：按钮不可以点击
        // $('.mod-certification.edit .theme1 p.btn-wait').bind('click', function () {
        //     $('.mod-certification.edit').addClass('hide');
        //     $('.mod-certification.wait').removeClass('hide');
        // });
        $('.submit-certify').on('click', function () {
            empty = 0;
            if (btnStatus == 1) {
                return false;
            }
            var $this = $(this);
            var companyName = trim($('.compantName').val());//公司名称
            var idcardImage = $('.png-box1 img').attr('src');//
            var nickname = trim($('.nickname').val());//联系人信息:联系人姓名 ,
            var connectIdcard = trim($('.connectIdcard').val());//联系人信息:证件号 ,
            var connectPhone = trim($('.connectPhone').val());//联系人信息:手机号(默认注册手机号) ,
            var connectEmail = trim($('.connectEmail').val());//联系人信息:邮箱
            var department = trim($('.department').val());
            var position = trim($('.position').val());
            var connectPhoneTitle = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var connectPhoneClass = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var connectPhoneAreaCode = getAreaCode(connectPhoneTitle);
            $('.detail li>div>input.need').each(function () {
                if (!trim($(this).val())) {
                    var errorHtml = $(this).parent('div').siblings('label').html();
                    errorHtml = errorHtml.substring(0, errorHtml.length - 1);
                    $(this).siblings('.error').html('*' + errorHtml + '不能为空');
                    $(this).addClass('red');
                    empty = 1;
                }
            })

            if (connectIdcard) {
                if (!matchIdCard(connectIdcard)) {
                    $('.connectIdcard').siblings('.error').html('*身份证号格式不正确');
                    $('.connectIdcard').addClass('red');
                    empty = 1;
                }
            }
            if (connectPhone) {
                if (!matchMobile(connectPhone)) {
                    $('.connectPhone').parent(".intl-tel-input").next('.error').html('*手机号格式不正确');
                    $('.connectPhone').addClass('red');
                    // $('.connectPhone').siblings('.error').html('*手机号格式不正确');
                    // $('.connectPhone').addClass('red');
                    empty = 1;
                }
            }else{
                $('.connectPhone').parent(".intl-tel-input").next('.error').html('*手机号不能为空');
                $('.connectPhone').addClass('red');
                empty = 1;
            }
            if (connectEmail) {
                if (!isMail(connectEmail)) {
                    $('.connectEmail').siblings('.error').html('*邮箱格式不正确');
                    $('.connectEmail').addClass('red');
                    empty = 1;
                }
            }
            if (!idcardImage) {
                $('.fix-error1').html('请上传身份证图片');
                empty = 1;
            }
            if (empty == 1) {
                alertReturn('填写信息有误')
                return false;
            }

            btnStatus = 1;
            $this.html('提交中...');
            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.applyAdd({
                companyName: companyName,
                email: connectEmail,
                idcard: connectIdcard,
                nickname: nickname,
                connectPhone: connectPhone,
                idcardImage: idcardImage,
                companyId: companyId,
                position: position,
                department: department,
                connectPhoneAreaCode:connectPhoneAreaCode,
                connectPhoneAddr:{
                    title:connectPhoneTitle,
                    class:connectPhoneClass
                }
            }, function (resp) {
                if (resp.code == 0) {
//                    var user = getUser();
//                    user.data.nickname = nickname;
//                    user.data.mobile = connectPhone;
//                    user.data.connectPhone = connectPhone;
//                    user.data.idcard = connectIdcard;
//                    user.data.role = 4;//申请公司认证中
                    setUser();
                    applyFunc.judge();
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


    applyFunc.initUpload = function () {
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
                    applyFunc.dealwithImg();
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

    applyFunc.optFunc = function () {
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
                    $('.card-hide').show();
                } else {
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
        $('.detail li>div input.connectPhone').on('keyup', function () {
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
    }

    /*处理图片--获取图片的宽高来添加样式*/
    applyFunc.dealwithImg = function () {
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
    applyFunc.template = function() {
      template.helper('dateFormat', function (date) {
          return dateFormat(date);
      });
    }
    applyFunc.init();
});
