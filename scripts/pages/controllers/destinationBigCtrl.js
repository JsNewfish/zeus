app.controller('destinationBigCtrl', ['$scope', '$modal', '$restClient', '$win','$q', function ($scope, $modal, $restClient, $win,$q) {
    function getProvince() {
        var defer = $q.defer();

        $restClient.post('seller/area/listByParentId', null, {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            $scope.areaId = $scope.province[0].id;
            defer.resolve();
        });

        return defer.promise;
    }
    function getCorrectionRange(){
        var defer = $q.defer();
        $restClient.get('seller/correctionRange', null, function (data) {
            //console.log(data);
            $scope.expressCo = data.data;
            $scope.express = $scope.expressCo[0];
            defer.resolve();
        });
        return defer.promise;
    }

    function restData() {
        $scope.TerminiIdsArray = [];           //已选择的目的地
        $scope.checkAll = false;                //全选
    }

    function init() {
        getProvince().then(getCorrectionRange).then($scope.search);

        $scope.areaId = '';                     //收货省份
        $scope.express = {                      //快递公司
            expressId: ''
        };
        $scope.noData = true;                  //没有搜索结果
        restData();
    }

    $scope.search = function () {

        var postEntity = {};

        postEntity.expressId = $scope.express == null ? '' : $scope.express.expressId;
        postEntity.areaId = $scope.areaId == null ? '' : $scope.areaId;

        $scope.loading = $restClient.postFormData('seller/terminiBigChar/list', postEntity, function (data) {
            $scope.TerminiBigChars = data.data;
            console.log(data);
            if (data.data.length != 0) {
                $scope.expressName = $scope.express.name;
                $scope.noData = false;
            } else {
                $scope.noData = true;
            }
        });

    };

    $scope.revert = function () {
        if ($scope.TerminiIdsArray.length == 0) {
            $win.alert('请先选择需要批量操作的地区');
            return false;
        }
        var ids = $scope.TerminiIdsArray.join(",");
        $restClient.postFormData('seller/terminiBigChar/revert', {ids: ids}, function (data) {
            //console.log(data);
            if (data.data) {
                $scope.search();
                restData();
            }

        });
    };

    $scope.selectAll = function () {
        $scope.checkAll = !$scope.checkAll;
        if($scope.checkAll) {
            angular.forEach($scope.TerminiBigChars, function (item) {
                if(!item.selected){
                    item.selected = true;
                    $scope.TerminiIdsArray.push(item.id)
                }
            });
        }else{
            angular.forEach($scope.TerminiBigChars, function (item) {
                if(item.selected){
                    item.selected = false;
                }
            });
            $scope.TerminiIdsArray =[];
        }
       // console.log($scope.TerminiIdsArray);
    };

    $scope.selectItem = function (TerminiBigChar) {
        TerminiBigChar.selected = !TerminiBigChar.selected;
        if (TerminiBigChar.selected) {
            $scope.TerminiIdsArray.push(TerminiBigChar.id);
        } else {
            var index = $scope.TerminiIdsArray.indexOf(TerminiBigChar.id);
            $scope.TerminiIdsArray.splice(index, 1);
            $scope.checkAll =false;
        }
        //console.log($scope.TerminiIdsArray);
    };

    $scope.editDestinationBig = function (TerminiBigChar) {
        if ((!TerminiBigChar) && $scope.TerminiIdsArray.length == 0) {
            $win.alert('请先选择需要批量操作的地区');
            return false;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/editDestinationBig.html",
            controller: "editDestinationBig",
            resolve: {
                data: function () {
                    return TerminiBigChar ? angular.copy(TerminiBigChar) : $scope.TerminiIdsArray;
                },
                expressName: function () {
                    return $scope.expressName;
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.search();
            restData();
        });
    };

    init();
}]);
app.controller('editDestinationBig', ['$scope', '$modalInstance', '$modal', 'data', 'expressName', '$restClient', function ($scope, $modalInstance, $modal, data, expressName, $restClient) {
    function init() {
        $scope.expressName = expressName;
        var batch = $scope.batch = (data instanceof Array);
        if (batch) {
            $scope.areaString = '共选择了' + data.length + '个';
            $scope.data = {};
            $scope.data.bigChar = '';
        } else {
            $scope.areaString = data.areaString.split(',')[0].split('_')[2];
            $scope.data = data;
        }
    }

    init();


    //console.log(data);

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        function update() {
            var params = {
                bigChar: $scope.data.bigChar,
                id: $scope.data.id
            };

            $restClient.postFormData('seller/terminiBigChar/update', params, function (data) {
                //console.log(data);
                data.data && $modalInstance.close();
            });
        }

        function updateBatch() {
            var params = {
                bigChar: $scope.data.bigChar,
                ids: data
            };

            $restClient.postFormData('seller/terminiBigChar/updateBatch', params, function (data) {
                //console.log(data);
                data.data && $modalInstance.close();
            });
        }

        $scope.batch ? updateBatch() : update();

    };

}]);