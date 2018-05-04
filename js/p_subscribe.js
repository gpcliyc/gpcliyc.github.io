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
    var submitListFunc = {};
    var languagePackage = null;

    submitListFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.leftMenu();//左侧菜单
        this.basic();//基本信息
        this.followModule(1);//获取所有关注商家列表
    }

    /**
     * 基本信息
     */
    submitListFunc.basic = function () {
        $("#j_basic").html(template('t:j_basic'));
    }

    /**
     * 语言选择
     */
    submitListFunc.selectLanguage = function () {
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
    submitListFunc.leftMenu = function () {
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
    submitListFunc.followModule = function (page) {
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
                var tpl = template('t:j_subscribe', {
                    list: resp.data.content
                });
                $('#j-subscribe').html(tpl);

                $("#pagination").pagination(resp.data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: 12, // 每页显示的条目数
                    current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: submitListFunc.pageCallback
                });
                if (resp.data.totalPages == 1) {
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
                submitListFunc.bindFollow(); //绑定关注取消关注事件
            } else {
                $("#j-subscribe").html('<div class="no-data">'+languagePackage["没有相关关注信息"]+'</div>');
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, loading);
    }

    submitListFunc.pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        submitListFunc.followModule(page_id + 1);
    }

    //绑定关注取消关注事件
    submitListFunc.bindFollow = function () {
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
                        submitListFunc.followModule(1)
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function(resp) {
                    alertReturn(resp.exception);
                });
            }
        });
    }

    submitListFunc.template = function () {
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
    }

    submitListFunc.init();
});
