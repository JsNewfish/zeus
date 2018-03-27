/**
 * Created by Jin on 2016/8/8.
 */
app.factory('$dpPrint', ['$modal', '$restClient', '$common', '$q', '$rootScope', '$compile', 'code', '$win', '$location', function ($modal, $restClient, $common, $q, $rootScope, $compile, code, $win, $location) {

    //选择打印机
    function choosePrinter(printTypeData) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var choosePrinter = $modal.open({
            templateUrl: "views/pages/choosePrinter.html",
            controller: "choosePrinterCtrl",
            resolve: {
                data: function () {
                    return printTypeData;
                }
            }
        });
        choosePrinter.result.then(function (printerName) {

            deferred.resolve(printerName);               //打印机名称
        });

        return promise;
    }

    //创建打印页
    function createPrintPage(expressTemplateList, preview, baseData) {
        var sectionNum = 1; //每页的个数
        var print_orient;
        if (baseData.baseSetting) {
            print_orient = baseData.baseSetting.expressBillDirection; //1---纵(正)向打印，固定纸张；
        } else {
            print_orient = 1;
        }
        //2---横向打印，固定纸张；
        //3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
        //0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；
        console.log("print control version:" + LODOP.VERSION);
        var print_init = false;

        angular.forEach(expressTemplateList, function (template) {
            var userTemplateCell = template.userTemplateCell;
            var userExpressTemplate = template.userExpressTemplate;

            if (!print_init) {
                //设置偏移
                LODOP.PRINT_INITA(-2.2 + userExpressTemplate.calibrationY + "mm", userExpressTemplate.calibrationX + 'mm', userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "");
                LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
                LODOP.SET_SHOW_MODE("LANGUAGE", 0);
                //设置本次输出的打印任务名
                //if(category)
                LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "快递单");
                //设置纸张类型
                LODOP.SET_PRINT_PAGESIZE(print_orient, userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "");
                print_init = true;
            }

            //设置背景图片
            if (preview && userExpressTemplate.bgImg) {
                LODOP.ADD_PRINT_IMAGE(0, 0, userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "<img border=\"0\" src=\"" + userExpressTemplate.bgImg + "\" />");
                LODOP.SET_PRINT_STYLEA(0, "PreviewOnly", "true");	// 打印时不打印
            }
            createElement(userTemplateCell);                    //添加打印元素

            LODOP.NEWPAGEA();   //分页

        });

    }

    //创建打印页元素
    function createElement(userTemplateCell) {
        var unit = "px";
        var text_align = 1;

        angular.forEach(userTemplateCell, function (cell, i) {

            if (cell.entryCode == "custom_image") {                    //图片
                LODOP.ADD_PRINT_IMAGE(cell.yPosition, cell.xPosition, cell.width + unit, cell.height + unit,
                    "<img border='0' src='" + cell.entryContent + "' />");
            } else if (cell.entryCode == "bar_code_128_out_sid" || cell.entryCode == "bar_code_128_tid") {        // 条形码横版

                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 192 + unit, 64 + unit,
                    "128Auto", cell.entryContent);

            } else if (cell.entryCode == "bar_code_rotate90_128_out_sid") {// 条码竖版

                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 64 + unit, 192 + unit,
                    "128Auto", cell.entryContent);
                LODOP.SET_PRINT_STYLEA(0, "Angle", 90);

            } else if (cell.entryCode.indexOf('bar_code_qr') == 0) {        //二维码
                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 90 + unit, 80 + unit,
                    "QRCode", cell.entryContent);
                LODOP.SET_PRINT_STYLEA(0, "GroundColor", "#ffffff");

                var qr_version = 1;
                if (cell.entryContent.length < 15) {
                    qr_version = 1;// 版本1只能编码14个字符
                } else if (cell.entryContent.length < 27) {
                    qr_version = 2;// 版本2只能编码26个字符
                } else if (cell.entryContent.length < 43) {
                    qr_version = 3;// 版本3只能编码42个字符
                } else if (cell.entryContent.length < 85) {
                    qr_version = 5;// 版本5只能编码84个字符
                } else if (cell.entryContent.length < 123) {
                    qr_version = 7;
                } else if (cell.entryContent.length < 213) {
                    qr_version = 10;
                } else {
                    qr_version = 14;
                }
                // 如果不指定版本，控件会自动选择版本
                LODOP.SET_PRINT_STYLEA(0, "QRCodeVersion", qr_version);

            } else if (cell.entryCode.indexOf("horizontal_line") == 0) {         // 横线
                var line_width = 1;
                var line_style = 0;
                if (cell.entryCode == "horizontal_line_1" || cell.entryCode == "vertical_line_1") {
                    line_style = 0;
                } else if (cell.entryCode == "horizontal_line_2" || cell.entryCode == "vertical_line_2") {
                    line_style = 2;
                } else {
                    line_style = 0;
                }
                var new_y = cell.yPosition + 1.5;
                LODOP.ADD_PRINT_LINE(new_y, cell.xPosition, new_y + unit, (cell.xPosition + cell.width) + unit, line_style, line_width);

            } else if (cell.entryCode.indexOf("vertical_line") == 0) {           // 竖线
                line_width = 1;
                line_style = 0;
                if (cell.entryCode == "vertical_line_1") {
                    line_style = 0;
                } else if (cell.entryCode == "vertical_line_2") {
                    line_style = 2;
                } else {
                    line_style = 0;
                }
                var new_x = cell.xPosition + 1.5;
                LODOP.ADD_PRINT_LINE(cell.yPosition, new_x,
                    ( cell.yPosition + cell.height) + unit,
                    new_x + unit, line_style, line_width);
            } else if (cell.entryCode == "rectangle_checkbox") {            // 矩形
                line_style = 0;     // 实线
                line_width = 1;     // 线宽

                LODOP.ADD_PRINT_RECT(cell.yPosition, cell.xPosition,
                    cell.width + unit, cell.height + unit, line_style,
                    line_width);

            } else {                                                      //文本
                var has_background_color = false;//用于标记打印项目是否有背景色
                if (!has_background_color) {//无背景色文本
                    LODOP.ADD_PRINT_TEXT(cell.yPosition, cell.xPosition, cell.width + unit, cell.height + unit, cell.entryContent);
                    LODOP.SET_PRINT_STYLEA(0, "FontName", cell.fontType);
                    LODOP.SET_PRINT_STYLEA(0, "FontSize", cell.fontSize);
                    LODOP.SET_PRINT_STYLEA(0, "LineSpacing", "-1px");
                    LODOP.SET_PRINT_STYLEA(0, "FontColor", cell.fontColor && cell.fontColor.replace("0x", "#"));
                    LODOP.SET_PRINT_STYLEA(0, "Bold", $.trim(cell.fontBold) == "normal" ? 0 : 1);
                    LODOP.SET_PRINT_STYLEA(0, "Italic", $.trim(cell.fontItalic) == "normal" ? 0 : 1);
                    LODOP.SET_PRINT_STYLEA(0, "Underline", $.trim(cell.textUnderline) == "initial" ? 0 : 1);
                    if (cell.textAlign == "center") {
                        text_align = 2;
                    } else if (cell.textAlign == "right") {
                        text_align = 3;
                    } else {
                        text_align = 1;
                    }
                    LODOP.SET_PRINT_STYLEA(0, "Alignment", text_align);
                }
            }

        });

    }

    //获取快递模板信息
    function getTemplate(NormalPackages, baseData, type) {
        var printDataList = [];
        var expressTemplate;
        var deferred = $q.defer();
        var promise = deferred.promise;

        $restClient.postFormData('seller/userExpressTemplate/form', {
                userExpressId: baseData.userExpressTemp.userExpressId,
                templateId: baseData.userExpressTemp.id
            }, function (data) {
                console.log(data.data);
                expressTemplate = data.data;
                if (NormalPackages) {
                    angular.forEach(NormalPackages, function (Package) {
                        //组合打印数据
                        code.createCellValue(expressTemplate.userTemplateCell, Package, baseData, type);
                        printDataList.push(angular.copy(expressTemplate));

                    });
                } else {
                    printDataList.push(expressTemplate);
                }
                deferred.resolve(printDataList);
            }
        );

        return promise;
    }

    //获取发货单模板
    function getDeliveryTemplate(templateId) {
        var deferred = $q.defer();

        if (templateId) {            //预览模板
            $restClient.get('seller/userDeliveryTemplate/form', {templateId: templateId}, function (data) {
                console.log(data);

                deferred.resolve(data.data);
            });
        } else {                      //打印预览默认模板
            $restClient.get('seller/userDeliveryTemplate/getPrintDeliveryTemplate', null, function (data) {
                console.log(data);

                deferred.resolve(data.data);
            });
        }
        return deferred.promise;
    }

    //替换发货单数据
    function replaceData(template, NormalPackages) {

        var listArray = [];

        function replaceSku(order) {
            if (order.skuPropertiesName == undefined) {
                return "";
            }
            var sku = order.skuPropertiesName;
            if (order.skuChangeName) {
                sku = order.skuChangeName;
            }

            var args = sku.split(";");
            var returnStr = "";
            for (var i = 0; i < args.length; i++) {
                var str = args[i].split(":");
                returnStr = ("" == returnStr) ? str[1] : returnStr + ";" + str[1];
            }
            return returnStr;
        }

        if (NormalPackages.length > 0) {
            angular.forEach(NormalPackages, function (Package) {
                var userTemplate = angular.copy(template);

                //转换SKU属性去掉名称
                if (Package.normalTradeList) {
                    angular.forEach(Package.normalTradeList, function (trade) {
                        angular.forEach(trade.normalOrderList, function (order) {
                            if(order.skuPropertiesName){
                                order.skuPropertiesName = replaceSku(order);
                            }

                        })
                    });
                }

                if (Package.freeTradeList) {
                    angular.forEach(Package.freeTradeList, function (freeTrade) {
                        angular.forEach(freeTrade.freeOrderList, function (order) {
                            if(order.skuPropertiesName){
                                order.skuPropertiesName = replaceSku(order);
                            }
                        })
                    });
                }

                angular.forEach(userTemplate.userTemplateCellList, function (cell) {
                    var entryCode = $common.underlineToCamel(cell.entryCode);

                    if (entryCode == "receiverInfo") {
                        cell.entryContent = (Package.receiverName ? Package.receiverName : '') +
                            (Package.receiverMobile ? Package.receiverMobile : '') + (Package.receiverState ? Package.receiverState : '') +
                            (Package.receiverCity ? Package.receiverCity : '') + (Package.receiverDistrict ? Package.receiverDistrict : '') +
                            (Package.receiverAddress ? Package.receiverAddress : '') + (Package.receiverZip ? Package.receiverZip : '');
                    } else if (entryCode == "sellerMemo") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.sellerMemo){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.sellerMemo;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.sellerMemo){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.sellerMemo;
                                }

                            });
                        }

                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "buyerMessage") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.buyerMessage){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.buyerMessage;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.buyerMessage){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.buyerMessage;
                                }
                            });
                        }

                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "sysMemo") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.sysMemo){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.sysMemo;
                                }

                            });
                        }
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "created") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.created){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.created;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.created) {
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.created;
                                }
                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "tid") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.tid) {
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.tid;
                                }
                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.tid){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.tid;
                                }

                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "payTime") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.payTime) {
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.payTime;
                                }
                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.payTime) {
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.payTime;
                                }
                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (Package[entryCode]) {

                        cell.entryContent = Package[entryCode];
                    }

                });
                userTemplate.packageInfo = Package;
                listArray.push(userTemplate);
            });
        } else {
            listArray.push(template);
        }
        return listArray;
    }

    //执行打印快递单
    function doBatchPrint(preview, baseData, NormalPackages, callbackFunc, callbackParam, type) {
        //打印数据

        var printDataList;
        getTemplate(NormalPackages, baseData, type).then(function (dataList) {
            printDataList = dataList;

            return choosePrinter({
                preview: preview,
                type: 1,
                template: dataList[0].userExpressTemplate
            });
        }).then(function (printer) {

            createPrintPage(printDataList, preview, baseData);
            //设置打印机
            LODOP.SET_PRINTER_INDEXA(printer);

            if (preview) {
                //设置预览窗口大小
                LODOP.SET_PREVIEW_WINDOW(1, 0, 1, 950, 600, "打印预览");
                //LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS", 1);

                LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
                if (LODOP.VERSION > "6.1.8.7") {
                    LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                    LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                    LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
                }
                // LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPreview(callbackFunc, callbackParam);

            } else {
                //LODOP.SET_PRINT_COPIES(2);
                //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPrint(callbackFunc, callbackParam);
            }

        });
    }

    //执行打印发货单
    function doBatchDelivery(preview, baseData, printer, NormalPackages, callbackFunc, callbackParam, templateScope) {

        var printDataList = replaceData(templateScope.entity, NormalPackages);

        //LODOP = getLodop();


        var sectionNum; //每页的个数
        var print_orient;
        if (baseData.baseSetting) {
            print_orient = baseData.baseSetting.deliveryBillDirection; //1---纵(正)向打印，固定纸张；
        } else {
            print_orient = 1;
        }
        //2---横向打印，固定纸张；
        //3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
        //0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；

        var section_height;// 等分的高度


        console.log("print control version:" + LODOP.VERSION);
        var print_init = false;


        angular.forEach(printDataList, function (template, i) {
            //更新模板数据

            templateScope.entity = template;
            templateScope.$apply();


            var userDeliveryTemplate = template.userDeliveryTemplate;

            /*if (userDeliveryTemplate.paperType == 4) {      //自定义纸张
             sectionNum = parseInt(297 / userDeliveryTemplate.height);
             } else {
             sectionNum = userDeliveryTemplate.paperType;
             }*/

            if (!print_init) {
                //设置偏移
                LODOP.PRINT_INITA(userDeliveryTemplate.calibrationY + "mm", userDeliveryTemplate.calibrationX + "mm", userDeliveryTemplate.width + "mm", userDeliveryTemplate.height + "mm", "");
                LODOP.SET_SHOW_MODE("LANGUAGE", 0);
                //设置本次输出的打印任务名
                //if(category)
                LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "发货单");
                LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
                //设置纸张类型
                LODOP.SET_PRINT_PAGESIZE(print_orient, userDeliveryTemplate.width + "mm", userDeliveryTemplate.height + "mm", "");
                //LODOP.SET_PRINT_PAGESIZE(print_orient, 0, 0, $.trim(userDeliveryTemplate.name));
                print_init = true;
            }
            var strFormHtml = angular.element(".deliveryTemplate").html();
            if (userDeliveryTemplate.paperType == 2 || userDeliveryTemplate.paperType == 3) {
                LODOP.ADD_PRINT_HTM(0, "12mm", userDeliveryTemplate.width - 24 - userDeliveryTemplate.calibrationX + "mm", userDeliveryTemplate.height - userDeliveryTemplate.calibrationY + "mm", '<!DOCTYPE html>' + strFormHtml);

            } else {
                LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', '<!DOCTYPE html>' + strFormHtml);
            }
            //LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
            //设置打印机
            LODOP.SET_PRINTER_INDEXA(printer);
            angular.forEach(template.userTemplateCellList, function (TemplateCell) {
                if (TemplateCell.entryCode == "activity_qrcode") {

                    var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
                    //检查是否是链接
                    if (objExp.test(TemplateCell.entryContent) == true) {
                        var height = angular.element(".deliveryTemplate ").height();
                        //获取内容html高度，减去二维码宽度
                        LODOP.ADD_PRINT_BARCODE(height - 15 + "px", userDeliveryTemplate.width - 24 - 30 - userDeliveryTemplate.calibrationX + "mm", 30 + 'mm', 30 + 'mm',
                            "QRCode", TemplateCell.entryContent);
                        LODOP.SET_PRINT_STYLEA(0, "GroundColor", "#ffffff");

                        var qr_version = 1;
                        if (TemplateCell.entryContent.length < 15) {
                            qr_version = 1;// 版本1只能编码14个字符
                        } else if (TemplateCell.entryContent.length < 27) {
                            qr_version = 2;// 版本2只能编码26个字符
                        } else if (TemplateCell.entryContent.length < 43) {
                            qr_version = 3;// 版本3只能编码42个字符
                        } else if (TemplateCell.entryContent.length < 85) {
                            qr_version = 5;// 版本5只能编码84个字符
                        } else if (TemplateCell.entryContent.length < 123) {
                            qr_version = 7;
                        } else if (TemplateCell.entryContent.length < 213) {
                            qr_version = 10;
                        } else {
                            qr_version = 14;
                        }
                        // 如果不指定版本，控件会自动选择版本
                        LODOP.SET_PRINT_STYLEA(0, "QRCodeVersion", qr_version);
                    }
                }
            });


            /*// 分页
             if ((i + 1) % sectionNum == 0) {*/
            LODOP.NEWPAGE();   //分页
            /*}*/
        });


        if (preview) {
            //设置预览窗口大小

            LODOP.SET_PREVIEW_WINDOW(1, 0, 1, 950, 600, "打印预览");
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
            if (LODOP.VERSION > "6.1.8.7") {
                LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
            }
            //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

            RealPreview(callbackFunc, callbackParam);

        } else {
            //LODOP.SET_PRINT_COPIES(2);
            //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

            RealPrint(callbackFunc, callbackParam);

        }

    }

    function RealPreview(callbackFunc, callbackParam) {

        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    callbackFunc && callbackFunc(callbackParam);
                }
                else {
                    console.log("放弃打印！");
                }
            };
            LODOP.PREVIEW();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PREVIEW()) {
            callbackFunc && callbackFunc(callbackParam);
        } else {
            console.log("放弃打印！");
        }
    }

    function RealPrint(callbackFunc, callbackParam) {

        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    callbackFunc && callbackFunc(callbackParam);
                }
                else {
                    alert("放弃打印！");
                }
            };
            LODOP.PRINT();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PRINT()) {
            callbackFunc && callbackFunc(callbackParam);
        }
        else {
            alert("放弃打印！");
        }
    }

    //编译发货单模板
    function compileDeliveryTemplate(domElement, deliveryTemplate) {
        var templateScope = $rootScope.$new(true);
        templateScope.entity = deliveryTemplate;

        var deliveryTemplateDirective = angular.element('<div delivery-template />');
        deliveryTemplateDirective.attr({
            "entity": "entity"
        });
        domElement.html("");
        domElement.append($compile(deliveryTemplateDirective)(templateScope));
        return templateScope;
    }

    //普通面单打印控件是否安装
    function isCLodopInstalled() {
        var strCLodopInstall = "<div color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行安装</a>,安装后请刷新页面。</div>";
        var strCLodopUpdate = "<div color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行升级</a>,升级后请刷新页面。</div>";
        var LODOP;

        var isIE = (navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Trident') >= 0);
        try {
            LODOP = getCLodop();
        } catch (err) {
            console.log("getLodop出错:" + err);
        }
        if (!LODOP) {
            var mes = {
                windowTitle: '系统提示',
                title: '请下载并安装打印控件，否则会导致无法打印',
                content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                '打印控件并进行安装。安装后请刷新此页面。下载或安装遇到问题请' +
                '联系我们在线客服！' +
                '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                '<br><a class="text-warning" href="download/CLodop_Setup_for_Win32NT_2.062.exe" target="_self">下载控件</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: false,
                showCancel: false
            };
            $win.confirm(mes);
            return false;
        } else {
            /*if (CLODOP.CVERSION < "2.0.4.6") {
             var mes = {
             windowTitle: '全能掌柜提示，打印前请安装新打印控件',
             title: '打印控件需升级',
             content: strCLodopUpdate,
             img: "images/components/alert/alert-forbid.png",
             showClose: false,
             showCancel: true
             };
             $win.confirm(mes);
             return false;
             }*/
            return true;
        }

    }

    /***
     *
     * 获取请求的UUID，指定长度和进制,如
     * getUUID(8, 2)   //"01001010" 8 character (base=2)
     * getUUID(8, 10) // "47473046" 8 character ID (base=10)
     * getUUID(8, 16) // "098F4D35"。 8 character ID (base=16)
     *
     */
    function getUUID(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;
        if (len) {
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            var r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    }

    /***
     * 构造request对象
     */
    function getCainiaoReqObj(cmd) {
        var request = {};
        request.requestID = getUUID(8, 16);
        request.version = "1.0";
        request.cmd = cmd;
        return request;
    }


    var $dpPrint = {
        isCLodopInstalled:isCLodopInstalled,
        //打印控件回调函数
        handlerResp:function(rspObj){
            var self = this;
            var waybillData = self.waybillData;


            if (rspObj.cmd == "getPrinters") {
                self.printerInfo = {};
                self.printerInfo.defaultPrinter = rspObj.defaultPrinter;
                self.printerInfo.printerCount = rspObj.printers.length;
                self.printerInfo.printers = rspObj.printers;

            } else if (rspObj.cmd == "print") {
                if (rspObj.status == "success") {
                    if (waybillData.preview) {
                        // 由于是生成的pdf 所以需要在浏览器窗口中打开预览
                        var previewURL = rspObj.previewImage;
                        var previewModel = $win.prompt({
                            windowTitle:'打印预览',
                            windowClass: "previewModel",
                            templateBody:'<span ng-repeat="previewImg in data.value"><img  style="width: 513px;" ng-src="{{previewImg}}"></span>',
                            size:'lg',
                            closeText: "打印",
                            cancelText: "关闭",
                            //模板页面的预览不穿Type 不用打印
                            showClose: Boolean(self.waybillData.type),
                            showCancel: true,
                            value:previewURL

                        });
                        //打印
                        previewModel.result.then(function(){
                            waybillData.preview = false;
                            //打印
                            self.doPrint();
                        })
                    }
                } else {
                    alert("提交打印任务失败，请重试！");
                }
            } else if (rspObj.cmd == "notifyPrintResult") { // 打印结果反馈
                var printSuccessList = [];
                var printFailedList = [];
                angular.forEach(rspObj.printStatus,function(ps){
                    if(ps.status == 'success'){
                        printSuccessList.push(ps);
                    }else {
                        //去除打印失败的包裹
                        if(waybillData.type == 1){
                            //去除掉失败的包裹
                            waybillData.callbackParam.normalPackageList = waybillData.callbackParam.normalPackageList.filter(function (normalPackage) {
                                if (!(normalPackage.expressNo == ps.documentID)) {
                                    return normalPackage;
                                }
                            });
                        }
                        if(waybillData.type == 2){
                            //自由打印 去除掉失败的包裹
                            waybillData.callbackParam = waybillData.callbackParam.filter(function (freePackage) {
                                if (!(freePackage.expressNo == ps.documentID)) {
                                    return freePackage;
                                }
                            });
                        }

                        printFailedList.push(ps);
                    }
                });
                if(waybillData.type == 1){
                    if(waybillData.callbackParam.normalPackageList.length>0){
                        waybillData.callbackFunc(waybillData.callbackParam);
                    }
                }
                if(waybillData.type == 2){
                    if(waybillData.callbackParam.length>0){
                        waybillData.callbackFunc(waybillData.callbackParam);
                    }
                }


                /*$modal.open({
                 templateUrl:'views/pages/waybillResult.html',
                 controller: "waybillResultCtrl",
                 resolve: {
                 data: function () {
                 return {
                 successNum:printSuccessList.length,
                 failedNum:printFailedList.length,
                 printStatus:rspObj.printStatus
                 };
                 }
                 }
                 })*/
            }
        },
        //调用电子面单控件
        initCaiNiao: function () {
            var self = this;
            
            try {
                if ($location.protocol() == "http") {
                    self.webSocket = new WebSocket('ws://localhost:13528');
                } else
                //如果是https的话，端口是13529
                {
                    self.webSocket = new WebSocket('wss://localhost:13529');
                }
            } catch (err) {
                if (window.console && window.console.log) {
                    console.log('webSocket init error : ' + err.message);
                }
            }

            if (self.webSocket) {
                self.webSocket.onopen = function (event) {
                    var messageList = [];
                    self.webSocket_is_open = 1;
                    self.webSocket.send(JSON.stringify(getCainiaoReqObj("getPrinters")));
                    // 监听消息
                    self.webSocket.onmessage = function (event) {
                        console.log('Client received a message', event);
                        //loading
                        if(self.deferred){
                            self.deferred.resolve();
                        }
                        //控件请求回调函数
                        var rspObj = $.parseJSON(event.data);
                        if (rspObj.cmd == "notifyPrintResult") {
                            var messageInfo = rspObj.cmd + '_' + rspObj.requestID;
                            if (messageList.indexOf(messageInfo) < 0) {
                                messageList.push(messageInfo);
                                self.handlerResp(rspObj);
                            }
                        }else{
                            self.handlerResp(rspObj);
                        }

                    };
                    // 监听Socket的关闭
                    self.webSocket.onclose = function (event) {
                        console.log('Client notified socket has closed', event);
                    };
                };
                // 错误监听
                self.webSocket.onerror = function (event) {
                    self.webSocket_is_open = 0;
                    console.log('websocket init failed');
                    console.log('菜鸟云插件初始化失败! ');
                };

            }

        },
        //电子面单打印事件
        doPrint: function () {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var self = this;
            var waybillData = self.waybillData;
            var request = getCainiaoReqObj("print");
            request.task = {};
            request.task.taskID = getUUID(8, 10);
            request.task.preview = Boolean(waybillData.preview);
            request.task.previewType = "image";
            request.task.printer = self.printerInfo.defaultPrinter;
            request.task.notifyMode = "allInOne";

            var printData = waybillData.printData.waybills;
            var userTemplateCells = waybillData.printData.userTemplateCells;
            var documents = [];
            for (var i = 0; i < printData.length; i++) {
                var doc = {};
                doc.documentID = printData[i].expressNo;
                doc.contents = [];

                //是否模板是预览，模板页面的预览数据为自己拼接的obj否则为后台请求的json
                if(self.waybillData.type){
                    var cont = $.parseJSON(printData[i].printData);
                }else{
                    var cont = printData[i].printData;
                }

                //替换自定义区数据
                var customArea ={};
                var Package;
                customArea.templateURL = printData[i].customAreaUrl;

                if(waybillData.type ==1){
                    angular.forEach(waybillData.callbackParam.normalPackageList,function(normalPackage){
                        if(normalPackage.expressNo == printData[i].expressNo){
                            Package = normalPackage;
                        }
                    });
                }
                if(waybillData.type ==2){
                    angular.forEach(waybillData.callbackParam,function(freePackage){
                        if(freePackage.expressNo == printData[i].expressNo){
                            Package = freePackage;
                        }
                    });
                }
                if(Package){
                    code.createCellValue(userTemplateCells, Package, waybillData.baseData,waybillData.type);
                }

                customArea.data = {};
                angular.forEach(userTemplateCells,function(Cell){
                    customArea.data[Cell.entryCode] = Cell.entryContent;
                });

                doc.contents.push(cont);
                doc.contents.push(customArea);

                documents.push(doc);


            }
            request.task.documents = documents;
            self.webSocket.send(JSON.stringify(request));
            self.deferred = deferred;
            waybillData.scope.message = '获取打印数据中。。';
            waybillData.scope.loading = promise;
        },

        /**批量打印快递单
         * preview:是否为预览
         * NormalPackages 选择的包裹数据
         * printer:打印机名称
         * baseData
         * 1、userExpressTemp:模板对象需包含模板ID快递公司ID{userExpressId: ,id: }两个属性
         * 2、defaultReceiptAddress：寄件人信息
         */
        printExpress: function (preview, baseData, callbackFunc, callbackParam, NormalPackages, type) {

            //检查打印控件
            if (isCLodopInstalled()) {
                doBatchPrint(preview, baseData, NormalPackages, callbackFunc, callbackParam, type);    //开始打印

            }
        }
        ,
        /**批量打印发货单
         * preview:是否为预览
         * NormalPackages 选择的包裹数据
         * printer:打印机名称
         * userExpressTemp:模板对象需包含模板ID快递公司ID{userExpressId: ,id: }两个属性
         * callbackFunc 打印完后的回调函数
         * callbackParam 打印完后的回调参数
         */
        printDelivery: function (preview, baseData, callbackFunc, callbackParam, NormalPackages, domElement, templateId) {
            //检查打印控件
            if (isCLodopInstalled()) {
                getDeliveryTemplate(templateId, NormalPackages).then(function (deliveryTemplate) {
                    var templateScope = compileDeliveryTemplate(domElement, deliveryTemplate);
                    $q.when({
                        preview: preview,
                        type: 2,
                        template: deliveryTemplate.userDeliveryTemplate
                    }, choosePrinter).then(function (printerName) {
                        doBatchDelivery(preview, baseData, printerName, NormalPackages, callbackFunc, callbackParam, templateScope);
                    })

                });
            }
        }
        ,
        /**云打印电子面单
         * type:1为连打发货
         * type:2为自由打印发货
         * type:undefined为模板页面预览发货
         * */
        printWaybill: function (preview, baseData, printData, callbackFunc, callbackParam,type,scope) {
            var self = this;
            self.waybillData = {
                preview:preview,
                baseData:baseData,
                printData:printData,
                callbackFunc:callbackFunc,
                callbackParam:callbackParam,
                type:type,
                scope:scope
            };

            //检查云打印控件是否安装
            if(!self.webSocket_is_open){
                //提示未安装控件
                var mes = {
                    windowTitle: '系统提示',
                    title: '请下载并安装菜鸟云打印组件，否则会导致电子面单无法打印',
                    content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                    '打印控件并进行安装。安装后请启动运行控件。下载或安装遇到问题请' +
                    '联系我们在线客服！' +
                    '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                    '<br><a class="text-warning" href="http://cdn-cloudprint.cainiao.com/waybill-print/client/CNPrintSetup.exe" target="_self">下载控件</a>',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: false,
                    showCancel: false
                };
                $win.confirm(mes);
            }else{
                //
                if(self.waybillData.printData){
                    var waybillData = self.waybillData;
                    var templateData = waybillData.baseData.userExpressTemp;
                    var matchPrint = false;
                    //设置打印机配置项
                    var ConfigJson = getCainiaoReqObj("setPrinterConfig");
                    var printerConfig = {
                        "needTopLogo":Boolean(templateData.printTopLogo),
                        "needBottomLogo":Boolean(templateData.printBottomLogo),
                        "horizontalOffset":1,
                        "verticalOffset":2,
                        "paperSize":{
                            "width":100,
                            "height":180
                        }
                    };

                    // 设置打印模版的宽高
                    if (parseInt(templateData.width) && parseInt(templateData.height)) {
                        printerConfig.paperSize = {
                            "width": parseFloat(templateData.width),
                            "height": parseFloat(templateData.height)
                        };
                        // 只有在宽高有效的情况下才可以设置偏移
                        printerConfig.horizontalOffset = parseFloat(templateData.calibrationX);
                        printerConfig.verticalOffset = parseFloat(templateData.calibrationY);
                    }


                    //判断是否有绑定打印机，绑定的是否存在，若存在则不用选择
                    if(templateData.printerKey!=''){
                        angular.forEach(self.printerInfo.printers, function (printerInfo) {
                            //锁定的打印机匹配
                            if ( printerInfo.name == templateData.printerKey) {
                                matchPrint = true;
                            }
                        });
                    }
                    if(matchPrint){
                        printerConfig.name = templateData.printerKey;
                        self.printerInfo.defaultPrinter = templateData.printerKey;
                        ConfigJson.printer = printerConfig;
                        //设置打印机配置项
                        self.webSocket.send(JSON.stringify(ConfigJson));
                        //打印
                        self.doPrint();
                    }else{
                        //选择打印机
                        var choosePrint = $modal.open({
                            templateUrl: "views/pages/waybillPrint.html",
                            controller: "waybillPrintCtrl",
                            resolve: {
                                data: function () {
                                    return {
                                        printerInfo:self.printerInfo,
                                        templateData:templateData
                                    };
                                }
                            }
                        });
                        choosePrint.result.then (function (printer) {

                            printerConfig.name = printer;
                            self.printerInfo.defaultPrinter = printer;

                            ConfigJson.printer = printerConfig;
                            //设置打印机配置项
                            self.webSocket.send(JSON.stringify(ConfigJson));


                            //打印
                            self.doPrint();
                        });
                    }

                }
            }

        }
    };
    return $dpPrint;
}])
;