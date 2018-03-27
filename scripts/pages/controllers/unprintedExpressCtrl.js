/**
 * Created by Jin on 2016/6/17.
 */
app.controller('unprintedExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$common', '$dpPrint', '$compile', '$modifyTemplate', '$timeout', '$dpAddress', '$location', '$local', '$advertisement', '$element', function ($scope, $modal, $restClient, $win, $q, $common, $dpPrint, $compile, $modifyTemplate, $timeout, $dpAddress, $location, $local, $advertisement, $element) {
    init();
    function init() {
        $scope.operateType = 1;
        $scope.operateStatus = 1;
        $scope.messages = '数据加载中。。';
        $scope.reachLoding = false;
        $scope.toolMessage = '';
        //分页相关
        $scope.pageNo = 1;
        $scope.pageSize = 20;
        $scope.count = 0;
        //筛选参数初始化
        $scope.receiverKey = 1;
        $scope.skuKey = 1;
        $scope.messageKey = 1;
        $scope.itemKey = 1;
        $scope.numKey = 1;
        $scope.dateKey = 1;
        $scope.customStarId = "";
        $scope.obj = {
            userExpressTemp: '',
            defaultReceiptAddress: '',
            baseSetting: ''
        };
        $scope.packageNum = 0;
        $scope.limitTime1 = {
            startDate: '%y-%M-%d 00:00:00',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.limitTime2 = {
            startDate: '%y-%M-%d 23:59:59',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        getData();

        $scope.validateOptions = {
            blurTrig: true
        };
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
        //获取广告
        getAdvertisement();
    }

    //重置查询数据
    $scope.resetForm = function () {
        //查询数据
        $scope.operateType = 1;
        $scope.operateStatus = 1;
        //筛选数值设置
        $scope.receiverValue = null;
        $scope.skuValueSize = null;
        $scope.skuValue = null;
        $scope.messageValue = null;
        $scope.itemValue = null;
        $scope.numValueStart = null;
        $scope.numValueEnd = null;
        $scope.dateValueStart = null;
        $scope.dateValueEnd = null;

        //筛选key设置
        $scope.receiverKey = 1;
        $scope.skuKey = 1;
        $scope.messageKey = 1;
        $scope.itemKey = 1;
        $scope.numKey = 1;
        $scope.dateKey = 1;
        $scope.customStarId = "";
        $scope.fastChoiceStatus = "";
        $scope.sellerFlag = "";
        $scope.userTemplate = "";
        $scope.userExpressId = "";
        $scope.customProvince = "";
        $scope.tradeType = "";
        $scope.customStarColor = "";
        $local.clearData();
    };
    //获取数据
    function getData() {
        //设置搜索项初始值
        getParam().then(setFormerSearch).then(function () {

            getOrder($scope.pageNo, $scope.pageSize);
        });
    }

    $scope.$on('$destroy', function () {
        $local.clearData();
    });
    //获取查询参数
    function getParam() {
        var deferred = $q.defer();
        var action = {
            successCallback: function (data) {
                $scope.searchParam = data.data;
                $scope.obj.userExpressTemp = $scope.searchParam.userExpressTemplateList[0];
                $scope.obj.defaultReceiptAddress = $scope.searchParam.defaultReceiptAddress;
                $scope.obj.baseSetting = $scope.searchParam.baseSetting;
                //是否是电子面单
                $scope.waybill = ($scope.obj.userExpressTemp.category == 2);
                $scope.toolMessage = $scope.waybill ? '电子面单单号为系统自动获取不支持手工录入' : '';
                deferred.resolve();
            },
            failCallback: function (data) {
                if (data.resultCode == 900001 || data.resultCode == 900004) {
                    $scope.messages = data.resultMessage;
                    $scope.loading = deferred.promise;
                    $timeout(getData, 500);
                }
                else if (data.resultCode == 900015) {

                }
                else {
                    $scope.packages = [];
                    $win.alert({
                        type: "danger",
                        content: data.resultMessage
                    });
                }
                //getData();
            },
            errorCallback: function (data) {
                $win.alert({
                    type: "danger",
                    content: data
                });
            }
        };
        $scope.PackageSearchModel = {
            operateStatus: $scope.operateStatus
        };
        $scope.loading = $restClient.get('seller/normalPackage/list', null, action);
        return deferred.promise;
    }

    //设置广告
    function getAdvertisement() {
        $restClient.post("seller/listAdvertise", {
            pageSize: 1,
            position: "print_main"
        }, null, function (data) {
            if (data.data.length) {
                $('.advertisement-box').remove();
                $element.find(".title-bar").eq(0).after($($advertisement.create(data.data[0])));
            }
        });
    }

    $scope.getOrder = getOrder;
    //设置筛选项上一次值
    function setFormerSearch() {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var searchModel = $local.getObject('PackageSearchModel');
        searchModel.operateType && ($scope.operateType = searchModel.operateType);
        searchModel.operateStatus && ($scope.operateStatus = searchModel.operateStatus);
        searchModel.tradeType && ($scope.tradeType = searchModel.tradeType);
        searchModel.receiverKey && ($scope.receiverKey = searchModel.receiverKey);
        searchModel.receiverValue && ($scope.receiverValue = searchModel.receiverValue);
        searchModel.fastChoiceStatus && ($scope.fastChoiceStatus = searchModel.fastChoiceStatus);
        // searchModel.customProvince &&($scope.customProvince = searchModel.customProvince);
        searchModel.sellerFlag && ($scope.sellerFlag = searchModel.sellerFlag);
        // searchModel.customStarId &&($scope.customStarId = searchModel.customStarId);
        searchModel.skuKey && ($scope.skuKey = searchModel.skuKey);
        searchModel.skuValue && ($scope.skuValue = searchModel.skuValue);
        searchModel.skuValueSize && ($scope.skuValueSize = searchModel.skuValueSize);
        searchModel.messageKey && ($scope.messageKey = searchModel.messageKey);
        searchModel.messageValue && ($scope.messageValue = searchModel.messageValue);
        searchModel.itemKey && ($scope.itemKey = searchModel.itemKey);
        searchModel.itemValue && ($scope.itemValue = searchModel.itemValue);
        searchModel.numKey && ($scope.numKey = searchModel.numKey);
        searchModel.numValueStart && ($scope.numValueStart = searchModel.numValueStart);
        searchModel.numValueEnd && ($scope.numValueEnd = searchModel.numValueEnd);
        searchModel.userExpressId && ($scope.userExpressId = searchModel.userExpressId);
        searchModel.dateKey && ($scope.dateKey = searchModel.dateKey);
        searchModel.dateValueStart && ($scope.dateValueStart = searchModel.dateValueStart);
        searchModel.dateValueEnd && ($scope.dateValueEnd = searchModel.dateValueEnd);
        //是否空对象
        function isEmptyObject(obj) {
            for (var n in obj) {
                return false
            }
            return true;
        }

        var collapsed = $local.getObject('collapsed');
        if (!collapsed) {    //不为空时
            var element = angular.element('.search-bar');
            var $filterBar = element,
                $btn = element.find(".btn-toggle"),
                $searchPane = element.find(".search-pane"),
                $operations = element.find(".operations");


            $btn.text($filterBar.hasClass("collapsed") ? "收起" : "展开");
            $filterBar.removeClass("collapsed");
            $searchPane.addClass("clearfix");
            $operations.addClass("clearfix");

        }
        deferred.resolve();
        return promise;
    }

    //获取订单
    function getOrder(page, pageSize) {
        function getData() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.PackageSearchModel = {
                operateStatus: $scope.operateStatus,
                operateType: $scope.operateType,
                // userTemplate: $scope.userTemplate,
                userExpressId: $scope.userExpressId,
                fastChoiceStatus: $scope.fastChoiceStatus,
                tradeType: $scope.tradeType,
                customProvince: $scope.customProvince,
                sellerFlag: $scope.sellerFlag,
                receiverKey: $scope.receiverKey,
                receiverValue: $scope.receiverValue,
                skuKey: $scope.skuKey,
                skuValue: $scope.skuValue,
                skuValueSize: $scope.skuValueSize,
                messageKey: $scope.messageKey,
                messageValue: $scope.messageValue,
                itemKey: $scope.itemKey,
                itemValue: $scope.itemValue,
                numKey: $scope.numKey,
                customStarId: $scope.customStarId,
                numValueStart: $scope.numValueStart,
                numValueEnd: $scope.numValueEnd,
                dateKey: $scope.dateKey,
                dateValueStart: $scope.dateValueStart && moment($scope.dateValueStart).format("YYYY/MM/DD HH:mm:ss"),
                dateValueEnd: $scope.dateValueEnd && moment($scope.dateValueEnd).format("YYYY/MM/DD HH:mm:ss"),

                syncTime: $scope.searchParam.printSync.syncTime,
                waitConsignSequence: $scope.searchParam.baseSetting.waitConsignSequence,
                consignSequence: $scope.searchParam.baseSetting.consignSequence,
                pageSize: pageSize,
                pageNo: --page
            };
            if ($scope.userTemplate) {      //选择了快递模板
                $scope.PackageSearchModel.userTemplateId = $scope.userTemplate.id;
                $scope.PackageSearchModel.userExpressId = $scope.userTemplate.userExpressId;
            } else {                        //仅选择了快递公司
                $scope.userExpressId && ($scope.PackageSearchModel.userExpressId = $scope.userExpressId);
            }
            $scope.messages = '数据加载中。。';
            $scope.loading = $restClient.post('seller/normalPackage/search', null, $scope.PackageSearchModel, function (data) {
                $scope.packages = data.data;
                $scope.pageNo = ++data.pageNo;
                $scope.pageSize = data.pageSize;
                $scope.count = data.count;
                if (data.data.length != 0) {
                    //全选
                    $scope.checkedAll = false;
                    $scope.isCollapsed = false;
                    deferred.resolve();
                }

                console.log(data);
                $scope.packageNum = 0;
                //发货按钮是否显示
                $scope.consignBtn = $scope.operateStatus == 8;
                $scope.consignBtn2 = $scope.operateStatus == 7;

            });
            return promise;
        }

        function initData() {
            $timeout(function () {
                //初始化数据是否可达
                if ($scope.obj.userExpressTemp) {
                    reachWithPackage(clientToServer(angular.copy($scope.packages)), $scope.obj.userExpressTemp);
                }
                //初始化包裹是否可选
                initPackages($scope.packages);
                $scope.isCollapsed = Boolean($scope.searchParam.baseSetting.isShowDetail);
                $scope.expandAll(!$scope.isCollapsed);
            });
        }

        getData().then(initData);
        //获取已打印未发货订单数显示在头部
        countNoPrint();
    }

    //初始化订单状态
    function initPackages(packages) {
        angular.forEach(packages, function (item) {
            item.checked = false;
            item.disabled = false;                                 //包裹异常不可选
            item.compel = false;                                   //包裹异常可选
            item.normal = true;                                   //正常订单
            //全部退款成功关闭的不可选
            if (item.refundStatus == 4) {
                item.disabled = true;
                item.normal = false;
            }
            //退款中或存在异常的订单
            if (item.refundStatus == 1 || item.refundStatus == 2 || item.normalPackage.addressChangeTids || item.normalPackage.isNeedTipStatusChange == 1) {
                item.compel = true;
            }
            /*if ((item.refundStatus == 0 || item.refundStatus == 3) && (!item.normalPackage.addressChangeTids && item.normalPackage.isNeedTipStatusChange != 1)) {
             item.normal = true;

             } else if ((item.refundStatus == 1 || item.refundStatus == 2) && (!item.normalPackage.addressChangeTids && item.normalPackage.isNeedTipStatusChange != 1)) {
             item.compel = true;
             item.disabled = true;
             } else {
             item.disabled = true;
             }*/
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    normalOrder.checked = false;
                    normalOrder.compel = false;                  //强制可选
                    normalOrder.normal = false;                 //非正常订单
                    normalOrder.disabled = false;                //可强制选
                    if (normalOrder.refundStatus == 'SUCCESS' ||
                        (normalOrder.consignStatus == 0 && (normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' || normalOrder.status == 'TRADE_BUYER_SIGNED' ||
                        normalOrder.status == 'TRADE_FINISHED' || normalOrder.status == 'TRADE_CLOSED' ||
                        normalOrder.status == 'TRADE_CLOSED_BY_TAOBAO'))) {

                        normalOrder.disabled = true;            //包裹强制不可选
                    } else if (normalOrder.refundStatus == 'WAIT_SELLER_AGREE' || normalOrder.refundStatus == 'WAIT_BUYER_RETURN_GOODS' ||
                        normalOrder.refundStatus == 'WAIT_SELLER_CONFIRM_GOODS' || normalOrder.refundStatus == 'SELLER_REFUSE_BUYER') {
                        normalOrder.normal = true;
                        normalOrder.compel = true;              //可强制选订单
                    } else {

                        normalOrder.normal = true;             //正常订单
                    }
                })
            })
        })
    }

    //验证是否可达
    function reachWithPackage(packages, expressTemplate) {
        var normalPackages = $(packages).map(function () {
            return this.normalPackage
        }).get();
        $scope.reachLoding = true;
        $restClient.post('seller/normalPackage/reachWithPackage', {expressId: expressTemplate.expressId}, normalPackages, function (data) {
            console.log(data);
            $scope.reachLoding = false;
            angular.forEach($scope.packages, function (Package, i) {
                Package.normalPackage.isReach = data.data[i].isReach;
                Package.normalPackage.isExpressSame = data.data[i].isExpressSame;
                Package.normalPackage.terminiBigChar = data.data[i].terminiBigChar;
            });
        });
    }

    //查询参数转换
    function clientToServer(data) {
        angular.forEach(data, function (item) {
            delete item.checked;
            delete item.disabled;
            delete item.compel;
            delete item.normal;
            delete item.needTipRural;
            delete item.isNeedTipStatusChange;
            delete item.isNeedTipMatching;
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    delete normalOrder.checked;
                    delete normalOrder.compel;
                    delete normalOrder.normal;
                    delete normalOrder.disabled;

                })
            })
        });
        return data;
    }

    //打开修改窗口
    function openModal(temp, Obj, size) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/" + temp + ".html",
            controller: temp + "Ctrl",
            size: size,
            resolve: {
                data: function () {
                    return angular.copy(Obj);
                }
            }
        });
        return modalInstance;
    }

    //检查包裹
    function checkPackage(packages, chooseOrder) {
        var oneChoose = false;
        angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                if (chooseOrder) {                                     //当选择订单时
                    oneChoose = oneChoose || normalOrder.checked;       //check包裹的选中状态
                    packages.checked = oneChoose;
                } else {                                                //当选择包裹时
                    if (packages.checked) {                              //选中包裹
                        if (normalOrder.normal) {
                            normalOrder.checked = packages.checked;       //将包裹正常的订单选中
                        }
                    } else {                                              //取消选中包裹
                        normalOrder.checked = packages.checked;         //全部不选
                    }
                }
            })
        })

    }

    function getSelectedPackages() {
        var packages = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && packages.push(item);
        });
        return packages;
    }

    function getSelectedOrders() {
        var Orders = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    normalOrder.checked && Orders.push(normalOrder);
                })
            })
        });
        return Orders;
    }

    function getSelectedTrades(Packages) {
        var Trades = [];
        angular.forEach(Packages, function (item) {
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                Trades.push(normalTrade);
            })
        });
        return Trades;
    }

    //过滤未选中订单
    function filterUncheckedOrder(packages) {
        angular.forEach(packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade, i) {
                normalTrade.normalOrderList = normalTrade.normalOrderList.filter(function (order) {
                    if (order.checked) {
                        return order;
                    }
                });

            });
            Package.normalPackage.normalTradeList = Package.normalPackage.normalTradeList.filter(function (normalTrade) {
                if (normalTrade.normalOrderList.length != 0) {
                    return normalTrade;
                }
            });
        });
        return packages;
    }

    //合单
    function mergeTrade(Packages) {
        choosePackage(Packages);
        //合单操作
        function choosePackage(Packages) {               //选择要合并的订单
            var modelInstance = openModal('choosePackage', Packages, 'lg');
            modelInstance.result.then(function (data) {
                chooseAddress(data);
            });
        }

        //合单下一步
        function chooseAddress(packages) {               //选择主订单地址
            var modelInstance = openModal('chooseAddress', packages, 'lg');
            modelInstance.result.then(function (data) {
                console.log(data);
                if (data.back) {              //返回上一步
                    choosePackage(Packages);
                } else {
                    $restClient.post('seller/normalPackage/mergeSave', null, data, function (data) {
                        console.log(data);
                        data.data && getOrder($scope.pageNo, $scope.pageSize);
                    });

                }

            });
        }
    }

    //检查运单号
    function is_valid_out_sid(expressId, out_sid) {
        var tb_code = get_exp_tb_code(expressId);
        if (tb_code) {
            if (is_validate_function_exist('is_' + tb_code)) {//验证运单号的函数存在
                var validate_sid_ok = eval('(' + 'is_' + tb_code + '(out_sid)' + ')');

                return validate_sid_ok;
            }
        }
        return false;
    }

    //已打印未发货
    function countNoPrint() {
        $restClient.post('seller/normalPackage/countNoPrint', null, null, function (data) {
            $scope.countNoPrint = data.data;
            $scope.showSlogan = true;
            //已打印快递单页面不显示提示
            if ($scope.operateStatus == 2 || $scope.operateStatus == 5) {
                $scope.showSlogan = false;
            }
            console.log(data);
        });
    }

    //电子面单余额查询
    $scope.remaining = function (userExpressTemp) {
        var params = {
            userExpressId: userExpressTemp.userExpressId
        };
        //是否使用的是其他绑定店铺的账号
        if (userExpressTemp.userId) {
            params.userId = userExpressTemp.userId;
        }

        $scope.loading = $restClient.get('seller/waybill/getSubscription', params, function (data) {
            console.log(data);
            if (data.data) {
                var branchAccountCols = data.data.branchAccountCols[0];
                if (userExpressTemp.branchCode) {
                    angular.forEach(data.data.branchAccountCols, function (item) {
                        if (item.branchCode == userExpressTemp.branchCode) {
                            branchAccountCols = item;
                        }
                    })
                }
                var mes = {
                    title: '电子面单余额！',
                    content: '<ul><li>发货地址：' + branchAccountCols.branchName + '</li>' +
                    '<li>已用单号：' + branchAccountCols.allocatedQuantity + '</li>' +
                    '<li>已回收单号：' + branchAccountCols.cancelQuantity + '</li>' +
                    '<li>单号余额：' + branchAccountCols.quantity + '</li></ul>',
                    img: "images/components/alert/alert-forbid.png",
                    size: 'lg',
                    showClose: true,
                    showCancel: false
                };
                var cover = $win.confirm(mes);

            } else {
                var mes = {
                    title: '余额查询！',
                    content: '<div>您尚未开通<span class="text-warning">【' + $scope.obj.userExpressTemp.userExpressName + '】</span>的电子面单服务，无法查询余额！',
                    img: "images/components/alert/alert-forbid.png",
                    size: 'lg',
                    showClose: true,
                    showCancel: false
                };
                var cover = $win.confirm(mes);
            }

        })
    };
    //设置排序
    $scope.setSort = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setSort.html",
            controller: "setSortCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.searchParam.baseSetting);
                }
            }
        });
        modalInstance.result.then(function (baseSetting) {
            $scope.searchParam.baseSetting = baseSetting;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.put('seller/baseSetting/update', null, baseSetting, function (data) {
                $win.alert({
                    type: "success",
                    content: '设置排序成功'
                });
                data.data && getOrder($scope.pageNo, $scope.pageSize);
            });
        })

    };
    //关闭已打印提示
    $scope.closeCountNoPrint = function(){
        var params = angular.copy($scope.searchParam.baseSetting);
        params.isShowAfterPrint = 0;
        $restClient.put('seller/baseSetting/update', null, params, function (data) {

            $scope.searchParam.baseSetting.isShowAfterPrint = 0;
        });
    };
    //跳转到已打印快递单
    $scope.checkPrinted = function () {
        $scope.operateType = 1;
        $scope.operateStatus = 2;
        getOrder($scope.pageNo, $scope.pageSize);
    };
    //编辑快递模板
    $scope.editTemp = function (userExpressTemplate) {
        if ($scope.waybill) {
            $modifyTemplate.editCloud(getParam);
        } else {
            $modifyTemplate.edit(userExpressTemplate);
        }
    };
    //删除快递模板
    $scope.deleteTemp = function (userExpressTemplate) {
        $modifyTemplate.deleteTemp(userExpressTemplate, getParam);
    };
    //添加快递模板
    $scope.addExpressTemplate = function () {
        $modifyTemplate.addExpressTemplate(getParam);
    };
    //添加云打印模板
    $scope.addCloudTemplate = function () {
        $modifyTemplate.addCloudTemplate(getParam);
    };
    //切换筛选项
    $scope.$watch('operateType', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.operateStatus = newValue == 1 ? 1 : 7;
        }
    });
    //展开详细
    $scope.expandAll = function (isCollapsed) {
        var collapse = $('.table .tableCollapse');

        if (!isCollapsed) {
            //$('.table .collapse').collapse('show');
            // $('.table .testCollapse').css('display','block');

            if (collapse.hasClass('collapse')) {
                collapse.removeClass('collapse');
                collapse.removeClass('in');
                collapse.css('height', 'auto');
            }
            $('.package-tab').each(function (i, element) {
                if (!$(element).hasClass('expanded')) {
                    $(element).addClass('expanded');
                }
            })
        } else {
            collapse.addClass('collapse');

            $('.package-tab').each(function (i, element) {
                if ($(element).hasClass('expanded')) {
                    $(element).removeClass('expanded');
                }
            });

            //底部栏复原
            $timeout(function () {
                if ($('.operation-bar-wrap').offset().top < $(window).height()) {
                    $('.smart-float-bottom').css({position: 'inherit'});
                }
            }, 500);
        }

        $scope.searchParam.baseSetting.isShowDetail = Number(!isCollapsed);

        $restClient.put('seller/baseSetting/update', null, $scope.searchParam.baseSetting, function (data) {
            console.log(data);
        });
    };
    //关闭异常提示
    $scope.closeTip = function (Package) {
        var type = [];
        if (Package.isNeedTipStatusChange) {

            Package.normalPackage.isNeedTipStatusChange = 0;
            type.push(3);
            delete Package.isNeedTipStatusChange;


        }
        if (Package.addressChangeTids) {

            Package.normalPackage.addressChangeTids = "";
            type.push(1);
            delete Package.addressChangeTids;


        }
        if (type.length > 0) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.postFormData('seller/normalPackage/closeWarn', {
                packageId: Package.normalPackage.id,
                types: type.join(',')
            }, function (data) {
                console.log(data);
                if (data.data == 1) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }
                if ((Package.refundStatus == 0 || Package.refundStatus == 3) && (!Package.normalPackage.addressChangeTids && Package.normalPackage.isNeedTipStatusChange != 1)) {
                    Package.disabled = false;
                }
            });
        }

    };
    //切换模板检查是否可达
    $scope.switchTemplate = function (expressTemplate) {
        if ($scope.packages.length > 0) {
            reachWithPackage(clientToServer(angular.copy($scope.packages)), expressTemplate);
        }
        console.log(expressTemplate);
        //是否是电子面单
        $scope.waybill = (expressTemplate.category == 2);
        $scope.toolMessage = $scope.waybill ? '电子面单单号为系统自动获取不支持手工录入' : '';
    };
    //派送范围
    $scope.reachCover = function (Package) {
        //转换数据
        var array = [];
        array.push(angular.copy(Package));
        var normalPackage = clientToServer(array)[0].normalPackage;
        $restClient.post('seller/normalPackage/reachCover', {expressId: $scope.obj.userExpressTemp.expressId}, normalPackage, function (data) {
            console.log(data);
            var modalInstance = $modal.open({
                templateUrl: "views/pages/reachCover.html",
                controller: "reachCoverCtrl",
                resolve: {
                    data: function () {
                        return angular.copy(data.data);
                    },
                    normalPackage: function () {
                        return angular.copy(Package);
                    }
                }
            });
            modalInstance.result.then(function () {

                var reachCorrectModal = $modal.open({
                    templateUrl: "views/pages/addCorrectScope.html",
                    controller: "editCorrectScopeCtrl",
                    resolve: {
                        Package: function () {
                            return angular.copy(Package);
                        },
                        correctionRange: function () {
                            return angular.copy(data.data.correctionRange);
                        }
                    }
                });
                reachCorrectModal.result.then(function (params) {
                    // Package.normalPackage.isReach = isReach;
                    $restClient.post('seller/correctionRange/save', null, params, function (data) {
                        $win.alert({
                            type: "success",
                            content: '修改成功'
                        });
                        reachWithPackage(clientToServer(angular.copy($scope.packages)), $scope.obj.userExpressTemp);
                    });

                });
            });
        });
    };
    //联想快递单号/ onePackage:点击的包裹;isConsign:是否打印后发货联想
    $scope.associateExpressNo = function (onePackage, isConsign) {
        // onePackage.smart = true;
        var packages = getSelectedPackages();

        if (packages.length > 1) {                           //选择了多笔订单
            var index = -1;
            angular.forEach(packages, function (Package, i) {
                if (Package.normalPackage.id == onePackage.normalPackage.id) {
                    index = i;
                }
            });
            if (index == -1) {                                  //若点击的包裹非选中
                inputOneExpressNo();
                return false;
            } else if (index > 0) {                               //若点击的包裹非首个
                packages.splice(0, index);                      //截取点击位以下包裹

            }

            console.log(packages);
            packages.length > 1 ? inputBatchExpressNo(packages) : inputOneExpressNo();

        } else {
            inputOneExpressNo();
        }
        function inputOneExpressNo() {      //单个联想
            if (onePackage.normalPackage.expressNo) {
                $win.alert('已经输入了运单号码，不能联想输入');
                return false;
            } else {
                $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: $scope.obj.userExpressTemp.id}, function (data) {
                    console.log(data);
                    if (data.data) {
                        onePackage.normalPackage.expressNo = window.getNextSid2($scope.obj.userExpressTemp.expressId, data.data, 1);
                        //打印后的联想
                        isConsign && showExpressNo([onePackage], isConsign, onePackage.normalPackage.expressNo);
                    } else {
                        $win.alert('尚未保存过' + $scope.obj.userExpressTemp.name + '的运单号码，所以不能联想输入。您至少要手工录入' +
                            '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                    }
                });
            }
        }

        function showExpressNo(packages, isConsign, sidStart, lastSid) {
            var modalInstance = $modal.open({
                templateUrl: "views/pages/remindExpressNo.html",
                controller: "remindExpressNoCtrl",
                resolve: {
                    data: function () {
                        return angular.copy({
                            sidStart: sidStart,
                            lastSid: lastSid,
                            packages: packages,
                            userExpressName: $scope.obj.userExpressTemp.name,
                            isConsign: isConsign
                        });
                    }
                }
            });
            modalInstance.result.then(function () {
                //是否发货
                if (isConsign) {
                    $scope.consign(1);
                }
            });
        }

        function inputBatchExpressNo(packages) {        //多个联想
            var existExpressNo = false;                 //非首个是否存在运单号

            angular.forEach(packages, function (Package, i) {
                if (i > 0 && Package.normalPackage.expressNo) {
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
                if (packages[0].normalPackage.expressNo) {              //第一个包裹是否存在运单号
                    sidStart = packages[0].normalPackage.expressNo;
                    var firstPackage = packages[0];
                    packages.shift();
                    replaceExpressNo(sidStart);
                    //加回原来的元素
                    packages.unshift(firstPackage);
                    showExpressNo(packages, isConsign, sidStart, packages[packages.length - 1].normalPackage.expressNo);
                } else {
                    getSidStart();

                }


                function getSidStart() {                            //获取订单号
                    $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: $scope.obj.userExpressTemp.id}, function (data) {
                        console.log(data);
                        if (data.data) {
                            sidStart = data.data;
                            replaceExpressNo(sidStart);
                            showExpressNo(packages, isConsign, window.getNextSid2($scope.obj.userExpressTemp.expressId, sidStart, 1), packages[packages.length - 1].normalPackage.expressNo);
                        } else {
                            $win.alert('尚未保存过' + $scope.obj.userExpressTemp.name + '的运单号码，所以不能联想输入。您至少要手工录入' +
                                '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                        }
                    });
                }

                function replaceExpressNo(sidStart) {           //替换订单号
                    angular.forEach(packages, function (Package, i) {
                        var index = 1 + i;
                        Package.normalPackage.expressNo = window.getNextSid2($scope.obj.userExpressTemp.expressId, sidStart, 1);
                        sidStart = Package.normalPackage.expressNo;
                    });
                    //var modelInstance = openModal('remindExpressNo', packages);

                }
            }
        }
    };
    //选择order
    $scope.selectOrder = function (normalOrder, packages) {
        if (!normalOrder.disabled) {
            var choose = normalOrder.checked;
            normalOrder.checked = !choose;
            checkPackage(packages, true);
        }
    };
    //选择包裹
    $scope.selectPackage = function (packages) {
        if (!packages.disabled) {
            //选择的是否是异常订单，是的话进入异常订单弹框提醒
            if (packages.compel && !packages.checked) {
                var blackList = {
                    isRefund: $scope.searchParam.packageWarn.isTipRefund,
                    isAddressChange: $scope.searchParam.packageWarn.isTipAddressChange,
                    isNeedTip: $scope.searchParam.packageWarn.isTipStatusChange
                };

                var stack = [];

                function initStack() {
                    if ((packages.refundStatus == 1 || packages.refundStatus == 2) && blackList.isRefund) {
                        stack.push({
                            type: "isRefund",
                            content: '买家全部或部分申请了退款；'
                        })
                    }
                    if (packages.normalPackage.addressChangeTids && blackList.isAddressChange) {
                        stack.push({
                            type: "isAddressChange",
                            content: '打印快递单后订单状态发生变更；'
                        })
                    }
                    if ((packages.normalPackage.isNeedTipStatusChange == 1) && blackList.isNeedTip) {
                        stack.push({
                            type: "isNeedTip",
                            content: "打印快递单后收货人信息发生变更"
                        })

                    }
                }

                function showTip() {
                    if (stack.length > 0) {
                        var obj = stack.splice(0, 1);
                        var remind = $modal.open({
                            templateUrl: 'views/pages/remindException.html',
                            controller: "remindExceptionCtrl",
                            windowClass: "confirm",
                            size: 'lg',
                            resolve: {
                                data: function () {
                                    return obj;
                                }
                            }
                        });

                        remind.result.then(function (data) {

                            blackList[obj[0].type] = data;

                            if (stack.length == 0) {
                                // packages.checked = true;
                                checkPackage(packages, false);
                                $scope.packageNum = getSelectedPackages().length;

                                if (!blackList.isRefund || !blackList.isAddressChange || !blackList.isNeedTip) {
                                    var packageWarn = {
                                        isTipRefund: blackList.isRefund,
                                        isTipStatusChange: blackList.isNeedTip,
                                        isTipAddressChange: blackList.isAddressChange,
                                        id: $scope.searchParam.packageWarn.id
                                    };

                                    //回传是否提示弹框的值给后台
                                    $restClient.post('seller/normalPackage/closePackageWarn', null, packageWarn, function (data) {
                                        console.log(data);
                                        if (data.data) {
                                            $scope.searchParam.packageWarn.isTipRefund = blackList.isRefund;
                                            $scope.searchParam.packageWarn.isTipAddressChange = blackList.isAddressChange;
                                            $scope.searchParam.packageWarn.isTipStatusChange = blackList.isNeedTip;
                                        }
                                    });
                                }

                            } else {
                                showTip();
                            }

                        }, function () {
                            packages.checked = false;
                            checkPackage(packages, false);
                            $scope.packageNum = getSelectedPackages().length;

                        })
                    } else {
                        var choose = packages.checked;
                        packages.checked = !choose;
                        checkPackage(packages, false);
                        $scope.packageNum = getSelectedPackages().length;
                    }
                }

                initStack();

                showTip();

            } else {

                var choose = packages.checked;
                packages.checked = !choose;
                checkPackage(packages, false);
                $scope.packageNum = getSelectedPackages().length;
            }

        }

    };

    //选择正常订单/异常和退款中及退款完成关闭的除外
    $scope.selectNormal = function () {
        $scope.selectCancel();
        angular.forEach($scope.packages, function (packages) {

            if (packages.normal && (!packages.compel)) {
                packages.checked = true;
                angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }

                    })
                });
            }

        });
        $scope.packageNum = getSelectedPackages().length;
    };
    //选择全部订单/不包括退款完成关闭的
    $scope.selectAllPackage = function () {
        $scope.selectCancel();
        angular.forEach($scope.packages, function (packages) {

            if (!packages.disabled) {
                packages.checked = true;
                angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }
                    })
                })
            }

        });
        $scope.packageNum = getSelectedPackages().length;
    };
    //反选
    $scope.selectInvert = function () {
        //是否存在异常订单
        var existUnusual = false;
        angular.forEach($scope.packages, function (packages) {
            if (packages.normal && !packages.checked) {
                existUnusual = existUnusual || packages.compel;
            }
        });
        if (existUnusual) {
            var mes = {
                title: '所选订单存在异常，是否要继续选中？',
                content: '反向选择的订单部分存在异常(订单状态变更、退款中的订单、收货地址变更)，处理时需谨慎操作，防止错发漏发带来不必要损失。',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            var remind = $win.confirm(mes);
            remind.result.then(function () {
                angular.forEach($scope.packages, function (packages) {
                    if (packages.normal) {
                        packages.checked = !packages.checked;
                        angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                if (normalOrder.normal) {
                                    normalOrder.checked = !normalOrder.checked;
                                }
                            })
                        });
                        //order被选中则package也被选中
                        checkPackage(packages, true);
                    }

                });
                $scope.packageNum = getSelectedPackages().length;
            })
        } else {
            angular.forEach($scope.packages, function (packages) {
                if (packages.normal) {
                    packages.checked = !packages.checked;
                    angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                        angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                            if (normalOrder.normal) {
                                normalOrder.checked = !normalOrder.checked;
                            }
                        })
                    });
                    //order被选中则package也被选中
                    checkPackage(packages, true);
                }

            });
            $scope.packageNum = getSelectedPackages().length;
        }


    };
    //取消
    $scope.selectCancel = function () {

        angular.forEach($scope.packages, function (packages) {
            packages.checked = false;

            angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {

                    normalOrder.checked = false;

                })
            })
        });
        $scope.checkedAll = false;
        $scope.packageNum = getSelectedPackages().length;
    };

    //查询订单
    $scope.search = function () {
        getOrder();
        $local.setObject('PackageSearchModel', $scope.PackageSearchModel);
        //搜索栏展开状态
        $local.setObject('collapsed', angular.element('.search-bar').hasClass('collapsed'));
    };
    //自定义省份
    $scope.selectArea = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/components/queryArea.html',
            controller: 'queryAreaCtrl',
            resolve: {
                isSave: function () {
                    return true;
                },
                selectItems: function () {
                    return $scope.searchParam.customQueryAreaList;
                }

            },
            backdrop: true
        });

        modalInstance.result.then(function (result) {
            $scope.searchParam.customQueryAreaList.push(result);
        });
        $scope.customProvince = '';
    };
    //提示合并订单
    $scope.tipMergeForm = function (Package) {
        $restClient.postFormData('seller/normalPackage/tipMergeForm', {packageId: Package.id}, function (data) {
            console.log(data);
            angular.forEach(data.data, function (Package) {
                Package.checked = true;
            });
            mergeTrade(data.data);
        });

    };
    //强制合并订单
    $scope.mergeSave = function () {
        var Packages = getSelectedPackages();
        if (Packages.length < 2) {
            var mes = {
                title: '不符合合单规则，无法进行合并订单！',
                content: '合并订单至少选择两笔或两笔以上的订单方可合单',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            $win.confirm(mes);
            return false;
        }

        checkDeliverPackage(Packages) ? mergeTrade(Packages) : $win.alert('存在多笔已发货订单且地址不同，无法合单');

        function checkDeliverPackage(Packages) {        //检查是否有多笔已发货且不同地址
            var deliverPackages = [];
            var sameAddress = true;
            angular.forEach(Packages, function (Package) {
                if (Package.normalPackage.isPrintDeliveryBill) {
                    deliverPackages.push(Package);
                }
            });

            if (deliverPackages.length > 1) {  //多笔部分发货订单
                var keepGoing = true;
                keepGoing && angular.forEach(deliverPackages, function (Package, index) {
                    for (var i = index + 1; i < deliverPackages.length; i++) {
                        keepGoing = sameAddress = Package.normalPackage.receiverAddress == deliverPackages[i].normalPackage.receiverAddress;
                        if (!sameAddress) break;
                    }
                })
            }
            return sameAddress;
        }

    };
    //拆分订单
    $scope.splitSave = function (Package) {

        function chooseTrade(Package) {               //选择要拆分的订单
            var modelInstance = openModal('chooseTrade', Package, 'lg');
            modelInstance.result.then(function (data) {
                chooseStatus(data);
            });
        }


        function chooseStatus(trade) {               //选择订单状态
            var modelInstance = openModal('chooseStatus', trade, 'lg');
            console.log(trade);
            modelInstance.result.then(function (data) {

                if (data.back) {              //返回上一步
                    chooseTrade(Package);
                } else {
                    $restClient.post('seller/normalPackage/splitSave', null, data, function (data) {
                        console.log(data);
                        data.data && getOrder();
                    });
                }

            });
        }

        if (Package.normalPackage.normalTradeList.length > 1) {
            chooseTrade(Package);
        } else {
            var mes = {
                title: '不符合拆单规则，无法进行拆分订单！',
                content: '拆分订单至少需要有两笔或两笔以上的订单方可拆分',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            $win.confirm(mes);
        }
    };
    //修改打印状态
    $scope.updatePrintState = function (normalPackage) {
        var modelInstance = openModal('updatePrintState', normalPackage);
        modelInstance.result.then(function (params) {

            if (params.isPrintExpress != null || params.isPrintDeliveryBill != null) {
                (params.isPrintExpress == null) ? delete params.isPrintExpress : (params.isPrintExpress = parseInt(params.isPrintExpress));
                (params.isPrintDeliveryBill == null) ? delete params.isPrintDeliveryBill : (params.isPrintDeliveryBill = parseInt(params.isPrintDeliveryBill));

                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.post('seller/normalPackage/updatePrintState', null, params, function (data) {
                    console.log(data);
                    normalPackage.printDeliveryBillTime = data.data[0].printDeliveryBillTime;
                    normalPackage.printDeliveryBillNum = data.data[0].printDeliveryBillNum;
                    normalPackage.printExpressTime = data.data[0].printExpressTime;
                    normalPackage.printExpressNum = data.data[0].printExpressNum;
                    normalPackage.isPrintExpress = data.data[0].isPrintExpress;
                    normalPackage.isPrintDeliveryBill = data.data[0].isPrintDeliveryBill;
                    //修改order状态
                    angular.forEach(normalPackage.normalTradeList, function (normalTrade) {
                        angular.forEach(normalTrade.normalOrderList, function (normalOrder) {

                            angular.forEach(data.data[0].normalTradeList, function (returnNormalTrade) {
                                if (returnNormalTrade.id == normalTrade.id) {
                                    angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {
                                        if (returnNormalOrder.id == normalOrder.id) {
                                            normalOrder.isPrintExpress = returnNormalOrder.isPrintExpress;
                                            normalOrder.printExpressNum = returnNormalOrder.printExpressNum;
                                            normalOrder.printExpressTime = returnNormalOrder.printExpressTime;
                                            normalOrder.isPrintDelivery = returnNormalOrder.isPrintDelivery;
                                            normalOrder.printDeliveryNum = returnNormalOrder.printDeliveryNum;
                                            normalOrder.printDeliveryTime = returnNormalOrder.printDeliveryTime;
                                        }
                                    })
                                }

                            })

                        })
                    })

                });
            }
        });
    };
    //修改收货地址
    $scope.updateReceiverAddress = function (normalPackage) {
        var modelInstance = openModal('updateReceiverAddress', normalPackage, 'lg');
        modelInstance.result.then(function (params) {
            delete params.normalTradeList;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateReceiverAddress', null, params, function (data) {
                console.log(data);
                data.data && getOrder($scope.pageNo, $scope.pageSize);
            });
        });
    };
    //选中本条及以下
    $scope.selectAfter = function (index) {
        //if(packages.normal)
        //console.log(index);
        $scope.selectCancel();
        for (var i = index; i < $scope.packages.length; i++) {
            if ($scope.packages[i].normal) {
                $scope.packages[i].checked = true;
                angular.forEach($scope.packages[i].normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }
                    })
                })
            }
        }
        $scope.packageNum = getSelectedPackages().length;
    };
    //选择本单
    $scope.selectThis = function (Package) {
        Package.checked = true;
        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                normalOrder.checked = true;
            })
        })
    };
    //查看日志
    $scope.showLog = function (Package) {
        var modelInstance = openModal('showLog', Package, 'lg');

    };
    //重新同步
    $scope.syncAgain = function (normalPackage) {

        var params = $(normalPackage.normalTradeList).map(function () {
            return this.tid;
        }).get().join(",");
        $scope.messages = '订单同步中。。';
        $scope.loading = $restClient.postFormData('seller/normalPackage/syncAgain', {tids: params}, function (data) {
            console.log(data);
            $win.alert({
                type: 'success',
                content: '同步成功'
            });
            //data.data && getOrder();
        });
    };
    //修改分类名
    $scope.updateCustomStar = function (customStarList, customStarId) {
        $scope.customStarColor = "";
        if (customStarId == -1000) {
            var modelInstance = openModal('updateCustomStar', customStarList);
            modelInstance.result.then(function (params) {
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.put('seller/c/update', null, params, function (data) {
                    console.log(data);
                    data.data && getParam();
                });
            });
            $scope.customStarId = "";
        } else {
            angular.forEach(customStarList, function (customStar) {
                if (customStar.id == customStarId) {
                    $scope.customStarColor = customStar.color;
                }
            })
        }
    };
    //设置包裹分类
    $scope.setCustomStar = function (normalPackage, customStar) {
        var params = {
            packageIds: normalPackage.id
        };
        customStar && (params.customStarId = customStar.id);
        $scope.messages = '数据提交中。。';
        $scope.loading = $restClient.postFormData('seller/c/save', params, function (data) {
            console.log(data);
            //data.data && getOrder();
            if (customStar) {
                normalPackage.customStarId = customStar.id;
                normalPackage.customStarColor = customStar.color;
            } else {
                delete normalPackage.customStarId;
                delete normalPackage.customStarColor;
            }
        });
    };
    //保存运单号
    $scope.saveExpressNo = function () {
        var Packages = getSelectedPackages();
        Packages = filterUncheckedOrder(angular.copy(Packages));
        Packages = clientToServer(Packages);
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        var existExpressNo = true;  //都存在运单号
        angular.forEach(Packages, function (Package) {
            if (Package.normalPackage.expressNo) {
                Package.normalPackage.expressNo = Package.normalPackage.expressNo.toUpperCase();
            }
            existExpressNo = Package.normalPackage.expressNo && existExpressNo;

        });
        existExpressNo ? checkExpressNo(Packages).then(postData) : $win.alert('请输入运单号码');

        function checkExpressNo(selectPackages) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var validate = [];
            var invalidate = [];
            angular.forEach(selectPackages, function (Package) {
                var out_sid = Package.normalPackage.expressNo;
                var expressId = $scope.obj.userExpressTemp.expressId;
                if (is_valid_out_sid(expressId, out_sid)) {
                    validate.push(Package);
                } else {
                    invalidate.push(Package);
                }
            });
            if (invalidate.length > 0) {
                var mes = {
                    title: '所输运单号不满足此快递运单号规则，是否继续保存？',
                    content: '共勾选了' + '<span class="text-warning">【' + selectPackages.length + '】</span>' + '笔订单，其中有' + '<span class="text-warning">【' + invalidate.length + '】</span>' + '笔所输入的运单号不符合' + '<span class="text-warning">【' + $scope.obj.userExpressTemp.userExpressName + '】</span>' + '运单号规则',
                    img: "images/components/alert/alert-forbid.png",
                    closeText: '保存',
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var remind = $win.confirm(mes);
                remind.result.then(function () {
                    deferred.resolve(selectPackages);
                });
            } else {
                deferred.resolve(selectPackages);
            }

            return promise;
        }

        function postData(Packages) {
            var params = $(Packages).map(function () {
                return {
                    id: this.normalPackage.id,
                    normalTradeList: this.normalPackage.normalTradeList,
                    expressNo: this.normalPackage.expressNo,
                    userExpressId: $scope.obj.userExpressTemp.userExpressId,
                    userTemplateId: $scope.obj.userExpressTemp.id
                };
            }).get();
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/saveExpressNo', null, params, function (data) {
                console.log(data);
                if (data.data) {
                    angular.forEach(getSelectedPackages(), function (Package) {
                        Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                        Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                        Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                        Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                    });

                    $win.alert({
                        type: "success",
                        content: '保存运单号成功'
                    });
                }
            });
        }


    };
    //删除运单号码
    $scope.deleteExpressNo = function () {
        var Packages = getSelectedPackages();
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        var mes = {
            title: '您确定要删除（作废）所选的运单号吗？',
            content: '将对' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单的运单号进行删除，删除后无法恢复。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            postData();
        });
        function postData() {
            var params = $(Packages).map(function () {
                var obj = {
                    id: this.normalPackage.id,
                    userExpressId: this.normalPackage.userExpressId,
                    userTemplateId: this.normalPackage.userTemplateId
                };
                return obj;
            }).get();
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/deleteExpressNo', null, params, function (data) {
                console.log(data);
                angular.forEach(Packages, function (Package) {
                    Package.normalPackage.expressNo = null;
                });

                $win.alert({
                    type: "success",
                    content: '删除运单号成功'
                });
            });
        }

    };
    //批量修改物流公司与物流模板
    $scope.updateUserExpressTemplate = function () {
        var Packages = getSelectedPackages();

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        var params = $(clientToServer(filterUncheckedOrder(angular.copy(Packages)))).map(function () {
            var obj = {
                id: this.normalPackage.id,
                normalTradeList: this.normalPackage.normalTradeList,
                userExpressId: $scope.obj.userExpressTemp.userExpressId,
                userTemplateId: $scope.obj.userExpressTemp.id
            };
            return obj;
        }).get();
        $scope.messages = '数据提交中。。';
        $scope.loading = $restClient.post('seller/normalPackage/updateUserExpressTemplate', null, params, function (data) {
            console.log(data);

            if (data.data) {
                angular.forEach(Packages, function (Package) {
                    Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                    Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                    Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                    Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                });

                $win.alert({
                    type: "success",
                    content: '修改快递模板成功'
                });
            }
        });


    };
    //修改宝贝简称
    $scope.updateItemTitle = function (normalOrder) {
        var modelInstance = openModal('updateItemTitle', normalOrder);
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateItemTitle', null, params, function (data) {


                normalOrder.abbrevName = params.normalOrder.abbrevName;
                if (params.isAllUpdate) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }
            });
        });
    };
    //修改sku属性
    $scope.updateSku = function (normalOrder) {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/updateSku.html",
            controller: "updateSkuCtrl",
            resolve: {
                data: function () {
                    return {
                        normalOrder: angular.copy(normalOrder),
                        baseSetting: $scope.searchParam.baseSetting
                    };
                }
            }
        });


        modalInstance.result.then(function (data) {

            if (typeof data == 'object') {
                data.id = $scope.searchParam.baseSetting.id;
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.put('seller/baseSetting/update', null, data, function (data) {
                    console.log(data);
                    data.data && $win.alert({
                        type: "success",
                        content: '修改成功'
                    });
                    getOrder($scope.pageNo, $scope.pageSize);
                });

            } else {
                normalOrder.skuChangeName = data;
            }

        });

    };
    //修改商家编码
    $scope.updateItemCode = function (normalOrder) {
        var modelInstance = openModal('updateItemCode', normalOrder,'sm');
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateItemCode', null, params, function (data) {

                normalOrder.skuCode = params.skuCode;
                
            });
        });
    };
    //修改软件备注
    $scope.updateSysMemo = function (normalTrade, Package) {
        var Packages = getSelectedPackages();

        var modelInstance;
        if (normalTrade) {                //单个修改
            modelInstance = openModal('updateSysMemo', normalTrade);
            Packages = [Package];

        } else {                          //批量修改
            var trades = getSelectedTrades(filterUncheckedOrder(angular.copy(Packages)));
            if (trades.length == 0) {
                $win.alert('请至少选择一个订单');
                return false;
            } else {
                var tids = $(trades).map(function () {
                    return this.tid;
                }).get().join(',');

                modelInstance = openModal('updateSysMemo', tids);
            }

        }
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.postFormData('seller/normalPackage/updateSysMemo', params, function (data) {
                console.log(data);

                if (normalTrade) {
                    normalTrade.sysMemo = params.sysMemo;

                } else {
                    //回调修改值
                    angular.forEach($scope.packages, function (item) {
                        item.checked && angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                if (normalOrder.checked) {
                                    normalTrade.sysMemo = params.sysMemo;
                                }
                            })
                        })
                    });
                }
                //重新拼接包裹的留言
                angular.forEach(Packages, function (Package) {

                    Package.sysMemos = [];
                    angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                        if (normalTrade.sysMemo) {
                            Package.sysMemos.push(normalTrade.sysMemo);
                        }
                    });
                    Package.sysMemos = Package.sysMemos.join('|');

                })
            });
        });

    };
    //修改卖家备注
    $scope.updateSellerMemo = function (normalTrade, Package) {

        var modelInstance = openModal('updateSellerMemo', normalTrade);
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateSellerMemo', null, params, function (data) {
                console.log(data);
                if (data.data) {
                    normalTrade.sellerFlag = params.sellerFlag;
                    normalTrade.sellerMemo = params.sellerMemo;
                    //重新拼接包裹的留言
                    angular.forEach(Package.packageMemoDtoList, function (packageMemo, i) {

                        if (Package.normalPackage.normalTradeList[i].sellerFlag) {
                            packageMemo.sellerFlag = Package.normalPackage.normalTradeList[i].sellerFlag;
                        }
                        if (Package.normalPackage.normalTradeList[i].sellerMemo) {
                            packageMemo.sellerMemo = Package.normalPackage.normalTradeList[i].sellerMemo;
                        }

                    })
                }
            });
        });
    };
    //批量修改卖家备注
    $scope.batchUpdateSellerMemo = function () {
        var Packages = getSelectedPackages();

        var trades = getSelectedTrades(filterUncheckedOrder(angular.copy(Packages)));
        if (trades.length == 0) {
            $win.alert('请至少选择一个订单');
            return false;
        } else {
            var tids = $(trades).map(function () {
                return this.tid;
            }).get().join(',');

            var modelInstance = openModal('updateSellerMemo', tids);
            modelInstance.result.then(function (params) {
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.post('seller/normalPackage/batchUpdateSellerMemo', null, params, function (data) {
                    console.log(data);
                    if (data.data.errorList && data.data.errorList.length > 0) {
                        var modelInstance = openModal('errorList', data.data.detailNormalTradeList);

                    }
                    if (data.data.successList && data.data.successList.length > 0) {
                        //回调修改值
                        angular.forEach($scope.packages, function (item) {
                            item.checked && angular.forEach(item.normalPackage.normalTradeList, function (trade) {
                                angular.forEach(trade.normalOrderList, function (normalOrder) {
                                    if (normalOrder.checked) {
                                        if (data.data.successList.indexOf(trade.tid) > -1) {
                                            if (params.sellerFlag) {
                                                trade.sellerFlag = params.sellerFlag;
                                            }
                                            if (params.updateType == 1) {
                                                trade.sellerMemo = params.sellerMemo;
                                            } else if (params.updateType == 2) {
                                                trade.sellerMemo = params.sellerMemo.concat(trade.sellerMemo);
                                            } else if (params.updateType == 3) {
                                                trade.sellerMemo = trade.sellerMemo.concat(params.sellerMemo);
                                            }
                                        }
                                    }
                                })
                            })
                        });

                        //重新拼接包裹的留言
                        angular.forEach(Packages, function (Package) {
                            //重新拼接包裹的留言
                            angular.forEach(Package.packageMemoDtoList, function (packageMemo, i) {

                                if (Package.normalPackage.normalTradeList[i].sellerFlag) {
                                    packageMemo.sellerFlag = Package.normalPackage.normalTradeList[i].sellerFlag;
                                }
                                if (Package.normalPackage.normalTradeList[i].sellerMemo) {
                                    packageMemo.sellerMemo = Package.normalPackage.normalTradeList[i].sellerMemo;
                                }

                            });

                        })
                    }
                });
            });
        }
    };
    //获取电子面单号
    $scope.applyWaybill = function (Package) {

        var onePackage = Package ? true : false;

        var recycleWaybillPackage = [];     //待回收电子面单号包裹
        var allExistNum = true;  //都存在电子运单号
        var existPrinted = false; //存在已打印订单
        var deferred = $q.defer(),
            promise = deferred.promise;

        //提示信息
        var mes = {
            title: '你确定要获取新的电子面单号吗？',
            content: '获取新的<span class="text-warning">【' + $scope.obj.userExpressTemp.name + '】</span>的电子面单号后，现有的单号如果没有打印发货可能会被浪费掉，您确定要获取新的电子面单号吗？',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        //参数
        var applyWaybillParamModel = {
            userExpressTemplateId: $scope.obj.userExpressTemp.id,
            packageType: 1
        };
        //回调函数
        var actions = {
            successCallback: function (data) {
                console.log(data);
                //获取后回调
                angular.forEach(data.data.successWaybillList, function (successWaybill) {
                    if (onePackage) {
                        if (Package.normalPackage.id == successWaybill.packageId) {
                            Package.normalPackage.waybillId = successWaybill.id;
                            Package.normalPackage.expressNo = successWaybill.expressNo;

                            Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                            Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                            Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                            Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                        }
                    } else {
                        angular.forEach(getSelectedPackages(), function (Package) {
                            if (Package.normalPackage.id == successWaybill.packageId) {
                                Package.normalPackage.waybillId = successWaybill.id;
                                Package.normalPackage.expressNo = successWaybill.expressNo;

                                Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                                Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                            }
                        });
                    }
                });

                if (data.data.errorWaybillList.length == 0) {
                    if (onePackage) {
                        $win.alert({
                            type: 'success',
                            content: '新面单号获取成功'
                        })
                    } else {
                        deferred.resolve();
                    }

                } else {
                    //显示电子面单号获取结果提示失败原因
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
                    if (!onePackage) {
                        deferred.reject();
                    }
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

        //获取多个包裹时
        if (!onePackage) {
            var Packages = angular.copy(getSelectedPackages());

            if (Packages.length == 0) {
                $win.alert('请至少选择一笔订单');
                deferred.reject();
                return promise;
            }
            //验证所选模板是否开通电子面单
            if (!$scope.obj.userExpressTemp.branchCode) {
                $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
                deferred.reject();
                return promise;
            }


            //是否都存在已选模板的电子面单号
            angular.forEach(Packages, function (Package) {
                //是否存在已打印的已选模板的电子面单号
                existPrinted = existPrinted || (Package.normalPackage.isPrintExpress && Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id));
                allExistNum = Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id) && allExistNum;

                //要回收电子面单的包裹
                if (Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId != $scope.obj.userExpressTemp.id)) {
                    recycleWaybillPackage.push(clientToServer([angular.copy(Package)])[0].normalPackage);
                }

            });

            if (existPrinted) {
                //提示已打印的是否要获取新的单号弹窗
                var remindFilterModal = $modal.open({
                    templateUrl: "views/pages/remindFilter.html",
                    controller: "remindFilterCtrl",
                    windowClass: "confirm",
                    size: 'lg'
                });
                remindFilterModal.result.then(function (filter) {
                    //剔除已存在已选模板的单号的包裹
                    if (!filter) {
                        Packages = Packages.filter(function (Package) {
                            if (!(Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id))) {
                                return Package;
                            }
                        });
                    }
                    //若都存在则不去获取且不需获取
                    if (allExistNum && !filter) {
                        deferred.resolve();
                        return promise;
                    }
                    //若有需要回收的单号
                    if (recycleWaybillPackage.length > 0) {
                        //提示是否回收弹窗
                        var remindRecycleModal = $modal.open({
                            templateUrl: "views/pages/recycleRemind.html",
                            controller: "recycleRemindCtrl",
                            windowClass: "confirm",
                            size: 'lg',
                            resolve: {
                                data: function () {
                                    return recycleWaybillPackage;
                                }
                            }
                        });
                        //回收单号
                        remindRecycleModal.result.then(function (recycle) {

                            if (recycle) {
                                var recycleWaybillParams = {
                                    normalPackageList: recycleWaybillPackage,
                                    packageType: 1
                                };
                                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                    console.log(data);
                                    //全部回收成功
                                    if (data.data.errorRecycleList.length == 0) {
                                        //修改成功的
                                        angular.forEach(getSelectedPackages(), function (Package) {
                                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                if (successPackage.packageId == Package.normalPackage.id) {
                                                    Package.normalPackage.expressNo = null;
                                                }
                                            });
                                        });

                                        //拼接参数
                                        Packages = filterUncheckedOrder(angular.copy(Packages));
                                        Packages = clientToServer(Packages);
                                        applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                            return this.normalPackage;
                                        }).get();
                                        //获取单号
                                        $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                                    } else {

                                        //显示打印结果提示失败原因
                                        $modal.open({
                                            templateUrl: 'views/pages/recycleResult.html',
                                            controller: "recycleResultCtrl",
                                            resolve: {
                                                data: function () {
                                                    return data.data;
                                                }
                                            }
                                        });
                                        //修改成功的

                                        angular.forEach(getSelectedPackages(), function (Package) {
                                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                if (successPackage.packageId == Package.normalPackage.id) {
                                                    Package.normalPackage.expressNo = null;
                                                }
                                            });
                                        });


                                    }

                                });
                            } else {
                                //拼接参数
                                Packages = filterUncheckedOrder(angular.copy(Packages));
                                Packages = clientToServer(Packages);
                                applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                    return this.normalPackage;
                                }).get();
                                $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                            }

                        })
                    } else {

                        //拼接参数
                        Packages = filterUncheckedOrder(angular.copy(Packages));
                        Packages = clientToServer(Packages);
                        applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                            return this.normalPackage;
                        }).get();
                        $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                    }
                });
            } else {
                //若都存在则不去获取
                if (allExistNum) {
                    deferred.resolve();
                    return promise;
                }
                //若有需要回收的单号
                if (recycleWaybillPackage.length > 0) {
                    //提示是否回收弹窗
                    var remindRecycleModal = $modal.open({
                        templateUrl: "views/pages/recycleRemind.html",
                        controller: "recycleRemindCtrl",
                        windowClass: "confirm",
                        size: 'lg',
                        resolve: {
                            data: function () {
                                return recycleWaybillPackage;
                            }
                        }
                    });
                    //回收单号
                    remindRecycleModal.result.then(function (recycle) {

                        if (recycle) {
                            var recycleWaybillParams = {
                                normalPackageList: recycleWaybillPackage,
                                packageType: 1
                            };
                            $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                console.log(data);
                                //全部回收成功
                                if (data.data.errorRecycleList.length == 0) {
                                    //修改成功的
                                    angular.forEach(getSelectedPackages(), function (Package) {
                                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                                            if (successPackage.packageId == Package.normalPackage.id) {
                                                Package.normalPackage.expressNo = null;
                                            }
                                        });
                                    });

                                    //拼接参数
                                    Packages = filterUncheckedOrder(angular.copy(Packages));
                                    Packages = clientToServer(Packages);
                                    applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                        return this.normalPackage;
                                    }).get();
                                    //获取单号
                                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                                } else {

                                    //显示打印结果提示失败原因
                                    $modal.open({
                                        templateUrl: 'views/pages/recycleResult.html',
                                        controller: "recycleResultCtrl",
                                        resolve: {
                                            data: function () {
                                                return data.data;
                                            }
                                        }
                                    });
                                    //修改成功的

                                    angular.forEach(getSelectedPackages(), function (Package) {
                                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                                            if (successPackage.packageId == Package.normalPackage.id) {
                                                Package.normalPackage.expressNo = null;
                                            }
                                        });
                                    });


                                }

                            });
                        } else {
                            //拼接参数
                            Packages = filterUncheckedOrder(angular.copy(Packages));
                            Packages = clientToServer(Packages);
                            applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                return this.normalPackage;
                            }).get();
                            $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                        }

                    })
                } else {

                    //拼接参数
                    Packages = filterUncheckedOrder(angular.copy(Packages));
                    Packages = clientToServer(Packages);
                    applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                        return this.normalPackage;
                    }).get();
                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                }
            }

        } else {

            var filterPackage = clientToServer(angular.copy([Package]));          //filter包裹里未选中的订单
            applyWaybillParamModel.normalPackageList = [filterPackage[0].normalPackage];

            if (Package.normalPackage.waybillId) {
                //单个获取存在单号时提示覆盖
                var remind = $win.confirm(mes);
                remind.result.then(function () {
                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                })
            } else {
                $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
            }
        }
        return promise;

    };
    //回收电子面单号
    $scope.recycleWaybill = function (Package) {

        //是否批量回收
        var isBatch = Package ? false : true;
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
                    if (isBatch) {
                        angular.forEach(packages, function (Package) {
                            Package.normalPackage.expressNo = null;
                        });

                    } else {
                        Package.normalPackage.expressNo = null;
                    }
                    $win.alert({
                        content: '回收成功',
                        type: 'success'
                    })
                } else {
                    //显示结果
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
                    if (isBatch) {
                        angular.forEach(packages, function (Package) {
                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                if (successPackage.packageId == Package.normalPackage.id) {
                                    Package.normalPackage.expressNo = null;
                                }
                            });
                        });

                    }
                }

            }
        };

        if (isBatch) {
            var packages = angular.copy(getSelectedPackages());

            if (packages.length == 0) {
                $win.alert('请至少选择一笔订单');
                return false;
            }

            var allExistNum = true;
            //是否都存在已选模板的电子面单号
            angular.forEach(clientToServer(packages), function (Package) {
                allExistNum = Package.normalPackage.waybillId && allExistNum;
            });
            if (!allExistNum) {
                $win.alert('所选订单有不存在运单号,无法全部回收');
                return false;
            }
            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var recycleWaybillParams = {
                    packageType: 1
                };
                recycleWaybillParams.normalPackageList = $(packages).map(function () {
                    return this.normalPackage;
                }).get();

                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
            })


        } else {
            //不存在运单号
            if (!(Package.normalPackage.waybillId && Package.normalPackage.expressNo)) {
                $win.alert('不存在运单号,无法回收');
                return false;
            }

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var filterPackage = clientToServer(angular.copy([Package]));

                var recycleWaybillParams = {
                    normalPackageList: [filterPackage[0].normalPackage],
                    packageType: 1
                };

                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
            })
        }
    };
    //使用之前的电子面单号
    $scope.fetchWaybill = function (Package) {

        var getWaybills = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                packageId: Package.normalPackage.id,
                packageType: 1
            };

            $restClient.post('seller/waybill/fetch', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };
        getWaybills().then(function (data) {
            var chooseWaybill = $modal.open({
                templateUrl: 'views/pages/chooseWaybill.html',
                controller: "chooseWaybillCtrl",
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            chooseWaybill.result.then(function (selectWaybill) {
                var postPackage = clientToServer([angular.copy(Package)]);
                var params = {
                    id: postPackage[0].normalPackage.id,
                    waybillId: selectWaybill.id,
                    normalTradeList: postPackage[0].normalPackage.normalTradeList,
                    expressNo: selectWaybill.expressNo,
                    userExpressId: selectWaybill.userExpressId,
                    userTemplateId: selectWaybill.userExpressTemplateId
                };


                $restClient.post('seller/normalPackage/chooseWaybill', null, params, function (data) {
                    console.log(data);
                    Package.normalPackage.expressNo = data.data.expressNo;
                    Package.normalPackage.userExpressId = data.data.userExpressId;
                    Package.normalPackage.userTemplateId = data.data.userTemplateId;
                    Package.normalPackage.userTemplateName = data.data.userTemplateName;
                    Package.normalPackage.expressId = data.data.expressId;
                    Package.normalPackage.waybillId = data.data.waybillId;
                });
            })
        })

    };
    //打印多个电子面单
    $scope.printMultiWaybill = function (Package) {
        //获取以前的单号
        var getWaybills = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                packageId: Package.normalPackage.id,
                packageType: 1
            };

            $restClient.post('seller/waybill/fetch', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };

        var inputTime = $modal.open({
            templateUrl: "views/pages/printMultiWaybill.html",
            controller: "printMultiWaybillCtrl"
        });
        inputTime.result.then(function (data) {
            //请求之前使用过的电子面单号
            var preview = data.preview;
            var times = data.time;
            getWaybills().then(function (waybills) {
                console.log(waybills);
                var packageList = [];
                //过滤掉曾用过不是当前模板的电子面单号
                var filterWaybills = waybills.filter(function (waybill) {
                    if (waybill.userExpressTemplateId == $scope.obj.userExpressTemp.id) {
                        return waybill;
                    }
                });

                //面单号足够
                if (filterWaybills.length >= times) {

                    for (var i = 0; i < data.time; i++) {
                        //曾使用过的与当前所选的模板相同的电子面单号
                        var packageCopy = angular.copy(Package);
                        packageCopy.normalPackage.expressNo = filterWaybills[i].expressNo;
                        packageCopy.normalPackage.waybillId = filterWaybills[i].id;
                        packageCopy.normalPackage.userExpressId = filterWaybills[i].userExpressId;
                        packageCopy.normalPackage.userTemplateId = filterWaybills[i].userExpressTemplateId;
                        packageCopy.normalPackage.userTemplateName = filterWaybills[i].userExpressTemplateName;
                        packageList.push(packageCopy);
                    }

                    $scope.print(preview, 1, packageList);
                } else {
                    for (var i = 0; i < filterWaybills.length; i++) {
                        //曾使用过的与当前所选的模板相同的电子面单号
                        var Copy = angular.copy(Package);
                        Copy.normalPackage.expressNo = filterWaybills[i].expressNo;
                        Copy.normalPackage.waybillId = filterWaybills[i].id;
                        Copy.normalPackage.userExpressId = filterWaybills[i].userExpressId;
                        Copy.normalPackage.userTemplateId = filterWaybills[i].userExpressTemplateId;
                        Copy.normalPackage.userTemplateName = filterWaybills[i].userExpressTemplateName;
                        packageList.push(Copy);
                    }


                    //不够的电子面单号数量
                    var num = times - filterWaybills.length;

                    var normalPackageCopy = clientToServer([angular.copy(Package)])[0].normalPackage;

                    var applyWaybillParamModel = {
                        userExpressTemplateId: $scope.obj.userExpressTemp.id,
                        normalPackageList: [],
                        packageType: 1
                    };
                    //拼接参数获取电子面单
                    while (num > 0) {
                        applyWaybillParamModel.normalPackageList.push(normalPackageCopy);
                        num = num - 1;
                    }

                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, function (data) {
                        angular.forEach(data.data.successWaybillList, function (successWaybill) {
                            var packageCopy = angular.copy(Package);

                            packageCopy.normalPackage.waybillId = successWaybill.id;
                            packageCopy.normalPackage.expressNo = successWaybill.expressNo;

                            packageCopy.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                            packageCopy.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                            packageCopy.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                            packageCopy.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                            packageList.push(packageCopy);

                        });
                        $scope.print(preview, 1, packageList);
                    });
                }

            });
        })
    };
    //使用之前的普通面单
    $scope.findUsedExpressNo = function (Package) {
        var getUsedExpressNo = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                tids: Package.normalPackage.mergedTids
            };

            $restClient.post('seller/normalPackage/findUsedExpressNo', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };
        getUsedExpressNo().then(function (data) {
            var chooseExpressNo = $modal.open({
                templateUrl: 'views/pages/chooseUsedExpressNo.html',
                controller: "chooseWaybillCtrl",
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            chooseExpressNo.result.then(function (selectExpressNo) {
                var postPackage = clientToServer([angular.copy(Package)]);
                var params = {
                    templateLogId: selectExpressNo.id
                };

                $restClient.post('seller/normalPackage/chooseExpressNo', params, postPackage[0].normalPackage, function (data) {
                    console.log(data);
                    Package.normalPackage.expressNo = data.data.expressNo;
                    Package.normalPackage.userExpressId = data.data.userExpressId;
                    Package.normalPackage.userTemplateId = data.data.userTemplateId;
                    Package.normalPackage.userTemplateName = data.data.userTemplateName;
                    Package.normalPackage.expressId = data.data.expressId;
                });
            })
        });
    };
    //打印 printType:1快递单;printType:2发货单
    $scope.print = function (preview, printType, packageList) {

        var Packages = getSelectedPackages();                             //获得选中的包裹

        //内部手动调用打印方法-》一次打印多个电子面单时 printMultiWaybill
        if (packageList) {
            Packages = packageList;
            var multiWaybill = true;
        }


        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        Packages = filterUncheckedOrder(angular.copy(Packages));          //filter包裹里未选中的订单

        var NormalPackages = $(clientToServer(angular.copy(Packages))).map(function () {    //打印时要使用的数据
            return this.normalPackage;
        }).get();

        var printedPackages = $(Packages).map(function () {                //获得已打印包裹
            if (printType == 1) {                       //已打印过快递单
                if (this.normalPackage.isPrintExpress) {
                    return this;
                }
            }
            if (printType == 2) {                       //已打印过发货单
                if (this.normalPackage.isPrintDeliveryBill) {
                    return this;
                }
            }
        }).get();
        //按钮置为不可点击
        if (printType == 1) {
            $scope.expressProcessing = true;
        }
        if (printType == 2) {
            $scope.deliveryProcessing = true;
        }
        if ($scope.obj.baseSetting.isCheckMorePrint && printedPackages.length > 0 && !multiWaybill) {            //已开启多次打印验证且存在已打印订单
            var typeText = (printType == 1 ? '快递单' : '发货单');
            var buttonText = (preview ? '预览' : '打印') + typeText;
            var modal = $win.confirm({                      //提醒文案
                content: '共勾选了' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单,其中有'
                + '<span class="text-warning">【' + printedPackages.length + '】</span>' + '笔已打印过' + typeText,
                title: '含有已被打印过' + typeText + '的订单，是否要重新打印？',
                closeText: buttonText,
                size: "lg",
                img: "images/components/alert/alert-forbid.png"
            });
            modal.result.then(function () {
                //验证码确认
                return authCode();
            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            }).then(function (data) {

                if (data) {
                    doPrint();
                }


            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            })

        } else {

            doPrint();

        }

        function doPrint() {
            //电子面单打印
            if ($scope.waybill && printType == 1) {
                //一次打印多个电子面单
                if (multiWaybill) {
                    //包裹已经在printMultiWaybill里获取好了单号不用再获取
                    getSerial(NormalPackages).then(function (params) {
                        //获取打印数据

                        var waybillIds = [];
                        angular.forEach(NormalPackages, function (NormalPackage) {
                            waybillIds.push(NormalPackage.waybillId)
                        });
                        $restClient.post("seller/waybill/listPrintData", null, {
                            waybillIds: waybillIds,
                            userTemplateId: $scope.obj.userExpressTemp.id
                        }, function (data) {
                            console.log(data.data);
                            //打印
                            $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 1, $scope)

                        });

                    })

                } else {
                    //检查并获取电子面单号
                    $scope.applyWaybill().then(function () {

                        //重新获取有电子单号的包裹
                        NormalPackages = $(clientToServer(filterUncheckedOrder(angular.copy(getSelectedPackages())))).map(function () {    //打印时要使用的数据
                            return this.normalPackage;
                        }).get();
                        //获取流水号
                        getSerial(NormalPackages).then(function (params) {
                            //获取打印数据

                            var waybillIds = [];
                            angular.forEach(NormalPackages, function (NormalPackage) {
                                waybillIds.push(NormalPackage.waybillId)
                            });
                            $restClient.post("seller/waybill/listPrintData", null, {
                                waybillIds: waybillIds,
                                userTemplateId: $scope.obj.userExpressTemp.id
                            }, function (data) {
                                console.log(data.data);
                                //打印
                                $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 1, $scope)

                            });

                        })
                    })
                }


            } else {

                getSerial(NormalPackages).then(function (params) {
                    //打印完后回调 printType 1、快递单 2、发货单
                    //1、普通打印2、自由打印

                    if (printType == 1) {      //打印快递单

                        //判断是否有电子面单号提示是否要回收
                        var recycleWaybillPackage = [];
                        angular.forEach(NormalPackages, function (normalPackage) {
                            if (normalPackage.waybillId) {
                                recycleWaybillPackage.push(normalPackage);
                            }
                        });

                        if (recycleWaybillPackage.length > 0) {
                            //提示是否回收弹窗
                            var remindRecycleModal = $modal.open({
                                templateUrl: "views/pages/recycleRemind.html",
                                controller: "recycleRemindCtrl",
                                windowClass: "confirm",
                                size: 'lg',
                                resolve: {
                                    data: function () {
                                        return recycleWaybillPackage;
                                    }
                                }
                            });
                            //回收单号
                            remindRecycleModal.result.then(function (recycle) {

                                if (recycle) {
                                    var recycleWaybillParams = {
                                        normalPackageList: recycleWaybillPackage,
                                        packageType: 1
                                    };
                                    $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                        console.log(data);
                                        //全部回收成功
                                        if (data.data.errorRecycleList.length == 0) {
                                            //修改成功的
                                            angular.forEach(getSelectedPackages(), function (Package) {
                                                angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                    if (successPackage.packageId == Package.normalPackage.id) {
                                                        Package.normalPackage.expressNo = null;
                                                    }
                                                });
                                            });
                                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                                        } else {

                                            //显示打印结果提示失败原因
                                            $modal.open({
                                                templateUrl: 'views/pages/recycleResult.html',
                                                controller: "recycleResultCtrl",
                                                resolve: {
                                                    data: function () {
                                                        return data.data;
                                                    }
                                                }
                                            });
                                            //修改成功的

                                            angular.forEach(getSelectedPackages(), function (Package) {
                                                angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                    if (successPackage.packageId == Package.normalPackage.id) {
                                                        Package.normalPackage.expressNo = null;
                                                    }
                                                });
                                            });


                                        }
                                    })
                                } else {
                                    $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                                }
                            })
                        } else {
                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                        }
                    }
                    if (printType == 2) {     //打印发货单
                        var domElement = $('.deliveryTemplate');
                        $dpPrint.printDelivery(preview, $scope.obj, printCallback, params, NormalPackages, domElement);
                    }
                })
            }
        }

        //获取流水号
        function getSerial(NormalPackages) {
            var deferred = $q.defer(),
                promise = deferred.promise;
            $scope.loading = $restClient.post("seller/normalPackage/getSerial", null, NormalPackages, function (data) {
                console.log(data.data);
                NormalPackages = data.data;
                var params = {
                    userExpressTemplateId: $scope.obj.userExpressTemp.id,
                    normalPackageList: NormalPackages,
                    printType: printType
                };
                deferred.resolve(params);
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            });
            return promise;
        }

        //回调
        function printCallback(params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/print', null, params, function (data) {
                console.log(data);
                var selectPackages = getSelectedPackages();
                if (data.data) {
                    //打印快递单
                    if (params.printType == 1) {


                        //显示普通面单打印结果
                        var modalInstance = openModal('printResult', {
                            data: data.data,
                            operateType: $scope.operateType
                        });
                        modalInstance.result.then(function (data) {
                            if (data) {
                                $scope.consign(1);
                            } else {

                                $scope.associateExpressNo(Packages[0], true); //联想单号
                            }
                        });


                        //回调修改包裹状态
                        angular.forEach(data.data.detailNormalPackageList, function (info) {
                            //打印成功的包裹
                            if (info.isSuccess) {
                                angular.forEach(selectPackages, function (Package) {
                                    if (Package.normalPackage.id == info.id) {
                                        Package.normalPackage.isNeedTipStatusChange = info.isNeedTipStatusChange;
                                        Package.normalPackage.isPrintExpress = info.isPrintExpress;
                                        Package.normalPackage.printExpressTime = info.printExpressTime;
                                        Package.normalPackage.printExpressNum = info.printExpressNum;
                                        Package.normalPackage.serial = info.serial;

                                        Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                        Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                        Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;

                                    }
                                });
                            }
                            //order回调
                            angular.forEach(info.normalTradeList, function (returnNormalTrade) {
                                angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {


                                    angular.forEach(selectPackages, function (Package) {
                                        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                                if (normalOrder.oid == returnNormalOrder.oid) {

                                                    normalOrder.isPrintExpress = returnNormalOrder.isPrintExpress;
                                                    normalOrder.printExpressTime = returnNormalOrder.printExpressTime;
                                                    normalOrder.printExpressNum = returnNormalOrder.printExpressNum;

                                                }
                                            })


                                        })


                                    });

                                })
                            })

                        });

                    } else {
                        //回调修改包裹状态
                        angular.forEach(data.data.detailNormalPackageList, function (info) {
                            //打印发货单成功的包裹
                            if (info.isSuccess) {
                                angular.forEach(selectPackages, function (Package) {
                                    if (Package.normalPackage.id == info.id) {
                                        Package.normalPackage.isNeedTipStatusChange = info.isNeedTipStatusChange;
                                        Package.normalPackage.isPrintDeliveryBill = info.isPrintDeliveryBill;
                                        Package.normalPackage.printDeliveryBillTime = info.printDeliveryBillTime;
                                        Package.normalPackage.printDeliveryBillNum = info.printDeliveryBillNum;
                                        Package.normalPackage.serial = info.serial;
                                    }
                                });
                            }
                            //order回调
                            angular.forEach(info.normalTradeList, function (returnNormalTrade) {
                                angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {

                                    angular.forEach(selectPackages, function (Package) {
                                        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                                if (normalOrder.oid == returnNormalOrder.oid) {

                                                    normalOrder.isPrintDelivery = returnNormalOrder.isPrintDelivery;
                                                    normalOrder.printDeliveryTime = returnNormalOrder.printDeliveryTime;
                                                    normalOrder.printDeliveryNum = returnNormalOrder.printDeliveryNum;

                                                }
                                            })


                                        })


                                    });

                                })
                            })

                        });

                    }
                }
                $win.alert({
                    type: 'success',
                    content: '打印完成'
                })
            });

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
            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            });
            return deferred.promise;
        }

    };
    //发货
    $scope.consign = function (consignType) {

        var Packages = getSelectedPackages();
        var filterPackages = filterUncheckedOrder(angular.copy(Packages));          //filter包裹里未选中的订单

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        if (consignType == 3) {         //虚拟发货
            var mes = {
                title: '确定用虚拟物流方式发货吗？',
                content: '您选择了' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，使用虚拟物流方式发货后，将不可对发货方式进行修改噢',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var isCod = false;   //是否存在货到付款订单
                angular.forEach(filterPackages, function (Package) {
                    isCod = isCod || Package.normalPackage.isCod;
                });

                (!isCod) ? postData(filterPackages) : $win.alert('存在货到付款订单，无法虚拟发货!');
            })
        } else {
            if (!confirm('您确定要发货吗？')) {
                return false;
            } else {
                checkExpressNo(filterPackages).then(postData);
            }
        }


        function checkExpressNo(consignPackages) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var validate = [];
            var invalidate = [];
            angular.forEach(consignPackages, function (Package) {
                var out_sid = Package.normalPackage.expressNo;
                var expressId = $scope.obj.userExpressTemp.expressId;
                if (is_valid_out_sid(expressId, out_sid)) {
                    Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                    Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                    Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                    Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                    validate.push(Package);
                } else {
                    invalidate.push(Package);
                }
            });
            if (invalidate.length > 0) {
                var mes = {
                    title: '所输运单号不满足此快递运单号规则，是否继续保存？',
                    content: '共勾选了' + '<span class="text-warning">【' + consignPackages.length + '】</span>' + '笔订单，其中有' + '<span class="text-warning">【' + invalidate.length + '】</span>' + '笔运单号不符合【' + '<span class="text-warning">' + $scope.obj.userExpressTemp.userExpressName + '</span>' + '】运单号规则',
                    img: "images/components/alert/alert-forbid.png",
                    closeText: "去修正",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                $win.confirm(mes);
            } else {
                deferred.resolve(consignPackages);
            }

            return promise;
        }

        function postData(consignPackages) {
            var normalPackageList = [];
            angular.forEach(clientToServer(consignPackages), function (Package) {
                normalPackageList.push(Package.normalPackage);
            });
            $scope.messages = '发货中。。';
            $scope.loading = $restClient.post('seller/normalPackage/consign', null, {
                consignType: consignType,
                normalPackageList: normalPackageList
            }, function (data) {
                console.log(data);

                if (data.data.errorList.length > 0) {
                    var modalInstance = $modal.open({
                        templateUrl: "views/pages/remindConsign.html",
                        controller: "remindConsignCtrl",
                        resolve: {
                            data: function () {
                                return angular.copy(data.data);
                            },
                            againConsign: function () {
                                return false;
                            }
                        }
                    });
                    modalInstance.result.then(function () {
                        var errorPackages = [];
                        angular.forEach(data.data.errorList, function (tid) {
                            var allPackages = angular.copy($scope.packages);
                            angular.forEach(allPackages, function (item) {
                                (item.normalPackage.tid == tid) && errorPackages.push(item);
                            });
                        });
                        //重新发货
                        checkExpressNo(errorPackages).then(postData);
                    });
                } else {
                    var mes = {
                        title: '恭喜您，发货成功！',
                        content: '您已成功发货' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，建议开启发货通知可以提升客户体验！',
                        img: "images/components/alert/alert-forbid.png",
                        size: "lg",
                        redirect: "//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliverGoodsInform",
                        showClose: true,
                        closeText: "发货通知",
                        cancelText: "关闭",
                        showCancel: true
                    };

                    var remind = $win.confirm(mes);

                }
                if (data.data.successList.length > 0) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }


            });
        }


    };
    //手工同步数据
    $scope.syncData = function () {
        $scope.messages = '订单同步中。。';
        $scope.loading = $restClient.get('seller/normalPackage/syncData', null, function (data) {
            console.log(data);
            data.data && init();
        });
    };
    //生成备货单
    $scope.preparingBillForm = function () {
        var Packages = getSelectedPackages();

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        Packages = filterUncheckedOrder(angular.copy(Packages));

        var tids = [];

        angular.forEach(Packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
                tids.push(normalTrade.tid);
            });
        });
        tids = tids.join(",");
        $location.url('/print/preparingBillForm?tids=' + tids);
    };
    //发货后修改物流公司
    $scope.cancelResend = function () {
        var Packages = filterUncheckedOrder(angular.copy(getSelectedPackages()));
        Packages = clientToServer(Packages);
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        var normalPackageList = $(Packages).map(function () {
            return this.normalPackage;
        }).get();
        $scope.messages = '数据提交中。。';
        $restClient.post("seller/normalPackage/cancelResend", {userExpressTemplateId: $scope.obj.userExpressTemp.id}, normalPackageList, function (data) {
            console.log(data);
            if (data.data.errorList.length > 0) {
                var modalInstance = $modal.open({
                    templateUrl: "views/pages/remindConsign.html",
                    controller: "remindConsignCtrl",
                    resolve: {
                        data: function () {
                            return angular.copy(data.data);
                        },
                        againConsign: function () {
                            return true;
                        }
                    }
                });

            } else {
                /*var mes = {
                 title: '恭喜您，发货成功！',
                 content: '您已成功发货' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，建议开启发货通知可以提升客户体验！',
                 img: "images/components/alert/alert-forbid.png",
                 size: "lg",
                 redirect: "http://yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliverGoodsInform",
                 showClose: true,
                 closeText: "发货通知",
                 cancelText: "关闭",
                 showCancel: true
                 };

                 var remind = $win.confirm(mes);*/
                $win.alert({
                    type: 'success',
                    content: '重新发货成功'
                })

            }
            if (data.data.successList.length > 0) {
                getOrder($scope.pageNo, $scope.pageSize);
            }


        })
    };
    //移除订单
    $scope.removePackage = function (Package) {
        $restClient.postFormData("seller/normalPackage/removeTrade", {packageId: Package.normalPackage.id}, function (data) {
            $win.alert({
                type: 'success',
                content: '移除成功'
            })
            getOrder();
        })

    }
}
]);
//modalCtrl
app.controller("queryAreaCtrl", ["$scope", "selectItems", "$modalInstance", "$common", "$win", "$restClient", "isSave", function ($scope, selectItems, $modalInstance, $common, $win, $restClient, isSave) {
    $scope.allSelect = false;
    $scope.noneSelect = false;
    $scope.remoteArea = false;//是否偏远地区
    $scope.areas = [
        {
            "name": "华东",
            "select": false,
            "key": "01",
            "province": [
                {
                    "name": "上海",
                    "select": false,
                    "key": "010",
                    "parent": 0
                },
                {
                    "name": "浙江省",
                    "select": false,
                    "key": "011",
                    "parent": 0
                },
                {
                    "name": "江苏省",
                    "select": false,
                    "key": "012",
                    "parent": 0
                },
                {
                    "name": "安徽省",
                    "select": false,
                    "key": "013",
                    "parent": 0
                },
                {
                    "name": "江西省",
                    "select": false,
                    "key": "014",
                    "parent": 0
                }
            ]
        },
        {
            "name": "华北",
            "select": false,
            "key": "02",
            "province": [
                {
                    "name": "北京",
                    "select": false,
                    "key": "020",
                    "parent": 1
                },
                {
                    "name": "天津",
                    "select": false,
                    "key": "021",
                    "parent": 1
                },
                {
                    "name": "河北省",
                    "select": false,
                    "key": "022",
                    "parent": 1
                },
                {
                    "name": "山西省",
                    "select": false,
                    "key": "023",
                    "parent": 1
                },
                {
                    "name": "山东省",
                    "select": false,
                    "key": "024",
                    "parent": 1
                },
                {
                    "name": "内蒙古",
                    "select": false,
                    "key": "025",
                    "parent": 1
                }
            ]
        },
        {
            "name": "华中",
            "select": false,
            "key": "03",
            "province": [
                {
                    "name": "湖北省",
                    "select": false,
                    "key": "030",
                    "parent": 2
                },
                {
                    "name": "湖南省",
                    "select": false,
                    "key": "031",
                    "parent": 2
                },
                {
                    "name": "河南省",
                    "select": false,
                    "key": "032",
                    "parent": 2
                }
            ]
        },
        {
            "name": "华南",
            "select": false,
            "key": "04",
            "province": [
                {
                    "name": "广东省",
                    "select": false,
                    "key": "040",
                    "parent": 3
                },
                {
                    "name": "广西",
                    "select": false,
                    "key": "041",
                    "parent": 3
                },
                {
                    "name": "海南省",
                    "select": false,
                    "key": "042",
                    "parent": 3
                },
                {
                    "name": "福建省",
                    "select": false,
                    "key": "043",
                    "parent": 3
                }
            ]
        },
        {
            "name": "东北",
            "select": false,
            "key": "05",
            "province": [
                {
                    "name": "吉林省",
                    "select": false,
                    "key": "050",
                    "parent": 4
                },
                {
                    "name": "辽宁省",
                    "select": false,
                    "key": "051",
                    "parent": 4
                },
                {
                    "name": "黑龙江",
                    "select": false,
                    "key": "052",
                    "parent": 4
                }
            ]
        },
        {
            "name": "西北",
            "select": false,
            "key": "06",
            "province": [
                {
                    "name": "陕西省",
                    "select": false,
                    "key": "060",
                    "parent": 5
                },
                {
                    "name": "新疆",
                    "select": false,
                    "key": "061",
                    "parent": 5
                },
                {
                    "name": "青海省",
                    "select": false,
                    "key": "062",
                    "parent": 5
                },
                {
                    "name": "宁夏",
                    "select": false,
                    "key": "063",
                    "parent": 5
                },
                {
                    "name": "甘肃省",
                    "select": false,
                    "key": "064",
                    "parent": 5
                }
            ]
        },
        {
            "name": "西南",
            "select": false,
            "key": "07",
            "province": [
                {
                    "name": "四川省",
                    "select": false,
                    "key": "070",
                    "parent": 6
                },
                {
                    "name": "云南省",
                    "select": false,
                    "key": "071",
                    "parent": 6
                },
                {
                    "name": "贵州省",
                    "select": false,
                    "key": "072",
                    "parent": 6
                },
                {
                    "name": "西藏",
                    "select": false,
                    "key": "073",
                    "parent": 6
                },
                {
                    "name": "重庆",
                    "select": false,
                    "key": "074",
                    "parent": 6
                }
            ]
        },
        {
            "name": "港澳台",
            "select": false,
            "key": "08",
            "province": [
                {
                    "name": "香港",
                    "select": false,
                    "key": "080",
                    "parent": 7
                },
                {
                    "name": "澳门",
                    "select": false,
                    "key": "081",
                    "parent": 7
                },
                {
                    "name": "台湾",
                    "select": false,
                    "key": "082",
                    "parent": 7
                }
            ]
        },
        {
            "name": "海外",
            "select": false,
            "key": "09",
            "province": [
                {
                    "name": "海外",
                    "select": false,
                    "key": "090",
                    "parent": 8
                }
            ]
        }
    ];
    $scope.selectItems = selectItems;
    console.log(selectItems);

    //删除
    $scope.removeSelect = function (item) {
        var index = $scope.selectItems.indexOf(item);
        $scope.selectItems.splice(index, 1);
        $restClient.deletes('seller/customQueryArea/delete', {id: item.id}, function (data) {
            console.log(data);
            data.data && $win.alert({
                type: "success",
                content: '删除成功'
            });
            //data.data && $scope.selectItems.push(data.data);
            /*$modalInstance.close();*/
        });
    };
    //全选
    $scope.selectAll = function (event) {
        if ($scope.allSelect) {
            event.preventDefault();
            return;
        }
        selectAll();
    };

    //全不选
    $scope.selectNone = function (event) {
        if ($scope.noneSelect) {
            event.preventDefault();
            return;
        }
        selectNone();
        $scope.remoteArea = false;
    };

    //排除偏远
    $scope.selectFaraway = function () {
        if (!$scope.remoteArea) {//排除
            $scope.remoteArea = true;
            $scope.allSelect = false;
            $scope.noneSelect = false;
            selectAll();
            $scope.areas[5].select = false;
            $scope.areas[5].province[1].select = false;
            $scope.areas[5].province[2].select = false;
            $scope.areas[6].select = false;
            $scope.areas[6].province[1].select = false;
            $scope.areas[6].province[3].select = false;
        } else {//恢复
            $scope.remoteArea = false;
            selectAll();
        }
    };

    //选择区域
    $scope.selectRegion = function (region, status) {
        var choice = !status;
        region.select = choice;
        for (var i = 0; i < region.province.length; i++) {
            region.province[i].select = choice;
        }

        if (choice) {
            $scope.allSelect = isAllOrNoneSelect("all");
            $scope.noneSelect = false;
        } else {
            $scope.allSelect = false;
            $scope.noneSelect = isAllOrNoneSelect("none");
        }
    };

    //选择省份
    $scope.selectState = function (state, status) {
        var choice = !status;
        var region = $scope.areas[state.parent];
        state.select = choice;

        region.select = isRegionSelect(region);
        if (choice) {
            $scope.allSelect = isAllOrNoneSelect("all");
            $scope.noneSelect = false;
        } else {
            $scope.allSelect = false;
            $scope.noneSelect = isAllOrNoneSelect("none");
        }
    };

    $scope.save = function (event) {
        var result = getSelect();
        if (result == "") {
            $win.alert('请至少选择一个地区');
            return;
        }
        selectNone();
        if (isSave) {
            $restClient.postFormData('seller/customQueryArea/save', {areaNames: result}, function (data) {
                console.log(data);
                data.data && $scope.selectItems.push(data.data);
                /*$modalInstance.close();*/
            });
        } else {
            $scope.selectItems.push({areaNames: result});
        }
    };

    $scope.cancel = function (event) {
        $modalInstance.dismiss();
    };

    //是否全选或者全不选 type true时为判断全选否则判断全部选
    function isAllOrNoneSelect(type) {
        var result = true;
        type = (type == "all");
        //全选
        if (type) {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                if (!region.select) {
                    result = false;
                }
                for (var j = 0; j < region.province.length; j++) {
                    var state = region.province[j];
                    if (!state.select) {
                        result = false;
                    }
                }
            }
        } else {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                if (region.select) {
                    result = false;
                }
                for (var j = 0; j < region.province.length; j++) {
                    var state = region.province[j];
                    if (state.select) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }

    function selectAll() {
        for (var i = 0; i < $scope.areas.length; i++) {
            var region = $scope.areas[i];
            region.select = true;
            for (var j = 0; j < region.province.length; j++) {
                region.province[j].select = true;
            }
        }
        $scope.allSelect = true;
        $scope.noneSelect = false;
    }

    function selectNone() {
        for (var i = 0; i < $scope.areas.length; i++) {
            var region = $scope.areas[i];
            region.select = false;
            for (var j = 0; j < region.province.length; j++) {
                region.province[j].select = false;
            }
        }
        $scope.noneSelect = true;
        $scope.allSelect = false;
    }

    function isRegionSelect(region) {
        var province = region.province;
        var result = true;
        for (var i = 0; i < province.length; i++) {
            result = result && province[i].select;
        }
        return result;
    }

    function getSelect() {
        var result = [];
        angular.forEach($scope.areas, function (region) {
            angular.forEach(region.province, function (state) {
                if (state.select) {
                    result.push(state.name);
                }
            })
        });

        return result.toString();
    }
}]);
app.controller('updateItemCodeCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.itemCode = data.skuCode ? data.skuCode : data.itemCode;



    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        var params = {
            oid :data.oid,
            numIid:data.numIid
        };


        params.skuCode = $scope.itemCode;

        $modalInstance.close(params);

    }

}]);

app.controller('updateSkuCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.normalOrder = data.normalOrder;
    $scope.itemSkuFilter = data.baseSetting.itemSkuFilter;
    $scope.isSku = 1;


    $scope.sku = $scope.normalOrder.skuChangeName ? angular.copy($scope.normalOrder.skuChangeName) : angular.copy($scope.normalOrder.skuPropertiesName);
    //切割sku属性
    $scope.skuPropertiesName = [];
    angular.forEach($scope.sku.split(";"), function (properties) {
        var skuProperties = {};
        skuProperties.key = properties.split(":")[0];
        skuProperties.value = properties.split(":")[1];
        $scope.skuPropertiesName.push(skuProperties);
    });


    console.log(data);
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        var params;
        var emptyValue;
        if ($scope.isSku) {
            params = {
                oid: $scope.normalOrder.oid,
                skuChangeName: ''
            };
            for (var i = 0; i < $scope.skuPropertiesName.length; i++) {
                if ($scope.skuPropertiesName[i].value == "") {
                    emptyValue = true;
                    return false;
                } else {
                    params.skuChangeName = params.skuChangeName + $scope.skuPropertiesName[i].key + ":"
                        + $scope.skuPropertiesName[i].value + ";";
                }
            }
            if (emptyValue) {
                return false;
            }
            params.skuChangeName = params.skuChangeName.substring(0, params.skuChangeName.length - 1);
            $restClient.post('seller/normalPackage/updateSku', null, params, function (data) {
                console.log(data);
                data.data &&
                $modalInstance.close(params.skuChangeName);
            });
        } else {
            params = {
                itemSkuFilter: $scope.itemSkuFilter.replace(/\n/g, ",").replace(/\s/g, "")
            };
            data.baseSetting.itemSkuFilter = $scope.itemSkuFilter;
            $modalInstance.close(params);

        }

    }
}]);

app.controller('updateItemTitleCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    //修改宝贝简称表单
    function updateItemForm(normalOrder) {
        var params = {
            oid: normalOrder.oid,
            itemId: normalOrder.numIid
        };
        $restClient.postFormData('seller/normalPackage/updateItemForm', params, function (data) {
            console.log(data);
            $scope.itemTitleSort = data.data.itemTitleSort;
        });
    }

    updateItemForm(data);

    // $scope.abbrevName = angular.copy(data.abbrevName);
    $scope.normalOrder = angular.copy(data);
    $scope.isSyncItem = 0;
    $scope.isAllUpdate = 0;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close({
            normalOrder: {
                abbrevName: $scope.normalOrder.abbrevName,
                oid: $scope.normalOrder.oid
            },
            isSyncItem: $scope.isSyncItem,
            isAllUpdate: $scope.isAllUpdate
        });
    }
}]);

app.controller('updatePrintStateCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.isPrintExpress = null;
    $scope.isPrintDeliveryBill = null;
    $scope.data = data;
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close({
            packageIds: data.id,
            isPrintExpress: $scope.isPrintExpress,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill
        });
    }
}]);
app.controller('updateReceiverAddressCtrl', ['$scope', '$modalInstance', 'data', '$q', '$restClient', function ($scope, $modalInstance, data, $q, $restClient) {
    function init() {
        angular.forEach(data.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                delete normalOrder.checked;
                delete normalOrder.normal;
                delete normalOrder.disabled;
            });
        });
        $scope.package = data;
        $scope.normalPackage = angular.copy(data.normalPackage);
        $scope.normalPackageCopy = angular.copy(data.normalPackage);
        getReceiverAddressForm();
        getProvince().then(watchProvince);
    }

    function getReceiverAddressForm() {
        $restClient.postFormData('seller/normalPackage/updateReceiverAddressForm', {packageId: data.normalPackage.id}, function (data) {
            console.log(data);
            $scope.receiverAddressList = data.data;
        });
    }

    init();

    function watchProvince() {
        $scope.$watch('normalPackage.receiverState', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity() {
        $scope.$watch('normalPackage.receiverCity', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.city, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCountry(item.code);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince() {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCity(code) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            //console.log(data);
            $scope.city = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCountry(code) {
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            $scope.country = data.data;
            var hasCounty = false;
            angular.forEach($scope.country, function (item) {
                if (item.name == $scope.normalPackage.receiverDistrict) {
                    hasCounty = true;
                }
            });
            //如果区地址不存在则重置为空
            !hasCounty && ($scope.normalPackage.receiverDistrict = "");
        });
    }

    $scope.selectAddress = function (receiverAddress) {
        $scope.normalPackage.receiverName = receiverAddress.receiverName;
        $scope.normalPackage.receiverMobile = receiverAddress.receiverMobile;
        $scope.normalPackage.receiverState = receiverAddress.receiverState;
        $scope.normalPackage.receiverCity = receiverAddress.receiverCity;
        $scope.normalPackage.receiverDistrict = receiverAddress.receiverDistrict;
        $scope.normalPackage.receiverAddress = receiverAddress.receiverAddress;
        $scope.normalPackage.receiverZip = receiverAddress.receiverZip;

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.normalPackage);
    }
}]);
app.controller('updateCustomStarCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.customStarList = data;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        var emptyValue;
        angular.forEach($scope.customStarList, function (customStar) {
            if (customStar.name == '') {
                emptyValue = true;
                return false;
            }
        });
        if (emptyValue) {
            return false;
        }

        $modalInstance.close($scope.customStarList);
    }
}]);

app.controller('updateSellerMemoCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    if (typeof data == 'object') {         //单个修改备注
        $scope.batch = false;
        $scope.sellerFlag = data.sellerFlag;
        $scope.sellerMemo = data.sellerMemo;
        $scope.save = function () {
            $modalInstance.close({
                tid: data.tid,
                sellerFlag: $scope.sellerFlag,
                sellerMemo: $scope.sellerMemo
            });
        }
    }
    if (typeof data == 'string') {         //批量修改备注
        $scope.sellerFlag = "";
        $scope.batch = true;
        $scope.updateType = 1;
        $scope.save = function () {
            var modifiedData = {
                tids: data,
                updateType: $scope.updateType,
                sellerMemo: $scope.sellerMemo
            };
            //选择了旗帜，不选不改
            if ($scope.sellerFlag) {
                modifiedData.sellerFlag = $scope.sellerFlag;
            }
            $modalInstance.close(modifiedData);
        }
    }
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('updateSysMemoCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    if (typeof data == 'object') {         //单个修改备注
        $scope.sysMemos = data.sysMemo;
        $scope.save = function () {
            $modalInstance.close({
                tids: data.tid.toString(),
                sysMemo: $scope.sysMemos
            });
        }
    }
    if (typeof data == 'string') {         //批量修改备注
        $scope.save = function () {
            $modalInstance.close({
                tids: data,
                sysMemo: $scope.sysMemos
            });
        }
    }


    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('choosePackageCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.packages = data;
    $scope.allChecked = true;
    //选中的包裹
    function getSelectedPackages() {
        var packages = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && packages.push(item);
        });
        return packages;
    }

    //选择全部
    $scope.checkAll = function () {
        angular.forEach($scope.packages, function (item) {
            item.checked = !$scope.allChecked;
        });
    };
    //选择包裹
    $scope.selectPackage = function (packages) {
        var choose = packages.checked;
        packages.checked = !choose;
        var allChecked = true;
        angular.forEach($scope.packages, function (item) {
            allChecked = allChecked && item.checked;
        });
        $scope.allChecked = allChecked;
    };
    //保存
    $scope.save = function () {
        var packages = getSelectedPackages();
        if (packages.length < 2) {
            $win.alert('请选择2笔以上订单');
        } else {
            $modalInstance.close(packages);
        }
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('chooseAddressCtrl', ['$scope', '$modalInstance', 'data', '$dpAddress', function ($scope, $modalInstance, data, $dpAddress) {

    init();

    function init() {
        $scope.packages = data;
        $scope.mainPackage = data[0];   //主包裹
        $scope.customAdd = false;       //自定义地址

        $scope.isPrintDeliveryBill = 0;     //是否已发货
        $scope.isPrintExpress = 0;          //是否已打印
        $scope.existDelivered = false;      //是否有已发货订单
        $scope.receiverState = null;
        $scope.receiverCity = null;
        $scope.receiverTown = null;
        $scope.provinceList = [];
        $scope.cityList = [];
        $scope.countryList = [];

        checkDelivered();
    }

    //自定义地址
    $scope.customAddress = function () {
        $scope.customAdd = !$scope.customAdd;
        if ($scope.customAdd && $scope.provinceList.length == 0) {
            $dpAddress.getSelectAddress($scope);
        }
    };
    /*normalOrder.consignStatus==2||(normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' ||
     normalOrder.status == 'TRADE_BUYER_SIGNED' ||
     normalOrder.status == 'TRADE_FINISHED')*/
    //检查是否存在已发货订单
    function checkDelivered() {
        angular.forEach($scope.packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    if (normalOrder.consignStatus == 2 || (normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' ||
                        normalOrder.status == 'TRADE_BUYER_SIGNED' ||
                        normalOrder.status == 'TRADE_FINISHED')) {
                        //部分发货
                        Package.partDelivered = true;
                    }
                })
            })
        });

        angular.forEach($scope.packages, function (Package) {
            $scope.existDelivered = $scope.existDelivered || Package.partDelivered;
        });
    }


    //保存
    $scope.save = function () {
        var mergeTids = $(data).map(function () {
            return this.normalPackage.tid;
        }).get().join();

        var needMergePackageIds = $(data).map(function () {
            return this.normalPackage.id;
        }).get();

        var masterNormalPackage = {
            id: $scope.mainPackage.normalPackage.id
        };
        if ($scope.customAdd) {                           //自定义地址
            masterNormalPackage.receiverName = $scope.receiverName;
            masterNormalPackage.receiverMobile = $scope.receiverMobile;
            masterNormalPackage.receiverState = $scope.receiverState;
            masterNormalPackage.receiverCity = $scope.receiverCity;
            masterNormalPackage.receiverDistrict = $scope.receiverDistrict;
            masterNormalPackage.receiverTown = $scope.receiverTown;
            masterNormalPackage.receiverAddress = $scope.receiverAddress;
        } else {                                          //使用主包裹地址
            masterNormalPackage.receiverName = $scope.mainPackage.normalPackage.receiverName;
            masterNormalPackage.receiverMobile = $scope.mainPackage.normalPackage.receiverMobile;
            masterNormalPackage.receiverState = $scope.mainPackage.normalPackage.receiverState;
            masterNormalPackage.receiverCity = $scope.mainPackage.normalPackage.receiverCity;
            masterNormalPackage.receiverDistrict = $scope.mainPackage.normalPackage.receiverDistrict;
            masterNormalPackage.receiverTown = $scope.mainPackage.normalPackage.receiverTown;
            masterNormalPackage.receiverAddress = $scope.mainPackage.normalPackage.receiverAddress;
        }
        var index = needMergePackageIds.indexOf($scope.mainPackage.normalPackage.id);
        needMergePackageIds.splice(index, 1);

        $modalInstance.close({
            mergeTids: mergeTids,
            masterNormalPackage: masterNormalPackage,
            needMergePackageIds: needMergePackageIds.join(','),
            isPrintExpress: $scope.isPrintExpress ? 2 : 0,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill ? 2 : 0
        });
    };
    //上一步
    $scope.back = function () {
        $modalInstance.close({
            back: true
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('chooseTradeCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.package = data;
    $scope.selectTrade = data.normalPackage.normalTradeList[0].tid;

    //保存
    $scope.save = function () {
        var needSplitTid = $scope.selectTrade;      //需拆的订单Tid

        var masterTids = $(data.normalPackage.normalTradeList).map(function () {
            return this.tid;
        }).get();

        var index = masterTids.indexOf(needSplitTid);
        masterTids.splice(index, 1);                //不需要拆的Tids


        $modalInstance.close({
            Package: data,
            needSplitTid: needSplitTid,
            masterTids: masterTids.join(',')
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('chooseStatusCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.package = data.Package;
    $scope.isPrintDeliveryBill = 0;     //是否已发货
    $scope.isPrintExpress = 0;          //是否已打印

    angular.forEach($scope.package.normalPackage.normalTradeList, function (normalTrade) {
        if (normalTrade.tid == data.needSplitTid) {
            $scope.trade = normalTrade;
        }
    });
    //保存
    $scope.save = function () {

        $modalInstance.close({
            packageId: data.Package.normalPackage.id,
            needSplitTid: data.needSplitTid,
            masterTids: data.masterTids,
            isPrintExpress: $scope.isPrintExpress ? 2 : 0,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill ? 2 : 0
        });
    };
    //上一步
    $scope.back = function () {
        $modalInstance.close({
            back: true
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('showLogCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    $scope.getLogs = function (logType) {
        $scope.loading = $restClient.postFormData('seller/normalPackage/showLog', {
            tids: data.normalPackage.mergedTids,
            logType: logType
        }, function (data) {
            console.log(data);
            $scope.logs = data.data;
        });
    };
    console.log(data);
    $scope.getLogs(1);
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('authModalCtrl', ['$scope', '$modalInstance', '$restClient', function ($scope, $modalInstance, $restClient) {
    $scope.inputCode = '';
    $scope.authCode = Math.ceil(Math.random() * 10000);
    while ($scope.authCode < 1000) {
        $scope.authCode = Math.ceil(Math.random() * 10000);
    }

    //console.log(data);
    $scope.validCode = function () {           //验证
        return $scope.inputCode == $scope.authCode;
    };

    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close(true);
    }
}]);

app.controller('choosePrinterCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    function getPrinter() {
        var iPrinterCount = LODOP.GET_PRINTER_COUNT();
        $scope.printerList = [];
        for (var i = 0; i < iPrinterCount; i++) {
            $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
        }
        if ($scope.printType != 3) {
            if ($scope.printerList.indexOf($scope.lockPrintName) > -1) {
                $scope.printer = $scope.lockPrintName;

            } else {
                //锁定的打印机不匹配
                $scope.unmatch = true;
            }
        }
    }

    $scope.dealing = false;
    //打印类型: 1-打印快递单 2-打印发货单 3-备货单
    $scope.printType = data.type;

    //是否预览
    $scope.preview = data.preview;

    //是否存在快递模板
    if ($scope.printType != 3 && data.template) {
        //之前已锁定的打印机
        if (data.template.printerKey != "") {
            $scope.lockPrintName = data.template.printerKey;
        }

        //模板名称
        $scope.templateName = data.template.name;
        //锁定的打印机是否不存在且匹配
        $scope.unmatch = false;
        //是否锁定当前打印机
        $scope.lockPrint = false;
    }
    getPrinter();

    //$scope.printerList.indexOf()
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        //虚拟打印机提示
        if ($scope.printer.toLowerCase().indexOf('xps') != -1 || $scope.printer.toLowerCase().indexOf('pdf') != -1) {
            if (!confirm('您选择的是虚拟打印机，是否继续打印！')) {
                return;
            }
        }
        if ($scope.printer.toLowerCase().indexOf('fax') != -1) {
            if (!confirm('您选择的不是打印机，是否继续打印！')) {
                return;
            }
        }
        $scope.dealing = true;
        //锁定打印机
        if ($scope.lockPrint) {
            //锁定发货单模板打印机
            if ($scope.printType == 2) {
                data.template.printerKey = $scope.printer;
                $restClient.post('seller/userDeliveryTemplate/printerLock', null, data.template, function (data) {
                    if (data.data) {

                    }
                });

            }
            //锁定快递单模板打印机
            if ($scope.printType == 1) {
                data.template.printerKey = $scope.printer;
                $restClient.post('seller/userExpressTemplate/updateSelective', null, data.template, function (data) {
                    if (data.data) {

                    }
                });
            }
        }

        $modalInstance.close($scope.printer);
    }
}]);

app.controller('remindExpressNoCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    var packages = data.packages;

    var length = $scope.length = packages.length;
    //是否是打印后的联想
    $scope.isConsign = data.isConsign;
    $scope.expressName = data.userExpressName;
    $scope.one = false;
    $scope.firstSid = data.sidStart;

    if (length > 1) {
        $scope.lastSid = data.lastSid;
    } else {
        $scope.one = true;

    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close();
    }

}]);

app.controller('reachCoverCtrl', ['$scope', '$modalInstance', 'data', 'normalPackage', '$modal', function ($scope, $modalInstance, data, normalPackage, $modal) {
    $scope.data = data;
    $scope.package = normalPackage;

    $scope.editCorrectScope = function () {
        $modalInstance.close();

    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('editCorrectScopeCtrl', ['$scope', '$modalInstance', 'Package', '$win', '$restClient', 'correctionRange', function ($scope, $modalInstance, Package, $win, $restClient, correctionRange) {

    $scope.edit = true;
    var params = correctionRange;
    console.log(correctionRange);
    console.log(Package);
    $scope.express = {};
    $scope.data = {};
    $scope.express.name = correctionRange.expressName;
    $scope.isReach = Package.normalPackage.isReach;
    $scope.data.province = Package.normalPackage.receiverState;
    $scope.data.city = Package.normalPackage.receiverCity;
    $scope.data.district = Package.normalPackage.receiverDistrict;

    $scope.save = function () {
        params.isReach = $scope.isReach;

        $modalInstance.close(params);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('printResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.operateType = data.operateType;
    $scope.data = data.data;
    $scope.totalNum = data.data.detailNormalPackageList.length;
    $scope.successNum = data.data.successList.length;
    $scope.errorNum = data.data.errorList.length;

    $scope.allExistExpressNo = true;
    angular.forEach(data.data.detailNormalPackageList, function (detailNormalPackage) {
        //是否都存在运单号
        if (!detailNormalPackage.expressNo) {
            $scope.allExistExpressNo = false;
        }
    });
    $scope.save = function () {
        $modalInstance.close($scope.allExistExpressNo);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindConsignCtrl', ['$scope', '$modalInstance', 'data', 'againConsign', '$win', function ($scope, $modalInstance, data, againConsign, $win) {

    $scope.data = data;
    $scope.againConsign = againConsign;
    $scope.totalNum = data.detailNormalTradeList.length;
    $scope.successNum = data.successList.length;
    $scope.errorNum = data.errorList.length;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('setSortCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

    $scope.data = data;

    $scope.save = function () {
        $modalInstance.close($scope.data);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('errorListCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.errorList = data;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('recycleRemindCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.recycleWaybillPackage = data;
    $scope.recycle = true;
    $scope.save = function () {
        $modalInstance.close($scope.recycle);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindFilterCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.filter = true;
    $scope.save = function () {
        $modalInstance.close($scope.filter);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('waybillPrintCtrl', ['$scope', '$modalInstance', 'data', '$win', '$restClient', function ($scope, $modalInstance, data, $win, $restClient) {
    //所有打印机
    $scope.printers = data.printerInfo.printers;

    //已锁定的打印机
    $scope.defaultPrint = data.templateData.printerKey;
    //模板名称
    $scope.templateName = data.templateData.name;


    if ($scope.defaultPrint != '') {
        angular.forEach($scope.printers, function (printerInfo) {
            //锁定的打印机匹配
            if (printerInfo.name == $scope.defaultPrint) {
                $scope.unmatch = false;
                //已锁定的打印机
                $scope.printer = $scope.defaultPrint;
            }
        });
    } else {
        //锁定的打印机是否存在不匹配
        $scope.unmatch = true;
        $scope.printer = "";
    }

    $scope.save = function () {

        //虚拟打印机提示
        if ($scope.printer.toLowerCase().indexOf('xps') != -1 || $scope.printer.toLowerCase().indexOf('pdf') != -1) {
            if (!confirm('您选择的是虚拟打印机，是否继续打印！')) {
                return;
            }
        }
        if ($scope.printer.toLowerCase().indexOf('fax') != -1) {
            if (!confirm('您选择的不是打印机，是否继续打印！')) {
                return;
            }
        }
        //锁定打印机
        if ($scope.lockPrint) {

            //锁定快递单模板打印机

            data.templateData.printerKey = $scope.printer;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, data.templateData, function (data) {
                if (data.data) {

                }
            });

        }

        $modalInstance.close($scope.printer);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('waybillResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.successNum = data.successNum;
    $scope.failedNum = data.failedNum;
    $scope.printStatus = data.printStatus;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('recycleResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.errorRecycleList = data.errorRecycleList;
    $scope.successRecycleList = data.successRecycleList;
    $scope.totalNum = $scope.errorRecycleList.length + $scope.successRecycleList.length;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('chooseWaybillCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.usedWaybillList = data;

    $scope.save = function () {
        $modalInstance.close($scope.selectWaybill);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindExceptionCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.closeTip = false;
    $scope.content = data[0].content;

    $scope.save = function () {
        // 0 不提示，1提示
        var closeTip = $scope.closeTip ? 0 : 1;
        $modalInstance.close(closeTip);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('printMultiWaybillCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.time = 1;

    $scope.save = function (preview) {

        $modalInstance.close({
            preview: preview,
            time: $scope.time
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);





