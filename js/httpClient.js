/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-28 12:44:43
 */
/*
 * 统一ajax请求
 */
// 封装ajax
function ajax(url, para, success, error,loading) {
    $.ajax({
        type: para.type ? para.type : 'GET',
        url: url,
        contentType: 'application/json',
        dataType: para.dataType || 'json',
        async: para.async,
        data: para.type == 'POST' ? JSON.stringify(para.data) : para.data,
  		  xhrFields: {
  		  	withCredentials: true // 确保请求会携带上Cookie
        },
        beforeSend: function (xhr) {
            var user = getUser();
            if (user && user.login) {
                xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
            }
            if(loading){
                showLoading('.loadingA');
            }
//            设置中英 zh-CN/en_US
            xhr.setRequestHeader("Accept-Language", getAcceptLanguage());
        },
        success: function (res) {
            if(loading){
                hideLoading('.loadingA');
            }
            if (success)
                success.call(this,res);
        },
        error: function (request) {
            if(loading){
                hideLoading('.loadingA');
            }
            var res = request.responseText;
            if (typeof(res) == 'string') {
                res = JSON.parse(request.responseText);
            }
            if (res && res.code == 401) {//token过期需要删除
                var user = getUser();
                delUser(user);
                window.location.href = '/';
            }
            if (request.httpStatus == 404) {  //404页面
                 window.location.href = 'p_error_404.html';
            }
            if (error){
                error(res);
            } else {
                alertReturn(resp.exception);
            }
        }
    });
}

function ajax_general(option, para, success, error,loading) {
    if (option.cache) {
        var data = _GET_DATA(action + option.specialdata);
        if (data) {
            success(data);
            return;
        }
    }

    if (option.async == undefined) {
        option.async = true;
    }
    option.type = option.type || 'POST';
    var url = seajs.host + option.action;
    if(url.indexOf('?')>0){
        url = url+"&t="+new Date().getTime();
    }else{
        url = url+"?t="+new Date().getTime();
    }
    option.data = para;
    ajax(url, option, function (res) {
        if (option.cache) {
            //_SET_DATA(action + para.specialdata,res,option.cache);
        }
        success.call(this,res);
    }, error,loading);
}

function isIE9() {
    try {
        var browser = navigator.appName
        var b_version = navigator.appVersion
        var version = b_version.split(";");
        var trim_Version = version[1].replace(/[ ]/g, "");
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
            return true;
        }
        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
            return true;
        }
        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            return true;
        }
        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
            return true; // 需要支持IE9
        }
    } catch (e) {
        return false;
    }
    return false;
}
