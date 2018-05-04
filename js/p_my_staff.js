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
    header.showHeader();
    header.showFooter();
    header.serviceOnline();
    require('underscore-min');
    var languagePackage = null;
    var user = getUser();
    var staffFunc = {};
    var transfer_select = '';//转让权限备选人员列表
    var transferArr = [];//转让权限详情数组
    var is_role_manager = false;//用来判断是否是管理员
    staffFunc.init = function () {
        this.template();
        this.leftMenu();//左侧菜单
        this.operation();
        this.staffList();//员工列表
        this.selectLanguage();
        this.showManagerInfo();

    }
    /*选择语言*/
    staffFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_my_staffNational/p_my_staff.json',function (resp) {
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
    staffFunc.leftMenu = function () {
        /*获取当前用户信息*/
        interface.currentUserInfo(function (resp) {
            if (resp.code == 0) {
                var leftMenu = require('../js/component/leftMenu/leftMenu.js');//左侧菜单
                $("#j_modMenu").html(leftMenu.leftShow(resp.data,languagePackage['员工列表']));
                // $('#j_modMenu').html(template('t:j_modMenu', {data: resp.data}));//左侧菜单
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    /*操作按钮*/
    staffFunc.operation = function () {
        $('.find').on('click', function () {//查询按钮
            staffFunc.staffList();
        });

        $(document).keyup(function (event) {//回车查询按钮
            if (event.keyCode == 13) {
                $('.find').click();
            }
        });

        $('.reset').on('click', function () {//重置按钮
            $('.username').val('');
            $('.mobile').val('');
            $('.department').val('');
            $('.status').val('');
            staffFunc.staffList();
        });
    }

    staffFunc.staffList = function (page) {
        interface.currentUserInfo(function (resp) {
            var userList = resp.data;
            if(userList){
                if(userList.role == 2){
                    is_role_manager = true;
                }else{
                    is_role_manager = false;
                    $(".transfer-limit").addClass("hide");
                }
            }
            var pagenum;
            if (page) {
                pagenum = page;
            } else {
                pagenum = $("#pageNum").val();
            }

            var username = $('.username').val();
            var mobile = $('.mobile').val();
            var department = $('.department').val();
            var status = $('.status').val();
            var loading = "loading";
            interface.employeesList({
                pageNum: 0,
                pageSize: 0,
                role: 1,
            },function(resp){
                if(resp.code == 0){
                    if (resp.data.content && resp.data.content.length > 0){
                        if(is_role_manager){
                            $(".transfer-limit").removeClass("hide");
                            transferArr = resp.data.content;
                            var transStr = '';
                            for(var i=0;i<resp.data.content.length;i++){
                                transStr += '<option value="'+resp.data.content[i].id+'">'
                                    +resp.data.content[i].nickname;
                                if(resp.data.content[i].position){
                                    transStr += '-'+resp.data.content[i].position
                                }
                                transStr += '</option>';

                            }
                            if(transStr){
                                transfer_select = transStr;
                            }
                        }

                    }else{
                        $(".transfer-limit").addClass("hide");
                    }
                }else {
                    alertReturn(resp.exception);
                }
            })
            interface.employeesList({
                position: department,
                mobile: mobile,
                pageNum: pagenum,
                pageSize: 10,
                role: status,
                nickname: username
            }, function (resp) {
                if (resp.code == 0) {
                    if (resp.data.content && resp.data.content.length > 0) {
                        $("#j_employeesList").html(template('t:j_employeesList', {
                            list: resp.data.content,
                            userList: userList
                        }));
                        $("#pagination").pagination(resp.data.totalElements, {
                            num_edge_entries: 3,//此属性控制省略号后面的个数
                            num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                            items_per_page: 10, // 每页显示的条目数
                            current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                            callback: staffFunc.tenderList_pageCallback
                        });
                        if (resp.data.totalPages == 1) {
                            $('#pagination').html('');
                            $('#pageNum').val(1);
                        }
                        staffFunc.listOpt();//操作
                    } else {
                        $("#j_employeesList").html("<tr><td colspan='7' class='tc color-9d fts-14'>暂无员工信息</td></tr>");
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading)
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    staffFunc.tenderList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        staffFunc.staffList(page_id + 1);
    }

    /*操作*/
    staffFunc.listOpt = function () {
        $('.operate.btn').hover(function () {
            var $this = $(this);
            $this.siblings('.opt-list-wrap').show();
        }, function () {
            var $this = $(this);
            $this.siblings('.opt-list-wrap').hide();
        })

        $('.opt-list-wrap').hover(function () {
            var $this = $(this);
            $this.show();
        }, function () {
            var $this = $(this);
            $this.hide();
        })

        $('.operate.agree').on('click', function () {
            var $this = $(this);
            var userId = $this.parents('tr').attr('data-userId');
            var userName = $this.parents('tr').attr('data-userName');
            if($this.text()==="audit"){
                var html = '<p>Agree with the employee to join our company？</p>';
                var d = dialogOpt({
                    title: 'prompt',
                    class: 'staff-opt',
                    content: html,
                    textOkey: 'agree',
                    textCancel: 'disagree',
                    closeClass: 'close',
                    funcOkey: function () {
                        interface.dealWithApply({
                            userId: userId,
                            type: 1
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('Agreed' + userName + 'Joining the company');
                                staffFunc.staffList();
                                d.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    },
                    funcCancel: function () {
                        interface.dealWithApply({
                            userId: userId,
                            type: 0
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('不同意' + userName + '加入公司');
                                staffFunc.staffList();
                                d.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    },
                    funcClose: function () {

                    }
                })
            }else if($this.text()==="审核"){
                var html = '<p>是否同意该员工加入公司？</p>';
                var d = dialogOpt({
                    title: '提示',
                    class: 'staff-opt',
                    content: html,
                    textOkey: '同意',
                    textOkeyId: 'at_ms_okid',
                    textCancel: '不同意',
                    textCancelId: 'at_ms_canid',
                    closeClass: 'close',
                    closeId: 'at_ms_closeid',
                    funcOkey: function () {
                        interface.dealWithApply({
                            userId: userId,
                            type: 1
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('已同意' + userName + '加入公司');
                                staffFunc.staffList();
                                d.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    },
                    funcCancel: function () {
                        interface.dealWithApply({
                            userId: userId,
                            type: 0
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('不同意' + userName + '加入公司');
                                staffFunc.staffList();
                                d.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    },
                    funcClose: function () {

                    }
                })
            }

        })
        /*
        **转让权限
         */
        $('.theme .transfer-limit').on('click',function () {
            var $this = $(this);
            if($this.text()==="转让权限"){
                var transHtml = '<div class="trans_Area"><div><span class="trans_title">授权：</span><select class="common_value">'+transfer_select+'</select></div>'+
                    '<p class="trans_detail">注：当前仅能存在一个管理员，转让管理员权限后您将失去管理权限。</p></div>';
                var d1 = dialogOpt({
                    title: '转让权限',
                    class: 'staff-opt',
                    content: transHtml,
                    textOkey: '提交',
                    textOkeyId: 'at_ms_tf_okid',
                    textCancel: '取消',
                    textCancelId: 'at_ms_tf_canid',
                    closeId: 'at_ms_tf_closeid',
                    funcOkey: function () {
                        var common_value = $(".common_value").val();
                        var common_content = '';
                        if(common_value){
                            for(var i=0;i<transferArr.length;i++){
                                if(transferArr[i].id ==common_value ){
                                    common_content = transferArr[i].nickname;
                                    if(transferArr[i].position){
                                        common_content += '-'+transferArr[i].position;
                                    }
                                }
                            }
                            d1.remove();
                            var transCommitHtml = '<div class="transfer_commit">您确认将管理员权限转让给 “'+common_content+'”吗？</div>';
                            var d2 = dialogOpt({
                                title:'通知',
                                class:'staff-opt',
                                content:transCommitHtml,
                                textOkey: '确认',
                                textOkeyId: 'at_ms_so_okid',
                                textCancel: '取消',
                                textCancelId: 'at_ms_so_canid',
                                closeId: 'at_ms_so_colsed',
                                funcOkey:function () {
                                    interface.authorization({
                                        userId:common_value
                                    },function (resp) {
                                        if(resp.code == 0){
                                            alertReturn('转让权限成功');
                                            //更新缓存用户信息
                                            setUser();
                                            staffFunc.init();
                                            d2.remove();
                                        }else{
                                            alertReturn(resp.exception);
                                        }
                                    },function (resp) {
                                        alertReturn(resp.exception);
                                    })
                                }
                            })
                        }else{
                            alertReturn('请选择转让权限员工');
                        }

                    }
                })
            }else if($this.text()==="Transfer of authority"){
                var transHtml = '<div class="trans_Area"><div><span class="trans_title">authorization：</span><select class="common_value">'+transfer_select+'</select></div>'+
                    '<p class="trans_detail">Note: the current can only exist an administrator, you will lose administrative authority after transfer administrator privileges.</p></div>';
                var d1 = dialogOpt({
                    title: 'Transfer of authority',
                    class: 'staff-opt',
                    content: transHtml,
                    textOkey: 'submit',
                    textCancel: 'cancel',
                    funcOkey: function () {
                        var common_value = $(".common_value").val();
                        var common_content = '';
                        if(common_value){
                            for(var i=0;i<transferArr.length;i++){
                                if(transferArr[i].id ==common_value ){
                                    common_content = transferArr[i].nickname;
                                    if(transferArr[i].position){
                                        common_content += '-'+transferArr[i].position;
                                    }
                                }
                            }
                            d1.remove();
                            var transCommitHtml = '<div class="transfer_commit">Are you sure you assigning the administrator privileges “'+common_content+'”？</div>';
                            var d2 = dialogOpt({
                                title:'notice',
                                class:'staff-opt',
                                content:transCommitHtml,
                                textOkey: 'sure',
                                textCancel: 'cancel',
                                funcOkey:function () {
                                    interface.authorization({
                                        userId:common_value
                                    },function (resp) {
                                        if(resp.code == 0){
                                            alertReturn('Transfer of rights success');
                                            //更新缓存用户信息
                                            setUser();
                                            staffFunc.init();
                                            d2.remove();
                                        }else{
                                            alertReturn(resp.exception);
                                        }
                                    },function (resp) {
                                        alertReturn(resp.exception);
                                    })
                                }
                            })
                        }else{
                            alertReturn('Please select a transfer authority employees');
                        }

                    }
                })
            }
        })
        $('.opt-list-wrap li').on('click', function () {
            var $this = $(this);
            var userId = $this.parents('tr').attr('data-userId');
            if ($this.text() == '启用') {
                var html = '<p>确定要启用该成员？</p>';
                var d2 = dialogOpt({
                    title: '提示',
                    class: 'staff-opt',
                    content: html,
                    textOkey: '确认',
                    textOkeyId: 'at_ms_okid2',
                    textCancel: '取消',
                    textCancelId: 'at_ms_canceid2',
                    closeId: 'at_ms_closeid2',
                    funcOkey: function () {
                        interface.activeEmployees({
                            userId: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('已成功启用该成员');
                                staffFunc.staffList();
                                d2.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            } else if ($this.text() == 'reset') {
                var html= '<p>Sure you want to enable the members？</p>';
                var d2 = dialogOpt({
                    title: 'prompt',
                    class: 'staff-opt',
                    content: html,
                    textOkey: 'sure',
                    textOkeyId: 'sureId',
                    textCancel: 'cancel',
                    textCancelId: 'cancelId',
                    clolseId: 'closeId',
                    funcOkey: function () {
                        interface.activeEmployees({
                            userId: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('To enable the members successfully');
                                staffFunc.staffList();
                                d2.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            }else if ($this.text() == 'forbidden') {
                var html1 = '<p>Sure you want to forbide the members？</p>';
                var d1 = dialogOpt({
                    title: 'prompt',
                    class: 'staff-opt',
                    content: html1,
                    textOkey: 'sure',
                    textOkeyId: 'sureId2',
                    textCancel: 'cancel',
                    textCancelId: 'cancelId2',
                    closeId: 'closeId2',
                    funcOkey: function () {
                        interface.disableEmployees({
                            userId: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('Disable the members successfully');
                                staffFunc.staffList();
                                d1.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            } else if ($this.text() == '禁用') {
                var html1 = '<p>确定要禁用该成员？</p>';
                var d1 = dialogOpt({
                    title: '提示',
                    class: 'staff-opt',
                    content: html1,
                    textOkey: '确认',
                    textOkeyId: 'at_ms_okid3',
                    textCancel: '取消',
                    textCancelId: 'at_ms_canid3',
                    closeId: 'at_ms_closeid3',
                    funcOkey: function () {
                        interface.disableEmployees({
                            userId: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('已成功禁用该成员');
                                staffFunc.staffList();
                                d1.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            } else if ($this.text() == 'modify') {
                var modifyHtml = '<div class="modifyBox">\
                             <ul>\
                                <li>\
                                   <label>department*：</label>\
                                   <input class="o-department" type="text" maxlength="10" id="at_ms_modify_deprat" name="at_ms_modify_deprat"/>\
                                </li>\
                                <li>\
                                    <label>Post information*：</label>\
                                    <input class="position" type="text" maxlength="10" id="at_ms_modify_position" name="at_ms_modify_position"/>\
                                </li>\
                             </ul>\
                          </div>';
                var d2 = dialogOpt({
                    title: 'Modify the data',
                    class: 'staff-modify',
                    content: modifyHtml,
                    textOkey: 'sure',
                    textOkeyId: 'modify_sureId',
                    textCancel: 'cancel',
                    textCancelId: 'modify_cancelId',
                    closeId: 'modify_closeId',
                    funcOkey: function () {
                        var position = trim($('.position').val());
                        var department = trim($('.o-department').val());
                        if (!position && !department) {
                            alertReturn('To modify the information cannot be empty');
                            return false;
                        }
                        interface.modifyOtherInfo({
                            position: position,
                            department: department,
                            id: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('Modify the success');
                                staffFunc.staffList();
                                d2.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            }else if ($this.text() == '修改') {
                var modifyHtml = '<div class="modifyBox">\
                             <ul>\
                                <li>\
                                   <label>所在部门*：</label>\
                                   <input class="o-department" type="text" maxlength="10" id="at_ms_xg_depart" name="at_ms_xg_depart"/>\
                                </li>\
                                <li>\
                                    <label>岗位信息*：</label>\
                                    <input class="position" type="text" maxlength="10" id="at_ms_xg_position" name="at_ms_xg_position"/>\
                                </li>\
                             </ul>\
                          </div>';
                var d2 = dialogOpt({
                    title: '修改数据',
                    class: 'staff-modify',
                    content: modifyHtml,
                    textOkey: '确认',
                    textOkeyId: 'sureOkeyId',
                    textCancel: '取消',
                    textCancelId: 'sureCanId',
                    closeId: 'sureColseId',
                    funcOkey: function () {
                        var position = trim($('.position').val());
                        var department = trim($('.o-department').val());
                        if (!position && !department) {
                            alertReturn('要修改的信息不能为空');
                            return false;
                        }
                        interface.modifyOtherInfo({
                            position: position,
                            department: department,
                            id: userId
                        }, function (resp) {
                            if (resp.code == 0) {
                                alertReturn('修改成功');
                                staffFunc.staffList();
                                d2.remove();
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        })
                    }
                })
            }
        })
    }

    /**/
    staffFunc.showManagerInfo = function (resp) {

        $('#manager').html(template('t:e_manager'));

        $('#e_order').html(template('t:e_order'));
        $('#e_info').html(template('t:e_info'));

    }
    /**
     * 模板数据处理方法方法
     */
    staffFunc.template = function () {

        template.helper('setLanguagePackage',function (key) {
            if(key in languagePackage){

                return languagePackage[key];
            }
        })

    }
    staffFunc.init();
});
