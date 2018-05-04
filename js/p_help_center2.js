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

    var user = getUser();
    var helpFunc = {};
    /*初始化*/
    helpFunc.init = function () {
        this.rander();
        this.changeHelpcenter()

    }
    // 根据不同queryType加载模版内容 queryType: 1:login , 2:insurance
    helpFunc.rander = function(){
        var queryType = requestParas('type')
        if(queryType==1){
            $("#login_process").addClass('active').siblings().removeClass('active');
            $("#help_center").html(template('t:loginProcess', {}));
        } else if(queryType==2){
            $("#buy_insurance").addClass('active').siblings().removeClass('active');
            $("#help_center").html(template('t:howBuyinsurance', {}));
        }
    }
    //点击目录，切换不同模版内容
    helpFunc.changeHelpcenter = function () {
        $(".mod-menu .item li").on('click', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            if ($this.context.id==='login_process'){
                $("#help_center").html(template('t:loginProcess', {}));
            }else if($this.context.id==='buy_insurance'){
                $("#help_center").html(template('t:howBuyinsurance', {}));
            }
        });
    }

    helpFunc.init();
});
