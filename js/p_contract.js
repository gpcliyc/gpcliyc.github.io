/**
 * @authors bzehua (bzehua@uworks.cc)
 * @date    2016-12-21 14:44:43
 */
define(function (require, exports, module, underscore) {
    underscore = underscore || require('underscore-min');
    var $ = require("jquery");
    var common = require("common");
    var analytics = require("analytics");
    var template = require("artTemplate");
    var zic = require("zic");
    require('underscore-min');

    var webuploader =require("webuploader");
    var http = require("http");
    require("interface");
    require("pagination");
    var global = require("global");
    var header = require("header");
    var previewImages = require('preViewImages');
    var languagePackage = null;
    underscore;
    header.showHeader();
    header.showFooter();
    header.serviceOnline();

    var uIdCard = new UploadPic();
    var petrolType = 1;
    var status;//协议状态及左侧菜单选中状态 status=0代表全部协议；status=1代表待签协议；status=2代表已签协议菜单
    //协议页面tab=0代表全部协议；tab=1代表待签协议；tab=2代表已签协议
    var tab = request('tab');
    if (tab == 1) {
        status = 1;
    } else if (tab == 2) {
        status = 2;
    }

    var user = getUser();
    var contractListFunc = {};
    /*初始化*/
    contractListFunc.init = function () {
        this.template();
        this.selectLanguage();
        this.renderBlock();

        this.count(); //协议状态
        this.opt()//搜索部分
        this.leftMenu(status);//左侧菜单
        this.contractList(1); //协议列表

    }
    contractListFunc.template = function () {
        /**
         * 获取是线上还是线下签订的
         */
        template.helper('getSignType', function (data) {
            if (data.buyerUploadUrl && data.supplierUploadUrl) {
                return languagePackage['线下'];
            }
            return languagePackage['线上'];
        });

        template.helper('JSONstringfy', function (data) {
            return JSON.stringify(data);
        });

        template.helper('setLanguagePackage',function (key) {
            if(key in languagePackage){
                return languagePackage[key];
            }
        })

        template.helper('setLanguagePackageCss',function (key) {
            if(key in languagePackage['css']){
                return languagePackage['css'][key];
            }
        })
    }
    contractListFunc.selectLanguage = function () {
        var language = getAcceptLanguage();
        $.ajaxSettings.async = false;
        $.getJSON('../js/component/p_bid_interNational/p_bid_hall.json',function (resp) {

            if(resp){
                for(var i=resp.length-1;i>=0;i--){
                    var keys = _.keys(resp[i]);
                    if(language === keys[0]){
                        languagePackage = resp[i][language];
                        break ;
                    }
                }
            }
        })
    }
    contractListFunc.renderBlock = function () {
       $("#agreemenTlist").html(template('t:j_agreemenTlist'));
       $("#tenderQuery").html(template('t:j_tenderQuery'));
    }
    contractListFunc.leftMenu = function (status) {
        if (status) {//选中菜单
            $('.mod-menu .item li:eq(' + status + ')').addClass('active').siblings().removeClass('active');
        }

        $(".mod-menu .item li").off('click').on('click', function () {//点击tab
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            contractListFunc.contractList(1);
        });
    }

    contractListFunc.opt = function () {
        $('.find').off('click').on('click', function () {//查询按钮
            contractListFunc.contractList(1);
        })

        $(document).keyup(function (event) {//回车查询按钮
            if (event.keyCode == 13) {
                $('.find').click();
            }
        });

        $('.reset').off('click').on('click', function () {//重置按钮
            $('.buyer').val('');
            $('.seller').val('');
            $('.tenderName').val('');
            $("#bidType").find("option").eq(0).attr("selected", true);
            $("#bidType").val(languagePackage['全部招标']);
            contractListFunc.contractList(1);
        })
    }
    var offline_opt;
    /*线下签订我签订对方未签订*/
    contractListFunc.offLineMeSigned = function (json) {

        //判断我是卖家还是卖家
        var identity = this.getParterAndMeInfo(json);
        var imgShowList = json[identity.pre + "UploadUrl"].split(",");
        var htmlStr = contractListFunc.getImgListStr(imgShowList);
        var buyerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.name + "：</h4></div><div class='offline-item1 color-success'><p id='at_contract_ysc1' name='at_contract_ysc1'>"+languagePackage['已上传协议！']+"</p></div></div>";
        buyerHtml = buyerHtml + '<div class="offline-item"><div class="uploader-list clearfloat show-img-list">'+htmlStr+'</div></div>';
        var suppilerHtml = "<div  class='offline-item clearfloat'><div  class='offline-title'><h4>" + identity.parter + "：</h4></div><div class='offline-item1'><P class='color-9d'>"+languagePackage['等待上传协议...']+"</P><p><button id='meSigned-notice' name='meSigned-notice'>"+languagePackage['提醒'] + identity.parter +languagePackage['上传']+"</button></p></div><div class='offline-item1'></div></div>";
        interface.hoverMsg({id: identity.parterId}, function (resp) {
            if (resp.code === 0) {
                var reputationValue = reputationValueLevel(resp.data.reputationValue);
                var html = "<div class='Signed-tips'>" +
                    "<h4 class='fts-16'>"+languagePackage['您已成功签署购销协议，双方均签署成功后，即可生成订单！']+"<span class='color-41'>"+languagePackage['联系对方']+"</span></h4>" +
                    "<div class='w-supplier w-supplier-2' style='position: absolute;top: 18px;left: 456px;height: 20px;width: 57px;'>" +
                    "<div class='w-credibility'>" +
                    "<h4>" + resp.data.name + "</h4>" +
                    "<h5><tt>" + resp.data.star + "</tt><i>" + resp.data.orderSuccessCount + " 单</i></h5>" +
                    "<dl>" +
                    "<dt class='w-credibility-" + reputationValue + "'></dt>" +
                    "<dd>"+languagePackage['信誉值']+"：" + resp.data.reputationValue + "</dd>" +
                    "<dd>"+languagePackage['电话']+"： +86" + resp.data.mobile + "</dd>" +
                    "</dl>" +
                    "</div>" +
                    "</div>" +
                    "</div>" + buyerHtml + suppilerHtml;
                var line_opt = dialogOpt({
                    title: languagePackage['签署协议通知'],
                    class: 'dialogOpt-lg',
                    content: html,
                    textCancel: languagePackage['关闭'],
                    textCancelId: 'at_contract_line_opt_canid',
                    closeId: 'at_contract_line_opt_closeid',
                    funcCancel: function () {
                        line_opt.remove();
                        contractListFunc.init();
                    }

                });
                /*检查有没有提醒过*/
                !!json.remind ? $("#meSigned-notice").removeAttr('disabled') : $("#meSigned-notice").attr('disabled', true);
                contractListFunc.bindOfflineEvent(json);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }
    contractListFunc.bindOfflineEvent = function (json) {
        $(".offline-item1 img").off('click').on('click', function (e) {
            var url = [$(this).attr('src')];
            previewImages.render({
                imgArr: url,
                thiselement: $(this),
                showPre: false
            });
        })
        $(".show-img-list .file-item").off('mouseover').on('mouseover', function() {
            // $(this).find(".file-panel").css('height','130px');
            $(this).find(".file-panel").stop().animate({height: 130});
        });
        $(".show-img-list .file-item").off('mouseleave').on('mouseleave', function() {
            $(this).find(".file-panel").stop().animate({height: 0});
        });
        $(".show-img-list .file-panel .showImg").off('click').on('click', function (e) {
            var retuenUrl = $(this).attr('src');
            var suffix = contractListFunc.getUrlSuffix(retuenUrl);
            if(suffix == 'pdf'){
                window.open(retuenUrl);
            }else{
                var url = [$(this).attr('src')];
                previewImages.render({
                    imgArr: url,
                    thiselement: $(this),
                    showPre: false
                });
            }

        })
        $("#offline-go").off('click').on('click', function (e) {
            if(json.orderPayType==0){
                window.location.href = 'p_order_detail_offLine.html?orderId=' + json.orderId;
            }else{
                window.location.href = 'p_order_detail.html?orderId=' + json.orderId;
            }
        })
        $("#meSigned-notice").off('click').on('click', function (e) {
            interface.remind({id: json.id}, function (resp) {
                if (resp.code === 0) {
                    alertReturn(languagePackage["提醒成功，等待对方上传。"]);
                    $("#meSigned-notice").attr('disabled', true);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        })
    }
    contractListFunc.getUrlSuffix = function (url) {
        var index1=url.lastIndexOf(".");
        var index2=url.length;
        var suffix=url.substring(index1+1,index2);
        return suffix;
    }
    contractListFunc.getParterAndMeInfo = function (json) {
        //判断我是卖家还是卖家
        var identity = {
            pre: "",
            name: "",
            parter: "",
            parterId: ""
        };
        if(json.buyers){
            identity.name = languagePackage["买方"];
            identity.pre = 'buyer';
            identity.parter = languagePackage["卖方"];
            identity.parterPre = 'supplier';
            identity.parterId = json['supplier'];
        }else{
            identity.name = languagePackage["卖方"];
            identity.pre = 'supplier';
            identity.parterPre = 'buyer';
            identity.parter = languagePackage["买方"];
            identity.parterId = json['buyer'];
        }
//        var user = getUser();
//        for (var key in json) {
//            if (json[key] == user.data.id) {
//                if (key === 'buyer') {
//                    identity.name = "买家";
//                    identity.pre = 'buyer';
//                    identity.parterPre = 'supplier';
//                    identity.parter = "卖家";
//                    identity.parterId = json['supplier'];
//                    break;
//                } else {
//                    identity.name = "卖家";
//                    identity.pre = 'supplier';
//                    identity.parterPre = 'buyer';
//                    identity.parter = "买家";
//                    identity.parterId = json['buyer'];
//                    break;
//                }
//            }
//        }
        return identity;
    }
    /*线下签订双方签订*/
    contractListFunc.offLineAllSigned = function (json) {
        var identity = this.getParterAndMeInfo(json);
        var buyerImgShowList = json[identity.parterPre + "UploadUrl"].split(",");
        var supplierImgShowList = json[identity.pre + "UploadUrl"].split(",");
        var buyerHtmlStr = contractListFunc.getImgListStr(buyerImgShowList);
        var supplierHtmlStr = contractListFunc.getImgListStr(supplierImgShowList);
        // var htmlArr = [];
        // _.each(imgShowList, function (item, index) {
        //     var suffix =contractListFunc.getUrlSuffix(imgShowList[index]);
        //     var middleStr = '';
        //     if(suffix == 'pdf'){
        //         middleStr = '<div><div class="pdf-text">PDF</div><div class="info"></div></div>'
        //     }else{
        //         middleStr = '<img style="height: 100%;width: 100%;" src="' + imgShowList[index] + '"/>' ;
        //     }
        //     htmlArr.push('<div class="file-item thumbnail" src="' + imgShowList[index] + '" >' +
        //         middleStr +
        //             '<div class="file-panel"><p class="show-top showImg" src="' + imgShowList[index] + '">查看大图</p></div>'+
        //         '</div>'
        //   );
        // })
        // var htmlStr = htmlArr.join('');
        // var htmlStr = contractListFunc.getImgListStr(imgShowList);
        var buyerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.name + "：</h4></div><div class='offline-item1 color-success'><p id='at_contract_ysc2' name='at_contract_ysc2'>"+languagePackage['已上传协议！']+"</p></div></div>";
        buyerHtml = buyerHtml + '<div class="offline-item"><div class="uploader-list clearfloat show-img-list">'+buyerHtmlStr+'</div></div>';
        var suppilerHtml = "<div class='offline-item clearfloat'><div class='offline-title'><h4>" + identity.parter + "：</h4></div><div class='offline-item1 color-success'><p id='at_contract_ysc3' name='at_contract_ysc3'>"+languagePackage['已上传协议！']+"</p></div></div>";
        suppilerHtml = suppilerHtml + '<div class="offline-item"><div class="uploader-list clearfloat show-img-list">'+supplierHtmlStr+'</div></div>';
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>"+languagePackage['双方上传协议成功！请前往订单详情进行下一步交易～']+"<a class='color-41' id='offline-go' id='at_contract_line_out_detail' name='at_contract_line_out_detail'> "+languagePackage['前往订单详情']+"&gt;&gt;</a></h4>" +
            "</div>" + buyerHtml + suppilerHtml;
        var line_opt = dialogOpt({
            title: languagePackage['签署协议通知'],
            class: 'dialogOpt-lg',
            content: html,
            textCancel: languagePackage['关闭'],
            textCancelId: 'at_contract_line_opt_canid',
            closeId: 'at_contract_line_opt_closeid',
            funcCancel: function () {
                line_opt.remove();
                contractListFunc.init();
            }

        });
        contractListFunc.bindOfflineEvent(json);
    }
    contractListFunc.getImgListStr = function (imgShowList) {
        var htmlArr = [];
        _.each(imgShowList, function (item, index) {
            var suffix =contractListFunc.getUrlSuffix(imgShowList[index]);
            var middleStr = '';
            if(suffix == 'pdf'){
                middleStr = '<div><div class="pdf-text">PDF</div><div class="info">'+getFileNameFromUrl(imgShowList[index])+'</div></div>'
            }else{
                middleStr = '<img style="height: 100%;width: 100%;" src="' + imgShowList[index] + '"/>' ;
            }
            htmlArr.push('<div class="file-item thumbnail" src="' + imgShowList[index] + '" >' +
                middleStr +
                '<div class="file-panel"><p class="show-top showImg" src="' + imgShowList[index] + '" id="at_contract_showImg1" name="at_contract_showImg1">'+languagePackage['查看大图']+'</p></div>'+
                '</div>'
            );
        })
        var htmlStr = htmlArr.join('');
        return htmlStr;
    }
    /*协议列表*/
    contractListFunc.contractList = function (page) {
        var pagenum;
        if (page) {
            pagenum = page;
        } else {
            pagenum = $("#pageNum").val();
        }
        var status = $(".mod-menu .item li.active").attr('data-status');
        var buyerName = $('.buyer').val();
        var supplierName = $('.seller').val();
        var title = $('.tenderName').val();
        var type = $("#bidType option:selected").html();//1供给标协议,2需求标协议
        switch (type) {
            case languagePackage['全部招标']:
                type = '';
                petrolType = '';
                break;
            case languagePackage['石油焦']+'-'+languagePackage['供应招标']:
                type = 1;
                petrolType = 1;
                break;
            case languagePackage['石油焦']+'-'+languagePackage['采购招标']:
                type = 2;
                petrolType = 1;
                break;
            case languagePackage['煅后焦']+'-'+languagePackage['供应招标']:
                type = 1;
                petrolType = 2;
                break;
            case languagePackage['煅后焦']+'-'+languagePackage['采购招标']:
                type = 2;
                petrolType = 2;
                break;
            case languagePackage['焦炭']+'-'+languagePackage['供应招标']:
                type = 1;
                petrolType = 3;
                break;
            case languagePackage['焦炭']+'-'+languagePackage['采购招标']:
                type = 2;
                petrolType = 3;
                break;
        }
        var loading = "loading";
        interface.contractList({
                buyerName: buyerName,
                supplierName: supplierName,
                tenderNum: title,
                status: status,
                type: type,
                pageSize: 10,
                pageNum: pagenum,
                petrolType:petrolType
            }, function (resp) {
                var userId = user.data.id;
                if (resp.data.content.length > 0) {
                    $("#j_contractList").html(template('t:j_contractList', {list: resp.data.content, userData: user.data}));
                    $("#pagination").pagination(resp.data.totalElements, {
                        num_edge_entries: 3,//此属性控制省略号后面的个数
                        num_display_entries: 3,//连续分页主体部分显示的分页条目数,可选参数，默认是10
                        items_per_page: 10, // 每页显示的条目数
                        current_page: pagenum - 1,//当前选中的页面,可选参数，默认是0，表示第1页
                        callback: contractListFunc.contractList_pageCallback,
                        prev_text: languagePackage["上一页"],
                        next_text: languagePackage["下一页"],
                    });
                    if (resp.data.totalPages == 1) {
                        $('#pagination').html('');
                        $('#pageNum').val(1);
                    }
                    contractListFunc.optBtn();
                    $('.offline').on('click', function () {
                        var user = getUser();
                        var $this = $(this);
//                        var id = $(this).attr('data-id').split(',');
//                        var partner = _.filter(id, function (item, index) {
//                            return item != user.data.id;
//                        }).join();
                        var partner = $(this).attr('data-id');
                        interface.hoverMsg({id: partner}, function (resp) {
                            if (resp.code === 0) {
                                var reputationValue = reputationValueLevel(resp.data.reputationValue);
                                var downloadUrl = $this.attr('data-downloadUrl');
                                var json = JSON.parse($this.attr('data-json'));
                                var id = $this.parents('.item').attr('data-id');
                                /**
                                var offlineHtml = "<div class='offline-deal-download' style='border-bottom: 1px solid #C9C9C9'>" +
                                    "<p >请<span class='color-41 offline-deal-contact'>&nbsp;联系对方</span>，商议协议签订方式或签订地点。如已签订，点击下方进行上传。</p>" +
                                    "<div class='w-supplier w-supplier-2' style='position: absolute;top: 20px;left: 30px;height: 20px;width: 57px;'>" +
                                    "<div class='w-credibility'>" +
                                    "<h4>" + resp.data.name + "</h4>" +
                                    "<h5><tt>" + resp.data.star + "</tt><i>" + resp.data.orderSuccessCount + "单</i></h5>" +
                                    "<dl>" +
                                    "<dt class='w-credibility-" + reputationValue + "'></dt>" +
                                    "<dd>信誉值：" + resp.data.reputationValue + "</dd>" +
                                    "<dd>电话：" + resp.data.mobile + "</dd>" +
                                    "</dl>" +
                                    "</div>" +
                                    "</div>" +
                                    "</div>" +
                                    "<div class='offline-deal-download'><label>下载协议:</label><a href=" + downloadUrl + " class='download-agreement'>立即下载</a><span class='color-9d'>线下签订协议，请先下载协议。</span></div>" +
                                    "<div class='offline-deal-upload'>" +
                                    "<div class='item item1'>上传协议:</div>" +
                                    "<div class='item item2'><p class='item-title'>不能超过 2M</p><p>PNG、JPG、JPEG、</p>" +
                                    "<p>PDF</p><a href='javascript:;' >+&nbsp;&nbsp;上传协议</a><input id='upload-agreement' class='upload-agreement' type='file' accept='image/*'></div>" +
                                    "<div class='item itemImg'></div>" +
                                    "<div class='item item3'><span class='color-9d'>上传后，请查看该协议图片是否正确，提交后将不能对此修改。</span></div>" +
                                    "</div>";
                                 **/

                                var offlineHtml = "<div class='"+languagePackage['offline-deal-block']+"'><div class='offline-deal-download clearfloat' style='border-bottom: 1px solid #C9C9C9'>" +
                                    "<p >"+languagePackage['请']+"<span class='color-41 offline-deal-contact'>&nbsp;"+languagePackage['联系对方']+"</span>"+languagePackage['，商议协议签订方式或签订地点。如已签订，点击下方进行上传。']+"</p>" +
                                    "<div class='w-supplier w-supplier-2' style='position: absolute;top: 20px;left: 30px;height: 20px;width: 57px;'>" +
                                    "<div class='w-credibility'>" +
                                    "<h4>" + resp.data.name + "</h4>" +
                                    "<h5><tt>" + resp.data.star + "</tt><i>" + resp.data.orderSuccessCount + " 单</i></h5>" +
                                    "<dl>" +
                                    "<dt class='w-credibility-" + reputationValue + "'></dt>" +
                                    "<dd>"+languagePackage['信誉值']+"：" + resp.data.reputationValue + "</dd>" +
                                    "<dd>"+languagePackage['电话']+"： +86" + resp.data.mobile + "</dd>" +
                                    "</dl>" +
                                    "</div>" +
                                    "</div>" +
                                    "</div>" +
                                    "<div class='offline-deal-download'><label>"+languagePackage['下载协议']+":</label>" +
                                    "<a href=" + downloadUrl + " class='download-agreement' id='at_contract_offline_download' name='at_contract_offline_download'>" +
                                    ""+languagePackage['立即下载']+"</a><span class='color-9d'>"+languagePackage['线下签订协议，如未有协议，您可下载模版进行签约。']+"</span></div>" +
                                    "<div class='offline-deal-upload "+ languagePackage['offline-deal-upload-block']+"'>" +
                                    "<div class='item item1'>"+languagePackage['上传协议']+":</div>" +
                                    "<div class='item'>" +
                                    "<div><div id='filePicker' name='filePicker'>+"+languagePackage['上传']+"</div></div></div>" +
                                    "<div class='item itemImg'></div>" +
                                    "<div class='item upload-tips'><span class='color-9d'>"+languagePackage['限制8张，不能超过 2M，支持PNG、JPG、JPEG、PDF格式']+"</span></div>" +
                                    " <div id='thelist' class='uploader-list clearfloat'></div>" +
                                    "</div></div>";
                                 if(json.buyerUploadUrl || json.supplierUploadUrl){
                                     var identity = contractListFunc.getParterAndMeInfo(json);
                                      offlineHtml += "<div class='offline-deal-download "+languagePackage['offline-deal-download-block']+" clearfloat' style='border-top: 1px solid #cccccc'><div class='offline-title'><h4>" + identity.parter + "：</h4>" +
                                          "</div><div class='offline-item1 color-success'><p style='text-align: left;' id='at_contract_ysc4' name='at_contract_ysc4'>"+languagePackage['已上传协议！']+"</p></div></div>";
                                     var imgShowList = json[identity.parterPre + "UploadUrl"].split(",");
                                     // var html = [];
                                     // _.each(imgShowList, function (item, index) {
                                     //     html.push('<div class="file-item thumbnail" src="' + imgShowList[index] + '">' +
                                     //         '<img style="height: 100%;width: 100%;" src="' + imgShowList[index] + '"/>' +
                                     //         '<div class="file-panel"><p class="show-top showImg" src="' + imgShowList[index] + '">查看大图</p></div>'+
                                     //         '</div>');
                                     // })
                                     // var htmlStr = html.join('');
                                     var htmlStr = contractListFunc.getImgListStr(imgShowList);
                                     offlineHtml = offlineHtml + '<div class="offline-deal-download offline-deal-download-img clearfloat '+ languagePackage['offline-deal-upload-block']+'"><div class="uploader-list clearfloat show-img-list">'+htmlStr+'</div></div>'
                                 }


                                offline_opt = dialogOpt({
                                    title: languagePackage['线下签订'],
                                    class: 'offline-deal',
                                    content: offlineHtml,
                                    textOkey: languagePackage['提交'],
                                    textOkeyId: 'at_contract_offline_opt_okid',
                                    textCancel: languagePackage['关闭'],
                                    textCancelId: 'at_contract_offline_opt_canid',
                                    closeId: 'at_contract_offline_opt_closeid',
                                    funcOkey: function () {
                                        var srcList = $("#thelist .file-item");
                                        if (!srcList.length) {
                                            var html = "<span class='color-red'>"+languagePackage['*请上传双方线下签订的相关招标协议']+"</span>";
                                            $('.upload-tips').html(html);
                                        } else {
                                            var imgArr = [];
                                            for(var i=0;i<srcList.length;i++){
                                                imgArr.push(srcList.eq(i).attr('src'))
                                            }
                                            var imgSrc = imgArr.join(',');
                                            $.ajax({
                                                type: "POST",
                                                url: seajs.host + '/contract/finish',
                                                dataType: "json",
                                                contentType: "application/json",  // 注意：不设置 contentType
                                                data: JSON.stringify({
                                                    downloadUrl: imgSrc,
                                                    id: id
                                                }),
                                                beforeSend: function (xhr) {
                                                    var user = getUser();
                                                    if (user && user.login) {
                                                        xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                                                    }
                                                }
                                            }).success(function (resp) {
                                                if (resp.code == 0) {
                                                    //resp.data==1,说明双方都已签订
                                                    if (!resp.data) {
                                                        offline_opt.remove();
                                                        alertReturn(languagePackage['上传协议成功，双方都上传后，即可生成订单!']);
                                                        contractListFunc.init();
                                                    } else {
                                                        offline_opt.remove();
                                                        alertReturn(languagePackage['双方成功签署购销协议，已生成订单！']);
                                                        setTimeout(function () {
                                                            window.location.href = 'p_order_detail.html?orderId=' + resp.data;
                                                        }, 2000);
                                                    }

                                                } else {
                                                    alertReturn(resp.exception);
                                                }
                                            }).fail(function (resp) {
                                                alertReturn(resp.responseJSON.exception);
                                            });
                                        }
                                    }
                                });
                                contractListFunc.uploadFiles();
                                contractListFunc.bindOfflineEvent(json);
                                // contractListFunc.uploadPng(id);
                            } else {
                                alertReturn(resp.exception);
                            }
                        }, function (resp) {
                            alertReturn(resp.exception);
                        });

                    })
                } else {
                    $("#j_contractList").html('<div class="no-data">'+languagePackage['没有相关协议信息']+'</div>');
                    $('#pagination').html('');
                    $('#pageNum').val(1);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, loading
        )
    }

    contractListFunc.contractList_pageCallback = function (page_id) {
        $("#pageNum").val(page_id + 1);
        contractListFunc.contractList(page_id + 1);
    }

    contractListFunc.uploadPng = function (id, bool) {
        uIdCard.init({
            input: document.querySelector('#upload-agreement'),
            callback: function (base64) {
                $.ajax({
                    type: "POST",
                    url: seajs.host + '/file/uploadImageBase64 ',
                    dataType: "json",
                    crossDomain: true, // 如果用到跨域，需要后台开启CORS
                    //processData: false,  // 注意：不要 process data
                    contentType: "application/json",  // 注意：不设置 contentType
                    data: JSON.stringify({
                        image: base64
                    }),
                    beforeSend: function (xhr) {
                        var user = getUser();
                        if (user && user.login) {
                            xhr.setRequestHeader("X-Access-Auth-Token", user.data.accessToken);
                        }
                    }
                }).success(function (resp) {
                    if (resp.code == 0) {
                        //$('.alert_dialog').remove();
                        var downloadUrl = resp.data,
                            img = "<img src=" + downloadUrl + " style='width:100%;height:100%' alt='' /><i class='offLineClose' title='删除' ></i>";
                        if (!bool) {
                            var span = "<span class='color-9d'>"+languagePackage['线下双方签署成功后，可直接进行上传协议操作。']+"</span>";
                            $('.item3').html(span);

                        }
                        $(".item2").fadeOut('fast');
                        $(".itemImg").html(img).css({
                            display: "inline-block"
                        });
                        $(".offLineClose").on('click', function (e) {
                            $('.itemImg').hide();
                            $(".itemImg img").remove();
                            $(".item2").fadeIn('fast');
                        })

                    } else {
                        alertReturn(resp.exception);
                    }
                }).fail(function (resp) {
                    $('.alert_dialog').remove();
                    alertReturn(resp.exception);
                });
            },
            loading: function () {
                alertReturn(languagePackage['图片上传中...']);
            }
        });
    }
    contractListFunc.getTokens = function () {
        var user = getUser();
        var tokens = "";
        if (user && user.login) {
            tokens = user.data.accessToken;
        }
        return tokens;
    }
    contractListFunc.uploadFiles = function () {
        /*init webuploader*/
        var $list=$("#thelist");   //这几个初始化全局的百度文档上没说明，好蛋疼。
        var $btn =$("#ctlBtn");   //开始上传
        // var deleteShowFileStr = '<div class="file-panel"><p actionStr="showFile" class="showFile show-top">查看文件</p><p actionStr="delete" class="delete">删除文件</p></div>'
        var getTokens = contractListFunc.getTokens();
        percentages = {},
        $.upLoadDefaults = $.upLoadDefaults || {};
        var uploader = WebUploader.create({
            // 选完文件后，是否自动上传。
            auto: true,
            // swf文件路径
            swf: '../../plugin/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: seajs.host + '/file/uploadFiles',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#filePicker',
            fileSingleSizeLimit:1024*1024*2,
            // 只允许选择图片文件及pdf文件。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png,pdf',
                mimeTypes: 'image/*,application/pdf'
            },
            formData: {
                'DelFilePath': '', //定义参数
                url: ''
            },
            fileVal: 'files', //上传域的名称
            headers: {
                "X-Access-Auth-Token":getTokens
            },
            threads:8,
            fileNumLimit:8,
            compress:false,
            method:'POST',
            thumb:{
                width:130,
                height: 130,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,

                // 是否允许裁剪。
                crop: false,
            }
        });
        // 文件报错
        uploader.on("error", function (type) {
            if (type == "Q_EXCEED_SIZE_LIMIT") {
                alertReturn(languagePackage["上传文件内容超过2M，请您重新上传"]);
            }else if(type=="Q_EXCEED_NUM_LIMIT"){
                alertReturn(languagePackage["上传文件限制8张以内"]);
            }else if(type == "F_EXCEED_SIZE"){
                alertReturn(languagePackage["上传文件内容超过2M，请您重新上传"]);
            }
        });
        // 当有文件添加进来的时候
        uploader.on( 'fileQueued', function( file) {  // webuploader事件.当选择文件后，文件被加载到文件队列中，触发该事件。等效于 uploader.onFileueued = function(file){...} ，类似js的事件定义。
            // loading=function() {
            //     alertReturn('上传中...');
            // }
            // loading();
            var html = "<span class='color-9d'>"+languagePackage['限制8张，不能超过 2M，支持PNG、JPG、JPEG、PDF格式']+"</span>";
            if($('.upload-tips span').hasClass('color-red')){
                $('.upload-tips').html(html);
            }
            var $li = $(
                    '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '<img>' +

                    '</div>'
                ),
                $img = $li.find('img');
            var $btns = $('<div class="file-panel"><p actionStr="showImg" class="show-top showImg" id="at_contract_showImg2" name="at_contract_showImg2">'+languagePackage['查看大图']+'</p>'
                    + '<p actionStr="delete" class="delete" id="at_contract_del" name="at_contract_del">'+languagePackage['删除图片']+'</p></div>').appendTo( $li );
            // var deleteShowImgStr = '<div class="file-panel"><p actionStr="showImg" class="showImg show-top">查看大图</p><p actionStr="delete" class="delete">删除图片</p></div>';

            // $list为容器jQuery实例
            $list.append( $li );
            percentages[ file.id ] = [ file.size, 0 ];
            // 如果为非图片文件，可以不用调用此方法。
            // thumbnailWidth x thumbnailHeight 为 100 x 100
            uploader.makeThumb( file, function( error, src ) {   //webuploader方法
                if ( error ) {
                    $img.replaceWith('<div><div class="pdf-text">PDF</div><div class="info">' + file.name + '</div></div>');
                    return;
                }
                $img.replaceWith('<img src="'+src+'">');
            });


            file.on('statuschange', function( cur, prev ) {
                // 成功
              if ( cur === 'queued' ) {
                    percentages[ file.id ][ 1 ] = 0;
                }
            });

            $li.on( 'mouseenter', function() {
                $btns.stop().animate({height: 130});
            });

            $li.on( 'mouseleave', function() {
                $btns.stop().animate({height: 0});
            });
            $btns.on( 'click', 'p', function() {
                var propStr = $(this).attr("actionstr");

                switch ( propStr ) {
                    case 'showImg':
                        showImg( file );
                        break;

                    case 'showFile':
                        file.rotation += 90;
                        break;

                    case 'delete':
                        uploader.removeFile( file );
                        return;
                }
            });
        });
        function updateTotalProgress() {
            var loaded = 0,
                total = 0;

            $.each( percentages, function( k, v ) {
                total += v[ 0 ];
                loaded += v[ 0 ] * v[ 1 ];
            } );

        }
        // 文件上传过程中创建进度条实时显示。
        uploader.on( 'uploadProgress', function( file, percentage ) {
            var $li = $( '#'+file.id ),
                $percent = $li.find('.progress span');

            // 避免重复创建
            if ( !$percent.length ) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
            }

            $percent.css( 'width', percentage * 100 + '%' );
        });
        // 文件上传过程中创建进度条实时显示。
        uploader.on( 'fileDequeued', function( file, percentage ) {
            removeFile( file );
            updateTotalProgress();
        });

        //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
        uploader.on('uploadBeforeSend', function (obj, data) {
            // data.DelFilePath = src;
            //  data.ItemCode = $("#txtItemCode").val();
            data.formData= { "name": 'files'};
        });
        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on( 'uploadSuccess', function( file,data) {
            $( '#'+file.id ).addClass('upload-state-done');
            if(data.code==0){
                var dataSrc = data.data[0];
                $( '#'+file.id ).attr("src",dataSrc);
            }
        });
        // 文件上传失败，显示上传出错。
        uploader.on( 'uploadError', function( file ) {
            var $li = $( '#'+file.id ),
                $error = $li.find('div.error');
            // 避免重复创建
            if ( !$error.length ) {
                $error = $('<div class="error"></div>').appendTo( $li );
            }
            // $error.text('上传失败');
        });
        // 完成上传完了，成功或者失败，先删除进度条。
        uploader.on( 'uploadComplete', function( file ) {
            $( '#'+file.id ).find('.progress').remove();
        });
        $btn.on( 'click', function() {
            console.log("上传...");
            uploader.upload();
            console.log("上传成功");
        });
        // 负责view的销毁
        function removeFile( file ) {
            var $li = $('#'+file.id);

            delete percentages[ file.id ];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }
        function showImg(file) {
            var $li = $('#'+file.id);
            var url = $li.attr("src");
            var index1=url.lastIndexOf(".");
            var index2=url.length;
            var suffix=url.substring(index1+1,index2);
            if(suffix == 'pdf'){
                window.open(url);
            }else{
                var urlArr = [];
                urlArr.push(url);
                previewImages.render({
                    imgArr: urlArr,
                    thiselement: $li,
                    showPre: false
                });
            }
        }

}
    //线上签订协议未签订弹框
    contractListFunc.notSigned = function (data) {
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>"+languagePackage['您在新的页面签署购销协议，签署完成前请不要关闭该窗口！']+"</h4>" +
            "<p class='color-9d'>"+languagePackage['您签署购销协议成功后，可点击下方按钮进行下一步操作。']+"</p></div>" +
            "<div class='Signed-go'>" +
            "<a href='javascript:;' id='notSigned-nextStep' name='notSigned-nextStep'>"+languagePackage['已完成协议签署,进行下一步']+"&gt;&gt;</a></div>";
        var line_opt = dialogOpt({
            title: languagePackage['签署协议通知'],
            class: 'dialogOpt-sm',
            content: html,
            textCancel: languagePackage['关闭'],
            funcCancel: function () {
                line_opt.remove();
                contractListFunc.init();
            }

        });
        $("#notSigned-nextStep").off('click').on('click', function (e) {
            interface.isSigned({id: data.id}, function (resp) {
                if (resp.code === 0) {
                    //status (string, optional): 0:未签订，1我已签对方未签，2双方都已签订
                    if (resp.data.status === 1) {
                        line_opt.remove();
                        contractListFunc.meSigned(resp.data);
                    } else if (resp.data.status === 0) {
                        alertReturn(languagePackage["您的协议未签订，无法继续。"]);
                        return false;
                    } else {
                        line_opt.remove();
                        contractListFunc.allSigned(resp.data);
                    }
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        })
    }
    //线上签订协议我已签对方未签弹框
    contractListFunc.meSigned = function (data) {
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>"+languagePackage['您已成功签署购销协议，双方均签署成功后，即可生成订单！']+"</h4>" +
            "<p class='color-9d'>"+languagePackage['请等待对方签署协议，亦可点击下方按钮提醒对方尽快签署协议。']+"</p></div>" +
            "<div class='Signed-go'>" +
            "<p><button  id='meSigned-notice' name='meSigned-notice'>"+languagePackage['提醒对方签署协议']+"&gt;&gt;</button></p>" +
            "<p><a href='javascript:;' id='meSigned-downloadUrl' name='meSigned-downloadUrl' data-downloadUrl=" + data.downloadUrl + ">"+languagePackage['下载协议附件']+"&gt;&gt;</a></p></div>";
        var line_opt = dialogOpt({
            title: languagePackage['签署协议通知'],
            class: languagePackage['css']['dialogOpt-sm'],
            content: html,
            textCancel: languagePackage['关闭'],
            funcCancel: function () {
                line_opt.remove();
                contractListFunc.init();
            }

        });
        $("#meSigned-notice").off('click').on('click', function (e) {
            interface.remind({id: data.id}, function (resp) {
                if (resp.code === 0) {
                    alertReturn(languagePackage["已经通知对方签署协议!"]);
                    $("#meSigned-notice").attr('disabled', true);
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            });
        })
        contractListFunc.downloadUrl("#meSigned-downloadUrl");
    }
    //线上签订协议双方都已签订弹框
    contractListFunc.allSigned = function (data) {
        var html = "<div class='Signed-tips'>" +
            "<h4 class='fts-16'>"+languagePackage['双方成功签署购销协议，已生成订单！']+"</h4>" +
            "<p class='color-9d'>"+languagePackage['请前往我的订单查看相关招标的交易订单，并尽快完成订单支付。']+"</p></div>" +
            "<div class='Signed-go'>" +
            "<p><a href='javascript:;' id='allSigned-goDetail'>"+languagePackage['前往订单详情']+"&gt;&gt;</a></p>" +
            "<p><a href='javascript:;' id='allSigned-downloadUrl' data-downloadUrl=" + data.downloadUrl + ">"+languagePackage['下载协议附件']+"&gt;&gt;</a></p></div>";
        var line_opt = dialogOpt({
            title: languagePackage['签署协议通知'],
            class: 'dialogOpt-sm',
            content: html,
            textCancel: '关闭',
            funcCancel: function () {
                line_opt.remove();
                contractListFunc.init();
            }

        });
        $("#allSigned-goDetail").off('click').on('click', function (e) {
            line_opt.remove();
            window.location.href = 'p_order_detail.html?orderId=' + data.orderId;
        })

        contractListFunc.downloadUrl("#allSigned-downloadUrl");
    }
    //下载协议
    contractListFunc.downloadUrl = function (obj) {
        $(obj).off('click').on('click', function (e) {
            var url = $(this).attr('data-downloadUrl');
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
        })
    };
    /*按钮*/
    contractListFunc.optBtn = function () {
        $('.sign').on('click', function () {
            var $this = $(this);
            var id = $this.parents('.item').attr('data-Id');
            interface.getSignUrl({
                id: id
            }, function (resp) {
                if (resp.code == 0) {
                    window.open(resp.data);
                    contractListFunc.notSigned({'id': id});
                } else {
                    alertReturn(resp.exception);
                }
            }, function (resp) {
                alertReturn(resp.exception);
            }, false);
        })
        $('.upload-stamp').on('click', function (e) {
            var id = $(this).parents('.item').attr('data-Id');
            var offlineHtml = "<div class='offline-deal-download'>" +
                "<span class='color-9d'>"+languagePackage['抱歉，您还未上传合同印章，无法进行线上协议签订。请先上传本公司的合法合同印章，此合同印章仅用于招标协议签署，请您放心上传！']+"</span></div>" +
                "<div class='offline-deal-upload "+ languagePackage['offline-deal-upload-block']+"'>" +
                "<div class='item item1'>"+languagePackage['合同印章']+":</div>" +
                "<div class='item item2 item3'><p class='item-title'>"+languagePackage['不能超过 2M']+"</p><p>PNG、JPG、JPEG</p><p>"+languagePackage['长宽不能小于50大于300']+"</p>" +
                "<a href='javascript:;' >+&nbsp;"+languagePackage['上传']+"</a><input id='upload-agreement' class='upload-agreement' type='file' accept='image/*'></div>" +
                "<div class='item itemImg item3'></div>" +
                "</div>";
            var line_opt = dialogOpt({
                title: languagePackage['线上签订'],
                class: 'offline-deal',
                content: offlineHtml,
                textOkey: languagePackage['提交'],
                textCancel: languagePackage['关闭'],
                funcOkey: function () {
                	//长宽都不能小于50大于300
                    if($(".itemImg img")[0].naturalWidth < 50 || $(".itemImg img")[0].naturalHeight < 50 || $(".itemImg img")[0].naturalWidth > 300 || $(".itemImg img")[0].naturalHeight >300){
                        alertReturn(languagePackage['长宽不能小于50大于300']);
                        return;
                    }
                    if (!$(".itemImg img").length) {
                        alertReturn(languagePackage["请上传合同印章"]);
                        return;
                    } else {
                        var stampImg = $(".itemImg img").attr('src');
                        interface.uploadStampImg({
                            stampImg: stampImg
                        }, function (resp) {
                            if (resp && resp.code === 0) {
                                interface.getSignUrl({
                                    id: id
                                }, function (resp) {
                                    if (resp.code == 0) {
                                        line_opt.remove();
                                        contractListFunc.init();
                                        window.open(resp.data);
                                        contractListFunc.notSigned({'id': id});
                                    } else {
                                        alertReturn(resp.exception);
                                    }
                                }, function (resp) {
                                    alertReturn(resp.exception);
                                }, false)
                            }
                        }, function (err) {
                            alertReturn(err.exception)
                        }, false);
                    }
                }
            });
            //添加指定元素id
            $('.okey').attr('id','okey')
            $('.cancel').attr('id','cancel')
            $('.closed').attr('id','closed')
            contractListFunc.uploadPng(id, true);
        })
        // 线下签订后查看详情按钮点击
        $('.look-up').off('click').on('click', function (e) {
            var json = JSON.parse($(this).attr('data-json'));
            if (json.buyerUploadUrl && json.supplierUploadUrl) {
                e.preventDefault();
                contractListFunc.offLineAllSigned(json);
            } else if (json.buyerUploadUrl || json.supplierUploadUrl) {
                e.preventDefault();
                contractListFunc.offLineMeSigned(json);
            }
        })
    }
    /*协议状态*/
    contractListFunc.count = function () {
        interface.contractCount(function (resp) {
            if (resp.code == 0) {
                $('.mod-menu .total').html(resp.data.total);
                $('.mod-menu .signed').html(resp.data.signed);
                $('.mod-menu .sign').html(resp.data.waitSign);
            } else {
                alertReturn(resp.exception);
            }
        }, function (resp) {
            alertReturn(resp.exception);
        })
    }

    contractListFunc.init();
    module.exports = {
        contractListFunc:contractListFunc
    }
});
