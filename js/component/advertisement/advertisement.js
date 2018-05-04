/**
 * @param require
 * @param exports
 * @param module
 * @returns
 */
define(function (require, exports, module) {
    var template = require("artTemplate");
    require("swiper");
    
    var advertisement = {
        /**
         * @param type 类型:1首页头条，2竞价头条,3...
         */    
        render:function (type) {
            var list = null;
            //调接口获取数据
            interface.advertisement({type:type},function(resp){
                if(resp.code == 0){
                    list = resp.data.content;
                    if(list.length === 1){
                    	advertisement.bindEvent=function(){
                    	 	var mySwiper = new Swiper('.swiper-container', {
				                autoplay: false
			            	});
                    	}
                    }
                }else{
                    alertReturn(resp.exception);
                }
            },null,false);
            var tpl = require('./advertisement.html');
            var templates = template.render(tpl)({list: list});
            this.el = $(templates);
            return this;
        },
        /**
         * 自动轮播、上一张、下一张
         * @returns
         */
        bindEvent:function () {
            var mySwiper = new Swiper('.swiper-container', {
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                loop: true,
                autoplay: 5000,
                autoplayDisableOnInteraction: false
            });
//          var oDiv=document.getElementsByClassName('swiper-wrapper')[0];
//          var oImg=oDiv.getElementsByTagName('img');
//          var scale=window.screen.width/window.screen.height;
//          if(document.body.offsetWidth < 1200) {
//				oImg.style.offsetHeight=scale*200;
//			}
            
        }
    }
    module.exports = advertisement;
});
