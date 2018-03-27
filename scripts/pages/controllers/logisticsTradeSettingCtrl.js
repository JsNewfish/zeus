/**
 * Created by Jin on 2016/5/28.
 */
app.controller('logisticsTradeSettingCtrl', ['$scope', '$restClient', '$win', function ($scope, $restClient, $win) {
    function getEntity() {
        $restClient.get('seller/logisticsTradeSetting', null, function (data) {
            //console.log(data);
            $scope.entity = data.data;
        });
    }

    function init() {

        getEntity();

    }

    init();

    function closeAll(entity) {
        entity.xServiceAudited = 0;
        entity.xAllocationNotified = 0;
        entity.xSendPrinted = 0;
        entity.xLogisticsPrint = 0;
        entity.xPackaged = 0;
    }

    function clientToServer(entity) {

        entity.xToSystem = entity.xWaitAllocation = entity.xOutWarehouse = entity.isOpen;
        return entity;
    }

    $scope.save = function () {
        $restClient.put('seller/logisticsTradeSetting/update', null, clientToServer(angular.copy($scope.entity)), function (data) {
            data.data && $win.alert({
                type: "success",
                content: '保存成功'//内容
            });
            //console.log(data);
        })
    };
    //关闭链路
    $scope.closed = function () {
        $scope.entity.isOpen && closeAll($scope.entity);
    };
    //开启单个节点
    $scope.switch = function (val) {
        if (!(val || $scope.entity.isOpen)) {
            $scope.entity.isOpen = true;
        }
    }
}]);