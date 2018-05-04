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
    var global = require("global");
    var interfaces = require("interface");
    var paginations = require("pagination");
    var header = require("header");
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var user = getUser();
    var couponsListFunc = {};

    couponsListFunc.init = function () {
        this.leftMenu();//左侧菜单
        this.coupons();//优惠券列表
        this.template();
    }

    /*左侧菜单*/
    couponsListFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,'优惠券'));
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }


    /*优惠券*/
    couponsListFunc.coupons = function () {
        interface.couponsList({
            userId: user.data.id
        }, function (resp) {
            if (resp.code == 0) {
            var tpl = template('t:coupons-list', {
                list: resp.data.content
            });
            $('#coupons-list').html(tpl);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    couponsListFunc.template = function () {
    	  /**
    	   * 根据金额、状态判断样式class
    	   */
    	  template.helper('getDlClass', function (coupon) {
    	      if(coupon.status==3){
    	  				return "overdue";
          	}
    	  		if(coupon.amount==20){
    	  			return "twenty";
    	  		}
    	  		if(coupon.amount==20){
    	  			return "twenty";
    	  		}
    	  		if(coupon.amount==15){
    	  			return "fifteen ";
    	  		}
          	return "";
    	  });
    	  /**
    	   * 获取支付类型
    	   */
    	  template.helper('getUseType', function (useType) {
    	  	if(useType==1){
    	  		return "线上支付";
    	  	}
    	  	if(useType==2){
    	  		return "线下支付";
    	  	}
    	  	if(useType==3){
    	  		return "线上/线下支付";
    	  	}
    	  	return "";
    	  });
    }

    couponsListFunc.init();
});
