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
    var global = require("global");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var noticeId = request('noticeId');
    var user = getUser();

    var tab = request('tab');
    $('.notice-detail .title a').attr('href','p_notice.html?tab='+tab);

    var noticetDetailFunc = {};
    /*初始化*/
    noticetDetailFunc.init = function () {
        this.detail();
    }

    noticetDetailFunc.detail = function () {
        interface.niticeDetail({
            id: noticeId
        }, function (resp) {
            if (resp.code == 0) {
                $("#j_detail").html(template('t:j_detail', {list: resp.data}));
                noticetDetailFunc.deleteMsg();
                if (resp.data.status == 1) {
                    noticetDetailFunc.opt();
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    noticetDetailFunc.deleteMsg = function () {
        $("#deleteMsg").off('click').on('click',function (e) {
             interface.batchDeal({
                ids:[Number(request('noticeId'))],
                type:"2"
            },function (resp) {
                if(resp.code===0){
                    alertReturn("删除成功");
                    setTimeout(function () {
                        window.location.href = "p_notice.html?tab=";
                    },2000);
                }else{
                    alertReturn(resp.exception);
                }
            },function (resp) {
                alertReturn(resp.exception);
            })
        })
    }
    noticetDetailFunc.opt = function () {
        interface.updateRead({//更新未读消息
            id: noticeId
        }, function (resp) {
            if (resp.code == 0) {
                var unReadNumber = Number($('.remind .dot').text());
                if (unReadNumber > 0) {
                    $('.remind .dot').html(unReadNumber - 1);
                }
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    noticetDetailFunc.init();
});
