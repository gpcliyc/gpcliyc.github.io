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
    var findGoods = {};
    findGoods.init = function(){
        this.selectDate()
        this.submit()
    }
    findGoods.selectDate = function () {

        interface.companyList( {},function (resp) {
            if (resp.code == 0) {
                var selectTpl = template("t:selectCompany",{list:resp.data.content})
                $('#selectCompany').html(selectTpl)
                console.log($('#selectCompany').html())
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        });
    }
    findGoods.submit = function () {
        $('.submit').on('click',function () {
            var company = $('#selectCompany').val() || '';
            var name = $('#name').val() || '';
            var position = $('#position').val() ||'';
            var mobile = $('#mobile').val() || '';
            console.log('findGoods')
            interface.addActivityCompany({
                companyName:company,
                legal:name,
                position:position,
                mobile:mobile,
                type:1
            },function (resp) {
                console.log(resp)
            },function (resp) {
            })

        })
    }
    findGoods.init()
});

