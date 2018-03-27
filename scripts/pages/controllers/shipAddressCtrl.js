app.controller('shipAddressCtrl', ['$scope', '$modal', '$restClient', '$win', function ($scope, $modal, $restClient, $win) {
    //新增发货地址
    function getData() {
        $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
            console.log(data);
            $scope.entity = data.data;
        });
    }

    function init() {
        getData();

    }

    init();
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
        modalInstance.result.then(function () {
            getData();
        });
    };
    $scope.setDefault = function (address) {
        var contactId = {contactId: address.contactId};
        $restClient.postFormData('seller/receiptAddress/default', contactId, function (data) {
            // console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '设为默认成功'
                });
                getData();
            }
            //$scope.entity = data.data;
        });
    };
    $scope.delete = function (address) {
        var addressId = {
            contactId: address.contactId
        };
        $restClient.deletes('seller/receiptAddress/delete', addressId, function (data) {
            console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'
                });
                getData();
            }
        });
    };

}]);
app.controller('addShipAddressCtrl', ['$scope', '$modalInstance', 'data', '$restClient', '$q', function ($scope, $modalInstance, data, $restClient, $q) {

    function init() {
        $scope.edit = false;
        $scope.address = {};

        if (data) {
            $scope.address = angular.copy(data);
            //phone数据转换
            if ($scope.address.phone && $scope.address.phone != "") {
                var phone = $scope.address.phone.split("-");
                $scope.phoneHead = phone[0];
                $scope.phoneBody = phone[1];
            }

            $scope.edit = true;
        } else {
            $scope.address.getDef = 0;
        }
        getProvince().then(watchProvince);
    }


    init();
    function watchProvince() {
        $scope.$watch('address.province', function (newValue, oldValue) {
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
        $scope.$watch('address.city', function (newValue, oldValue) {
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
        $restClient.post('seller/area/listByParentId', {parentId: 1}, null, function (data) {
            //console.log(data);
            $scope.province = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCity(code) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.post('seller/area/listByParentId', {parentId: code}, null, function (data) {
            //console.log(data);
            $scope.city = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCountry(code) {
        $restClient.post('seller/area/listByParentId', {parentId: code}, null, function (data) {
            $scope.country = data.data;
        });
    }

    function addNewAddress(postEntity) {
        $scope.loading=$restClient.post('seller/receiptAddress/add', null, angular.copy(postEntity), function (data) {
            console.log(data);
            $modalInstance.close();
        });
    }

    function updateAddress(postEntity) {
        $scope.loading=$restClient.put('seller/receiptAddress/update', null, angular.copy(postEntity), function (data) {
            console.log(data);
            $modalInstance.close(postEntity);
        });
    }

    $scope.save = function () {
        //phone数据拼接
        if ($scope.phoneHead && $scope.phoneHead != "") {
            $scope.address.phone = $scope.phoneHead;
        }
        if ($scope.phoneBody) {
            if ($scope.address.phone && $scope.address.phone != "") {
                $scope.address.phone = $scope.address.phone + "-" + $scope.phoneBody;
            } else {
                $scope.address.phone = $scope.phoneBody;
            }
        }

        $scope.edit ? updateAddress($scope.address) : addNewAddress($scope.address);

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    }
}]);