/**
 * Created by Jin on 2016/8/13.
 */
app.factory('$modifyTemplate', ['$modal', '$restClient', '$win', '$location', '$window', function ($modal, $restClient, $win, $location, $window) {
    //更新云模板
    function updateCloudTemplate(getData) {
        $restClient.post('seller/userExpressTemplate/sync', null, null, function (data) {
            if (data.data) {
                getData();
                $win.alert('模板更新成功');
            }
        })
    }

    return {
        //添加快递模板
        addExpressTemplate: function (callbackFunc) {
            var modalInstance = $modal.open({
                templateUrl: "views/pages/addExpressTemplate.html",
                controller: "addExpressTemplateCtrl",
                size: 'lg'
            });
            modalInstance.result.then(function () {
                callbackFunc();
            });
        },
        edit: function (userExpressTemplate) {
            //页面跳转
            $location.url('/print/editExpressTemplate?templateId=' + userExpressTemplate.id + "&userExpressId=" + userExpressTemplate.userExpressId);
        },
        deleteTemp: function (userExpressTemplate, callbackFunc) {
            if (userExpressTemplate.isDefault) {
                $win.confirm({
                    img: "images/components/alert/alert-forbid.png",
                    title: "默认模板无法删除！",
                    content: "当前模板为默认模板，若要删除请将其设置为未默认后再对其删除",
                    closeText: "修改模板",//确认按钮文本
                    cancelText: "关闭",
                    showClose: true,//显示确认按钮
                    showCancel: true,
                    size: "lg",
                    redirect: "//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/userExpress"
                });
                return false;
            }
            var remind = $win.confirm({
                img: "images/components/alert/alert-delete.png",
                title: "你确定要删除此模板吗？",
                content: "确定删除后系统会将此模板从快递单模板中一同被删除请谨慎操作！"
            });
            remind.result.then(function () {
                var params = {
                    id: userExpressTemplate.id
                };
                $restClient.deletes('seller/userExpressTemplate/delete', params, function (data) {
                    callbackFunc();
                });
            });
        },

        //添加云打印模板
        addCloudTemplate: function (getData) {
            var mes = {
                title: '您是否已添加了菜鸟电子面单？',
                content: '请至官方菜鸟平台添加菜鸟云模板，如需帮助可点击<a class="text-primary" href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/help/helpView?id=103" target="_blank">【查看帮助】</a>。' +
                '添加完成后，点击下面的【我已添加】进行确认<br><a class="text-primary" href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/help/helpView?id=103" target="_blank">如何添加菜鸟电子面单？</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                closeText: '我已添加',
                cancelText: '取消',
                showClose: true,
                showCancel: true
            };

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                updateCloudTemplate(getData);
            });

            $window.open('http://cloudprint.cainiao.com/cloudprint/login.htm?identity=seller&appKey=23090346');
        },
        deleteCloudTemplate: function (getData){
            var mes = {
                title: '您是否已在菜鸟云系统中删除了菜鸟云模板？',
                content: '受平台限制菜鸟云模板只能在菜鸟系统中删除。' +
                '删除完成后，点击下面的【我已删除】进行确认<br><a class="text-primary" href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/help/helpView?id=103" target="_blank">如何删除云模板？</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                closeText: '我已删除',
                cancelText: '取消',
                showClose: true,
                showCancel: true
            };

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                updateCloudTemplate(getData);
            });

            $window.open('http://cloudprint.cainiao.com/cloudprint/login.htm?identity=seller&appKey=23090346');
        },
        //更新云打印模板
        updateCloudTemplate: updateCloudTemplate,
        //编辑菜鸟云模板
        editCloud: function (getData) {
            var mes = {
                title: '该模版是在菜鸟云系统中创建的，需在菜鸟云系统中编辑',
                content: '如何编辑与修改菜鸟云模板？<a class="text-primary" target="_blank" href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/help/helpView?id=103">帮助</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                closeText: '前往菜鸟云编辑',
                redirect: '//cloudprint.cainiao.com/cloudprint/login.htm?identity=seller&appKey=23090346',
                cancelText: '取消',
                showClose: true,
                showCancel: true
            };
            var updateMes = {
                title: '修改了电子面单打印项，请点击更新模板',
                content: '若您在官方菜鸟平台修改了原快递模板的打印项，请点击【更新模板】。若更新后打印项并未生效，请查看<a class="text-primary" href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/help/helpView?id=112" target="_blank">编辑后未生效该怎么办？</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                closeText: '更新模板',
                cancelText: '取消',
                showClose: true,
                showCancel: true
            };
            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var updateRemind = $win.confirm(updateMes);
                updateRemind.result.then(function () {
                    updateCloudTemplate(getData);
                });
            });
        },
        //电子面单热敏设置
        setWaybill: function (userExpressTemplate) {
            var modalInstance = $modal.open({
                templateUrl: "views/pages/setWaybill.html",
                controller: "setWaybillCtrl",
                resolve: {
                    data: function () {
                        return userExpressTemplate
                    }
                }
            });
            modalInstance.result.then(function (templateData) {

                $restClient.post('seller/userExpressTemplate/update', null, templateData, function (data) {
                    data.data && $win.alert({
                        type: "success",
                        content: '保存成功'//内容
                    });
                    userExpressTemplate = templateData;
                    console.log(data.data);
                });

            });
        }

    }
}]);