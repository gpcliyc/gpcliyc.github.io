(function () {
    var _shareData = {},
        _href = window.location.href.split('#')[0];
    function _getTicket(url) {
        $.ajax({
            url: (seajs.jsTicketUrl || seajs.host + '/common/jsSignature') + '?url=' + encodeURIComponent(_href),
            type: "get",
            async: true,
            dataType: "json",
            success: function (resp) {
                var param = resp.data;
                _config(param);
                _addWxLicense();
            }, error: function (resp) {
            }
        });
    }

    function _config(param) {
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: param.appId, // 必填，公众号的唯一标识
            timestamp: param.timestamp, // 必填，生成签名的时间戳
            nonceStr: param.nonceStr, // 必填，生成签名的随机串
            signature: param.signature,// 必填，签名，见附录1
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',//,
                'onMenuShareQQ',
                'onMenuShareQZone'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
    }

    function _addWxLicense() {
        wx.ready(function () {
            wx.error(function (res) {
                console.log('error：' + res.errMsg);
            });
            wx.checkJsApi({
                jsApiList: [
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline',
                    'onMenuShareQQ',
                    'onMenuShareQZone',
                ],
                success: function (res) {
                    // alert('checkJsApi success:'+JSON.stringify(res));
                    console.log('checkJsApi success:' + JSON.stringify(res));
                }, error: function (res) {
                    // alert('checkJsApi error:'+JSON.stringify(res));
                }, fail: function (res) {
                    // alert('checkJsApi fail:'+JSON.stringify(res));//$.parseJSON(res).errMsg
                }
            });
            var share = {
                title: _shareData.title,
                desc: _shareData.desc,
                link: _shareData.link,
                imgUrl: _shareData.imgUrl,
                success: function (res) {
                    //  WeixinJSBridge.call('closeWindow');
                    if (_shareData.success) {
                        res.errMsg == 'sendAppMessage:ok' && _shareData.success('friend', res);
                        res.errMsg == 'shareTimeline:ok' && _shareData.success('timeline', res);
                    }
                }, error: function (res) {
                    console.log(JSON.stringify(res));
                }, cancel: function (res) {
                    console.log(JSON.stringify(res));
                }, fail: function (res) {
                    console.log(JSON.stringify(res));
                }
            };
            //分享好友
            wx.onMenuShareAppMessage(share);
            //分享朋友圈
            wx.onMenuShareTimeline(share);
            //分享到qq好友
            wx.onMenuShareQQ(share);
            //分享到qq空间
            wx.onMenuShareQZone(share);
        });
    }

    function _thCb(data) {
        var param = data.payload;
        //  signature=['jsapi_ticket='+param.jsapi_ticket,'noncestr='+param.nonceStr, 'timestamp='+param.timestamp,'url='+_shareData.link],
        //   s=new jsSHA(signature.join('&'),"TEXT"),signatureHex=s.getHash("SHA-1","HEX");
        _config(param);
        _addWxLicense();

    }

    function _wx(shareData, url) {
        _shareData = shareData;
        _getTicket(url);
    }

    window.thJsCallWx = {
        thCb: _thCb,
        callWx: _wx
    }
})();