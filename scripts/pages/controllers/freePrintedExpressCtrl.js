/**
 * Created by wsj on 2016/7/18.
 */
app.controller('freePrintedExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$filter', '$location', '$dpPrint', '$q', function ($scope, $modal, $restClient, $win, $filter, $location, $dpPrint, $q) {
    function getData(freePackageSearchModel, pageNo, pageSize) {
        pageSize && (freePackageSearchModel.pageSize = pageSize);
        freePackageSearchModel.pageNo = pageNo - 1;
        freePackageSearchModel.createStartTime = $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.createEndTime = $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printExpressStartTime = $scope.printExpressStartTime && moment($scope.printExpressStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printExpressEndTime = $scope.printExpressEndTime && moment($scope.printExpressEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printDeliveryStartTime = $scope.printDeliveryStartTime && moment($scope.printDeliveryStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printDeliveryEndTime = $scope.printDeliveryEndTime && moment($scope.printDeliveryEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.isDelete = $scope.isDelete;
        freePackageSearchModel.orderby = "t.create_time";
        freePackageSearchModel.isPrintExpress = 2;
        $scope.loading = $restClient.post('seller/freePrintList/search', null, angular.copy(freePackageSearchModel), function (data) {
            $scope.data = data;
            $scope.freePackageList = data.data;
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
            $scope.FreePackageIdsArray = [];
            $scope.checkAll = false;
        });
    }

    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {

            $scope.baseSetting = data.data;
            $scope.freePackageSearchModel.freeSequencePrint = $scope.baseSetting.freeSequencePrint;
            getData($scope.freePackageSearchModel);
        });
    }

    function getAllExpress() {
        $restClient.get('seller/userExpress/list', null, function (data) {
            $scope.userExpress = data.data;

        });
    }

    function getFreeAddress() {
        $scope.loading = $restClient.get('seller/receiptAddress/getFreeAddress', null, function (data) {
            $scope.obj.defaultReceiptAddress = data.data;
            console.log(data);
        });
    }

    function init() {
        //分页相关
        $scope.pageNo = 1;
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.isCollapsed = false;
        $scope.limitTime1 = {
            startDate: '%y-%M-%d 00:00:00',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.limitTime2 = {
            startDate: '%y-%M-%d 23:59:59',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.createStartTime = moment().subtract(1, 'days').startOf("day")._d;
        $scope.createEndTime = moment().endOf("day")._d;

        $scope.obj = {
            userExpressTemp: '',
            defaultReceiptAddress: ''
        };
        $scope.resetData();
        getAllExpress();
        getBaseSetting();
        getFreeAddress();
        $scope.isDelete = 0;
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
    }

    $scope.resetData = function () {

        $scope.createStartTime = moment().subtract(1, 'days').startOf("day")._d;
        $scope.createEndTime = moment().endOf("day")._d;
        $scope.printExpressStartTime = null;
        $scope.printExpressEndTime = null;
        $scope.printDeliveryStartTime = null;
        $scope.printDeliveryEndTime = null;
        $scope.isDelete = 0;
        $scope.freePackageSearchModel = {
            orderby: " t.create_time",
            isPrintExpress: 2,
            createStartTime: $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss"),
            createEndTime: $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss")
        };
    };

    init();
    //展开详细
    $scope.expandAll = function (isCollapsed) {
        if (!isCollapsed) {
            $('.table .collapse').collapse('show');
        } else {
            $('.table .collapse').collapse('hide');
            //底部栏复原
            $timeout(function () {
                if ($('.operation-bar-wrap').offset().top < $(window).height()) {
                    $('.smart-float-bottom').css({position: 'inherit'});
                }
            }, 500);
        }


    };
    //订单排序
    $scope.setSort = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setFreePrintSort.html",
            controller: "setSortCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.baseSetting);
                }
            }
        });
        modalInstance.result.then(function (baseSetting) {
            $scope.baseSetting = baseSetting;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.put('seller/baseSetting/update', null, baseSetting, function (data) {
                $win.alert({
                    type: "success",
                    content: '设置排序成功'
                });
                $scope.freePackageSearchModel.freeSequencePrint = $scope.baseSetting.freeSequencePrint;
                data.data && getData($scope.freePackageSearchModel);
            });
        })
    };

    $scope.search = function (page, pageSize) {

        getData($scope.freePackageSearchModel, page, pageSize);
    };
    $scope.edit = function (freePackage) {
        //页面跳转
        $location.url('/print/freeprint?id=' + freePackage.id);
    };
    $scope.deleteExpressNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var allExistNum = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistNum = allExistNum && freePackage.freePackage.expressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });

        if (!allExistNum) {
            $win.alert('所选订单有不存在运单号，无法删除！');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法删除！');
            return false;
        }

        var packageIds = serverToClient($scope.FreePackageIdsArray);
        $restClient.postFormData('seller/freePrintList/deleteExpressNo', {"packageIds": packageIds}, function (data) {
            $win.alert({
                type: "success",
                content: "删除成功"
            });
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.expressNo = "";
            });
        });
    };
    $scope.uTemplate = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freeUserTemplate.html",
            controller: "freeUserTemplateCtrl",
            resolve: {
                data: function () {
                    return $scope.FreePackageIdsArray;
                }
            }
        });
        modalInstance.result.then(function (template) {
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.userExpressCode = template.userExpressCode;
                FreePackage.freePackage.userExpressId = template.userExpressId;
                FreePackage.freePackage.userExpressName = template.userExpressName;
                FreePackage.freePackage.userTemplateName = template.name;
                FreePackage.freePackage.userTemplateId = template.id;
                FreePackage.freePackage.userExpressTemplateCategory = template.category;
            });
        });
    };
    $scope.batchRemove = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var remind = $win.confirm({
            img: "images/components/alert/alert-delete.png",
            title: "你确定要删除所选订单吗？",
            content: "删除后系统将无法恢复其正常状态，请谨慎操作。"
        });
        remind.result.then(function () {
            var packageIds = serverToClient($scope.FreePackageIdsArray);
            $restClient.postFormData('seller/freePrintList/deletePackage', {"pids": packageIds}, function (data) {
                getData($scope.freePackageSearchModel, $scope.pageNo);
                $win.alert({
                    type: "success",
                    content: "删除成功"
                })
            });
        });
    };
    $scope.selectItem = function (freePackage) {
        if (freePackage.selected) {
            $scope.FreePackageIdsArray.push(freePackage);
            $scope.checkAll = $scope.FreePackageIdsArray.length == $scope.freePackageList.length
        } else {
            var index = $scope.FreePackageIdsArray.indexOf(freePackage);
            $scope.FreePackageIdsArray.splice(index, 1);
            $scope.checkAll = false;
        }
    };
    $scope.selectAll = function () {
        if ($scope.checkAll) {
            $scope.FreePackageIdsArray = $scope.freePackageList;
        } else {
            $scope.FreePackageIdsArray = [];
        }

        angular.forEach($scope.freePackageList, function (item) {
            item.selected = $scope.checkAll;
        });
        console.log($scope.freePackageList);
    };

    $scope.updateTemplateNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var allExistExpressNo = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistExpressNo = freePackage.freePackage.expressNo && allExistExpressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });
        if (!allExistExpressNo) {
            $win.alert('请将所有订单输入运单号');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法保存！');
            return false;
        }

        var entry = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
            return this.freePackage;
        }).get();

        $scope.message = '数据提交中。。';
        $scope.loading = $restClient.post('seller/freePrintList/updateExpressNo', null, entry, function (data) {
            $win.alert({
                type: "success",
                content: data.resultMessage
            });

        });
    };
    //批量打印
    $scope.batchPrint = function (preview, type) {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var printCallback;

        var FreePackageIdsArray = $($scope.FreePackageIdsArray).map(function () {
            return this.freePackage;
        }).get();

        var FirstTemplate = FreePackageIdsArray[0].userTemplateId;
        var userExpressId = FreePackageIdsArray[0].userExpressId;
        var sameTemplate = true;
        //选择多笔时快递模板是否相同
        if (FreePackageIdsArray.length > 1) {
            angular.forEach(FreePackageIdsArray, function (FreePackage) {
                sameTemplate = (FreePackage.userTemplateId == FirstTemplate)
            });
        }

        //获取已打印的包裹数
        var printedPackages = $($scope.FreePackageIdsArray).map(function () {                //获得已打印包裹
            if (type == 1) {                       //已打印过快递单
                if (this.freePackage.isPrintExpress) {
                    return this;
                }
            }
            if (type == 2) {                       //已打印过发货单
                if (this.freePackage.isPrintDeliveryBill) {
                    return this;
                }
            }
        }).get();
        //设置中开启了多次打印验证
        if ($scope.baseSetting.isCheckMorePrint && printedPackages.length > 0) {            //已开启多次打印验证且存在已打印订单
            var typeText = (type == 1 ? '快递单' : '发货单');
            var buttonText = (preview ? '预览' : '打印') + typeText;
            var modal = $win.confirm({                      //提醒文案
                content: '共勾选了' + '<span class="text-warning">【' + $scope.FreePackageIdsArray.length + '】</span>' + '笔订单,其中有'
                + '<span class="text-warning">【' + printedPackages.length + '】</span>' + '笔已打印过' + typeText,
                title: '含有已被打印过' + typeText + '的订单，是否要重新打印？',
                closeText: buttonText,
                size: "lg",
                img: "images/components/alert/alert-forbid.png"
            });
            modal.result.then(function () {
                //验证码确认
                return authCode();

            }).then(function () {

                getSerial().then(doPrint);
            })

        } else {

            getSerial().then(doPrint);
        }
        //验证码
        function authCode() {
            var deferred = $q.defer();

            var authModal = $modal.open({
                templateUrl: "views/pages/authModal.html",
                controller: "authModalCtrl"
            });
            authModal.result.then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        }

        //获取流水号
        function getSerial() {
            var deferred = $q.defer(),
                promise = deferred.promise;
            $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, FreePackageIdsArray, function (data) {
                console.log(data.data);
                angular.forEach(data.data, function (item) {
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        if (freePackage.freePackage.id == item.id) {
                            freePackage.freePackage.serial = item.serial;
                        }
                    })
                });
                deferred.resolve(data.data);

            });
            return promise;
        }

        //打印
        function doPrint(params) {
            if (type == 1) {
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printExpress', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printExpressTime = item.printExpressTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.isPrintExpress = item.isPrintExpress;
                                    freePackage.freePackage.printExpressNum = item.printExpressNum;
                                }
                            })
                        })
                    })
                };
                if (!sameTemplate) {
                    $win.alert('选择的订单快递模板不同，无法打印');
                    return false;
                } else {
                    $restClient.post('seller/userExpressTemplate/form', {
                        userExpressId: userExpressId,
                        templateId: FirstTemplate
                    }, null, function (data) {
                        $scope.obj.userExpressTemp = data.data.userExpressTemplate;
                        $scope.obj.baseSetting = $scope.baseSetting;

                        var isWaybill = (data.data.userExpressTemplate.category == 2);

                        console.log(data);
                        //是否是电子模板
                        if (isWaybill) {

                            var isInfoComplete = true;
                            var allExistNum = true;
                            //判读是否有必填信息和单号
                            angular.forEach(params, function (freePackage) {

                                isInfoComplete = isInfoComplete && (/*(freePackage.freeTradeList[0].freeOrderList && freePackage.freeTradeList[0].freeOrderList.length) &&*/ freePackage.receiverName
                                    && freePackage.receiverState && freePackage.receiverCity && freePackage.receiverDistrict
                                    && freePackage.receiverAddress && (freePackage.receiverMobile || freePackage.receiverPhone));

                                allExistNum = allExistNum && freePackage.waybillId;

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
                                if (!allExistNum) {
                                    //获取电子面单回调函数
                                    var actions = {
                                        successCallback: function (data) {
                                            console.log(data);
                                            //获取后回调
                                            angular.forEach(data.data.successWaybillList, function (successWaybill) {
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    if (freePackage.freePackage.id == successWaybill.packageId) {
                                                        freePackage.freePackage.waybillId = successWaybill.id;
                                                        freePackage.freePackage.expressNo = successWaybill.expressNo;

                                                        freePackage.freePackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                                        freePackage.freePackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                                        freePackage.freePackage.userTemplateName = $scope.obj.userExpressTemp.name;
                                                        // freePackage.freePackage.expressId = $scope.obj.userExpressTemp.expressId;
                                                    }
                                                });

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
                                                //全部电子面单号获取成功
                                                var waybillIds = [];
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    waybillIds.push(freePackage.freePackage.waybillId)
                                                });
                                                //获取打印数据
                                                $restClient.post("seller/waybill/listPrintData", null, {
                                                    waybillIds: waybillIds,
                                                    userTemplateId: $scope.obj.userExpressTemp.id
                                                }, function (data) {
                                                    //电子面单打印
                                                    $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                                });
                                            }


                                        },
                                        failCallback: function (data) {
                                            //没开通||没设置网点
                                            if (data.resultCode == 900015 || data.resultCode == 900017) {
                                                $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
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
                                    //过滤掉已存在单号的包裹
                                    FreePackageIdsArray = FreePackageIdsArray.filter(function (freePackage) {
                                        if (!(freePackage.waybillId)) {
                                            return freePackage;
                                        }
                                    });

                                    var applyWaybillParamModel = {
                                        userExpressTemplateId: FirstTemplate,
                                        packageType: 2,
                                        freePackageList: FreePackageIdsArray
                                    };

                                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);


                                } else {

                                    var waybillIds = [];
                                    angular.forEach(params, function (freePackage) {
                                        waybillIds.push(freePackage.waybillId)
                                    });
                                    //获取打印数据
                                    $restClient.post("seller/waybill/listPrintData", null, {
                                        waybillIds: waybillIds,
                                        userTemplateId: $scope.obj.userExpressTemp.id
                                    }, function (data) {
                                        //电子面单打印
                                        $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                    });
                                }

                            }
                        } else {
                            //普通快递单打印
                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, params, 2);
                        }

                    });
                }
            } else if (type == 2) {
                var domElement = $('.deliveryTemplate');
                var baseData = {
                    baseSetting: $scope.baseSetting
                };
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printDeliveryBill', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printDeliveryBillTime = item.printDeliveryBillTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.printDeliveryBillNum = item.printDeliveryBillNum;
                                    freePackage.freePackage.isPrintDeliveryBill = item.isPrintDeliveryBill;

                                }
                            })
                        })
                    })
                };
                $dpPrint.printDelivery(preview, baseData, printCallback, params, params, domElement);
            }
        }
    };

    $scope.viewLog = function (freePackage) {
        var modalInstance = $modal.open({
            templateUrl: "views/components/freePrintLog.html",
            controller: "freePrintLogCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    return angular.copy(freePackage);
                }
            }
        });

    };

    $scope.copyTrade = function (freePackage) {
        var remind = $win.confirm({
            img: "images/components/alert/alert-forbid.png",
            title: "你确定要复制当前订单信息吗？",
            content: "系统将此笔订单信息复制后直接插入至录入打印界面"
        });
        remind.result.then(function () {
            /*$restClient.post('seller/freePrintList/copyPackage', null, freePackage.id, function (data) {
             $location.url('/print/freeprint?id=' + data.data.id);
             });*/
            $location.url('/print/freeprint?copyId=' + freePackage.id);
        });
    };
    //联想快递单号
    $scope.associateExpressNo = function (onePackage, isConsign) {
        // onePackage.smart = true;
        var packages = $scope.FreePackageIdsArray;

        if (packages.length > 1) {                           //选择了多笔订单
            var index = -1;
            angular.forEach(packages, function (Package, i) {
                if (Package.freePackage.id == onePackage.freePackage.id) {
                    index = i;
                }
            });
            if (index == -1) {                                  //若点击的包裹非选中
                inputOneExpressNo();
                return false;
            }
            if (index > 0) {                               //若点击的包裹非首个
                packages.splice(0, index);                      //截取点击位以下包裹

            }

            console.log(packages);
            packages.length > 1 ? inputBatchExpressNo(packages) : inputOneExpressNo();

        } else {
            inputOneExpressNo();
        }
        function inputOneExpressNo() {      //单个联想
            if (onePackage.freePackage.expressNo) {
                $win.alert('已经输入了运单号码，不能联想输入');
                return false;
            } else {
                $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: onePackage.freePackage.userTemplateId}, function (data) {
                    console.log(data);
                    if (data.data) {
                        onePackage.freePackage.expressNo = window.getNextSid(onePackage.freePackage.userExpressName, data.data, 1);
                        //打印后的联想
                        isConsign && showExpressNo([onePackage], isConsign, onePackage.freePackage.expressNo, onePackage.freePackage.userExpressName);
                    } else {
                        $win.alert('尚未保存过' + onePackage.freePackage.userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                            '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                    }
                });
            }
        }

        function showExpressNo(packages, isConsign, sidStart, userExpressName, lastSid) {
            $modal.open({
                templateUrl: "views/pages/remindExpressNo.html",
                controller: "remindExpressNoCtrl",
                resolve: {
                    data: function () {
                        return angular.copy({
                            sidStart: sidStart,
                            lastSid: lastSid,
                            packages: packages,
                            userExpressName: userExpressName,
                            isConsign: isConsign
                        });
                    }
                }
            });

        }

        function inputBatchExpressNo(packages) {        //多个联想
            var existExpressNo = false;                 //非首个是否存在运单号

            angular.forEach(packages, function (Package, i) {
                if (i > 0 && Package.freePackage.expressNo) {
                    existExpressNo = true;
                }
            });
            if (existExpressNo) {
                var mes = {
                    title: '已存在运单号！',
                    content: '当前选择联想的订单已存在运单号，是否覆盖这些运单号码？',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var cover = $win.confirm(mes);
                cover.result.then(function () {
                    inputExpressNo();
                });
            } else {
                inputExpressNo();
            }
            function inputExpressNo() {
                var sidStart;
                var userExpressName = packages[0].freePackage.userExpressName;
                var userTemplateId = packages[0].freePackage.userTemplateId;
                if (packages[0].freePackage.expressNo) {              //第一个包裹是否存在运单号
                    sidStart = packages[0].freePackage.expressNo;
                    var firstPackage = packages[0];
                    packages.shift();
                    replaceExpressNo(sidStart, userExpressName);
                    //加回原来的元素
                    packages.unshift(firstPackage);
                    showExpressNo(packages, isConsign, sidStart, firstPackage.freePackage.userExpressName, packages[packages.length - 1].freePackage.expressNo);
                } else {
                    getSidStart(userExpressName, userTemplateId);

                }


                function getSidStart(userExpressName, userTemplateId) {                            //获取订单号
                    $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: userTemplateId}, function (data) {
                        console.log(data);
                        if (data.data) {
                            sidStart = data.data;
                            replaceExpressNo(sidStart, userExpressName);
                            showExpressNo(packages, isConsign, window.getNextSid(userExpressName, sidStart, 1), userExpressName, packages[packages.length - 1].freePackage.expressNo);
                        } else {
                            $win.alert('尚未保存过' + userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                                '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                        }
                    });
                }

                function replaceExpressNo(sidStart, userExpressName) {           //替换订单号
                    angular.forEach(packages, function (Package, i) {
                        var index = 1 + i;
                        Package.freePackage.expressNo = window.getNextSid(userExpressName, sidStart, index);
                    });
                }
            }
        }
    };
    //导出数据
    $scope.exportData = function () {

        function transform(data, url) {
            if (typeof  data != "object") {
                return;
            }
            var form = $("<form>");
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('method', 'post');
            form.attr('action', url);

            for (var i in data) {
                if (data[i] != null && data[i] != 'undefined') {
                    var input = $('<input>');
                    input.attr('name', i);
                    input.attr('value', data[i]);
                    input.attr('type', 'hidden');
                    form.append(input);
                }
            }
            document.body.appendChild(form[0]);
            return form;
        }

        if ($scope.createStartTime) {
            $scope.freePackageSearchModel.createStartTime = moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.createStartTime =null;
        }
        if ($scope.createEndTime) {
            $scope.freePackageSearchModel.createEndTime = moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.createEndTime =null;
        }
        if ($scope.printExpressStartTime) {
            $scope.freePackageSearchModel.printExpressStartTime = moment($scope.printExpressStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printExpressStartTime =null;
        }
        if ($scope.printExpressEndTime) {
            $scope.freePackageSearchModel.printExpressEndTime = moment($scope.printExpressEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printExpressEndTime =null;
        }
        if ($scope.printDeliveryStartTime) {
            $scope.freePackageSearchModel.printDeliveryStartTime = moment($scope.printDeliveryStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printDeliveryStartTime = null;
        }
        if ($scope.printDeliveryEndTime) {
            $scope.freePackageSearchModel.printDeliveryEndTime = moment($scope.printDeliveryEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printDeliveryEndTime = null;
        }

        $scope.freePackageSearchModel.isDelete = $scope.isDelete;
        delete $scope.freePackageSearchModel.pageNo;
        delete $scope.freePackageSearchModel.pageSize;
        var form = transform($scope.freePackageSearchModel, "/seller/freePrintList/export");

        form.submit();
    };

    function serverToClient(data) {
        var pids = "";
        angular.forEach(data, function (item) {
            pids = pids + item.freePackage.id + ",";
        });
        return pids;
    }

    $scope.recycleWaybill = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var mes = {
            title: '你确定要回收当前绑定的电子面单号吗？',
            content: '回收后可以重新申请新的电子面单号或用其他的模板重新打印。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var actions = {
            successCallback: function (data) {
                //全部成功
                if (data.data.errorRecycleList.length == 0) {
                    angular.forEach($scope.FreePackageIdsArray, function (Package) {
                        Package.freePackage.expressNo = "";
                    });
                    $win.alert({
                        content: '回收成功',
                        type: 'success'
                    })
                } else {
                    //显示打印结果
                    $modal.open({
                        templateUrl: 'views/pages/recycleResult.html',
                        controller: "recycleResultCtrl",
                        resolve: {
                            data: function () {
                                return data.data;
                            }
                        }
                    });
                    //批量时回调成功的
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                            if (successPackage.packageId == freePackage.freePackage.id) {
                                freePackage.freePackage.expressNo = "";
                            }
                        });
                    });


                }

            }
        };
        var allExistNum = true;
        //是否都存在电子面单号
        angular.forEach($scope.FreePackageIdsArray, function (Package) {
            allExistNum = (Package.freePackage.waybillId) && Package.freePackage.expressNo && allExistNum;
        });
        if (!allExistNum) {
            $win.alert("有订单不存在电子面单号，无法回收！");
            return false;
        }
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            var recycleWaybillParams = {
                packageType: 2
            };
            recycleWaybillParams.freePackageList = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
                return this.freePackage;
            }).get();

            $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
        })

    }

}]);

app.controller('freeUserTemplateCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', 'data', function ($scope, $modalInstance, $modal, $restClient, $win, $q, $compile, $location, $state, data) {
    $scope.data = data;
    function getAllTemplate() {
        $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.userTemplate = data.data;
        });
    }

    getAllTemplate();

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function (template) {
        var packageIds = serverToClient($scope.data);
        var entry = {
            "packageIds": packageIds,
            "tempId": template.id
        };
        $restClient.postFormData('seller/freePrintList/updateExpressTemple', entry, function (data) {
            data.data && $modalInstance.close(template);

        });
    };

    function serverToClient(data) {
        var pids = "";
        angular.forEach(data, function (item) {
            pids = pids + item.freePackage.id + ",";

        });
        pids = pids.substr(0, pids.length - 1);
        return pids;
    }
}]);