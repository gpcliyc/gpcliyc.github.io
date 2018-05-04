/**
 * @authors sfj
 * @date    2016-08-28
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("../common");
    var analytics = require("../analytics");
    var http = require("../httpClient");
    require("../interface");
    var template = require("artTemplate");
    require('thJsCallWx');
    //
    var formInfo = {
        company: "",
        name: '',
        position: '',
        mobile: ''
    }
    var formObj = {};
    formObj.init = function () {
        this.initializeData()
        this.submitForm(1)
        this.closeResponse()
        this.wxFengxiang()
    }
    //初始化数据
    formObj.initializeData = function () {
        interface.companyList({}, function (resp) {
            if (resp.code == 0) {
                var selectTpl = template("t:selectCompany", {list: resp.data.content})
                $('#editable-select').html(selectTpl)
                $('#editable-select').editableSelect({
                    effects: 'slide'
                });
                $('#editable-select').removeClass('hide')
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        }, false);

    }
    //获取表单信息
    formObj.getFormInfo = function (formInfo) {
        formInfo.company = $('#editable-select').val()
        formInfo.name = $('#name').val() || '';
        formInfo.position = $('#position').val() || '';
        formInfo.mobile = $('#mobile').val() || '';
    }
    //表单验证
    formObj.isValidated = function () {
        if (!formInfo.company) {
            $('.error').html('请选择公司');
            return false;
        }
        if (!formInfo.name) {
            $('.error').html('请输入姓名');
            return false;
        }
        if (!formInfo.mobile) {
            $('.error').html('请输入联系电话');
            return false;
        } else if (!matchMobile(formInfo.mobile)) {
            $('.error').html('手机号格式不正确');
            return false;
        }
        return true
    }
    //表单提交
    formObj.submitForm = function (activeType) {
        $('.submit').on('click', function () {
            formObj.getFormInfo(formInfo)        //获取表单信息
            if (formObj.isValidated()) {         //验证表单信息
                interface.addActivityCompany({
                    companyName: formInfo.company,
                    legal: formInfo.name,
                    position: formInfo.position,
                    mobile: formInfo.mobile,
                    type: activeType
                }, function (resp) {
                    if (resp.code === 0) {
                        $('.box').removeClass('hide');
                        $('#editable-select').val('')
                        $('#name').val('')
                        $('#position').val('')
                        $('#mobile').val('')
                    }
                }, function (resp) {

                })
            }
        })
    }
    //获取活动页activeType

    //关闭反馈弹框
    formObj.closeResponse = function () {
        $('.close').on('click', function () {
            $('.box').addClass('hide')
        })
    }
    formObj.wxFengxiang = function () {
        /*微信端右上角分享*/
        if (isWXBrowser()) {
            thJsCallWx.callWx({
                title: '焦易网—找货篇！', // 分享标题
                desc: '电话打到爆，货还找不到？焦易来帮你！', // 分享内容
                link: window.location.href,//分享链接：当前页
                imgUrl: window.location.origin + '/images/activity/one.png' //分享时显示图片
            });
        }
    }
    formObj.init()
});

