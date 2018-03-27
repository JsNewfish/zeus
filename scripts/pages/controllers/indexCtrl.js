'use strict';
app.controller("indexCtrl", ["$scope", "$modal", "$restClient", "$location", "$q", "$win",
    function ($scope, $modal, $restClient, $location, $q, $win) {
    	init();
        function init(){
            setTimeout(function(){
                $("#qrCodePic").css({"position":"fixed","bottom":"50px","left":"50px"});
            },100);
            $(window).scroll(function() {
                var totalheight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
                var documentheight = parseFloat($(document).height());
                if (documentheight - totalheight > 200){
                    $("#qrCodePic").css({"position":"fixed","bottom":"50px","left":"50px"});
                }else{
                    $("#qrCodePic").css({"position":"","bottom":"","left":""});
                }
            });
        }
        $(window).load(function(){
             //检查控件是否安装
            //dpPrintLib.checkIsLibInstalled();

        })
        

    }
]);




