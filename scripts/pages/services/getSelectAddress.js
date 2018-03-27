/**
 * Created by Jin on 2016/8/16.
 */
/**
 * 区域层级选择*/
app.factory('$dpAddress', ['$restClient', '$q', '$rootScope', function ($restClient, $q, $rootScope) {

    function watchProvince($scope) {
        $scope.$watch('receiverState', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.provinceList, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code, $scope).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity($scope) {
        $scope.$watch('receiverCity', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.cityList, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCountry(item.code,$scope);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince($scope) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: 1}, function (data) {
            console.log(data);
            $scope.provinceList = data.data;
            deferred.resolve($scope);
        });
        return promise;
    }

    function getCity(code, $scope) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            console.log(data);
            $scope.cityList = data.data;
            deferred.resolve($scope);
        });
        return promise;
    }

    function getCountry(code,$scope) {
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            $scope.countryList = data.data;
        });
    }

    return {
        getSelectAddress: function (scope) {

            getProvince(scope).then(watchProvince);

        }
    }
}]);