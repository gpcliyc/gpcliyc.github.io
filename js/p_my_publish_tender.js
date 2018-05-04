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
    var global = require("global");
    require("interface");
    require("pagination");
    var header = require("header");
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();//获取缓存登录
    var endTime;//倒计时结束时间
    var currentHour = new Date().getHours();//当前的小时
    var currentTime = new Date().getTime();//当前时间

    var publishTenderFunc = {};

    /**
     * 初始化倒计时所用变量*
     **/
    var endYear = new Date().getFullYear();
    var endMonth = new Date().getMonth() + 1;
    var endDay = new Date().getDate() + 1;
    var endHour;
    var endMinute;
    var stringTime;
    var languagePackage = null;

    /**
     *初始化*
     **/
    publishTenderFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();
        this.selectOpt();
        this.tenderList(1); //招标列表
        this.count();//我发布的招标各状态数量
    }

    /**
     * 语言选择
     */
    publishTenderFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_interNational/p_bid_hall.json',function (resp) {
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

    /**
     * 左边搜索条件翻译
     */
    publishTenderFunc.renderBlock = function () {
        $("#j_mod-menu").html(template('t:j_mod-menu'));
        $("#j_order_top").html(template('t:j_order_top'));
//        $("#j_orderListSeachBlock").html(template('t:j_orderListSeachBlock'));
    }

    /**
     *我发布的招标各状态数量*
     **/
    publishTenderFunc.count = function () {
        interface.publishCount(function (resp) {
            if (resp.code == 0) {
                $('.mod-menu .total').html(resp.data.total);
                $('.mod-menu .publicity').html(resp.data.publicity);
                $('.mod-menu .finish').html(resp.data.finish);
                $('.mod-menu .cancel').html(resp.data.cancel);
                $('.mod-menu .bidding').html(resp.data.bidding);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    publishTenderFunc.selectOpt = function () {
        //处理选择筛选--所有种类、所有产地
        $(".mod-menu .item li").on('click', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            publishTenderFunc.tenderList(1);
        });

        $('.publish-bid-type .supply').on('click', function () {
            var user = getUser().data;
            if(user.role == 3){
                alertReturn('您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。');
                return ;
            }
            if(user.role != 2 && user.role != 1){
                alertReturn('没有相关资质认证');
                return ;
            }
            if(user.role!=2){
                alertReturn('您不是管理员，没有权限发布招标');
                return ;
            }
            if (user.status == 3) {
                alertReturn('账号已被冻结');
                return ;
            }
            //公司是否已封停
            interface.companyDetail(function (resp) {
                if(resp.data.businessStatus == 2){
                    alertReturn('公司已封停，如有疑问请联系客服');
                    return ;
                }
                if (user.reputationValue < 0) {
                    //        alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
                    window.location.href = 'p_tender_invitation.html';
                } else {
                    window.location.href = 'p_tender_invitation.html';
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
//            interface.currentUserInfo(function (resp) {
//                var userInfo = resp.data;
//                if (userInfo.role != 2) {
//                    alertReturn('您还未进行资质认证');
//                } else {
//                    if (userInfo.role) {
//                        if (userInfo.role == 1 || userInfo.role == 3) {
//                            alertReturn('您不是管理员，没有权限发布招标');
//                        } else if (userInfo.role == 4) {
//                            alertReturn('您的资质认证还没有通过');
//                        } else {
//                            if(userInfo.status == 3){
//                                alertReturn('账号已被冻结');
//                            }else {
//                                if(userInfo.reputationValue < 0){
////                                    alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
//                                    window.location.href = 'p_tender_invitation.html';
//                                }else {
//                                    window.location.href = 'p_tender_invitation.html';
//                                }
//                            }                        }
//                    } else {
//                        alertReturn('您的资质认证还没有通过');
//                    }
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            });
        })

        $('.publish-bid-type .purchase').on('click', function () {
            var user = getUser().data;
            if(user.role == 3){
                alertReturn('您的员工权限已被禁用，如有问题，请联系您的认证公司负责人了解原因。');
                return ;
            }
            if(user.role != 2 && user.role != 1){
                alertReturn('没有相关资质认证');
                return ;
            }
            if(user.role!=2){
                alertReturn('您不是管理员，没有权限发布采购');
                return ;
            }
            if (user.status == 3) {
                alertReturn('账号已被冻结');
                return ;
            }
            //公司是否已封停
            interface.companyDetail(function (resp) {
                if(resp.data.businessStatus == 2){
                    alertReturn('公司已封停，如有疑问请联系客服');
                    return ;
                }
                if (user.reputationValue < 0) {
                    //        alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
                    window.location.href = 'p_release_purchase.html';
                } else {
                    window.location.href = 'p_release_purchase.html';
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
//            interface.currentUserInfo(function (resp) {
//                var userInfo = resp.data;
//                if (userInfo.role != 2) {
//                    alertReturn('您还未进行资质认证');
//                } else {
//                    if (userInfo.role) {
//                        if (userInfo.role == 1 || userInfo.role == 3) {
//                            alertReturn('您不是管理员，没有权限发布采购');
//                        } else if (userInfo.role == 4) {
//                            alertReturn('您的资质认证还没有通过');
//                        } else {
//                            if(userInfo.status == 3){
//                                alertReturn('账号已被冻结');
//                            }else {
//                                if(userInfo.reputationValue < 0){
////                                    alertReturn('抱歉，您当前信誉值不满足本次交易金额，相关规则请前往个人中心查看');
//                                    window.location.href = 'p_release_purchase.html';
//                                }else {
//                                    window.location.href = 'p_release_purchase.html';
//                                }
//                            }                        }
//                    } else {
//                        alertReturn('您的资质认证还没有通过');
//                    }
//                }
//            }, function (resp) {
//                alertReturn(resp.exception);
//            });
        })
    }

    /**
     *招标列表*
     **/
    publishTenderFunc.tenderList = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var loading = "loading";
        interface.publishTenderList({
                status: status,
                pageSize: 10,
                pageNum: pagenum
            }, function (resp) {
                if (resp.data.content.length > 0) {
                    $("#j_tender_list").html(template('t:j_tender_list', {list: resp.data.content, userList: user}));
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: publishTenderFunc.tenderList_pageCallback,
                        prev_text: languagePackage["上一页"],
                        next_text: languagePackage["下一页"]
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }

                    publishTenderFunc.dealwithImg();
                    publishTenderFunc.tenderListOptBtn();
                    publishTenderFunc.showCountDown();
                } else {
                    $("#j_tender_list").html('<div class="no-data">没有相关招标信息</div>');
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading
        )
    }

    publishTenderFunc.tenderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        publishTenderFunc.tenderList(page_id + 1);
    }

    /**
     *招标列表按钮*
     **/
    publishTenderFunc.tenderListOptBtn = function () {
        $('.btn-cancle.btn-primary').unbind('click').bind('click', function () {//取消招标
            var $this = $(this),
                tenderId = $this.parents('.item').attr('data-tenderId');
            //$this.removeClass('btn-primary').addClass('btn-inverse');

            var d = dialogOpt({
                title: languagePackage['提示'],
                class: 'cancle-bid',
                content: '<p>'+languagePackage['确定要取消该招标吗']+'？</p>',
                textOkey: languagePackage['确定'],
                textCancel: languagePackage['取消'],
                funcOkey: function () {
                    interface.cancleTender({
                        tenderId: tenderId
                    }, function (resp) {
                        if (resp.code == 0) {
                            alertReturn(languagePackage['取消成功']);
                            publishTenderFunc.count();
                            publishTenderFunc.tenderList();
                            //$this.closest(".con-top").find(".sign").removeClass("sign-show").addClass("sign-cancle");//将标左上角的公示中变成已取消...
                            //$this.remove();
                            d.remove();
                            setUser();
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            });
        });

        $('.item .detail .title,.item .bid-cover').on('click', function () {//点击标的标题和封面进入详情
            var $this = $(this);
            var tenderId = $this.parents('.item').attr('data-tenderId');
            var userId = $this.parents('.item').attr('data-userId');
            var type = $this.parents('.item').attr('data-bidType');//1:供应标；2：采购标；
            if (user && user.login && user.data.id == userId) {
                window.open('p_bid_detail_seller.html?tenderId=' + tenderId + '&type=' + type + '&from=publish');
            } else {
                window.open('p_bid_detail_buyer.html?tenderId=' + tenderId + '&type=' + type + '&from=publish');
            }

        })
        $('.again').on('click', function () {//点击标的标题和封面进入详情
            var $this = $(this);
            var tenderId = $this.parents('.item').attr('data-tenderId');
            var userId = $this.parents('.item').attr('data-userId');
            var type = $this.parents('.item').attr('data-bidType');//1:供应标；2：采购标；
            if (type==1) {
                window.open('p_tender_invitation.html?tenderId='+tenderId);
            } else {
                window.open('p_release_purchase.html?tenderId='+tenderId);
            }

        })
        $('.btn-sign').on('click', function () {
            window.open('p_contract.html?tab=1');//协议页面tab=0代表全部协议；tab=1代表待签协议；tab=2代表已签协议
        })
    }

    /**
     *处理图片--获取图片的宽高来添加样式*
     **/
    publishTenderFunc.dealwithImg = function () {
        $('.bid-cover img').each(function () {
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

    /*
     *渲染倒计时*
     **/
    publishTenderFunc.showCountDown = function () {
        $('.j-count').each(function () {
            var $this = $(this);
            var status = $this.parents(".item").attr("data-status");
            if(status == 2){
                var endTime = $this.html();
                countDown($(this), endTime);
                addColor();
            }
        });
    }


    /*倒计时*/
    function countDown(el, endTime) {
        var interval = new Date(endTime - new Date().getTime());
        if (interval.getTime() <= 0) {
           window.location.reload();
        } else {
            var h = Math.floor(interval / 1000 / 60 / 60 % 24);
            var m = Math.floor(interval / 1000 / 60 % 60);
            var s = Math.floor(interval / 1000 % 60);
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            el.text(h + ':' + m + ':' + s);

            setTimeout(function () {
                countDown(el, parseInt(endTime));

            }, 1000);
        }
    }
    //
    function addColor() {
        var bidCount = Number($(".bid_count").html());
        var $bid_end = $("#bid_end");
        console.log($bid_end);
        if(bidCount > 0){
            $bid_end.addClass("color-red")
        }

    }
    publishTenderFunc.template = function(){
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
        template.helper('returnZhengshu',function(obj){
            var z = returnZhengshu(obj);
            return z;
        });
    }

    publishTenderFunc.init();
})
;
