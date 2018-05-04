/**
 * Created by like on 2017/5/21.
 */
define(function (require, exports, module) {
    function showImg(outdiv, indiv, bigimg, thiselement) {
        var winW = $(window).width();
        var winH = $(window).height();
        var src = $(thiselement).attr('src');
        $(bigimg).attr("src", src);
        $("<img/>").attr("src", src).load(function () {
            var imgW = this.width;
            var imgH = this.height;
            var scale = imgW / imgH;
            if (imgW > winW && imgH < winH) {
                var h = Math.abs((imgH - winH) / 2);
                $(indiv).css({"width": imgW + "px", "height": imgH + 'px', "left": 0, top: h});
                $(bigimg).css("width", "100%").css("height", "100%");
            } else if (imgW < winW && imgH > winH) {
                var w = Math.abs((imgW - winW) / 2);
                $(indiv).css({"width": imgW + "px", "height": imgH + 'px', "left": w, top: 0});
                $(bigimg).css("height", "100%").css("width", "100%");
            } else if (imgW > winW && imgH > winH) {
                $(indiv).css({"width": winW +"px", "height": winH  + 'px'});
                $(bigimg).css("height", "auto").css("width", "auto");
            }
            else {
                var w = (winW - imgW) / 2;
                var h = (winH - imgH) / 2;
                $(indiv).css({'width': imgW + 'px', "height": imgH + 'px', "left": w, "top": h});
                $(bigimg).css("width", imgW + 'px').css("height", imgH + 'px');
             }
        });
        $(outdiv).fadeIn("fast");
    }
    function render(options) {
        var $ = require('jquery');
        if ($ && !!$('#outdiv').length) {
            $('#outdiv').remove();
        }
        var settings = {
            imgArr: [],//所有照片
            thiselement: null,//当前显示的照片
            showPre: true ,//显示左右箭头
            backdrop:true //点击阴影部分关闭图片预览
        };
        $.extend(settings, options || (options = {}));
        if (!$.isArray(settings.imgArr)) {
            return void 0;
        }
        if (!settings.thiselement) {
            settings.thiselement = $('<img src=' + settings.imgArr[0] + '>');
        }

        var html = '<div class="result" id="outdiv">' +
            '<div  id="previewPrev" style="position:absolute;font-size: 60px;top: 50%;color: #FFFFFF;left: 140px;cursor: pointer;z-index: 1;text-shadow: 2px 2px 2px #cccccc"></div>' +
            '<div class="indiv">' +
            "<span class='preViewClose'  id='btn-close'></span>" +
            '<img class="imgresult" id="bigimg" src="">' +
            '</div>' +
            '<div  id="previewNext" style="position:absolute;font-size: 60px;top: 50%;color: #FFFFFF;right:140px; 140px;cursor: pointer;z-index: 1;text-shadow: 2px 2px 2px #cccccc"></div>' +
            '</div>';
        $('body').append(html);
        var $prev = $('#outdiv').find('#previewPrev'),
            $next = $('#outdiv').find('#previewNext');
        if (!!settings.showPre) {
            var preClass = {
                prev: ["glyphicon", "glyphicon-chevron-left"],
                next: ["glyphicon", "glyphicon-chevron-right"]
            };

            $prev.addClass(preClass.prev.join(' '));
            $next.addClass(preClass.next.join(' '));
        } else {
            $prev.remove();
            $next.remove();
        }
        var imgArr = settings.imgArr,
            size = imgArr.length;
        if ( settings.backdrop) {
            $("#outdiv").css("cursor", 'url(../images/cursor/2.ico),auto');
        } else {
            $("#outdiv").css("cursor", 'default');
        }
        $("#outdiv").unbind().bind({
            "click":function (e) {
                if (settings.backdrop && $(e.target).attr('id') !== $("#previewPrev").attr('id')&&$(e.target).attr('id') !== $("#previewNext").attr('id')) {
                    $(this).fadeOut("slow").remove();
                }
            }
           //去掉点击图片不让图片消失$(e.target)[0] === this
            // "mouseenter":function (e) {

            //     if ( settings.backdrop) {
            //         $(this).css("cursor", 'zoom-out');
            //     } else {
            //         $(this).css("cursor", 'default');
            //     }
            // }
        })
        $('#btn-close').click(function (e) {
            $('#outdiv').fadeOut('slow').remove();
        });
        $('#previewPrev,#previewNext').click(function (e) {
            var src = $('#bigimg').attr('src'),
                idName = $(e.currentTarget).attr('id'),
                index = 0,
                imgIndex = 0;
            for (var i = 0; i < imgArr.length; i++) {
                if (imgArr[i] === src) {
                    index = i;
                    break;
                }
            }
            if (size <= 1) {
                return;
            } else if (size === 2) {
                if (index === 0) {
                    imgIndex = 1;
                } else {
                    imgIndex = 0;
                }

            } else {
                switch (idName) {
                    case "previewNext":
                        if (index === size - 1) {
                            imgIndex = 0;
                        } else {
                            imgIndex = index + 1;
                        }
                        break;
                    case "previewPrev":
                        if (index === 0) {
                            imgIndex = size - 1;
                        } else {
                            imgIndex = index - 1;
                        }

                        break;
                }

            }
            var img = "<img src=" + imgArr[imgIndex] + ">",
                thiselement = $(img);
            showImg("#outdiv", ".indiv", "#bigimg", thiselement);
        });
        showImg("#outdiv", ".indiv", "#bigimg", settings.thiselement);
    }

    module.exports = {
        render: render
    }
});
