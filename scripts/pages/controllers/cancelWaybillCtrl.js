/**
 * Created by Jin on 2016/12/3.
 */
app.controller('cancelWaybillCtrl',['$scope','$restClient','$q','$win','$location',function($scope,$restClient,$q,$win,$location){
    function init(){
        //分页相关
        getCompany();

        $scope.errorMes = '';
    }


    //物流公司
    function getCompany(){
        var defer = $q.defer();
        $restClient.get('seller/correctionRange', null, function (data) {
            console.log(data);
            $scope.expressCo = data.data;
            defer.resolve();
        });
        return defer.promise;
    }

    init();

    $scope.cancel = function (){
        var waybillSearchModel = {
            expressCode:$scope.expressCode,
            expressNo:$scope.waybill
        };
        $scope.loading = $restClient.post('seller/waybill/cancel',null,waybillSearchModel,function(data){
            console.log(data.data);
            if(data.data.isSuccess){
                $win.alert({
                    type:'success',
                    content:'回收成功，请至电子面单记录中查看最终状态！'
                })
            }else{
                $scope.errorMes = data.data.errorMessage;
            }
        })
    };

    $scope.showLog = function(){

        $location.url('/print/waybillReport?isRecycle=1');
    }

}]);