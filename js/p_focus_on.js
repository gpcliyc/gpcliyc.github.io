/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-30 14:44:43
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var http = require("http");
    var interfaces = require("interface");
    var paginations = require("pagination");
    var header = require("header");
    require('underscore-min');
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var followListFunc = {};
    var languagePackage = null;

    followListFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.leftMenu();//左侧菜单
        this.basic();//基本信息
        this.followModule(1);//获取所有关注商家列表
        this.followElementModule(1);//获取所有关注招标列表
        this.toggleTitle()
    }

    /**
     * 基本信息
     */
    followListFunc.basic = function () {
        $("#j_basic").html(template('t:j_basic'));
    }

    /**
     * 语言选择
     */
    followListFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_focus_onNational/p_focus_on.json',function (resp) {
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

    /*左侧菜单*/
    followListFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'我的关注'));
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /*获取所有关注商家列表*/
    followListFunc.followModule = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var loading = "loading";
        interface.followList({
            pageSize: 12,
            pageNum: pagenum
        },function (resp) {
            if (resp.data.content.length > 0) {
                var tpl = template('t:j_follow_company', {
                    list: resp.data.content
                });
                $('#j_follow_company').html(tpl);

                $("#pagination").pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 12, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: followListFunc.pageCallback
                });
                if (resp.data.totalPages == 1) {
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
                followListFunc.bindFollow(); //绑定关注取消关注事件
            } else {
                $("#j-follow").html('<div class="no-data">'+languagePackage["没有相关关注信息"]+'</div>');
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading);
    }

    /*获取所有关注招标列表*/
    followListFunc.followElementModule = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var loading = "loading";
        interface.followElementList({
            pageSize: 12,
            pageNum: pagenum
        },function (resp) {
            if (resp.data.content.length > 0) {
                var tpl = template('t:j_follow_element', {
                    list: resp.data.content
                });
                $('#j_follow_element').html(tpl);

                $("#pagination").pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 12, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: followListFunc.pageCallback
                });
                if (resp.data.totalPages == 1) {
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
                followListFunc.bindFollowElement(); //绑定关注招标事件
            } else {
                $("#j-follow").html('<div class="no-data">'+languagePackage["没有相关关注信息"]+'</div>');
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading);
    }

    followListFunc.pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        followListFunc.followModule(page_id + 1);
    }

    //绑定关注,取消关注事件
    followListFunc.bindFollow = function () {
        $('.focus_on').hover(function() {
            var _this = $(this);
            if (trim(_this.text()) == languagePackage['已关注']) {
                _this.text(languagePackage['取消关注']);
            }
        }, function() {
            var _this = $(this);
            if (trim(_this.text()) == languagePackage['取消关注']) {
                _this.text(languagePackage['已关注']);
            }
        });
        $('.focus_on').off('click').on('click', function(){
            var _this = $(this);
            var userId = _this.attr('data-masterId');
            if (trim(_this.text()) == languagePackage['关注']) {
                //关注
                interface.follow({
                    userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['已关注']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            } else if (trim(_this.text()) == languagePackage['取消关注']) {
                //取消关注
                interface.followCancel({
                    userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        // followListFunc.followModule(1)
                        _this.text(languagePackage['关注']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            }
        });
    }

    //followElement
    //绑定关注招标,取消关注招标事件
    followListFunc.bindFollowElement = function () {
        $('.focus_on').hover(function() {
            var _this = $(this);
            if (trim(_this.text()) == languagePackage['已关注']) {
                _this.text(languagePackage['取消关注']);
            }
        }, function() {
            var _this = $(this);
            if (trim(_this.text()) == languagePackage['取消关注']) {
                _this.text(languagePackage['已关注']);
            }
        });
        $('.focus_on_element').off('click').on('click', function(){
            var _this = $(this);
            var userId = _this.attr('data-masterId');
            if (trim(_this.text()) == languagePackage['关注']) {
                //关注
                interface.followElement({
                    // userId: userId
                }, function(resp) {
                    if (resp.code == 0) {
                        _this.text(languagePackage['已关注']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            } else if (trim(_this.text()) == languagePackage['取消关注']) {
                //取消关注
                console.log('cancel')
                interface.followElementCancel({
                    userId: userId
                }, function(resp) {
                    console.log(resp)
                    if (resp.code == 0) {
                        _this.text(languagePackage['关注']);
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            }
        });
    }
    function type(obj) {
        if(obj===1){
            return '供给标'
        }else if(obj===2){
            return '需求标'
        }
    }
    function labell(obj) {
        if(obj===1){
            return '海绵焦'
        }else if(obj===2){
            return '弹丸焦'
        }else if(obj===3){
            return '针状焦'
        }else if(obj===4){
            return '煅后石油焦'
        }else if(obj===5){
            return '增碳剂'
        }else if(obj===6){
            return '收尘粉'
        }else if(obj===7){
            return '冶金焦'
        }else if(obj===8) {
            return '铸造焦'
        }else if(obj===9) {
            return '铁合金焦'
        }else{
            return '有色金属冶炼焦'
        }
    }
    followListFunc.template = function () {
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
        template.helper('returnZhengshu', function (obj) {
            var z = returnZhengshu(obj);
            return z;
        });
        template.helper('type', function (obj) {

            return type(obj);
        });
        template.helper('labell', function (obj) {
            return labell(obj);
        });
    }

    followListFunc.toggleTitle = function (e) {
        $('.title span').on('click',function () {
            $(this).addClass('active')
            $(this).siblings().removeClass('active')

            if($(this).html()==="关注的企业"){
                $('#j_follow_company').removeClass('hide')
                $('#j_follow_element').addClass('hide')
            }else if($(this).html()==="关注的指标"){
                $('#j_follow_company').addClass('hide')
                $('#j_follow_element').removeClass('hide')
            }
        })
    }
    followListFunc.init();
});
