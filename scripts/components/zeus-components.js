/**
 * Created by Jin on 2016/8/10.
 */
app.directive('deliveryTemplate', [function () {
    return {
        restrict: 'AE',
        scope: {
            entity: "="
        },
        templateUrl: "views/components/printDeliveryTemplate.html",
        link: function ($scope, element, attrs, ctrl) {
            $scope.tableStyle = {
                fontFamily: '',
                fontSize: '',
                lineHeight: ''
            };
            function init() {

                $scope.entity = serverToClient($scope.entity);
            }

            init();

            $scope.$watch('entity', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    serverToClient(newValue);
                }
            }, true);

            function serverToClient(data) {
                //data.userDeliveryTemplate.width = transformMm(data.userDeliveryTemplate.width);
                //data.userDeliveryTemplate.height = transformMm(data.userDeliveryTemplate.height);
                $scope.tableStyle.fontFamily = data.userDeliveryTemplate.fontType;
                $scope.tableStyle.fontSize = data.userDeliveryTemplate.fontSize + 'px';
                $scope.tableStyle.lineHeight = data.userDeliveryTemplate.lineHeight + 'px';

                $scope.cellList = {};

                for (var i = 0; i < data.userTemplateCellList.length; i++) {
                    $scope.cellList[data.userTemplateCellList[i].entryCode] = data.userTemplateCellList[i];

                }
                $scope.noData = true;
                if(data.packageInfo) {
                    $scope.noData = false;
                    $scope.cellList.normalOrderList = [];
                    $scope.cellList.totalInfo = {};
                    $scope.cellList.totalInfo.num = 0;
                    $scope.cellList.totalInfo.totalPrice = 0;
                    $scope.cellList.totalInfo.postFee = 0;
                    $scope.cellList.totalInfo.totalFee = 0;
                    $scope.cellList.totalInfo.payment = 0;
                    if(data.packageInfo.normalTradeList){
                        angular.forEach(data.packageInfo.normalTradeList, function (normalTrade) {
                            $scope.cellList.normalOrderList = $scope.cellList.normalOrderList.concat(normalTrade.normalOrderList);
                            $scope.cellList.totalInfo.postFee = $scope.cellList.totalInfo.postFee + parseInt(normalTrade.postFee);
                            $scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + normalTrade.payment;
                        });

                        angular.forEach($scope.cellList.normalOrderList, function (normalOrder) {
                            $scope.cellList.totalInfo.num = $scope.cellList.totalInfo.num + parseInt(normalOrder.num);

                            $scope.cellList.totalInfo.totalPrice = $scope.cellList.totalInfo.totalPrice + normalOrder.num * normalOrder.price;
                        });

                    }
                    //自由打印
                    if(data.packageInfo.freeTradeList||data.packageInfo.freeOrderList){
                        if(data.packageInfo.freeTradeList) {
                            angular.forEach(data.packageInfo.freeTradeList, function (freeTrade) {
                                $scope.cellList.normalOrderList = $scope.cellList.normalOrderList.concat(freeTrade.freeOrderList);
                                $scope.cellList.totalInfo.postFee = $scope.cellList.totalInfo.postFee + parseInt(freeTrade.postFee*100);
                                $scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + freeTrade.payment;
                            });

                        }
                        if(data.packageInfo.freeOrderList){
                            $scope.cellList.normalOrderList = data.packageInfo.freeOrderList;
                        }
                        angular.forEach($scope.cellList.normalOrderList, function (normalOrder) {
                            if(normalOrder) {
                                $scope.cellList.totalInfo.num = $scope.cellList.totalInfo.num + parseInt(normalOrder.num);
                                //$scope.cellList.totalInfo.payment = $scope.cellList.totalInfo.payment + normalOrder.payment;
                                $scope.cellList.totalInfo.totalPrice = $scope.cellList.totalInfo.totalPrice +
                                    normalOrder.num * normalOrder.price;
                            }
                        });
                    }
                    $scope.cellList.totalInfo.totalFee = $scope.cellList.totalInfo.totalPrice - $scope.cellList.totalInfo.payment+$scope.cellList.totalInfo.postFee;
                }
                //console.log($scope.cellList);
                return data;
            }

        }
    }
}]);
/**
 * Created by Jin on 2016/9/23.
 */
/*app.directive("dpSmartFloat", ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        link: function (scope, element, attr) {
            var DEFAULTS = {
                type: 'top',
                distance: 0
            };
            var options;
            var windowHeight = $(window).height();
            //获取参数配置项
            scope.$watchCollection(attr.dpSmartFloat, function (option) {
                if (angular.isObject(option)) {
                    options = angular.extend(angular.copy(DEFAULTS), option);
                } else {
                    throw new Error('Invalid value for smart-float. smart-float only accepts object params.');
                }
            }, true);
            function position() {
                var elementWidth = element.outerWidth();
                var elementHeight = element.outerHeight();
                var referElement = element.parent();//参照元素
                var referPos = referElement.offset().top + elementHeight;//参照距离
                referElement.css('height', elementHeight + 'px');
                referElement.css('width', elementWidth + 'px');
                var scrollTop = $(this).scrollTop();
                if (options.type == 'top') {
                    if (scrollTop > referPos) {
                        element.addClass("smart-float-top");
                        element.css({
                            position: 'fixed',
                            top: options.distance + 'px',
                            width: elementWidth,
                            'z-index': '100'
                        });
                    } else {
                        element.removeClass("smart-float-top");
                        element.css({
                            position: 'static'
                        });
                    }
                }
                if (options.type == 'bottom') {
                    //超出一屏可视区大小&&未滚动到最底部一屏
                    if ((windowHeight < referElement.offset().top) && ((scrollTop + windowHeight) < referPos)) {
                        element.addClass("smart-float-bottom");
                        element.css({
                            position: 'fixed',
                            /!*top: windowHeight - elementHeight + 'px',*!/
                            bottom: 0,
                            width: elementWidth,
                            'z-index': '100'
                        });
                    } else {
                        element.removeClass("smart-float-bottom");
                        element.css({
                            position: 'static'
                        });
                    }
                }


            }

            $timeout(function () {
                $(window).scroll(position);
            }, 800);
            //页面Dom加载完毕，否则高度取不准

            $(window).load(function(){
                $(window).resize(function () {
                    windowHeight = $(window).height();
                    position();
                });
            });

            //观察Dom元素变化时
            var ob = new MutationObserver(function(){
                windowHeight = $(window).height();
                position();
            });

            ob.observe(document,{
                childList:true,
                subtree:true
            });


        }
    }
}]);

$.fn.smartFloat = function () {
    var position = function (element) {
        var elementHeight = element.height();
        var elementWidth = element.width();
        var referElement = element.parent();   //参照元素

        referElement.css('height', elementHeight + 'px');
        referElement.css('width', elementWidth + 'px');
        var referPos = referElement.position().top + elementHeight;      //参照距离

        $(window).scroll(function () {

            var scrollTop = $(this).scrollTop();
            if (scrollTop > referPos) {
                element.css({
                    position: 'fixed',
                    top: '70px',
                    width: elementWidth,
                    'z-index': '100'
                });
            } else {
                element.css({
                    position: 'inherit'
                });
            }

        })

    };
    return $(this).each(function () {
        position($(this));
    })
};*/
app.directive("dyName", [

    function() {
        return {
            require: "ngModel",
            link: function(scope, elm, iAttrs, ngModelCtr) {
                ngModelCtr.$name = iAttrs.dyName;
                elm.attr('name', iAttrs.dyName);
                var formController = elm.controller('form') || {
                        $addControl: angular.noop
                    };
                formController.$addControl(ngModelCtr);

                scope.$on('$destroy', function() {
                    formController.$removeControl(ngModelCtr);
                });

            }
        };
    }
]);
//鼠标移开事件
app.directive('onBlur',[function(){
    return{
        link:function(scope,element,attr,Ctrl){
            element.blur(function(){
                scope.smart = false;
            })
        }
    }
}]);
//展开详细时增加class
app.directive('toggleExpand',[function(){
    return {
        link:function(scope,element,attr,ctrl) {

            var $btn =element.find('.dLabel');
            $btn.bind('click',function(){
                element.toggleClass('expanded');
            })

        }
    }
}]);
//收起、展开
app.directive("dpCollapse", function () {
    return {
        restrict: "EA",
        link: function (scope, element, attr) {
            var $btn = element.find(".btn-toggle"),
                $collapseTarget = element.parent().find(".entry-list");

            $btn.bind("click", function () {
                $btn.html($collapseTarget.hasClass("collapse") ? "<i class='glyphicon glyphicon-minus'></i> 收起" : "<i class='glyphicon glyphicon-plus'></i> 展开");
                $collapseTarget.toggleClass("collapse");
            });
        }
    }
});
/**
 * Created by Jin on 2016/5/31.
 */
app.directive('formatCheckbox', function () {
    return {
        restrict: 'AE',
        scope: {},
        require: '?^ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$formatters.push(function (value) {
                return !!value;
            });
            ctrl.$parsers.push(function (value) {
                return String(value) == "true" ? 1 : 0;
            });
            ctrl.$render = function () {
                element[0].checked = ctrl.$viewValue;
            }
        }
    }
});
/**
 * Created by Jin on 2016/11/7.
 */
$(function(){
    /**
     * 生成下一个运单号码
     * @param expressName - 快递公司名称
     * @param sidStart - 开始单号
     * @param step - 步长
     * @returns
     */
    window.getNextSid = function(expressName,sidStart,step){
        var emsReg = /(.*)ems(.*)/i; //EMS
        var postReg = /(.*)邮政平邮(.*)/i; //邮政平邮
        var postbReg = /(.*)国内小包(.*)|(.*)商务小包(.*)|(.*)邮政快递包裹(.*)/i; //邮政国内小包
        var sf = /(.*)顺丰(.*)/i; //顺丰
        var sure = /(.*)速尔(.*)/i; //速尔
        var fast = /(.*)快捷速递(.*)/i;//快捷速递
        var ems2Reg = /(.*)经济快递(.*)/i; //EMS经济快递
        var ems3Reg = /(.*)标准快递(.*)/i; //EMS标准快递
        var zjs = /(.*)宅急送(.*)/i; //宅急送
        var uc = /(.*)优速(.*)/i; //优速
        var yct = /(.*)黑猫宅急便(.*)/; //黑猫宅急便
        var fedex = /(.*)联邦快递(.*)/;//联邦快递

        if(ems2Reg.test(expressName)){//EMS经济快递
            return sidAdd4EMS2(sidStart,step);
        }if(ems3Reg.test(expressName)){//EMS标准快递
            return sidAdd4EMS2(sidStart,step);
        }else if(emsReg.test(expressName)){//EMS
            return sidAdd4EMS(sidStart,step);
        }else if(postReg.test(expressName)){//邮政平邮
            return sidAdd4POST(sidStart,step);
        }else if(postbReg.test(expressName)){//邮政国内小包
            return sidAdd4POSTB(sidStart,step);
        }else if(sf.test(expressName)){//顺丰
            return sidAdd4SF(sidStart,1);
        }else if(sure.test(expressName)){//速尔
            return sidAdd4SURE(sidStart,1);
        }else if(fast.test(expressName)){//快捷速递
            return sidAdd4FAST(sidStart,step);
        }else if(zjs.test(expressName)){//宅急送
            return sidAdd4ZJS(sidStart,1);
        }else if(uc.test(expressName)){//优速
            return sidAdd4UC(sidStart,step);
        }else if(yct.test(expressName)){//黑猫宅急便
            return sidAdd4YCT(sidStart,1);
        }else if(fedex.test(expressName)){//联邦快递
            return sidAdd4FEDEX(sidStart,1);
        }else{//其它快递
            return sidAdd4Normal(sidStart,step);
        }
    };

    /**
     * 生成下一个运单号码
     * @param expressName - 快递公司ID
     * @param sidStart - 开始单号
     * @param step - 步长
     * @returns
     */
    window.getNextSid2 = function(expressId,sidStart,step){
        if(141==expressId || "141"==expressId){//EMS经济快递
            return sidAdd4EMS2(sidStart,step);
        }if(144==expressId || "144"==expressId){//EMS标准快递
            return sidAdd4EMS2(sidStart,step);
        }else if(1==expressId || "1"==expressId){//EMS
            return sidAdd4EMS(sidStart,step);
        }else if(12==expressId || "12"==expressId){//邮政平邮
            return sidAdd4POST(sidStart,step);
        }else if(131==expressId || "131"==expressId){//邮政快递包裹
            return sidAdd4POSTB(sidStart,step);
        }else if(26==expressId || "26"==expressId){//顺丰
            return sidAdd4SF(sidStart,1);
        }else if(104==expressId || "104"==expressId){//速尔
            return sidAdd4SURE(sidStart,1);
        }else if(128==expressId || "128"==expressId){//快捷速递
            return sidAdd4FAST(sidStart,step);
        }else if(24==expressId || "24"==expressId){//宅急送
            return sidAdd4ZJS(sidStart,1);
        }else if(109==expressId || "109"==expressId){//优速
            return sidAdd4UC(sidStart,step);
        }else if(126==expressId || "126"==expressId){//黑猫宅急便
            return sidAdd4YCT(sidStart,1);
        }else if(31==expressId || "31"==expressId){//联邦快递
            return sidAdd4FEDEX(sidStart,1);
        }else{//其它快递
            return sidAdd4Normal(sidStart,step);
        }
    };

    // 将数字字符串strStart加上step，返回strStart+step后的字符串。strStart中的字符必须全部为数字
    var sidAdd4NumOnly = function(strStart,step){
        var sidLength = strStart.length;
        var stepLength = (step+"").length;

        var subSid1Length = (sidLength-stepLength);
        var subSid1 = strStart.substring(0,subSid1Length);
        var subSid2 = strStart.substring(subSid1Length,sidLength);
        var subSid2Length = subSid2.length;
        while(subSid2*1 < 1){
            if(subSid1Length<1){
                break;
            }
            subSid1Length = subSid1Length - 1;
            subSid1 = strStart.substring(0,subSid1Length);
            subSid2 = strStart.substring(subSid1Length,sidLength);
            subSid2Length = subSid2.length;
        }

        var suffix = subSid2*1 + step*1;//运单号码的后缀,数值型

        if((suffix+"").length < subSid2Length){//判断是否因乘法运算将suffix前面的0去掉了，如果是，则将suffix的前面重新补上0.
            for(var i=(suffix+"").length;i<subSid2Length;i++){
                suffix = "0"+suffix;
            }
        }

        if((suffix+"").length > strStart.length){
            return "";
        }else{
            while((suffix+"").length > subSid2.length){
                subSid1Length = subSid1Length - 1;
                subSid1 = strStart.substring(0,subSid1Length);
                subSid2 = strStart.substring(subSid1Length,sidLength);
                subSid2Length = subSid2.length;

                suffix = subSid2*1 + step*1;//重新计算运单号码的后缀,数值型

                if((suffix+"").length < subSid2Length){//判断是否因乘法运算将suffix前面的0去掉了，如果是，则将suffix的前面重新补上0.
                    for(var i=(suffix+"").length;i<subSid2Length;i++){
                        suffix = "0"+suffix;
                    }
                }
            }

            return subSid1+suffix;
        }
    };

    // 将运单号码加上步长，返回一个新的运单号码，支持运单号码开头或最后带字符的情况
    var sidAdd4Normal = function(sidStart,step){
        // 2012-02-04,改用正则表达式的方式，支持后缀非数字

        // 运单号码全部为数字
        var reg1 = /^(\d+)$/i;
        if(reg1.test(sidStart)){
            var tmp = reg1.exec(sidStart);
            var num = tmp[1];
            num = num + "";
            //alert("[1] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return base;
        }

        // 运单号码开头为字符，最后为数字
        var reg2 = /^(\D+)(\d+)$/i;
        if(reg2.test(sidStart)){
            var tmp = reg2.exec(sidStart);
            var sub1 = tmp[1];
            var num = tmp[2];
            num = num + "";
            //alert("[2] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+base;
        }

        // 运单号码开头为数字，最后为字符
        var reg3 = /^(\d+)(\D+)$/i;
        if(reg3.test(sidStart)){
            var tmp = reg3.exec(sidStart);
            var num = tmp[1];
            var sub2 = tmp[2];
            num = num + "";
            //alert("[3] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return base+""+sub2;
        }

        // 运单号码开头为字符，最后也为字符，中间为数字
        var reg4 = /^(\D+)(\d+)(\D+)$/i;
        if(reg4.test(sidStart)){
            var tmp = reg4.exec(sidStart);
            var sub1 = tmp[1];
            var num = tmp[2];
            var sub3 = tmp[3];
            num = num + "";
            //alert("[4] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+base+""+sub3;
        }

        // 运单号码开头为字符，最后也为字符，中间为混合字符的数字(数字中间带字符)
        var reg5 = /^(\D+)(\d+)(\D+)(\d+)(\D+)$/i;
        if(reg5.test(sidStart)){
            var tmp = reg5.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var sub3 = tmp[3];
            var num = tmp[4];
            var sub5 = tmp[5];
            num = num + "";
            //alert("[5] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+sub2+sub3+base+""+sub5;
        }

        // 运单号码开头为数字，最后也为数字，中间为字符
        var reg6 = /^(\d+)(\D+)(\d+)$/i;
        if(reg6.test(sidStart)){
            var tmp = reg6.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var num = tmp[3];
            num = num + "";
            //alert("[6] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+sub2+base;
        }

        alert("生成("+sidStart+")下一个运单号码时出错啦");
        return "";
    };

    // 根据指定的EMS运单号获取下一个运单号码
    var sidAdd4EMS = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            return "";
        }

        var emsReg = /^(\D{2}|\d{2})(\d{8})(\d)(\D{2}|\d{2})$/i;
        if(emsReg.test(sidStart)){
            var tmp = emsReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //根据指定的EMS（国内经济快递）运单号获取下一个运单号码
    var sidAdd4EMS2 = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            return "";
        }

        var emsReg = /^(\d{2})(\d{8})(\d)(\d{2})$/i;
        if(emsReg.test(sidStart)){
            var tmp = emsReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //算法来源：http://bbs.paidai.com/topic/76928
    //根据指定的顺丰运单号获取下一个运单号码
    var sidAdd4SF = function(sidStart,step){
        if(sidStart.length != 12){//顺丰运单号固定为12位长
            return "";
        }

        var num1 = sidStart.substring(0,11);
        var num2 = sidStart.substring(11,12);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            return "";
        }

        var numArray = new Array();
        for(var i=0;i<11;i++){
            var tmp = num1.substring(i,i+1);
            numArray[i] = tmp * 1;
        }

        if(9 != numArray[10]){
            var last = (num2*1+9)%10;
            return nextNum+""+last;
        }else{
            if(9 != numArray[9]){
                if(3==numArray[9]||6==numArray[9]){
                    var last = (num2*1+5)%10;
                    return nextNum+""+last;
                }else{
                    var last = (num2*1+6)%10;
                    return nextNum+""+last;
                }
            }else{
                if(9 != numArray[8]){
                    if(1==numArray[8]||3==numArray[8]||5==numArray[8]||7==numArray[8]){
                        var last = (num2*1+2)%10;
                        return nextNum+""+last;
                    }else{
                        var last = (num2*1+3)%10;
                        return nextNum+""+last;
                    }
                }else{
                    if(9 != numArray[7]){
                        if(0==numArray[7]||3==numArray[7]||6==numArray[7]){
                            var last = (num2*1+0)%10;
                            return nextNum+""+last;
                        }else{
                            var last = (num2*1+9)%10;
                            return nextNum+""+last;
                        }
                    }else{
                        if(9 != numArray[6]){
                            if(0==numArray[6]){
                                var last = (num2*1+7)%10;
                                return nextNum+""+last;
                            }else{
                                var last = (num2*1+6)%10;
                                return nextNum+""+last;
                            }
                        }else{
                            if(9 != numArray[5]){
                                var last = (num2*1+3)%10;
                                return nextNum+""+last;
                            }else{
                                if(9 != numArray[4]){
                                    if(3==numArray[4]||6==numArray[4]){
                                        var last = (num2*1+8)%10;
                                        return nextNum+""+last;
                                    }else{
                                        var last = (num2*1+9)%10;
                                        return nextNum+""+last;
                                    }
                                }else{
                                    if(9 != numArray[3]){
                                        if(1==numArray[3]||3==numArray[3]||5==numArray[3]||7==numArray[3]){
                                            var last = (num2*1+4)%10;
                                            return nextNum+""+last;
                                        }else{
                                            var last = (num2*1+5)%10;
                                            return nextNum+""+last;
                                        }
                                    }else{
                                        return "";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return "";
    };

    //根据指定的速尔运单号获取下一个运单号码
    var sidAdd4SURE = function(sidStart,step){
        if(sidStart.length != 12){//速尔运单号固定为12位长
            return "";
        }


        if (sidStart.indexOf("50") == 0 || sidStart.indexOf("55") == 0
            || sidStart.indexOf("60") == 0 || sidStart.indexOf("61") == 0
            || sidStart.indexOf("62") == 0
            || sidStart.indexOf("72") == 0 || sidStart.indexOf("88") == 0) {// 如果单号是以50、55、60、61、62、72、88开头的，则顺序加1
            return sidAdd4Normal(sidStart, step);
        }

        var sureReg = /^(8|6)(\d{7})(\d{3})([0-6])$/i;
        if(sureReg.test(sidStart)){
            var tmp = sureReg.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num3 = num3 + "";

            num3 = sidAdd4NumOnly(num3,step);
            if(""==num3)return "";

            if(sub4*1>=0 && sub4*1<=5){
                sub4 = sub4*1+1;
            }else{
                sub4 = 0;
            }

            return sub1+""+sub2+num3+sub4;
        }

        return "";
    };

    //根据指定的中国邮政平邮的运单号获取下一个运单号码
    var sidAdd4POST = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            alert("运单号码的长度非法");
            return "";
        }

        var postbReg = /^(\D{2})(\d{8})(\d)(\d{2})$/i;
        if(postbReg.test(sidStart)){
            var tmp = postbReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        alert("联想生成运单号码时出错啦");
        return "";
    };

    //根据指定的邮政国内小包运单号获取下一个运单号码
    var sidAdd4POSTB = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            alert("运单号码的长度非法");
            return "";
        }

        if(sidStart.indexOf("99")==0 || sidStart.indexOf("96")==0){//如果单号是以99、96开头的，单号顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var postbReg = /^(\D{2}|\d{2})(\d{8})(\d)(\d{2})$/i;
        if(postbReg.test(sidStart)){
            var tmp = postbReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //根据指定的快捷速递运单号获取下一个运单号码
    var sidAdd4FAST = function(sidStart,step){
        if(sidStart.length == 12){//如果快捷速递运单号为12位长，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }
        if(sidStart.length != 13){//快捷速递运单号固定为13位长
            return "";
        }

        if(sidStart.indexOf("5730")==0){//如果单号是以5730开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }else if(sidStart.indexOf("5790")==0){//如果单号是以5790开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        if(sidStart.indexOf("27")!=0 && sidStart.indexOf("57")!=0){//如果单号不是以27、57开头，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var num1 = sidStart.substring(0,12);
        var num2 = sidStart.substring(12,13);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            return "";
        }

        var last = num2*1 + step*1;
        if(last >= 10){
            last = (last+"").substring((last+"").length-1,(last+"").length) * 1;
        }
        last = last%7;

        return nextNum+""+last;
    };

    //根据指定的宅急送运单号获取下一个运单号码
    var sidAdd4ZJS = function(sidStart,step){
        if(sidStart.length != 10 && sidStart.length != 13){//宅急送运单号固定为10位或13位长（13位长的为2016.1.1新启用的单号规则）
            if(sidStart.length>0) alert("所输入的运单号的长度不符合宅急送的单号规则");
            return "";
        }

        if(10==sidStart.length){
            if(sidStart.indexOf("49")==0){//如果单号是以49开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }else if(sidStart.indexOf("70T")==0){//如果单号是以70T开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }else if(sidStart.indexOf("16")==0){//如果单号是以16开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }

            var zjsReg = /^(\d{6})(\d{3})([0-6])$/i;
            if(zjsReg.test(sidStart)){
                var tmp = zjsReg.exec(sidStart);
                var sub1 = tmp[1];
                var num2 = tmp[2];
                var sub3 = tmp[3];
                num2 = num2 + "";

                num2 = sidAdd4NumOnly(num2,step);
                if(""==num2)return "";

                if(sub3*1>=0 && sub3*1<=5){
                    sub3 = sub3*1+1;
                }else{
                    sub3 = 0;
                }

                return sub1+""+num2+sub3;
            }
        }else if(13==sidStart.length){
            var zjsReg = /^(A)(\d)(\d{11})$/i;
            if(zjsReg.test(sidStart)){
                var tmp = zjsReg.exec(sidStart);
                var sub1 = tmp[1];
                var num2 = tmp[2];
                var num3 = tmp[3];
                num2 = num2 - 0;
                if(num2>=0 && num2<=5){
                    var the_num = num2+""+num3;
                    the_num = the_num.substr(0,the_num.length-1);
                    the_num = sidAdd4NumOnly(the_num,step);
                    if(""==the_num){
                        alert("所输入的运单号不符合宅急送的单号规则");
                        return "";
                    }
                    var sub4 = the_num%7;
                    return sub1+""+the_num+sub4;
                }else{
                    num3 = num3 + "";
                    num3 = sidAdd4NumOnly(num3,step);
                    if(""==num3){
                        alert("所输入的运单号不符合宅急送的单号规则");
                        return "";
                    }
                    return sub1+""+num2+num3;
                }
            }
        }

        alert("所输入的运单号不符合宅急送的单号规则");
        return "";
    };

    //根据指定的优速运单号获取下一个运单号码
    var sidAdd4UC = function(sidStart,step){
        if(sidStart.length != 12){//优速运单号固定为12位长
            if(sidStart.length>0) alert("所输入的运单号的长度不符合优速的单号规则");
            return "";
        }

        if(sidStart.indexOf("v")!=0 && sidStart.indexOf("V")!=0){//如果单号不是以V开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var ucReg = /^(V)([0-9]{10})([0-9])/i;
        if(ucReg.test(sidStart)){
            var tmp = ucReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var sub3 = tmp[3];
            num2 = num2 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2){
                alert("生成优速的("+sidStart+")下一个运单号码时出错啦");
                return "";
            }

            if(sub3*1>=0 && sub3*1<=5){
                sub3 = sub3*1+1;
            }else{
                sub3 = 0;
            }

            return sub1+""+num2+sub3;
        }

        alert("所输入的运单号不符合优速的单号规则");
        return "";
    };

    //根据指定的黑猫宅急便运单号获取下一个运单号码
    var sidAdd4YCT = function(sidStart,step){
        if(sidStart.length != 12){//黑猫宅急便运单号固定为12位长
            if(sidStart.length>0) alert("所输入的运单号的长度不符合黑猫宅急便的单号规则");
            return "";
        }

        var yctReg = /^(\d{6})(\d{5})([0-6])$/i;
        if(yctReg.test(sidStart)){
            var tmp = yctReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var sub3 = tmp[3];
            num2 = num2 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2){
                alert("生成黑猫宅急便的("+sidStart+")下一个运单号码时出错啦");
                return "";
            }

            if(sub3*1>=0 && sub3*1<=5){
                sub3 = sub3*1+1;
            }else{
                sub3 = 0;
            }

            return sub1+""+num2+sub3;
        }

        alert("所输入的运单号不符合黑猫宅急便的单号规则");
        return "";
    };

    //根据指定的联邦快递运单号获取下一个运单号码
    var sidAdd4FEDEX = function(sidStart,step){
        if(sidStart.length != 12){//联邦快递运单号固定为12位长
            alert("所输入的运单号的长度不符合联邦快递的单号规则");
            return "";
        }

        var num1 = sidStart.substring(0,11);
        var num2 = sidStart.substring(11,12);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            alert("生成联邦快递的单号时出错啦");
            return "";
        }

        var last = nextNum;
        last = last%11;
        if(last==10){
            last = 0;
        }

        return nextNum+""+last;
    };
});

/**
 * Created by Jin on 2017/8/16.
 */
$(function(){
    //多店铺切换
    $('body').on('click','.shop-center .shop-list .shop',function(){
        var shopId = $(this).find('input').val();
        switchShop(shopId);
    });
    function switchShop(shopId){
        var url = "/seller/shopBinding/switch?switchShopId="+shopId;
        $.ajax({
            type: "post",
            url: url,
            cache: false,
            async: true,
            success: function (data) {
                if (data.resultCode == 0) {
                    location.reload();
                    location.href = "//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/unprintedExpress";
                }
            },
            error: function (data) {
                alert("resultCode:" + data.resultCode + data.resultMessage)
            }
        })
    }
});
/*! jQuery UI - v1.12.1 - 2016-09-26
* http://jqueryui.com
* Includes: widget.js, data.js, scroll-parent.js, widgets/draggable.js, widgets/mouse.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){t.ui=t.ui||{},t.ui.version="1.12.1";var e=0,i=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var s,n,o=i.call(arguments,1),a=0,r=o.length;r>a;a++)for(s in o[a])n=o[a][s],o[a].hasOwnProperty(s)&&void 0!==n&&(e[s]=t.isPlainObject(n)?t.isPlainObject(e[s])?t.widget.extend({},e[s],n):t.widget.extend({},n):n);return e},t.widget.bridge=function(e,s){var n=s.prototype.widgetFullName||e;t.fn[e]=function(o){var a="string"==typeof o,r=i.call(arguments,1),l=this;return a?this.length||"instance"!==o?this.each(function(){var i,s=t.data(this,n);return"instance"===o?(l=s,!1):s?t.isFunction(s[o])&&"_"!==o.charAt(0)?(i=s[o].apply(s,r),i!==s&&void 0!==i?(l=i&&i.jquery?l.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+o+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+o+"'")}):l=void 0:(r.length&&(o=t.widget.extend.apply(null,[o].concat(r))),this.each(function(){var e=t.data(this,n);e?(e.option(o||{}),e._init&&e._init()):t.data(this,n,new s(o,this))})),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(i,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=e++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),i),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])}}),t.fn.scrollParent=function(e){var i=this.css("position"),s="absolute"===i,n=e?/(auto|scroll|hidden)/:/(auto|scroll)/,o=this.parents().filter(function(){var e=t(this);return s&&"static"===e.css("position")?!1:n.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==i&&o.length?o:t(this[0].ownerDocument||document)},t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var s=!1;t(document).on("mouseup",function(){s=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!s){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,n=1===e.which,o="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return n&&!o&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),s=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,s=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.ui.plugin={add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i,s){var n,o=t.plugins[e];if(o&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(n=0;o.length>n;n++)t.options[o[n][0]]&&o[n][1].apply(t.element,i)}},t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.ui.safeBlur=function(e){e&&"body"!==e.nodeName.toLowerCase()&&t(e).trigger("blur")},t.widget("ui.draggable",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this._addClass("ui-draggable"),this._setHandleClassName(),this._mouseInit()},_setOption:function(t,e){this._super(t,e),"handle"===t&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){return(this.helper||this.element).is(".ui-draggable-dragging")?(this.destroyOnClear=!0,void 0):(this._removeHandleClassName(),this._mouseDestroy(),void 0)},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(this._blurActiveElement(e),this._blockFrames(i.iframeFix===!0?"iframe":i.iframeFix),!0):!1)},_blockFrames:function(e){this.iframeBlocks=this.document.find(e).map(function(){var e=t(this);return t("<div>").css("position","absolute").appendTo(e.parent()).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).offset(e.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(e){var i=t.ui.safeActiveElement(this.document[0]),s=t(e.target);s.closest(i).length||t.ui.safeBlur(i)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this._addClass(this.helper,"ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=this.helper.parents().filter(function(){return"fixed"===t(this).css("position")}).length>0,this.positionAbs=this.element.offset(),this._refreshOffsets(e),this.originalPosition=this.position=this._generatePosition(e,!1),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_refreshOffsets:function(t){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:t.pageX-this.offset.left,top:t.pageY-this.offset.top}},_mouseDrag:function(e,i){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e,!0),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp(new t.Event("mouseup",e)),!1;this.position=s.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1},_mouseUp:function(e){return this._unblockFrames(),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),this.handleElement.is(e.target)&&this.element.trigger("focus"),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp(new t.Event("mouseup",{target:this.element[0]})):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this._addClass(this.handleElement,"ui-draggable-handle")},_removeHandleClassName:function(){this._removeClass(this.handleElement,"ui-draggable-handle")},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper),n=s?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return n.parents("body").length||n.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s&&n[0]===this.element[0]&&this._setPositionRelative(),n[0]===this.element[0]||/(fixed|absolute)/.test(n.css("position"))||n.css("position","absolute"),n},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_isRootNode:function(t){return/(html|body)/i.test(t.tagName)||t===this.document[0]},_getParentOffset:function(){var e=this.offsetParent.offset(),i=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==i&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),this._isRootNode(this.offsetParent[0])&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var t=this.element.position(),e=this._isRootNode(this.scrollParent[0]);return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+(e?0:this.scrollParent.scrollTop()),left:t.left-(parseInt(this.helper.css("left"),10)||0)+(e?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options,o=this.document[0];return this.relativeContainer=null,n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):"document"===n.containment?(this.containment=[0,0,t(o).width()-this.helperProportions.width-this.margins.left,(t(o).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):n.containment.constructor===Array?(this.containment=n.containment,void 0):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e=/(scroll|auto)/.test(i.css("overflow")),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=i),void 0):(this.containment=null,void 0)},_convertPositionTo:function(t,e){e||(e=this.position);var i="absolute"===t?1:-1,s=this._isRootNode(this.scrollParent[0]);return{top:e.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:s?0:this.offset.scroll.top)*i,left:e.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:s?0:this.offset.scroll.left)*i}},_generatePosition:function(t,e){var i,s,n,o,a=this.options,r=this._isRootNode(this.scrollParent[0]),l=t.pageX,h=t.pageY;return r&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),e&&(this.containment&&(this.relativeContainer?(s=this.relativeContainer.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,t.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),a.grid&&(n=a.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/a.grid[1])*a.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-a.grid[1]:n+a.grid[1]:n,o=a.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/a.grid[0])*a.grid[0]:this.originalPageX,l=i?o-this.offset.click.left>=i[0]||o-this.offset.click.left>i[2]?o:o-this.offset.click.left>=i[0]?o-a.grid[0]:o+a.grid[0]:o),"y"===a.axis&&(l=this.originalPageX),"x"===a.axis&&(h=this.originalPageY)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:r?0:this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:r?0:this.offset.scroll.left)}},_clear:function(){this._removeClass(this.helper,"ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s,this],!0),/^(drag|start|stop)/.test(e)&&(this.positionAbs=this._convertPositionTo("absolute"),s.offset=this.positionAbs),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i,s){var n=t.extend({},i,{item:s.element});s.sortables=[],t(s.options.connectToSortable).each(function(){var i=t(this).sortable("instance");i&&!i.options.disabled&&(s.sortables.push(i),i.refreshPositions(),i._trigger("activate",e,n))})},stop:function(e,i,s){var n=t.extend({},i,{item:s.element});s.cancelHelperRemoval=!1,t.each(s.sortables,function(){var t=this;t.isOver?(t.isOver=0,s.cancelHelperRemoval=!0,t.cancelHelperRemoval=!1,t._storedCSS={position:t.placeholder.css("position"),top:t.placeholder.css("top"),left:t.placeholder.css("left")},t._mouseStop(e),t.options.helper=t.options._helper):(t.cancelHelperRemoval=!0,t._trigger("deactivate",e,n))})},drag:function(e,i,s){t.each(s.sortables,function(){var n=!1,o=this;o.positionAbs=s.positionAbs,o.helperProportions=s.helperProportions,o.offset.click=s.offset.click,o._intersectsWith(o.containerCache)&&(n=!0,t.each(s.sortables,function(){return this.positionAbs=s.positionAbs,this.helperProportions=s.helperProportions,this.offset.click=s.offset.click,this!==o&&this._intersectsWith(this.containerCache)&&t.contains(o.element[0],this.element[0])&&(n=!1),n})),n?(o.isOver||(o.isOver=1,s._parent=i.helper.parent(),o.currentItem=i.helper.appendTo(o.element).data("ui-sortable-item",!0),o.options._helper=o.options.helper,o.options.helper=function(){return i.helper[0]},e.target=o.currentItem[0],o._mouseCapture(e,!0),o._mouseStart(e,!0,!0),o.offset.click.top=s.offset.click.top,o.offset.click.left=s.offset.click.left,o.offset.parent.left-=s.offset.parent.left-o.offset.parent.left,o.offset.parent.top-=s.offset.parent.top-o.offset.parent.top,s._trigger("toSortable",e),s.dropped=o.element,t.each(s.sortables,function(){this.refreshPositions()}),s.currentItem=s.element,o.fromOutside=s),o.currentItem&&(o._mouseDrag(e),i.position=o.position)):o.isOver&&(o.isOver=0,o.cancelHelperRemoval=!0,o.options._revert=o.options.revert,o.options.revert=!1,o._trigger("out",e,o._uiHash(o)),o._mouseStop(e,!0),o.options.revert=o.options._revert,o.options.helper=o.options._helper,o.placeholder&&o.placeholder.remove(),i.helper.appendTo(s._parent),s._refreshOffsets(e),i.position=s._generatePosition(e,!0),s._trigger("fromSortable",e),s.dropped=!1,t.each(s.sortables,function(){this.refreshPositions()}))})}}),t.ui.plugin.add("draggable","cursor",{start:function(e,i,s){var n=t("body"),o=s.options;n.css("cursor")&&(o._cursor=n.css("cursor")),n.css("cursor",o.cursor)},stop:function(e,i,s){var n=s.options;n._cursor&&t("body").css("cursor",n._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("opacity")&&(o._opacity=n.css("opacity")),n.css("opacity",o.opacity)},stop:function(e,i,s){var n=s.options;n._opacity&&t(i.helper).css("opacity",n._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(t,e,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(e,i,s){var n=s.options,o=!1,a=s.scrollParentNotHidden[0],r=s.document[0];a!==r&&"HTML"!==a.tagName?(n.axis&&"x"===n.axis||(s.overflowOffset.top+a.offsetHeight-e.pageY<n.scrollSensitivity?a.scrollTop=o=a.scrollTop+n.scrollSpeed:e.pageY-s.overflowOffset.top<n.scrollSensitivity&&(a.scrollTop=o=a.scrollTop-n.scrollSpeed)),n.axis&&"y"===n.axis||(s.overflowOffset.left+a.offsetWidth-e.pageX<n.scrollSensitivity?a.scrollLeft=o=a.scrollLeft+n.scrollSpeed:e.pageX-s.overflowOffset.left<n.scrollSensitivity&&(a.scrollLeft=o=a.scrollLeft-n.scrollSpeed))):(n.axis&&"x"===n.axis||(e.pageY-t(r).scrollTop()<n.scrollSensitivity?o=t(r).scrollTop(t(r).scrollTop()-n.scrollSpeed):t(window).height()-(e.pageY-t(r).scrollTop())<n.scrollSensitivity&&(o=t(r).scrollTop(t(r).scrollTop()+n.scrollSpeed))),n.axis&&"y"===n.axis||(e.pageX-t(r).scrollLeft()<n.scrollSensitivity?o=t(r).scrollLeft(t(r).scrollLeft()-n.scrollSpeed):t(window).width()-(e.pageX-t(r).scrollLeft())<n.scrollSensitivity&&(o=t(r).scrollLeft(t(r).scrollLeft()+n.scrollSpeed)))),o!==!1&&t.ui.ddmanager&&!n.dropBehaviour&&t.ui.ddmanager.prepareOffsets(s,e)}}),t.ui.plugin.add("draggable","snap",{start:function(e,i,s){var n=s.options;s.snapElements=[],t(n.snap.constructor!==String?n.snap.items||":data(ui-draggable)":n.snap).each(function(){var e=t(this),i=e.offset();this!==s.element[0]&&s.snapElements.push({item:this,width:e.outerWidth(),height:e.outerHeight(),top:i.top,left:i.left})})},drag:function(e,i,s){var n,o,a,r,l,h,c,u,d,p,f=s.options,g=f.snapTolerance,m=i.offset.left,_=m+s.helperProportions.width,v=i.offset.top,b=v+s.helperProportions.height;for(d=s.snapElements.length-1;d>=0;d--)l=s.snapElements[d].left-s.margins.left,h=l+s.snapElements[d].width,c=s.snapElements[d].top-s.margins.top,u=c+s.snapElements[d].height,l-g>_||m>h+g||c-g>b||v>u+g||!t.contains(s.snapElements[d].item.ownerDocument,s.snapElements[d].item)?(s.snapElements[d].snapping&&s.options.snap.release&&s.options.snap.release.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=!1):("inner"!==f.snapMode&&(n=g>=Math.abs(c-b),o=g>=Math.abs(u-v),a=g>=Math.abs(l-_),r=g>=Math.abs(h-m),n&&(i.position.top=s._convertPositionTo("relative",{top:c-s.helperProportions.height,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l-s.helperProportions.width}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h}).left)),p=n||o||a||r,"outer"!==f.snapMode&&(n=g>=Math.abs(c-v),o=g>=Math.abs(u-b),a=g>=Math.abs(l-m),r=g>=Math.abs(h-_),n&&(i.position.top=s._convertPositionTo("relative",{top:c,left:0}).top),o&&(i.position.top=s._convertPositionTo("relative",{top:u-s.helperProportions.height,left:0}).top),a&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h-s.helperProportions.width}).left)),!s.snapElements[d].snapping&&(n||o||a||r||p)&&s.options.snap.snap&&s.options.snap.snap.call(s.element,e,t.extend(s._uiHash(),{snapItem:s.snapElements[d].item})),s.snapElements[d].snapping=n||o||a||r||p)}}),t.ui.plugin.add("draggable","stack",{start:function(e,i,s){var n,o=s.options,a=t.makeArray(t(o.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});a.length&&(n=parseInt(t(a[0]).css("zIndex"),10)||0,t(a).each(function(e){t(this).css("zIndex",n+e)}),this.css("zIndex",n+a.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i,s){var n=t(i.helper),o=s.options;n.css("zIndex")&&(o._zIndex=n.css("zIndex")),n.css("zIndex",o.zIndex)},stop:function(e,i,s){var n=s.options;n._zIndex&&t(i.helper).css("zIndex",n._zIndex)}}),t.ui.draggable});
/**
 * Created by Jin on 2016/6/6.
 */
app.directive('printItemBox', ['drag', function (drag) {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: {
            remove: '&',
            entity: '='
        },
        templateUrl: 'views/components/printItemBox.html',
        link: function (scope, element, attrs, ctrl) {

            function init() {
                //取消拖拽
                $(document).on('mousedown', function (e) {                   //设置样式
                    if ($('.field').hasClass('dragged')) {
                        render(this, false);
                    }
                });

                //绑定拖拽
                $(element).on('mousedown', function (event) {
                    render(this, true);             //设置对象周围元素样式

                    drag(this, event, this.parentNode).then(cellUpdate);
                });

                scope.boxStyle = {
                    'top': scope.entity.yPosition,
                    'left': scope.entity.xPosition,
                    'width': scope.entity.width,
                    'height': scope.entity.height

                };

                scope.fontStyle = {
                    'font-size': scope.entity.fontSize,
                    'text-decoration': scope.entity.textUnderline,
                    'font-family': scope.entity.fontType,
                    'font-weight': scope.entity.fontBold,
                    'text-align': scope.entity.textAlign,
                    'font-style': scope.entity.fontItalic
                };
                scope.fontBold = scope.entity.fontBold == "bold";
                scope.fontItalic = scope.entity.fontItalic == "italic";
                scope.textUnderline = scope.entity.textUnderline == "underline";
            }



            init();

            function render(element, show) {
                var display = 'none';
                if (show) {
                    $('.field').addClass('dragged');
                    display = 'block';
                    $(element).addClass('dragging');
                    $(element).find('.edit-bar').css('display', 'inline-block');     //工具栏
                    $(element).css('z-index', 21);
                } else {
                    $('.dragging').css('z-index', 1).removeClass('dragging');
                    $('.field').removeClass('dragged');
                    $(element).find('.edit-bar').css('display', 'none');            //工具栏
                }
                $(element).find('.close').css('display', display);               //关闭按钮
                $('.shade').css('display', display);                            //遮罩
                $(element).find('i.tip').each(function (i, item) {             //初始化拖拽点
                    $(item).css('display', display);
                    var itemClass = $(item).attr('class').split(' ')[1].split('-');
                    if (itemClass.length == 2) {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css(itemClass[1], '-3.5px');
                    } else if (itemClass[0] == 'top' || itemClass[0] == 'bottom') {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css('left', '49%');
                    } else if (itemClass[0] == 'left' || itemClass[0] == 'right') {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css('top', '45%');
                    }
                })
            }

            function cellUpdate(element) {
                scope.entity.width = $(element).css('width');
                scope.entity.height = $(element).css('height');
                scope.entity.xPosition = $(element).css('left');
                scope.entity.yPosition = $(element).css('top');
            }

            scope.setFontSize = function () {
                scope.fontStyle['font-size'] = scope.entity.fontSize;
            };

            scope.setFontType = function () {
                scope.fontStyle['font-family'] = scope.entity.fontType;
            };

            scope.setTextAlign = function () {
                scope.fontStyle['text-align'] = scope.entity.textAlign;
            };
            scope.setFontBold = function () {

                scope.entity.fontBold = scope.fontBold ? "normal" : "bold";
                scope.fontBold = !scope.fontBold;
                scope.fontStyle['font-weight'] = scope.entity.fontBold;
            };
            scope.setFontItalic = function () {

                scope.entity.fontItalic = scope.fontItalic ? "normal" : "italic";
                scope.fontItalic = !scope.fontItalic;
                scope.fontStyle['font-style'] = scope.entity.fontItalic;
            };
            scope.setTextUnderline = function () {
                scope.entity.textUnderline = scope.textUnderline ? "initial" : "underline";
                scope.textUnderline = !scope.textUnderline;
                scope.fontStyle['text-decoration'] = scope.entity.textUnderline;
            };


        }
    }
}]);

app.directive('setupPrint',function(){
	return{
		template:'<object id="LODOP_OB" classid="clsid:2105C259-1E0C-4534-8141-A753534CB4CA" width=800 height=900> '+
		'<embed id="LODOP_EM" type="application/x-print-lodop" width=800 height=720 pluginspage="install_lodop32.exe"></embed>'+
		'</object>',
		restrict:"AE",
		link:function(scope,element,attrs,ctrl){

			function CreatePage() {
				LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM')); 
				//LODOP = getLodop(element.find('#LODOP_OB'),element.find('#LODOP_EM'));
				LODOP.PRINT_INITA(4,10,820,610,"打印控件功能演示_Lodop功能_显示模式");
				LODOP.ADD_PRINT_TEXT(83,78,75,20,"寄件人姓名");
				LODOP.ADD_PRINT_TEXT(109,137,194,20,"寄件人单位名称");
				LODOP.ADD_PRINT_TEXT(134,90,238,35,"寄件人的详细地址");
				LODOP.ADD_PRINT_TEXT(85,391,75,20,"收件人姓名");
				LODOP.ADD_PRINT_TEXT(108,440,208,20,"收件人单位名称");
				LODOP.ADD_PRINT_TEXT(137,403,244,35,"收件人详细地址");
				LODOP.ADD_PRINT_TEXT(252,33,164,40,"内件品名");
				LODOP.ADD_PRINT_TEXT(261,221,100,20,"内件数量");
				LODOP.ADD_PRINT_TEXT(83,212,100,20,"寄件人电话");
				LODOP.ADD_PRINT_TEXT(80,554,75,20,"收件人电话");
				LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src='http://s1.sinaimg.cn/middle/721e77e5t99431b026bd0&690'>");

			}
			function setShowMode(){
				LODOP.SET_SHOW_MODE("SETUP_IN_BROWSE",1);
				LODOP.SET_SHOW_MODE("SETUP_ENABLESS","11110100000001");
        		LODOP.SET_SHOW_MODE("HIDE_DISBUTTIN_SETUP",1);  //隐藏无用按钮
        		//LODOP.SET_SHOW_MODE("HIDE_TOOLS_DESIGN",1); //隐藏整个工具栏
        		LODOP.SET_SHOW_MODE("HIDE_GROUND_LOCK",1);   //隐藏纸钉按钮
        		//LODOP.SET_SHOW_MODE("SHOW_SCALEBAR",1);    //显示标尺 需高级注册
        		LODOP.SET_SHOW_MODE("HIDE_PBUTTIN_SETUP",1); //隐藏暂存按钮
        		LODOP.SET_SHOW_MODE("BKIMG_IN_PREVIEW",1);
        		LODOP.SET_SHOW_MODE("HIDE_ABUTTIN_SETUP",1); //隐藏打印按钮
        		LODOP.PRINT_SETUP();
        	}
        	CreatePage();
        	setShowMode();
        }
    }
});

// 根据我打中的快递公司ID获取此快递公司在淘宝里的代码 
function get_exp_tb_code(express_id){
    var exp_code_map = {};
    exp_code_map['14'] = 'STO';
    exp_code_map['16'] = 'YTO';
    exp_code_map['15'] = 'ZTO';
    exp_code_map['50'] = 'YUNDA';
    exp_code_map['26'] = 'SF';
    exp_code_map['19'] = 'HTKY';
    exp_code_map['34'] = 'TTKDEX';
    exp_code_map['131'] = 'POSTB';
    exp_code_map['141'] = 'EYB';
    exp_code_map['1'] = 'EMS';
    exp_code_map['79'] = 'GTO';
    exp_code_map['114'] = 'QFKD';
    exp_code_map['138'] = 'POSTB';
    exp_code_map['109'] = 'UC';
    exp_code_map['144'] = 'EMS';
    exp_code_map['12'] = 'POST';
    exp_code_map['167'] = 'ESB';
    exp_code_map['113'] = 'QFKD';
    exp_code_map['24'] = 'ZJS';
    exp_code_map['128'] = 'FAST';
    exp_code_map['76'] = 'LB';
    exp_code_map['107'] = 'NEDA';
    exp_code_map['127'] = 'NEDA';
    exp_code_map['156'] = 'QRT';
    exp_code_map['73'] = 'DBL';
    exp_code_map['186'] = 'DBKD';
    exp_code_map['104'] = 'SURE';
    exp_code_map['126'] = 'YCT';
    exp_code_map['41'] = 'ZTKY';
    exp_code_map['75'] = 'APEX';
    exp_code_map['130'] = 'UAPEX';
    exp_code_map['115'] = 'LTS';
    exp_code_map['129'] = 'QRT';
    exp_code_map['31'] = 'FEDEX';
    exp_code_map['33'] = 'HOAU';
    exp_code_map['69'] = 'CNEX';
    exp_code_map['101'] = 'STARS';
    exp_code_map['102'] = 'XFHONG';
    exp_code_map['28'] = 'AIRFEX';
    exp_code_map['29'] = 'DTW';
    exp_code_map['74'] = 'EBON';
    exp_code_map['77'] = 'CYEXP';
    exp_code_map['78'] = 'ANTO';
    exp_code_map['103'] = 'XB';
    exp_code_map['110'] = 'HZABC';
    exp_code_map['106'] = 'YUD';
    exp_code_map['116'] = 'UNIPS';
    exp_code_map['117'] = 'BEST';
    exp_code_map['139'] = 'BJCS';
    exp_code_map['118'] = 'SHQ';
    exp_code_map['119'] = 'WLB-STARS';
    exp_code_map['120'] = 'WLB-ABC';
    exp_code_map['121'] = 'WLB-SAD';
    exp_code_map['122'] = 'ZY';
    exp_code_map['123'] = 'DFH';
    exp_code_map['124'] = 'SY';
    exp_code_map['125'] = 'YC';
    exp_code_map['142'] = 'ZHQKD';
    exp_code_map['132'] = 'OTHER';
    exp_code_map['143'] = 'OTHER';
    exp_code_map['140'] = 'OTHER';
    exp_code_map['2'] = 'OTHER';
    exp_code_map['13'] = 'OTHER';
    exp_code_map['17'] = 'OTHER';
    exp_code_map['18'] = 'OTHER';
    exp_code_map['20'] = 'OTHER';
    exp_code_map['21'] = 'OTHER';
    exp_code_map['22'] = 'OTHER';
    exp_code_map['23'] = 'OTHER';
    exp_code_map['25'] = 'OTHER';
    exp_code_map['32'] = 'OTHER';
    exp_code_map['35'] = 'OTHER';
    exp_code_map['36'] = 'OTHER';
    exp_code_map['37'] = 'OTHER';
    exp_code_map['38'] = 'OTHER';
    exp_code_map['40'] = 'OTHER';
    exp_code_map['42'] = 'OTHER';
    exp_code_map['43'] = 'OTHER';
    exp_code_map['44'] = 'OTHER';
    exp_code_map['45'] = 'OTHER';
    exp_code_map['46'] = 'OTHER';
    exp_code_map['47'] = 'OTHER';
    exp_code_map['48'] = 'OTHER';
    exp_code_map['49'] = 'OTHER';
    exp_code_map['51'] = 'OTHER';
    exp_code_map['52'] = 'OTHER';
    exp_code_map['53'] = 'OTHER';
    exp_code_map['54'] = 'OTHER';
    exp_code_map['55'] = 'OTHER';
    exp_code_map['56'] = 'OTHER';
    exp_code_map['57'] = 'OTHER';
    exp_code_map['58'] = 'OTHER';
    exp_code_map['59'] = 'OTHER';
    exp_code_map['60'] = 'OTHER';
    exp_code_map['61'] = 'OTHER';
    exp_code_map['62'] = 'OTHER';
    exp_code_map['64'] = 'OTHER';
    exp_code_map['65'] = 'OTHER';
    exp_code_map['66'] = 'OTHER';
    exp_code_map['67'] = 'OTHER';
    exp_code_map['68'] = 'OTHER';
    exp_code_map['70'] = 'OTHER';
    exp_code_map['71'] = 'OTHER';
    exp_code_map['72'] = 'OTHER';
    exp_code_map['105'] = 'OTHER';
    exp_code_map['108'] = 'OTHER';
    exp_code_map['111'] = 'OTHER';
    exp_code_map['112'] = 'OTHER';
    exp_code_map['133'] = 'OTHER';
    exp_code_map['134'] = 'OTHER';
    exp_code_map['135'] = 'OTHER';
    exp_code_map['136'] = 'XFWL';
    exp_code_map['137'] = 'OTHER';
    exp_code_map['145'] = 'OTHER';
    exp_code_map['146'] = 'OTHER';
    exp_code_map['149'] = 'OTHER';
    exp_code_map['150'] = 'OTHER';
    exp_code_map['151'] = 'OTHER';
    exp_code_map['152'] = 'OTHER';
    exp_code_map['153'] = 'OTHER';
    exp_code_map['154'] = 'OTHER';
    exp_code_map['155'] = 'OTHER';
    exp_code_map['157'] = 'OTHER';
    exp_code_map['158'] = 'OTHER';
    exp_code_map['159'] = 'OTHER';
    exp_code_map['160'] = 'OTHER';
    exp_code_map['161'] = 'OTHER';
    exp_code_map['162'] = 'OTHER';
    exp_code_map['163'] = 'OTHER';
    exp_code_map['164'] = 'OTHER';
    exp_code_map['165'] = 'OTHER';
    exp_code_map['166'] = 'OTHER';
    exp_code_map['168'] = 'OTHER';
    exp_code_map['169'] = 'OTHER';
    exp_code_map['170'] = 'OTHER';
    exp_code_map['147'] = 'OTHER';
    exp_code_map['148'] = 'OTHER';
    var exp_code = exp_code_map[express_id+''];
    if(!exp_code){exp_code='';}
    return exp_code;
}

// 判断指定的验证运单号码的函数是否存在 
function is_validate_function_exist(function_name){
    var func_map = {};
    func_map['is_OTHER'] = true;
    func_map['is_POST'] = false;
    func_map['is_AIR'] = true;
    func_map['is_CYEXP'] = true;
    func_map['is_DTW'] = true;
    func_map['is_YUD'] = true;
    func_map['is_DFH'] = true;
    func_map['is_SY'] = true;
    func_map['is_YC'] = true;
    func_map['is_UNIPS'] = true;
    func_map['is_GZLT'] = true;
    func_map['is_MGSD'] = true;
    func_map['is_PKGJWL'] = true;
    func_map['is_EMS'] = true;
    func_map['is_YTO'] = true;
    func_map['is_ZJS'] = true;
    func_map['is_SF'] = true;
    func_map['is_UC'] = true;
    func_map['is_YANWENINTE'] = true;
    func_map['is_YANWENSH'] = true;
    func_map['is_YANWENSZ'] = true;
    func_map['is_YANWENBJ'] = true;
    func_map['is_YANWENYW'] = true;
    func_map['is_YANWENGZ'] = true;
    func_map['is_ZTOGZ'] = true;
    func_map['is_RUSTON'] = true;
    func_map['is_ZTOSH'] = true;
    func_map['is_GZFY'] = true;
    func_map['is_LTS'] = true;
    func_map['is_QFKD'] = true;
    func_map['is_UAPEX'] = true;
    func_map['is_BJCS'] = true;
    func_map['is_GDEMS'] = true;
    func_map['is_SURE'] = true;
    func_map['is_EYB'] = true;
    func_map['is_ZTO'] = true;
    func_map['is_HZABC'] = true;
    func_map['is_YUNDA'] = true;
    func_map['is_TTKDEX'] = true;
    func_map['is_CNEX'] = true;
    func_map['is_BEST'] = true;
    func_map['is_FEDEX'] = true;
    func_map['is_SHQ'] = true;
    func_map['is_HTKY'] = true;
    func_map['is_ZTKY'] = true;
    func_map['is_XFWL'] = true;
    func_map['is_STO'] = true;
    func_map['is_LB'] = true;
    func_map['is_HOAU'] = true;
    func_map['is_FAST'] = true;
    func_map['is_POSTB'] = true;
    func_map['is_YCT'] = true;
    func_map['is_XB'] = true;
    func_map['is_NEDA'] = true;
    func_map['is_QRT'] = true;
    func_map['is_GTO'] = true;
    func_map['is_DBL'] = true;
    func_map['is_DBKD'] = true;
    func_map['is_ESB'] = true;
    func_map['is_JWY'] = true;
    func_map['is_BOYOL'] = true;
    func_map['is_YS'] = true;
    if(func_map[function_name]){
        return true;
    }else{
        return false;
    }
}

// 自动生成的验证各快递公司运单号码的函数 

function is_DFH(val){var patrn=/^[0-9]{10}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}/;if (!patrn.exec(val)) return false;return true;}
function is_SY(val){var patrn=/^29[0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_YC(val){var patrn=/^96[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_EMS(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|^(10|11)[0-9]{11}$|^(50|51)[0-9]{11}$|^(95|97)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_YTO(val){var patrn=/^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^(8)[0-9]{17}|^(9)[0-9]{17}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZJS(val){var patrn=/^[a-zA-Z0-9]{10}$|^(42|16)[0-9]{8}$|^[aA][0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_SF(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_UC(val){var patrn=/^VIP[0-9]{9}|V[0-9]{11}|[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$|^(9001)[0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENINTE(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENSH(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENSZ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENBJ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENYW(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENGZ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_ZTOGZ(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_RUSTON(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_ZTOSH(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_GZFY(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_LTS(val){var patrn=/^[0-9]{9,12}$/;if (!patrn.exec(val)) return false;return true;}
function is_QFKD(val){var patrn=/^[0-9]{12}$|^[0-9]{15}$/;if (!patrn.exec(val)) return false;return true;}
function is_UAPEX(val){var patrn=/^\d{12}|\d{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_BJCS(val){var patrn=/^(CS[0-9]{13})$|^([0-9]{13})$|^([0-9]{9})$/;if (!patrn.exec(val)) return false;return true;}
function is_GDEMS(val){var patrn=/^[a-zA-Z]{2}[0-9]{9}[a-zA-Z]{2}$/;if (!patrn.exec(val)) return false;return true;}
function is_SURE(val){var patrn=/^[0-9]{11}[0-9]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_EYB(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|^(10|11)[0-9]{11}$|^(50|51)[0-9]{11}$|^(95|97)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZTO(val){var patrn=/^((765|852|779|359|528|751|358|618|680|778|780|768|688|689|618|828|988|118|128|888|571|518|010|628|205|880|882|717|718|728|738|761|762|763|701|757|719|881|120)[0-9]{9})$|^((2008|2010|8050|7518)[0-9]{8})$|^((36|37|53|54|55|56)[0-9]{10})$|^((4)[0-9]{11})$/;if (!patrn.exec(val)) return false;return true;}
function is_HZABC(val){var patrn=/^[0-9]{10,11}$|^T[0-9]{10}$|^FYPS[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_YUNDA(val){var patrn=/^(10|11|12|13|14|15|16|17|19|18|50|55|58|80|88|66|31)[0-9]{11}$|^[0-9]{13}$/;if (!patrn.exec(val)) return false;return true;}
function is_TTKDEX(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_CNEX(val){var patrn=/^[7,1,9][0-9]{9}$|^[7,1,9,0][0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_BEST(val){var patrn=/^[0-9]{11,12}$/;if (!patrn.exec(val)) return false;return true;}
function is_FEDEX(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_SHQ(val){var patrn=/^[A-Za-z0-9]*[0|2|4|6|8]$/;if (!patrn.exec(val)) return false;return true;}
function is_HTKY(val){var patrn=/^(A|B|C|D|E|H|0)(D|X|[0-9])(A|[0-9])[0-9]{10}$|^(21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|37|38|39|61)[0-9]{10}$|^(369|639|649|630|360)[0-9]{9}$|^(50|51)[0-9]{12}$|^(7)[0-9]{13}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZTKY(val){var patrn=/^K[0-9]{13}$|^K[0-9]{11}$|^[0-9]{10}$|^\d{15,}[-\d]+$|^[0-9]{10}|[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_XFWL(val){var patrn=/^130[0-9]{9}|135[0-9]{9}|13[7-9]{1}[0-9]{9}|18[8-9]{1}[0-9]{9}$/;if (!patrn.exec(val)) return false;return true;}
function is_STO(val){var patrn=/^(268|888|588|688|368|468|568|668|768|868|968)[0-9]{9}$|^(11|22|40|268|888|588|688|368|468|568|668|768|868|968)[0-9]{10}$|^(STO)[0-9]{10}$|^(33)[0-9]{11}$|^(4)[0-9]{12}$|^(55)[0-9]{11}$|^(66)[0-9]{11}$|^(77)[0-9]{11}$|^(88)[0-9]{11}$|^(99)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_LB(val){var patrn=/^[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$|^[0-9]{15}$|^[0-9]{15}-[1-9A-Z]{1}-[1-9A-Z]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_HOAU(val){var patrn=/^[A-Za-z0-9]{8,9}$/;if (!patrn.exec(val)) return false;return true;}
function is_FAST(val){var patrn=/^[0-9]{11,13}$|^(P330[0-9]{8})$|^(D[0-9]{11})$|^(319)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_POSTB(val){var patrn=/^[GA]{2}[0-9]{9}([2-5][0-9]|[1][1-9]|[6][0-5])$|^[99]{2}[0-9]{11}$|^[95]{2}[0-9]{11}$|^[96]{2}[0-9]{11}$|^[98]{2}[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_YCT(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_XB(val){var patrn=/[0-9]{8}/;if (!patrn.exec(val)) return false;return true;}
function is_NEDA(val){var patrn=/^((88|)[0-9]{10})$|^((1|2|3|5|)[0-9]{9})$|^(90000[0-9]{7})$/;if (!patrn.exec(val)) return false;return true;}
function is_QRT(val){var patrn=/^[0-9]{12,13}$/;if (!patrn.exec(val)) return false;return true;}
function is_GTO(val){var patrn=/^(3(([0-6]|[8-9])\d{8})|((2|4|5|6|7|8|9)\d{9})|(1|2|3|4|5|6|7|8|9)\d{11})$/;if (!patrn.exec(val)) return false;return true;}
function is_DBL(val){var patrn=/^[0-9]{8,10}$/;if (!patrn.exec(val)) return false;return true;}
function is_DBKD(val){var patrn=/^[0-9]{8,10}$/;if (!patrn.exec(val)) return false;return true;}
function is_ESB(val){var patrn=/[0-9a-zA-Z-]{5,20}/;if (!patrn.exec(val)) return false;return true;}
function is_OTHER(val){return true;}

