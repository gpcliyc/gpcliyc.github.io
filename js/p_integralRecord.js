/**
 * Created by like on 2017/9/1.
 */
define(function (require, exports, module) {
    var $ = require("jquery");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var global = require("global");
    var header = require("header");
    var common = require("common");
    require('underscore-min');
    require("interface");
    require("pagination");
    require("http");
    require('bootstrap');
    require("floatTool");//去除js运算精度问题
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    var goodsConvert = {};
    var languagePackage = null;
    var user = getUser(),
    settings = {
        order: "",
        pageNum: 1,
        pageSize: 10,
        sort: ""
    },
    p_integralRecord = {
        init: function () {
            var me = this;
            interface.integralList(settings, function (resp) {
                if (resp.code === 0) {
                    data = resp.data;
                    me.helperTemplate();
                    me.selectLanguage();
                    me.renderBlock();
                    me.showTable(data);
                    me.showNavTitle(data);

                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            })
        },
        showNavTitle:function () {
         $("#nav-title").html(template('t:nav-title', {list: data.content}));
        },
        helperTemplate:function () {
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
          template.helper('getType',function (type) {
              switch (type){
                  //:1兑换商品,2首次登陆,3企业认证,4每日登陆,5发标招标,6参与招标,7订单成交,8邀请注册,9邀请注册,10员工认证
                  case 1:
                      return languagePackage['兑换商品'];
                  case 2:
                      return languagePackage['首次登录'];
                  case 3:
                      return languagePackage['企业认证'];
                  case 4:
                      return languagePackage['每日登录'];
                  case 5:
                      return languagePackage['发标招标'];
                  case 6:
                      return languagePackage['参与招标'];
                  case 7:
                      return languagePackage['订单成交'];
                  case 8:
                      return languagePackage['邀请注册'];
                  case 9:
                      return languagePackage['邀请认证'];
                  case 10:
                      return languagePackage['员工认证'];
                  case 11:
                      return languagePackage['取消招标'];
                  default:
                      return "";
              }
          });
            template.helper('numberStr',function (integrals) {
                var integrals = Number(integrals)>Number(0)?"+"+integrals:integrals;
                return integrals;
            });
            template.helper('transformTime',function (value) {
                return dateHoursMinFormat(value);
            });
        },
       renderBlock:function () {
        $("#goods_rule_title").html(template('t:goods_rule_title'));
        $("#rule_content_title").html(template('t:rule_content_title'));
        },
       selectLanguage:function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_integral_mallNational/p_integral_mall.json',function (resp) {
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
    },
        showTable:function (data) {
            var me = this ;
            var sumintegrals = 0;
            if (data.content.length > 0) {
                if(user.data.integrals){
                    sumintegrals= user.data.integrals;
                }
                $("#integralTable").html(template('t:integralTable', {list: data.content,sumintegrals:sumintegrals}));
                $("#pagination").pagination(data.totalElements, {
                    num_edge_entries: 3,//此属性控制省略号后面的个数
                    num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                    items_per_page: settings.pageSize, // 每页显示的条目数
                    current_page: settings.pageNum-1,//当前选中的页面,可选参数，默认是0，表示第1页
                    callback: me.pageCallback
                });
                if (data.totalPages == 1) {
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            } else {
                $("#integralTable").html('<div class="no-data">'+languagePackage['没有相关焦币记录']+'</div>');
                $('#pagination').html('');
                $('#pageNum').val(1);
            }
        },
        pageCallback : function (page_id) {
            settings.pageNum = page_id+1;
            $("#pageNum").val(settings.pageNum );
            p_integralRecord.init();
        }
    };
    p_integralRecord.init();
});
