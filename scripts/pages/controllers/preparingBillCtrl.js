app.controller('preparingBillCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', "$location",
    function ($scope, $modal, $restClient, $win, $q, $location) {

        function getData() {
            $scope.loading = $restClient.get('seller/preparingBill/list', null, function (data) {
                $scope.PreparingBillDtoList = data.data;
            });
        }

        function init() {
            getData();
        }

        init();


        $scope.log = function (preparingBill) {
            var modalInstance = $modal.open({
                templateUrl: "views/components/preparingBillLog.html",
                controller: "preparingBillLogCtrl",
                resolve: {
                    data: function () {
                        return angular.copy(preparingBill);
                    }
                }
            });
            modalInstance.result.then(function () {

            })
        };
        $scope.detail = function (preparingBill) {
            $location.url('/print/preparingBillDetail?preparingBillId='+preparingBill.preparingBillId);
        };
        $scope.export = function (preparingBill) {
            var form = $("<form>");   //定义一个form表单
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('target', '_black');
            form.attr('method', 'get');
            form.attr('action', "/seller/preparingBill/export");

            var input1 = $('<input>');
            input1.attr('name', 'preparingBillId');
            input1.attr('value', preparingBill.preparingBillId);
            input1.attr('type', 'hidden');
            $('body').append(form);  //将表单放置在web中
            form.append(input1);   //将查询参数控件提交到表单上
            form.submit();
        };
    }]);

app.controller('preparingBillLogCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, preparingBill, $restClient) {

    function getData() {
        $restClient.get('seller/preparingBill/log', {preparingBillId: preparingBill.preparingBillId}, function (data) {
            $scope.PreparingBillLogList = data.data;
        });
    }

    function init() {
        getData();
    }

    init();

    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);