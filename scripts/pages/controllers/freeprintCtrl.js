/**
 * Created by wsj on 2016/7/1.
 */
app.controller('freeprintCtrl', ['$scope', '$modal', '$restClient', '$win', '$location', '$dpPrint', '$q', '$modifyTemplate','$calculate', function ($scope, $modal, $restClient, $win, $location, $dpPrint, $q, $modifyTemplate,$calculate) {

    function getAllTemplate() {

        $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.expressTemp = data.data;
            if ($scope.freePackage.userTemplateId != undefined) {
                angular.forEach($scope.expressTemp, function (userTemplate) {
                    if (userTemplate.id == $scope.freePackage.userTemplateId) {
                        $scope.userTemplate = userTemplate;
                    }
                });
            } else {
                $scope.userTemplate = $scope.expressTemp[0];
            }
            //是否是电子面单
            $scope.waybill = ($scope.userTemplate.category == 2);
        });

    }

    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            console.log(data);
            $scope.baseSetting = data.data;
        });
    }

    function getFreeAddress() {
        $scope.loading = $restClient.get('seller/receiptAddress/getFreeAddress', null, function (data) {
            $scope.address = data.data;
            $scope.freePackage.contactId = data.data.contactId;
            $scope.freePackage.contactName = data.data.contactName;
            $scope.freePackage.province = data.data.province;
            $scope.freePackage.city = data.data.city;
            $scope.freePackage.country = data.data.country;
            $scope.freePackage.addr = data.data.addr;
            $scope.freePackage.zipCode = data.data.zipCode;
            data.data.phone && ($scope.freePackage.phone = data.data.phone);
            data.data.mobilePhone && ($scope.freePackage.mobilePhone = data.data.mobilePhone);
            console.log(data);
        });
    }

    function serverToClient(data) {
        if (data.freight ) {
            data.freight = parseFloat((data.freight / 100).toFixed(2));
        }
        angular.forEach(data.freeTradeList, function (freeTrade) {
            angular.forEach(freeTrade.freeOrderList, function (freeOrder) {
                if (freeOrder.price) {
                    freeOrder.price = parseFloat((freeOrder.price / 100).toFixed(2));
                }
                if (freeOrder.payment) {
                    freeOrder.payment = parseFloat((freeOrder.payment / 100).toFixed(2));

                }
            });
        })

        return data;
    }

    function getFreePackage(pid) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (pid != null) {
            $scope.loading = $restClient.post('seller/freeInputTrade/getFreePackage', null, pid, function (data) {
                $scope.freePackage = serverToClient(data.data);
                calculatePrice();
                console.log(data.data);
                $scope.freePackage.fromType = 1;
                defer.resolve();
                if (data.data.receiptAddress) {
                    $scope.address = data.data.receiptAddress;
                } else {
                    //获取默认寄件人地址
                    getFreeAddress();
                }
            });
        }
        return promise;
    }

    function getCopyFreePackage(copyId) {
        var defer = $q.defer();
        var promise = defer.promise;
        $scope.loading = $restClient.post('seller/freePrintList/copyPackage', null, copyId, function (data) {
            $scope.freePackage = serverToClient(data.data);
            console.log(data.data);
            $scope.freePackage.fromType = 1;
            defer.resolve();
            if (data.data.receiptAddress) {
                $scope.address = data.data.receiptAddress;
            } else {
                //获取默认寄件人地址
                getFreeAddress();
            }
        });
        return promise;
    }

    function init() {
        $scope.message = '数据加载中。。。';
        $scope.freePackage = {
            fromType: 1,
            freeTradeList: [{}]
        };
        $scope.hasId = false;
        getBaseSetting();
        if ($location.search().id) {
            $scope.hasId = true;
            getFreePackage($location.search().id).then(getAllTemplate);
        }
        else if ($location.search().copyId) {
            getCopyFreePackage($location.search().copyId).then(getAllTemplate);
        } else {
            getAllTemplate();
            getFreeAddress();
        }
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
        calculatePrice();
    }

    $scope.resetData = function () {
        $scope.freePackage = {
            fromType: 1,
            freeTradeList: [{}]
        };
    };

    init();
    //更换地址
    $scope.changeAddress = function () {
        //电子面单
        if($scope.userTemplate.category == 2){
            var modalInstance = $modal.open({
                templateUrl: "views/pages/changeWaybillAddress.html",
                controller: "changeAddressCtrl",
                resolve: {
                    data: function () {
                        return $scope.userTemplate;
                    }
                },
                size: "lg"
            });
            modalInstance.result.then(function (sellerAddress) {
                console.log(sellerAddress);
                $scope.address = sellerAddress;
                $scope.address.province = $scope.userTemplate.province;
                $scope.address.city = $scope.userTemplate.city;
                $scope.address.country = $scope.userTemplate.district;
                $scope.address.addr = $scope.userTemplate.detail;
            })
        }else{
            var modalInstance = $modal.open({
                templateUrl: "views/pages/changeAddress.html",
                controller: "changeAddressCtrl",
                resolve: {
                    data: function () {
                        return $scope.userTemplate;
                    }
                },
                size: "lg"
            });
            modalInstance.result.then(function (sellerAddress) {
                console.log(sellerAddress);
                $scope.address = sellerAddress;
            })
        }

    };
    //修改地址
    $scope.handleShipAddress = function (address) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/addShipAddress.html",
            controller: "addShipAddressCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    if (typeof address != 'undefined') {
                        return address;
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            if (data) {
                $scope.address = data;
            }
        });
    };

    $scope.clickFromType = function (type, importType) {
        if (type == 1) {
            $scope.freePackage.fromType = 1;
        } else if (type == 2) {

            var modalInstance = $modal.open({
                templateUrl: "views/components/addFreePrintTbTrade.html",
                controller: "addFreePrintTbTradeCtrl",
                size: "lg",
                resolve: {
                    data: function () {
                        return angular.copy(type);
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                $scope.freePackage = angular.copy(tradeList[0]);
                $scope.freePackage.freeTradeList = [];
                $scope.freePackage.freeTradeList = tradeList;

                $scope.freePackage.freight =  $scope.freePackage.postFee;
                calculatePrice();
                //去除多余字段

                delete $scope.freePackage.discountFee;
                delete $scope.freePackage.buyerMessage;
                delete $scope.freePackage.status;
                delete $scope.freePackage.payTime;
                delete $scope.freePackage.created;

                $scope.freePackage.fromType = 2;
            }, function () {
                $scope.freePackage.fromType = 1;
            });
        } else if (type == 3) {

            var modalInstance = $modal.open({
                templateUrl: "views/components/addFreePrintTbTrade.html",
                controller: "addFreePrintTbTradeCtrl",
                size: "lg",
                resolve: {
                    data: function () {
                        return angular.copy(type);
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                $scope.freePackage = angular.copy(tradeList[0]);
                $scope.freePackage.freeTradeList = [];
                $scope.freePackage.freeTradeList = tradeList;

                delete $scope.freePackage.buyerMessage;
                delete $scope.freePackage.status;
                delete $scope.freePackage.payTime;
                delete $scope.freePackage.created;

                $scope.freePackage.fromType = 3;
            }, function () {
                $scope.freePackage.fromType = 1;
            });
        } else if (type == 4) {

            $scope.type = 4;
            var modalInstance = $modal.open({
                templateUrl: "views/components/ImportFreePrintTrade.html",
                controller: "ImportFreePrintTradeCtrl",
                resolve: {
                    data: function () {
                        return {
                            importType: importType
                        };
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                // $scope.freePackage = tradeList[0];
                //$scope.freePackage.fromType = 4;
                // addNewAddress(angular.copy($scope.freePackage));
                $location.url('/print/freeUnprintedExpress');
            });
        }
    };

    function addNewAddress(postEntity, deferred) {
        //验证所选模板是否开通电子面单
        if ($scope.userTemplate.category==2&&!$scope.userTemplate.branchCode) {
            $modifyTemplate.setWaybill($scope.userTemplate);
            return false;
        }
        postEntity.userExpressId = $scope.userTemplate == null ? '' : $scope.userTemplate.userExpressId;
        postEntity.userTemplateId = $scope.userTemplate == null ? '' : $scope.userTemplate.id;
        //delete postEntity.freeTradeList;

        saveServerToClient(postEntity);
        postEntity.contactId = $scope.address.contactId;
        if ((!$location.search().id) && postEntity.id) {
            var cover = $modal.open({
                templateUrl: "views/pages/updateConfirm.html",
                controller: "updateConfirmCtrl",
                windowClass: "confirm",
                size: "lg"
            });

            cover.result.then(function (isNew) {
                if (isNew) {
                    delete postEntity.id;

                    postEntity.freeTradeList[0] &&delete postEntity.freeTradeList[0].id;
                }
                $scope.loading = $restClient.post('seller/freeInputTrade/add', null, postEntity, function (data) {
                    $scope.freePackage = serverToClient(data.data);
                    if (deferred) {
                        deferred.resolve(data.data);
                    } else {
                        $win.alert({
                            type: "success",
                            content: '保存成功'//内容
                        });

                    }
                });
            });
            return false;
        }
        $scope.loading = $restClient.post('seller/freeInputTrade/add', null, postEntity, function (data) {
            $scope.freePackage = serverToClient(data.data);
            if (deferred) {
                deferred.resolve(data.data);
            } else {
                $win.alert({
                    type: "success",
                    content: '保存成功'//内容
                });

            }

        });
    }

    $scope.save = function () {

        addNewAddress(angular.copy($scope.freePackage));
    };
    //新增物品
    $scope.addFreeOrder = function(freeOrder){
        var data;

        if(freeOrder){
            //编辑
            data = angular.copy(freeOrder);
        }else{
            //新增
            if(!$scope.freePackage.freeTradeList[0].freeOrderList){
                $scope.freePackage.freeTradeList[0].freeOrderList = [];
            }
            data = $scope.freePackage.freeTradeList[0].freeOrderList;
        }
        var modal = $modal.open({
            templateUrl:'views/pages/addFreeOrder.html',
            controller:'addFreeOrderCtrl',
            resolve:{
                data:function(){
                    return data;
                }
            }
        });
        modal.result.then(function(data){
            if(data){
                for(var attr in data){
                    freeOrder[attr] = data[attr];
                }
            }
            calculatePrice();
        },function(){
            calculatePrice();
        });
    };

    $scope.deleteFreeOrder = function (freeOrder) {
        var remind = $win.confirm({
            img: "images/components/alert/alert-delete.png",
            title: "删除确认",
            content: "你确定要删除此商品吗？"
        });
        remind.result.then(function () {
            var index = $scope.freePackage.freeTradeList[0].freeOrderList.indexOf(freeOrder);
            $scope.freePackage.freeTradeList[0].freeOrderList.splice(index, 1);
            calculatePrice();
        });
    };

    $scope.importFile = function (type) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freePrintImport.html",
            controller: "freePrintImportCtrl",
            resolve: {
                data: function () {
                    return angular.copy(type);
                }
            }
        });
        modalInstance.result.then(function (tradeList) {
            $scope.freePackage = tradeList[0];
            $scope.freePackage.fromType = 4;
        });

    };
    function saveServerToClient(data) {

        if (data.freight != undefined) {
            data.freight =data.freight*100;
            data.freeTradeList[0].postFee = data.freight;
        }
        /*if(!data.freeTradeList[0].payment){
            data.freeTradeList[0].payment = data.payment*100;
        }*/

        data.totalAdjustFee && (data.freeTradeList[0].totalAdjustFee =data.totalAdjustFee);

        delete data.totalPrice;
        delete data.totalAdjustFee;
        delete data.postFee;
        delete data.payment;
        delete data.sellerFlag;
        angular.forEach(data.freeTradeList, function (freeTrade) {
            var totalPrice = 0;
            if(freeTrade.payment==undefined){
                freeTrade.payment = 0;
                angular.forEach(freeTrade.freeOrderList, function (item) {
                    freeTrade.payment = freeTrade.payment + item.payment * 100;
                });
                freeTrade.payment = freeTrade.payment + freeTrade.postFee*100;
            }

            angular.forEach(freeTrade.freeOrderList, function (item) {
                delete item.edit;
                if(item.price!=undefined){
                    item.price = item.price * 100;
                }
                if(item.payment!=undefined) {
                    item.payment = $calculate.floatMul(item.payment, 100);
                    totalPrice = totalPrice + item.payment;
                }
            });
            if(data.totalPrice){
                data.freeTradeList[0].totalPrice =data.totalPrice;
            }else{
                data.freeTradeList[0].totalPrice = totalPrice;
            }

            if (data.freeOrderList) {
                delete data.freeOrderList;
            }
        });


        return data;
    }

    $scope.openSearchTrade = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freePrintSearchTrade.html",
            controller: "freePrintSearchTradeCtrl",
            size: "lg",
            resolve: {
                data: function () {
                    return {
                        importType: ""
                    };
                }
            }
        });
        modalInstance.result.then(function (freeTrade) {
            $scope.freePackage.buyerNick = freeTrade.buyerNick;
            $scope.freePackage.receiverName = freeTrade.receiverName;
            $scope.freePackage.receiverState = freeTrade.receiverState;
            $scope.freePackage.receiverCity = freeTrade.receiverCity;
            $scope.freePackage.receiverDistrict = freeTrade.receiverDistrict;
            $scope.freePackage.receiverAddress = freeTrade.receiverAddress;
            $scope.freePackage.receiverMobile = freeTrade.receiverMobile;
            $scope.freePackage.receiverPhone = freeTrade.receiverPhone;
        });
    };
    //获取流水号
    function getSerial(Package) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, [saveServerToClient(angular.copy(Package))], function (data) {

            angular.forEach(data.data, function (item) {
                if (Package.id == item.id) {
                    Package.serial = item.serial;
                }

            });
            deferred.resolve(data.data);
        });
        return promise;
    }

    //打印预览快递单
    $scope.printExpress = function (preview) {
        var params;
        var baseData = {
            userExpressTemp: $scope.userTemplate,
            baseSetting: $scope.baseSetting,
            defaultReceiptAddress: $scope.address
        };
        var deferred = $q.defer(),
            promise = deferred.promise;
        addNewAddress(angular.copy($scope.freePackage), deferred);


        promise.then(function (freePackage) {

            getSerial(freePackage).then(function (freePackageArray) {
                function printCallback() {

                    $restClient.post('seller/freePrintList/printExpress', null, freePackageArray, function (data) {
                        console.log(data.data);
                        $scope.freePackage.waybillId = null;
                        $win.alert({
                            type: 'success',
                            content: '打印成功'
                        });

                    })


                }


                var isWaybill = ($scope.userTemplate.category == 2);
                //是否是电子面单模板
                if (isWaybill) {
                    //信息是否完整
                    var isInfoComplete = true;
                    //运单号是否存在
                    var existNum = true;
                    //判读是否有必填信息和单号
                    angular.forEach(freePackageArray, function (freePackage) {
                        isInfoComplete = isInfoComplete && (/*(freePackage.freeTradeList[0].freeOrderList && freePackage.freeTradeList[0].freeOrderList.length) &&*/ freePackage.receiverName
                            && freePackage.receiverState && freePackage.receiverCity && freePackage.receiverDistrict
                            && freePackage.receiverAddress && (freePackage.receiverMobile || freePackage.receiverPhone));

                        existNum = existNum && freePackage.waybillId;
                    });
                    //电子面单包裹收件人信息和商品信息不能为空
                    if (!isInfoComplete) {
                        $win.confirm({                      //提醒文案
                            content: '您当前选择的包裹中有包裹收件人信息和商品信息不全，电子面单打印包裹收件人信息和商品信息必须不为空。',
                            title: '电子面单，收件人信息和商品信息不能为空。',
                            size: "lg",
                            img: "images/components/alert/alert-forbid.png"
                        });
                        return false;
                    } else {
                        //如果都存在电子面单号不用获取单号
                        if (!existNum) {
                            //获取电子面单回调函数
                            var actions = {
                                successCallback: function (data) {
                                    console.log(data);
                                    //获取后回调
                                    angular.forEach(data.data.successWaybillList, function (successWaybill) {

                                        if ($scope.freePackage.id == successWaybill.packageId) {
                                            $scope.freePackage.waybillId = successWaybill.id;
                                            $scope.freePackage.expressNo = successWaybill.expressNo;

                                            $scope.freePackage.userExpressId = $scope.userTemplate.userExpressId;
                                            $scope.freePackage.userTemplateId = $scope.userTemplate.id;
                                            $scope.freePackage.userTemplateName = $scope.userTemplate.name;
                                        }


                                    });

                                    if (data.data.errorWaybillList.length != 0) {

                                        //显示获取单号失败原因
                                        $modal.open({
                                            templateUrl: 'views/pages/applyWaybillResult.html',
                                            controller: "recycleResultCtrl",
                                            resolve: {
                                                data: function () {
                                                    return {
                                                        errorRecycleList: data.data.errorWaybillList,
                                                        successRecycleList: data.data.successWaybillList
                                                    };
                                                }
                                            }
                                        });
                                    } else {
                                        var waybillIds = [$scope.freePackage.waybillId];
                                        params = [$scope.freePackage];
                                        //获取打印数据
                                        $restClient.post("seller/waybill/listPrintData", null, {
                                            waybillIds: waybillIds,
                                            userTemplateId: $scope.userTemplate.id
                                        }, function (data) {
                                            //电子面单打印
                                            $dpPrint.printWaybill(preview, baseData, data.data, printCallback, params, 2, $scope)

                                        });
                                    }


                                },
                                failCallback: function (data) {
                                    //没开通||没设置网点
                                    if (data.resultCode == 900015 || data.resultCode == 900017) {
                                        $modifyTemplate.setWaybill($scope.userTemplate);
                                    } else
                                    //没余额
                                    {
                                        var mes = {
                                            title: '获取电子面单号',
                                            content: data.resultMessage,
                                            img: "images/components/alert/alert-forbid.png",
                                            size: "lg",
                                            showClose: true,
                                            showCancel: false
                                        };

                                        $win.confirm(mes);
                                    }

                                }
                            };

                            var applyWaybillParamModel = {
                                userExpressTemplateId: $scope.userTemplate.id,
                                packageType: 2,
                                freePackageList: freePackageArray
                            };

                            $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                        } else {
                            var waybillIds = [$scope.freePackage.waybillId];
                            params = freePackageArray;
                            //获取打印数据
                            $restClient.post("seller/waybill/listPrintData", null, {
                                waybillIds: waybillIds,
                                userTemplateId: $scope.userTemplate.id
                            }, function (data) {
                                //电子面单打印
                                $dpPrint.printWaybill(preview, baseData, data.data, printCallback, params, 2, $scope)

                            });
                        }
                    }

                } else {
                    $dpPrint.printExpress(preview, baseData, printCallback, params, freePackageArray, 2);
                }

            })

        })


    };
    //打印预览发货单
    $scope.printDelivery = function (preview) {
        var domElement = $('.deliveryTemplate');
        var baseData = {
            baseSetting: $scope.baseSetting
        };

        function printCallback() {
            var deferred = $q.defer(),
                promise = deferred.promise;
            addNewAddress(angular.copy($scope.freePackage), deferred);

            promise.then(function (freePackage) {
                $restClient.post('seller/freePrintList/printDeliveryBill', null, [freePackage], function (data) {
                    console.log(data.data);

                    $win.alert({
                        type: 'success',
                        content: '打印成功'
                    })
                })
            })
        }

        getSerial($scope.freePackage).then(function (freePackage) {

            $dpPrint.printDelivery(preview, baseData, printCallback, null, [saveServerToClient(angular.copy($scope.freePackage))], domElement);

        });


    };
    //粘贴地址
    $scope.addressPaste = function (event) {
        console.log(event.target.value);
        var address = event.target.value;

        if (address.indexOf('，') > -1) {
            address = address.replace(/，/ig, ",");
        }

        var addressList = address.split(',');
        //第一位用户名
        $scope.freePackage.receiverName = addressList[0];

        if (addressList.length > 1) {
            //第二位手机号
            $scope.freePackage.receiverMobile = addressList[1];

            if (/^[0-9]*$/.test(addressList[2][0])) { //第三位电话号
                $scope.freePackage.receiverPhone = addressList[2];

                var addressDetail = addressList[3].split(" ");
                $scope.freePackage.receiverState = addressDetail[0];
                $scope.freePackage.receiverCity = addressDetail[1];
                $scope.freePackage.receiverDistrict = addressDetail[2];
                $scope.freePackage.receiverAddress = addressDetail[3] + addressDetail[4];
                if (addressList[4]) {
                    $scope.freePackage.receiverZip = addressList[4];
                }

            } else {      //第三位是地址
                var addressDetail = addressList[2].split(" ");
                $scope.freePackage.receiverState = addressDetail[0];
                $scope.freePackage.receiverCity = addressDetail[1];
                $scope.freePackage.receiverDistrict = addressDetail[2];
                $scope.freePackage.receiverAddress = "";
                for (var i = 3; i < addressDetail.length; i++) {
                    $scope.freePackage.receiverAddress = $scope.freePackage.receiverAddress + addressDetail[i];
                }
                if (addressList[3]) {
                    $scope.freePackage.receiverZip = $.trim(addressList[3]);
                }
            }

        }

    };
    //重新计算价格
    function calculatePrice(){
        $scope.orderPrice = 0;
        angular.forEach($scope.freePackage.freeTradeList[0].freeOrderList, function (freeOrder) {
            if(freeOrder.payment!=undefined){
                $scope.orderPrice = $calculate.floatAdd($scope.orderPrice ,$calculate.floatMul(freeOrder.payment,100));
            }
        });
        $scope.tradeDiscountFee = $scope.freePackage.freeTradeList[0].discountFee?$calculate.floatMul(parseFloat($scope.freePackage.freeTradeList[0].discountFee),100):0;
        $scope.freight = $scope.freePackage.freight?$calculate.floatMul($scope.freePackage.freight,100):0;
        $scope.freePackage.freeTradeList[0].payment = $scope.orderPrice +$scope.freight -$scope.tradeDiscountFee;
    }
    //
    $scope.$watch('freePackage.freight',function(newValue,oldValue){
        if(newValue!=oldValue){
            calculatePrice();
        }
    });
}]);
app.controller('changeAddressCtrl', ["$scope", "$modalInstance", "$restClient","data", function ($scope, $modalInstance, $restClient,data) {
    if(data){
        $scope.userTemplate = data;
    }
    $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
        console.log(data);
        $scope.entity = data.data;
    });
    $scope.save = function () {
        $modalInstance.close($scope.sellerAddress);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('addFreePrintTbTradeCtrl', ['$scope', '$modalInstance', '$restClient', '$win', '$state', 'data','$calculate', function ($scope, $modalInstance, $restClient, $win, $state, data,$calculate) {
    $scope.data = data;
    $scope.totalPayment = 0;
    $scope.totalFee = 0;
    $scope.totalDiscountFee = 0;
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    function serverToClient(data) {
        if (data.length > 0) {
            angular.forEach(data, function (freeOrder) {
                if (freeOrder.price) {
                    freeOrder.price = parseFloat((freeOrder.price / 100).toFixed(2));
                }
                if (freeOrder.payment) {
                    freeOrder.payment = parseFloat((freeOrder.payment / 100).toFixed(2));

                }
                freeOrder.discountFee = $calculate.floatSub($calculate.floatMul(freeOrder.price,freeOrder.num), freeOrder.payment);
            });

        }
        return data;
    }

    $scope.queryForm = function (tids) {
        $scope.loading = $restClient.postFormData('seller/freeInputTrade/searchTradeByTids', {
            "fromType": $scope.data,
            "tids": tids
        }, function (data) {
            console.log(data);
            $scope.tradeList = data.data;
            //主订单
            $scope.mainTrade = $scope.tradeList[0];

            $scope.freeOrderList = serverToClient(mergeFreeOrder($scope.tradeList));
        });
    };
    $scope.importTaobaoTrade = function () {
        if (!$scope.tradeList || $scope.tradeList.length == 0) {
            $win.alert("无有效订单可插入,请先查询");
            return false;
        } else {
            $scope.mainTrade.freeOrderList = $scope.freeOrderList;
            $scope.mainTrade.sellerMemo = $scope.sellerMemo;
            $scope.mainTrade.payment = $scope.totalPayment;
                //$scope.mainTrade.payment = parseFloat(($scope.totalPayment/100).toFixed(2));
            $scope.mainTrade.postFee = parseFloat(($scope.totalFee / 100).toFixed(2));
            $scope.mainTrade.discountFee = $scope.totalDiscountFee;
            $modalInstance.close([$scope.mainTrade]);
        }
    };
    function mergeFreeOrder(tradeList) {
        var freeOrderList = [];

        angular.forEach(tradeList, function (trade) {
            //单笔order时payment要减去邮费
            if(trade.freeOrderList.length==1){
                trade.freeOrderList[0].payment = trade.freeOrderList[0].payment - trade.postFee;
                //单笔order时payment要加回trade的满减
                if(trade.freeOrderList[0].discountFee){
                    trade.freeOrderList[0].payment = trade.freeOrderList[0].payment + $calculate.floatMul(parseFloat(trade.discountFee),100);
                }
            }
            angular.forEach(trade.freeOrderList, function (freeOrder) {
                freeOrderList.push(freeOrder);
            });
            $scope.sellerMemo = $scope.sellerMemo ? $scope.sellerMemo + ',' + trade.sellerMemo : trade.sellerMemo;
            $scope.totalPayment = $scope.totalPayment + trade.payment;
            $scope.totalFee = $scope.totalFee + trade.postFee;
            if(trade.discountFee){
                $scope.totalDiscountFee = $scope.totalDiscountFee + parseFloat(trade.discountFee);
            }
        });

        return freeOrderList;
    }
}]);

app.controller("ImportFreePrintTradeCtrl", ["$scope", "$modalInstance", "$restClient", "$win", "data", "$q","$modifyTemplate",
    function ($scope, $modalInstance, $restClient, $win, data, $q,$modifyTemplate) {
        $scope.type = data.importType;
        $scope.errorMessage = '';
        $scope.message = '数据加载中。。。';
        init();
        function init() {
            getAllTemplate();
            getAllReceiptAddress();
            initData();
        }

        function getAllTemplate() {
            $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
                $scope.expressTemp = data.data;
            });
        }

        function getAllReceiptAddress() {
            $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
                $scope.addressList = data.data;
            });
        }

        function initData() {
            $scope.importType = data.importType;
            $scope.importTypeMeau = {
                'jianhuaban': {
                    format: [{
                        key: "1",
                        value: "H:备注"
                    }],
                    name: "简化版"
                },
                'laoban': {
                    format: [{
                        key: "1",
                        value: "Z:保价声明价值"
                    }],
                    name: "老版"
                },
                'jingdong': {
                    format: [{
                        key: "1",
                        value: "AD:订单渠道"
                    }/*,{
                     key:"",
                     value:"Z:货号"
                     }*/],
                    name: "京东"
                }
            };
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
        $scope.uploadFile = function () {
            $scope.message = '数据提交中。。。';
            if ($scope.userTemplate == null) {
                $win.alert("请选文件的最后一列");
                return;
            }
            var x = document.getElementById("files").value;
            if (x == null || x == "" || x == undefined) {
                $win.alert("请选上传文件");
                return;
            }
            if ($scope.tempId == null) {
                $win.alert("请选择快递模板");
                return;
            }

            if ($scope.type == 'jianhuaban') {
                uploadSimple();
            } else if ($scope.type == 'laoban') {
                uploadSimple2();
            } else if ($scope.type == 'jingdong') {
                uploadJD();
            }
            if ($scope.contactId == null) {
                $win.alert("请选择发货地址");
                return;
            }
        };
        $scope.exportTemplate = function () {

            var form = $("<form>");   //定义一个form表单
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('target', '');
            form.attr('method', 'get');
            form.attr('action', "//print.cuxiao.quannengzhanggui.net/seller/exportTemplate/uploadFreeCommonTemplate");

            var input1 = $('<input>');
            input1.attr('type', 'hidden');
            $('body').append(form);  //将表单放置在web中
            form.append(input1);   //将查询参数控件提交到表单上
            form.submit();
        };

        function uploadSimple() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_common_simple",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }

        function uploadSimple2() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_common",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }

        function uploadJD() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_jd",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }
    }]);

app.controller('freePrintImportCtrl', ['$scope', '$modalInstance', '$restClient', '$win', 'data', function ($scope, $modalInstance, $restClient, $win, data) {
    $scope.type = data;
    function init() {
        $scope.upload = {"type": $scope.type};
        getData();
    }

    init();
    function getData() {
        $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.expressTemp = data.data;
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);

app.controller('freePrintSearchTradeCtrl', ['$scope', '$modalInstance', '$restClient', function ($scope, $modalInstance, $restClient) {

    function init() {
        //分页相关
        $scope.pageNo = 0;
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.freeTradeSearchModel = {
            pageSize: $scope.pageSize,
            pageNo: $scope.pageNo
        };
        getData($scope.freeTradeSearchModel);
    }

    init();
    $scope.defSearch = function (pageNo, pageSize, total) {
        $scope.freeTradeSearchModel.pageSize = pageSize;
        $scope.freeTradeSearchModel.pageNo = --pageNo;
        console.log($scope.freeTradeSearchModel);
        getData($scope.freeTradeSearchModel);
    };
    $scope.search = function (freePackageSearchModel) {
        freePackageSearchModel.pageSize = 10;
        freePackageSearchModel.pageNo = 0;
        getData(freePackageSearchModel);
    };
    function getData(freeTradeSearchModel) {
        if (undefined == freeTradeSearchModel) {
            return;
        }
        $scope.loading = $restClient.post('seller/freePrintList/searchFreePackage', null, freeTradeSearchModel, function (data) {
            $scope.data = data;
            console.log(data);
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
            $scope.freeTradeList = data.data;
            $scope.freeTradeSearchModel = freeTradeSearchModel;
        });
    }

    $scope.checkFreeTrade = function (freeTrade) {
        $modalInstance.close(freeTrade);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('updateConfirmCtrl', ["$scope", "$modalInstance", function ($scope, $modalInstance) {

    $scope.save = function (isNew) {
        $modalInstance.close(isNew);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('addFreeOrderCtrl', ["$scope", "$modalInstance","data","$calculate", function ($scope, $modalInstance,data,$calculate) {
    $scope.edit = true;
    var freeOrderList;
    console.log(data);
    //传入的是Array为新增物品否则为编辑
    if(data instanceof Array){
        freeOrderList = data;
        $scope.edit = false;
    }else{
        $scope.obj = data;
        $scope.obj.discountFee&&($scope.obj.discountFee = $scope.obj.discountFee.toString());
        //如果存在商品简称
        if(data.abbrevName){
            $scope.obj.title = data.abbrevName;
        }
    }

    $scope.save = function () {
        //如果存在商品简称
        if(data.abbrevName){
            $scope.obj.abbrevName = $scope.obj.title;
        }
        $modalInstance.close($scope.obj);
    };
    $scope.continueAdd = function(close){
        freeOrderList.push($scope.obj);
        $scope.obj = {};
        if(close){
            $modalInstance.close();
        }
    };
    $scope.calculate = function(){
        $scope.obj.payment = parseFloat($calculate.floatMul(($scope.obj.price||0),($scope.obj.num||0)) - ($scope.obj.discountFee||0));
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);