/**
 * Created by Jin on 2016/6/20.
 */
app.controller('editDeliveryTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$timeout', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $timeout) {

    $scope.tableStyle = {
        fontFamily: '',
        fontSize: '',
        lineHeight: ''
    };
    function getData() {
        var deferred = $q.defer();
        $restClient.get('seller/userDeliveryTemplate/form', {templateId: $location.search().id}, function (data) {
            console.log(data);
            $scope.entity = serverToClient(data.data);
            deferred.resolve();
        });
        return deferred.promise;
    }

    function init() {
        //LODOP = getLodop();
        $scope.isCreate = !$location.search().id;
        getData().then(getPrinterName);
    }

    init();

    function getPrinterName() {
        $timeout(function () {
            var iPrinterCount = LODOP.GET_PRINTER_COUNT();
            $scope.printerList = [];
            for (var i = 0; i < iPrinterCount; i++) {
                $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
            }
        }, 800)
    }

    function serverToClient(data) {
        // data.userDeliveryTemplate.width = transformMm(data.userDeliveryTemplate.width);
        // data.userDeliveryTemplate.height = transformMm(data.userDeliveryTemplate.height);
        $scope.tableStyle.fontFamily = data.userDeliveryTemplate.fontType;
        $scope.tableStyle.fontSize = data.userDeliveryTemplate.fontSize + 'px';
        $scope.tableStyle.lineHeight = data.userDeliveryTemplate.lineHeight + 'px';

        $scope.cellList = {};
        for (var i = 0; i < data.userTemplateCellList.length; i++) {
            $scope.cellList[data.userTemplateCellList[i].entryCode] = data.userTemplateCellList[i];

        }


        var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
        //检查是否是链接
        if (objExp.test($scope.cellList.activity_qrcode.entryContent) == true) {
            $('#code').qrcode({
                width: 90, //宽度
                height: 90, //高度
                text: $scope.cellList.activity_qrcode.entryContent //任意内容
            });
        }
        //console.log($scope.cellList);
        return data;
    }

    function clientToServer(data) {
        var userTemplateCellList = [];
        for (var i in $scope.cellList) {
            if ($scope.cellList[i].isShow) {
                userTemplateCellList.push($scope.cellList[i]);
            }
        }


        delete data.userTemplateCellList;
        data.userDeliveryTemplate.userTemplateCellList = userTemplateCellList;

        if (data.userDeliveryTemplate.paperType == 1) {
            data.userDeliveryTemplate.width = 210;
            data.userDeliveryTemplate.height = 297;
        } else if (data.userDeliveryTemplate.paperType == 2) {
            data.userDeliveryTemplate.width = 240;
            data.userDeliveryTemplate.height = 140;
        } else if (data.userDeliveryTemplate.paperType == 3) {
            data.userDeliveryTemplate.width = 240;
            data.userDeliveryTemplate.height = 93;
        }
        // data.userDeliveryTemplate.width = transformPx(data.userDeliveryTemplate.width);
        //data.userDeliveryTemplate.height = transformPx(data.userDeliveryTemplate.height);
        return data;
    }

    function transformPx(data) {
        return Math.round(data * 3.775) + 'px';
    }

    function transformMm(data) {
        return Math.round(parseInt(data) / 3.775);
    }

    $scope.decreaseY = function () {
        $scope.entity.userDeliveryTemplate.calibrationY--;

    };

    $scope.increaseY = function () {
        $scope.entity.userDeliveryTemplate.calibrationY++;
    };

    $scope.decreaseX = function () {
        $scope.entity.userDeliveryTemplate.calibrationX--;
    };

    $scope.increaseX = function () {
        $scope.entity.userDeliveryTemplate.calibrationX++;
    };

    $scope.save = function () {
        var postData = clientToServer($scope.entity);
        $scope.loading = $restClient.post('seller/userDeliveryTemplate/save', null, postData.userDeliveryTemplate, function (data) {
            console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '保存成功'//内容
                });
                $location.url('/print/deliveryTemplate');
            }
        });
    };

    $scope.back = function () {
        $location.url('/print/deliveryTemplate');
    };

    $scope.updateShopTitle = function (shopTitle) {
        var modal = $win.prompt({
            value: shopTitle.entryContent,
            windowTitle: '修改店铺名称',
            title: "店铺名称",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="text" class="form-control" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.shop_title.entryContent = data;
        });
    };

    $scope.updateCustomText = function (customText) {
        var modal = $win.prompt({
            value: customText.entryContent,
            windowTitle: '修改自定义名称',
            title: "自定义名称",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="text" class="form-control" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.custom_text.entryContent = data;
        });
    };

    $scope.addQrcode = function (activity_qrcode) {
        var modal = $win.prompt({
            value: activity_qrcode.entryContent,
            windowTitle: '二维码链接',
            title: "活动链接",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="url" class="form-control" name="URL" placeholder="输入活动链接" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.activity_qrcode.entryContent = data;
            $('#code').html("");
            if (data) {
                $('#code').qrcode({
                    width: 90, //宽度
                    height: 90, //高度
                    text: data //任意内容
                });
            }
        });
    };


    //
    $scope.preview = function () {
        //选择打印机
        if (!$scope.entity.userDeliveryTemplate.printerKey) {
            $win.alert('请先选择打印机');
            return false;
        }


        //设置偏移
        LODOP.PRINT_INITA($scope.entity.userDeliveryTemplate.calibrationY + "mm", $scope.entity.userDeliveryTemplate.calibrationX + "mm", $scope.entity.userDeliveryTemplate.width + 'mm', $scope.entity.userDeliveryTemplate.height + 'mm', "");
        LODOP.SET_SHOW_MODE("LANGUAGE", 0);

        //设置本次输出的打印任务名
        LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "发货单");


        //设置纸张类型
        LODOP.SET_PRINT_PAGESIZE(1, $scope.entity.userDeliveryTemplate.width + "mm", $scope.entity.userDeliveryTemplate.height + "mm", "");

        var strFormHtml = angular.element("#delivery").html();
        LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', '<!DOCTYPE html>' + strFormHtml);

        angular.forEach($scope.entity.userTemplateCellList, function (TemplateCell) {
            if (TemplateCell.entryCode == "activity_qrcode") {

                var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
                //检查是否是链接
                if (objExp.test(TemplateCell.entryContent) == true) {
                    LODOP.ADD_PRINT_BARCODE(10, 0, 20 + 'mm', 20 + 'mm',
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

        LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);
        LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
        LODOP.SET_PRINTER_INDEXA($scope.entity.userDeliveryTemplate.printerKey);
        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    $win.alert({
                        type: "success",
                        content: '打印成功'//内容
                    });
                }
                else {
                    alert("放弃打印！");
                }
            };
            LODOP.PRINTA();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PRINTA()) {
            $win.alert({
                type: "success",
                content: '打印成功'//内容
            });
        }
        else {
            alert("放弃打印！");
        }


    };

}]);


