'use strict';
//公共库模板路径
var COMMON_SOURCE_PATH = "";
//复制控件flash路径
ZeroClipboard.moviePath = "./images/ZeroClipboard.swf";
//应用根节点
var ROOT_PATH = "";
//应用
var app = angular.module('app', [
    "ng.ui",
    "dp.ui",
    "templates",
    "ui.bootstrap.collapse"
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', 'print/unprintedExpress');
    $stateProvider.state('print', {
        url: '/print/unprintedExpress',
        templateUrl: 'views/pages/unprintedExpress.html'
    }).state('normal', {
        url: '/:module/:sub',
        templateUrl: function (params) {
            return 'views/pages/' + params.sub + '.html'
        }
    }).state('normal.sub', {
        url: '/:view',
        templateUrl: function (params) {
            return 'views/pages/' + params.view + '.html'
        }
    });

});

//验证
app.config(function (w5cValidatorProvider) {
    //验证配置
    w5cValidatorProvider.config({
        blurTrig: false,
        showError: true,
        removeError: true

    });
    w5cValidatorProvider.setRules({
        authCode: {
            customizer: "验证码填写错误",
            customizer2:"验证码填写错误"
        },
        phoneHead: {
            maxlength: "区号长度不能大于{maxlength}"
        },
        phoneBody: {
            maxlength: "电话号长度不能大于{maxlength}"
        },
        phoneEnd: {
            maxlength: "分机号长度不能大于{maxlength}"
        },
        email: {
            required: "输入的邮箱地址不能为空",
            email: "输入邮箱地址格式不正确"
        },
        username: {
            required: "不能为空",
            pattern: "必须输入字母、数字、下划线,以字母开头",
            w5cuniquecheck: "输入已经存在，请重新输入"
        },
        common: {
            required: "内容不能为空"
        },
        password: {
            required: "密码不能为空",
            minlength: "密码长度不能小于{minlength}",
            maxlength: "密码长度不能大于{maxlength}"
        },
        address: {
            required: "地址不能为空"
        },
        repeatPassword: {
            required: "重复密码不能为空",
            repeat: "两次密码输入不一致"
        },
        number: {
            required: "数字不能为空"
        },
        receiver_mobile: {
            customizer: "手机号和电话号码必须有一个不为空"
        },
        receiver_phone: {
            customizer: "手机号和电话号码必须有一个不为空"
        },
        dynamicName: {
            required: "动态Name不能为空"
        },
        dynamic: {
            required: "动态元素不能为空"
        },
        phoneNum:{
            customizer:"手机号不符合规则"
        },
        checkCode:{
            customizer:"验证码错误"
        }
    });
});


app.directive("dpFilterBar", function () {
    return {
        restrict: "EA",
        link: function (scope, element, attr) {
            var $filterBar = element,
                $btn = element.find(".btn-toggle"),
                $searchPane = element.find(".search-pane"),
                $operations = element.find(".operations");

            $btn.bind("click", function () {
                $btn.text($filterBar.hasClass("collapsed") ? "收起" : "展开");
                $filterBar.toggleClass("collapsed");
                $searchPane.toggleClass("clearfix");
                $operations.toggleClass("clearfix");
            });
        }
    }
});



