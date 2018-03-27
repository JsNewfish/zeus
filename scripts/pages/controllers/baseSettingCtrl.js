/**
 * Created by Jin on 2016/5/30.
 */
app.controller('baseSettingCtrl', ['$scope', '$restClient', '$win', '$q', '$calculate', function ($scope, $restClient, $win, $q, $calculate) {
    function getData() {
        var deferred = $q.defer();
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            console.log(data);
            $scope.entity = serverToClient(data.data);
            deferred.resolve();
        });
        return deferred.promise;
    }

    var defaultData = {
        isAutoMerge: {
            key: 'isAutoMerge',
            edit: false,
            text: ['已关闭', '已开启'],
            value: 1
        },
        isCheckMorePrint: {
            key: 'isCheckMorePrint',
            edit: false,
            text: ['已关闭', '已开启'],
            value: 1
        },
        paperPrintNum: {
            key: 'paperPrintNum',
            edit: false,
            value: 2
        },
        expressBillDirection: {
            key: 'expressBillDirection',
            edit: false,
            text: ['自动(打印机默认)', '纵向(高度和宽度都固定)', '横向(高度和宽度都固定)', '纵向(高度自适应)'],
            value: 0
        },
        deliveryBillDirection: {
            key: 'deliveryBillDirection',
            edit: false,
            text: ['自动(打印机默认)', '纵向(高度和宽度都固定)', '横向(高度和宽度都固定)', '纵向(高度自适应)'],
            value: 0
        },
        printType: {
            key: 'printType',
            edit: false,
            text: ['单打模式', '连打模式', '流程模式'],
            value: 2
        },
        itemSequence: {
            key: 'itemSequence',
            edit: false,
            text: ['与淘宝一致', '按商家编码排序'],
            value: 0
        },
        printSerial: {
            key: 'printSerial',
            edit: false,
            text: ['日流水-每日零点重新计算流水号', '月流水-每月1日零点重新计算流水号', '年流水-每年1月1日零点重新计算流水号'],
            value: 0
        },
        serialCode: {
            key: 'serialCode',
            edit: false,
            text: '流水号中用户代码'
        },
        packingWeightType: {
            key: 'packingWeightType',
            edit: false,
            text: ['比例包装重量', '固定包装重量'],
            value: 0
        },
        packingWeightRatio: {
            key: 'packingWeightRatio',
            text: '包装重量比例',
            value: 10
        },
        packingWeightFixed: {
            key: 'packingWeightFixed',
            text: '包装固定重量',
            value: 20
        },
        isExpressPartition: {
            key: 'isExpressPartition',
            edit: false,
            text: ['不开启', '开启'],
            value: 0
        },
        isHelpTip: {
            key: 'isHelpTip',
            edit: false,
            text: ['提示', '不提示'],
            value: 1
        },
        isShowAfterPrint: {
            key: 'isShowAfterPrint',
            edit: false,
            text: ['已关闭', '已开启'],
            value: 1
        }
    };

    function assignData() {
        if ($scope.entity) {
            var i;
            for (i in defaultData) {
                if ($scope.entity[i] != undefined) {
                    defaultData[i].value = $scope.entity[i];
                }
            }
        }
        $scope.condition = angular.copy(defaultData);
    }

    function init() {
        var deferred = $q.defer(),
            promise = deferred.promise;
        promise.then(getData).then(assignData);
        getUserSerialCode();
        deferred.resolve();
    }

    init();
    //获取订单流水号
    function getUserSerialCode(){
        $restClient.post('seller/baseSetting/getUserSerialCode',null,null,function(data){
            console.log(data.data);
            $scope.userSerialCode = data.data;
        })
    }

    function clientToServer(entity) {
        entity.packingWeightRatio != undefined && (entity.packingWeightRatio = $calculate.floatMul(entity.packingWeightRatio, 100));
        entity.packingWeightFixed != undefined && (entity.packingWeightFixed = $calculate.floatMul(entity.packingWeightFixed, 100));
        return entity;
    }

    function serverToClient(entity) {
        entity.packingWeightRatio != undefined && (entity.packingWeightRatio = $calculate.floatDiv(entity.packingWeightRatio, 100));
        entity.packingWeightFixed != undefined && (entity.packingWeightFixed = $calculate.floatDiv(entity.packingWeightFixed, 100));
        return entity;
    }

    $scope.edit = function (condition) {
        condition.edit = !condition.edit;

    };
    $scope.cancel = function (condition) {
        condition.edit = !condition.edit;
        condition.value = angular.copy(defaultData[condition.key].value);
    };
    $scope.save = function (condition) {
        var action = {
            successCallback: function (data) {
                if (data.data) {
                    defaultData = $scope.condition;
                    condition.edit = !condition.edit;
                }
            },
            failCallback: function (data) {
                $win.alert({
                    type: "danger",
                    content: data.resultMessage//内容
                });
            }
        };
        var postEntity = {
            id: $scope.entity.id
        };
        //当保存包装材料设置时
        if (condition.key == "packingWeightType") {
            if (condition.value) {
                postEntity.packingWeightFixed = $scope.condition.packingWeightFixed.value;
            } else {
                postEntity.packingWeightRatio = $scope.condition.packingWeightRatio.value;
            }
        }
        postEntity[condition.key] = condition.value;

        $restClient.put('seller/baseSetting/update', null, clientToServer(postEntity), action);
    }
}]);