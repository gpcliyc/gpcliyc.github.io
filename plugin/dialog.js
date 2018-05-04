// utf-8

define(function(require, exports, module) {

    var $ = require("jquery");

    function Dialog(content, options) {
      var defaults = { // 默认值
            title: '',
            // 标题文本，若不想显示title请通过CSS设置其display为none
            showTitle: true,
            // 是否显示标题栏。
            closeText: '[关闭]',
            // 关闭按钮文字，若不想显示关闭按钮请通过CSS设置其display为none
            draggable: true,
            // 是否移动
            modal: true,
            // 是否是模态对话框
            center: true,
            // 是否居中。
            fixed: true,
            // 是否跟随页面滚动。
            time: 0,
            // 自动关闭时间，为0表示不会自动关闭。
            id: false // 对话框的id，若为false，则由系统自动产生一个唯一id。
        };

      var options = $.extend(defaults, options);
      var theDialog = $('<div></div>').hide().appendTo(document.body).css({
        background: 'rgba(0, 0, 0, 0.5)',
        color: '#fff',
        padding: '5px 10px',
        position: 'fixed',
        top: '75px',
        left: '50%',
        textAlign: 'center',
        zIndex: 20
      });

      this.setContent = function(content) {
        theDialog.html(content);
      }

      /**
       * 构造方法
       * @return
       */
      this.init = function() {
        $('body').append(theDialog);
      }

      /**
       * 显示对话框
       * @return
       */
      this.show = function() {
        theDialog.css("display","block");
        setTimeout(function () {
          theDialog.fadeOut();
        }, 1000);
      }

      /**
       * 隐藏对话框
       * @return
       */
      this.hide = function() {
        theDialog.css("display", "none");
      }
    }

    module.exports = Dialog;
});
