//新增发货单模板
app.controller('invoiceTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', '$dpPrint', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state, $dpPrint) {

    /*$scope.addInvoice = function () {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/addInvoice.html",
            controller: "addInvoiceCtrl",
            size: 'lg'
        });
        modalInstance.result.then(function () {

        });

    };*/
    init();

    function init() {
       // LODOP = getLodop();
        getData();
        getBaseSetting();
    }
    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            console.log(data);
            $scope.baseSetting = data.data;
        });
    }
    function getData() {
       $scope.loading = $restClient.get('seller/userDeliveryTemplate/list', null, function (data) {
            console.log(data);
            $scope.deliveryTemplateList = data.data;
        });
    }


    $scope.setDefault = function (deliveryTemplate) {
        $restClient.postFormData('seller/userDeliveryTemplate/default', {id: deliveryTemplate.id}, function (data) {
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '设置成功'//内容
                });
                getData();
            }
        });
    };

    $scope.preview = function (deliveryTemplate) {
        var domElement = $('.deliveryTemplate');
        var baseData = {
            baseSetting: $scope.baseSetting
        };
        $dpPrint.printDelivery(true,baseData, null, null, [], domElement, deliveryTemplate.id);
    };

    $scope.edit = function (deliveryTemplate) {
        //页面跳转
        $location.url('/print/editDeliveryTemplate?id=' + deliveryTemplate.id);
    };

    $scope.delete = function (deliveryTemplate) {
        $restClient.deletes('seller/userDeliveryTemplate/delete', {id: deliveryTemplate.id}, function (data) {
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'//内容
                });
                getData();
            }
        });
    };

    $scope.printerLock = function (deliveryTemplate) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/deliveryPrinterLock.html",
            controller: "deliveryPrinterLockCtrl",
            resolve: {
                data: function () {
                    return angular.copy(deliveryTemplate);
                }
            }
        });
        modalInstance.result.then(function () {
            getData();
        });
    };

    //保存
    $scope.printerUnLock = function (deliveryTemplate) {
        deliveryTemplate.printerKey = null;
        $restClient.post('seller/userDeliveryTemplate/printerLock', null,deliveryTemplate, function (data) {
            if (data.data) {
                $modalInstance.close();
            }
        });
    };
}]);


app.controller('deliveryPrinterLockCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.deliveryTemplate = data;

    var iPrinterCount = LODOP.GET_PRINTER_COUNT();
    $scope.printerList = [];
    for (var i = 0; i < iPrinterCount; i++) {
        $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
    }

    //保存
    $scope.save = function (deliveryTemplate) {
        $restClient.post('seller/userDeliveryTemplate/printerLock', null,deliveryTemplate, function (data) {
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