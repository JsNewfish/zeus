/**
 * Created by Jin on 2016/7/26.
 */
app.controller('userExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', '$modifyTemplate', '$dpPrint', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state, $modifyTemplate, $dpPrint) {

    init();

    function init() {
        getData();
        $dpPrint.initCaiNiao();
    }

    function getData() {
        $scope.loading = $restClient.get('seller/userExpressTemplate/list', null, function (data) {
            $scope.userExpressTemplateList = data.data;
            console.log(data);
        });
    }
    //热敏设置
    $scope.setWaybill = function(userExpressTemplate){
        $modifyTemplate.setWaybill(userExpressTemplate);
    };
    //更新菜鸟云模板
    $scope.updateCloudTemplate = function(){
        $modifyTemplate.updateCloudTemplate(getData);

    };

    //添加云打印模板
    $scope.addCloudTemplate = function(){
        $modifyTemplate.addCloudTemplate(getData);
    };
    //删除云打印模板
    $scope.deleteCloudTemplate = function(){
        $modifyTemplate.deleteCloudTemplate(getData);
    };
    //编辑菜鸟云模板
    $scope.editCloud = function(){
        $modifyTemplate.editCloud(getData);
    };

    //编辑快递模板

    $scope.edit = function (userExpressTemplate) {
        $modifyTemplate.edit(userExpressTemplate);
    };

    //删除快递模板

    $scope.deleteTemp = function (userExpressTemplate) {
        $modifyTemplate.deleteTemp(userExpressTemplate, getData);
    };

    //添加快递模板
    $scope.addExpressTemplate = function () {
        $modifyTemplate.addExpressTemplate(getData);
    };
    //设为默认模板
    $scope.default = function (userExpressTemplate) {
        $restClient.postFormData('seller/userExpressTemplate/default', {id: userExpressTemplate.id}, function (data) {
            getData();
        });
    };

    //锁定打印机
    $scope.printerLock = function (userExpressTemplate) {
        var printerList = [];
        if(userExpressTemplate.category == 1){
            //普通面单
            if(!$dpPrint.isCLodopInstalled()){
                return false;
            }
            var iPrinterCount = LODOP.GET_PRINTER_COUNT();
            for (var i = 0; i < iPrinterCount; i++) {
                printerList.push(LODOP.GET_PRINTER_NAME(i));
            }
        }else{
            //电子面单
            if($dpPrint.printerInfo){
                printerList = $dpPrint.printerInfo.printers;
            }else{
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
            }

        }
        if(printerList.length>0){
            var modalInstance = $modal.open({
                templateUrl: "views/pages/userExpressTemplatePrinterLock.html",
                controller: "userExpressTemplatePrinterLockCtrl",
                resolve: {
                    data: function () {
                        return {
                            userExpressTemplate :angular.copy(userExpressTemplate),
                            printerList:printerList
                        };
                    }
                }
            });
            modalInstance.result.then(function () {
                getData();
            });
        }

    };

    //取消锁定
    $scope.printerUnLock = function (userExpressTemplate) {
        userExpressTemplate.printerKey = null;
        $restClient.post('seller/userExpressTemplate/updatePrinter', null, userExpressTemplate, function (data) {
            if (data.data) {
                //getData();
            }
        });
    };

    //修改名称
    $scope.updateName = function (userExpressTemplate) {

        var modal = $win.prompt({
            value: userExpressTemplate.name,
            windowTitle: '修改模板名称',
            title: "模板名称",
            templateBody: '<div class="form-group ">' +
                              '<div class="col-xs-12">' +
                                 '<input type="text" class="form-control" ng-model="data.value" ng-maxlength="15" required="" name="username">' +
                              '</div>' +
                          '</div>'
        });
        modal.result.then(function (data) {
            var postData = angular.copy(userExpressTemplate);
            postData.name = data;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, postData, function (data) {
                getData();
            });
        });
    };

    //修改排序
    $scope.updateSequence = function (userExpressTemplate) {
        var modal = $win.prompt({
            value: userExpressTemplate.sequence,
            windowTitle: '修改模板排序',
            title: "模板排序",
            templateBody: '<div class="form-group">' +
                              '<div class="col-xs-12">' +
                                  '<input type="number" class="form-control" ng-model="data.value" required="" name="number">' +
                              '</div>' +
                           '</div>'
        });
        modal.result.then(function (data) {
            userExpressTemplate.sequence = data;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, userExpressTemplate, function (data) {
                getData();
            });
        });
    };

    //预览模板
    $scope.previewTemplate = function (userExpressTemplate) {
        $dpPrint.printExpress(true, {userExpressTemp: userExpressTemplate});
    };

    //预览电子面单模板
    $scope.previewWaybillTemplate = function (userExpressTemplate) {

        $restClient.post('seller/userExpressTemplate/listCustomCell',{userTemplateId:userExpressTemplate.id},null,function(data){
            console.log(data.data);
            $dpPrint.printWaybill(true, {userExpressTemp: userExpressTemplate},
                {
                    userTemplateCells:data.data,
                    waybills:[{
                        expressNo:9890000160004,
                        templateUrl:userExpressTemplate.stdTemplateUrl,
                        customAreaUrl:userExpressTemplate.stdCustomAreaUrl,
                        printData: {
                            "data": {
                                "cpCode": userExpressTemplate.userExpressCode,
                                "recipient": {
                                    "address": {
                                        "city": "北京市",
                                        "detail": "花家地社区卫生服务站三层楼我也不知道是哪儿了",
                                        "district": "朝阳区",
                                        "province": "北京",
                                        "town": "望京街道"
                                    },
                                    "mobile": "1326443654",
                                    "name": "张三",
                                    "phone": "057123222"
                                },
                                "routingInfo": {
                                    "consolidation": {
                                        "name": "杭州",
                                        "code": "hangzhou"
                                    },
                                    "origin": {
                                        "code": "POSTB"
                                    },
                                    "sortation": {
                                        "name": "杭州"
                                    },
                                    "routeCode": "380D-56-04"
                                },
                                "sender": {
                                    "address": {
                                        "city": "北京市",
                                        "detail": "花家地社区卫生服务站二层楼我也不知道是哪儿了",
                                        "district": "朝阳区",
                                        "province": "北京",
                                        "town": "望京街道"
                                    },
                                    "mobile": "1326443654",
                                    "name": "张三",
                                    "phone": "057123222"
                                },
                                "shippingOption": {
                                    "code": "COD",
                                    "services": {
                                        "SVC-COD": {
                                            "value": "200"
                                        }
                                    },
                                    "title": "代收货款"
                                },
                                "waybillCode": "9890000160004"
                            },
                            "signature": "ALIBABACAINIAOWANGLUO",
                            "templateURL": userExpressTemplate.stdTemplateUrl
                        }
                    }]
                },undefined,undefined,undefined,$scope
            );

        })
    };

}]);

app.controller('userExpressTemplatePrinterLockCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.userExpressTemplate = data.userExpressTemplate;
    $scope.printerList = data.printerList;
    $scope.waybill = (data.userExpressTemplate.category == 2);
    //保存
    $scope.save = function (userExpressTemplate) {
        $restClient.post('seller/userExpressTemplate/updatePrinter', null, userExpressTemplate, function (data) {
            if (data.data) {
                $modalInstance.close();
            }
        });
    };

    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('addExpressTemplateCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win', function ($scope, $modalInstance, $modal, $restClient, $win) {
    init();
    function init() {
        getData();
    }

    function getData() {
        $restClient.post('seller/userExpressTemplate/form', null, null, function (data) {
            $scope.expressTemplateList = data.data.sysTemplateList;
            $scope.sysTemplate = data.data.sysTemplateList[0];
            $scope.sysTemplateName = $scope.sysTemplate.name;
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        if ($scope.sysTemplateName == "" || $scope.sysTemplateName == null || $scope.sysTemplateName == undefined) {
            $win.alert("模板名称不能为空");
            return;
        }
        if ($scope.sysTemplateName.length > 15) {
            $win.alert("模板名称不能超过15个字符");
            return;
        }
        $scope.sysTemplate.name = $scope.sysTemplateName;
        $scope.loading = $restClient.post('seller/userExpressTemplate/add', null, $scope.sysTemplate, function (data) {
            console.log(data);
            $modalInstance.close($scope.express);
        });

    };
    $scope.checkEntry = function (sysTemplate) {
        $scope.sysTemplate = sysTemplate;
        $scope.sysTemplateName = $scope.sysTemplate.name;
    };

}]);

app.controller('setWaybillCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win','data', function ($scope, $modalInstance, $modal, $restClient, $win,data) {
    $scope.userExpressTemplate = data;
    $scope.interfaceType = 1;
    getData();
    function getData() {
        $scope.loading = $restClient.get('seller/waybill/getSubscription', {userExpressId:data.userExpressId}, function (data) {

            if(data.data){
                $scope.branchAccountCols = data.data.branchAccountCols;
                $scope.shipAddressList = serverToClient(angular.copy(data.data.branchAccountCols));
                $scope.shipAddress = $scope.shipAddressList[0];
            }

        });
        $restClient.post('seller/waybill/listBindSubscription', {userExpressId:data.userExpressId},null, function (data) {

            if(data.data){
                $scope.bindSubscriptionList = data.data;
                angular.forEach($scope.bindSubscriptionList,function(item){
                    if(item.subscriptionInfo){
                        item.shipAddressList = serverToClient(item.subscriptionInfo.branchAccountCols);
                    }
                });
                $scope.otherSubscription = $scope.bindSubscriptionList[0];
                $scope.$watch('otherSubscription',function(newValue,oldValue){
                    if(newValue!=oldValue){
                        if(newValue.shipAddressList) {
                            $scope.shipAddress = newValue.shipAddressList[0];
                        }
                    }
                });
            }
        });
    }

    $scope.$watch('interfaceType',function(newValue,oldValue){
        if(newValue!=oldValue){
            if(newValue==1){
                if($scope.shipAddressList){
                    $scope.shipAddress = $scope.shipAddressList[0];
                }
            }
            if(newValue==2){
                if($scope.bindSubscriptionList) {
                    $scope.otherSubscription = $scope.bindSubscriptionList[0];
                }
                if($scope.otherSubscription.shipAddressList){
                    $scope.shipAddress = $scope.otherSubscription.shipAddressList[0];

                }

            }
        }
    });
    function serverToClient(branchAccountCols){
        var shipAddressList =[];
        //将Address字段合到shippAddressCols的对象中
        angular.forEach(branchAccountCols,function(item){
            angular.forEach(item.shippAddressCols,function(address){
                angular.extend(address,item);
                delete address.shippAddressCols;
            });
            shipAddressList = shipAddressList.concat(item.shippAddressCols);
        });

        return shipAddressList;

    }

    $scope.save = function () {
        $scope.userExpressTemplate.interfaceType = $scope.interfaceType;
        $scope.userExpressTemplate.branchCode = $scope.shipAddress.branchCode;
        $scope.userExpressTemplate.city = $scope.shipAddress.city;
        $scope.userExpressTemplate.detail = $scope.shipAddress.detail;
        $scope.userExpressTemplate.district = $scope.shipAddress.district;
        $scope.userExpressTemplate.province = $scope.shipAddress.province;
        $scope.shipAddress.town &&($scope.userExpressTemplate.town = $scope.shipAddress.town);
        //使用其他店铺
        if($scope.interfaceType==2) {
            $scope.userExpressTemplate.userId = $scope.otherSubscription.userId;
            $scope.userExpressTemplate.userNick = $scope.otherSubscription.name;
        }
        $modalInstance.close($scope.userExpressTemplate);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);