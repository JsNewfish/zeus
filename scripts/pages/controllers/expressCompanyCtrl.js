/**
 * Created by Jin on 2016/7/26.
 */
app.controller('expressCompanyCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile','$location','$state', function ($scope, $modal, $restClient, $win, $q, $compile,$location,$state) {

    init();

    function init() {
        getData();
    }

    function getData() {
        $scope.loading = $restClient.get('seller/userExpress/list', null, function (data) {
            $scope.userExpressDtoList = data.data;
        });
    }

    //设置费率
    $scope.setRate = function (userExpress) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setRate.html",
            controller: "setRateCtrl",
            size: "lg",
            resolve: {
                data: function () {
                    return angular.copy(userExpress);
                }
            }
        });
        modalInstance.result.then(function (express) {
            express.faceCost = express.faceCost * 100;
            $restClient.post('seller/userExpress/faceCost', null, express, function (data) {
                init();
            })
        });
    };


    //设置识别词
    $scope.setKeyword = function (userExpress) {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/setKeyword.html",
            controller: "setKeywordCtrl",
            resolve: {
                data: function () {
                    return angular.copy(userExpress);
                }
            }
        });
        modalInstance.result.then(function (express) {
            $restClient.put('seller/userExpress/update', null, express, function (data) {
                init();
            })
        });
    };

}]);


app.controller('setRateCtrl', ['$scope', '$modalInstance','$restClient', 'data', function ($scope, $modalInstance,$restClient, data) {
    $scope.express = data;
    $scope.express.faceCost = $scope.express.faceCost/100;

    getDate();
    function serverToClient(data){
        angular.forEach(data,function(item){
            item.firstWeight = item.firstWeight/100;
            item.firstMoney = item.firstMoney/100;
            item.nextWeight = item.nextWeight/100;
            item.nextMoney = item.nextMoney/100;
        });
        return data;
    }
    function getDate(){
        $restClient.postFormData('seller/expressRate/list', {userExpressId:$scope.express.id}, function (data) {
            $scope.expressRateList=serverToClient(data.data);
            $scope.defaultExpressRate=$scope.expressRateList[0];
            $scope.provices = $scope.defaultExpressRate.provices;
            var index = $scope.expressRateList.indexOf($scope.defaultExpressRate);
            $scope.expressRateList.splice(index, 1);

        });
    }
    $scope.selectEdit = function (expressRate) {
        expressRate.edit = !expressRate.edit;
    }
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.express);
    }
    $scope.saveExpressRate = function (expressRate) {
        var expressRates=angular.copy(expressRate);
        expressRates.userExpressId=$scope.express.id;
        expressRates.firstWeight=expressRates.firstWeight*100;
        expressRates.firstMoney=expressRates.firstMoney*100;
        expressRates.nextWeight=expressRates.nextWeight*100;
        expressRates.nextMoney=expressRates.nextMoney*100;
        delete expressRates.edit;
        $restClient.post('seller/expressRate/save',null,expressRates, function (data) {
            getDate();
        });

    }
    $scope.addC=function(){
        var obj = {province:"",firstWeight:1,firstMoney:10,nextWeight:2,nextMoney:5,isDefault:0,edit:false};
        $scope.expressRateList.push(obj);
        $scope.selectEdit(obj);
    }

    $scope.delete=function(idx,expressRate){
        $scope.expressRateList.splice(idx,1);
        var params ={
            id:expressRate.id
        };
        if (null != expressRate.id){
            $restClient.deletes('seller/expressRate/delete', params, function (data) {
            });
        }
    }
}]);


app.controller('setKeywordCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.express = data;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.express);
    }
}]);