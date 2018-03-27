/**
 * Created by Jin on 2017/8/12.
 */
app.controller("bindShopCtrl", ["$scope", "$restClient", "$win", "$interval", function ($scope, $restClient, $win, $interval) {
    $scope.bindData = null;
    $scope.bindShopList = null;
    $scope.changeMobile = false;
    $scope.mobileCheckCode = null;
    $scope.bindShopCode = null;
    $scope.notAllow = false;
    $scope.errorMes = null;
    init();
    function init() {
        getList();
    }

    function getList() {
        var action = {
            successCallback: function (data) {
                $scope.bindData = data.data;
                $scope.bindShopList = data.data.bindShopList;
                $scope.mobile = $scope.bindData.bindPhoneNum;
            }, failCallback: function (data) {
                console.log(data);
                if (data.resultCode == "5000000" || data.resultCode == "5000001") {
                    $scope.notAllow = true;
                    $scope.errorMes = data.resultMessage;
                }
            }
        };
        $restClient.get('seller/shopBinding/list', null, action);
    }

    $scope.getModifyNumCode = function () {

        //计时器
        function startClock() {
            $scope.seconds = 60;
            $scope.enableSave = true;
            $scope.clock = $interval(function () {
                $scope.seconds--;
                if ($scope.seconds == 0) {
                    cancelClock();
                }
            }, 1000);
        }

        function cancelClock() {
            $scope.clock && $interval.cancel($scope.clock);
            $scope.enableSave = false;
            $scope.clock = null;
        }

        $restClient.get('seller/shopBinding/getModifyNumCode', {'phoneNum': $scope.mobile}, function (data) {

            if (data.resultCode == "0") {
                startClock();
            }

        })
    };

    $scope.getCheckCode = function () {

        //计时器
        function startClock() {
            $scope.seconds2 = 60;
            $scope.enableSave2 = true;
            $scope.clock2 = $interval(function () {
                $scope.seconds2--;
                if ($scope.seconds2 == 0) {
                    cancelClock();
                }
            }, 1000);
        }

        function cancelClock() {
            $scope.clock2 && $interval.cancel($scope.clock2);
            $scope.clock2 = null;
            $scope.enableSave2 = false;
        }

        $restClient.get('seller/shopBinding/checkCode', {'shopCode': $scope.shopCode}, function (data) {

            if (data.resultCode == "0") {
                $scope.checkMobile = data.data.checkMobile.substr(0, 3) + '****' + data.data.checkMobile.substr(7);
                startClock();
            }

        })
    };

    $scope.customizer = function () {
        return (/^1\d{10}$/.test($scope.mobile));
    };
    $scope.modifyMobile = function () {
        $restClient.post('seller/shopBinding/modifyMobile', {
            'mobile': $scope.mobile,
            'checkCode': $scope.mobileCheckCode
        }, null, function (data) {
            if (data.data) {
                $scope.changeMobile = !$scope.changeMobile;
                $scope.bindData.bindPhoneNum = $scope.mobile;
            }
        })
    };
    $scope.bindShop = function () {

        $restClient.put('seller/shopBinding', {
            'checkCode': $scope.bindShopCode,
            'shopCode': $scope.shopCode
        }, null, function (data) {

            if (data.data) {
                $win.alert('店铺绑定成功！');
                $scope.bindShopCode = null;
                $scope.shopCode = null;
                init();
            }

        })

    };
    $scope.relieveBind = function (bindShop) {
        var mes = {
            title: '您确定要解除与此店铺的关联吗？',
            content: '解除关联后使用此店铺电子面单的模板将失效。',
            img: "images/components/alert/alert-forbid.png",
            size: "sm",
            showClose: true,
            showCancel: true
        };
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            $restClient.post('seller/shopBinding/relieveBind', {'bindShopId': bindShop.shopId}, null, function (data) {
                if (data.data) {
                    init();
                }
            })
        });
    };
    $scope.changeToggle = function () {
        $scope.changeMobile = !$scope.changeMobile;
    }
}]);