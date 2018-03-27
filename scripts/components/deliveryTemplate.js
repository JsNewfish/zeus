/**
 * Created by Jin on 2016/8/10.
 */
app.directive('deliveryTemplate', [function () {
    return {
        restrict: 'AE',
        scope: {
            entity: "="
        },
        templateUrl: "views/components/printDeliveryTemplate.html",
        link: function ($scope, element, attrs, ctrl) {
            $scope.tableStyle = {
                fontFamily: '',
                fontSize: '',
                lineHeight: ''
            };
            function init() {

                $scope.entity = serverToClient($scope.entity);
            }

            init();

            $scope.$watch('entity', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    serverToClient(newValue);
                }
            }, true);

            function serverToClient(data) {
                //data.userDeliveryTemplate.width = transformMm(data.userDeliveryTemplate.width);
                //data.userDeliveryTemplate.height = transformMm(data.userDeliveryTemplate.height);
                $scope.tableStyle.fontFamily = data.userDeliveryTemplate.fontType;
                $scope.tableStyle.fontSize = data.userDeliveryTemplate.fontSize + 'px';
                $scope.tableStyle.lineHeight = data.userDeliveryTemplate.lineHeight + 'px';

                $scope.cellList = {};

                for (var i = 0; i < data.userTemplateCellList.length; i++) {
                    $scope.cellList[data.userTemplateCellList[i].entryCode] = data.userTemplateCellList[i];

                }
                $scope.noData = true;
                if(data.packageInfo) {
                    $scope.noData = false;
                    $scope.cellList.normalOrderList = [];
                    $scope.cellList.totalInfo = {};
                    $scope.cellList.totalInfo.num = 0;
                    $scope.cellList.totalInfo.totalPrice = 0;
                    $scope.cellList.totalInfo.postFee = 0;
                    $scope.cellList.totalInfo.totalFee = 0;
                    $scope.cellList.totalInfo.payment = 0;
                    if(data.packageInfo.normalTradeList){
                        angular.forEach(data.packageInfo.normalTradeList, function (normalTrade) {
                            $scope.cellList.normalOrderList = $scope.cellList.normalOrderList.concat(normalTrade.normalOrderList);
                            $scope.cellList.totalInfo.postFee = $scope.cellList.totalInfo.postFee + parseInt(normalTrade.postFee);
                            $scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + normalTrade.payment;
                        });

                        angular.forEach($scope.cellList.normalOrderList, function (normalOrder) {
                            $scope.cellList.totalInfo.num = $scope.cellList.totalInfo.num + parseInt(normalOrder.num);

                            $scope.cellList.totalInfo.totalPrice = $scope.cellList.totalInfo.totalPrice + normalOrder.num * normalOrder.price;
                        });

                    }
                    //自由打印
                    if(data.packageInfo.freeTradeList||data.packageInfo.freeOrderList){
                        if(data.packageInfo.freeTradeList) {
                            angular.forEach(data.packageInfo.freeTradeList, function (freeTrade) {
                                $scope.cellList.normalOrderList = $scope.cellList.normalOrderList.concat(freeTrade.freeOrderList);
                                $scope.cellList.totalInfo.postFee = $scope.cellList.totalInfo.postFee + parseInt(freeTrade.postFee*100);
                                $scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + freeTrade.payment;
                            });

                        }
                        if(data.packageInfo.freeOrderList){
                            $scope.cellList.normalOrderList = data.packageInfo.freeOrderList;
                        }
                        angular.forEach($scope.cellList.normalOrderList, function (normalOrder) {
                            if(normalOrder) {
                                $scope.cellList.totalInfo.num = $scope.cellList.totalInfo.num + parseInt(normalOrder.num);
                                //$scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + normalOrder.payment;
                                $scope.cellList.totalInfo.totalPrice = $scope.cellList.totalInfo.totalPrice +
                                    normalOrder.num * normalOrder.price;
                            }
                        });
                    }
                    $scope.cellList.totalInfo.totalFee = $scope.cellList.totalInfo.totalPrice - $scope.cellList.totalInfo.payment+$scope.cellList.totalInfo.postFee;
                }
                //console.log($scope.cellList);
                return data;
            }

        }
    }
}]);