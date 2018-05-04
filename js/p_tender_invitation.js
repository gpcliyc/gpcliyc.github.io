/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var header = require("header");
    var zic = require("zic");
    var http = require("http");
    var template = require('template');
    require('underscore-min');
    require("interface");
    var webuploader = require("webuploader");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var uPng = new UploadPic(); //上传图片
    var empty = 0;//是否完成所有校验；0：完成；1：未完成，不可走接口
    var btnStatus = 0;//发布按钮状态0：可点击；1：不可点击；
    var petrolType = Number(request('petrolType')) || 1;
    var petrolName = '';
    var tenderFunc = {};
    var languagePackage = null;
    var dataFill = {};

    if (petrolType == 1) {
        petrolName = '石油焦';
    } else if (petrolType == 2) {
        petrolName = '煅后焦';
    } else if (petrolType == 3) {
        petrolName = '焦炭';
    }

    var inspectionReport = null;

    tenderFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.tenderDetail()
        this.cokeType(); //类型标签
        this.initView();
        this.initOpt();
        this.publish();//发布招标

        this.uploadPng();//上传图片
        this.uploadReport();
        this.showHistoryImage();//展示历史图片
        this.bindEvent();

    }
    tenderFunc.tenderDetail = function () {
        var tenderId = request('tenderId');
        if (!tenderId) {
            //默认石油焦海绵焦选中
            if (petrolType == 1) {
                $("#at_tender_invitation_label1").addClass("coke_type_back");
            } else if (petrolType == 2) {
                $("#at_tender_invitation_label4").addClass("coke_type_back");
            }else if(petrolType == 3){
                $("#at_tender_invitation_label7").addClass("coke_type_back");
            }
            return;
        }
        interface.tenderDetail({id: tenderId}, function (resp) {
            petrolType = resp.data.petrolType
            //类型
            $("#at_tender_invitation_petrolType").val(petrolType);
            tenderFunc.initView();
            tenderFunc.initOpt();
            //产地
            $("#at_tender_invitation_productArea").val(resp.data.productAreaZh);
            $(":text, textarea").each(function () {
                var _field = $(this).attr('id').replace('at_tender_invitation_', '');
                var _value = resp.data[_field];
                if (_value) {
                    $(this).val(_value)
                }
            })
            //标签类型 label
            $(".coke_type").eq(resp.data.label - 1).addClass("coke_type_back");
            //图片
            if (resp.data.images != "" || resp.data.images != null) {
                var html = "", imgArr = [];
                imgArr.push(resp.data.images.split(","));
                for (var i = 0; i < imgArr.length; i++) {
                    html += ' <div class="img-wrap"><span class="actived"></span><img src="' + imgArr[i] + '" alt=""/></div>';
                }
                $('.png-box').prepend(html);
                $('.upload-png').html(html);
            }
        })

    }
    tenderFunc.template = function () {
        template.helper('setLanguagePackage', function (key) {
            if (key in languagePackage) {
                return languagePackage[key];
            }
        })
        template.helper('setLanguagePackageCss', function (key) {
            if (key in languagePackage['css']) {
                return languagePackage['css'][key];
            }
        })
    }
    tenderFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_interNational/p_bid_hall.json', function (resp) {
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
    tenderFunc.renderBlock = function () {
        $("#publishContent").html(template('t:publishContent', {data: petrolType}));
    }
    tenderFunc.initView = function () {
        $("#petrocokeContent").empty().html(template('t:petrocokeContent', {data: petrolType}));
        $("#waterOrBaffleBag").empty().html(template('t:waterOrBaffleBag', {data: petrolType}));
    }
    tenderFunc.bindEvent = function () {
        $("#petrolType select[name='petrolType']").unbind('change').bind('change', $.proxy(function () {
            petrolType = Number($("#petrolType select[name='petrolType']").find('option:selected').val());
            //默认石油焦选中海绵焦、煅后焦选中煅烧石油焦
            if (petrolType == 1) {
                petrolName = "石油焦";
                $("#at_tender_invitation_label1").click();
            } else if (petrolType == 2) {
                petrolName = "煅后焦";
                $("#at_tender_invitation_label4").click();
            } else if (petrolType == 3) {
                petrolName = "焦炭";
                $("#at_tender_invitation_label7").click();
            }
            $(".item span.error").empty().siblings('.red').removeClass('red');
            this.initView();
            this.initOpt();
        }, tenderFunc))
    }
    tenderFunc.showHistoryImage = function () {
        var imagesArr = getImages();//获取缓存的所有图片
        if (imagesArr && imagesArr.length > 0) {
            for (var i = 0; i < imagesArr.length; i++) {
                var html = '';
                html += ' <div class="img-wrap"><img src="' + imagesArr[i] + '" alt=""/></div>';
                $('.png-box').append(html);
                tenderFunc.selectPhoto();
                tenderFunc.dealwithImg();
            }
            $(".upload-history").removeClass("hide");
        }
    }

    tenderFunc.initOpt = function () {
        $('.detail input').on('keyup', function () {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass('red');
                $this.siblings('.error').html('');
            }
        })

        $('.productArea').bind('focus', function () {
            $(this).removeClass('red');
            $(this).siblings('.error').html('');
        })

        //输入公示底价限制两位小数
        $('.reservePrice,.se-item .detail li>input.need-2number,.se-item .detail li>input.need-2number-other').on('input', function () {
            var reservePrice = trim($(this).val());
            if (!isInteger0(reservePrice)) {
                $(this).val('');
            } else {
                if (reservePrice.indexOf('.') > 0 && reservePrice.toString().split(".")[1].length > 2) {
                    $(this).val(Math.floor(Number(reservePrice) * 100) / 100);
                    return false;
                }
            }
        });
        $(".se-item .detail li>input.need-2number-30").on('input', function () {
            var reservePrice = trim($(this).val());
            if (Number(reservePrice) >= 30) {
                // $(this).val(29);
                $(this).val(reservePrice.substring(0, 1));
            }
        })
        $(".se-item .detail li>input.need-2number-10").on('input', function () {
            var reservePrice = trim($(this).val());
            if (Number(reservePrice) >= 10) {
                $(this).val(reservePrice.substring(0, 1));
            }
        })
        $(".se-item .detail li>input.need-2number-5").on('input', function () {
            var reservePrice = trim($(this).val());
            if (Number(reservePrice) >= 5) {
                if (reservePrice.length <= 1) {
                    $(this).val('');
                } else {
                    $(this).val(reservePrice.substring(0, 1));
                }
            } else {
                $(this).val(reservePrice);
            }
        })
        $(".se-item .detail li>input.need-2number").on('input', function () {
            var reservePrice = trim($(this).val());
            if (Number(reservePrice) >= 100) {
                $(this).val(reservePrice.substring(0, 2));
            }
        })

        //粒度
        $(".particle").on('input', function () {
            var $this = $(this);
            var reservePrice = trim($this.val());
            if (!isInteger0(reservePrice)) {
                $this.val('');
            } else {
                if (reservePrice.indexOf('.') > 0 && reservePrice.toString().split(".")[1].length > 2) {
                    $this.val(Math.floor(Number(reservePrice) * 100) / 100);
                    return false;
                }
                if (reservePrice.length > 6) {
                    $(this).val(reservePrice.slice(0, 6));
                    return false;
                }
            }
        })


        //for ie  输入公示底价限制两位小数
        if (document.all) {
            $('.reservePrice,.se-item .detail li>input.need-2number,.se-item .detail li>input.need-2number-other').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger0(reservePrice)) {
                            $(".reservePrice").val('');
                        } else {
                            if (reservePrice.indexOf('.') > 0 && reservePrice.toString().split(".")[1].length > 2) {
                                $(".reservePrice").val(Math.floor(Number(reservePrice) * 100) / 100);
                                return false;
                            }
                        }
                    });
                }
            })
            $('.se-item .detail li>input.need-2number').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        var reservePrice = trim($(this).val());
                        if (Number(reservePrice) >= 100) {
                            $(this).val(reservePrice.substring(0, 2));
                        }
                    });
                }
            })
            $('.se-item .detail li>input.need-2number-30').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (Number(reservePrice) >= 30) {
                            $(this).val(reservePrice.substring(0, 1));
                        }
                    });
                }
            })
            $('.se-item .detail li>input.need-2number-10').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (Number(reservePrice) >= 10) {
                            $(this).val(reservePrice.substring(0, 1));
                        }
                    });
                }
            })
            $('.se-item .detail li>input.need-2number-5').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (Number(reservePrice) >= 5) {
                            if (reservePrice.length <= 1) {
                                $(this).val('');
                            } else {
                                $(this).val(reservePrice.substring(0, 1));
                            }
                        } else {
                            $(this).val(reservePrice);
                        }
                    });
                }
            })

            //粒度
            $(".particle").on('input', function () {
                var $this = $(this);
                var reservePrice = trim($this.val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger0(reservePrice)) {
                            $this.val('');
                        } else {
                            if (reservePrice.indexOf('.') > 0 && reservePrice.toString().split(".")[1].length > 2) {
                                $this.val(Math.floor(Number(reservePrice) * 100) / 100);
                                return false;
                            }
                            if (reservePrice.length > 6) {
                                $(this).val(reservePrice.slice(0, 6));
                                return false;
                            }
                        }
                    });
                }
            })
        }
        //size = 4
        $('.se-item .detail li>input.no-needs,.baffleBag').on('input', function () {
            var reservePrice = trim($(this).val());
            if (!isInteger(reservePrice)) {
                $(this).val('');
            } else {
                if (reservePrice.indexOf('.') >= 0) {
                    $(this).val(reservePrice.substring(0, reservePrice.indexOf('.')));
                }
                if (reservePrice.length > 4) {
                    $(this).val(reservePrice.slice(0, 4));
                    return false;
                }
            }
        });

        //for ie  size = 4
        if (document.all) {
            $('.se-item .detail li>input.no-needs').each(function () {
                var reservePrice = trim($(this).val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger(reservePrice)) {
                            $(this).val('');
                        } else {
                            if (reservePrice.indexOf('.') >= 0) {
                                $(this).val(reservePrice.substring(0, reservePrice.indexOf('.')));
                            }
                            if (reservePrice.length > 4) {
                                $(this).val(reservePrice.slice.call(0, 4));
                                return false;
                            }
                        }
                    });
                }
            })
        }
        //限制整数
        $('.totalQuantity').on('input', function () {//限制整数
            var $this = $(this);
            var inputVal = trim($this.val());
            if (!isInteger0(inputVal)) {
                $this.val('');
            } else {
                if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 0) {
                    $this.val(Math.floor(Number(inputVal) * 1) / 1);
                    return false;
                }
            }
        });
        //

        //for ie  限制整数
        if (document.all) {
            $('.totalQuantity').each(function () {//限制整数
                var $this = $(this);
                var inputVal = trim($this.val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger0(inputVal)) {
                            $this.val('');
                        } else {
                            if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 0) {
                                $this.val(Math.floor(Number(inputVal) * 1) / 1);
                                return false;
                            }
                        }
                    });
                }
            })
        }

        //限制1位小数
        $('.se-item .detail li>input.no-need').on('input', function () {//限制1位小数
            var $this = $(this);
            var inputVal = trim($this.val());
            if (!isInteger0(inputVal)) {
                $this.val('');
            } else {
                if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 2) {
                    $this.val(Math.floor(Number(inputVal) * 10) / 10);
                    return false;
                }
            }
        });

        //for ie  限制1位小数
        if (document.all) {
            $('.se-item .detail li>input.no-need').each(function () {//限制1位小数
                var $this = $(this);
                var inputVal = trim($this.val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger(inputVal)) {
                            $this.val('');
                        } else {
                            if (inputVal.indexOf('.') > 0 && inputVal.toString().split(".")[1].length > 0) {
                                $this.val(Math.floor(Number(inputVal) * 10) / 10);
                                return false;
                            }
                        }
                    });
                }
            })
        }

        //振实密度0.75―1.0   比电阻400―600,真密度保留2位小数
        $('.se-item .detail li>input.special-need').on('input', function () {
            var $this = $(this);
            var inputVal = trim($this.val());

            // if ($(this).hasClass('vibration')) {
            //     if (!!isNaN(Number(inputVal))) {
            //         $this.val('');
            //     } else {
            //         if (inputVal.indexOf('.') > 0) {
            //             if (inputVal.toString().split(".")[0] == 1) {
            //                 $this.val('1');
            //             }
            //             if (inputVal.toString().split(".")[1].length == 1) {
            //                 if (inputVal.toString().split(".")[1][0] < 7) {
            //                     $this.val('0.');
            //                 }
            //             }
            //
            //             if (inputVal.toString().split(".")[1].length > 1) {
            //                 $this.val(Math.floor(Number(inputVal) * 100) / 100);
            //                 return false;
            //             }
            //
            //         } else {
            //             if (inputVal == 0 || inputVal == 1) {
            //                 $this.val(inputVal);
            //             } else if (inputVal > 1) {
            //                 $this.val('');
            //             }
            //         }
            //     }
            // }
            // if ($(this).hasClass('density')) {
            //     if (!!isNaN(Number(inputVal))) {
            //         $this.val('');
            //     } else {
            //         if (inputVal.indexOf('.') > 0) {
            //             var intNum = inputVal.toString().split(".")[0];
            //             if (intNum == 1) {
            //                 if (inputVal.toString().split(".")[1].length == 1) {
            //                     if (inputVal.toString().split(".")[1][0] < 9) {
            //                         $this.val('1.');
            //                     }
            //                 }
            //             }
            //             if (intNum == 2) {
            //                 if (inputVal.toString().split(".")[1].length == 1) {
            //                     if (inputVal.toString().split(".")[1][0] > 1) {
            //                         $this.val('2.');
            //                     }
            //                 }
            //             }
            //             if (inputVal.toString().split(".")[1].length > 2) {
            //                 $this.val(Math.floor(Number(inputVal) * 100) / 100);
            //                 return false;
            //             }
            //
            //         } else {
            //             if (inputVal < 1 || inputVal > 2) {
            //                 $this.val('');
            //             } else {
            //                 $this.val(inputVal);
            //             }
            //         }
            //     }
            // }
            // if ($(this).hasClass('resistance')) {
            //     if (!!isNaN(Number(inputVal))) {
            //         $this.val('');
            //     } else {
            //         var len = inputVal.toString().length;
            //         if (len == 1) {
            //             if (inputVal < 4 || inputVal > 6) {
            //                 $this.val('');
            //                 return;
            //             }
            //         }
            //         if (len == 2) {
            //             if (inputVal > 60) {
            //                 $this.val(inputVal.toString().substr(0, 1));
            //                 return;
            //             }
            //         }
            //         if (len == 3) {
            //             if (inputVal > 600) {
            //                 $this.val(inputVal.toString().substr(0, 2));
            //                 return;
            //             }
            //         }
            //         if (len > 3) {
            //             $this.val(inputVal.toString().substr(0, 3));
            //             return;
            //
            //         }
            //         $this.val(inputVal);
            //         return false;
            //     }
            // }

        });
        if (document.all) {
            $('.se-item .detail li>input.special-need').each(function () {
                var $this = $(this);
                var inputVal = trim($this.val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if ($(this).hasClass('vibration')) {
                            if (!!isNaN(Number(inputVal))) {
                                $this.val('');
                            } else {
                                if (inputVal.indexOf('.') > 0) {
                                    if (inputVal.toString().split(".")[0] == 1) {
                                        $this.val('1');
                                    }
                                    if (inputVal.toString().split(".")[1].length == 1) {
                                        if (inputVal.toString().split(".")[1][0] < 7) {
                                            $this.val('0.');
                                        }
                                    }

                                    if (inputVal.toString().split(".")[1].length > 2) {
                                        $this.val(Math.floor(Number(inputVal) * 100) / 100);
                                        return false;
                                    }

                                } else {
                                    if (inputVal == 0 || inputVal == 1) {
                                        $this.val(inputVal);
                                    } else if (inputVal > 1) {
                                        $this.val(inputVal.toString().substr(0, 1));
                                    }
                                }
                            }
                        }

                        if ($(this).hasClass('resistance')) {
                            if (!!isNaN(Number(inputVal))) {
                                $this.val('');
                            } else {
                                var len = inputVal.toString().length;
                                if (len == 1) {
                                    if (inputVal < 4 || inputVal > 6) {
                                        $this.val('');
                                        return;
                                    }
                                }
                                if (len == 2) {
                                    if (inputVal > 60) {
                                        $this.val(inputVal.toString().substr(0, 1));
                                        return;
                                    }
                                }
                                if (len == 3) {
                                    if (inputVal > 600) {
                                        $this.val(inputVal.toString().substr(0, 2));
                                        return;
                                    }
                                }
                                if (len > 3) {
                                    $this.val(inputVal.toString().substr(0, 3));
                                    return;

                                }
                                $this.val(inputVal);
                                return false;
                            }
                        }
                    });
                }
            })
        }

    }

    tenderFunc.selectPhoto = function () {
        $('.png-box .img-wrap').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('checked')) {
                $this.addClass('checked').siblings().removeClass('checked');
                var checkedImg = $('.png-box .img-wrap.checked img').attr('src');
                var imgHtml = ' <div class="img-wrap"><span class="actived"></span><img src="' + checkedImg + '" alt=""/></div>';
                $('.upload-png').html(imgHtml);
                addImage(checkedImg);//添加到缓存
                $('.img-tip').removeClass('error');
                tenderFunc.dealwithImg1();
            }
        })
    }

    tenderFunc.uploadPng = function () {
        uPng.init({
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
                    addImage(resp.data);
                    $('.alert_dialog').remove();
                    if ($('.png-box .img-wrap img').length == 10) {
                        $('.png-box .img-wrap')[9].remove();
                    }
                    var html = ' <div class="img-wrap"><span class="actived"></span><img src="' + resp.data + '" alt=""/></div>';
                    $('.png-box').prepend(html);
                    $('.upload-png').html(html);
                    $('.img-tip').removeClass('error');
                    tenderFunc.selectPhoto();
                    tenderFunc.dealwithImg();
                    tenderFunc.dealwithImg1();
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
    /*报告*/
    tenderFunc.uploadReport = function () {
        $.upLoadDefaults = $.upLoadDefaults || {};
        var uploader = WebUploader.create({
            // 选完文件后，是否自动上传。
            auto: true,
            // swf文件路径
            swf: '../../plugin/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: seajs.host + '/file/uploadImage',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',
            fileSingleSizeLimit: 1024 * 1024 * 5,
            // 只允许选择图片文件及pdf文件。
            accept: {
                title: 'pdfs',
                extensions: 'pdf',
                mimeTypes: 'application/pdf'
            },
            formData: {
                'DelFilePath': '', //定义参数
                url: ''
            },
            fileVal: 'file', //上传域的名称
            threads: 8,
//            fileNumLimit:1,
            compress: false,
            method: 'POST'
        });
        // 文件报错
        uploader.on("error", function (type) {
            if (type == "F_EXCEED_SIZE") {
                alertReturn(languagePackage["上传文件内容超过5M，请您重新上传"]);
            } else if (type == "Q_TYPE_DENIED") {
                alertReturn(languagePackage["文件格式有误"]);
            }
        });
        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {  // webuploader事件.当选择文件后，文件被加载到文件队列中，触发该事件。等效于 uploader.onFileueued = function(file){...} ，类似js的事件定义。
//            console.log(file);
        });
        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on('uploadSuccess', function (file, data) {
            if (data.code == 0) {
                inspectionReport = data.data;
//                console.log(inspectionReport);
                //显示查看按钮
                $("#showReport").attr('href', inspectionReport).show();
            }
        });
    };

    tenderFunc.cokeType = function () {
        $(".coke_type").on("click", function () {
            if(petrolType == 1){
                if($(this).index() > 2){
                    return false;
                }
            }else if(petrolType == 2){
                if($(this).index() >5 || $(this).index() <3){
                    return false;
                }
            }else if(petrolType == 3){
                if($(this).index() < 6){
                    return false;
                }
            }
            $(".coke_type").removeClass("coke_type_back");
            $(this).addClass("coke_type_back");
        })
    }
    /*发布招标*/
    tenderFunc.publish = function () {
        var limittotalQuantity = Number(commonData('MIN_BUY_QUANTITY'));//竞买量最低限制
        $('.publish').on('click', function () {
            empty = 0;
            if (btnStatus == 1) {
                return false;
            }

            var That = $(this);
            var petrolType = trim($("#petrolType select[name='petrolType'] option:selected").val() || "");
            var productArea = trim($('.productArea').val() || "");//产地
            var reservePrice = trim($('.reservePrice').val() || "");//公示底价
            var totalQuantity = trim($('.totalQuantity').val() || "");//竞买量
            var description = trim($('.description').val() || "");//描述
            var su = trim($('.su').val() || "");//硫
            var ash = trim($('.ash').val() || "");//灰分
            var volatiles = trim($('.volatiles').val() || "");//挥发分
            var water = trim($('.water').val() || "");//水分
            var buckleWaterRate = trim($('.buckleWaterRate').val() || "");//扣水量
            var particle = trim($('.particle').val() || "");//粒度
            var density = trim($('.density').val() || "");//真密度
            var resistance = trim($('.resistance').val() || "");//粉末比电阻
            var vibration = trim($('.vibration').val() || "");//振实密度
            var bagPrice = trim($('.baffleBag').val() || "");//吨袋价格
            var peacoke = trim($('.peacoke').val() || "");//焦末含量
            var cokeTypeIndex = null;
            $(".coke_type").each(function (index) {
                if ($(this).hasClass("coke_type_back")) {
                    cokeTypeIndex = $(this).index() + 1;
                }
            })
            //微量元素--非必填
            var na = trim($('.na').val() || "");//钠
            var ai = trim($('.ai').val() || "");//铝
            var ca = trim($('.ca').val() || "");//钙
            var si = trim($('.si').val() || "");//硅
            var fe = trim($('.fe').val() || "");//铁
            var ph = trim($('.ph').val() || "");//磷
            var va = trim($('.va').val() || "");//钒
            var ni = trim($('.ni').val() || "");//镍
            var pi = trim($('.pi').val() || "");//铅

            /*模块一校验*/
            $('.fr-item .detail li>div>input.need').each(function () {
                if (!trim($(this).val())) {
                    var errorHtml = $(this).parent('div').siblings('label').html();
                    errorHtml = errorHtml.substring(0, errorHtml.length - 9);
                    $(this).siblings('.error').html('*' + languagePackage[errorHtml] + languagePackage['不能为空']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            if (!productArea) {//产地
                $('.productArea').siblings('.error').html('*' + languagePackage['产地'] + languagePackage['不能为空']);
                $('.productArea').addClass('red');
                empty = 1;
            }
            if (reservePrice) {//公示底价
                if (!isInteger(reservePrice)) {
                    $('.reservePrice').siblings('.error').html(languagePackage['出厂底价必须为大于0的数字']);
                    $(this).addClass('red');
                    empty = 1;
                }
            }
            if (totalQuantity) {//竞买量
                if (!isInteger(totalQuantity) || totalQuantity < limittotalQuantity) {
                    $('.totalQuantity').siblings('.error').html(languagePackage['竞买量必须大于等于'] + limittotalQuantity);
                    $('.totalQuantity').addClass('red');
                    empty = 1;
                }
            }

            var str = "[@/'\"#$%&^*<>《》]+";
            var reg = new RegExp(str);
            if (reg.test(productArea)) {
                $('.productArea').siblings('.error').html(languagePackage['产地不能含有特殊字符']);
                $(this).addClass('red');
                empty = 1;
            }
            /*模块二校验*/
            $('.se-item .detail li>input.need').each(function () {
                if (!isIntegers(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空,>0且<100']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            $('.se-item .detail li>input.need-2number-10').each(function () {
                if (!isIntegers(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空,>0且<10']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            $('.se-item .detail li>input.need-2number-5').each(function () {
                if (!isIntegers(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空,>0且<5']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            $('.se-item .detail li>input.need-2number-30').each(function () {
                if (!isIntegers(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空,>0且<30']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            $('.se-item .detail li>input.no-need').each(function () {
                if (trim($(this).val())) {
                    if (!isIntegers(trim($(this).val()))) {
                        $(this).siblings('.error').html(languagePackage['>0且<100的数字']);
                        $(this).addClass('red');
                        empty = 1;
                    }
                }
            })
            $('.se-item .detail li>input.su').each(function () {

                if (!isIntegers(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空,>0且<10']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            $('.se-item .detail li>input.no-needs').each(function () {
                if (trim($(this).val())) {
                    if (!isInteger(trim($(this).val()))) {
                        $(this).siblings('.error').html(languagePackage['必须为大于0的整数']);
                        $(this).addClass('red');
                        empty = 1;
                    }
                }
            })
            /*煅后焦的特俗验证*/
            //振实密度0.75―1.0   比电阻400―600
            $('.se-item .detail li>input.special-need').each(function () {
                if ($(this).hasClass('density')) {
                    var value = $(this).val();
                    if (!value || Number(value) < 0 || Number(value) > 10) {//首先是数字
                        $(this).siblings('.error').html('不能为空,≥0且≤10');
                        $(this).addClass('red');
                        empty = 1;
                    } else {
                        $(this).siblings('.error').html('');
                        $(this).removeClass('red');
                    }
                }
                if ($(this).hasClass('resistance')) {
                    var value = $(this).val();
                    if (!!isNaN(Number(value)) || Number(value) < 10 || Number(value) > 2800) {//首先是数字
                        $(this).siblings('.error').html('不能为空,≥10且≤2800');
                        $(this).addClass('red');
                        empty = 1;
                    }else {
                        $(this).siblings('.error').html('');
                        $(this).removeClass('red');
                    }
                }
                if ($(this).hasClass('vibration')) {
                    var value = $(this).val();
                    if(value){
                        if (!!isNaN(Number(value)) ||Number(value) < 0.7 || Number(value) > 1.00) {//首先是数字
                            $(this).siblings('.error').html('≥0.7且≤1.00');
                            $(this).addClass('red');
                            empty = 1;
                        } else {
                            $(this).siblings('.error').html('');
                            $(this).removeClass('red');
                        }
                    }

                }


            })

            //扣水量不能为空
            $('.th-item .detail div>input.need').each(function () {
                if (!buckleWaterRateCheck(trim($(this).val()))) {
                    $(this).siblings('.error').html(languagePackage['不能为空且不能超过20个字']);
                    $(this).addClass('red');
                    empty = 1;
                }
            })
            //吨袋价格大于0
            $('.th-item .detail div>input.baffleBag').each(function () {
                if (!!$(this).val()) {
                    if (!isInteger0(trim($(this).val()))) {
                        $(this).siblings('.error').html('>=0');
                        $(this).addClass('red');
                        empty = 1;
                    }
                }

            })
            var images = $('.upload-png .img-wrap img').attr('src');

            if (empty == 1) {
                alertReturn(languagePackage['填写信息有误'])
                return false;
            }


            btnStatus = 1;
            That.removeClass('btn-primary').addClass('btn-inverse');
            interface.publishTender({

                petrolType: petrolType,
                bagPrice: bagPrice,
                density: density,
                resistance: resistance,
                vibration: vibration,
                ni: ni,
                pi: pi,
                ai: ai,
                ash: ash,
                buckleWaterRate: buckleWaterRate,
                ca: ca,
                description: description,
                fe: fe,
                images: images,
                na: na,
                particle: particle,
                ph: ph,
                va: va,
                productArea: productArea,
                reservePrice: reservePrice,
                si: si,
                su: su,
                totalQuantity: totalQuantity,
                inspectionReport: inspectionReport,
                volatiles: volatiles,
                water: water,
                label: cokeTypeIndex,
                peacoke:peacoke
            }, function (resp) {
                if (resp.code == 0) {
                    var html = '<h1>' + languagePackage['发布招标成功'] + '！</h1>' +
                        '<p>' + languagePackage['您成功发布了'] + ' <span>' + languagePackage[productArea] + ' ' + languagePackage['产地的'] + ' ' + totalQuantity + ' ' + languagePackage['吨'] + ' ' + languagePackage[petrolName] + '，'
                        + languagePackage['起拍价为'] + ' ' + reservePrice + ' ' + languagePackage['元/吨'] + ' ，</span>' + languagePackage['请注意查看'] + '。</p>' +
                        '<a href="p_bid_hall.html?type=1&petrolType=' + petrolType + '" id="at_tender_invitation_success" name="at_tender_invitation_success">'
                        + languagePackage['立即前往'] + languagePackage[petrolName] + languagePackage['大厅查看'] + ' >></a>'
                    var d = dialogOpt({
                        title: languagePackage['通知'],
                        class: 'bid-success',
                        content: html,
                        textOkey: languagePackage['确定'],
                        textOkeyId: 'at_tender_invitation_ok',
                        btnClass: 'btn1',
                        funcClose: function () {
                            window.location.href = 'p_bid_hall.html?type=1&petrolType=' + petrolType;
                        },
                        funcOkey: function () {
                            window.location.href = 'p_bid_hall.html?type=1&petrolType=' + petrolType;
                        }

                    })
                } else {
                    btnStatus = 0;
                    That.removeClass('btn-inverse').addClass('btn-primary');
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                btnStatus = 0;
                That.removeClass('btn-inverse').addClass('btn-primary');
                alertReturn(resp.exception);
            })
        })
    }

    /*处理图片--获取图片的宽高来添加样式*/
    tenderFunc.dealwithImg = function () {
        $('.png-box img').each(function () {
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

    /*处理图片--获取图片的宽高来添加样式*/
    tenderFunc.dealwithImg1 = function () {
        $('.upload-png img').each(function () {
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
    /*获取动态totailqueliy*/
    tenderFunc.getlimittotal = function () {
        interface.commonData({'type': 'MIN_BUY_QUANTITY'}, function (resp) {
            if (resp.code === 0) {
                limittotalQuantity = resp.data;
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }
    tenderFunc.init();

});
