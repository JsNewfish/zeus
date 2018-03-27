app.controller("testCtrl", ["$scope", "$modal","$win" ,function ($scope, $modal,$win) {
    $scope.alertClick=function(){
        $win.dpAlert({
            content:"新弹出框 测试",
            type:"info",
            size:"lg",
            autoClose:true,
            duration:300
        });

        //$win.dpAlert("弹出框测试")
    }
}]);







