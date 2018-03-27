/**
 * Created by nanning_zhang on 2016/8/2.
 */
app.controller("preparingBillDetailCtrl", ["$scope", "$win", '$modal', '$restClient', '$q', "$location", function ($scope, $win, $modal, $restClient, $q, $location) {

    function init() {
        initData();

    }

    function initData() {
        $scope.preparingBillId = $location.search().preparingBillId;
        //$scope.preparingBillSetting = null;
        $scope.loading = $restClient.get('seller/preparingBill/detail', {preparingBillId: $scope.preparingBillId}, function (data) {
            $scope.preparingBillDto = data.data.preparingBillDto;
            $scope.preparingBillSetting = data.data.preparingBillSetting;
            $scope.itemList = data.data.itemPreparingBillDtoList;
            count(data.data.itemPreparingBillDtoList);
            $scope.switchSkuSort($scope.preparingBillSetting.skuSequence);
            $scope.switchTradeSort($scope.preparingBillSetting.itemSequence);
        });
    }

    function count(itemPreparingBillDtoList) {
        var allNum = 0;
        var allPrice = 0;
        if (itemPreparingBillDtoList && itemPreparingBillDtoList.length > 0) {
            angular.forEach(itemPreparingBillDtoList, function (item) {
                allNum = allNum + item.totalNum;
                allPrice = allPrice + item.totalPrice;
            });
        }
        $scope.allNum = allNum;
        $scope.allPrice = allPrice;
    }

    //排序 data:要排序的list key:根据哪个字段排序 sortBay:true升序 false降序
    function sorting(data, key, sortBay) {
        var list = data;
        var temp = null;
        for (var i = 0; i < list.length; i++) {
            for (var j = list.length - 1; j > i; j--) {
                var lastElement = list[j];
                var prevElement = list[j-1];
                if (sortBay) {
                    if(key=="skuCode"||key=="itemCode"){
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key]&& prevElement[key].localeCompare(lastElement[key]) > 0 )||(prevElement[key]&&!lastElement[key])) {
                            temp = list[j-1];
                            list[j-1] = list[j];
                            list[j] = temp;
                        }
                    }else{
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key]&&lastElement[key] < prevElement[key])||(prevElement[key]&&!lastElement[key])) {
                            temp = list[j-1];
                            list[j-1] = list[j];
                            list[j] = temp;
                        }
                    }


                } else {
                    if(key=="skuCode"||key=="itemCode"){
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key] && prevElement[key].localeCompare(lastElement[key]) < 0) || (!prevElement[key] && lastElement[key])) {
                            temp = list[j - 1];
                            list[j - 1] = list[j];
                            list[j] = temp;
                        }
                    }else {
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key] && lastElement[key] > prevElement[key]) || (!prevElement[key] && lastElement[key])) {
                            temp = list[j - 1];
                            list[j - 1] = list[j];
                            list[j] = temp;
                        }
                    }
                }
            }
        }
        return list;
    }

    $scope.switchSkuSort = function (num) {
        $scope.preparingBillSetting.skuSequence = num;
        switch (num) {

            case 1:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuCode', true);
                });
                break;
            case 2:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuCode', false);
                });
                break;
            case 0:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuTotalNum', true);
                });
                break;
            case 3:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuTotalNum', false);
                });
                break;
        }
    };

    $scope.switchTradeSort = function (num) {
        $scope.preparingBillSetting.itemSequence = num;
        switch (num) {
            case 0:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'totalNum', false);
                break;
            case 3:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'totalNum', true);
                break;
            case 1:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'itemCode', true);
                break;
            case 2:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'itemCode', false);
                break;
        }
    };

    init();


    $scope.deletes = function (item, index) {

        var confirm = $win.confirm({
            size: "lg",//尺寸
            img: "images/components/alert/alert-forbid.png",//图标
            title: "您确认要隐藏内容吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "隐藏后仅限于本次不被打印，但刷新后仍会再次显示！"//内容
        });
        confirm.result.then(function () {
            $scope.itemList.splice(index, 1);
        });
    };
    $scope.back = function () {
        $location.url("/print/preparingBill");
    };

    $scope.$watch('preparingBillSetting', function (newValue, oldValue) {
        if (newValue != oldValue && oldValue != undefined) {
            $restClient.post('seller/preparingBill/updatePreparingBillSetting', null, newValue, function (data) {
                if (!data.data) {
                    $win.alert('设置失败');
                }
            });
        }
    }, true);

    $scope.previewPreparing = function (preview) {
        // LODOP = getLodop();
        $scope.timeNow = moment().format('YYYY-MM-DD HH:mm:SS');
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
        if (isCLodopInstalled()) {
            $q.when({preview: preview, type: 3}, choosePrinter).then(doPrint);
        }
        //设置打印机
        function doPrint(printer) {


            console.log("print control version:" + LODOP.VERSION);


            LODOP.PRINT_INITA(0,0,'100%','100%',"打印备货单");
            LODOP.SET_SHOW_MODE("LANGUAGE", 0);


            //宽度自动缩放
            LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT", "Auto-Width");
            //设置本次输出的打印任务名
            LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "备货单");
            LODOP.SET_PRINTER_INDEXA(printer);

            var strFormHtml = angular.element(".data-table-wrap").html();
            LODOP.ADD_PRINT_HTM(0, 0, '90%', '100%', '<!DOCTYPE html>' + strFormHtml);

            //预览
            if (preview) {
                //设置预览窗口大小
                LODOP.SET_PREVIEW_WINDOW(1, 0, 0, 950, 600, "打印预览");
                LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
                if (LODOP.VERSION > "6.1.8.7") {
                    LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                    LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                    LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
                }
                LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPreview();

            } else {
                //LODOP.SET_PRINT_COPIES(2);
                LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPrint();

            }
        }
        function callBackFunc(){
            $scope.loading = $restClient.postFormData('seller/preparingBill/printLog',{preparingBillId:$scope.preparingBillId},function(data){
                $win.alert({
                    type: "success",
                    content: '打印成功'//内容
                });
            })
        }
        function RealPreview() {

            //云打印C-Lodop返回结果用回调函数:
            if (LODOP.CVERSION) {
                CLODOP.On_Return = function (TaskID, Value) {
                    if (Value == 1) {
                        callBackFunc();
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
                callBackFunc();

            } else {
                console.log("放弃打印！");
            }
        }

        function RealPrint() {

            //云打印C-Lodop返回结果用回调函数:
            if (LODOP.CVERSION) {
                CLODOP.On_Return = function (TaskID, Value) {
                    if (Value == 1) {
                        callBackFunc();
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
                callBackFunc();
            }
            else {
                alert("放弃打印！");
            }
        }
    };

}]);