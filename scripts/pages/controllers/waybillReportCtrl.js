/**
 * Created by Jin on 2016/11/29.
 */
app.controller('waybillReportCtrl',['$scope',"$win",'$restClient','$q','$location',function($scope,$win,$restClient,$q,$location){
    function init(){
        //分页相关
        $scope.pageNo = 1;
        $scope.message = '加载数据中。。';
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.isRecycle = $location.search().isRecycle;
        setTime();
        getCompany();
        getProvince().then(watchProvince);
        searchData($scope.pageNo,$scope.pageSize);

    }

    function setTime() {
        $scope.startTime = moment(moment().add(-30, 'days').format('YYYY-MM-DD') + " 23:59:59")._d;
        $scope.endTime = moment(moment().format('YYYY-MM-DD') + " 23:59:59")._d;
    }

    function getProvince() {
        var defer = $q.defer();

        $restClient.post('seller/area/listByParentId', null, {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            defer.resolve();
        });

        return defer.promise;
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


    function watchProvince() {
        $scope.$watch('recipientProvince', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
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
    $scope.reset = function(){
        $scope.startTime = '';
        $scope.endTime = '';
        $scope.tid = null;
        $scope.expressNo = null;
        $scope.expressCode = null;
        $scope.isRecycle = 0 ;
        $scope.deduplication = 0;
        $scope.recipientProvince = null;
        $scope.recipientCity = null;
    };
    function searchData(page, pageSize){
        var waybillSearchModel = {
            startTime:$scope.startTime && moment($scope.startTime).format("YYYY/MM/DD HH:mm:ss"),
            endTime:$scope.endTime && moment($scope.endTime).format("YYYY/MM/DD HH:mm:ss"),
            tid:$scope.tid,
            expressNo:$scope.expressNo,
            expressCode:$scope.expressCode,
            recipientProvince:$scope.recipientProvince,
            recipientCity:$scope.recipientCity,
            isRecycle:$scope.isRecycle,
            deduplication:$scope.deduplication,
            pageSize: pageSize,
            pageNo: --page
        };
        $scope.loading = $restClient.post('seller/waybill/search',null,waybillSearchModel,function(data){
            console.log(data.data);
            $scope.usedWaybillList = data.data;
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
        })
    }
    $scope.searchData = searchData;

    $scope.exportData = function() {
        var obj = {
            startTime:$scope.startTime && moment($scope.startTime).format("YYYY-MM-DD HH:mm:ss"),
            endTime:$scope.endTime && moment($scope.endTime).format("YYYY-MM-DD HH:mm:ss"),
            tid:$scope.tid,
            expressNo:$scope.expressNo,
            expressCode:$scope.expressCode,
            recipientProvince:$scope.recipientProvince,
            recipientCity:$scope.recipientCity,
            isRecycle:$scope.isRecycle,
        };

        if (!obj.startTime || !obj.endTime) {
            $win.alert("打印日期开始时间和结束时间不能为空");
            return;
        }
        if(moment($scope.endTime).diff(moment($scope.startTime), 'days') > 30){
            $win.alert("一次最多只能导出30天的数据");
            return;
        }

        var form = $("<form>");   //定义一个form表单
        form.attr('style', 'display:none');   //在form表单中添加查询参数
        form.attr('target', '_black');
        form.attr('method', 'get');
        form.attr('action', "//print.cuxiao.quannengzhanggui.net/seller/waybill/export");
        $('body').append(form);

        var parameter = [{
            name: "startTime",
            value: obj.startTime,
            type: "hidden"
        }, {
            name: "endTime",
            value: obj.endTime,
            type: "hidden"
        }, {
            name: "tid",
            value: obj.tid,
            type: "hidden"
        }, {
            name: "expressNo",
            value: obj.expressNo,
            type: "hidden"
        }, {
            name: "expressCode",
            value: obj.expressCode,
            type: "hidden"
        }, {
            name: "recipientProvince",
            value: obj.recipientProvince ? encodeURI(obj.recipientProvince) : null,
            type: "hidden"
        }, {
            name: "recipientCity",
            value: obj.recipientCity ? encodeURI(obj.recipientCity) : null,
            type: "hidden"
        }, {
            name: "isRecycle",
            value: obj.isRecycle,
            type: "hidden"
        }];
        angular.forEach(parameter, function (item) {
            var input = $('<input>');
            input.attr('name', item.name);
            input.attr('value', item.value);
            if (item.type) {
                input.attr('type', item.type);
            }
            form.append(input);
        });
        form.submit();
    }

}]);