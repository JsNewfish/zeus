/**
 * Created by Jin on 2016/6/6.
 */

app.controller('updateSysTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state) {

    var initDefault = function () {
        var defaultCell = {
            companyId: 0,
            entryContent: "收货人-姓名",
            fontBold: "normal",
            fontItalic: "normal",
            fontSize: "12px",
            fontType: "SimSun",
            templateId: $scope.data.sysTemplate.id,
            textAlign: "center",
            textUnderline: "initial",
            xPosition: 0,
            yPosition: 0
        };
        $scope.conStyle = {
            width: transformPx($scope.data.sysTemplate.width),
            height: transformPx($scope.data.sysTemplate.height)
        };
        return defaultCell;
    };


    function serverToClient(data) {
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
                if(userTemplateCell.imgUrl){
                    userTemplateCell.width =  $('.'+userTemplateCell.entryCode).width();
                    userTemplateCell.height =  $('.'+userTemplateCell.entryCode).height();
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
        return Math.round(data * 3.78)*1.09 + 'px';
    }


    function getData() {
        var id = $location.search().id;
        var deferred = $q.defer();
        $restClient.get('seller/sysTemplate/updateForm', {id:id}, function (data) {
            $scope.data = serverToClient(angular.copy(data.data));
            $scope.templateEntryList = angular.copy($scope.data.templateEntryList);
            $scope.userTemplateCell = angular.copy($scope.data.userTemplateCell);
            deferred.resolve();
        });
        return deferred.promise;
    }


    function init() {
        getData().then(initDefault);
    }

    init();

    $scope.add = function (entry) {
        var newCell = angular.copy(initDefault());

        newCell.entryCode = entry.code;
        newCell.replaceCode = entry.replaceCode;
        newCell.entryContent = entry.name;
        newCell.templateEntryId = entry.id;
        if (newCell.entryCode == 'custom_text') {   //自定义文字
            var modal = $win.prompt({
                windowTitle: '自定义打印文字',
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
        }else if (newCell.entryCode == "bar_code_qr_out_sid") { //运单号二维码生成

            newCell.imgUrl = 'images/common/bar-code-qr.png';
            $scope.data.userTemplateCell.push(newCell);
        } else if (newCell.entryCode == "bar_code_128_out_sid") { //运单号条形码横版生成

            newCell.imgUrl = 'images/common/bar-code-123.png';
            $scope.data.userTemplateCell.push(newCell);
        }else if (newCell.entryCode == "bar_code_128_tid") {    //订单编号条形码横版生成

            newCell.imgUrl = 'images/common/bar-code-123.png';
            $scope.data.userTemplateCell.push(newCell);
        }else if (newCell.entryCode == "bar_code_rotate90_128_out_sid") { //运单号条形码竖版生成

            newCell.imgUrl = 'images/common/bar-code-rotate90.png';
            $scope.data.userTemplateCell.push(newCell);
        }else {
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
        var sysTemplate = $scope.data.sysTemplate;
        sysTemplate.userTemplateCellList = $scope.data.userTemplateCell;
        $restClient.put('seller/sysTemplate/save', null, clientToServer(sysTemplate), function (data) {
            data.data && $win.alert({
                type: "success",
                content: '保存成功'
            });
        });
    };

    $scope.getBack = function () {
        window.history.back(-1);
    };

}]);
