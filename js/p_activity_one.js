/**
 * @authors sfj
 * @date    2016-08-28
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var http = require("http");
    require("interface");
    var template = require("artTemplate");
    require('thJsCallWx');
    var findGoods = {};
    findGoods.init = function(){
        this.selectDate()
        this.submit()
        this.close()
        this.wxFengxiang()
    }
    findGoods.selectDate = function () {
        interface.companyList( {},function (resp) {
            if (resp.code == 0) {
                var selectTpl = template("t:selectCompany",{list:resp.data.content})
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
    findGoods.submit = function () {
        $('.submit').on('click',function () {
            var company = $('#editable-select').val()
            var name = $('#name').val() || '';
            var position = $('#position').val() ||'';
            var mobile = $('#mobile').val() || '';
            $('.error').html('');
            if (!company) {
                $('.error').html('请选择公司');
                return false;
            }
            if (!name) {
                $('.error').html('请输入姓名');
                return false;
            }
            if (!mobile) {
                $('.error').html('请输入联系电话');
                 return false;
             }else if (!matchMobile(mobile)) {
                $('.error').html('手机号格式不正确');
                return false;
            }
            interface.addActivityCompany({
                companyName:company,
                legal:name,
                position:position,
                mobile:mobile,
                type:1
            },function (resp) {
                if(resp.code === 0){
                    $('.box').removeClass('hide');
                    $('#editable-select').val('')
                    $('#name').val('')
                    $('#position').val('')
                    $('#mobile').val('')

                }
            },function (resp) {
            })

        })
    }
    findGoods.close = function () {
        $('.close').on('click',function (){
            $('.box').addClass('hide')
        })
    }
    findGoods.wxFengxiang = function () {
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
    findGoods.init()
    // console.log($('.selectpicker').selectpicker())
    // $('.selectpicker').selectpicker();
    // $(".selectpicker").append('<option class="hidden">123</option><option class="hidden">323</option>');
});

