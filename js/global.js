/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module) {
    var template = require("artTemplate");

    function dateYMDHMSFormat(date) {
        if (date) {
            return (new Date(date)).Format("yyyy-MM-dd  hh:mm");
        } else {
            return "";
        }
    }

    function dateYMDHMFormat(date) {
        if (date) {
            return (new Date(date)).Format("yyyy-MM-dd hh:mm:ss");
        } else {
            return "";
        }
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

    template.helper('dateYMDHMSFormat', function (date) {
        return dateYMDHMSFormat(date);
    });

    template.helper('dateYMDHMFormat', function (date) {
        return dateYMDHMFormat(date);
    });

    template.helper('dateFormat', function (date) {
        return dateFormat(date);
    });

    template.helper('f_double', function (num) {
        return f_double(num);
    });

    module.exports = {
        "dateYMDHMSFormat": dateYMDHMSFormat,
        "dateYMDHMFormat": dateYMDHMFormat,
        "f_double": f_double
    };
});

