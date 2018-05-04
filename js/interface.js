/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-10-14 12:44:43
 */

/*所有接口*/
var interface = {};
//注册－－发送手机验证码
interface.smsSendSms = function (para, success, error) {
    ajax_general({
        action: '/sms/userRegister/' + para.mobile,
        type: 'GET'
    }, null, success, error);
}

//注册
interface.userRegister = function (para, success, error) {
    ajax_general({action: '/user/register'}, para, function (res) {
        setUser({login:true,firstRegister:true,data:{accessToken:res.data}}, success);
    }, error)
}

//登录
interface.userLogin = function (para, success, error) {
    ajax_general({action: '/user/login'}, para, function (res) {
        setUser({login:true,data:{accessToken:res.data}}, success);
    }, error);
}

//竞价大厅--标列表
interface.bidList = function (para, success, error, loading) {
    ajax_general({action: '/tender/queryTenderList', type: 'POST'}, para, success, error, loading);
}

//资质认证
interface.certify = function (para, success, error) {
    ajax_general({action: '/company/applyRegister', type: 'POST'}, para, success, error);
}

//退出
interface.userLogout = function (para, success, error) {
    ajax_general({action: '/user/logout', login: true, type: 'GET'}, para, function (res) {
//        localStorage.removeItem("companyList");
//        localStorage.removeItem("applicationList");
//        localStorage.clear();
//        setUser({login: false});
        success(res);
    }, error);
}

//竞价大厅--参与
interface.participation = function (para, success, error) {
    ajax_general({action: '/tender/collect/' + para.id, type: 'GET'}, para, success, error);
}

//发布招标
interface.publishTender = function (para, success, error) {
    ajax_general({action: '/tender/publishTender', type: 'POST'}, para, success, error);
}

//我发布的招标
interface.publishTenderList = function (para, success, error, loading) {
    ajax_general({action: '/tender/queryMyPublishTender', type: 'POST'}, para, success, error, loading);
}

//我发布的招标各状态数量
interface.publishCount = function (success, error) {
    ajax_general({action: '/tender/queryMyPublishTenderCount', type: 'GET'}, null, success, error);
}

//我参与的招标
interface.collectTenderList = function (para, success, error, loading) {
    ajax_general({action: '/tender/queryMyCollectTender', type: 'POST'}, para, success, error, loading);
}

//我参与的招标各状态数量
interface.collectCount = function (success, error) {
    ajax_general({action: '/tender/queryMyCollectTenderCount', type: 'GET'}, null, success, error);
}

//历史招标各状态数量
interface.historyCount = function (success, error) {
    ajax_general({action: '/tender/queryHistoryTenderTypeCount', type: 'GET'}, null, success, error);
}

//历史招标
interface.historyTenderList = function (para, success, error, loading) {
    ajax_general({action: '/tender/queryHistoryTender', type: 'POST'}, para, success, error, loading);
}

//我的订单列表
interface.orderList = function (para, success, error, loading) {
    ajax_general({action: '/order/list', type: 'POST'}, para, success, error, loading);
}

//我的订单列表各状态数量
interface.orderCount = function (para, success, error) {
    ajax_general({action: '/order/queryStatusCount', type: 'POST'}, para, success, error);
}

//订单详情
interface.orderDetail = function (para, success, error) {
    ajax_general({action: '/order/details/' + para.orderId, type: 'POST'}, para, success, error);
}

//查询提货记录
interface.deliveryList = function (para, success, error) {
    ajax_general({action: '/order/queryDelivery/' + para.orderId, type: 'GET'}, para, success, error);
}

//查询提货记录详情
interface.deliveryDetailList = function (para, success, error) {
    ajax_general({action: '/order/queryDeliveryDetail/' + para.id, type: 'GET'}, para, success, error);
}

//删除提货记录
interface.deliveryListDel = function (para, success, error) {
    ajax_general({action: '/order/delDelivery/' + para.id, type: 'GET'}, para, success, error);
}

/**
 * 线上支付-买家验收提货单
 */
interface.ensureDelivery = function (para, success, error) {
    ajax_general({action: '/order/ensureDelivery/' + para.id, type: 'GET'}, para, success, error);
}

//获取当前用户信息
interface.currentUserInfo = function (success, error, _async) {
    ajax_general({action: '/user/info', type: 'GET', async: _async}, null, success, error);
}

//修改当前用户信息
interface.updateCurrentUser = function (para, success, error) {
    ajax_general({action: '/user/update', type: 'POST'}, para, success, error);
}
//获取当前用户客户经理
interface.clientManager = function (success, error) {
        ajax_general({action: '/user/clientManager', type: 'GET'},null,success, error);
    }
//招标详情
interface.tenderDetail = function (para, success, error, _async) {
    ajax_general({action: '/tender/detail/' + para.id, type: 'GET', async: _async}, para, success, error);
}

//出价验证
interface.bidTenderValite = function (para, success, error) {
    ajax_general({action: '/tender/bidTenderValite', type: 'POST'}, para, success, error);
}
//出价
interface.bidTender = function (para, success, error) {
	ajax_general({action: '/tender/bidTender', type: 'POST'}, para, success, error);
}

//竞价列表
interface.bidTenderList = function (para, success, error, loading) {
    ajax_general({action: '/tender/queryBidTenderList', type: 'POST'}, para, success, error, loading);
}

//公共数据管理
interface.commonData = function (para, success, error, _async) {
    ajax_general({action: '/common/getParaValue/' + para.type, type: 'GET', async: _async}, para, success, error);
}

//员工列表
interface.employeesList = function (para, success, error, loading) {
    ajax_general({action: '/user/employees', type: 'POST'}, para, success, error, loading);
}
//公司详情，以及历史申请认证记录
interface.companyDetail = function (success, error) {
    ajax_general({action: '/company/detail', type: 'GET'}, null, success, error);
}

//公司详情
interface.companyInfo = function (success, error) {
	ajax_general({action: '/company/info', type: 'GET'}, null, success, error);
}

//取消招标
interface.cancleTender = function (para, success, error) {
    ajax_general({action: '/tender/cancelTender/' + para.tenderId, type: 'GET'}, para, success, error);
}

//我的协议列表
interface.contractList = function (para, success, error, loading) {
    ajax_general({action: '/contract/queryList', type: 'POST'}, para, success, error, loading);
}

//获取合同文档签署url,参数协议id
interface.getSignUrl = function (para, success, error, _async) {
    ajax_general({action: '/contract/getSignUrl/' + para.id, type: 'GET', async: _async}, para, success, error);
}

//上传协议
interface.uploadAgreement = function (para, success, error, loading) {
    ajax_general({action: '/contract/finish', type: 'POST'}, para, success, error);
}

//我的协议各状态数量
interface.contractCount = function (success, error) {
    ajax_general({action: '/contract/queryStatusCount', type: 'GET'}, null, success, error);
}

//我的通知列表
interface.noticeList = function (para, success, error, loading) {
    ajax_general({action: '/systemNotice/queryList', type: 'POST'}, para, success, error, loading);
}

//我的通知各状态数量
interface.noticeCount = function (success, error) {
    ajax_general({action: '/systemNotice/queryStatusCount', type: 'GET'}, null, success, error);
}

//大厅消息 (滚动信息)
interface.bidHallNews = function (success, error) {
    ajax_general({action: '/systemNotice/rollingMsg', type: 'GET'}, null, success, error);
}

//关闭滚动信息
interface.closeBidHallNews = function (para, success, error) {
    ajax_general({action: '/systemNotice/colseRollingMsg/'+ para.id, type: 'GET'}, para, success, error);
}

//首页成交量、竞价大厅交易笔数/金额
interface.tradeData = function (success, error) {
    ajax_general({action: '/common/tradeData', type: 'GET'}, null, success, error);
}

//线上支付-买家创建提货单
interface.createDelivery = function (para, success, error,loading) {
    ajax_general({action: '/order/createDelivery', type: 'POST'}, para, success, error,loading);
}

//线上支付-卖家发货
interface.delivery = function (para, success, error,loading) {
    ajax_general({action: '/order/delivery', type: 'POST'}, para, success, error,loading);
}

//卖家提醒买家付款/验收
interface.confirmRemindBuyerPay = function (para, success, error) {
    ajax_general({action: '/order/remindBuyerPay/'+ para.id+'/'+para.type, type: 'GET'}, para, success, error);
}

//确认提货--完成订单（结算）
//interface.finishOrder = function (para, success, error) {
//    ajax_general({action: '/order/finish', type: 'POST'}, para, success, error);
//}

//确认提货--订单结算
interface.settle = function (para, success, error, _async) {
    ajax_general({action: '/order/settle', type: 'POST', async: _async}, para, success, error);
}

//延迟收货时间
interface.delayOrder = function (para, success, error) {
    ajax_general({action: '/order/delayDelivery', type: 'POST'}, para, success, error);
}

//提货记录
interface.record = function (para, success, error) {
    ajax_general({action: '/order/queryDelivery/' + para.id, type: 'GET'}, para, success, error);
}

//通知详情
interface.niticeDetail = function (para, success, error) {
    ajax_general({action: '/systemNotice/detail/' + para.id, type: 'GET'}, para, success, error);
}
//更新通知详情状态
interface.updateRead = function (para, success, error) {
    ajax_general({action: '/systemNotice/updateRead/' + para.id, type: 'GET'}, para, success, error);
}

//修改绑定手机号－－发送手机验证码
interface.changeSmsSendSms = function (para, success, error) {
    ajax_general({
        action: '/sms/bindMobile/' + para.mobile,
        type: 'GET'
    }, null, success, error);
}

//修改绑定手机号
interface.changeMobile = function (para, success, error) {
    ajax_general({action: '/user/bindMobile'}, para, function (res) {
    }, error);
}

//检验公司是否存在
interface.isCompanyExit = function (para, success, error) {
    ajax_general({action: '/company/companyValid', type: 'POST'}, para, success, error);
}

//申请加入公司
interface.applyAdd = function (para, success, error) {
    ajax_general({action: '/user/applyAdd', type: 'POST'}, para, success, error);
}
//处理申请加入公司
interface.dealWithApply = function (para, success, error) {
    ajax_general({action: '/user/editApplyAdd/' + para.userId + '/' + para.type, type: 'GET'}, para, success, error);
}
//禁用员工
interface.disableEmployees = function (para, success, error) {
    ajax_general({action: '/user/disable/' + para.userId, type: 'GET'}, para, success, error);
}
//启用员工
interface.activeEmployees = function (para, success, error) {
    ajax_general({action: '/user/able/' + para.userId, type: 'GET'}, para, success, error);
}
//管理员权限转让
interface.authorization = function(para,success,error){
    ajax_general({action: '/user/authorization/'+ para.userId, type: 'GET'}, para, success, error);
}

//修改员工信息
interface.modifyOtherInfo = function (para, success, error) {
    ajax_general({action: '/user/modifyInfo', type: 'POST'}, para, success, error);
}

//忘记密码---验证手机
interface.validateTel = function (para, success, error) {
    ajax_general({action: '/sms/reset/' + para.mobile, type: 'GET'}, para, success, error);
}

//忘记密码---重置密码
interface.resetPwd = function (para, success, error) {
    ajax_general({action: '/user/findPassword', type: 'POST'}, para, success, error);
}

//重置密码验证码校验
interface.resetCheck = function (para, success, error) {
    ajax_general({action: '/sms/resetCheck', type: 'POST'}, para, success, error);
}

//
interface.feedBack = function (para, success, error) {
    ajax_general({action: '/feedback/feedBack', type: 'POST'}, para, success, error);
}

//获取短信验证码 type,1注册，2更改密码，3找回登录密码，4绑定手机，5设置交易密码
interface.smsGetSms = function (para, success, error) {
    ajax_general({
        action: '/sms/send',
        type: 'POST'
    }, para, success, error);
}

//用户设置交易密码
interface.setTradePasswd = function (para, success, error) {
    ajax_general({
        action: '/userAccount/setTradePassword',
        type: 'POST'
    }, para, success, error);
}

//用户重置交易密码
interface.resetTradePasswd = function (para, success, error) {
    ajax_general({
        action: '/userAccount/updateTradePassword',
        type: 'POST'
    }, para, success, error);
}
//用户重置登录密码
interface.resetLoginPasswd = function (para, success, error) {
    ajax_general({
        action: '/user/changePassword',
        type: 'POST'
    }, para, success, error);
}

//余额明细
interface.balanceDetailList = function (para, success, error, loading) {
    ajax_general({
        action: '/userAccount/listBalanceDetail',
        type: 'POST'
    }, para, success, error, loading);
}

//交易记录
interface.tradeDetailList = function (para, success, error, loading) {
    ajax_general({
        action: '/userAccount/listUserTrade',
        type: 'POST'
    }, para, success, error, loading);
}

//提现请求
interface.widthdrawRequest = function (para, success, error) {
    ajax_general({
        action: '/userAccount/saveWithdraw',
        type: 'POST'
    }, para, success, error);
}

//支付订单
interface.payOrder = function (para, success, error, _async) {
    ajax_general({
        action: '/pay/order',
        type: 'POST',
        async : _async
    }, para, success, error);
}

//账户充值
interface.rechargeRequest = function (para, success, error, _async) {
    ajax_general({
        action: '/userAccount/recharge',
        type: 'POST',
        async : _async
    }, para, success, error);
}

/**
 *申诉*
 **/
interface.complain = function (para, success, error) {
    ajax_general({action: '/order/complain', type: 'POST'}, para, success, error);
}

/**
 *提货信息详情*
 **/
interface.goodsInfo = function (para, success, error) {
    ajax_general({action: '/order/getEnsureDeliveryInfo/' + para.orderId, type: 'GET'}, para, success, error);
}

/**
 *订单评论*
 **/
interface.evaluateOrder = function (para, success, error) {
    ajax_general({action: '/order/evaluate/', type: 'POST'}, para, success, error);
}

/**
 *添加提货车*
 **/
interface.addCar = function (para, success, error) {
    ajax_general({action: '/user/addCar', type: 'POST'}, para, success, error);
}

/**
 *删除提货车*
 **/
interface.delCar = function (para, success, error) {
    ajax_general({action: '/user/delCar/'+ para.id, type: 'GET'}, para, success, error);
}

/**
 *获取提货车*
 **/
interface.carList = function (para, success, error) {
    ajax_general({action: '/user/listCars', type: 'POST'}, para, success, error);
}
/**
 *最后一次确认提货*
 *
interface.lastConfirm = function (para, success, error) {
    ajax_general({action: '/order/buyerConfirmDelivery/' + para.id, type: 'GET'}, para, success, error);
}
 */


/**
 *关注公司*
 **/
interface.follow = function (para, success, error) {
    ajax_general({action: '/userFollow/follow/' + para.userId, type: 'GET'}, para, success, error);
}

/**
 *取消关注公司*
 **/
interface.followCancel = function (para, success, error) {
    ajax_general({action: '/userFollow/cancelFollow/' + para.userId, type: 'GET'}, para, success, error);
}
/**
 *关注招标*
 **/
interface.followElement = function (para, success, error) {
    ajax_general({action: '/userFollow/target/', type: 'POST'}, para, success, error);
}

/**
 *取消关注招标*
 **/
interface.followElementCancel = function (para, success, error) {
    ajax_general({action: '/userFollow/cancelTarget/' + para.userId, type: 'POST'}, para, success, error);
}

//所有关注公司列表
interface.followList = function (para, success, error, loading) {
    ajax_general({action: '/userFollow/listMaster', type: 'POST'}, para, success, error, loading);
}
//所有关注指标列表
interface.followElementList = function (para, success, error, loading) {
    ajax_general({action: '/userFollow/targetList', type: 'POST'}, para, success, error, loading);
}

//优惠券
interface.couponsList = function (para, success, error, loading) {
    ajax_general({action: '/userCoupon/listCoupon', type: 'POST'}, para, success, error);
}

//线下支付-卖家确认发货
interface.offlineDelivery = function (para, success, error, loading) {
    ajax_general({action: '/order/offlineDelivery', type: 'POST'}, para, success, error);
}
interface.uploadCertificateImg  = function (para,success,error) {
    ajax_general({action: '/order/uploadCertificateImg', type: 'POST'}, para, success, error);
}
interface.submitCertificate = function (para,success,error) {
    ajax_general({action: '/order/submitCertificate', type: 'POST'}, para, success, error);
}
interface.queryCertificate = function (para,success,error) {
    ajax_general({action:'/order/queryCertificate/'+para.orderId,type:'GET'},para,success,error);
}
//查看评价
interface.queryEvaluate = function (para,success,error) {
    ajax_general({action:'/order/queryEvaluate/'+para.orderId,type:'GET'},para,success,error);
}
//上传印章
interface.uploadStampImg = function (para,success,error, _async) {
    ajax_general({action:'/company/uploadStampImg/',type:"POST", async: _async},para,success,error);
}
//判断协议是否签订
interface.isSigned = function (para,success,error,async) {
    ajax_general({action:'/contract/isSigned/'+para.id,type:"GET",async:async},para,success,error);
}
/*提醒对方签署协议*/
interface.remind = function (para,success,error) {
    ajax_general({action:'/contract/remind/'+para.id,type:"GET"},para,success,error);
}
/*获取hover信息*/
interface.hoverMsg = function (para,success,error) {
    ajax_general({action:'/user/hoverMsg/'+para.id,type:'GET'},para,success,error);
}
/*删除通知消息*/
interface.batchDeal = function (para,success,error) {
    ajax_general({action:'/systemNotice/batchDeal/',type:"POST"},para,success,error);
}
/*订单是否支付*/
interface.isPayed = function (para,success,error) {
    ajax_general({action:'/order/isPayed/'+para.orderId,type:"GET"},para,success,error);
}
interface.getInvoice = function (para,success,error) {
    ajax_general({action:'/order/getInvoice/',type:'GET'},para,success,error)
}
/*编辑发票信息*/
interface.editInvoice = function (para,success,error) {
    ajax_general({action:'/order/editInvoice/',type:"POST"},para,success,error);
}
//收获驳回
interface.rejectDelivery = function (para, success, error) {
    ajax_general({action: '/order/rejectDelivery', type: 'POST'}, para, success, error);
}
/*第一次点击优惠券弹出框*/
interface.clickCoupon  = function (para,success,error) {
    ajax_general({action:'/userCoupon/clickCoupon',type:'GET'},para,success,error)
}
/*焦币记录*/
interface.integralList = function (para,success,error) {
    ajax_general({action: '/integralGoods/integralList', type: 'POST'}, para, success, error)
}
//焦币商城-商品列表
interface.goodsList = function (para, success, error,loading) {
    ajax_general({action: '/integralGoods/list', type: 'POST'}, para, success, error,loading)
}
//焦币商城-商品兑换
interface.goodsConvert = function (para, success, error) {
    ajax_general({action: '/integralGoods/convert', type: 'POST'}, para, success, error)
}
//焦币商城-订阅/取消订阅
interface.subscribe  = function (para,success,error) {
    ajax_general({action:'/integralGoods/subscribe/'+para.id,type:'GET'},para,success,error)
}
//广告位
interface.advertisement  = function (para,success,error, _async) {
    ajax_general({action:'/common/adList', type:'GET', async: _async},para,success,error)
}

//activity 获取公司名称list
interface.companyList  = function (para,success,error, _async) {
    ajax_general({action:'/common/companyList', type:'GET', async: _async},para,success,error)
}

interface.addActivityCompany = function (para,success,error){
    ajax_general({action: '/company/addActivityCompany', type: 'POST'}, para, success, error)
}

//添加用户关注招标
interface.userFollowTarget = function (para, success, error, loading) {
    ajax_general({action: '/userFollow/target', type: 'POST'}, para, success, error, loading);
}
