/**
 * Created by Jin on 2016/6/6.
 */

app.controller('editExpressTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state) {

    var initDefault = function () {
        var defaultCell = {
            companyId: $scope.data.userExpress.companyId,
            entryContent: "收货人-姓名",
            fontBold: "normal",
            fontItalic: "normal",
            fontSize: "12px",
            fontType: "SimSun",
            templateId: $scope.data.userExpressTemplate.id,
            textAlign: "left",
            textUnderline: "initial",
            xPosition: 0,
            yPosition: 0
        };
       /* $scope.validateOptions =*/
        $scope.conStyle = {
            width: transformPx($scope.data.userExpressTemplate.width),
            height: transformPxH($scope.data.userExpressTemplate.height)
        };
        return defaultCell;
    };

    $scope.$watch('data.userExpressTemplate.width', function (newValue, oldValue) {
        if (newValue != oldValue)
            $scope.conStyle.width = transformPx(newValue);
    });

    $scope.$watch('data.userExpressTemplate.height', function (newValue, oldValue) {
        if (newValue != oldValue)
            $scope.conStyle.height = transformPxH(newValue);
    });

    function serverToClient(data) {
        data.userExpressTemplate.width = parseInt(data.userExpressTemplate.width);
        data.userExpressTemplate.height = parseInt(data.userExpressTemplate.height);

        if (data.userTemplateCell) {
            angular.forEach(data.userTemplateCell, function (userTemplateCell) {
                userTemplateCell.fontSize = userTemplateCell.fontSize + 'px';
                userTemplateCell.height = userTemplateCell.height + 'px';
                userTemplateCell.width = userTemplateCell.width + 'px';
                userTemplateCell.xPosition = userTemplateCell.xPosition + 'px';
                userTemplateCell.yPosition = userTemplateCell.yPosition + 'px';

            });
        }
        return data
    }

    function clientToServer(data) {

        if (data.userTemplateCellList) {
            angular.forEach(data.userTemplateCellList, function (userTemplateCell) {
                if (userTemplateCell.imgUrl) {
                    userTemplateCell.width = $('.' + userTemplateCell.entryCode).width();
                    userTemplateCell.height = $('.' + userTemplateCell.entryCode).height();
                }
                userTemplateCell.fontSize = parseInt(userTemplateCell.fontSize);
                userTemplateCell.height = parseInt(userTemplateCell.height);
                userTemplateCell.width = parseInt(userTemplateCell.width);
                userTemplateCell.xPosition = parseInt(userTemplateCell.xPosition);
                userTemplateCell.yPosition = parseInt(userTemplateCell.yPosition);

            });
        }
        return data
    }

    function transformPx(data) {
        /*return Math.round(data * 10) / 2.64 + 'px';*/
        return Math.round(data * 3.788) + 'px';
    }

    function transformPxH(data) {
        /*return Math.round(data * 10) / 2.66 + 'px';*/
        return Math.round(data * 3.788) + 'px';
    }


    function getData(express) {
        var deferred = $q.defer();
        $restClient.postFormData('seller/userExpressTemplate/form', express, function (data) {
            console.log(data);
            $scope.userExpress = data.data.userExpress;
            $scope.data = serverToClient(angular.copy(data.data));
            $scope.templateEntryList = angular.copy($scope.data.templateEntryList);
            $scope.userTemplateCell = angular.copy($scope.data.userTemplateCell);
            deferred.resolve();
        });
        return deferred.promise;
    }

    var express = {
        userExpressId: $location.search().userExpressId,
        templateId: $location.search().templateId
    };

    function init(express) {

        getData(express).then(initDefault);
        $(".entry-box").draggable({'handle': '.draggable'});
    }

    init(express);

    $scope.decreaseY = function () {
        $scope.data.userExpressTemplate.calibrationY--;

    };

    $scope.increaseY = function () {
        $scope.data.userExpressTemplate.calibrationY++;
    };

    $scope.decreaseX = function () {
        $scope.data.userExpressTemplate.calibrationX--;
    };

    $scope.increaseX = function () {
        $scope.data.userExpressTemplate.calibrationX++;
    };

    $scope.add = function (entry) {
        var newCell = angular.copy(initDefault());

        newCell.entryCode = entry.code;
        newCell.replaceCode = entry.replaceCode;
        newCell.entryContent = entry.name;
        newCell.templateEntryId = entry.id;
        newCell.width=entry.width;
        newCell.height = entry.height;
        if (newCell.entryCode == 'custom_text') {   //自定义文字
            var modal = $win.prompt({
                windowTitle: '自定义打印文字',
                templateBody: '  <div class="form-group">' +
                '   <div class="col-xs-12">' +
                '    <textarea class="form-control" placeholder="{{data.placeholder}}" ng-model="data.value" cols="30" rows="5" ></textarea>' +
                '   </div>' +
                '  </div>',
                placeholder: '请在这里输入您想要打印的文字内容'
            });
            modal.result.then(function (data) {
                console.log(data);
                newCell.entryContent = data;
                $scope.data.userTemplateCell.push(newCell);
            });

        } else if (newCell.entryCode == "bar_code_qr") { //二维码生成
            var modal = $win.prompt({
                windowTitle: '二维码生成',
                placeholder: '请在这里输入您想在二维码中包含的店铺网址'
            });
            modal.result.then(function (data) {
                console.log(data);
                newCell.entryContent = data;
                newCell.imgUrl = 'images/common/bar-code-qr.png';
                $scope.data.userTemplateCell.push(newCell);
            });
        } else if (newCell.entryCode == "custom_image") { //图片
            var modal = $win.prompt({
                windowTitle: '自定义打印图片',
                placeholder: '请在这里输入您想要打印图片的URL地址（强烈建议将图片存储在淘宝图片空间）'
            });
            modal.result.then(function (data) {
                console.log(data);
                newCell.entryContent = data;
                newCell.imgUrl = data;
                $scope.data.userTemplateCell.push(newCell);
            });
        } else if (newCell.entryCode == "bar_code_qr_out_sid") { //运单号二维码生成

            newCell.imgUrl = 'images/common/bar-code-qr.png';
            $scope.data.userTemplateCell.push(newCell);
        } else if (newCell.entryCode == "bar_code_128_out_sid") { //运单号条形码横版生成

            newCell.imgUrl = 'images/common/bar-code-123.png';
            $scope.data.userTemplateCell.push(newCell);
        } else if (newCell.entryCode == "bar_code_128_tid") {    //订单编号条形码横版生成

            newCell.imgUrl = 'images/common/bar-code-123.png';
            $scope.data.userTemplateCell.push(newCell);
        } else if (newCell.entryCode == "bar_code_rotate90_128_out_sid") { //运单号条形码竖版生成

            newCell.imgUrl = 'images/common/bar-code-rotate90.png';
            $scope.data.userTemplateCell.push(newCell);
        } else {
            newCell.width = entry.width;
            newCell.height = entry.height;
            $scope.data.userTemplateCell.push(newCell);
        }

    };

    $scope.delete = function (entry) {
        var index = $scope.data.userTemplateCell.indexOf(entry);
        $scope.data.userTemplateCell.splice(index, 1);
    };

    $scope.save = function () {
        var userExpressTemplate = $scope.data.userExpressTemplate;
        userExpressTemplate.userTemplateCellList = $scope.data.userTemplateCell;

        $restClient.post('seller/userExpressTemplate/update', null, clientToServer(userExpressTemplate), function (data) {
            data.data && $win.alert({
                type: "success",
                content: '保存成功'//内容
            });

        });
    };
    //修改背景图片
    $scope.modifyBgImg = function (userExpress) {
        function openModal(temp, size, Obj, userExpress) {
            var modalInstance = $modal.open({
                templateUrl: "views/pages/" + temp + ".html",
                controller: temp + "Ctrl",
                size: size,
                resolve: {
                    expressList: function () {
                        return angular.copy(Obj);
                    },
                    userExpress: function () {
                        return angular.copy(userExpress);
                    }
                }
            });
            return modalInstance;
        }


        $restClient.post('seller/userExpressTemplate/saveAsForm', null, null, function (data) {

            if (data.data) var modal = openModal('modifyBgImg', 'lg', data.data, userExpress);

            modal.result.then(function (data) {
                console.log(data);
                $scope.data.userExpressTemplate.bgImg = data.bgImg;

            });
        });


    };

    $scope.getBack = function () {
        window.history.back(-1);
    };

    //使用默认模板
    $scope.useDefaultTemplate = function (userExpress) {
        $restClient.post('seller/userExpressTemplate/restoreForm', {expressId: userExpress.expressId}, null, function (data) {
            if (data.data) openModal(data.data);
        });
        function openModal(data) {
            var modalInstance = $modal.open({
                templateUrl: 'views/pages/useDefaultTmpl.html',
                controller: 'useDefaultTmpl',
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (params) {
                $scope.loading = $restClient.post('seller/userExpressTemplate/restoreSure', params, null, function (data) {
                    $scope.data.userExpressTemplate.bgImg = data.data.sysTemplate.bgImg;
                    $scope.data.userExpressTemplate.height = data.data.sysTemplate.height;
                    $scope.data.userExpressTemplate.width = data.data.sysTemplate.width;
                    $scope.data.userTemplateCell = data.data.userTemplateCell;
                    $scope.data = serverToClient($scope.data);

                });
            });
        }
    };

    //另存为
    $scope.saveAs = function () {
        $restClient.post('seller/userExpressTemplate/saveAsForm', null, null, function (data) {
            // console.log(data);
            if (data.data) openModal(data.data);
        });
        function openModal(data) {
            var modalInstance = $modal.open({
                templateUrl: 'views/pages/saveAsTemplate.html',
                controller: 'saveAsTemplate',
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (data) {
                var params = data;
                params.templateId = $scope.data.userExpressTemplate.id;
                // console.log(params);
                $restClient.postFormData('seller/userExpressTemplate/saveAsSure', params, function (data) {
                    //    console.log(data);
                    var express = {
                        userExpressId: data.data.userExpressTemplate.userExpressId,
                        templateId: data.data.userExpressTemplate.id
                    };
                    init(express);
                });
            });
        }


    }


}])
;

app.controller('saveAsTemplate', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.data = data;
    $scope.save = function () {
        $modalInstance.close({
            newExpressId: $scope.express,
            newTemplateName: $scope.templateName
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    }
}]);
app.controller('useDefaultTmpl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.data = data;
    $scope.save = function () {
        $modalInstance.close({
            sysTemplateId: $scope.express
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    }
}]);
app.controller('modifyBgImgCtrl', ['$scope', '$modalInstance', 'expressList', 'userExpress', '$restClient', function ($scope, $modalInstance, expressList, userExpress, $restClient) {
    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.count = 0;

    $scope.userExpress = userExpress;
    $scope.expressList = expressList;
    $scope.$watch('expressId', function (newValue, oldValue) {
        getBgImg($scope.pageNo, $scope.pageSize, newValue);
    });
    $scope.expressId = userExpress.expressId;
    $scope.save = function (imgBlock) {
        $modalInstance.close(imgBlock);
    };



    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    function getBgImg(pageNo, pageSize, expressId) {
        $scope.loading = $restClient.post('seller/userExpressTemplate/imageForm', null, {
            expressId: expressId,
            pageSize: pageSize,
            pageNo: --pageNo
        }, function (data) {
            console.log(data);
            $scope.data = data.data;
            if($scope.data.length!= 0){
                $scope.pageNo = ++data.pageNo;
                $scope.pageSize = data.pageSize;
                $scope.count = data.count;
            }

        });
    }

}]);