app.controller('scopeOfDeliveryCorrectCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', function ($scope, $modal, $restClient, $win, $q) {

    function getData() {

        $restClient.get('seller/correctionRange', null, function (data) {
            console.log(data.data);
            $scope.expressCo = data.data;
            $scope.express = data.data[0];
            $scope.search();
        });
    }

    function restData() {

        $scope.checkAll = false;  //是否全选
        $scope.selectArray = [];  //选择的条数
    }

    function init() {
        getData();
        restData();
        $scope.noData = true;      //是否有数据
        $scope.isReach = '';        //派送状态
    }
    //查询
    $scope.search = function () {

        var params = {
            userExpressId: $scope.express.id,
            isReach: $scope.isReach
        };

        $scope.loading = $restClient.postFormData('seller/correctionRange/search', params, function (data) {
           // console.log(data);
            if (data.data.length != 0) {
                $scope.rangeList = data.data;
                $scope.expressName = angular.copy($scope.express).name;
                $scope.noData = false;
            } else {
                $scope.rangeList = data.data;
                restData();
            }

        });
    };
    //批量删除
    $scope.deleteBatch = function () {
        if($scope.selectArray.length == 0){
            $win.alert('请先选择要删除的信息');
            return false;
        }
        var confirm = $win.confirm({
            size: "sm",//尺寸
            img: "images/components/alert/alert-delete.png",//图标
            title: "您确认要删除吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "删除后将无法恢复，请慎重操作"//内容
        });
        confirm.result.then(function () {
            $restClient.deletes('seller/correctionRange/batchDelete', {ids: $scope.selectArray.join(',')}, function (data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'//内容
                });
                $scope.search();
                restData();
            })
        });
    };
    //单选
    $scope.selectItem = function (range) {
        range.selected = !range.selected;
        if (range.selected) {
            $scope.selectArray.push(range.id);
        } else {
            var index = $scope.selectArray.indexOf(range.id);
            $scope.selectArray.splice(index, 1);
            $scope.checkAll = false;
        }
        console.log($scope.selectArray);
    };
    //全选
    $scope.selectAll = function () {
        $scope.checkAll = !$scope.checkAll;
        if ($scope.checkAll) {
            angular.forEach($scope.rangeList, function (item) {
                if (!item.selected) {
                    item.selected = true;
                    $scope.selectArray.push(item.id)
                }
            });
        } else {
            angular.forEach($scope.rangeList, function (item) {
                if (item.selected) {
                    item.selected = false;
                }
            });
            $scope.selectArray = [];
        }
        console.log($scope.selectArray);
    };
    //删除
    $scope.delete = function (range) {
        var confirm = $win.confirm({
            size: "sm",//尺寸
            img: "images/components/alert/alert-delete.png",//图标
            title: "您确认要删除吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "删除后将无法恢复，请慎重操作"//内容
        });
        confirm.result.then(function () {
            $restClient.deletes('seller/correctionRange/delete', {id: range.id}, function (data) {
                if (data.data) {
                    $win.alert({
                        type: "success",
                        content: '删除成功'
                    });
                    $scope.search();
                }
            })
        });

    };
    //添加或编辑
    $scope.addCorrectScope = function (range) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/addCorrectScope.html",
            controller: "addCorrectScopeCtrl",
            resolve: {
                data: function () {
                    return angular.copy(range);
                },
                express: function () {
                    return $scope.express;
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.search();
        })
    }
    init();
}]);
app.controller('addCorrectScopeCtrl', ['$scope', '$modalInstance', '$modal', 'data', 'express', '$restClient', '$win', '$q', function ($scope, $modalInstance, $modal, data, express, $restClient, $win, $q) {
    $scope.express = express;
    $scope.edit = data != undefined;       //是否是编辑状态
    $scope.isReach = 0;
    if (data != undefined) {
        $scope.data = data;
        $scope.isReach = data.isReach;
    }

    //地区选择级联
    getProvince().then(watchProvince);

    function watchProvince() {
        $scope.$watch('provinceId', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.id == newValue) {
                            getCity(item.code).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity() {
        $scope.$watch('cityId', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.city, function (item) {
                    if (keepGoing) {
                        if (item.id == newValue) {
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
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        var params = {};
        params.isReach = $scope.isReach;
        if ($scope.edit) {                           //编辑
            params.id = data.id;
        } else {                                    //新添加
            params.expressId = $scope.express.expressId;
            if ($scope.countryId != undefined) {
                params.areaId = $scope.countryId;
            } else if ($scope.cityId != undefined) {
                params.areaId = $scope.cityId;
            } else if ($scope.provinceId != undefined) {
                params.areaId = $scope.provinceId;
            } else if ($scope.provinceId == undefined) {
                $win.alert('请先选择省份');
                return false;
            }
        }
        $restClient.post('seller/correctionRange/save', null, params, function (data) {
            data.data && $modalInstance.close();
            $win.alert({
                type: "success",
                content: '保存成功'//内容
            });
        });
    }
}]);