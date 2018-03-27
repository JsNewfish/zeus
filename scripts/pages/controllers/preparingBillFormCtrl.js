app.controller('preparingBillFormCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$location', function ($scope, $modal, $restClient, $win, $q, $location) {

    function getData() {
        var tids = $location.search().tids;
        $restClient.get('seller/preparingBill/preparingBillForm', null, function (data) {
            $scope.preparingBillFormDto = data.data;
            $scope.preparingBillFormDto.preparingBillSearchModel.payStartTime = $scope.preparingBillFormDto.preparingBillSearchModel.payStartTime && moment($scope.preparingBillFormDto.preparingBillSearchModel.payStartTime)._d;
            $scope.preparingBillFormDto.preparingBillSearchModel.payEndTime = $scope.preparingBillFormDto.preparingBillSearchModel.payEndTime && moment($scope.preparingBillFormDto.preparingBillSearchModel.payEndTime)._d;
            $scope.preparingBillFormDto.preparingBillSearchModel.tids = tids;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludePrintExpress = 0;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludePrintDelivery = 0;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludeRefund = 0;

        });
    }

    function init() {
        getData();
        $scope.limitTime = {
            dateFmt: "yyyy-MM-dd HH:mm:ss",
            startDate: '%y-%M-%d 00:00:00',
            maxDate: '%y-%M-%d 00:00:00',
            minDate: '%y-{%M-2}-%d 00:00:00'
        };
        $scope.limitTime2 = {
            dateFmt: "yyyy-MM-dd HH:mm:ss",
            startDate: '%y-%M-%d 23:59:59',
            maxDate: '%y-%M-%d 23:59:59',
            minDate: '%y-{%M-2}-%d 23:59:59'
        }
    }

    init();


    $scope.save = function () {
        if ($scope.selectArray.length > 0) {
            $scope.preparingBillFormDto.preparingBillSearchModel.sellerFlags = $scope.selectArray.join(",");
        }
        if ('undefined' == $scope.preparingBillFormDto.preparingBillSearchModel.tids || "" == $scope.preparingBillFormDto.preparingBillSearchModel.tids) {
            delete $scope.preparingBillFormDto.preparingBillSearchModel.tids;
        }
        var param = angular.copy($scope.preparingBillFormDto.preparingBillSearchModel);
        param.payStartTime = param.payStartTime && moment(param.payStartTime).format("YYYY/MM/DD HH:mm:ss");
        param.payEndTime = param.payEndTime && moment(param.payEndTime).format("YYYY/MM/DD HH:mm:ss");
        $scope.loading = $restClient.post('seller/preparingBill/save', null, param, function (data) {
            console.log(data);
            if (data.data) {
                $location.url('/print/preparingBill');
            }
            $win.alert({
                type: 'success',
                content: '已生成备货单!'
            })
        });
    };

    $scope.selectArray = [];
    $scope.select = function (sellerFlag) {
        var index = $scope.selectArray.indexOf(sellerFlag);
        if (index == -1) {
            $scope.selectArray.push(sellerFlag);
        } else {
            $scope.selectArray.splice(index, 1);
        }
    };

    $scope.updateCustomStar = function (customStarList, customStarId) {
        $scope.customStarColor = "";

        angular.forEach(customStarList, function (customStar) {
            if (customStar.id == customStarId) {
                $scope.customStarColor = customStar.color;
            }
        })

    };
}]);
