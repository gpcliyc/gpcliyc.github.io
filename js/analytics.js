/**
 * Created by weigangqiu on 15-9-20.
 */

/**
 * 百度统计代码 / GrowingIO统计代码
 */
define(function (require, exports, module) {
    //百度统计代码
    //var _hmt = _hmt || [];
    //(function () {
    //    var hm = document.createElement("script");
    //    hm.src = "//hm.baidu.com/hm.js?263258dc4aa59f43e436bfd7cb33ea26";
    //    var s = document.getElementsByTagName("script")[0];
    //    s.parentNode.insertBefore(hm, s);
    //})();

    //GrowingIO统计
    var _vds = _vds || [];
    window._vds = _vds;
    (function(){
        _vds.push(['setAccountId', 'b4fe5e8c9c304785']);
        (function() {
            var vds = document.createElement('script');
            vds.type='text/javascript';
            vds.async = true;
            vds.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'dn-growing.qbox.me/vds.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(vds, s);
        })();
    })();
});
