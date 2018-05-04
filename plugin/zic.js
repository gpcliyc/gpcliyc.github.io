/***********************************************
 * 插件说明：图片处理
 * 作   者：
 * 创建日期：
 ***********************************************
 *
 * 修改人员：
 * 修改说明：
 * 修改日期：
 ***********************************************
 */

function UploadPic() {
    this.sw = 0;
    this.sh = 0;
    this.tw = 0;
    this.th = 0;
    this.scale = 0;
    this.maxWidth = 0;
    this.maxHeight = 0;
    this.maxSize = 0;
    this.fileSize = 0;
    this.fileDate = null;
    this.fileType = "";
    this.fileName = "";
    this.input = null;
    this.canvas = null;
    this.mime = {};
    this.type = "";
    this.callback = function () {
    };
    this.loading = function () {
    };

}
UploadPic.prototype.init = function (options) {
    this.files = null;
    this.filesArr = [];
    if(this.input){
        this.input.value = "";//防止上传同一张图片没有触发change事件
    }
    this.maxWidth = options.maxWidth || 1000;
    this.maxHeight = options.maxHeight;
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.input = options.input;
    this.mime = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        bmp: "image/bmp",
        pdf:"application/pdf"
    };


    this.callback = options.callback || function () {
        };
    this.loading = options.loading || function () {
        };
    this._addEvent();
};
/**
 * @description 绑定事件
 * @param {Object} elm 元素
 * @param {Function} fn 绑定函数
 */
UploadPic.prototype._addEvent = function () {
    var _this = this;

    function tmpSelectFile(ev) {
        _this._handelSelectFile(ev);
    }

    this.input.addEventListener("change", tmpSelectFile, false);
};
/**
 * @description 绑定事件
 * @param {Object} elm 元素
 * @param {Function} fn 绑定函数
 */
UploadPic.prototype._handelSelectFile = function (ev) {
    //var file = ev.target.files[0];
    //允许上传多张图图片
    var files = this.files = ev.target.files;
    for (var i = 0, len = files.length; i < len; i++) {
        var file = files[i];
        this.type = file.type;
        // 如果没有文件类型，则通过后缀名判断（解决微信及360浏览器无法获取图片类型问题）
        if (!this.type) {
            this.type = this.mime[file.name.match(/\.([^\.]+)$/i)[1]];
        }
        if (!/image.(png|jpg|jpeg|bmp)/.test(this.type)) {
            alertReturn("选择的文件类型不是图片");
            return false;
        }
        if (file.size > this.maxSize) {
            alertReturn("选择文件大于" + this.maxSize / 1024 / 1024 + "M，请重新选择");
            return false;
        }
        this.fileName = file.name;
        this.fileSize = file.size;
        this.fileType = this.type;
        this.fileDate = file.lastModifiedDate;
        try {
            this._readImage(file);
        } catch (e) {
            return false;
        }
    }
};
/**
 * @description 读取图片文件
 * @param {Object} image 图片文件
 */
UploadPic.prototype._readImage = function (file) {
    var _this = this;

    function tmpCreateImage(uri) {
        _this._createImage(uri);
    }

    this.loading();
    this._getURI(file, tmpCreateImage);
};
/**
 * @description 通过文件获得URI
 * @param {Object} file 文件
 * @param {Function} callback 回调函数，返回文件对应URI
 * return {Bool} 返回false
 */
UploadPic.prototype._getURI = function (file, callback) {
    var reader = new FileReader();
    var _this = this;

    function tmpLoad() {
        // 头不带图片格式，需填写格式
        var re = /^data:base64,/;
        var ret = this.result + "";
        if (re.test(ret)) ret = ret.replace(re, "data:" + _this.mime[_this.fileType] + ";base64,");
        callback && callback(ret);
    }

    reader.onload = tmpLoad;
    reader.readAsDataURL(file);
    return false;
};
/**
 * @description 创建图片
 * @param {Object} image 图片文件
 */
UploadPic.prototype._createImage = function (uri) {
    var img = new Image();
    var _this = this;

    function tmpLoad() {
        //  _this._drawImage(this);
        _this._getImgPath(this);
    }

    function tmpError() {
        _this._showUploadError(this);
    }

    img.onload = tmpLoad;
    img.onerror = tmpError;
    img.src = uri;
};
UploadPic.prototype._showUploadError = function () {
    if (this.loading) {
        hideDialog();
    }
    this.flag = true;
    alertReturn("您上传的图片有问题!");
}
/*不压缩图片*/
UploadPic.prototype._getImgPath = function (img) {
    this._callBack(img.src);
}
/**
 * @description 创建Canvas将图片画至其中，并获得压缩后的文件
 * @param {Object} img 图片文件
 * @param {Number} width 图片最大宽度
 * @param {Number} height 图片最大高度
 * @param {Function} callback 回调函数，参数为图片base64编码
 * return {Object} 返回压缩后的图片
 */
UploadPic.prototype._drawImage = function (img, callback) {
    this.sw = img.width;
    this.sh = img.height;
    this.tw = img.width;
    this.th = img.height;
    this.scale = (this.tw / this.th).toFixed(2);
    if (this.sw > this.maxWidth) {
        this.sw = this.maxWidth;
        this.sh = Math.round(this.sw / this.scale);
    }
    if (this.sh > this.maxHeight) {
        this.sh = this.maxHeight;
        this.sw = Math.round(this.sh * this.scale);
    }
    this.canvas = document.createElement("canvas");
    var ctx = this.canvas.getContext("2d");
    this.canvas.width = this.sw;
    this.canvas.height = this.sh;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.sw, this.sh);
    //this.callback(this.canvas.toDataURL(this.type));
    this._callBack(this.canvas.toDataURL(this.type));
    ctx.clearRect(0, 0, this.tw, this.th);
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.canvas = null;
};
UploadPic.prototype._callBack = function (dataURL) {
    this.filesArr.push(dataURL);
    if (this.files && this.filesArr.length === this.files.length) {
        this.callback(this.filesArr.length === 1 ? this.filesArr.toString() : this.filesArr);
        this.files = null;
        this.filesArr = [];
    }

}
