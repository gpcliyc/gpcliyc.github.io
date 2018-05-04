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
    require("pagination");
    var area = require("area");
    var zic = require("zic");
    var uIdCard = new UploadPic();
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require('underscore-min');
    require('intlTel');
    var utils =  require("utils");
    var btnStatus = 0;//按钮状态0：可点击；1：不可点击；
    var cityselect = require('cityselect');
    var register = request('register');
    var user = getUser();//获取登录状态
    var sex = 1;//性别：1：男；2：女
    var languagePackage = null;
    var personalFunc = {};
    personalFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.userInfo();//获取当前用户信息
        this.getClientManager();//获取客户经理信息

        //this.btnOpt()//按钮
        if (register == 1) {
            //$('.show-user-info .to-modify').trigger("click");
            personalFunc.btnOptClick();
        }
    }

    /**
     * 语言选择
     */
    personalFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        // console.log(language);
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_personal_infoNational/p_personal_info.json',function (resp) {
            if(resp){
                for(var i=resp.length-1;i>=0;i--){
                    var keys = _.keys(resp[i]);
                    // console.log(keys)
                    if(language === keys[0]){
                        languagePackage = resp[i][language];
                        break ;
                    }
                }
            }
        })
    }

    //添加电话区号
    personalFunc.intlTel = function () {
        $(".connectPhone").intlTelInput({
            utilsScript: utils
        });
    }

    /*获取当前用户信息*/
    personalFunc.userInfo = function () {
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                //信誉值
                var reputationClass;
                if (resp.data.reputationValue <= 0) {
                    reputationClass = 1;
                } else if (resp.data.reputationValue > 0 && resp.data.reputationValue <= 150) {
                    reputationClass = 2;
                } else if (resp.data.reputationValue > 150 && resp.data.reputationValue <= 300) {
                    reputationClass = 3;
                } else if (resp.data.reputationValue > 300) {
                    reputationClass = 4;
                }
                if(resp.data.status == 3){
                    $(".role_status").addClass("user_block_info");
                }
                var reputationHtml = '<div class="w-supplier fl-none">' +
                    '<p><span class="s-credibility-' + reputationClass + '"></span>（' + resp.data.reputationValue + '）</p>' +
                    '<div class="w-credibility">' +
                        '<h4>' + resp.data.companyName + '</h4>' +
                        '<h5><tt>' + resp.data.star + '</tt><i>' + resp.data.orderSuccessCount + '单</i></h5>' +
                        '<dl>' +
                            '<dt class="w-credibility-' + reputationClass + '"></dt>' +
                            '<dd>信誉值：' + resp.data.reputationValue + '</dd>' +
                        '</dl>' +
                    '</div>' +
                '</div>';
                $("#reputation-value").html(reputationHtml);

                personalFunc.reputationDetail(resp);//信誉规则
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'个人面板'));
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
                personalFunc.work(resp);
                personalFunc.userInfoHtml(resp);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    personalFunc.getClientManager = function () {
        interface.clientManager(function (resp) {
            console.log(resp.data)
            if (resp.data){
                $('#j_client_manager').html(template('t:j_client_manager', {data: resp.data}));//左侧菜单
            }
        },function (resp) {
            alertReturn(resp.exception);
        })
    }
    //信誉规则
    personalFunc.reputationDetail = function (resp) {
        $('#reputation-detail').on('click', function () {
            var reputationDetailHtml = '<div>' +
                '<div class="module">' +
                '<h1>信誉值规则' +
                '</h1>' +
                '<ul>' +
                '<li>' +
                '<i class="icon-reputation01">' +
                '</i>' +
                '<span>（x≤0）' +
                '</span>' +
                '</li>' +
                '<li>' +
                '<i class="icon-reputation02">' +
                '</i>' +
                '<span>（0&lt;x≤150）' +
                '</span>' +
                '</li>' +
                '<li>' +
                '<i class="icon-reputation03">' +
                '</i>' +
                '<span>（150&lt;x≤300）' +
                '</span>' +
                '</li>' +
                '<li>' +
                '<i class="icon-reputation04">' +
                '</i>' +
                '<span>（x>300）' +
                '</span>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '<div class="module">' +
                '<h1>优势' +
                '</h1>' +
                '<p>信誉值越高，相同金额中标优先、发布招标排序优先、提现服务优先等。相对应的信誉值越高，说明该用户成功的交易量越多，扣分较少，用户信用度很可靠。' +
                '</p>' +
                '<p>客户可以根据信誉值评判交易方可靠度，进而选择是否进行交易。' +
                '</p>' +
                '</div>' +
                '<div class="module">' +
                '<h1>扣分规则' +
                '</h1>' +
                '<p>买家：中标未签约流单（-5）、订单未支付流单（-5）、延期未点击“去提货”流单（-5）、延期验收尾款未支付（-2）、被申诉成功（-2）' +
                '</p>' +
                '<p>卖家：中标未签约流单（-5）、延期未点击“立即发货”（-5）、延期未发货“部分发货”（-2）、被申诉成功（-2）' +
                '</p>' +
                '</div>' +
                '<div class="module">' +
                '<h1>加分规则' +
                '</h1>' +
                '<p>买家：完成交易（+1）、完成10次交易（+10）、完成30次交易（+15）、完成60次交易（+20）' +
                '</p>' +
                '<p>卖家：完成交易（+1）、完成10次交易（+10）、完成30次交易（+15）、完成60次交易（+20）' +
                '</p>' +
                '</div>' +
                '<div class="module">' +
                '<h1>限制规则' +
                '</h1>' +
                '<p>信誉值x≤0，账号限制交易，只可以参与100万以下招标，不能发布招标。' +
                '</p>' +
                '<p>信誉值0&lt;x≤150，账号限制交易，参与150万以下的金额交易。' +
                '</p>' +
                '<p>信誉值150&lt;x≤300，账号限制交易，参与300万以下的金额交易。' +
                '</p>' +
                '<p>信誉值x>300，不限制交易。' +
                '</p>' +
                '</div>' +
                '</div>';
            var d = dialogOpt({
                title: '信誉值规则',
                class: 'reputation-detail',
                content: reputationDetailHtml,
                //textOkey: '确定',
                textCancel: '关闭'
                //funcOkey: function () {
                //    d.remove();
                //}
            });
        });
    }

    /*手机号邮箱部分*/
    personalFunc.work = function (resp) {
        $('#mobile').on('click', function () {//修改手机号
            var mobileHtml = '<ul>' +
                '<li><label>原手机号：</label><input class="mobile" type="text" disabled value="18231059785"/> </li> ' +
                '<li> <label>验证码：</label><input class="code" type="text" value=""/><a class="get-code" href="javascript:;">发送</a> </li> ' +
                '<li class="third"> <label>新手机号：</label><input class="new-mobile" type="text" value=""/> </li> ' +
                '</ul>' +
                '<p></p>';
            var d = dialogOpt({
                title: '修改手机号',
                class: 'modify-mobile',
                content: mobileHtml,
                textOkey: '确定',
                textCancel: '取消',
                funcOkey: function () {
                    var code = trim($('.modify-mobile .code').val());
                    var newMobile = trim($('.modify-mobile .new-mobile').val());
                    if (!code) {
                        $('.modify-mobile p').html('*验证码不能为空');
                        return false;
                    }

                    if (!newMobile) {
                        $('.modify-mobile p').html('*新手机号不能为空');
                        return false;
                    }
                    interface.changeMobile({
                        captcha: code,
                        mobile: newMobile
                    }, function (resp) {
                        if (resp.code == 0) {
                            d.remove();
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function () {
                        alertReturn(resp.exception);
                    })

                }
            })
            personalFunc.getCode();
            personalFunc.input();
        })
        $('#email').on('click', function () {//修改邮箱
            var emailHtml = '<input type="text"/>' +
                '<p></p>';
            var d = dialogOpt({
                title: '添加邮箱',
                class: 'modify-email',
                content: emailHtml,
                textOkey: '确定',
                textCancel: '取消',
                funcOkey: function () {
                    var email = trim($('.modify-email input').val());
                    if (!email) {
                        $('.modify-email p').html('*邮箱不能为空');
                        return false;
                    }
                    d.remove();
                }
            })
            personalFunc.input();
        });

        /**
         * 认证验证
         */
        $('.checkFrozen').on('click', function () {
            var user = getUser().data;
            //已冻结
            if(user.status==3){
                alertReturn('账号已被冻结');
                return ;
            }
            window.location.href = $(this).attr('data-url');
        })

    }


    /*获取验证码*/
    personalFunc.getCode = function () {
        $(".get-code").on('click', function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) {
                return false;
            }
            var mobile = $('.modify-mobile .mobile').val();

            interface.changeSmsSendSms({
                mobile: mobile
            }, function (res) {
                if (res.code == 0) {
                    captcha(res.data.coolDown);
                } else {
                    alertReturn(res.exception);
                }
            }, function (res) {
                alertReturn(res.exception);
            });
        });

        var time;

        function captcha(coolDown) {
            time = coolDown;
            $(".get-code").html(time + 's').addClass("disabled");
            lazy();
        }

        function lazy() {
            if (time >= 1) {
                $(".get-code").html(time-- + 's');
                setTimeout(lazy, 1000);
            }
            else {
                $(".get-code").html("发送").removeClass("disabled");
            }
        }
    }

    personalFunc.input = function () {
        $('input').on('keyup', function () {
            $('.modify-mobile p').html('');
        })
    }

    /*个人资料*/
    personalFunc.userInfoHtml = function (resp) {
        $("#j_userInfo").html(template('t:j_userInfo', {list: resp.data}));
        personalFunc.dealwithImg();
        personalFunc.btnOpt();
    }

    personalFunc.btnOpt = function () {

        $('.show-user-info .to-modify').unbind('click').on('click', function () {
            personalFunc.btnOptClick();
        })
        $('.modify-user-info .save').unbind('click').on('click', function () {
            empty = 0;
            if (btnStatus == 1) {
                return false;
            }
            var $this = $(this);
            var empty = 0;
            var nickname = trim($('.nickname').val());
            var reg = new RegExp(" ", "g"); //创建正则RegExp对象
            // bankCard = bankCard.replace(reg, '');
            var connectPhone = trim($('.connectPhone').val());
            var department = trim($('.department').val());
            var position = trim($('.position').val());
            var connectPhoneTitle = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title");
            var connectPhoneClass = $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class");
            var connectPhoneAreaCode = getAreaCode(connectPhoneTitle);
            // var idcard = trim($('.idcard').val());
            // var idcardImage = $('.modify-user-info .png-box .img-wrap img').attr('src');
            $('input.need').each(function () {
                if (!trim($(this).val())) {
                    var errorHtml = $(this).parent('dd').siblings('dt').html();
                    errorHtml = errorHtml.substring(0, errorHtml.length - 32);
                    $(this).siblings('.error').html('*' + errorHtml + languagePackage['不能为空']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            //卡号验证
            //  if (!isBankCard(bankCard)) {
            //     $('.bankCard').siblings('.error').html('*银行卡号必须是8~28位数字');
            //     empty = 1;
            // }
            //console.log(bankCity);
            //console.log(bankProvince);
            // if (!isChinese(bank)) {
            //     $('.bank').siblings('.error').html('*开户行只能为中文');
            //     empty = 1;
            // }
            // if (bankCity == '' || bankProvince == '') {
            //     $('#bankProvince').siblings('.error').html('开户地址不能为空');
            //     empty = 1;
            // }
            if (connectPhone) {
                if (!matchIntlMobile(connectPhone)) {
                    $('.connectPhone').parent(".intl-tel-input").next('.error').html('*'+languagePackage['手机号格式不正确']);
                    $('.connectPhone').addClass('red');
                    // $('.connectPhone').siblings('.error').html('*手机号格式不正确');
                    // $('.connectPhone').addClass('red');
                    empty = 1;
                }
            }else{
                $('.connectPhone').parent(".intl-tel-input").next('.error').html('*'+languagePackage['手机号不能为空']);
                $('.connectPhone').addClass('red');
                empty = 1;
            }

            if ($('.ui-radio-options li:eq(0)').hasClass('checked')) {
                sex = 1;
            } else {
                sex = 2;
            }
            // if (idcard) {
            //     if (!matchIdCard(idcard)) {
            //         $('.idcard').siblings('.error').html('*身份证号格式不正确');
            //         $('.idcard').addClass('red');
            //         empty = 1;
            //     }
            // }

            // if (!idcardImage) {
            //     $('.fix-error').html('*请上传身份证件');
            //     empty = 1;
            // }
            if (empty == 1) {
                alertReturn(languagePackage['信息填写不正确']);
                return false;
            }
            btnStatus = 1;
            $this.html(languagePackage['保存中']+'...');
            $this.addClass('btn-inverse').removeClass('btn-primary');
            interface.updateCurrentUser(
                {
                    nickname: nickname,
                    connectPhone: connectPhone,
                    department: department,
                    id: user.data.id,
                    position: position,
                    connectPhoneAreaCode:connectPhoneAreaCode,
                    connectPhoneAddr:{
                        title:connectPhoneTitle,
                        class:connectPhoneClass
                }
                }, function (resp) {
                    if (resp.code == 0) {
                        setUser();
                        $this.html(languagePackage['保存']);
                        btnStatus = 0;
                        $this.addClass('btn-primary').removeClass('btn-inverse');
                        $('.show-user-info').removeClass('hide');
                        $('.modify-user-info').addClass('hide');
//                        var tipsHtml = '<h2 class="noPassword">恭喜，您个人认证成功，现在可以去参与招标啦，加入公司或成功认证公司后将可以发布招标哦～</h2>';
                        var tipsHtml = '<h2 class="noPassword">'+languagePackage['保存成功']+'～</h2>';
                        var d2 = dialogOpt({
                            title: languagePackage['提示'],
                            class: 'tips-dialog',
                            content: tipsHtml,
                            textOkey: languagePackage['关闭'],
                            textOkeyId: 'at_pi_okid',
                            closeId: 'at_pi_closeid',
                            funcOkey: function () {
                                d2.remove();
                                personalFunc.userInfoHtml(resp);
                                header.showHeader();
//                                interface.currentUserInfo(function (resp) {
//                                    if (resp.code == 0) {
//                                        personalFunc.userInfoHtml(resp);
//                                        setUser();
//                                        header.showHeader();
//                                    } else {
//                                        alertReturn(resp.exception);
//                                    }
//                                }, function (resp) {
//                                    alertReturn(resp.exception);
//                                })
                            }
                        });
                    } else {
                        $this.html(languagePackage['保存']);
                        btnStatus = 0;
                        $this.addClass('btn-primary').removeClass('btn-inverse');
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    $this.html(languagePackage['保存']);
                    btnStatus = 0;
                    $this.addClass('btn-primary').removeClass('btn-inverse');
                    alertReturn(resp.exception);
                }
            )

        })

        $('.modify-user-info .back-edit').unbind('click').on('click', function () {
            $('.show-user-info').removeClass('hide');
            $('.modify-user-info').addClass('hide');
        })
    }

    personalFunc.btnOptClick = function () {
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                $('.show-user-info').addClass('hide');
                $('.modify-user-info').removeClass('hide');
                $("#j_editUserInfo").html(template('t:j_editUserInfo', {
                    list: resp.data
                }));
//                if (resp.data.companyId != 0 && resp.data.role == 1) {
//
//                } else {
//                    personalFunc.uploadPng();
//                }
                personalFunc.btnOpt();
                personalFunc.editBtn();
                personalFunc.dealwithImg();
                personalFunc.intlTel();
                if(resp.data.connectPhoneAddr){
                    var connectPhoneAddr = resp.data.connectPhoneAddr;
                    $('.connectPhone').parent(".intl-tel-input").find(".selected-flag").attr("title",connectPhoneAddr.title);
                    $('.connectPhone').parent(".intl-tel-input").find(".selected-flag .iti-flag").attr("class",connectPhoneAddr.class);
                }
                //_init_area();//初始化地区
                if (!resp.data.bankProvince) {
                    $("#city").citySelect({nodata: "none", required: false});
                } else {
                    $("#city").citySelect({prov: resp.data.bankProvince, city: resp.data.bankCity});//初始化地区
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }


        personalFunc.editBtn = function () {
        $(".bankCard").on("keyup", formatBC);//校验银行卡号

        //单选框
        $('.ui-radio-options li').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('checked')) {
                $this.addClass('checked').siblings().removeClass('checked');
                if ($('.ui-radio-options li:eq(0)').hasClass('checked')) {
                    sex = 1;
                } else {
                    sex = 2;
                }
            }
        })
        $('select').on('change', function () {
            $('select').siblings('.error').html('');
        })
        $('input.connectPhone').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.parent(".intl-tel-input").siblings('.error').html('');
            }
        })
        //focus移除错误样式
        $('.user-info-read input.need').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })
    }

//    personalFunc.uploadPng = function () {
//        uIdCard.init({//上传身份证号
//            input: document.querySelector('#img_input'),
//            callback: function (base64) {
//                $.ajax({
//                    type: "POST",
//                    url: seajs.host + '/file/uploadImageBase64 ',
//                    dataType: "json",
//                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
//                    //processData: false,  // 注意：不要 process data
//                    contentType: "application/json",  // 注意：不设置 contentType
//                    data: JSON.stringify({
//                        image: base64
//                    }),
//                    beforeSend: function (xhr) {
//                        var user = getUser();
//                        if (user && user.login) {
//                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
//                        }
//                    }
//                }).success(function (resp) {
//                    $('.alert_dialog').remove();
//                    var imgHtml = '<img src="' + resp.data + '" alt="身份证件">'
//                    $('.png-box .img-wrap').html(imgHtml);
//                    $('.upload').html('重新添加');
//                    $('.fix-error').html('');
//                    personalFunc.dealwithImg();
//                }).fail(function (resp) {
//                    $('.alert_dialog').remove();
//                    alertReturn(resp.exception);
//                });
//            },
//            loading: function () {
//                alertDialog('身份证件上传中...');
//            }
//        });
//    }

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

    /**
     * 模板数据处理方法方法
     */
    personalFunc.template = function () {
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
    personalFunc.init();
});
