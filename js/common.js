/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */

/*自定义request*/
function request(paras) {
    var url = location.href + "#";
    url = url.substring(0, url.indexOf("#"));
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    for (i = 0; j = paraString[i]; i++) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if (typeof returnValue == "undefined") return ""; else return returnValue;
}
/**
 **@textArr 文本数组Array
 **@status 当前的状态Number
 * 返回时间轴html
 */
function timeLineFn(textArr,status) {
    var textStr = '';
    var lineStr ='';
    var sumStr = '';
    if(textArr){
        if(status){
            if(status<textArr.length){
                for(var k=0;k<status-1;k++){
                    lineStr += '<span class="active">'+(k+1)+'</span><i class="active"></i>';
                    textStr += '<label>'+textArr[k]+'</label>';
                }
                lineStr += '<span class="current">'+(status)+'</span><i class="no-active"></i>';
                textStr += '<label>'+textArr[status-1]+'</label>';
                for(var s=status;s<textArr.length-1;s++){
                    lineStr += '<span class="no-active">'+(s+1)+'</span> <i class="no-active"></i>';
                    textStr += '<label class="no-active">'+textArr[s]+'</label>';
                }
                lineStr += '<span class="no-active">'+textArr.length+'</span>';
                textStr += '<label class="no-active">'+textArr[textArr.length-1]+'</label>';
            }else{
                for(var i=0;i<textArr.length-1;i++){
                    lineStr += '<span class="active">'+(i+1)+'</span><i class="active"></i>';
                    textStr +=  '<label>'+textArr[i]+'</label>';
                }
                lineStr += '<span class="active">'+textArr.length+'</span>'
                textStr +=  '<label>'+textArr[textArr.length-1]+'</label>';
            }
            if(lineStr){
                lineStr = '<div class="line clearfloat">'+lineStr+'</div>';
            }
            if(textStr){
                textStr =  '<div class="text">'+textStr+'</div>';
            }
        }
    }
    sumStr = '<div class="time_line">'+textStr+lineStr+'</div>';
    return sumStr;
}
/**
 * js截取字符串，中英文都能用
 * @param str：需要截取的字符串
 * @param len: 需要截取的长度
 */
function cutstr(str,len)
{
    var str_length = 0;
    var str_len = 0;
    str_cut = new String();
    str_len = str.length;
    for(var i = 0;i<str_len;i++)
    {
        a = str.charAt(i);
        str_length++;
        if(escape(a).length > 4)
        {
            //中文字符的长度经编码之后大于4
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if(str_length>=len)
        {
            str_cut = str_cut.concat("");
            return str_cut;
        }
    }
    //如果给定字符串小于指定长度，则返回源字符串；
    if(str_length<len){
        return  str;
    }
}
/**
 *
 * @param obj 传入对象
 * @returns keys返回对象的key值
 */
function returnObjKeys(obj){
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            keys.push(key);
    }
    return keys;
}
/**
 * 计算字符串的长度值，中文占2位，英文占1位
 * @param str:字符串
 * @returns {number} 长度
 */
function strLen(str){
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        len += str.charAt(i).match(/[\u0391-\uFFE5]/) ? 2 : 1;
    }
    return len;
}
var intlCountryList = {
    "俄罗斯":{
        title:"Kazakhstan（俄罗斯）: +007",
        class:"iti-flag kz"
    },
    "中国":{
        title:"China（中国）: +86",
        class:"iti-flag cn"
    },
    "印度":{
        title:"India（印度）: +91",
        class:"iti-flag in"
    },
    "美国":{
        title:"United States（美国）: +001",
        class:"iti-flag us"
    },
    "印度尼西亚":{
        title:"Indonesia（印度尼西亚）: +62",
        class:"iti-flag id"
    },
    "伊朗":{
        title:"Iran（伊朗）: +98",
        class:"iti-flag ir"
    },
    "沙特":{
        title:"Saudi Arabia（沙特）: +966",
        class:"iti-flag sa"
    },
    "阿曼":{
        title:"Oman（阿曼）: +968",
        class:"iti-flag om"
    },
    "喀麦隆":{
        title:"Cameroon（喀麦隆）: +237",
        class:"iti-flag cm"
    },
    "委内瑞拉":{
    	title:"委内瑞拉: +58",
    	class:"iti-flag ve"
    },
    "危地马拉":{
        title:"危地马拉: +502",
        class:"iti-flag gt"
    },
    "中国澳门":{
        title:"Macau (中国澳门) : +853",
        class:"iti-flag mo"
    },
    "中国香港":{
        title:"Hong Kong (中国香港) : +852",
        class:"iti-flag hk"
    },
    "中国台湾":{
        title:"Taiwan (中国台湾) : +886",
        class:"iti-flag tw"
    }
}
function getIntlCountryArea(country) {
    var country  = country;
    if(country in intlCountryList){
        return intlCountryList[country];
    }
}
/**
 * 绑定body页面滚动条事件；用作扩展
 * @param _fn：回调函数；回调函数中会返回两个参数，1：当前事件操作对象；2：滚动条值；
 */
function windowOnScroll( _fn){
    $(window.document).scroll(function(e){
        // 获取滚动条，滚动的距离值
        // var _scrollTopNum = $(document.body).scrollTop();
        var _scrollTopNum = $(window).scrollTop();
        // console.log(_scrollTopNum)
        // //console.log(_scrollTopNum);
        // // 判断是否含有返回顶部按钮对象功能
        // var _goBackTop = $(".goBackTopArea");
        // if ( _goBackTop && _goBackTop.length>0 ){
        //     // 如果含有，则判定显示隐藏
        //     if( _scrollTopNum >= 300 ){
        //         // 判断显示返回顶部按钮
        //         if ( $(".goBackTopArea").hasClass("none") ){
        //             $(".goBackTopArea").removeClass("none");
        //         }
        //     }else{
        //         // 隐藏返回顶部按钮
        //         if ( !$(".goBackTopArea").hasClass("none") ){
        //             $(".goBackTopArea").addClass("none");
        //         }
        //     }
        // }
        _fn && _fn(e, _scrollTopNum);
    });
}
/**
 * 格式化金钱,保留
 */
function formatCurrency(num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num))
        num = "0";
    var sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    var cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10)
        cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
    return (((sign) ? '' : '-') + num + '.' + cents);
}

/**
 * 金额格式化
 * fmoney("12345.675910", 3)，返回12,345.676
 */
function fmoney(s, n){
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(),
    r = s.split(".")[1];
    t = "";
    for(i = 0; i < l.length; i ++ ){
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
}

/*
 *Date类型
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2014-01-02 04:07:14.223
 *(new Date()).Format("yyyy-M-d h:m:s.S") ==> 2014-5-1 14:19:7.19
 */
//日期格式化
function dateFormat(date) {
    if (date) {
        return (new Date(date)).Format("yyyy-MM-dd");
    } else {
        return "";
    }
}
// 倒计时
function dayTime(endTime) {
    if (!endTime) {
        return 0;
    }
    var now = new Date().getTime();
    if (endTime - now <= 0) {
        return 0;
    }
    var d = new Date(endTime - now).getTime();
    var day = Math.floor(d / 1000 / 60 / 60 / 24);
    var hour = Math.floor(d / 1000 / 60 / 60 % 24);
    var minute = Math.floor(d / 1000 / 60 % 60);
    var second = Math.floor(d / 1000 % 60);
    if(hour>0||minute>0||second>0){
        day=day+1;
    }
    return day;
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        // 月份
        "d+": this.getDate(),
        // 日
        "h+": this.getHours(),
        // 小时
        "m+": this.getMinutes(),
        // 分
        "s+": this.getSeconds(),
        // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // 季度
        S: this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return fmt;
};

//日期小时分钟格式化
function dateHoursMinFormat(date) {
    if (date) {
        return (new Date(date)).Format("yyyy-MM-dd hh:mm:ss");
    } else {
        return "";
    }
}

//判断是否为空对象
function judge(obj) {
    for (var i in obj) {//如果不为空，则会执行到这一步，返回true
        return true;
    }
    return false;
}

//获取localstorage
function _GET_DATA(key) {
    if (localStorage) {
        var value = localStorage.getItem('_data__' + key);
        var nowTime = new Date();
        if (value) {
            var j = JSON.parse(value);
            if (j.time && j.time < nowTime.getTime()) {
                localStorage.removeItem('_data__' + key);
                return null;
            }
            return j.data;
        }
    }
    return null;
}

//设置localstorage
function _SET_DATA(key,value,time) {
    if (localStorage) {
        // var t = null;
        var t = {};
        if (time && time.length >= 2) {
            try {
                t = new Date();
                var n = parseInt(time.substring(0, time.length - 1));
                var f = time.substring(time.length - 1, time.length);

                switch (f) {
                    case 's':
                        t.setSeconds(t.getSeconds() + n);
                        break;
                    case 'm':
                        t.setMinutes(t.getMinutes() + n);
                        break;
                    case 'h':
                        t.setHours(t.getHours() + n);
                        break;
                    case 'd':
                        t.setDate(t.getDate() + n);
                        break;
                    case 'w':
                        t.setDate(t.getDate() + (n * 7));
                        break;
                    case 'M':
                        t.setMonth(t.getMonth() + n);
                        break;
                    case 'y':
                        t.setFullYear(t.getFullYear() + n);
                        break;
                }
                t = t.getTime();
            } catch (e) {
                t = null;
            }
        }
        localStorage.setItem('_data__' + key, JSON.stringify({data: value, time: t}));
        return true;
    }
    return false;
}

//删除localstorage
function _DEL_DATA(key) {
    if (localStorage) {
        localStorage.removeItem('_data__' + key);
    }
}

/**
 * 得到用户信息
 */
function getUser() {
    var user = _GET_DATA('user');
    return user ? user : {login: false};
}

/**
 * 删除用户
 * @returns
 */
function delUser() {//得到用户信息
    _DEL_DATA('user');
}

//缓存用户信息
function setUser(user, success, _async) {
	if(user){
		_SET_DATA('user', user);
	}
	interface.currentUserInfo(
  		function (resp) {
  			resp.login = true;
  			_SET_DATA('user', resp);
  			if(success){
  				success(resp);
  			}
      },
      function (resp) {
      	alertReturn(resp.exception);
      },
      _async
	)
}

/**
 * 是否个人信息填写完整
 * @param userInfo
 * @returns true：已填完，false：未填完
 */
function isUserInfoComplete(userInfo){
		if(!userInfo.nickname){
			return false;
		}
		if(!userInfo.department){
			return false;
		}
		if(!userInfo.position){
			return false;
		}
		if(!userInfo.connectPhone){
			return false;
		}
		if(!userInfo.idcard){
			return false;
		}
		if(!userInfo.idcardImage){
			return false;
		}
		if(!userInfo.bank){
			return false;
		}
		if(!userInfo.bankCard){
			return false;
		}
		return true;
}

function delUser(user) {//删除过期token
    _DEL_DATA('user', user);
}
var dialogOptIndex = 0;
function dialogOpt(options) {// 弹窗-选择型
    if ($('.popup-cover .bid-record').length > 0) {
        return false;
    }
    if (!options) {
        options = {};
    }
    var dialogHtml;
    var closeHtml = '';
    if (options.closeClass) {
        closeHtml = '<div class="close"></div>';
    }
    if (options.btnClass) {
        dialogHtml = '<div class="popup-cover" id="dialogOptIndex_' + dialogOptIndex + '">' +
            '<div class="popup">' +
            '' + closeHtml + '' +
            '<div class="layer_box popup_opt">' +
            '<div  class="popupWrap"><div class="title fts-16"></div><div class="closed">×</div></div>' +
            '<div class="popup_cont"></div>' +
            '<div class="btn btn1">' +
            '<a class="item okey fts-14" href="javascript:;"></a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    } else {
        if (options.offerBtn == "offer2") {  /*采购方出价---出价按钮为绿色*/
            dialogHtml = '<div class="popup-cover" id="dialogOptIndex_' + dialogOptIndex + '">' +
                '<div class="popup">' +
                '' + closeHtml + '' +
                '<div class="layer_box popup_opt">' +
                '<div  class="popupWrap"><div class="title fts-16"></div><div class="closed">×</div></div>' +
                '<div class="popup_cont"></div>' +
                '<div class="btn">' +
                '<a class="item okey btn-green  fts-14" href="javascript:;"></a>' +
                '<a class="item cancel cancel-green fts-14" href="javascript:;"></a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        } else {
            dialogHtml = '<div class="popup-cover" id="dialogOptIndex_' + dialogOptIndex + '">' +
                '<div class="popup">' +
                '' + closeHtml + '' +
                '<div class="layer_box popup_opt">' +
                '<div class="popupWrap"><div class="title fts-16"></div><div class="closed">×</div></div>' +
                '<div class="popup_cont"></div>' +
                '<div class="btn">' +
                '<a class="item okey fts-14" href="javascript:;"></a>' +
                '<a class="item cancel fts-14" href="javascript:;"></a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }

    }
    $('body').append(dialogHtml);
    var thisDialog = $('#dialogOptIndex_' + dialogOptIndex);

    if(!options.isHide){
        thisDialog.show(200);
    }else{
        $('.popup-cover').addClass('hide')
    }

    if (options.title) {
        thisDialog.find('.title').html(options.title);
    } else {
        thisDialog.find('.title').remove();
    }
    if (options.class) {
        thisDialog.find('.popup').addClass(options.class);
    }
    if (options.content) {
        thisDialog.find('.popup_cont').html(options.content);
    }
    if (options.textOkey) {
        thisDialog.find('.popup_opt .okey').html(options.textOkey);
        if(options.textOkeyId){
        	thisDialog.find('.popup_opt .okey').attr({'id':options.textOkeyId, 'name':options.textOkeyId})
        }
    } else {
        thisDialog.find('.popup_opt .okey').remove();
    }
    if (options.textCancel) {
        thisDialog.find('.popup_opt .cancel').html(options.textCancel);
        if(options.textCancelId){
        	thisDialog.find('.popup_opt .cancel').attr({'id':options.textCancelId, 'name':options.textCancelId})
        }
    } else {
        thisDialog.find('.popup_opt .cancel').remove();
    }

    if (options.notOkey) {
        thisDialog.find('.popup_opt .okey').remove();
    }

    if (options.notCancel) {
        thisDialog.find('.popup_opt .cancel').remove();
    }

    if (options.funcOkey) {
        thisDialog.find('.popup_opt .okey').on('click', function () {
            options.funcOkey();
            $("body").css('overflow', 'auto');
        })
    } else {
        thisDialog.find('.popup_opt .okey').on('click', function () {
            dialogClose();
        })
    }
    if (options.funcCancel) {
        thisDialog.find('.popup_opt .cancel').on('click', function () {
            options.funcCancel();
            $("body").css('overflow', 'auto');
        })
    } else {
        thisDialog.find('.popup_opt .cancel').on('click', function () {
            dialogClose();
        })
    }
    if (options.funcClose) {
        $('.popup .close').on('click', function () {
            options.funcClose();
            dialogClose();
        })
    } else {
        $('.popup .close').on('click', function () {
            dialogClose();
        })
    }
    if(options.closeId){
    	$('.popup-cover .closed').attr({'id':options.closeId, 'name':options.closeId})
    }
    function dialogClose() {
        $("body").css('overflow', 'auto');
        thisDialog.remove();
    }

    dialogOptIndex++;
    /*弹出模态框让html的滚动轴消失*/
    $("body").css('overflow', 'hidden');
    //点击关闭图标关闭模态框
    $(".popup-cover .closed").on('click',function (e) {
        if (options.funcClose) {
            options.funcClose();
        }
        dialogClose();
    });
    return thisDialog;
}

function getAreaCode(val) {
    var patt = /:\s+\+\d+/g;
    var str = val.match(patt);
    str = str.join("").slice(1);
    return trim(str);

}
function matchMobile(val) {//校验手机号
    if(val){
        var valnew = trim(val);
        if (valnew.match(/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/)) {
            return true;
        } else {
            return false;
        }
    }

}
//校验海内外电话号码
function matchIntlMobile(val) {
    var valnew = trimAll(val);
    if (valnew.match(/^([-+]?\d+[-+]?\d*)+(\d+[-+]?\d*)+$|^\d+$/)) {
        return true;
    } else {
        return false;
    }
}
function matchIdCard(val) {//校验身份证号
    var valnew = trim(val);
    if (valnew.match(/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/)) {
        return true;
    } else {
        return false;
    }
}

function isCarNumber(val) {//校验车牌号
    var valnew = trim(val);
    if (valnew.match(/^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/)) {
        return true;
    } else {
        return false;
    }
}

//注册密码：字母、数字组成且不小于6位
function isPasswd(val) {
    var valnew = trim(val);
    if (/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}/.test(valnew)) {
        //注册密码：字母、数字、符合组成且不小于6位
        //if (/^(?![a-zA-Z0-9]+$)(?![^a-zA-Z/D]+$)(?![^0-9/D]+$).{6,}$/.test(valnew)) {
        return true;
    }
    return false;
}

//交易密码：字母、数字组合6位
function isSPasswd(val) {
    var valnew = trim(val);
    if (/^[0-9]{6}$/.test(valnew)) {
        return true;
    }
    return false;
}

function isMail(val) {
    var szReg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

    if (szReg.test(val)) {
        return true;
    }
    return false;
}

function getUrlSuffix(url) {
    var index1=url.lastIndexOf(".");
    var index2=url.length;
    var suffix=url.substring(index1+1,index2);
    return suffix;
}
//海外银行账号为数字 、数字+英文
function isNumAndLetter(val) {
    var val = trimAll(val);
    var patt = /^(?![a-zA-Z]+$)[0-9a-zA-Z\s]+$/
    if(patt.test(val)){
        return true;
    }
    return false;
}
//匹配中英文字符串
function onlyZhAndEn(val) {
    var val = trimAll(val);
    var patt = /^[\u4e00-\u9fa5a-zA-Z]+$/;
    if(patt.test(val)){
        return true;
    }
    return false;
}
//海外银行地址不能为纯数字
function isBankAddr(val) {
    var val = trimAll(val);
    var patt = /^\d+$/
    if(patt.test(val)){
        return false;
    }
    return true;
}
function trim(str) { //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
function trimAll(str) { //删除所有的空格
    return str.replace(/\s+/g, "");
}
function showLoading(vobj, vstr) {
    if (vstr === undefined) vstr = getAcceptLanguage() == 'zh-CN'?"数据加载中...":"LOADING...";
    $(vobj).html(
        '<div class="show-loading-block"><div class="show-loading" id="loading"><img src="data:image/gif;base64,R0lGODlhGQAZANUlAJmZzP/MzMyZmczMmWaZM8z/zMyZZmaZmZnMzGYAzMxmMwCZmZnMZswAAGYzmf/MADOZmWaZzP+ZZgBm//9mAP+ZM5kAZpkzZjNmzMzM/5mZmZlmzGaZ///M/8xmZpnMmf+ZmZlmmf/MZv/MmczMzP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUZFODQ1RDAzMTc3MTFFMzgxMzQ5MjU0NkREMEQxRkUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUZFODQ1Q0YzMTc3MTFFMzgxMzQ5MjU0NkREMEQxRkUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDpFNTA1MDExMDc3MzFFMzExOTk1QkU3NUU5NEFGRTRCNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNTA1MDExMDc3MzFFMzExOTk1QkU3NUU5NEFGRTRCNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkKACUALAAAAAAZABkAAAZ6wJJwSCwaj8ikcsk8bhLQRNMYjU6HF2FVer14tdapdwzmMkNjcgkqTqvNRNIVSZLPi/U60cDvG5J5ekN+fICBdkKEhod7fUIjdyUChSUjkJF/lZaPQgWen55IlpuanaAFoqOXo6afSaqPrCWuSrKql6hNq7eRmqS9TUEAIfkECQoAJQAsAAAAABkAGQAABoDAknBILBqPyKRyyTyGHFBH0xiNCiecZkhYlZYm4GVozLV+wZPkeF32osNGwZpdgl7RyPmce09Pj3B/Rn5IAoaHAoJCiIaKi4iOj40lJJGTJJWOiZSYQgFCBaGioUiYnSUBnyWjpEemp6mqrEmvnrGgHQVLpra3q1OZsb6KwpF/QQAh+QQJCgAlACwAAAAAGQAZAAAGfcCScEgsGo/IpHLJPAJC0FDTGI0KMZGmQFiVljDgpWDMtX7BmOR4Xfaiw8c1uwS9opFyOdeeLi2mRXALCweAQ32Dg0QkjI0kSYmKQ46MkJF/k46Wl4uNQo+Gn6CVoSWjpAGlmiUBqYCUQq2uU6uys02erLahoLatpbq/wFNBACH5BAkKACUALAAAAAAZABkAAAZ3wJJwSCwaj8ikcslEAp6AphEKFUaiTJKQio14l6TwtlryfpHh9LhrjqDT4tLTan7D42x3CSItniEQGn1DeoCARHdxR4aHQ4lJjI1Cd5CRfI5qJVqDk5uKg56fJQSkpaR2m0SmpAxHlEarSXBIpWCiqlKpnLu8SEEAIfkECQoAJQAsAAAAABkAGQAABnTAknBILBqPyKRyyUSSnqSmEQoVAqTREjUL6C6rWnDX66QKxePrcZt9Wsdl9vmtPkiL5MMBcR/W9XZDbFlHgHpEckiGh4JmiouBZ2B9iISUgkcPQgScnZxSD5olnpwMoKGbnnehqKOfq6yiBJSxrbSsIpd3QQAh+QQJCgAlACwAAAAAGQAZAAAGc8CScEgsGo/IpHLJRJKepKYRChVGm1dq9rmslqhW71Eb3oqL2m35Ok1ny0KEFH1FyOfDuv2Oj+/5eH92fSWCg0kUhEUUiYpCjI0iQgyUlZRIkJGSJZaUH0eZmpudiJBCIqijl0qmJamok00GoqmKrwOOTUEAIfkECQoAJQAsAAAAABkAGQAABnfAknBILBqPyKRyyUSSnqSmEQoVRqVWavYq1Za83ec2k8F+r2AsWvw1D9ls9zpeatjvjSSVW8fnnXtEfnp7fHhCFW4lHnaIiYp/FZJCIkIDl5iXSJKTJSKVJZmaR5ydn6CiSaWUp5ajqqanqE0gj7Kfip6nA7lSQQAh+QQJCgAlACwAAAAAGQAZAAAGecCScEgsGo/IpHLJbDqZJKclSaouLVhk1YrEeo/bTOYY8n6L2+jRbEZz1U/hGx5Xp4mKvF5BvQ/3eX1+QoCCgyV7QhJxQgaBJRKLjIiKkUIjQgOam5pIkZYlI5glnJ1Hn6Cio6VJqJeqmaatqaqrTQOStaKTobC8TkEAOw=="><br>' +
        vstr + "</div></div>");
};

function hideLoading(vobj) {
    $(vobj).html("");
}

function alertDialog(alertContent, callback) {/*toast弹框*/
    if ($('.alert_dialog').length > 0) {
        return false;
    }
    var dialoghtml = '<div class="alert_dialog animated fadeIn">' +
        '<div class="layer_bg"></div>' +
        '<div class="alert-html fts-14">' +
        '<div class="main_text"></div>' +
        '</div>' +
        '</div>';

    $("body").append(dialoghtml);
    $('.alert_dialog .main_text').append(alertContent);
    $(".alert_dialog").show();
    $('.alert_dialog').on('click', function () {
        $('.alert_dialog').remove();
    });
}
function hideDialog() {
    if($('.alert_dialog').length> 0){
        $('.alert_dialog').off().remove();
    }
}

/**
 * 全局弹框提示
 * @param alertContent 提示内容
 * @param synCallback 同步执行
 * @param asynCallback 异步执行
 * @returns
 */
function alertReturn(alertContent, synCallback, asynCallback) {/*toast弹框*/
    if ($('.alert_return').length > 0) {
        $('.alert_return').remove();
        clearTimeout(timer);
    }
    var alertHtml = '<div class="alert_return animated fts-16 animated fadeIn"><div class="main_text"></div></div>';
    $("body").append(alertHtml);
    $('.alert_return .main_text').append(alertContent);
    $(".alert_return").show();
    var timer = setTimeout(function remove() {
        $(".alert_return").remove();
        if(synCallback){
            synCallback.call();
        }
    }, 2000);

    $('.alert_return').on('click', function () {
        $('.alert_return').remove();
        clearInterval(timer);
    })
    if (asynCallback) {
        asynCallback.call(this, null);
    }
}


/*必须为数字且大于0*/
function isInteger(obj) {
    if (!isNaN(Number(obj)) && obj > 0) {
        return true;
    } else {
        return false;
    }
}
/*必须为数字且大于等于0*/
function isInteger0(obj) {
    //bool值传入也会被当初数字
    if (!isNaN(Number(obj)) && obj >= 0) {
        return true;
    } else {
        return false;
    }
}
function isIntegerSize(obj, len) {
    if (!isNaN(Number(obj)) && Number(obj) >= 0 && Number(obj).toString().length === len) {
        return false;
    }
    return true;
}
/*必须为数字且大于0且<=100*/
function isIntegers(obj) {
    if (!isNaN(Number(obj)) && Number(obj) > 0 && Number(obj) <= 100) {
        return true;
    } else {
        return false;
    }
}

/**/
function returnZhengshu(obj) {
    var temp = /^\d+$/;
    if (temp.test(obj) && obj > 0) {
        return obj + ".0";
    } else {
        return obj;
    }
}


/*大于0的整数*/
function isZhengshu(obj) {
    var temp = /^\d+$/;
    if (temp.test(obj) && obj > 0) {
        return true;
    } else {
        return false;
    }
}


function isZhengShu(obj) {//延期天数最多4天
    var temp = /^\d+$/;
    if (temp.test(obj) && obj > 0 && obj < 5) {
        return true;
    } else {
        return false;
    }
}

/**
 * 是否为中文
 * @param value
 * @returns {Boolean}
 */
function isChinese(value) {
    return /^[\u4e00-\u9fa5]+$/.test(value);
}
/**
 * 是否含有中文
 * @param value
 * @returns {Boolean}
 */
function isContainChinese(value) {
    var patt = /[\u4e00-\u9fa5]+/g;
    if(value.match(patt)){
        return true;
    }
    return false;
}
/**
 * 是否为银行卡号
 * 纯数字，8~28位
 * @param value
 * @returns {Boolean}
 */
function isBankCard(value) {
    return /^\d{8,28}$/.test(value);
}

/**
 * 是否为营业执照注册号
 * 15位字母或数字
 * @param value
 * @returns {Boolean}
 */
function isBusinessLicenseNum(value) {
    return /^[a-zA-Z0-9]{15}$/.test(value);
}

/**
 * 是否为社会信用代码
 * 18位字母或数字
 * @param value
 * @returns {Boolean}
 */
function isSocialCreditNum(value) {
    return /^[a-zA-Z0-9]{18}$/.test(value);
//    return /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{18})$/.test(value);
}


/*两位小数*/
function f_double(f) {
    var fs = (f).toString();
    if (fs.indexOf('.') > -1)
        return fs.substr(0, fs.indexOf('.') + 3);
    else
        return fs + '.00';
    //return f;
}

function dateYMDHMSFormat(date) {
    if (date) {
        return (new Date(date)).Format("yyyy-MM-dd hh:mm");
    } else {
        return "";
    }
}

/*添加单张图片到缓存*/
function addImage(text) {
    var iamgeArrsys = _GET_DATA('iamgeArrsys');
    if (iamgeArrsys) {
        var flag = true;
        var count = iamgeArrsys.length - 10;
        if (count >= 0) {
            for (var j = 0; j < count; j++) {//防止异常出现超过15条
                iamgeArrsys.pop();
            }
            for (var m = 0; m < iamgeArrsys.length; m++) {
                if (text == iamgeArrsys[m]) {
                    iamgeArrsys.splice(m, 1); // 删除指定元素
                    break;
                }
                if (m == 9) {
                    iamgeArrsys.pop();
                }
            }
            iamgeArrsys.unshift(text);
        } else {//正常情况
            for (var n = 0; n < iamgeArrsys.length; n++) {
                if (text == iamgeArrsys[n]) {
                    iamgeArrsys.splice(n, 1); // 删除指定元素
                    break;
                }
            }
            if (flag) {
                iamgeArrsys.unshift(text);
            }
        }
    } else {
        iamgeArrsys = [];
        iamgeArrsys.unshift(text);
    }
    _SET_DATA('iamgeArrsys', iamgeArrsys);
}


/*获取所有图片*/
function getImages() {
    var iamgeArrsys = _GET_DATA('iamgeArrsys');
    if (iamgeArrsys) {
        return iamgeArrsys;
    }
}

//页面加载完成
function pageLoad() {
    if (document.readyState == 'complete') {
        //页面高度自适应
        singleScreen();
    }
}

//页面高度自适应
function singleScreen() {
    var windowHeight = $(window).height();
    var bodyHeight = $('body').height();
    if (bodyHeight <= windowHeight) {
        $('html, body').addClass('single_screen');
        $('.mod-footer').addClass('pos_bottom');
    } else {
        $('html, body').removeClass('single_screen');
        $('.mod-footer').removeClass('pos_bottom');
    }
}

//校验银行卡号
function formatBC(e) {

    $(this).attr("data-oral", $(this).val().replace(/\ +/g, ""));

    var self = $.trim(e.target.value);
    var temp = this.value.replace(/\D/g, '').replace(/(....)(?=.)/g, '$1 ');
    if (self.length > 35) {
        this.value = self.substr(0, 35);
        return this.value;
    }
    if (temp != this.value) {
        this.value = temp;
    }
}

/**
 * 格式化银行卡号，每4位空一格
 * @param e
 * @returns
 */
function formatBankCard(e) {

    $(this).attr("data-oral", $(this).val().replace(/\ +/g, ""));

    var self = $.trim(e.target.value);
    var temp = formatBankCard2(this.value);
    if (temp != this.value) {
        this.value = temp;
    }
}


/**
 * 格式化银行卡号，每4位空一格
 * @param e
 * @returns
 */
function formatBankCard2(bankCard) {
    if(bankCard){
        return bankCard.replace(/\ +/g, "").replace(/(....)(?=.)/g, '$1 ');
    }
    return "";
}

/**
 *提现窗口js*
 **/
function widthDrawDialog(data) {
    //如果是公司职员，提现卡为公司卡
    if (data.role == 1 || data.role == 2) {
        interface.companyInfo(function (resp) {
            if (resp.code == 0) {
                data.bank = resp.data.bankName;
                data.bankBranch = resp.data.bankBranch;
                data.bankCard = resp.data.bankCard;
                data.bankCity = resp.data.bankCity;
                data.bankProvince = resp.data.bankProvince;
                data.bankUniteCode = resp.data.bankUniteCode;
                data.bankUser = resp.data.bankUser;
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    $('.widthdraw-btn').on('click', function () {
        if (!data.bankUser) {
            alertReturn('银行卡信息不完整');
            return false;
        }
        if (data.status == 3) {
            alertReturn('您有订单延期未结算，处理以后才可以交易哦～');
        } else {
            var html = '<ul>' +
                '<li><label>余额：</label><span>' + data.useableBalace.toFixed(2) + '元</span></li>' +
                '<li><label>提现金额：</label><input type="text"/>元</li>' +
                '<li><label>备注：</label><textarea id=""></textarea></li>' +
                '</ul>' +
                '<h3>提现账户</h3>' +
                '<ul>' +
                '<li><label>开户人：</label><span>' + data.bankUser + '</span></li>' +
                '<li><label>银行账号：</label><span>' + data.bankCard.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 ") + '</span></li>' +
                '<li><label>开户行：</label><span>' + data.bankProvince + data.bankCity + data.bankBranch + ' </span></li>' +
                '</ul>' +
                '<p class="tips">注：请仔细确认提现账号，防止提现错误发生。</p>';
            var d = dialogOpt({
                title: '提现申请',
                class: 'widthdraw',
                content: html,
                textOkey: '确定',
                textCancel: '取消',
                funcOkey: function () {
                    var amount = trim($('.widthdraw input').val());
                    var remark = trim($('.widthdraw textarea').val());
                    if (!amount) {
                        alertReturn('提现金额不能为空');
                        return false;
                    }
                    if (amount == 0) {
                        alertReturn('提现金额不能为0');
                        return false;
                    }
                    if (Number(amount) > Number(data.useableBalace)) {
                        alertReturn('提现金额不能大于余额');
                        return false;
                    }
                    interface.widthdrawRequest({
                        amount: amount,
                        remark: remark
                    }, function (resp) {
                        if (resp.code == 0) {
                            var html1 = '<h3>您已成功提交提现申请！</h3>' +
                                '<p class=tips>我们将会在1个工作日内完成提现操作，请耐心等候～</p>';
                            var d1 = dialogOpt({
                                title: '提现通知',
                                class: 'widthdraw_tips',
                                content: html1,
                                textOkey: '关闭',
                                classBtn: 'btn1',
                                funcOkey: function () {
                                    $('.total-balance span').html(Number(data.totalBalance) - Number(amount));
                                    $('.userable-balance span').html(Number(data.useableBalace) - Number(amount));
                                    d1.remove();
                                }
                            })
                            d.remove();
                        } else {
                            alertReturn(resp.exception);
                        }
                    }, function (resp) {
                        alertReturn(resp.exception);
                    })
                }
            })
        }


        $('.widthdraw input').on('input', function () {//提现金额弹框
            var widthdrawCash = trim($(".widthdraw input").val());
            if (!isInteger0(widthdrawCash)) {
                $(".widthdraw input").val('');
            } else {
                if (widthdrawCash.indexOf('.') > 0 && widthdrawCash.toString().split(".")[1].length > 2) {
                    $(".widthdraw input").val(Math.floor(Number(widthdrawCash) * 100) / 100);
                    return false;
                }
            }
        });

        //for ie  --(提现金额弹框)
        if (document.all) {
            $('.widthdraw input').each(function () {
                var widthdrawCash = trim($(".widthdraw input").val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger0(widthdrawCash)) {
                            $(".widthdraw input").val('');
                        } else {
                            if (widthdrawCash.indexOf('.') > 0 && widthdrawCash.toString().split(".")[1].length > 2) {
                                $(".widthdraw input").val(Math.floor(Number(widthdrawCash) * 100) / 100);
                                return false;
                            }
                        }
                    });
                }
            })
        }
    })
}

/**
 *充值窗口js*
 **/
function rechargeDialog() {
    $('.recharge-btn').on('click', function () {
        var bankList = [
            {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
            {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
            {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
            {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
            {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
            {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
            {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
            {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
            {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
            {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
            {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
            {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
            {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
            {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
            {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
            {name: "恒丰银行", imageUrl: "../images/bank/bank16.gif", id: "EGB"},
            {name: "浙商银行", imageUrl: "../images/bank/bank17.gif", id: "CZB"},
            {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
            {name: "上海银行", imageUrl: "../images/bank/bank19.gif", id: "SHB"},
            {name: "厦门银行", imageUrl: "../images/bank/bank20.jpg", id: "XMB"},
        ];

        var bankListHtml = "";
        for (var i = 0; i < bankList.length; i++) {
            if (i <= 13) {
                bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
            } else {
                bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
            }
        }
        var html = '<div>' +
            '<div class="content">' +
            '<div class="recharge-input fts-14">' +
            '<label class="fts-16">充值金额：</label>' +
            '<input type="text"/>元' +
            '<span class="color-9d fts-12">每次充值不可低于1元</span>' +
            '</div>' +
            '<div class="recharge-type">' +
            '<h1 class="fts-16">支付方式<span class="fts-12 color-9d">（目前只支持网银支付）</span></h1>' +
            //'<ul><li><i></i><label>网银支付</label></li></ul>' +
            '</div>' +
            '</div>' +
            '<div class="pay-type">' +
            '<div class="pay-bottom">' +
            //'<h3>网银支付</h3>' +
            '<ul class="m-bank">' +
            '<li data-thirdPayType="B2C" data-type="1">' +
            '<i></i><label>个人网银</label>' +
            '</li>' +
            '<li data-thirdPayType="B2B" data-type="2">' +
            '<i></i><label>企业网银</label>' +
            '</li>' +
            '</ul>' +
            '<div class="bank-list">' + bankListHtml +
            '<div class="bank-more"><h1>更多银行</h1></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var d = dialogOpt({
            title: '账户充值',
            class: 'recharge-dialog',
            content: html,
            textOkey: '立即充值',
            textCancel: '取消',
            funcOkey: function () {
                var amount = trim($('.recharge-input input').val());
                if (!amount) {
                    alertReturn('充值金额不能为空');
                    return false;
                }
                var thirdType = $('.pay-type .m-bank li.checked').attr('data-type');
                if (!thirdType) {
                    alertReturn('请选择支付方式');
                    return false;
                } else {
                    var bankId = $('.pay-type .pay-bottom .bank-list span.checked').attr('data-id');
                    if (!bankId) {
                        alertReturn('请选择银行');
                        return false;
                    }
                }
                interface.rechargeRequest({
                    amount: amount,
                    bankId: bankId,
                    thirdPayType: thirdType
                }, function (resp) {
                    if (resp.code == 0) {
                        openwin(resp.data);
                        d.remove();
                        var tipsHtml = '<p>您在新的网上银行页面进行充值；充值完成前请不要关闭该窗口 </p>' +
                            '<a class="tips-a">已完成充值</a>';
                        dialogOpt({
                            title: '登录网上银行充值',
                            class: 'tips-dialog',
                            content: tipsHtml,
                            textOkey: '关闭',
                            btnClass: 'btn1',
                            funcOkey: function () {
                                window.location.reload();
                            }
                        })

                        $('.tips-a').on('click', function () {
                            window.location.reload();
                        });
                    } else {
                        alertReturn(resp.exception);
                    }
                }, function (resp) {
                    alertReturn(resp.exception);
                }, false);
            }
        });

        $('.pay-type .m-bank li').on('click', function () {
            var $this = $(this);
            var thirdPayType = $this.attr("data-thirdPayType");
            if ($('.pay-type .m-bank li').hasClass('checked')) {
                if ($this.siblings("li").hasClass('checked')) {
                    if (!$this.hasClass('checked')) {
                        $('.pay-type .m-bank li').removeClass('checked');
                        $this.addClass('checked');
                    }
                }
            } else {
                $this.addClass('checked');
            }
            if (thirdPayType == "B2B") {
                var bankList = [
                    {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                    {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                    {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                    {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                    {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                    {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                    {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                    {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                    {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                    {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                    {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                    {name: "青岛银行", imageUrl: "../images/bank/bank21.gif", id: "QDB"},
                    {name: "徽商银行", imageUrl: "../images/bank/bank22.png", id: "AHHSB"},
                    {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                    {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                    {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                    {name: "天津银行", imageUrl: "../images/bank/bank23.png", id: "TJB"},
                    {name: "宁波银行", imageUrl: "../images/bank/bank24.gif", id: "NBCB"},
                    {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                    {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                    {name: "杭州银行", imageUrl: "../images/bank/bank25.jpg", id: "HCCB"}
                ];

                var bankListHtml = "";
                for (var i = 0; i < bankList.length; i++) {
                    if (i <= 13) {
                        bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                    } else {
                        bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                    }
                }

                $(".bank-list").html(bankListHtml);
                $(".bank-list").append('<div class="bank-more"><h1>更多银行</h1></div>');
            } else if (thirdPayType == "B2C") {
                var bankList = [
                    {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                    {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                    {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                    {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                    {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                    {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                    {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                    {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                    {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                    {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                    {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                    {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                    {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                    {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                    {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                    {name: "恒丰银行", imageUrl: "../images/bank/bank16.gif", id: "EGB"},
                    {name: "浙商银行", imageUrl: "../images/bank/bank17.gif", id: "CZB"},
                    {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                    {name: "上海银行", imageUrl: "../images/bank/bank19.gif", id: "SHB"},
                    {name: "厦门银行", imageUrl: "../images/bank/bank20.jpg", id: "XMB"},
                ];

                var bankListHtml = "";
                for (var i = 0; i < bankList.length; i++) {
                    if (i <= 13) {
                        bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                    } else {
                        bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                    }
                }

                $(".bank-list").html(bankListHtml);
                $(".bank-list").append('<div class="bank-more"><h1>更多银行</h1></div>');
            }
            bankOperate();
        });

        //选择支付方式
        $('.recharge-input input').on('input', function () {//提现金额弹框
            var rechargeCash = trim($(".recharge-input input").val());
            if (!isInteger(rechargeCash)) {
                $(".recharge-input input").val('');
            } else {
                if (rechargeCash.indexOf('.') > 0 && rechargeCash.toString().split(".")[1].length > 2) {
                    $(".recharge-input input").val(Math.floor(Number(rechargeCash) * 100) / 100);
                    return false;
                }
            }
        });

        //for ie  --(提现金额弹框)
        if (document.all) {
            $('.recharge-input input').each(function () {
                var rechargeCash = trim($(".recharge-input input").val());
                if (this.attachEvent) {
                    this.attachEvent('onpropertychange', function (e) {
                        if (e.propertyName != 'value') return;
                        if (!isInteger(rechargeCash)) {
                            // $(".recharge-input input").val('');
                        } else {
                            if (rechargeCash.indexOf('.') > 0 && rechargeCash.toString().split(".")[1].length > 2) {
                                $(".recharge-input input").val(Math.floor(Number(rechargeCash) * 100) / 100);
                                return false;
                            }
                        }
                    });
                }
            })
        }
    });
}

function bankOperate() {  //银行操作模块
    //银行图标
    $('.pay-type .pay-bottom .bank-list span').on('click', function () {
        var $this = $(this);
        if ($('.pay-type .pay-bottom .bank-list span').hasClass('checked')) {
            if ($this.siblings("span").hasClass('checked')) {
                if (!$this.hasClass('checked')) {
                    $('.pay-type .pay-bottom .bank-list span').removeClass('checked');
                    $this.addClass('checked');
                }
            }
        } else {
            $this.addClass('checked');
        }
    });

    //更多银行
    $(".pay-type .pay-bottom .bank-list div.bank-more").on('click', function () {
        var _this = $(this);
        if ($('.pay-type .pay-bottom .bank-list span.hidden').hasClass('hide')) {
            $(".pay-type .pay-bottom .bank-list span.hidden").removeClass("hide");
            _this.find("h1").html("收起");
        } else {
            $(".pay-type .pay-bottom .bank-list span.hidden").addClass("hide");
            _this.find("h1").html("更多银行");
        }
    });
}

//选择银行切换
function orderBankOperate() {  //订单银行操作模块
    $('.pay-type .m-bank li').on('click', function () {
        var $this = $(this);
        var thirdPayType = $this.attr("data-thirdPayType");
        if ($('.pay-type .m-bank li').hasClass('checked')) {
            if ($this.siblings("li").hasClass('checked')) {
                if (!$this.hasClass('checked')) {
                    $('.pay-type .m-bank li').removeClass('checked');
                    $('.pay-type .m-personal li').removeClass('checked');
                    $this.addClass('checked');
                }
            }
        } else {
            $this.addClass('checked');
            $('.pay-type .m-personal li').removeClass('checked');
        }
        if (thirdPayType == "B2B") {
            var bankList = [
                {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                {name: "青岛银行", imageUrl: "../images/bank/bank21.gif", id: "QDB"},
                {name: "徽商银行", imageUrl: "../images/bank/bank22.png", id: "AHHSB"},
                {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                {name: "天津银行", imageUrl: "../images/bank/bank23.png", id: "TJB"},
                {name: "宁波银行", imageUrl: "../images/bank/bank24.gif", id: "NBCB"},
                {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                {name: "杭州银行", imageUrl: "../images/bank/bank25.jpg", id: "HCCB"}
            ];

            var bankListHtml = "";
            for (var i = 0; i < bankList.length; i++) {
                if (i <= 13) {
                    bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                } else {
                    bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                }
            }

            $(".bank-list").html(bankListHtml);
            $(".bank-list").append('<div class="bank-more"><h1>更多银行</h1></div>');
        } else if (thirdPayType == "B2C") {
            var bankList = [
                {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
                {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
                {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
                {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
                {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
                {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
                {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
                {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
                {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
                {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
                {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
                {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
                {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
                {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
                {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
                {name: "恒丰银行", imageUrl: "../images/bank/bank16.gif", id: "EGB"},
                {name: "浙商银行", imageUrl: "../images/bank/bank17.gif", id: "CZB"},
                {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
                {name: "上海银行", imageUrl: "../images/bank/bank19.gif", id: "SHB"},
                {name: "厦门银行", imageUrl: "../images/bank/bank20.jpg", id: "XMB"}
            ];

            var bankListHtml = "";
            for (var i = 0; i < bankList.length; i++) {
                if (i <= 13) {
                    bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                } else {
                    bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
                }
            }

            $(".bank-list").html(bankListHtml);
            $(".bank-list").append('<div class="bank-more"><h1>更多银行</h1></div>');
        }
        bankOperate();
    });

    $('.pay-type .m-personal li').on('click', function () {
        var $this = $(this);
        if (!$this.hasClass('disabled')) {
            if (!$this.hasClass('checked')) {
                $this.addClass('checked');
                $('.pay-type .m-bank li').removeClass('checked');
                $('.pay-type .pay-bottom .bank-list span').removeClass('checked');
            }
        }
    });
}

//订单评论
//订单评论
function evaluateDialog(id, flag,languagePackage) {
    if(languagePackage){
        var evaluateHtml = "",
            content = [
                languagePackage["非常不满意，各方面都差"],
                languagePackage['不满意，比较差'],
                languagePackage['一般，还需改善'],
                languagePackage['比较满意，仍可改善'],
                languagePackage['非常满意，无可挑剔']
            ];
        if (!flag) {
            evaluateHtml = '<div class="evaluate-page">' +
                '<ul class="m-star">' +
                '<li id="at_eva_1" name="at_eva_1">' +
                '</li>' +
                '<li id="at_eva_2" name="at_eva_2">' +
                '</li>' +
                '<li id="at_eva_3" name="at_eva_3">' +
                '</li>' +
                '<li id="at_eva_4" name="at_eva_4">' +
                '</li>' +
                '<li id="at_eva_5" name="at_eva_5">' +
                '</li>' +
                '</ul>' +
                '<h1 class="start-tips">'+languagePackage['您的评价会让他做的更好']+'</h1>' +
                '<div class="m-content">' +
                '<h2 class="comment hide"></h2>' +
                '<div class="content01 hide">' +
                '<span id="at_eva_one" name="at_eva_one">'+languagePackage['不正规']+'</span>' +
                '<span id="at_eva_two" name="at_eva_two">'+languagePackage['服务态度恶劣']+'</span>' +
                '<span id="at_eva_three" name="at_eva_three">'+languagePackage['效率一般']+'</span>' +
                '<span id="at_eva_four" name="at_eva_four">'+languagePackage['质量没保障']+'</span>' +
                '</div>' +
                '<div class="content02 hide">' +
                '<span id="at_eva_five" name="at_eva_five">'+languagePackage['企业正规']+'</span>' +
                '<span id="at_eva_six" name="at_eva_six">'+languagePackage['服务态度很好']+'</span>' +
                '<span id="at_eva_seven" name="at_eva_seven">'+languagePackage['效率高效']+'</span>' +
                '<span id="at_eva_eight" name="at_eva_eight">'+languagePackage['货物质量无差']+'</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            var d1 = dialogOpt({
                title: languagePackage['评论'],
                class: 'evaluate-dialog',
                content: evaluateHtml,
                textOkey: languagePackage['提交'],
                textOkeyId: 'at_eva_textOkeyId',
                textCancel: languagePackage['取消'],
                textCancelId: 'at_eva_textCancelId',
                closeId: 'at_eva_closeId',
                funcOkey: function () {
                    var star = $('.evaluate-dialog .m-star li.checked').length;
                    var content = $('.evaluate-dialog .m-content div span.checked');
                    var contentHtml = [];
                    if (star <= 0) {
                        alertReturn(languagePackage['请为本次交易打分']);
                        return false;
                    } else if (star > 0 && star < 5) {  //五颗星可以不选评价内容，少于五颗星就必须选择评价内容
                        if (content.length <= 0) {
                            alertReturn(languagePackage['请为本次交易指出不足之处']);
                            return false;
                        }
                    }

                    for (var i = 0; i < content.length; i++) {
                        contentHtml.push($('.evaluate-dialog .m-content div span.checked').eq(i).html());
                    }
                    var remark = contentHtml.join(',');
                    interface.evaluateOrder({
                        "orderId": id,
                        "star": star,
                        "remark": remark
                    }, function (resp) {
                        if (resp.code == 0) {
                            d1.remove();
                            window.location.reload();
                        } else {
                            alertReturn(resp.exception);
                        }
                    });
                }
            });


            //点击星星
            $('.evaluate-dialog .m-star li').on('click', function () {
                $('.evaluate-dialog .m-content div span').removeClass("checked");
                var _this = $(this);
                var _index = _this.index();
                _this.addClass("checked").prevAll("li").addClass("checked");
                _this.nextAll("li").removeClass("checked");
                $(".evaluate-dialog h1.start-tips").addClass("hide");  //"您的评价会让他做的更好" hide
                $(".evaluate-dialog .m-content h2.comment").removeClass("hide").html(content[_index]);
                $(".evaluate-dialog .m-content div").addClass("hide");
                if (_index == 4) {
                    $(".evaluate-dialog .m-content .content02").removeClass("hide");

                } else {
                    $(".evaluate-dialog .m-content .content01").removeClass("hide");
                }
            });

            //点击评价内容
            $('.evaluate-dialog .m-content div span').on('click', function () {
                $(this).toggleClass("checked");
            });
        }
        else {
            interface.queryEvaluate({
                orderId: id
            }, function (resp) {
                if (resp && resp.data) {
                    var starNum = resp.data.star || 0,
                        starRank = content[starNum - 1],
                        remark = resp.data.remark ? resp.data.remark.split(',') : [],
                        liStr = "",
                        spanStr = '';

                    for (var i = 0; i < starNum; i++) {
                        liStr += '<li class="checked">' + '</li>';
                    }
                    for (var j = 0; j < remark.length; j++) {
                        spanStr += '<span>' + remark[j] + '</span>';
                    }
                    evaluateHtml = '<div class="evaluate-page">' +
                        '<ul class="m-star">' + liStr + '</ul>' +
                        '<h1 class="start-tips">' + starRank + '</h1>' +
                        '<div class="m-content">' +
                        '<h2 class="comment "></h2>' +
                        '<div class="content01">' + spanStr + '</div>' +
                        '</div>' +
                        '</div>';
                    var d1 = dialogOpt({
                        title: languagePackage['查看评论'],
                        class: 'evaluate-dialog',
                        content: evaluateHtml,
                        textCancel: languagePackage['关闭']
                    })
                }
            })

        }
    }else{
        var evaluateHtml = "",
            content = [
                "非常不满意，各方面都差",
                "不满意，比较差",
                "一般，还需改善",
                "比较满意，仍可改善",
                "非常满意，无可挑剔"
            ];
        if (!flag) {
            evaluateHtml = '<div class="evaluate-page">' +
                '<ul class="m-star">' +
                '<li>' +
                '</li>' +
                '<li>' +
                '</li>' +
                '<li>' +
                '</li>' +
                '<li>' +
                '</li>' +
                '<li>' +
                '</li>' +
                '</ul>' +
                '<h1 class="start-tips">您的评价会让他做的更好</h1>' +
                '<div class="m-content m-content-edit">' + //去掉languagePackage['m-content-edit'] by liyc
                '<h2 class="comment hide"></h2>' +
                '<div class="content01 hide">' +
                '<span>不正规</span>' +
                '<span>服务态度恶劣</span>' +
                '<span>效率一般</span>' +
                '<span>质量没保障</span>' +
                '</div>' +
                '<div class="content02 hide">' +
                '<span>企业正规</span>' +
                '<span>服务态度很好</span>' +
                '<span>效率高效</span>' +
                '<span>货物质量无差</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            var d1 = dialogOpt({
                title: '评论',
                class: 'evaluate-dialog',
                content: evaluateHtml,
                textOkey: '提交',
                textCancel: '取消',
                funcOkey: function () {
                    var star = $('.evaluate-dialog .m-star li.checked').length;
                    var content = $('.evaluate-dialog .m-content div span.checked');
                    var contentHtml = [];
                    if (star <= 0) {
                        alertReturn('请为本次交易打分');
                        return false;
                    } else if (star > 0 && star < 5) {  //五颗星可以不选评价内容，少于五颗星就必须选择评价内容
                        if (content.length <= 0) {
                            alertReturn('请为本次交易指出不足之处');
                            return false;
                        }
                    }

                    for (var i = 0; i < content.length; i++) {
                        contentHtml.push($('.evaluate-dialog .m-content div span.checked').eq(i).html());
                    }
                    var remark = contentHtml.join(',');
                    interface.evaluateOrder({
                        "orderId": id,
                        "star": star,
                        "remark": remark
                    }, function (resp) {
                        if (resp.code == 0) {
                            d1.remove();
                            window.location.reload();
                        } else {
                            alertReturn(resp.exception);
                        }
                    });
                }
            });


            //点击星星
            $('.evaluate-dialog .m-star li').on('click', function () {
                $('.evaluate-dialog .m-content div span').removeClass("checked");
                var _this = $(this);
                var _index = _this.index();
                _this.addClass("checked").prevAll("li").addClass("checked");
                _this.nextAll("li").removeClass("checked");
                $(".evaluate-dialog h1.start-tips").addClass("hide");  //"您的评价会让他做的更好" hide
                $(".evaluate-dialog .m-content h2.comment").removeClass("hide").html(content[_index]);
                $(".evaluate-dialog .m-content div").addClass("hide");
                if (_index == 4) {
                    $(".evaluate-dialog .m-content .content02").removeClass("hide");

                } else {
                    $(".evaluate-dialog .m-content .content01").removeClass("hide");
                }
            });

            //点击评价内容
            $('.evaluate-dialog .m-content div span').on('click', function () {
                $(this).toggleClass("checked");
            });
        }
        else {
            interface.queryEvaluate({
                orderId: id
            }, function (resp) {
                if (resp && resp.data) {
                    var starNum = resp.data.star || 0,
                        starRank = content[starNum - 1],
                        remark = resp.data.remark ? resp.data.remark.split(',') : [],
                        liStr = "",
                        spanStr = '';

                    for (var i = 0; i < starNum; i++) {
                        liStr += '<li class="checked">' + '</li>';
                    }
                    for (var j = 0; j < remark.length; j++) {
                        spanStr += '<span>' + remark[j] + '</span>';
                    }
                    evaluateHtml = '<div class="evaluate-page">' +
                        '<ul class="m-star">' + liStr + '</ul>' +
                        '<h1 class="start-tips">' + starRank + '</h1>' +
                        '<div class="m-content">' +
                        '<h2 class="comment "></h2>' +
                        '<div class="content01">' + spanStr + '</div>' +
                        '</div>' +
                        '</div>';
                    var d1 = dialogOpt({
                        title: '查看评论',
                        class: 'evaluate-dialog',
                        content: evaluateHtml,
                        textCancel: '关闭'
                    })
                }
            })

        }
    }

}

/*
 *window.open打开新窗口充值支付*
 **/
function openwin(data) {
    OpenWindow = window.open("");
    OpenWindow.document.write("<TITLE></TITLE>");
    OpenWindow.document.write("<BODY BGCOLOR=#FFFFFF>");
    OpenWindow.document.write(data);
    OpenWindow.document.write("</BODY >");
    OpenWindow.document.write("</HTML>");
    OpenWindow.document.close();
}

/**
 * 获取国际化支持语言
 * 默认中文
 * @returns 'zh-CN':中文, 'en-US':英文
 */
function getAcceptLanguage() {
    var acceptLanguage = _GET_DATA('acceptLanguage');
    return acceptLanguage ? acceptLanguage : 'zh-CN';
}

/**
 * 当前是否为中文状态下
 * @returns true:是， false:不是
 */
function isZhCN() {
    return getAcceptLanguage() == 'zh-CN';
}

/**
 * 当前是否为英文状态下
 * @returns true:是， false:不是
 */
function isEnUS() {
    return getAcceptLanguage() == 'en-US';
}

/**
 * 设置中英切换
 * @param zh-CN：中文
 * @param en-US：英文
 */
function setAcceptLanguage(acceptLanguage) {//设置用户信息
    _SET_DATA('acceptLanguage', acceptLanguage);
}

function gpc_immediatePayment(data) {
    seajs.use(['./js/p_order.js'], function (orderListFunc) {
        interface.currentUserInfo(function (resp) {//查询个人接口获取余额
            if (resp.code == 0) {
                var payClass = '';
                if (Number(data.sumPrice) <= Number(resp.data.useableBalace)) {
                    payClass = 'checked';
                } else {
                    payClass = 'disabled';
                }
                var tradePasswordSet = resp.data.tradePasswordSet;
                var bankListHtml = gpc_getBanksHtml();
                var company = data.supplier.company;
                //无公司信息，取个人银行信息
                if (company == null) {
                    company = {};
                    //开户名称
                    company.bankUser = data.supplier.bankUser;
                    //开户银行
                    company.bankName = data.supplier.bank;
                    //开户银行支行
                    company.bankBranch = data.supplier.bankBranch;
                    //银行账号
                    company.bankCard = data.supplier.bankCard;
                    //电话
                    company.companyPhone = data.supplier.connectPhone;
                }
                var payHtml = '<div>' +
                    '<div class="content">' +
                    '<div class="status">付款中</div><h1 class="name">' + data.tenderBean.title + '</h1>' +
                    '<p class="con">订单号：' + data.orderNum + '</p>' +
                    '<p class="con">应付金额：<span class="pay-cash">' + data.sumPrice.toFixed(2) + '</span>元</p>' +
                    '<p class="tips">请您在1小时内完成支付，否则订单会被自动取消（以订单详情页为准）</br>' +
                    '多次流单用户账号将被冻结 ' +
                    '</p>' +
                    '</div>' +
                    '<div class="pay-type">' +
                    '<div class="pay-bottom">' +
                    '<h3>支付方式</h3>' +
                    '<ul id="payType">' +
                    '<li><a href="javascript:void(0);" class="pay-bottom-type pay-Active" id="payOnline">在线支付</a></li>' +
                    '<li><a href="javascript:void(0);" class="pay-bottom-type " id="payOther">线下转账</a></li>' +
                    '</ul>' +
                    '<div id="payType-payOnline" class="show">' +
                    '<ul class="m-personal">' +
                    '<li data-type="1" class="' + payClass + ' balance-pay">' +
                    '<i class=""></i><label>账户余额<span>' + resp.data.useableBalace.toFixed(2) + '</span>元</label>' +
                    '</li>' +
                    '</ul>' +
                    '<h3>网银支付</h3>' +
                    '<ul class="m-bank">' +
                    '<li data-thirdPayType="B2C" data-type="1">' +
                    '<i></i><label>个人网银</label>' +
                    '</li>' +
                    '<li data-thirdPayType="B2B" data-type="2">' +
                    '<i></i><label>企业网银</label>' +
                    '</li>' +
                    '</ul>' +
                    '<div class="bank-list">' + bankListHtml +
                    '<div class="bank-more"><h1>更多银行</h1></div>' +
                    '</div>' +
                    '</div>' +
                    '<div id="payType-payOther" class="payType-payOther hide">' +
                    '<ul>' +
                    '<p class="tips">请根据以下卖家认证的银行账户信息进行线下转账汇款，本次转账为全额付款。提货完成后需上传交易凭证，请牢记！ ' +
                    '</p>' +
                    '<li><label>开户名称:</label><span>' + (company.bankUser || "暂无") + '</span></li>' +
                    '<li><label>开户行:</label><span>' + ((company.bankBranch + '&nbsp;&nbsp;' + company.bankName) || "暂无") + '</span></li>' +
                    '<li><label>银行账号:</label><span>' + (company.bankCard || "暂无") + '</span></li>' +
                    '<li><label>公司电话:</label><span>' + (company.companyPhone || "暂无") + '</span></li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                var d2 = dialogOpt({
                    title: '订单付款',
                    class: 'pay-dialog',
                    content: payHtml,
                    textOkey: '立即支付',
                    textCancel: '取消',
                    btn: 'btn2',
                    funcOkey: function () {//payType: 支付方式:1余额,2网银转账,0线下转账,
                        var payPrimaryType = $.trim($("#payType").find('.pay-Active').attr('id'));
                        var thirdType = $('.pay-type .m-bank li.checked').attr('data-type');
                        var payType = $('.pay-type .m-personal li.checked').attr('data-type');
                        var id = data.id;
                        var isPay = 1;  //首次支付
                        var thirdPayType = $('.pay-type .m-bank li.checked').attr('data-thirdPayType');
                        var bankId = $('.pay-type .pay-bottom .bank-list span.checked').attr('data-id');
                        var params = {
                            leftPrice: null,
                            bankId: bankId,
                            thirdType: thirdType,
                            payType: payType,
                            id: id,
                            isPay: isPay,
                            baseData: data
                        };
                        if (payPrimaryType === 'payOnline') {
                            if (!(payType || thirdType)) {
                                alertReturn('请选择支付方式');
                                return false;
                            } else {
                                if (!payType) {
                                    if (!bankId) {
                                        alertReturn('请选择银行');
                                        return false;
                                    }
                                }
                            }
                            if (tradePasswordSet == 1) {
                                var params = {
                                    leftPrice: null,
                                    bankId: bankId,
                                    thirdType: thirdType,
                                    payType: payType,
                                    id: id,
                                    isPay: isPay,
                                    baseData: data
                                };
                                orderListFunc.tradePasswordDialog(params);//(null, bankId, thirdType, payType, id, isPay);
                            } else if (tradePasswordSet == 0) {
                                orderListFunc.noPassword(id);
                            }
                            d2.remove();
                        } else {
                            var params = {
                                leftPrice: null,
                                bankId: bankId,
                                thirdType: thirdType,
                                payType: 0,
                                id: id,
                                isPay: 3,
                                baseData: data
                            };
                            orderListFunc.tradePasswordDialog(params);//(null, bankId, thirdType, payType, id, isPay);
                        }

                    }
                });
                orderListFunc.choicePayType(resp);
                orderBankOperate(); //选择支付方式和银行
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    })
}
function gpc_getBanksHtml() {
    var bankListHtml = "",
        bankList = [
            {name: "工商银行", imageUrl: "../images/bank/bank01.gif", id: "ICBC"},
            {name: "农业银行", imageUrl: "../images/bank/bank02.gif", id: "ABC"},
            {name: "中国银行", imageUrl: "../images/bank/bank03.gif", id: "BC"},
            {name: "建设银行", imageUrl: "../images/bank/bank04.gif", id: "CBC"},
            {name: "交通银行", imageUrl: "../images/bank/bank05.gif", id: "CCB"},
            {name: "邮政银行", imageUrl: "../images/bank/bank06.gif", id: "PSBC"},
            {name: "中信银行", imageUrl: "../images/bank/bank07.gif", id: "CITIC"},
            {name: "民生银行", imageUrl: "../images/bank/bank08.gif", id: "CMSB"},
            {name: "兴业银行", imageUrl: "../images/bank/bank09.gif", id: "CIB"},
            {name: "光大银行", imageUrl: "../images/bank/bank10.gif", id: "CEB"},
            {name: "招商银行", imageUrl: "../images/bank/bank11.gif", id: "CMBC"},
            {name: "浦发银行", imageUrl: "../images/bank/bank12.gif", id: "SPDB"},
            {name: "北京银行", imageUrl: "../images/bank/bank13.gif", id: "BJB"},
            {name: "华夏银行", imageUrl: "../images/bank/bank14.gif", id: "HXB"},
            {name: "广发银行", imageUrl: "../images/bank/bank15.gif", id: "GDB"},
            {name: "恒丰银行", imageUrl: "../images/bank/bank16.gif", id: "EGB"},
            {name: "浙商银行", imageUrl: "../images/bank/bank17.gif", id: "CZB"},
            {name: "平安银行", imageUrl: "../images/bank/bank18.gif", id: "SDB"},
            {name: "上海银行", imageUrl: "../images/bank/bank19.gif", id: "SHB"},
            {name: "厦门银行", imageUrl: "../images/bank/bank20.jpg", id: "XMB"},
        ];
    for (var i = 0, len = bankList.length; i < len; i++) {
        if (i <= 13) {
            bankListHtml += '<span data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
        } else {
            bankListHtml += '<span class="hidden hide" data-id=' + bankList[i].id + '><i></i><img src=' + bankList[i].imageUrl + ' /></span>';
        }
    }
    return bankListHtml;
}

/**
 * 获取信誉值等级
 * @param value
 */
function reputationValueLevel(value) {
    var reputationClass;
    if (value <= 0) {
        reputationClass = 1;
    } else if (value > 0 && value <= 150) {
        reputationClass = 2;
    } else if (value > 150 && value <= 300) {
        reputationClass = 3;
    } else if (value > 300) {
        reputationClass = 4;
    }
    return reputationClass;
}

/**
 * 扣水量验证 不为空不超过20个字
 * @param value
 */
function buckleWaterRateCheck(value) {
    if (!value) {
        return false;
    }
    return value.length <= 20;
}

/**
 * 从url中获取后缀名
 * @param url http://dev-proj.oss-cn-qingdao.aliyuncs.com/petrocoke/2017102418944e59b5-8703-46df-b607-01a454a7ec91/个人信用报告lyc.pdf
 */
function getUrlSuffix(url) {
    var index1=url.lastIndexOf(".");
    var index2=url.length;
    var suffix=url.substring(index1+1,index2);
    return suffix;
}

/**
 * 从url中获取文件名称（包含后缀）
 * @param url http://dev-proj.oss-cn-qingdao.aliyuncs.com/petrocoke/2017102418944e59b5-8703-46df-b607-01a454a7ec91/个人信用报告lyc.pdf
 */
function getFileNameFromUrl(url) {
    var index1=url.lastIndexOf("/");
    var index2=url.length;
    return url.substring(index1+1,index2);
}

// 消息推送
function heatBeat(newMessageDialog) {
    var ws;//websocket实例
    var lockReconnect = false;//避免重复连接
    var wsUrl = seajs.wsHost + "/websocket?uid=" + getUser().data.id;

    function createWebSocket(url) {
        try {
            if ('WebSocket' in window) {
                ws = new WebSocket(url);
                initEventHandle();
            } else {
                alert('放学别走，请先升级完浏览器！');
            }
        } catch (e) {
            reconnect(url);
        }
    }

    function initEventHandle() {
        ws.onclose = function () {
            reconnect(wsUrl);
        };
        ws.onerror = function () {
            reconnect(wsUrl);
        };
        ws.onopen = function () {
            //心跳检测重置
            heartCheck.reset().start();
        };
        ws.onmessage = function (event) {
            var responseData = event.data;
            if (responseData == 'HeartBeat') {
                //如果获取到消息，心跳检测重置
                //拿到任何消息都说明当前连接是正常的
                heartCheck.reset().start();
                return false;
            }
            var resp = JSON.parse(responseData);
            switch (resp.code) {
                //新消息
                case 1: {
                    alertReturn(newMessageDialog);
                    // alertReturn('您有新的通知');
                    //未读数+1
                    var unreadNum = ($(".dot").html() ? ($(".dot").html() - 0) : 0) + 1;
                    var html = ' <div class="dot">' + unreadNum + '</div>';
                    $('.remind .remind-png :not(i)').remove();
                    $('.remind .remind-png').append(html);
                    // //滚动消息：resp.data.rollingContent不为空，添加到滚动消息里
                    // if(resp.data.rollingContent){
                    //     //TODO 滚动消息只用到resp.data.id, resp.data.rollingContent两个字段
                    //
                    // }
                    break;
                }
                //签协议弹出的框
                case 2: {
                    //TODO resp.data = {id:'协议id', orderId:'订单id', downloadUrl:'下载协议url'}
                    //双方都签订成功弹出该对话框 console.log('in case 2 '+resp.data);
                    var html = "<div class='Signed-tips'>" +
                        "<h4 class='fts-16'>"+orderCreated+"！</h4>" +
                        "<p class='color-9d'>"+orderPay+"。</p></div>" +
                        "<div class='Signed-go'>" +
                        "<p><a href='javascript:;' id='allSigned-goDetail'>"+orderDetail+"&gt;&gt;</a></p>" +
                        "<p><a href='javascript:;' id='allSigned-downloadUrl' data-downloadUrl=" + resp.data.downloadUrl + ">"+downloadAttachment+"&gt;&gt;</a></p></div>";
                    var line_opt = dialogOpt({
                        title: agreementNotice,
                        class: 'dialogOpt-sm',
                        content: html,
                        textCancel: closeButton,
                        funcCancel: function () {
                            line_opt.remove();
                        }

                    });
                    $("#allSigned-goDetail").off('click').on('click', function (e) {
                        line_opt.remove();
                        window.location.href = 'p_order_detail.html?orderId=' + resp.data.orderId;
                    })
                    $("#allSigned-downloadUrl").off('click').on('click', function (e) {
                        var url = $(this).attr('data-downloadUrl');
                        var iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        iframe.src = url;
                        document.body.appendChild(iframe);
                    })
                    break;
                }
                //更新个人信息
                case 3: {
                	setUser();
//                    resp.login = true;
//                    _SET_DATA('user', resp);
                	break;
                }
                default: {
                    break;
                }
            }
        };
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function () {
        	ws.close();
        };
    }

    function reconnect(url) {
        if (lockReconnect) return;
        lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        setTimeout(function () {
            createWebSocket(url);
            lockReconnect = false;
        }, 2000);
    }

    //心跳检测 ,websocket自动1分钟短
    var heartCheck = {
        timeout: 30000,//30秒
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function () {
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
        },
        start: function () {
            var self = this;
            this.timeoutObj = setTimeout(function () {
                //这里发送一个心跳，后端收到后，返回一个心跳消息，
                //onmessage拿到返回的心跳就说明连接正常
                ws.send("HeartBeat");
                self.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
                    ws.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, self.timeout)
            }, self.timeout)
        }
    }

    createWebSocket(wsUrl);
}

/**
 * 图片地址加上改参数后即可实现按中心截取240x240
 */
var center_240px = '?x-oss-process=image/resize,m_fill,w_240,h_240,limit_0/auto-orient,1/quality,q_90';

/**
 * 从当前url中获取当前页面，/ 为首页
 * @returns
 */
function getCurrentPage(){
    var url = window.location.href;
    var endIndex = url.lastIndexOf('.html');
    if(endIndex == -1){
        return "index_head_title";
    }
    var startIndex = url.lastIndexOf('/')+1;
    return url.substring(startIndex, endIndex)+'_head_title';
}

/**
 * 获取系统公共参数
 * MIN_BUY_QUANTITY - 起订量(最小申买量,默认30吨)
 * TENDER_BID_GROW - 出价递增值(单位元,默认5元)
 * ORDER_INTEGRALS_RATE - 订单金额兑换积分比例(默认0.025%)
 * @param key 参数key
 * @returns 参数值
 */
function commonData(key){
    var value = null;
    interface.commonData({'type': key}, function (resp) {
        if (resp.code === 0) {
            value = resp.data;
        } else {
            alertReturn(resp.exception);
        }
    }, function (resp) {
        alertReturn(resp.exception);
    }, false);
    return value;
}

/**
 * /判断是否微信登陆
 * @returns true：是；false：不是
 */
function isWXBrowser () {
    var ua = window.navigator.userAgent.toLowerCase();
//    console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}
/**
 * 获取url参数
 * @param paras: 参数名
 */
function requestParas(paras) {
    var url = location.href + "#";
    url = url.substring(0, url.indexOf("#"));
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    for (i = 0; j = paraString[i]; i++) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if (typeof returnValue == "undefined") return ""; else return returnValue;
}
/*
* 获取URL
*
* */
function requestParas(paras) {
    var url = location.href + "#";
    url = url.substring(0, url.indexOf("#"));
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    for (i = 0; j = paraString[i]; i++) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if (typeof returnValue == "undefined") return ""; else return returnValue;
}
