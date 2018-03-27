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
/**
 * Created by Jin on 2017/8/12.
 */
app.controller("bindShopCtrl", ["$scope", "$restClient", "$win", "$interval", function ($scope, $restClient, $win, $interval) {
    $scope.bindData = null;
    $scope.bindShopList = null;
    $scope.changeMobile = false;
    $scope.mobileCheckCode = null;
    $scope.bindShopCode = null;
    $scope.notAllow = false;
    $scope.errorMes = null;
    init();
    function init() {
        getList();
    }

    function getList() {
        var action = {
            successCallback: function (data) {
                $scope.bindData = data.data;
                $scope.bindShopList = data.data.bindShopList;
                $scope.mobile = $scope.bindData.bindPhoneNum;
            }, failCallback: function (data) {
                console.log(data);
                if (data.resultCode == "5000000" || data.resultCode == "5000001") {
                    $scope.notAllow = true;
                    $scope.errorMes = data.resultMessage;
                }
            }
        };
        $restClient.get('seller/shopBinding/list', null, action);
    }

    $scope.getModifyNumCode = function () {

        //计时器
        function startClock() {
            $scope.seconds = 60;
            $scope.enableSave = true;
            $scope.clock = $interval(function () {
                $scope.seconds--;
                if ($scope.seconds == 0) {
                    cancelClock();
                }
            }, 1000);
        }

        function cancelClock() {
            $scope.clock && $interval.cancel($scope.clock);
            $scope.enableSave = false;
            $scope.clock = null;
        }

        $restClient.get('seller/shopBinding/getModifyNumCode', {'phoneNum': $scope.mobile}, function (data) {

            if (data.resultCode == "0") {
                startClock();
            }

        })
    };

    $scope.getCheckCode = function () {

        //计时器
        function startClock() {
            $scope.seconds2 = 60;
            $scope.enableSave2 = true;
            $scope.clock2 = $interval(function () {
                $scope.seconds2--;
                if ($scope.seconds2 == 0) {
                    cancelClock();
                }
            }, 1000);
        }

        function cancelClock() {
            $scope.clock2 && $interval.cancel($scope.clock2);
            $scope.clock2 = null;
            $scope.enableSave2 = false;
        }

        $restClient.get('seller/shopBinding/checkCode', {'shopCode': $scope.shopCode}, function (data) {

            if (data.resultCode == "0") {
                $scope.checkMobile = data.data.checkMobile.substr(0, 3) + '****' + data.data.checkMobile.substr(7);
                startClock();
            }

        })
    };

    $scope.customizer = function () {
        return (/^1\d{10}$/.test($scope.mobile));
    };
    $scope.modifyMobile = function () {
        $restClient.post('seller/shopBinding/modifyMobile', {
            'mobile': $scope.mobile,
            'checkCode': $scope.mobileCheckCode
        }, null, function (data) {
            if (data.data) {
                $scope.changeMobile = !$scope.changeMobile;
                $scope.bindData.bindPhoneNum = $scope.mobile;
            }
        })
    };
    $scope.bindShop = function () {

        $restClient.put('seller/shopBinding', {
            'checkCode': $scope.bindShopCode,
            'shopCode': $scope.shopCode
        }, null, function (data) {

            if (data.data) {
                $win.alert('店铺绑定成功！');
                $scope.bindShopCode = null;
                $scope.shopCode = null;
                init();
            }

        })

    };
    $scope.relieveBind = function (bindShop) {
        var mes = {
            title: '您确定要解除与此店铺的关联吗？',
            content: '解除关联后使用此店铺电子面单的模板将失效。',
            img: "images/components/alert/alert-forbid.png",
            size: "sm",
            showClose: true,
            showCancel: true
        };
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            $restClient.post('seller/shopBinding/relieveBind', {'bindShopId': bindShop.shopId}, null, function (data) {
                if (data.data) {
                    init();
                }
            })
        });
    };
    $scope.changeToggle = function () {
        $scope.changeMobile = !$scope.changeMobile;
    }
}]);
/**
 * Created by Jin on 2016/12/3.
 */
app.controller('cancelWaybillCtrl',['$scope','$restClient','$q','$win','$location',function($scope,$restClient,$q,$win,$location){
    function init(){
        //分页相关
        getCompany();

        $scope.errorMes = '';
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

    $scope.cancel = function (){
        var waybillSearchModel = {
            expressCode:$scope.expressCode,
            expressNo:$scope.waybill
        };
        $scope.loading = $restClient.post('seller/waybill/cancel',null,waybillSearchModel,function(data){
            console.log(data.data);
            if(data.data.isSuccess){
                $win.alert({
                    type:'success',
                    content:'回收成功，请至电子面单记录中查看最终状态！'
                })
            }else{
                $scope.errorMes = data.data.errorMessage;
            }
        })
    };

    $scope.showLog = function(){

        $location.url('/print/waybillReport?isRecycle=1');
    }

}]);
/**
 * Created by Jin on 2016/5/30.
 */
app.factory('code', [function () {

    /**
     * @param templateCellList 模板单元格列表
     * @param package  包裹
     * @param receiptAddress 发货地址
     * @param type 类型 1：正常打印 2：自由打印
     * @returns {Array}
     */
    return {
        createCellValue: function (templateCellList, printPackage, baseData, type) {
            var _arr = [];
            if (templateCellList && templateCellList.length > 0) {
                for (var i = 0; i < templateCellList.length; i++) {
                    var cell = templateCellList[i];
                    //自定义文字，二维码，图片不替换
                    if (cell.entryCode != "bar_code_qr" && cell.entryCode != "custom_text" && cell.entryCode != "custom_image") {
                        cell.entryContent = "";
                    }
                    if (cell.replaceCode.indexOf("p.") > -1) {
                        //包裹
                        cell = replaceCodeWithPackage(cell, printPackage, baseData);
                    } else if (cell.replaceCode.indexOf("a.") > -1) {
                        if (type == 1) {
                            //发货地址
                            cell = replaceCodeWithReceiptAddress(cell, baseData.defaultReceiptAddress);
                        } else {
                            cell = replaceCodeWithReceiptAddressWithFree(cell, printPackage);
                        }
                    } else if (cell.replaceCode.indexOf("o.") > -1) {
                        //order 宝贝信息
                        cell = replaceCodeWithOrderItem(cell, printPackage, type);
                    } else {
                        //trade备注信息
                        if (cell.entryCode.indexOf("sys_memo") > -1 || cell.entryCode.indexOf("buyer_message") > -1 || cell.entryCode.indexOf("seller_memo") > -1) {
                            cell = replaceCodeWithTradeForMemo(cell, printPackage, type);
                        } else {
                            switch (cell.entryCode) {
                                case 'invoice_name':
                                    cell = replaceCodeWithTradeForTime(cell, printPackage, type);
                                    break;
                                case 'tid_num':
                                    cell = replaceCodeWithTradeLength(cell, printPackage, type);
                                    break;
                                case 'total_payment':
                                    cell = replaceCodeWithTradeForPrice(cell, printPackage, type);
                                    break;
                                case 'total_concessional_fee':
                                    cell = replaceCodeWithTradeForPrice(cell, printPackage, type);
                                    break;
                                case 'promotion_desc_nowrap':
                                    cell = replaceCodeWithTradeForPromotion(cell, printPackage, type);
                                    break;
                                case 'total_post_fee':
                                    cell = replaceCodeWithTradeForPrice(cell, printPackage, type);
                                    break;
                                case 'created':
                                    cell = replaceCodeWithTradeForTime(cell, printPackage, type);
                                    break;
                                case 'pay_time':
                                    cell = replaceCodeWithTradeForTime(cell, printPackage, type);
                                    break;
                                case 'radic':
                                    cell.entryContent = "√";
                                    break;

                            }
                        }
                    }
                    _arr.push(cell);
                }
            }
            return _arr;
        }

    }
    /**
     * 包裹值替换
     */
    function replaceCodeWithPackage(cell, p, baseData) {
        if (cell.entryCode == 'now_year_month_day' || cell.entryCode == 'now_time' || cell.entryCode == 'now_year' || cell.entryCode == 'now_month' || cell.entryCode == 'now_day') {
            cell = replaceCodeWithPackageForPrintTime(cell, p);//时间
        } else if (cell.entryCode == 'bar_code_qr_out_sid') {//二维码（运单号码）
            cell.entryContent = (p.expressNo != undefined) ? p.expressNo : "";
        } else if (cell.entryCode == 'bar_code_128_tid') {//条码（订单编号）
            cell.entryContent = (p.tid != undefined) ? p.tid : "";
        } else if (cell.entryCode == 'bar_code_128_out_sid') {//条码（运单号码-横版）
            cell.entryContent = (p.expressNo != undefined) ? p.expressNo : "";
        } else if (cell.entryCode == 'bar_code_rotate90_128_out_sid') {//条码（运单号码-竖版）
            cell.entryContent = (p.expressNo != undefined) ? p.expressNo : "";
        } else if (cell.entryCode == 'express_name_out_sid') {
            cell.entryContent = (p.expressNo != undefined) ? (baseData.userExpressTemp.userExpressName + " : " + p.expressNo ) : "";
        } else {
            cell = replaceCodeWithPackageForNormal(cell, p);
        }
        return cell;
    }

    /**
     * 包裹--打印时间替换（特殊判断）
     */
    function replaceCodeWithPackageForPrintTime(cell, p) {
        var entryContent = "";
        var oDate = new Date();
        if (cell.entryCode == 'now_year_month_day') {
            entryContent = oDate.getFullYear() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getDate();
        } else if (cell.entryCode == 'now_time') {
            entryContent = oDate.getHours() + ":" + oDate.getMinutes() + ":" + oDate.getSeconds();
        } else if (cell.entryCode == 'now_year') {
            entryContent = oDate.getFullYear();
        } else if (cell.entryCode == 'now_month') {
            entryContent = oDate.getMonth() + 1;
        } else {
            entryContent = oDate.getDate();
        }
        cell.entryContent = entryContent;
        return cell;
    }

    /**
     * 包裹--普通值替换
     */
    function replaceCodeWithPackageForNormal(cell, p) {
        var entryContent = "";
        var _arr = cell.replaceCode.split("@");
        for (var i = 0; i < _arr.length; i++) {
            if (_arr[i] != undefined && eval(_arr[i]) != undefined && "" != _arr[i]) {
                if (i == 0) {
                    entryContent = eval(_arr[i]);
                } else {
                    entryContent = entryContent + " " + eval(_arr[i]);
                }
            }
        }
        cell.entryContent = entryContent;
        return cell;
    }


    /**
     * 地址替换，打印主页面
     */
    function replaceCodeWithReceiptAddress(cell, a) {
        var entryContent = "";
        var _arr = cell.replaceCode.split("@");
        for (var i = 0; i < _arr.length; i++) {
            if (_arr[i] != undefined && eval(_arr[i]) != undefined && "" != _arr[i]) {
                if (i == 0) {
                    entryContent = eval(_arr[i]);
                } else {
                    entryContent = entryContent + " " + eval(_arr[i]);
                }
            }
        }
        cell.entryContent = entryContent;
        return cell;
    }

    /**
     * 地址替换，自由打印
     */
    function replaceCodeWithReceiptAddressWithFree(cell, printPackage) {
        var entryContent = "";
        if (cell.entryCode == "seller_name") {
            entryContent = (printPackage.contactName == undefined) ? "" : printPackage.contactName;
        } else if (cell.entryCode == "seller_state") {
            entryContent = (printPackage.province == undefined) ? "" : printPackage.province;
        } else if (cell.entryCode == "seller_city") {
            entryContent = (printPackage.city == undefined) ? "" : printPackage.city;
        } else if (cell.entryCode == "seller_district") {
            entryContent = (printPackage.country == undefined) ? "" : printPackage.country;
        } else if (cell.entryCode == "seller_address") {
            entryContent = (printPackage.addr == undefined) ? "" : printPackage.addr;
        } else if (cell.entryCode == "seller_full_address") {
            entryContent = ((printPackage.province == undefined) ? "" : printPackage.province) + " " + ((printPackage.city == undefined) ? "" : printPackage.city) + " " + ((printPackage.country == undefined) ? " " : printPackage.country) + " " + ((printPackage.addr == undefined) ? "" : printPackage.addr);
        } else if (cell.entryCode == "seller_mobile") {
            entryContent = (printPackage.mobilePhone == undefined) ? "" : printPackage.mobilePhone;
        } else if (cell.entryCode == "seller_phone") {
            entryContent = (printPackage.phone == undefined) ? "" : printPackage.phone;
        } else if (cell.entryCode == "seller_mobile_phone") {
            entryContent = ((printPackage.mobilePhone == undefined) ? "" : printPackage.mobilePhone) + " " + ((printPackage.phone == undefined) ? "" : printPackage.phone);
        } else if (cell.entryCode == "seller_zip") {
            entryContent = (printPackage.zipCode == undefined) ? "" : printPackage.zipCode;
        }
        cell.entryContent = entryContent;
        return cell;
    }

    /**
     * trad 价格替换
     */
    function replaceCodeWithTradeLength(cell, p, type) {
        var tradeList = getTradeList(p, type);
        if (tradeList != undefined) {
            cell.entryContent = tradeList.length;
        }
    }


    /**
     * trad 价格替换
     */
    function replaceCodeWithTradeForPrice(cell, p, type) {
        var price = 0;
        var tradeList = getTradeList(p, type);
        if (tradeList != undefined) {
            for (var i = 0; i < tradeList.length; i++) {
                var t = tradeList[i];
                if (cell.replaceCode && eval(cell.replaceCode)) {
                    price = price + eval(cell.replaceCode);
                }
            }
        }
        if (0 != price) {
            price = (parseInt(price) / 100).toFixed(2);
        }
        cell.entryContent = price;
    }


    /**
     * trad 时间替换
     */
    function replaceCodeWithTradeForTime(cell, p, type) {
        var entryContent = "";
        var tradeList = getTradeList(p, type);
        if (tradeList != undefined) {
            for (var i = 0; i < tradeList.length; i++) {
                var t = tradeList[i];
                if (cell.replaceCode != undefined && "" != cell.replaceCode) {
                    if (cell.entryCode == 'created' || cell.entryCode == 'pay_time') {
                        if (i == 0) {
                            entryContent = eval(cell.replaceCode);
                        }
                    } else {
                        entryContent = entryContent + (null == eval(cell.replaceCode) || undefined == eval(cell.replaceCode)) ? "" : eval(cell.replaceCode) + ";";
                        if (cell.entryCode == 'invoice_name') {
                            break;
                        }
                    }
                }
            }
        }
        cell.entryContent = entryContent;
    }


    /**
     * trad 优惠信息替换
     */
    function replaceCodeWithTradeForPromotion(cell, p, type) {
        var entryContent = "";
        var tradeList = getTradeList(p, type);
        if (tradeList != undefined) {
            for (var i = 0; i < tradeList.length; i++) {
                var t = tradeList[i];
                if (t.promotionDetailList != undefined) {
                    var prList = t.promotionDetailList;
                    for (var j = 0; j < prList.length; j++) {
                        var pr = prList[j];
                        if (cell.replaceCode != undefined && "" != cell.replaceCode) {
                            cell.replaceCode = cell.replaceCode.replace("t.", "");
                            entryContent = entryContent + ((null == eval(cell.replaceCode) || undefined == eval(cell.replaceCode)) ? "" : eval(cell.replaceCode)) + ";";
                        }
                    }
                }
            }
        }
        cell.entryContent = entryContent;
    }


    /**
     * trade 备注，留言，软件备注替换
     */
    function replaceCodeWithTradeForMemo(cell, p, type) {
        cell.entryContent = "";
        var sellerMemos = "";
        var buyerMessages = "";
        var sysMemos = "";
        var tradeList = getTradeList(p, type);
        if(type==1) {
            if (tradeList != undefined) {
                for (var i = 0; i < tradeList.length; i++) {
                    var trade = tradeList[i];
                    if (cell.entryCode.indexOf("seller_memo") > -1) {
                        if (trade.sellerMemo != undefined && "" != trade.sellerMemo) {
                            sellerMemos = sellerMemos + trade.sellerMemo + ";";
                        }
                    }
                    if (cell.entryCode.indexOf("buyer_message") > -1) {
                        if (trade.buyerMessage != undefined && "" != trade.buyerMessage) {
                            buyerMessages = buyerMessages + trade.buyerMessage + ";";
                        }
                    }
                    if (cell.entryCode.indexOf("sys_memo") > -1) {
                        if (trade.sysMemo != undefined && "" != trade.sysMemo) {
                            sysMemos = sysMemos + trade.sysMemo + ";";
                        }
                    }
                }
            }
        }else{
            if (cell.entryCode.indexOf("seller_memo") > -1) {
                if (p.sellerMemo){
                    sellerMemos = sellerMemos + p.sellerMemo + ";";
                }
            }
        }
        if ("" != sellerMemos) {
            cell.entryContent = "☆卖：" + sellerMemos + "\r\n";
            //cell.entryContent = sellerMemos + "\r\n";
        }
        if ("" != buyerMessages) {
            cell.entryContent = cell.entryContent + "☆买：" + buyerMessages + "\r\n";
            //cell.entryContent = cell.entryContent + buyerMessages + "\r\n";
        }
        if ("" != sysMemos) {
            cell.entryContent = cell.entryContent + "☆软：" + sysMemos;
            //cell.entryContent = cell.entryContent + sysMemos;
        }
    }


    /**
     * order item信息值替换
     */
    function replaceCodeWithOrderItem(cell, p, type) {
        var map = mergeOrderWithSameTitle(p, type);
        if (null == map || map.size == 0) {
            return;
        }
        var entryContent = "";
        var total = 0;
        var index = 0;
        for (var key in map) {
            var order = map[key];
            index = index + 1;
            switch (cell.entryCode) {
                case 'item_num':
                    total = total + order.num;
                    break;
                case 'total_item_fee':
                    total = total + order.payment;
                    break;
                case 'total_item_weight':
                    total = total + ((order.weight == undefined) ? 0 : order.weight);
                    break;
                case 'item_name_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + ";";
                    break;
                case 'item_name_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + ";\r\n";
                    break;
                case 'item_name_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + "*" + order.num + ";";
                    break;
                case 'item_name_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'outer_id_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + reaplaceSkuCode(order) + "," + "*" + order.num + ";";
                    break;
                case 'outer_id_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + reaplaceSkuCode(order) + "*" + order.num + ";\r\n";
                    break;
                case 'sku_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceSku(order) + "," + "*" + order.num + ";";
                    break;
                case 'sku_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceSku(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'item_name_sku_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + replaceSku(order) + "," + "*" + order.num + ";";
                    break;
                case 'item_name_sku_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + replaceSku(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'outer_id_sku_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + reaplaceSkuCode(order) + "," + replaceSku(order) + "," + "*" + order.num + ";";
                    break;
                case 'outer_id_sku_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + reaplaceSkuCode(order) + "," + replaceSku(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'item_name_outer_id_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + reaplaceSkuCode(order) + "," + "*" + order.num + ";";
                    break;
                case 'item_name_outer_id_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + reaplaceSkuCode(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'item_name_outer_id_sku_num_nowrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + reaplaceSkuCode(order) + "," + replaceSku(order) + "," + "*" + order.num + ";";
                    break;
                case 'item_name_outer_id_sku_num_wrap':
                    entryContent = entryContent + "(" + index + ")" + replaceAbbrevName(order) + "," + reaplaceSkuCode(order) + "," + replaceSku(order) + "," + "*" + order.num + ";\r\n";
                    break;
                case 'num_item_name_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + replaceAbbrevName(order) + ";\r\n";
                    break;
                case 'num_outer_id_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + reaplaceSkuCode(order) + ";\r\n";
                    break;
                case 'num_sku_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + replaceSku(order) + ";\r\n";
                    break;
                case 'num_item_name_sku_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + replaceAbbrevName(order) + "," + replaceSku(order) + ";\r\n";
                    break;
                case 'num_outer_id_sku_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + reaplaceSkuCode(order) + "," + replaceSku(order) + ";\r\n";
                    break;
                case 'num_item_name_outer_id_sku_wrap':
                    entryContent = entryContent + "(" + index + ")" + "*" + order.num + "," + replaceAbbrevName(order) + "," + reaplaceSkuCode(order) + "," + replaceSku(order) + ";\r\n";
                    break;
            }
        }
        if (cell.entryCode == 'item_num' || cell.entryCode == 'total_item_weight') {
            cell.entryContent = total;
        } else if (cell.entryCode == 'total_item_fee') {
            total = (parseInt(total) / 100).toFixed(2);
            cell.entryContent = total;
        } else {
            cell.entryContent = entryContent;
        }
    }


    function getTradeList(p, type) {
        var tradeList;
        if (type == 1) {
            tradeList = p.normalTradeList;
        } else {
            tradeList = p.freeTradeList;
        }
        return tradeList;
    }


    function getOrderList(t, type) {
        var orderList;
        if (type == 1) {
            orderList = t.normalOrderList;
        } else {
            orderList = t.freeOrderList;
        }
        return orderList;
    }


    function mergeOrderWithSameTitle(p, type) {
        var map = {};
        var tradeList = getTradeList(p, type);
        if (undefined == tradeList || null == tradeList) {
            return map;
        }
        for (var i = 0; i < tradeList.length; i++) {
            var t = tradeList[i];
            var orderList = getOrderList(t, type);
            if (orderList == undefined) {
                continue;
            }
            for (var j = 0; j < orderList.length; j++) {
                var order = orderList[j];
                if (order.title == undefined) {
                    continue;
                }
                var key = order.title;
                if (undefined != order.abbrevName && null != order.abbrevName && "" != order.abbrevName) {
                    key = order.abbrevName;
                }
                var sku = order.skuPropertiesName;
                if (undefined != order.skuChangeName && null != order.skuChangeName && "" != order.skuChangeName) {
                    sku = order.skuChangeName;
                }
                key = key + "@" + sku;
                var obj = map[key];
                if (null == obj || "" == obj || undefined == obj) {
                    obj = {};
                    obj.title = order.title;
                    obj.num = order.num;
                    obj.itemCode = (undefined == order.itemCode || null == order.itemCode) ? "" : order.itemCode;
                    obj.skuCode = (undefined == order.skuCode || null == order.skuCode) ? "" : order.skuCode;
                    obj.abbrevName = (undefined == order.abbrevName || null == order.abbrevName) ? "" : order.abbrevName;
                    obj.skuPropertiesName = (undefined == order.skuPropertiesName || null == order.skuPropertiesName) ? "" : order.skuPropertiesName;
                    obj.skuChangeName = (undefined == order.skuChangeName || null == order.skuChangeName) ? "" : order.skuChangeName;
                    obj.weight = (undefined == order.weight || null == order.weight) ? 0 : order.weight;
                    obj.price = order.price;
                    obj.payment = order.payment;
                } else {
                    obj.num = parseInt(obj.num) + parseInt(order.num);
                    obj.weight = parseInt(obj.weight) + parseInt((undefined == order.weight || null == order.weight) ? 0 : (order.weight * order.num));
                    obj.payment = parseInt(obj.payment) + parseInt(order.payment);
                }
                map[key] = obj;
            }
        }
        return map;
    }


    function replaceAbbrevName(order) {
        if (order.title == undefined) {
            return "";
        }
        if (undefined == order.abbrevName || null == order.abbrevName || "" == order.abbrevName) {
            return order.title;
        }
        return order.abbrevName;
    }


    function replaceSku(order) {
        if (order.skuPropertiesName == undefined) {
            return "";
        }
        var sku = order.skuPropertiesName;
        if (undefined != order.skuChangeName && null != order.skuChangeName && "" != order.skuChangeName) {
            sku = order.skuChangeName;
        }
        var args = sku.split(";");
        var returnStr = "";
        for (var i = 0; i < args.length; i++) {
            var str = args[i].split(":");
            if (str.length == 1){
                returnStr = ("" == returnStr) ? str[0] : returnStr + ";" + str[0];
            } else {
                returnStr = ("" == returnStr) ? str[1] : returnStr + ";" + str[1];
            }
        }
        return returnStr;
    }


    function reaplaceSkuCode(order) {
        var code = "";
        if (undefined != order.itemCode && null != order.itemCode && "" != order.itemCode) {
            code = order.itemCode;
        }
        if (undefined != order.skuCode && null != order.skuCode && "" != order.skuCode) {
            code = order.skuCode;
        }
        return code;
    }


}]);
//新增发货单模板
app.controller('invoiceTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', '$dpPrint', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state, $dpPrint) {

    /*$scope.addInvoice = function () {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/addInvoice.html",
            controller: "addInvoiceCtrl",
            size: 'lg'
        });
        modalInstance.result.then(function () {

        });

    };*/
    init();

    function init() {
       // LODOP = getLodop();
        getData();
        getBaseSetting();
    }
    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            console.log(data);
            $scope.baseSetting = data.data;
        });
    }
    function getData() {
       $scope.loading = $restClient.get('seller/userDeliveryTemplate/list', null, function (data) {
            console.log(data);
            $scope.deliveryTemplateList = data.data;
        });
    }


    $scope.setDefault = function (deliveryTemplate) {
        $restClient.postFormData('seller/userDeliveryTemplate/default', {id: deliveryTemplate.id}, function (data) {
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '设置成功'//内容
                });
                getData();
            }
        });
    };

    $scope.preview = function (deliveryTemplate) {
        var domElement = $('.deliveryTemplate');
        var baseData = {
            baseSetting: $scope.baseSetting
        };
        $dpPrint.printDelivery(true,baseData, null, null, [], domElement, deliveryTemplate.id);
    };

    $scope.edit = function (deliveryTemplate) {
        //页面跳转
        $location.url('/print/editDeliveryTemplate?id=' + deliveryTemplate.id);
    };

    $scope.delete = function (deliveryTemplate) {
        $restClient.deletes('seller/userDeliveryTemplate/delete', {id: deliveryTemplate.id}, function (data) {
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'//内容
                });
                getData();
            }
        });
    };

    $scope.printerLock = function (deliveryTemplate) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/deliveryPrinterLock.html",
            controller: "deliveryPrinterLockCtrl",
            resolve: {
                data: function () {
                    return angular.copy(deliveryTemplate);
                }
            }
        });
        modalInstance.result.then(function () {
            getData();
        });
    };

    //保存
    $scope.printerUnLock = function (deliveryTemplate) {
        deliveryTemplate.printerKey = null;
        $restClient.post('seller/userDeliveryTemplate/printerLock', null,deliveryTemplate, function (data) {
            if (data.data) {
                $modalInstance.close();
            }
        });
    };
}]);


app.controller('deliveryPrinterLockCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.deliveryTemplate = data;

    var iPrinterCount = LODOP.GET_PRINTER_COUNT();
    $scope.printerList = [];
    for (var i = 0; i < iPrinterCount; i++) {
        $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
    }

    //保存
    $scope.save = function (deliveryTemplate) {
        $restClient.post('seller/userDeliveryTemplate/printerLock', null,deliveryTemplate, function (data) {
            if (data.data) {
                $modalInstance.close();
            }
        });
    };

    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('destinationBigCtrl', ['$scope', '$modal', '$restClient', '$win','$q', function ($scope, $modal, $restClient, $win,$q) {
    function getProvince() {
        var defer = $q.defer();

        $restClient.post('seller/area/listByParentId', null, {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            $scope.areaId = $scope.province[0].id;
            defer.resolve();
        });

        return defer.promise;
    }
    function getCorrectionRange(){
        var defer = $q.defer();
        $restClient.get('seller/correctionRange', null, function (data) {
            //console.log(data);
            $scope.expressCo = data.data;
            $scope.express = $scope.expressCo[0];
            defer.resolve();
        });
        return defer.promise;
    }

    function restData() {
        $scope.TerminiIdsArray = [];           //已选择的目的地
        $scope.checkAll = false;                //全选
    }

    function init() {
        getProvince().then(getCorrectionRange).then($scope.search);

        $scope.areaId = '';                     //收货省份
        $scope.express = {                      //快递公司
            expressId: ''
        };
        $scope.noData = true;                  //没有搜索结果
        restData();
    }

    $scope.search = function () {

        var postEntity = {};

        postEntity.expressId = $scope.express == null ? '' : $scope.express.expressId;
        postEntity.areaId = $scope.areaId == null ? '' : $scope.areaId;

        $scope.loading = $restClient.postFormData('seller/terminiBigChar/list', postEntity, function (data) {
            $scope.TerminiBigChars = data.data;
            console.log(data);
            if (data.data.length != 0) {
                $scope.expressName = $scope.express.name;
                $scope.noData = false;
            } else {
                $scope.noData = true;
            }
        });

    };

    $scope.revert = function () {
        if ($scope.TerminiIdsArray.length == 0) {
            $win.alert('请先选择需要批量操作的地区');
            return false;
        }
        var ids = $scope.TerminiIdsArray.join(",");
        $restClient.postFormData('seller/terminiBigChar/revert', {ids: ids}, function (data) {
            //console.log(data);
            if (data.data) {
                $scope.search();
                restData();
            }

        });
    };

    $scope.selectAll = function () {
        $scope.checkAll = !$scope.checkAll;
        if($scope.checkAll) {
            angular.forEach($scope.TerminiBigChars, function (item) {
                if(!item.selected){
                    item.selected = true;
                    $scope.TerminiIdsArray.push(item.id)
                }
            });
        }else{
            angular.forEach($scope.TerminiBigChars, function (item) {
                if(item.selected){
                    item.selected = false;
                }
            });
            $scope.TerminiIdsArray =[];
        }
       // console.log($scope.TerminiIdsArray);
    };

    $scope.selectItem = function (TerminiBigChar) {
        TerminiBigChar.selected = !TerminiBigChar.selected;
        if (TerminiBigChar.selected) {
            $scope.TerminiIdsArray.push(TerminiBigChar.id);
        } else {
            var index = $scope.TerminiIdsArray.indexOf(TerminiBigChar.id);
            $scope.TerminiIdsArray.splice(index, 1);
            $scope.checkAll =false;
        }
        //console.log($scope.TerminiIdsArray);
    };

    $scope.editDestinationBig = function (TerminiBigChar) {
        if ((!TerminiBigChar) && $scope.TerminiIdsArray.length == 0) {
            $win.alert('请先选择需要批量操作的地区');
            return false;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/editDestinationBig.html",
            controller: "editDestinationBig",
            resolve: {
                data: function () {
                    return TerminiBigChar ? angular.copy(TerminiBigChar) : $scope.TerminiIdsArray;
                },
                expressName: function () {
                    return $scope.expressName;
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.search();
            restData();
        });
    };

    init();
}]);
app.controller('editDestinationBig', ['$scope', '$modalInstance', '$modal', 'data', 'expressName', '$restClient', function ($scope, $modalInstance, $modal, data, expressName, $restClient) {
    function init() {
        $scope.expressName = expressName;
        var batch = $scope.batch = (data instanceof Array);
        if (batch) {
            $scope.areaString = '共选择了' + data.length + '个';
            $scope.data = {};
            $scope.data.bigChar = '';
        } else {
            $scope.areaString = data.areaString.split(',')[0].split('_')[2];
            $scope.data = data;
        }
    }

    init();


    //console.log(data);

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        function update() {
            var params = {
                bigChar: $scope.data.bigChar,
                id: $scope.data.id
            };

            $restClient.postFormData('seller/terminiBigChar/update', params, function (data) {
                //console.log(data);
                data.data && $modalInstance.close();
            });
        }

        function updateBatch() {
            var params = {
                bigChar: $scope.data.bigChar,
                ids: data
            };

            $restClient.postFormData('seller/terminiBigChar/updateBatch', params, function (data) {
                //console.log(data);
                data.data && $modalInstance.close();
            });
        }

        $scope.batch ? updateBatch() : update();

    };

}]);
/**
 * Created by Jin on 2016/6/20.
 */
app.controller('editDeliveryTemplateCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$timeout', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $timeout) {

    $scope.tableStyle = {
        fontFamily: '',
        fontSize: '',
        lineHeight: ''
    };
    function getData() {
        var deferred = $q.defer();
        $restClient.get('seller/userDeliveryTemplate/form', {templateId: $location.search().id}, function (data) {
            console.log(data);
            $scope.entity = serverToClient(data.data);
            deferred.resolve();
        });
        return deferred.promise;
    }

    function init() {
        //LODOP = getLodop();
        $scope.isCreate = !$location.search().id;
        getData().then(getPrinterName);
    }

    init();

    function getPrinterName() {
        $timeout(function () {
            var iPrinterCount = LODOP.GET_PRINTER_COUNT();
            $scope.printerList = [];
            for (var i = 0; i < iPrinterCount; i++) {
                $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
            }
        }, 800)
    }

    function serverToClient(data) {
        // data.userDeliveryTemplate.width = transformMm(data.userDeliveryTemplate.width);
        // data.userDeliveryTemplate.height = transformMm(data.userDeliveryTemplate.height);
        $scope.tableStyle.fontFamily = data.userDeliveryTemplate.fontType;
        $scope.tableStyle.fontSize = data.userDeliveryTemplate.fontSize + 'px';
        $scope.tableStyle.lineHeight = data.userDeliveryTemplate.lineHeight + 'px';

        $scope.cellList = {};
        for (var i = 0; i < data.userTemplateCellList.length; i++) {
            $scope.cellList[data.userTemplateCellList[i].entryCode] = data.userTemplateCellList[i];

        }


        var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
        //检查是否是链接
        if (objExp.test($scope.cellList.activity_qrcode.entryContent) == true) {
            $('#code').qrcode({
                width: 90, //宽度
                height: 90, //高度
                text: $scope.cellList.activity_qrcode.entryContent //任意内容
            });
        }
        //console.log($scope.cellList);
        return data;
    }

    function clientToServer(data) {
        var userTemplateCellList = [];
        for (var i in $scope.cellList) {
            if ($scope.cellList[i].isShow) {
                userTemplateCellList.push($scope.cellList[i]);
            }
        }


        delete data.userTemplateCellList;
        data.userDeliveryTemplate.userTemplateCellList = userTemplateCellList;

        if (data.userDeliveryTemplate.paperType == 1) {
            data.userDeliveryTemplate.width = 210;
            data.userDeliveryTemplate.height = 297;
        } else if (data.userDeliveryTemplate.paperType == 2) {
            data.userDeliveryTemplate.width = 240;
            data.userDeliveryTemplate.height = 140;
        } else if (data.userDeliveryTemplate.paperType == 3) {
            data.userDeliveryTemplate.width = 240;
            data.userDeliveryTemplate.height = 93;
        }
        // data.userDeliveryTemplate.width = transformPx(data.userDeliveryTemplate.width);
        //data.userDeliveryTemplate.height = transformPx(data.userDeliveryTemplate.height);
        return data;
    }

    function transformPx(data) {
        return Math.round(data * 3.775) + 'px';
    }

    function transformMm(data) {
        return Math.round(parseInt(data) / 3.775);
    }

    $scope.decreaseY = function () {
        $scope.entity.userDeliveryTemplate.calibrationY--;

    };

    $scope.increaseY = function () {
        $scope.entity.userDeliveryTemplate.calibrationY++;
    };

    $scope.decreaseX = function () {
        $scope.entity.userDeliveryTemplate.calibrationX--;
    };

    $scope.increaseX = function () {
        $scope.entity.userDeliveryTemplate.calibrationX++;
    };

    $scope.save = function () {
        var postData = clientToServer($scope.entity);
        $scope.loading = $restClient.post('seller/userDeliveryTemplate/save', null, postData.userDeliveryTemplate, function (data) {
            console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '保存成功'//内容
                });
                $location.url('/print/deliveryTemplate');
            }
        });
    };

    $scope.back = function () {
        $location.url('/print/deliveryTemplate');
    };

    $scope.updateShopTitle = function (shopTitle) {
        var modal = $win.prompt({
            value: shopTitle.entryContent,
            windowTitle: '修改店铺名称',
            title: "店铺名称",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="text" class="form-control" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.shop_title.entryContent = data;
        });
    };

    $scope.updateCustomText = function (customText) {
        var modal = $win.prompt({
            value: customText.entryContent,
            windowTitle: '修改自定义名称',
            title: "自定义名称",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="text" class="form-control" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.custom_text.entryContent = data;
        });
    };

    $scope.addQrcode = function (activity_qrcode) {
        var modal = $win.prompt({
            value: activity_qrcode.entryContent,
            windowTitle: '二维码链接',
            title: "活动链接",
            templateBody:
            '  <div class="form-group">' +
            '   <div class="col-xs-12">' +
            '    <input type="url" class="form-control" name="URL" placeholder="输入活动链接" ng-model="data.value">' +
            '   </div>' +
            '  </div>'
        });
        modal.result.then(function (data) {
            $scope.cellList.activity_qrcode.entryContent = data;
            $('#code').html("");
            if (data) {
                $('#code').qrcode({
                    width: 90, //宽度
                    height: 90, //高度
                    text: data //任意内容
                });
            }
        });
    };


    //
    $scope.preview = function () {
        //选择打印机
        if (!$scope.entity.userDeliveryTemplate.printerKey) {
            $win.alert('请先选择打印机');
            return false;
        }


        //设置偏移
        LODOP.PRINT_INITA($scope.entity.userDeliveryTemplate.calibrationY + "mm", $scope.entity.userDeliveryTemplate.calibrationX + "mm", $scope.entity.userDeliveryTemplate.width + 'mm', $scope.entity.userDeliveryTemplate.height + 'mm', "");
        LODOP.SET_SHOW_MODE("LANGUAGE", 0);

        //设置本次输出的打印任务名
        LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "发货单");


        //设置纸张类型
        LODOP.SET_PRINT_PAGESIZE(1, $scope.entity.userDeliveryTemplate.width + "mm", $scope.entity.userDeliveryTemplate.height + "mm", "");

        var strFormHtml = angular.element("#delivery").html();
        LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', '<!DOCTYPE html>' + strFormHtml);

        angular.forEach($scope.entity.userTemplateCellList, function (TemplateCell) {
            if (TemplateCell.entryCode == "activity_qrcode") {

                var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
                //检查是否是链接
                if (objExp.test(TemplateCell.entryContent) == true) {
                    LODOP.ADD_PRINT_BARCODE(10, 0, 20 + 'mm', 20 + 'mm',
                        "QRCode", TemplateCell.entryContent);
                    LODOP.SET_PRINT_STYLEA(0, "GroundColor", "#ffffff");

                    var qr_version = 1;
                    if (TemplateCell.entryContent.length < 15) {
                        qr_version = 1;// 版本1只能编码14个字符
                    } else if (TemplateCell.entryContent.length < 27) {
                        qr_version = 2;// 版本2只能编码26个字符
                    } else if (TemplateCell.entryContent.length < 43) {
                        qr_version = 3;// 版本3只能编码42个字符
                    } else if (TemplateCell.entryContent.length < 85) {
                        qr_version = 5;// 版本5只能编码84个字符
                    } else if (TemplateCell.entryContent.length < 123) {
                        qr_version = 7;
                    } else if (TemplateCell.entryContent.length < 213) {
                        qr_version = 10;
                    } else {
                        qr_version = 14;
                    }
                    // 如果不指定版本，控件会自动选择版本
                    LODOP.SET_PRINT_STYLEA(0, "QRCodeVersion", qr_version);
                }
            }
        });

        LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);
        LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
        LODOP.SET_PRINTER_INDEXA($scope.entity.userDeliveryTemplate.printerKey);
        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    $win.alert({
                        type: "success",
                        content: '打印成功'//内容
                    });
                }
                else {
                    alert("放弃打印！");
                }
            };
            LODOP.PRINTA();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PRINTA()) {
            $win.alert({
                type: "success",
                content: '打印成功'//内容
            });
        }
        else {
            alert("放弃打印！");
        }


    };

}]);



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
/**
 * Created by Jin on 2016/7/26.
 */
app.controller('expressCompanyCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile','$location','$state', function ($scope, $modal, $restClient, $win, $q, $compile,$location,$state) {

    init();

    function init() {
        getData();
    }

    function getData() {
        $scope.loading = $restClient.get('seller/userExpress/list', null, function (data) {
            $scope.userExpressDtoList = data.data;
        });
    }

    //设置费率
    $scope.setRate = function (userExpress) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setRate.html",
            controller: "setRateCtrl",
            size: "lg",
            resolve: {
                data: function () {
                    return angular.copy(userExpress);
                }
            }
        });
        modalInstance.result.then(function (express) {
            express.faceCost = express.faceCost * 100;
            $restClient.post('seller/userExpress/faceCost', null, express, function (data) {
                init();
            })
        });
    };


    //设置识别词
    $scope.setKeyword = function (userExpress) {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/setKeyword.html",
            controller: "setKeywordCtrl",
            resolve: {
                data: function () {
                    return angular.copy(userExpress);
                }
            }
        });
        modalInstance.result.then(function (express) {
            $restClient.put('seller/userExpress/update', null, express, function (data) {
                init();
            })
        });
    };

}]);


app.controller('setRateCtrl', ['$scope', '$modalInstance','$restClient', 'data', function ($scope, $modalInstance,$restClient, data) {
    $scope.express = data;
    $scope.express.faceCost = $scope.express.faceCost/100;

    getDate();
    function serverToClient(data){
        angular.forEach(data,function(item){
            item.firstWeight = item.firstWeight/100;
            item.firstMoney = item.firstMoney/100;
            item.nextWeight = item.nextWeight/100;
            item.nextMoney = item.nextMoney/100;
        });
        return data;
    }
    function getDate(){
        $restClient.postFormData('seller/expressRate/list', {userExpressId:$scope.express.id}, function (data) {
            $scope.expressRateList=serverToClient(data.data);
            $scope.defaultExpressRate=$scope.expressRateList[0];
            $scope.provices = $scope.defaultExpressRate.provices;
            var index = $scope.expressRateList.indexOf($scope.defaultExpressRate);
            $scope.expressRateList.splice(index, 1);

        });
    }
    $scope.selectEdit = function (expressRate) {
        expressRate.edit = !expressRate.edit;
    }
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.express);
    }
    $scope.saveExpressRate = function (expressRate) {
        var expressRates=angular.copy(expressRate);
        expressRates.userExpressId=$scope.express.id;
        expressRates.firstWeight=expressRates.firstWeight*100;
        expressRates.firstMoney=expressRates.firstMoney*100;
        expressRates.nextWeight=expressRates.nextWeight*100;
        expressRates.nextMoney=expressRates.nextMoney*100;
        delete expressRates.edit;
        $restClient.post('seller/expressRate/save',null,expressRates, function (data) {
            getDate();
        });

    }
    $scope.addC=function(){
        var obj = {province:"",firstWeight:1,firstMoney:10,nextWeight:2,nextMoney:5,isDefault:0,edit:false};
        $scope.expressRateList.push(obj);
        $scope.selectEdit(obj);
    }

    $scope.delete=function(idx,expressRate){
        $scope.expressRateList.splice(idx,1);
        var params ={
            id:expressRate.id
        };
        if (null != expressRate.id){
            $restClient.deletes('seller/expressRate/delete', params, function (data) {
            });
        }
    }
}]);


app.controller('setKeywordCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.express = data;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.express);
    }
}]);
/**
 * Created by wsj on 2016/7/18.
 */
app.controller('freePrintedExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$filter', '$location', '$dpPrint', '$q', function ($scope, $modal, $restClient, $win, $filter, $location, $dpPrint, $q) {
    function getData(freePackageSearchModel, pageNo, pageSize) {
        pageSize && (freePackageSearchModel.pageSize = pageSize);
        freePackageSearchModel.pageNo = pageNo - 1;
        freePackageSearchModel.createStartTime = $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.createEndTime = $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printExpressStartTime = $scope.printExpressStartTime && moment($scope.printExpressStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printExpressEndTime = $scope.printExpressEndTime && moment($scope.printExpressEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printDeliveryStartTime = $scope.printDeliveryStartTime && moment($scope.printDeliveryStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.printDeliveryEndTime = $scope.printDeliveryEndTime && moment($scope.printDeliveryEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.isDelete = $scope.isDelete;
        freePackageSearchModel.orderby = "t.create_time";
        freePackageSearchModel.isPrintExpress = 2;
        $scope.loading = $restClient.post('seller/freePrintList/search', null, angular.copy(freePackageSearchModel), function (data) {
            $scope.data = data;
            $scope.freePackageList = data.data;
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
            $scope.FreePackageIdsArray = [];
            $scope.checkAll = false;
        });
    }

    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {

            $scope.baseSetting = data.data;
            $scope.freePackageSearchModel.freeSequencePrint = $scope.baseSetting.freeSequencePrint;
            getData($scope.freePackageSearchModel);
        });
    }

    function getAllExpress() {
        $restClient.get('seller/userExpress/list', null, function (data) {
            $scope.userExpress = data.data;

        });
    }

    function getFreeAddress() {
        $scope.loading = $restClient.get('seller/receiptAddress/getFreeAddress', null, function (data) {
            $scope.obj.defaultReceiptAddress = data.data;
            console.log(data);
        });
    }

    function init() {
        //分页相关
        $scope.pageNo = 1;
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.isCollapsed = false;
        $scope.limitTime1 = {
            startDate: '%y-%M-%d 00:00:00',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.limitTime2 = {
            startDate: '%y-%M-%d 23:59:59',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.createStartTime = moment().subtract(1, 'days').startOf("day")._d;
        $scope.createEndTime = moment().endOf("day")._d;

        $scope.obj = {
            userExpressTemp: '',
            defaultReceiptAddress: ''
        };
        $scope.resetData();
        getAllExpress();
        getBaseSetting();
        getFreeAddress();
        $scope.isDelete = 0;
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
    }

    $scope.resetData = function () {

        $scope.createStartTime = moment().subtract(1, 'days').startOf("day")._d;
        $scope.createEndTime = moment().endOf("day")._d;
        $scope.printExpressStartTime = null;
        $scope.printExpressEndTime = null;
        $scope.printDeliveryStartTime = null;
        $scope.printDeliveryEndTime = null;
        $scope.isDelete = 0;
        $scope.freePackageSearchModel = {
            orderby: " t.create_time",
            isPrintExpress: 2,
            createStartTime: $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss"),
            createEndTime: $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss")
        };
    };

    init();
    //展开详细
    $scope.expandAll = function (isCollapsed) {
        if (!isCollapsed) {
            $('.table .collapse').collapse('show');
        } else {
            $('.table .collapse').collapse('hide');
            //底部栏复原
            $timeout(function () {
                if ($('.operation-bar-wrap').offset().top < $(window).height()) {
                    $('.smart-float-bottom').css({position: 'inherit'});
                }
            }, 500);
        }


    };
    //订单排序
    $scope.setSort = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setFreePrintSort.html",
            controller: "setSortCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.baseSetting);
                }
            }
        });
        modalInstance.result.then(function (baseSetting) {
            $scope.baseSetting = baseSetting;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.put('seller/baseSetting/update', null, baseSetting, function (data) {
                $win.alert({
                    type: "success",
                    content: '设置排序成功'
                });
                $scope.freePackageSearchModel.freeSequencePrint = $scope.baseSetting.freeSequencePrint;
                data.data && getData($scope.freePackageSearchModel);
            });
        })
    };

    $scope.search = function (page, pageSize) {

        getData($scope.freePackageSearchModel, page, pageSize);
    };
    $scope.edit = function (freePackage) {
        //页面跳转
        $location.url('/print/freeprint?id=' + freePackage.id);
    };
    $scope.deleteExpressNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var allExistNum = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistNum = allExistNum && freePackage.freePackage.expressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });

        if (!allExistNum) {
            $win.alert('所选订单有不存在运单号，无法删除！');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法删除！');
            return false;
        }

        var packageIds = serverToClient($scope.FreePackageIdsArray);
        $restClient.postFormData('seller/freePrintList/deleteExpressNo', {"packageIds": packageIds}, function (data) {
            $win.alert({
                type: "success",
                content: "删除成功"
            });
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.expressNo = "";
            });
        });
    };
    $scope.uTemplate = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freeUserTemplate.html",
            controller: "freeUserTemplateCtrl",
            resolve: {
                data: function () {
                    return $scope.FreePackageIdsArray;
                }
            }
        });
        modalInstance.result.then(function (template) {
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.userExpressCode = template.userExpressCode;
                FreePackage.freePackage.userExpressId = template.userExpressId;
                FreePackage.freePackage.userExpressName = template.userExpressName;
                FreePackage.freePackage.userTemplateName = template.name;
                FreePackage.freePackage.userTemplateId = template.id;
                FreePackage.freePackage.userExpressTemplateCategory = template.category;
            });
        });
    };
    $scope.batchRemove = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var remind = $win.confirm({
            img: "images/components/alert/alert-delete.png",
            title: "你确定要删除所选订单吗？",
            content: "删除后系统将无法恢复其正常状态，请谨慎操作。"
        });
        remind.result.then(function () {
            var packageIds = serverToClient($scope.FreePackageIdsArray);
            $restClient.postFormData('seller/freePrintList/deletePackage', {"pids": packageIds}, function (data) {
                getData($scope.freePackageSearchModel, $scope.pageNo);
                $win.alert({
                    type: "success",
                    content: "删除成功"
                })
            });
        });
    };
    $scope.selectItem = function (freePackage) {
        if (freePackage.selected) {
            $scope.FreePackageIdsArray.push(freePackage);
            $scope.checkAll = $scope.FreePackageIdsArray.length == $scope.freePackageList.length
        } else {
            var index = $scope.FreePackageIdsArray.indexOf(freePackage);
            $scope.FreePackageIdsArray.splice(index, 1);
            $scope.checkAll = false;
        }
    };
    $scope.selectAll = function () {
        if ($scope.checkAll) {
            $scope.FreePackageIdsArray = $scope.freePackageList;
        } else {
            $scope.FreePackageIdsArray = [];
        }

        angular.forEach($scope.freePackageList, function (item) {
            item.selected = $scope.checkAll;
        });
        console.log($scope.freePackageList);
    };

    $scope.updateTemplateNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            alert("请最少选择一笔订单");
            return;
        }
        var allExistExpressNo = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistExpressNo = freePackage.freePackage.expressNo && allExistExpressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });
        if (!allExistExpressNo) {
            $win.alert('请将所有订单输入运单号');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法保存！');
            return false;
        }

        var entry = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
            return this.freePackage;
        }).get();

        $scope.message = '数据提交中。。';
        $scope.loading = $restClient.post('seller/freePrintList/updateExpressNo', null, entry, function (data) {
            $win.alert({
                type: "success",
                content: data.resultMessage
            });

        });
    };
    //批量打印
    $scope.batchPrint = function (preview, type) {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var printCallback;

        var FreePackageIdsArray = $($scope.FreePackageIdsArray).map(function () {
            return this.freePackage;
        }).get();

        var FirstTemplate = FreePackageIdsArray[0].userTemplateId;
        var userExpressId = FreePackageIdsArray[0].userExpressId;
        var sameTemplate = true;
        //选择多笔时快递模板是否相同
        if (FreePackageIdsArray.length > 1) {
            angular.forEach(FreePackageIdsArray, function (FreePackage) {
                sameTemplate = (FreePackage.userTemplateId == FirstTemplate)
            });
        }

        //获取已打印的包裹数
        var printedPackages = $($scope.FreePackageIdsArray).map(function () {                //获得已打印包裹
            if (type == 1) {                       //已打印过快递单
                if (this.freePackage.isPrintExpress) {
                    return this;
                }
            }
            if (type == 2) {                       //已打印过发货单
                if (this.freePackage.isPrintDeliveryBill) {
                    return this;
                }
            }
        }).get();
        //设置中开启了多次打印验证
        if ($scope.baseSetting.isCheckMorePrint && printedPackages.length > 0) {            //已开启多次打印验证且存在已打印订单
            var typeText = (type == 1 ? '快递单' : '发货单');
            var buttonText = (preview ? '预览' : '打印') + typeText;
            var modal = $win.confirm({                      //提醒文案
                content: '共勾选了' + '<span class="text-warning">【' + $scope.FreePackageIdsArray.length + '】</span>' + '笔订单,其中有'
                + '<span class="text-warning">【' + printedPackages.length + '】</span>' + '笔已打印过' + typeText,
                title: '含有已被打印过' + typeText + '的订单，是否要重新打印？',
                closeText: buttonText,
                size: "lg",
                img: "images/components/alert/alert-forbid.png"
            });
            modal.result.then(function () {
                //验证码确认
                return authCode();

            }).then(function () {

                getSerial().then(doPrint);
            })

        } else {

            getSerial().then(doPrint);
        }
        //验证码
        function authCode() {
            var deferred = $q.defer();

            var authModal = $modal.open({
                templateUrl: "views/pages/authModal.html",
                controller: "authModalCtrl"
            });
            authModal.result.then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        }

        //获取流水号
        function getSerial() {
            var deferred = $q.defer(),
                promise = deferred.promise;
            $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, FreePackageIdsArray, function (data) {
                console.log(data.data);
                angular.forEach(data.data, function (item) {
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        if (freePackage.freePackage.id == item.id) {
                            freePackage.freePackage.serial = item.serial;
                        }
                    })
                });
                deferred.resolve(data.data);

            });
            return promise;
        }

        //打印
        function doPrint(params) {
            if (type == 1) {
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printExpress', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printExpressTime = item.printExpressTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.isPrintExpress = item.isPrintExpress;
                                    freePackage.freePackage.printExpressNum = item.printExpressNum;
                                }
                            })
                        })
                    })
                };
                if (!sameTemplate) {
                    $win.alert('选择的订单快递模板不同，无法打印');
                    return false;
                } else {
                    $restClient.post('seller/userExpressTemplate/form', {
                        userExpressId: userExpressId,
                        templateId: FirstTemplate
                    }, null, function (data) {
                        $scope.obj.userExpressTemp = data.data.userExpressTemplate;
                        $scope.obj.baseSetting = $scope.baseSetting;

                        var isWaybill = (data.data.userExpressTemplate.category == 2);

                        console.log(data);
                        //是否是电子模板
                        if (isWaybill) {

                            var isInfoComplete = true;
                            var allExistNum = true;
                            //判读是否有必填信息和单号
                            angular.forEach(params, function (freePackage) {

                                isInfoComplete = isInfoComplete && (/*(freePackage.freeTradeList[0].freeOrderList && freePackage.freeTradeList[0].freeOrderList.length) &&*/ freePackage.receiverName
                                    && freePackage.receiverState && freePackage.receiverCity && freePackage.receiverDistrict
                                    && freePackage.receiverAddress && (freePackage.receiverMobile || freePackage.receiverPhone));

                                allExistNum = allExistNum && freePackage.waybillId;

                            });

                            //电子面单包裹收件人信息和商品信息不能为空
                            if (!isInfoComplete) {
                                $win.confirm({                      //提醒文案
                                    content: '您当前选择的包裹中有包裹收件人信息和商品信息不全，电子面单打印包裹收件人信息和商品信息必须不为空。',
                                    title: '电子面单，收件人信息和商品信息不能为空。',
                                    size: "lg",
                                    img: "images/components/alert/alert-forbid.png"
                                });
                                return false;
                            } else {
                                //如果都存在电子面单号不用获取单号
                                if (!allExistNum) {
                                    //获取电子面单回调函数
                                    var actions = {
                                        successCallback: function (data) {
                                            console.log(data);
                                            //获取后回调
                                            angular.forEach(data.data.successWaybillList, function (successWaybill) {
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    if (freePackage.freePackage.id == successWaybill.packageId) {
                                                        freePackage.freePackage.waybillId = successWaybill.id;
                                                        freePackage.freePackage.expressNo = successWaybill.expressNo;

                                                        freePackage.freePackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                                        freePackage.freePackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                                        freePackage.freePackage.userTemplateName = $scope.obj.userExpressTemp.name;
                                                        // freePackage.freePackage.expressId = $scope.obj.userExpressTemp.expressId;
                                                    }
                                                });

                                            });

                                            if (data.data.errorWaybillList.length != 0) {

                                                //显示获取单号失败原因
                                                $modal.open({
                                                    templateUrl: 'views/pages/applyWaybillResult.html',
                                                    controller: "recycleResultCtrl",
                                                    resolve: {
                                                        data: function () {
                                                            return {
                                                                errorRecycleList: data.data.errorWaybillList,
                                                                successRecycleList: data.data.successWaybillList
                                                            };
                                                        }
                                                    }
                                                });
                                            } else {
                                                //全部电子面单号获取成功
                                                var waybillIds = [];
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    waybillIds.push(freePackage.freePackage.waybillId)
                                                });
                                                //获取打印数据
                                                $restClient.post("seller/waybill/listPrintData", null, {
                                                    waybillIds: waybillIds,
                                                    userTemplateId: $scope.obj.userExpressTemp.id
                                                }, function (data) {
                                                    //电子面单打印
                                                    $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                                });
                                            }


                                        },
                                        failCallback: function (data) {
                                            //没开通||没设置网点
                                            if (data.resultCode == 900015 || data.resultCode == 900017) {
                                                $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
                                            } else
                                            //没余额
                                            {
                                                var mes = {
                                                    title: '获取电子面单号',
                                                    content: data.resultMessage,
                                                    img: "images/components/alert/alert-forbid.png",
                                                    size: "lg",
                                                    showClose: true,
                                                    showCancel: false
                                                };

                                                $win.confirm(mes);
                                            }

                                        }
                                    };
                                    //过滤掉已存在单号的包裹
                                    FreePackageIdsArray = FreePackageIdsArray.filter(function (freePackage) {
                                        if (!(freePackage.waybillId)) {
                                            return freePackage;
                                        }
                                    });

                                    var applyWaybillParamModel = {
                                        userExpressTemplateId: FirstTemplate,
                                        packageType: 2,
                                        freePackageList: FreePackageIdsArray
                                    };

                                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);


                                } else {

                                    var waybillIds = [];
                                    angular.forEach(params, function (freePackage) {
                                        waybillIds.push(freePackage.waybillId)
                                    });
                                    //获取打印数据
                                    $restClient.post("seller/waybill/listPrintData", null, {
                                        waybillIds: waybillIds,
                                        userTemplateId: $scope.obj.userExpressTemp.id
                                    }, function (data) {
                                        //电子面单打印
                                        $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                    });
                                }

                            }
                        } else {
                            //普通快递单打印
                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, params, 2);
                        }

                    });
                }
            } else if (type == 2) {
                var domElement = $('.deliveryTemplate');
                var baseData = {
                    baseSetting: $scope.baseSetting
                };
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printDeliveryBill', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printDeliveryBillTime = item.printDeliveryBillTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.printDeliveryBillNum = item.printDeliveryBillNum;
                                    freePackage.freePackage.isPrintDeliveryBill = item.isPrintDeliveryBill;

                                }
                            })
                        })
                    })
                };
                $dpPrint.printDelivery(preview, baseData, printCallback, params, params, domElement);
            }
        }
    };

    $scope.viewLog = function (freePackage) {
        var modalInstance = $modal.open({
            templateUrl: "views/components/freePrintLog.html",
            controller: "freePrintLogCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    return angular.copy(freePackage);
                }
            }
        });

    };

    $scope.copyTrade = function (freePackage) {
        var remind = $win.confirm({
            img: "images/components/alert/alert-forbid.png",
            title: "你确定要复制当前订单信息吗？",
            content: "系统将此笔订单信息复制后直接插入至录入打印界面"
        });
        remind.result.then(function () {
            /*$restClient.post('seller/freePrintList/copyPackage', null, freePackage.id, function (data) {
             $location.url('/print/freeprint?id=' + data.data.id);
             });*/
            $location.url('/print/freeprint?copyId=' + freePackage.id);
        });
    };
    //联想快递单号
    $scope.associateExpressNo = function (onePackage, isConsign) {
        // onePackage.smart = true;
        var packages = $scope.FreePackageIdsArray;

        if (packages.length > 1) {                           //选择了多笔订单
            var index = -1;
            angular.forEach(packages, function (Package, i) {
                if (Package.freePackage.id == onePackage.freePackage.id) {
                    index = i;
                }
            });
            if (index == -1) {                                  //若点击的包裹非选中
                inputOneExpressNo();
                return false;
            }
            if (index > 0) {                               //若点击的包裹非首个
                packages.splice(0, index);                      //截取点击位以下包裹

            }

            console.log(packages);
            packages.length > 1 ? inputBatchExpressNo(packages) : inputOneExpressNo();

        } else {
            inputOneExpressNo();
        }
        function inputOneExpressNo() {      //单个联想
            if (onePackage.freePackage.expressNo) {
                $win.alert('已经输入了运单号码，不能联想输入');
                return false;
            } else {
                $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: onePackage.freePackage.userTemplateId}, function (data) {
                    console.log(data);
                    if (data.data) {
                        onePackage.freePackage.expressNo = window.getNextSid(onePackage.freePackage.userExpressName, data.data, 1);
                        //打印后的联想
                        isConsign && showExpressNo([onePackage], isConsign, onePackage.freePackage.expressNo, onePackage.freePackage.userExpressName);
                    } else {
                        $win.alert('尚未保存过' + onePackage.freePackage.userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                            '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                    }
                });
            }
        }

        function showExpressNo(packages, isConsign, sidStart, userExpressName, lastSid) {
            $modal.open({
                templateUrl: "views/pages/remindExpressNo.html",
                controller: "remindExpressNoCtrl",
                resolve: {
                    data: function () {
                        return angular.copy({
                            sidStart: sidStart,
                            lastSid: lastSid,
                            packages: packages,
                            userExpressName: userExpressName,
                            isConsign: isConsign
                        });
                    }
                }
            });

        }

        function inputBatchExpressNo(packages) {        //多个联想
            var existExpressNo = false;                 //非首个是否存在运单号

            angular.forEach(packages, function (Package, i) {
                if (i > 0 && Package.freePackage.expressNo) {
                    existExpressNo = true;
                }
            });
            if (existExpressNo) {
                var mes = {
                    title: '已存在运单号！',
                    content: '当前选择联想的订单已存在运单号，是否覆盖这些运单号码？',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var cover = $win.confirm(mes);
                cover.result.then(function () {
                    inputExpressNo();
                });
            } else {
                inputExpressNo();
            }
            function inputExpressNo() {
                var sidStart;
                var userExpressName = packages[0].freePackage.userExpressName;
                var userTemplateId = packages[0].freePackage.userTemplateId;
                if (packages[0].freePackage.expressNo) {              //第一个包裹是否存在运单号
                    sidStart = packages[0].freePackage.expressNo;
                    var firstPackage = packages[0];
                    packages.shift();
                    replaceExpressNo(sidStart, userExpressName);
                    //加回原来的元素
                    packages.unshift(firstPackage);
                    showExpressNo(packages, isConsign, sidStart, firstPackage.freePackage.userExpressName, packages[packages.length - 1].freePackage.expressNo);
                } else {
                    getSidStart(userExpressName, userTemplateId);

                }


                function getSidStart(userExpressName, userTemplateId) {                            //获取订单号
                    $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: userTemplateId}, function (data) {
                        console.log(data);
                        if (data.data) {
                            sidStart = data.data;
                            replaceExpressNo(sidStart, userExpressName);
                            showExpressNo(packages, isConsign, window.getNextSid(userExpressName, sidStart, 1), userExpressName, packages[packages.length - 1].freePackage.expressNo);
                        } else {
                            $win.alert('尚未保存过' + userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                                '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                        }
                    });
                }

                function replaceExpressNo(sidStart, userExpressName) {           //替换订单号
                    angular.forEach(packages, function (Package, i) {
                        var index = 1 + i;
                        Package.freePackage.expressNo = window.getNextSid(userExpressName, sidStart, index);
                    });
                }
            }
        }
    };
    //导出数据
    $scope.exportData = function () {

        function transform(data, url) {
            if (typeof  data != "object") {
                return;
            }
            var form = $("<form>");
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('method', 'post');
            form.attr('action', url);

            for (var i in data) {
                if (data[i] != null && data[i] != 'undefined') {
                    var input = $('<input>');
                    input.attr('name', i);
                    input.attr('value', data[i]);
                    input.attr('type', 'hidden');
                    form.append(input);
                }
            }
            document.body.appendChild(form[0]);
            return form;
        }

        if ($scope.createStartTime) {
            $scope.freePackageSearchModel.createStartTime = moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.createStartTime =null;
        }
        if ($scope.createEndTime) {
            $scope.freePackageSearchModel.createEndTime = moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.createEndTime =null;
        }
        if ($scope.printExpressStartTime) {
            $scope.freePackageSearchModel.printExpressStartTime = moment($scope.printExpressStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printExpressStartTime =null;
        }
        if ($scope.printExpressEndTime) {
            $scope.freePackageSearchModel.printExpressEndTime = moment($scope.printExpressEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printExpressEndTime =null;
        }
        if ($scope.printDeliveryStartTime) {
            $scope.freePackageSearchModel.printDeliveryStartTime = moment($scope.printDeliveryStartTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printDeliveryStartTime = null;
        }
        if ($scope.printDeliveryEndTime) {
            $scope.freePackageSearchModel.printDeliveryEndTime = moment($scope.printDeliveryEndTime).format("YYYY/MM/DD HH:mm:ss");
        }else{
            $scope.freePackageSearchModel.printDeliveryEndTime = null;
        }

        $scope.freePackageSearchModel.isDelete = $scope.isDelete;
        delete $scope.freePackageSearchModel.pageNo;
        delete $scope.freePackageSearchModel.pageSize;
        var form = transform($scope.freePackageSearchModel, "/seller/freePrintList/export");

        form.submit();
    };

    function serverToClient(data) {
        var pids = "";
        angular.forEach(data, function (item) {
            pids = pids + item.freePackage.id + ",";
        });
        return pids;
    }

    $scope.recycleWaybill = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var mes = {
            title: '你确定要回收当前绑定的电子面单号吗？',
            content: '回收后可以重新申请新的电子面单号或用其他的模板重新打印。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var actions = {
            successCallback: function (data) {
                //全部成功
                if (data.data.errorRecycleList.length == 0) {
                    angular.forEach($scope.FreePackageIdsArray, function (Package) {
                        Package.freePackage.expressNo = "";
                    });
                    $win.alert({
                        content: '回收成功',
                        type: 'success'
                    })
                } else {
                    //显示打印结果
                    $modal.open({
                        templateUrl: 'views/pages/recycleResult.html',
                        controller: "recycleResultCtrl",
                        resolve: {
                            data: function () {
                                return data.data;
                            }
                        }
                    });
                    //批量时回调成功的
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                            if (successPackage.packageId == freePackage.freePackage.id) {
                                freePackage.freePackage.expressNo = "";
                            }
                        });
                    });


                }

            }
        };
        var allExistNum = true;
        //是否都存在电子面单号
        angular.forEach($scope.FreePackageIdsArray, function (Package) {
            allExistNum = (Package.freePackage.waybillId) && Package.freePackage.expressNo && allExistNum;
        });
        if (!allExistNum) {
            $win.alert("有订单不存在电子面单号，无法回收！");
            return false;
        }
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            var recycleWaybillParams = {
                packageType: 2
            };
            recycleWaybillParams.freePackageList = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
                return this.freePackage;
            }).get();

            $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
        })

    }

}]);

app.controller('freeUserTemplateCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', 'data', function ($scope, $modalInstance, $modal, $restClient, $win, $q, $compile, $location, $state, data) {
    $scope.data = data;
    function getAllTemplate() {
        $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.userTemplate = data.data;
        });
    }

    getAllTemplate();

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function (template) {
        var packageIds = serverToClient($scope.data);
        var entry = {
            "packageIds": packageIds,
            "tempId": template.id
        };
        $restClient.postFormData('seller/freePrintList/updateExpressTemple', entry, function (data) {
            data.data && $modalInstance.close(template);

        });
    };

    function serverToClient(data) {
        var pids = "";
        angular.forEach(data, function (item) {
            pids = pids + item.freePackage.id + ",";

        });
        pids = pids.substr(0, pids.length - 1);
        return pids;
    }
}]);
/**
 * Created by wsj on 2016/7/18.
 */
app.controller('freeUnprintedExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$filter', '$location', '$modifyTemplate', '$dpPrint', '$timeout', '$q', function ($scope, $modal, $restClient, $win, $filter, $location, $modifyTemplate, $dpPrint, $timeout, $q) {
    function getData(freePackageSearchModel, pageNo, pageSize) {
        pageSize && (freePackageSearchModel.pageSize = pageSize);
        freePackageSearchModel.pageNo = pageNo - 1;
        freePackageSearchModel.createStartTime = $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.createEndTime = $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss");
        freePackageSearchModel.isDelete = $scope.isDelete;
        freePackageSearchModel.orderby = "t.create_time";
        freePackageSearchModel.isPrintExpress = 0;

        $scope.loading = $restClient.post('seller/freePrintList/search', null, freePackageSearchModel, function (data) {
            console.log(data.data);
            $scope.data = data;
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
            $scope.freePackageList = data.data;
            $scope.FreePackageIdsArray = [];
            $scope.checkAll = false;
        });
    }

    function getAllExpress() {
        $restClient.get('seller/userExpress/list', null, function (data) {
            $scope.userExpress = data.data;
        });
    }

    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            $scope.baseSetting = data.data;
            $scope.freePackageSearchModel.freeSequence = $scope.baseSetting.freeSequence;
            getData($scope.freePackageSearchModel, $scope.pageNo);
        });
    }

    function getFreeAddress() {
        $restClient.get('seller/receiptAddress/getFreeAddress', null, function (data) {
            $scope.obj.defaultReceiptAddress = data.data;
        });
    }

    function serverToClientSaveTempNo(checkPackageList, allPackageList) {
        var tempNo = "";
        var packageList = [];
        angular.forEach(checkPackageList, function (item) {
            var pid = item.freePackage.id;
            angular.forEach(allPackageList, function (allItem) {
                var allPid = allItem.freePackage.id;
                if (pid == allPid) {

                    packageList.push(allItem.freePackage);

                    if (allItem.freePackage.expressNo) {
                        tempNo = tempNo + allItem.freePackage.expressNo + ",";
                    }

                }
            });
        });
        tempNo = tempNo.substr(0, tempNo.length - 1);
        return tempNo;
    }

    function serverToClient(data) {
        var pids = "";
        angular.forEach(data, function (item) {
            pids = pids + item.freePackage.id + ",";
        });
        pids = pids.substr(0, pids.length - 1);
        return pids;
    }

    function clientToServer(freePackageList) {
        var list = angular.copy(freePackageList);
        var array = [];
        angular.forEach(list, function (freePackage) {
            array.push(freePackage.freePackage);
        });
        return array;
    }

    function init() {
        //分页相关
        $scope.pageNo = 1;
        $scope.message = '加载数据中。。';
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.isCollapsed = false;
        $scope.limitTime1 = {
            /* startDate: '%y-%M-%d 00:00:00'*/
        };
        $scope.limitTime2 = {
            /* startDate: '%y-%M-%d 23:59:59'*/
        };
        $scope.obj = {
            userExpressTemp: '',
            defaultReceiptAddress: ''
        };

        $scope.resetData();
        getAllExpress();
        getBaseSetting();
        getFreeAddress();
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
    }

    $scope.resetData = function () {
        $scope.createStartTime = moment().add(-1, 'days').startOf("day")._d;
        $scope.createEndTime = moment().endOf("day")._d;
        $scope.isDelete = 0;
        $scope.freePackageSearchModel = {
            orderby: " t.create_time",
            isPrintExpress: 0,
            createStartTime: $scope.createStartTime && moment($scope.createStartTime).format("YYYY/MM/DD HH:mm:ss"),
            createEndTime: $scope.createEndTime && moment($scope.createEndTime).format("YYYY/MM/DD HH:mm:ss"),
            pageSize: $scope.pageSize,
            pageNo: $scope.pageNo
        };
    };
    init();
    //展开详细
    $scope.expandAll = function (isCollapsed) {
        if (!isCollapsed) {
            $('.table .collapse').collapse('show');
        } else {
            $('.table .collapse').collapse('hide');
            //底部栏复原
            $timeout(function () {
                if ($('.operation-bar-wrap').offset().top < $(window).height()) {
                    $('.smart-float-bottom').css({position: 'inherit'});
                }
            }, 500);
        }


    };
    //订单排序
    $scope.setSort = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setFreeSort.html",
            controller: "setSortCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.baseSetting);
                }
            }
        });
        modalInstance.result.then(function (baseSetting) {
            $scope.baseSetting = baseSetting;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.put('seller/baseSetting/update', null, baseSetting, function (data) {
                $win.alert({
                    type: "success",
                    content: '设置排序成功'
                });
                $scope.freePackageSearchModel.freeSequence = $scope.baseSetting.freeSequence;
                data.data && getData($scope.freePackageSearchModel);
            });
        })
    };
    //更换寄件人信息
    $scope.updateSender = function () {
        if ($scope.FreePackageIdsArray.length == 0) {
            $win.alert("请最少选择一笔订单");
            return false;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/changeAddress.html",
            controller: "changeAddressCtrl",
            size: "lg"
        });
        modalInstance.result.then(function (sellerAddress) {
            console.log(sellerAddress);
            //$scope.address = sellerAddress;
            $restClient.post('seller/freePrintList/batchUpdateReceiptAddress', {contactId: sellerAddress.contactId}, clientToServer($scope.FreePackageIdsArray), function (data) {
                console.log(data.data);
                angular.forEach(data.data, function (returnFreePackage) {
                    var packageId = returnFreePackage.id;
                    angular.forEach($scope.freePackageList, function (freePackage) {
                        if (freePackage.freePackage.id == packageId) {
                            freePackage.freePackage = returnFreePackage;
                        }

                    })
                });

            })
        })
    };
    $scope.search = function (page, pageSize) {
        getData($scope.freePackageSearchModel, page, pageSize);
    };
    $scope.edit = function (freePackage) {
        //页面跳转
        $location.url('/print/freeprint?id=' + freePackage.id);
    };
    $scope.deleteExpressNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return false;
        }
        var allExistNum = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistNum = allExistNum && freePackage.freePackage.expressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });

        if (!allExistNum) {
            $win.alert('所选订单有不存在运单号，无法删除！');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法删除！');
            return false;
        }

        var packageIds = serverToClient($scope.FreePackageIdsArray);
        $restClient.postFormData('seller/freePrintList/deleteExpressNo', {"packageIds": packageIds}, function (data) {
            $win.alert({
                type: "success",
                content: "删除成功"
            });
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.expressNo = "";
            });
        });
    };
    $scope.uTemplate = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freeUserTemplate.html",
            controller: "freeUserTemplateCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.FreePackageIdsArray);
                }
            }
        });
        modalInstance.result.then(function (template) {
            console.log(template);
            angular.forEach($scope.FreePackageIdsArray, function (FreePackage) {
                FreePackage.freePackage.userExpressCode = template.userExpressCode;
                FreePackage.freePackage.userExpressId = template.userExpressId;
                FreePackage.freePackage.userExpressName = template.userExpressName;
                FreePackage.freePackage.userTemplateName = template.name;
                FreePackage.freePackage.userTemplateId = template.id;
                FreePackage.freePackage.userExpressTemplateCategory = template.category;
            });
        });
    };
    $scope.batchRemove = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var remind = $win.confirm({
            img: "images/components/alert/alert-delete.png",
            title: "你确定要删除所选订单吗？",
            content: "删除后系统将无法恢复其正常状态，请谨慎操作。"
        });
        remind.result.then(function () {
            var packageIds = serverToClient($scope.FreePackageIdsArray);
            $restClient.postFormData('seller/freePrintList/deletePackage', {"pids": packageIds}, function (data) {
                getData($scope.freePackageSearchModel);
                $win.alert({
                    type: "success",
                    content: "删除成功"
                })
            });
        });
    };
    $scope.selectItem = function (freePackage) {
        if (freePackage.selected) {
            $scope.FreePackageIdsArray.push(freePackage);
            $scope.checkAll = $scope.FreePackageIdsArray.length == $scope.freePackageList.length
        } else {
            var index = $scope.FreePackageIdsArray.indexOf(freePackage);
            $scope.FreePackageIdsArray.splice(index, 1);
            $scope.checkAll = false;
        }
    };
    $scope.selectAll = function () {
        if ($scope.checkAll) {
            $scope.FreePackageIdsArray = $scope.freePackageList;
        } else {
            $scope.FreePackageIdsArray = [];
        }

        angular.forEach($scope.freePackageList, function (item) {
            item.selected = $scope.checkAll;
        });
        console.log($scope.freePackageList);
    };

    $scope.updateTemplateNo = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var allExistExpressNo = true;
        var isWaybill = false;
        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
            allExistExpressNo = freePackage.freePackage.expressNo && allExistExpressNo;
            isWaybill = isWaybill || freePackage.freePackage.waybillId;
        });
        if (!allExistExpressNo) {
            $win.alert('请将所有订单输入运单号');
            return false;
        }
        if(isWaybill){
            $win.alert('当前所选订单中存在电子面单，无法保存！');
            return false;
        }

        var entry = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
            return this.freePackage;
        }).get();

        $scope.message = '数据提交中。。';
        $scope.loading = $restClient.post('seller/freePrintList/updateExpressNo', null, entry, function (data) {
            console.log(data.data);
            $win.alert({
                type: "success",
                content: data.resultMessage
            });

        });
    };
    //批量打印
    $scope.batchPrint = function (preview, type) {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var printCallback;

        var FreePackageIdsArray = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
            return this.freePackage;
        }).get();

        var FirstTemplate = FreePackageIdsArray[0].userTemplateId;
        var userExpressId = FreePackageIdsArray[0].userExpressId;

        var sameTemplate = true;

        //模板是否是同一快递公司
        if (FreePackageIdsArray.length > 1) {
            angular.forEach(FreePackageIdsArray, function (FreePackage) {
                sameTemplate = (FreePackage.userTemplateId == FirstTemplate)
            });
        }

        //获取已打印的包裹数
        var printedPackages = $($scope.FreePackageIdsArray).map(function () {                //获得已打印包裹
            if (type == 1) {                       //已打印过快递单
                if (this.freePackage.isPrintExpress) {
                    return this;
                }
            }
            if (type == 2) {                       //已打印过发货单
                if (this.freePackage.isPrintDeliveryBill) {
                    return this;
                }
            }
        }).get();

        //设置中开启了多次打印验证
        if ($scope.baseSetting.isCheckMorePrint && printedPackages.length > 0) {            //已开启多次打印验证且存在已打印订单
            var typeText = (type == 1 ? '快递单' : '发货单');
            var buttonText = (preview ? '预览' : '打印') + typeText;
            var modal = $win.confirm({                      //提醒文案
                content: '共勾选了' + '<span class="text-warning">【' + $scope.FreePackageIdsArray.length + '】</span>' + '笔订单,其中有'
                + '<span class="text-warning">【' + printedPackages.length + '】</span>' + '笔已打印过' + typeText,
                title: '含有已被打印过' + typeText + '的订单，是否要重新打印？',
                closeText: buttonText,
                size: "lg",
                img: "images/components/alert/alert-forbid.png"
            });
            modal.result.then(function () {
                //验证码确认
                return authCode();

            }).then(function () {

                getSerial().then(doPrint);
            })

        } else {

            getSerial().then(doPrint);
        }
        //验证码
        function authCode() {
            var deferred = $q.defer();

            var authModal = $modal.open({
                templateUrl: "views/pages/authModal.html",
                controller: "authModalCtrl"
            });
            authModal.result.then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        }

        function getSerial() {
            var deferred = $q.defer(),
                promise = deferred.promise;
            $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, FreePackageIdsArray, function (data) {
                console.log(data.data);
                angular.forEach(data.data, function (item) {
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        if (freePackage.freePackage.id == item.id) {
                            freePackage.freePackage.serial = item.serial;
                        }
                    })
                });
                deferred.resolve(data.data);

            });
            return promise;
        }

        function doPrint(params) {
            if (type == 1) {
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printExpress', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printExpressTime = item.printExpressTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.isPrintExpress = item.isPrintExpress;
                                    freePackage.freePackage.printExpressNum = item.printExpressNum;
                                }
                            })
                        })

                    })
                };

                if (!sameTemplate) {
                    $win.alert('选择的订单快递模板不同，无法打印');
                    return false;
                } else {
                    //请求快递模板
                    $restClient.post('seller/userExpressTemplate/form', {
                        userExpressId: userExpressId,
                        templateId: FirstTemplate
                    }, null, function (data) {
                        $scope.obj.userExpressTemp = data.data.userExpressTemplate;
                        $scope.obj.baseSetting = $scope.baseSetting;

                        var isWaybill = (data.data.userExpressTemplate.category == 2);

                        console.log(data);
                        //是否是电子模板
                        if (isWaybill) {

                            var isInfoComplete = true;
                            var allExistNum = true;
                            //判读是否有必填信息和单号
                            angular.forEach(params, function (freePackage) {

                                isInfoComplete = isInfoComplete && (/*(freePackage.freeTradeList[0].freeOrderList && freePackage.freeTradeList[0].freeOrderList.length) &&*/ freePackage.receiverName
                                    && freePackage.receiverState && freePackage.receiverCity && freePackage.receiverDistrict
                                    && freePackage.receiverAddress && (freePackage.receiverMobile || freePackage.receiverPhone));

                                allExistNum = allExistNum && freePackage.waybillId;

                            });

                            //电子面单包裹收件人信息和商品信息不能为空
                            if (!isInfoComplete) {
                                $win.confirm({                      //提醒文案
                                    content: '您当前选择的包裹中有包裹收件人信息和商品信息不全，电子面单打印包裹收件人信息和商品信息必须不为空。',
                                    title: '电子面单，收件人信息和商品信息不能为空。',
                                    size: "lg",
                                    img: "images/components/alert/alert-forbid.png"
                                });
                                return false;
                            } else {
                                //如果都存在电子面单号不用获取单号
                                if (!allExistNum) {
                                    //获取电子面单回调函数
                                    var actions = {
                                        successCallback: function (data) {
                                            console.log(data);
                                            //获取后回调
                                            angular.forEach(data.data.successWaybillList, function (successWaybill) {
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    if (freePackage.freePackage.id == successWaybill.packageId) {
                                                        freePackage.freePackage.waybillId = successWaybill.id;
                                                        freePackage.freePackage.expressNo = successWaybill.expressNo;

                                                        freePackage.freePackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                                        freePackage.freePackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                                        freePackage.freePackage.userTemplateName = $scope.obj.userExpressTemp.name;
                                                        // freePackage.freePackage.expressId = $scope.obj.userExpressTemp.expressId;
                                                    }
                                                });

                                            });

                                            if (data.data.errorWaybillList.length != 0) {

                                                //显示获取单号失败原因
                                                $modal.open({
                                                    templateUrl: 'views/pages/applyWaybillResult.html',
                                                    controller: "recycleResultCtrl",
                                                    resolve: {
                                                        data: function () {
                                                            return {
                                                                errorRecycleList: data.data.errorWaybillList,
                                                                successRecycleList: data.data.successWaybillList
                                                            };
                                                        }
                                                    }
                                                });
                                            } else {
                                                //全部电子面单号获取成功
                                                var waybillIds = [];
                                                angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                                    waybillIds.push(freePackage.freePackage.waybillId)
                                                });
                                                params = $($scope.FreePackageIdsArray).map(function(){
                                                    return this.freePackage;
                                                }).get();
                                                //获取打印数据
                                                $restClient.post("seller/waybill/listPrintData", null, {
                                                    waybillIds: waybillIds,
                                                    userTemplateId: $scope.obj.userExpressTemp.id
                                                }, function (data) {
                                                    //电子面单打印
                                                    $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                                });
                                            }


                                        },
                                        failCallback: function (data) {
                                            //没开通||没设置网点
                                            if (data.resultCode == 900015 || data.resultCode == 900017) {
                                                $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
                                            } else
                                            //没余额
                                            {
                                                var mes = {
                                                    title: '获取电子面单号',
                                                    content: data.resultMessage,
                                                    img: "images/components/alert/alert-forbid.png",
                                                    size: "lg",
                                                    showClose: true,
                                                    showCancel: false
                                                };

                                                $win.confirm(mes);
                                            }

                                        }
                                    };
                                    //过滤掉已存在单号的包裹
                                    FreePackageIdsArray = FreePackageIdsArray.filter(function (freePackage) {
                                        if (!(freePackage.waybillId)) {
                                            return freePackage;
                                        }
                                    });

                                    var applyWaybillParamModel = {
                                        userExpressTemplateId: FirstTemplate,
                                        packageType: 2,
                                        freePackageList: FreePackageIdsArray
                                    };

                                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);


                                } else {

                                    var waybillIds = [];
                                    angular.forEach(params, function (freePackage) {
                                        waybillIds.push(freePackage.waybillId)
                                    });
                                    //获取打印数据
                                    $restClient.post("seller/waybill/listPrintData", null, {
                                        waybillIds: waybillIds,
                                        userTemplateId: $scope.obj.userExpressTemp.id
                                    }, function (data) {
                                        //电子面单打印
                                        $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 2, $scope)

                                    });
                                }

                            }
                        } else {
                            //普通快递单打印
                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, params, 2);
                        }

                    });
                }
            } else if (type == 2) {
                var domElement = $('.deliveryTemplate');
                var baseData = {
                    baseSetting: $scope.baseSetting
                };
                printCallback = function (params) {
                    $scope.loading = $restClient.post('seller/freePrintList/printDeliveryBill', null, params, function (data) {
                        console.log(data.data);
                        $win.alert({
                            type: "success",
                            content: "打印完成"
                        });
                        angular.forEach(data.data, function (item) {
                            angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                                if (freePackage.freePackage.id == item.id) {
                                    freePackage.freePackage.printDeliveryBillTime = item.printDeliveryBillTime;
                                    freePackage.freePackage.serial = item.serial;
                                    freePackage.freePackage.printDeliveryBillNum = item.printDeliveryBillNum;
                                    freePackage.freePackage.isPrintDeliveryBill = item.isPrintDeliveryBill;
                                }
                            })
                        })
                    })
                };
                $dpPrint.printDelivery(preview, baseData, printCallback, params, params, domElement);
            }
        }
    };
    //批量设置成已打印
    $scope.setPrinted = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var remind = $win.confirm({
            img: "images/components/alert/alert-forbid.png",
            title: "你确定要将所选订单设置为已打印快递单吗？",
            size: 'lg',
            content: "设置成功后，请至" + "<span class='text-warning'>已打印【快递单】</span>" + "菜单中查看已打印的订单信息。"
        });
        remind.result.then(function () {
            var FreePackageIdsArray = $($scope.FreePackageIdsArray).map(function () {
                return this.freePackage;
            }).get();

            function getSerial() {
                var deferred = $q.defer(),
                    promise = deferred.promise;
                $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, FreePackageIdsArray, function (data) {
                    console.log(data.data);
                    angular.forEach(data.data, function (item) {
                        angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                            if (freePackage.freePackage.id == item.id) {
                                freePackage.freePackage.serial = item.serial;
                            }
                        })
                    });
                    deferred.resolve(data.data);

                });
                return promise;
            }

            function setPrinted(params) {
                $restClient.post('seller/freePrintList/printExpress', null, params, function (data) {
                    $win.alert({
                        type: "success",
                        content: '设置成功'
                    });
                    console.log(data.data);
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        angular.forEach(data.data, function (backFreePackage) {
                            if (freePackage.freePackage.id == backFreePackage.id) {
                                freePackage.freePackage.printExpressTime = backFreePackage.printExpressTime;
                            }
                        })
                    })
                });
            }

            getSerial().then(setPrinted);

        });
    };

    $scope.viewLog = function (freePackage) {
        var modalInstance = $modal.open({
            templateUrl: "views/components/freePrintLog.html",
            controller: "freePrintLogCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    return angular.copy(freePackage);
                }
            }
        });
        modalInstance.result.then(function () {
            // init();
        });
    };

    $scope.copyTrade = function (freePackage) {
        var remind = $win.confirm({
            img: "images/components/alert/alert-forbid.png",
            title: "你确定要复制当前订单信息吗？",
            content: "系统将此笔订单信息复制后直接插入至录入打印界面"
        });
        remind.result.then(function () {

            $location.url('/print/freeprint?copyId=' + freePackage.id);
        });
    };
    //联想快递单号
    $scope.associateExpressNo = function (onePackage, isConsign) {
        // onePackage.smart = true;
        var packages = $scope.FreePackageIdsArray;

        if (packages.length > 1) {                           //选择了多笔订单
            var index = -1;
            angular.forEach(packages, function (Package, i) {
                if (Package.freePackage.id == onePackage.freePackage.id) {
                    index = i;
                }
            });
            if (index == -1) {                                  //若点击的包裹非选中
                inputOneExpressNo();
                return false;
            }
            if (index > 0) {                               //若点击的包裹非首个
                packages.splice(0, index);                      //截取点击位以下包裹

            }

            console.log(packages);
            packages.length > 1 ? inputBatchExpressNo(packages) : inputOneExpressNo();

        } else {
            inputOneExpressNo();
        }
        function inputOneExpressNo() {      //单个联想
            if (onePackage.freePackage.expressNo) {
                $win.alert('已经输入了运单号码，不能联想输入');
                return false;
            } else {
                $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: onePackage.freePackage.userTemplateId}, function (data) {
                    console.log(data);
                    if (data.data) {
                        onePackage.freePackage.expressNo = window.getNextSid(onePackage.freePackage.userExpressName, data.data, 1);
                        //打印后的联想
                        isConsign && showExpressNo([onePackage], isConsign, onePackage.freePackage.expressNo, onePackage.freePackage.userExpressName);
                    } else {
                        $win.alert('尚未保存过' + onePackage.freePackage.userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                            '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                    }
                });
            }
        }

        function showExpressNo(packages, isConsign, sidStart, userExpressName, lastSid) {
            $modal.open({
                templateUrl: "views/pages/remindExpressNo.html",
                controller: "remindExpressNoCtrl",
                resolve: {
                    data: function () {
                        return angular.copy({
                            sidStart: sidStart,
                            lastSid: lastSid,
                            packages: packages,
                            userExpressName: userExpressName,
                            isConsign: isConsign
                        });
                    }
                }
            });

        }

        function inputBatchExpressNo(packages) {        //多个联想
            var existExpressNo = false;                 //非首个是否存在运单号

            angular.forEach(packages, function (Package, i) {
                if (i > 0 && Package.freePackage.expressNo) {
                    existExpressNo = true;
                }
            });
            if (existExpressNo) {
                var mes = {
                    title: '已存在运单号！',
                    content: '当前选择联想的订单已存在运单号，是否覆盖这些运单号码？',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var cover = $win.confirm(mes);
                cover.result.then(function () {
                    inputExpressNo();
                });
            } else {
                inputExpressNo();
            }
            function inputExpressNo() {
                var sidStart;
                var userExpressName = packages[0].freePackage.userExpressName;
                var userTemplateId = packages[0].freePackage.userTemplateId;
                if (packages[0].freePackage.expressNo) {              //第一个包裹是否存在运单号
                    sidStart = packages[0].freePackage.expressNo;
                    var firstPackage = packages[0];
                    packages.shift();
                    replaceExpressNo(sidStart, userExpressName);
                    //加回原来的元素
                    packages.unshift(firstPackage);
                    showExpressNo(packages, isConsign, sidStart, firstPackage.freePackage.userExpressName, packages[packages.length - 1].freePackage.expressNo);
                } else {
                    getSidStart(userExpressName, userTemplateId);

                }


                function getSidStart(userExpressName, userTemplateId) {                            //获取订单号
                    $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: userTemplateId}, function (data) {
                        console.log(data);
                        if (data.data) {
                            sidStart = data.data;
                            replaceExpressNo(sidStart, userExpressName);
                            showExpressNo(packages, isConsign, window.getNextSid(userExpressName, sidStart, 1), userExpressName, packages[packages.length - 1].freePackage.expressNo);
                        } else {
                            $win.alert('尚未保存过' + userExpressName + '的运单号码，所以不能联想输入。您至少要手工录入' +
                                '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                        }
                    });
                }

                function replaceExpressNo(sidStart, userExpressName) {           //替换订单号
                    angular.forEach(packages, function (Package, i) {
                        var index = 1 + i;
                        Package.freePackage.expressNo = window.getNextSid(userExpressName, sidStart, index);
                    });
                }
            }
        }
    };

    $scope.recycleWaybill = function () {
        if ($scope.FreePackageIdsArray.length < 1) {
            $win.alert("请最少选择一笔订单");
            return;
        }
        var mes = {
            title: '你确定要回收当前绑定的电子面单号吗？',
            content: '回收后可以重新申请新的电子面单号或用其他的模板重新打印。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var actions = {
            successCallback: function (data) {
                //全部成功
                if (data.data.errorRecycleList.length == 0) {
                    angular.forEach($scope.FreePackageIdsArray, function (Package) {
                        Package.freePackage.expressNo = "";
                    });
                    $win.alert({
                        content: '回收成功',
                        type: 'success'
                    })
                } else {
                    //显示打印结果
                    $modal.open({
                        templateUrl: 'views/pages/recycleResult.html',
                        controller: "recycleResultCtrl",
                        resolve: {
                            data: function () {
                                return data.data;
                            }
                        }
                    });
                    //批量时回调成功的
                    angular.forEach($scope.FreePackageIdsArray, function (freePackage) {
                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                            if (successPackage.packageId == freePackage.freePackage.id) {
                                freePackage.freePackage.expressNo = "";
                            }
                        });
                    });


                }

            }
        };
        var allExistNum = true;
        //是否都存在电子面单号
        angular.forEach($scope.FreePackageIdsArray, function (Package) {
            allExistNum = (Package.freePackage.waybillId) && Package.freePackage.expressNo && allExistNum;
        });
        if (!allExistNum) {
            $win.alert("有订单不存在电子面单号，无法回收！");
            return false;
        }
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            var recycleWaybillParams = {
                packageType: 2
            };
            recycleWaybillParams.freePackageList = $(angular.copy($scope.FreePackageIdsArray)).map(function () {
                return this.freePackage;
            }).get();

            $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
        })

    }
}]);

app.controller('freePrintLogCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', 'data', function ($scope, $modalInstance, $modal, $restClient, $win, $q, $compile, $location, $state, data) {
    $scope.data = data;
    function getAllTemplate() {
        $restClient.postFormData('seller/freeLog/getFreeLog', {"pid": data.id}, function (data) {
            $scope.freeLogList = data.data;
        });
    }

    function init() {
        getAllTemplate();
    }

    init();
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
/**
 * Created by wsj on 2016/7/1.
 */
app.controller('freeprintCtrl', ['$scope', '$modal', '$restClient', '$win', '$location', '$dpPrint', '$q', '$modifyTemplate','$calculate', function ($scope, $modal, $restClient, $win, $location, $dpPrint, $q, $modifyTemplate,$calculate) {

    function getAllTemplate() {

        $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.expressTemp = data.data;
            if ($scope.freePackage.userTemplateId != undefined) {
                angular.forEach($scope.expressTemp, function (userTemplate) {
                    if (userTemplate.id == $scope.freePackage.userTemplateId) {
                        $scope.userTemplate = userTemplate;
                    }
                });
            } else {
                $scope.userTemplate = $scope.expressTemp[0];
            }
            //是否是电子面单
            $scope.waybill = ($scope.userTemplate.category == 2);
        });

    }

    function getBaseSetting() {
        $scope.loading = $restClient.get('seller/baseSetting', null, function (data) {
            console.log(data);
            $scope.baseSetting = data.data;
        });
    }

    function getFreeAddress() {
        $scope.loading = $restClient.get('seller/receiptAddress/getFreeAddress', null, function (data) {
            $scope.address = data.data;
            $scope.freePackage.contactId = data.data.contactId;
            $scope.freePackage.contactName = data.data.contactName;
            $scope.freePackage.province = data.data.province;
            $scope.freePackage.city = data.data.city;
            $scope.freePackage.country = data.data.country;
            $scope.freePackage.addr = data.data.addr;
            $scope.freePackage.zipCode = data.data.zipCode;
            data.data.phone && ($scope.freePackage.phone = data.data.phone);
            data.data.mobilePhone && ($scope.freePackage.mobilePhone = data.data.mobilePhone);
            console.log(data);
        });
    }

    function serverToClient(data) {
        if (data.freight ) {
            data.freight = parseFloat((data.freight / 100).toFixed(2));
        }
        angular.forEach(data.freeTradeList, function (freeTrade) {
            angular.forEach(freeTrade.freeOrderList, function (freeOrder) {
                if (freeOrder.price) {
                    freeOrder.price = parseFloat((freeOrder.price / 100).toFixed(2));
                }
                if (freeOrder.payment) {
                    freeOrder.payment = parseFloat((freeOrder.payment / 100).toFixed(2));

                }
            });
        })

        return data;
    }

    function getFreePackage(pid) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (pid != null) {
            $scope.loading = $restClient.post('seller/freeInputTrade/getFreePackage', null, pid, function (data) {
                $scope.freePackage = serverToClient(data.data);
                calculatePrice();
                console.log(data.data);
                $scope.freePackage.fromType = 1;
                defer.resolve();
                if (data.data.receiptAddress) {
                    $scope.address = data.data.receiptAddress;
                } else {
                    //获取默认寄件人地址
                    getFreeAddress();
                }
            });
        }
        return promise;
    }

    function getCopyFreePackage(copyId) {
        var defer = $q.defer();
        var promise = defer.promise;
        $scope.loading = $restClient.post('seller/freePrintList/copyPackage', null, copyId, function (data) {
            $scope.freePackage = serverToClient(data.data);
            console.log(data.data);
            $scope.freePackage.fromType = 1;
            defer.resolve();
            if (data.data.receiptAddress) {
                $scope.address = data.data.receiptAddress;
            } else {
                //获取默认寄件人地址
                getFreeAddress();
            }
        });
        return promise;
    }

    function init() {
        $scope.message = '数据加载中。。。';
        $scope.freePackage = {
            fromType: 1,
            freeTradeList: [{}]
        };
        $scope.hasId = false;
        getBaseSetting();
        if ($location.search().id) {
            $scope.hasId = true;
            getFreePackage($location.search().id).then(getAllTemplate);
        }
        else if ($location.search().copyId) {
            getCopyFreePackage($location.search().copyId).then(getAllTemplate);
        } else {
            getAllTemplate();
            getFreeAddress();
        }
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
        calculatePrice();
    }

    $scope.resetData = function () {
        $scope.freePackage = {
            fromType: 1,
            freeTradeList: [{}]
        };
    };

    init();
    //更换地址
    $scope.changeAddress = function () {
        //电子面单
        if($scope.userTemplate.category == 2){
            var modalInstance = $modal.open({
                templateUrl: "views/pages/changeWaybillAddress.html",
                controller: "changeAddressCtrl",
                resolve: {
                    data: function () {
                        return $scope.userTemplate;
                    }
                },
                size: "lg"
            });
            modalInstance.result.then(function (sellerAddress) {
                console.log(sellerAddress);
                $scope.address = sellerAddress;
                $scope.address.province = $scope.userTemplate.province;
                $scope.address.city = $scope.userTemplate.city;
                $scope.address.country = $scope.userTemplate.district;
                $scope.address.addr = $scope.userTemplate.detail;
            })
        }else{
            var modalInstance = $modal.open({
                templateUrl: "views/pages/changeAddress.html",
                controller: "changeAddressCtrl",
                resolve: {
                    data: function () {
                        return $scope.userTemplate;
                    }
                },
                size: "lg"
            });
            modalInstance.result.then(function (sellerAddress) {
                console.log(sellerAddress);
                $scope.address = sellerAddress;
            })
        }

    };
    //修改地址
    $scope.handleShipAddress = function (address) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/addShipAddress.html",
            controller: "addShipAddressCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    if (typeof address != 'undefined') {
                        return address;
                    }
                }
            }
        });
        modalInstance.result.then(function (data) {
            if (data) {
                $scope.address = data;
            }
        });
    };

    $scope.clickFromType = function (type, importType) {
        if (type == 1) {
            $scope.freePackage.fromType = 1;
        } else if (type == 2) {

            var modalInstance = $modal.open({
                templateUrl: "views/components/addFreePrintTbTrade.html",
                controller: "addFreePrintTbTradeCtrl",
                size: "lg",
                resolve: {
                    data: function () {
                        return angular.copy(type);
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                $scope.freePackage = angular.copy(tradeList[0]);
                $scope.freePackage.freeTradeList = [];
                $scope.freePackage.freeTradeList = tradeList;

                $scope.freePackage.freight =  $scope.freePackage.postFee;
                calculatePrice();
                //去除多余字段

                delete $scope.freePackage.discountFee;
                delete $scope.freePackage.buyerMessage;
                delete $scope.freePackage.status;
                delete $scope.freePackage.payTime;
                delete $scope.freePackage.created;

                $scope.freePackage.fromType = 2;
            }, function () {
                $scope.freePackage.fromType = 1;
            });
        } else if (type == 3) {

            var modalInstance = $modal.open({
                templateUrl: "views/components/addFreePrintTbTrade.html",
                controller: "addFreePrintTbTradeCtrl",
                size: "lg",
                resolve: {
                    data: function () {
                        return angular.copy(type);
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                $scope.freePackage = angular.copy(tradeList[0]);
                $scope.freePackage.freeTradeList = [];
                $scope.freePackage.freeTradeList = tradeList;

                delete $scope.freePackage.buyerMessage;
                delete $scope.freePackage.status;
                delete $scope.freePackage.payTime;
                delete $scope.freePackage.created;

                $scope.freePackage.fromType = 3;
            }, function () {
                $scope.freePackage.fromType = 1;
            });
        } else if (type == 4) {

            $scope.type = 4;
            var modalInstance = $modal.open({
                templateUrl: "views/components/ImportFreePrintTrade.html",
                controller: "ImportFreePrintTradeCtrl",
                resolve: {
                    data: function () {
                        return {
                            importType: importType
                        };
                    }
                }
            });
            modalInstance.result.then(function (tradeList) {
                // $scope.freePackage = tradeList[0];
                //$scope.freePackage.fromType = 4;
                // addNewAddress(angular.copy($scope.freePackage));
                $location.url('/print/freeUnprintedExpress');
            });
        }
    };

    function addNewAddress(postEntity, deferred) {
        //验证所选模板是否开通电子面单
        if ($scope.userTemplate.category==2&&!$scope.userTemplate.branchCode) {
            $modifyTemplate.setWaybill($scope.userTemplate);
            return false;
        }
        postEntity.userExpressId = $scope.userTemplate == null ? '' : $scope.userTemplate.userExpressId;
        postEntity.userTemplateId = $scope.userTemplate == null ? '' : $scope.userTemplate.id;
        //delete postEntity.freeTradeList;

        saveServerToClient(postEntity);
        postEntity.contactId = $scope.address.contactId;
        if ((!$location.search().id) && postEntity.id) {
            var cover = $modal.open({
                templateUrl: "views/pages/updateConfirm.html",
                controller: "updateConfirmCtrl",
                windowClass: "confirm",
                size: "lg"
            });

            cover.result.then(function (isNew) {
                if (isNew) {
                    delete postEntity.id;

                    postEntity.freeTradeList[0] &&delete postEntity.freeTradeList[0].id;
                }
                $scope.loading = $restClient.post('seller/freeInputTrade/add', null, postEntity, function (data) {
                    $scope.freePackage = serverToClient(data.data);
                    if (deferred) {
                        deferred.resolve(data.data);
                    } else {
                        $win.alert({
                            type: "success",
                            content: '保存成功'//内容
                        });

                    }
                });
            });
            return false;
        }
        $scope.loading = $restClient.post('seller/freeInputTrade/add', null, postEntity, function (data) {
            $scope.freePackage = serverToClient(data.data);
            if (deferred) {
                deferred.resolve(data.data);
            } else {
                $win.alert({
                    type: "success",
                    content: '保存成功'//内容
                });

            }

        });
    }

    $scope.save = function () {

        addNewAddress(angular.copy($scope.freePackage));
    };
    //新增物品
    $scope.addFreeOrder = function(freeOrder){
        var data;

        if(freeOrder){
            //编辑
            data = angular.copy(freeOrder);
        }else{
            //新增
            if(!$scope.freePackage.freeTradeList[0].freeOrderList){
                $scope.freePackage.freeTradeList[0].freeOrderList = [];
            }
            data = $scope.freePackage.freeTradeList[0].freeOrderList;
        }
        var modal = $modal.open({
            templateUrl:'views/pages/addFreeOrder.html',
            controller:'addFreeOrderCtrl',
            resolve:{
                data:function(){
                    return data;
                }
            }
        });
        modal.result.then(function(data){
            if(data){
                for(var attr in data){
                    freeOrder[attr] = data[attr];
                }
            }
            calculatePrice();
        },function(){
            calculatePrice();
        });
    };

    $scope.deleteFreeOrder = function (freeOrder) {
        var remind = $win.confirm({
            img: "images/components/alert/alert-delete.png",
            title: "删除确认",
            content: "你确定要删除此商品吗？"
        });
        remind.result.then(function () {
            var index = $scope.freePackage.freeTradeList[0].freeOrderList.indexOf(freeOrder);
            $scope.freePackage.freeTradeList[0].freeOrderList.splice(index, 1);
            calculatePrice();
        });
    };

    $scope.importFile = function (type) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freePrintImport.html",
            controller: "freePrintImportCtrl",
            resolve: {
                data: function () {
                    return angular.copy(type);
                }
            }
        });
        modalInstance.result.then(function (tradeList) {
            $scope.freePackage = tradeList[0];
            $scope.freePackage.fromType = 4;
        });

    };
    function saveServerToClient(data) {

        if (data.freight != undefined) {
            data.freight =data.freight*100;
            data.freeTradeList[0].postFee = data.freight;
        }
        /*if(!data.freeTradeList[0].payment){
            data.freeTradeList[0].payment = data.payment*100;
        }*/

        data.totalAdjustFee && (data.freeTradeList[0].totalAdjustFee =data.totalAdjustFee);

        delete data.totalPrice;
        delete data.totalAdjustFee;
        delete data.postFee;
        delete data.payment;
        delete data.sellerFlag;
        angular.forEach(data.freeTradeList, function (freeTrade) {
            var totalPrice = 0;
            if(freeTrade.payment==undefined){
                freeTrade.payment = 0;
                angular.forEach(freeTrade.freeOrderList, function (item) {
                    freeTrade.payment = freeTrade.payment + item.payment * 100;
                });
                freeTrade.payment = freeTrade.payment + freeTrade.postFee*100;
            }

            angular.forEach(freeTrade.freeOrderList, function (item) {
                delete item.edit;
                if(item.price!=undefined){
                    item.price = item.price * 100;
                }
                if(item.payment!=undefined) {
                    item.payment = $calculate.floatMul(item.payment, 100);
                    totalPrice = totalPrice + item.payment;
                }
            });
            if(data.totalPrice){
                data.freeTradeList[0].totalPrice =data.totalPrice;
            }else{
                data.freeTradeList[0].totalPrice = totalPrice;
            }

            if (data.freeOrderList) {
                delete data.freeOrderList;
            }
        });


        return data;
    }

    $scope.openSearchTrade = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/freePrintSearchTrade.html",
            controller: "freePrintSearchTradeCtrl",
            size: "lg",
            resolve: {
                data: function () {
                    return {
                        importType: ""
                    };
                }
            }
        });
        modalInstance.result.then(function (freeTrade) {
            $scope.freePackage.buyerNick = freeTrade.buyerNick;
            $scope.freePackage.receiverName = freeTrade.receiverName;
            $scope.freePackage.receiverState = freeTrade.receiverState;
            $scope.freePackage.receiverCity = freeTrade.receiverCity;
            $scope.freePackage.receiverDistrict = freeTrade.receiverDistrict;
            $scope.freePackage.receiverAddress = freeTrade.receiverAddress;
            $scope.freePackage.receiverMobile = freeTrade.receiverMobile;
            $scope.freePackage.receiverPhone = freeTrade.receiverPhone;
        });
    };
    //获取流水号
    function getSerial(Package) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $scope.loading = $restClient.post("seller/freePrintList/getSerial", null, [saveServerToClient(angular.copy(Package))], function (data) {

            angular.forEach(data.data, function (item) {
                if (Package.id == item.id) {
                    Package.serial = item.serial;
                }

            });
            deferred.resolve(data.data);
        });
        return promise;
    }

    //打印预览快递单
    $scope.printExpress = function (preview) {
        var params;
        var baseData = {
            userExpressTemp: $scope.userTemplate,
            baseSetting: $scope.baseSetting,
            defaultReceiptAddress: $scope.address
        };
        var deferred = $q.defer(),
            promise = deferred.promise;
        addNewAddress(angular.copy($scope.freePackage), deferred);


        promise.then(function (freePackage) {

            getSerial(freePackage).then(function (freePackageArray) {
                function printCallback() {

                    $restClient.post('seller/freePrintList/printExpress', null, freePackageArray, function (data) {
                        console.log(data.data);
                        $scope.freePackage.waybillId = null;
                        $win.alert({
                            type: 'success',
                            content: '打印成功'
                        });

                    })


                }


                var isWaybill = ($scope.userTemplate.category == 2);
                //是否是电子面单模板
                if (isWaybill) {
                    //信息是否完整
                    var isInfoComplete = true;
                    //运单号是否存在
                    var existNum = true;
                    //判读是否有必填信息和单号
                    angular.forEach(freePackageArray, function (freePackage) {
                        isInfoComplete = isInfoComplete && (/*(freePackage.freeTradeList[0].freeOrderList && freePackage.freeTradeList[0].freeOrderList.length) &&*/ freePackage.receiverName
                            && freePackage.receiverState && freePackage.receiverCity && freePackage.receiverDistrict
                            && freePackage.receiverAddress && (freePackage.receiverMobile || freePackage.receiverPhone));

                        existNum = existNum && freePackage.waybillId;
                    });
                    //电子面单包裹收件人信息和商品信息不能为空
                    if (!isInfoComplete) {
                        $win.confirm({                      //提醒文案
                            content: '您当前选择的包裹中有包裹收件人信息和商品信息不全，电子面单打印包裹收件人信息和商品信息必须不为空。',
                            title: '电子面单，收件人信息和商品信息不能为空。',
                            size: "lg",
                            img: "images/components/alert/alert-forbid.png"
                        });
                        return false;
                    } else {
                        //如果都存在电子面单号不用获取单号
                        if (!existNum) {
                            //获取电子面单回调函数
                            var actions = {
                                successCallback: function (data) {
                                    console.log(data);
                                    //获取后回调
                                    angular.forEach(data.data.successWaybillList, function (successWaybill) {

                                        if ($scope.freePackage.id == successWaybill.packageId) {
                                            $scope.freePackage.waybillId = successWaybill.id;
                                            $scope.freePackage.expressNo = successWaybill.expressNo;

                                            $scope.freePackage.userExpressId = $scope.userTemplate.userExpressId;
                                            $scope.freePackage.userTemplateId = $scope.userTemplate.id;
                                            $scope.freePackage.userTemplateName = $scope.userTemplate.name;
                                        }


                                    });

                                    if (data.data.errorWaybillList.length != 0) {

                                        //显示获取单号失败原因
                                        $modal.open({
                                            templateUrl: 'views/pages/applyWaybillResult.html',
                                            controller: "recycleResultCtrl",
                                            resolve: {
                                                data: function () {
                                                    return {
                                                        errorRecycleList: data.data.errorWaybillList,
                                                        successRecycleList: data.data.successWaybillList
                                                    };
                                                }
                                            }
                                        });
                                    } else {
                                        var waybillIds = [$scope.freePackage.waybillId];
                                        params = [$scope.freePackage];
                                        //获取打印数据
                                        $restClient.post("seller/waybill/listPrintData", null, {
                                            waybillIds: waybillIds,
                                            userTemplateId: $scope.userTemplate.id
                                        }, function (data) {
                                            //电子面单打印
                                            $dpPrint.printWaybill(preview, baseData, data.data, printCallback, params, 2, $scope)

                                        });
                                    }


                                },
                                failCallback: function (data) {
                                    //没开通||没设置网点
                                    if (data.resultCode == 900015 || data.resultCode == 900017) {
                                        $modifyTemplate.setWaybill($scope.userTemplate);
                                    } else
                                    //没余额
                                    {
                                        var mes = {
                                            title: '获取电子面单号',
                                            content: data.resultMessage,
                                            img: "images/components/alert/alert-forbid.png",
                                            size: "lg",
                                            showClose: true,
                                            showCancel: false
                                        };

                                        $win.confirm(mes);
                                    }

                                }
                            };

                            var applyWaybillParamModel = {
                                userExpressTemplateId: $scope.userTemplate.id,
                                packageType: 2,
                                freePackageList: freePackageArray
                            };

                            $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                        } else {
                            var waybillIds = [$scope.freePackage.waybillId];
                            params = freePackageArray;
                            //获取打印数据
                            $restClient.post("seller/waybill/listPrintData", null, {
                                waybillIds: waybillIds,
                                userTemplateId: $scope.userTemplate.id
                            }, function (data) {
                                //电子面单打印
                                $dpPrint.printWaybill(preview, baseData, data.data, printCallback, params, 2, $scope)

                            });
                        }
                    }

                } else {
                    $dpPrint.printExpress(preview, baseData, printCallback, params, freePackageArray, 2);
                }

            })

        })


    };
    //打印预览发货单
    $scope.printDelivery = function (preview) {
        var domElement = $('.deliveryTemplate');
        var baseData = {
            baseSetting: $scope.baseSetting
        };

        function printCallback() {
            var deferred = $q.defer(),
                promise = deferred.promise;
            addNewAddress(angular.copy($scope.freePackage), deferred);

            promise.then(function (freePackage) {
                $restClient.post('seller/freePrintList/printDeliveryBill', null, [freePackage], function (data) {
                    console.log(data.data);

                    $win.alert({
                        type: 'success',
                        content: '打印成功'
                    })
                })
            })
        }

        getSerial($scope.freePackage).then(function (freePackage) {

            $dpPrint.printDelivery(preview, baseData, printCallback, null, [saveServerToClient(angular.copy($scope.freePackage))], domElement);

        });


    };
    //粘贴地址
    $scope.addressPaste = function (event) {
        console.log(event.target.value);
        var address = event.target.value;

        if (address.indexOf('，') > -1) {
            address = address.replace(/，/ig, ",");
        }

        var addressList = address.split(',');
        //第一位用户名
        $scope.freePackage.receiverName = addressList[0];

        if (addressList.length > 1) {
            //第二位手机号
            $scope.freePackage.receiverMobile = addressList[1];

            if (/^[0-9]*$/.test(addressList[2][0])) { //第三位电话号
                $scope.freePackage.receiverPhone = addressList[2];

                var addressDetail = addressList[3].split(" ");
                $scope.freePackage.receiverState = addressDetail[0];
                $scope.freePackage.receiverCity = addressDetail[1];
                $scope.freePackage.receiverDistrict = addressDetail[2];
                $scope.freePackage.receiverAddress = addressDetail[3] + addressDetail[4];
                if (addressList[4]) {
                    $scope.freePackage.receiverZip = addressList[4];
                }

            } else {      //第三位是地址
                var addressDetail = addressList[2].split(" ");
                $scope.freePackage.receiverState = addressDetail[0];
                $scope.freePackage.receiverCity = addressDetail[1];
                $scope.freePackage.receiverDistrict = addressDetail[2];
                $scope.freePackage.receiverAddress = "";
                for (var i = 3; i < addressDetail.length; i++) {
                    $scope.freePackage.receiverAddress = $scope.freePackage.receiverAddress + addressDetail[i];
                }
                if (addressList[3]) {
                    $scope.freePackage.receiverZip = $.trim(addressList[3]);
                }
            }

        }

    };
    //重新计算价格
    function calculatePrice(){
        $scope.orderPrice = 0;
        angular.forEach($scope.freePackage.freeTradeList[0].freeOrderList, function (freeOrder) {
            if(freeOrder.payment!=undefined){
                $scope.orderPrice = $calculate.floatAdd($scope.orderPrice ,$calculate.floatMul(freeOrder.payment,100));
            }
        });
        $scope.tradeDiscountFee = $scope.freePackage.freeTradeList[0].discountFee?$calculate.floatMul(parseFloat($scope.freePackage.freeTradeList[0].discountFee),100):0;
        $scope.freight = $scope.freePackage.freight?$calculate.floatMul($scope.freePackage.freight,100):0;
        $scope.freePackage.freeTradeList[0].payment = $scope.orderPrice +$scope.freight -$scope.tradeDiscountFee;
    }
    //
    $scope.$watch('freePackage.freight',function(newValue,oldValue){
        if(newValue!=oldValue){
            calculatePrice();
        }
    });
}]);
app.controller('changeAddressCtrl', ["$scope", "$modalInstance", "$restClient","data", function ($scope, $modalInstance, $restClient,data) {
    if(data){
        $scope.userTemplate = data;
    }
    $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
        console.log(data);
        $scope.entity = data.data;
    });
    $scope.save = function () {
        $modalInstance.close($scope.sellerAddress);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('addFreePrintTbTradeCtrl', ['$scope', '$modalInstance', '$restClient', '$win', '$state', 'data','$calculate', function ($scope, $modalInstance, $restClient, $win, $state, data,$calculate) {
    $scope.data = data;
    $scope.totalPayment = 0;
    $scope.totalFee = 0;
    $scope.totalDiscountFee = 0;
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    function serverToClient(data) {
        if (data.length > 0) {
            angular.forEach(data, function (freeOrder) {
                if (freeOrder.price) {
                    freeOrder.price = parseFloat((freeOrder.price / 100).toFixed(2));
                }
                if (freeOrder.payment) {
                    freeOrder.payment = parseFloat((freeOrder.payment / 100).toFixed(2));

                }
                freeOrder.discountFee = $calculate.floatSub($calculate.floatMul(freeOrder.price,freeOrder.num), freeOrder.payment);
            });

        }
        return data;
    }

    $scope.queryForm = function (tids) {
        $scope.loading = $restClient.postFormData('seller/freeInputTrade/searchTradeByTids', {
            "fromType": $scope.data,
            "tids": tids
        }, function (data) {
            console.log(data);
            $scope.tradeList = data.data;
            //主订单
            $scope.mainTrade = $scope.tradeList[0];

            $scope.freeOrderList = serverToClient(mergeFreeOrder($scope.tradeList));
        });
    };
    $scope.importTaobaoTrade = function () {
        if (!$scope.tradeList || $scope.tradeList.length == 0) {
            $win.alert("无有效订单可插入,请先查询");
            return false;
        } else {
            $scope.mainTrade.freeOrderList = $scope.freeOrderList;
            $scope.mainTrade.sellerMemo = $scope.sellerMemo;
            $scope.mainTrade.payment = $scope.totalPayment;
                //$scope.mainTrade.payment = parseFloat(($scope.totalPayment/100).toFixed(2));
            $scope.mainTrade.postFee = parseFloat(($scope.totalFee / 100).toFixed(2));
            $scope.mainTrade.discountFee = $scope.totalDiscountFee;
            $modalInstance.close([$scope.mainTrade]);
        }
    };
    function mergeFreeOrder(tradeList) {
        var freeOrderList = [];

        angular.forEach(tradeList, function (trade) {
            //单笔order时payment要减去邮费
            if(trade.freeOrderList.length==1){
                trade.freeOrderList[0].payment = trade.freeOrderList[0].payment - trade.postFee;
                //单笔order时payment要加回trade的满减
                if(trade.freeOrderList[0].discountFee){
                    trade.freeOrderList[0].payment = trade.freeOrderList[0].payment + $calculate.floatMul(parseFloat(trade.discountFee),100);
                }
            }
            angular.forEach(trade.freeOrderList, function (freeOrder) {
                freeOrderList.push(freeOrder);
            });
            $scope.sellerMemo = $scope.sellerMemo ? $scope.sellerMemo + ',' + trade.sellerMemo : trade.sellerMemo;
            $scope.totalPayment = $scope.totalPayment + trade.payment;
            $scope.totalFee = $scope.totalFee + trade.postFee;
            if(trade.discountFee){
                $scope.totalDiscountFee = $scope.totalDiscountFee + parseFloat(trade.discountFee);
            }
        });

        return freeOrderList;
    }
}]);

app.controller("ImportFreePrintTradeCtrl", ["$scope", "$modalInstance", "$restClient", "$win", "data", "$q","$modifyTemplate",
    function ($scope, $modalInstance, $restClient, $win, data, $q,$modifyTemplate) {
        $scope.type = data.importType;
        $scope.errorMessage = '';
        $scope.message = '数据加载中。。。';
        init();
        function init() {
            getAllTemplate();
            getAllReceiptAddress();
            initData();
        }

        function getAllTemplate() {
            $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
                $scope.expressTemp = data.data;
            });
        }

        function getAllReceiptAddress() {
            $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
                $scope.addressList = data.data;
            });
        }

        function initData() {
            $scope.importType = data.importType;
            $scope.importTypeMeau = {
                'jianhuaban': {
                    format: [{
                        key: "1",
                        value: "H:备注"
                    }],
                    name: "简化版"
                },
                'laoban': {
                    format: [{
                        key: "1",
                        value: "Z:保价声明价值"
                    }],
                    name: "老版"
                },
                'jingdong': {
                    format: [{
                        key: "1",
                        value: "AD:订单渠道"
                    }/*,{
                     key:"",
                     value:"Z:货号"
                     }*/],
                    name: "京东"
                }
            };
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
        $scope.uploadFile = function () {
            $scope.message = '数据提交中。。。';
            if ($scope.userTemplate == null) {
                $win.alert("请选文件的最后一列");
                return;
            }
            var x = document.getElementById("files").value;
            if (x == null || x == "" || x == undefined) {
                $win.alert("请选上传文件");
                return;
            }
            if ($scope.tempId == null) {
                $win.alert("请选择快递模板");
                return;
            }

            if ($scope.type == 'jianhuaban') {
                uploadSimple();
            } else if ($scope.type == 'laoban') {
                uploadSimple2();
            } else if ($scope.type == 'jingdong') {
                uploadJD();
            }
            if ($scope.contactId == null) {
                $win.alert("请选择发货地址");
                return;
            }
        };
        $scope.exportTemplate = function () {

            var form = $("<form>");   //定义一个form表单
            form.attr('style', 'display:none');   //在form表单中添加查询参数
            form.attr('target', '');
            form.attr('method', 'get');
            form.attr('action', "//print.cuxiao.quannengzhanggui.net/seller/exportTemplate/uploadFreeCommonTemplate");

            var input1 = $('<input>');
            input1.attr('type', 'hidden');
            $('body').append(form);  //将表单放置在web中
            form.append(input1);   //将查询参数控件提交到表单上
            form.submit();
        };

        function uploadSimple() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_common_simple",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }

        function uploadSimple2() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_common",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }

        function uploadJD() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.loading = promise;
            var options = {
                url: "/seller/freeTradeImport/upload_jd",
                type: "POST",
                clearForm: false,    // 成功提交后，清除所有表单元素的值
                resetForm: false,    // 成功提交后，重置所有表单元素的值
                enctype: "multipart/form-data",
                beforeSubmit: null,    // 提交前的回调函数
                tempId: $scope.tempId,
                success: function (data) {
                    if (data.resultCode == 0) {
                        if (data.data.isSuccess) {
                            $scope.errorMessage = '';
                            $win.alert({
                                type: "success",
                                content: '保存成功'//内容
                            });
                            $modalInstance.close();
                        } else {
                            $scope.errorMessage = data.data.errorMessage;
                        }
                        deferred.resolve();
                    }
                    if (data.resultCode == 20000) {
                        $scope.errorMessage = data.resultMessage;
                        deferred.resolve();
                    }

                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    console.log(textStatus);
                    if (XmlHttpRequest.status == 500) {
                        $scope.errorMessage = '上传文件内容格式错误，上传失败';
                        deferred.resolve();
                    }

                }
            };
            $("#ajaxForm").ajaxSubmit(options);
        }
    }]);

app.controller('freePrintImportCtrl', ['$scope', '$modalInstance', '$restClient', '$win', 'data', function ($scope, $modalInstance, $restClient, $win, data) {
    $scope.type = data;
    function init() {
        $scope.upload = {"type": $scope.type};
        getData();
    }

    init();
    function getData() {
        $scope.loading = $restClient.get('seller/userExpressTemplate/getAllTemplate', null, function (data) {
            $scope.expressTemp = data.data;
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);

app.controller('freePrintSearchTradeCtrl', ['$scope', '$modalInstance', '$restClient', function ($scope, $modalInstance, $restClient) {

    function init() {
        //分页相关
        $scope.pageNo = 0;
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.freeTradeSearchModel = {
            pageSize: $scope.pageSize,
            pageNo: $scope.pageNo
        };
        getData($scope.freeTradeSearchModel);
    }

    init();
    $scope.defSearch = function (pageNo, pageSize, total) {
        $scope.freeTradeSearchModel.pageSize = pageSize;
        $scope.freeTradeSearchModel.pageNo = --pageNo;
        console.log($scope.freeTradeSearchModel);
        getData($scope.freeTradeSearchModel);
    };
    $scope.search = function (freePackageSearchModel) {
        getData(freePackageSearchModel);
    };
    function getData(freeTradeSearchModel) {
        if (undefined == freeTradeSearchModel) {
            return;
        }
        $scope.loading = $restClient.post('seller/freePrintList/searchFreePackage', null, freeTradeSearchModel, function (data) {
            $scope.data = data;
            console.log(data);
            $scope.pageNo = ++data.pageNo;
            $scope.pageSize = data.pageSize;
            $scope.count = data.count;
            $scope.freeTradeList = data.data;
            $scope.freeTradeSearchModel = freeTradeSearchModel;
        });
    }

    $scope.checkFreeTrade = function (freeTrade) {
        $modalInstance.close(freeTrade);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('updateConfirmCtrl', ["$scope", "$modalInstance", function ($scope, $modalInstance) {

    $scope.save = function (isNew) {
        $modalInstance.close(isNew);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
app.controller('addFreeOrderCtrl', ["$scope", "$modalInstance","data", function ($scope, $modalInstance,data) {
    $scope.edit = true;
    var freeOrderList;
    console.log(data);
    //传入的是Array为新增物品否则为编辑
    if(data instanceof Array){
        freeOrderList = data;
        $scope.edit = false;
    }else{
        $scope.obj = data;
        $scope.obj.discountFee&&($scope.obj.discountFee = $scope.obj.discountFee.toString());
        //如果存在商品简称
        if(data.abbrevName){
            $scope.obj.title = data.abbrevName;
        }
    }

    $scope.save = function () {
        //如果存在商品简称
        if(data.abbrevName){
            $scope.obj.abbrevName = $scope.obj.title;
        }
        $modalInstance.close($scope.obj);
    };
    $scope.continueAdd = function(close){
        freeOrderList.push($scope.obj);
        $scope.obj = {};
        if(close){
            $modalInstance.close();
        }
    };
    $scope.calculate = function(){
        $scope.obj.payment = parseFloat(($scope.obj.price||0)*($scope.obj.num||0) - ($scope.obj.discountFee||0));
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
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





/**
 * Created by Jin on 2016/5/28.
 */
app.controller('logisticsTradeSettingCtrl', ['$scope', '$restClient', '$win', function ($scope, $restClient, $win) {
    function getEntity() {
        $restClient.get('seller/logisticsTradeSetting', null, function (data) {
            //console.log(data);
            $scope.entity = data.data;
        });
    }

    function init() {

        getEntity();

    }

    init();

    function closeAll(entity) {
        entity.xServiceAudited = 0;
        entity.xAllocationNotified = 0;
        entity.xSendPrinted = 0;
        entity.xLogisticsPrint = 0;
        entity.xPackaged = 0;
    }

    function clientToServer(entity) {

        entity.xToSystem = entity.xWaitAllocation = entity.xOutWarehouse = entity.isOpen;
        return entity;
    }

    $scope.save = function () {
        $restClient.put('seller/logisticsTradeSetting/update', null, clientToServer(angular.copy($scope.entity)), function (data) {
            data.data && $win.alert({
                type: "success",
                content: '保存成功'//内容
            });
            //console.log(data);
        })
    };
    //关闭链路
    $scope.closed = function () {
        $scope.entity.isOpen && closeAll($scope.entity);
    };
    //开启单个节点
    $scope.switch = function (val) {
        if (!(val || $scope.entity.isOpen)) {
            $scope.entity.isOpen = true;
        }
    }
}]);
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
/**
 * Created by nanning_zhang on 2016/8/2.
 */
app.controller("preparingBillDetailCtrl", ["$scope", "$win", '$modal', '$restClient', '$q', "$location", function ($scope, $win, $modal, $restClient, $q, $location) {

    function init() {
        initData();

    }

    function initData() {
        $scope.preparingBillId = $location.search().preparingBillId;
        //$scope.preparingBillSetting = null;
        $scope.loading = $restClient.get('seller/preparingBill/detail', {preparingBillId: $scope.preparingBillId}, function (data) {
            $scope.preparingBillDto = data.data.preparingBillDto;
            $scope.preparingBillSetting = data.data.preparingBillSetting;
            $scope.itemList = data.data.itemPreparingBillDtoList;
            count(data.data.itemPreparingBillDtoList);
            $scope.switchSkuSort($scope.preparingBillSetting.skuSequence);
            $scope.switchTradeSort($scope.preparingBillSetting.itemSequence);
        });
    }

    function count(itemPreparingBillDtoList) {
        var allNum = 0;
        var allPrice = 0;
        if (itemPreparingBillDtoList && itemPreparingBillDtoList.length > 0) {
            angular.forEach(itemPreparingBillDtoList, function (item) {
                allNum = allNum + item.totalNum;
                allPrice = allPrice + item.totalPrice;
            });
        }
        $scope.allNum = allNum;
        $scope.allPrice = allPrice;
    }

    //排序 data:要排序的list key:根据哪个字段排序 sortBay:true升序 false降序
    function sorting(data, key, sortBay) {
        var list = data;
        var temp = null;
        for (var i = 0; i < list.length; i++) {
            for (var j = list.length - 1; j > i; j--) {
                var lastElement = list[j];
                var prevElement = list[j-1];
                if (sortBay) {
                    if(key=="skuCode"||key=="itemCode"){
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key]&& prevElement[key].localeCompare(lastElement[key]) > 0 )||(prevElement[key]&&!lastElement[key])) {
                            temp = list[j-1];
                            list[j-1] = list[j];
                            list[j] = temp;
                        }
                    }else{
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key]&&lastElement[key] < prevElement[key])||(prevElement[key]&&!lastElement[key])) {
                            temp = list[j-1];
                            list[j-1] = list[j];
                            list[j] = temp;
                        }
                    }


                } else {
                    if(key=="skuCode"||key=="itemCode"){
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key] && prevElement[key].localeCompare(lastElement[key]) < 0) || (!prevElement[key] && lastElement[key])) {
                            temp = list[j - 1];
                            list[j - 1] = list[j];
                            list[j] = temp;
                        }
                    }else {
                        //值都存在大于或小的不存在值(值不存在时无法比较)
                        if ((lastElement[key] && prevElement[key] && lastElement[key] > prevElement[key]) || (!prevElement[key] && lastElement[key])) {
                            temp = list[j - 1];
                            list[j - 1] = list[j];
                            list[j] = temp;
                        }
                    }
                }
            }
        }
        return list;
    }

    $scope.switchSkuSort = function (num) {
        $scope.preparingBillSetting.skuSequence = num;
        switch (num) {

            case 1:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuCode', true);
                });
                break;
            case 2:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuCode', false);
                });
                break;
            case 0:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuTotalNum', true);
                });
                break;
            case 3:
                angular.forEach($scope.itemList, function (item) {
                    item.skuPreparingBillDtoList = sorting(angular.copy(item.skuPreparingBillDtoList), 'skuTotalNum', false);
                });
                break;
        }
    };

    $scope.switchTradeSort = function (num) {
        $scope.preparingBillSetting.itemSequence = num;
        switch (num) {
            case 0:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'totalNum', false);
                break;
            case 3:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'totalNum', true);
                break;
            case 1:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'itemCode', true);
                break;
            case 2:
                $scope.itemList = sorting(angular.copy($scope.itemList), 'itemCode', false);
                break;
        }
    };

    init();


    $scope.deletes = function (item, index) {

        var confirm = $win.confirm({
            size: "lg",//尺寸
            img: "images/components/alert/alert-forbid.png",//图标
            title: "您确认要隐藏内容吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "隐藏后仅限于本次不被打印，但刷新后仍会再次显示！"//内容
        });
        confirm.result.then(function () {
            $scope.itemList.splice(index, 1);
        });
    };
    $scope.back = function () {
        $location.url("/print/preparingBill");
    };

    $scope.$watch('preparingBillSetting', function (newValue, oldValue) {
        if (newValue != oldValue && oldValue != undefined) {
            $restClient.post('seller/preparingBill/updatePreparingBillSetting', null, newValue, function (data) {
                if (!data.data) {
                    $win.alert('设置失败');
                }
            });
        }
    }, true);

    $scope.previewPreparing = function (preview) {
        // LODOP = getLodop();
        $scope.timeNow = moment().format('YYYY-MM-DD HH:mm:SS');
        function choosePrinter(printTypeData) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var choosePrinter = $modal.open({
                templateUrl: "views/pages/choosePrinter.html",
                controller: "choosePrinterCtrl",
                resolve: {
                    data: function () {
                        return printTypeData;
                    }
                }
            });
            choosePrinter.result.then(function (printerName) {

                deferred.resolve(printerName);               //打印机名称
            });
            return promise;
        }
        //普通面单打印控件是否安装
        function isCLodopInstalled() {
            var strCLodopInstall = "<div color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行安装</a>,安装后请刷新页面。</div>";
            var strCLodopUpdate = "<div color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行升级</a>,升级后请刷新页面。</div>";
            var LODOP;

            var isIE = (navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Trident') >= 0);
            try {
                LODOP = getCLodop();
            } catch (err) {
                console.log("getLodop出错:" + err);
            }
            if (!LODOP) {
                var mes = {
                    windowTitle: '系统提示',
                    title: '请下载并安装打印控件，否则会导致无法打印',
                    content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                    '打印控件并进行安装。安装后请刷新此页面。下载或安装遇到问题请' +
                    '联系我们在线客服！' +
                    '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                    '<br><a class="text-warning" href="download/CLodop_Setup_for_Win32NT_2.062.exe" target="_self">下载控件</a>',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: false,
                    showCancel: false
                };
                $win.confirm(mes);
                return false;
            } else {
                /*if (CLODOP.CVERSION < "2.0.4.6") {
                 var mes = {
                 windowTitle: '全能掌柜提示，打印前请安装新打印控件',
                 title: '打印控件需升级',
                 content: strCLodopUpdate,
                 img: "images/components/alert/alert-forbid.png",
                 showClose: false,
                 showCancel: true
                 };
                 $win.confirm(mes);
                 return false;
                 }*/
                return true;
            }

        }
        if (isCLodopInstalled()) {
            $q.when({preview: preview, type: 3}, choosePrinter).then(doPrint);
        }
        //设置打印机
        function doPrint(printer) {


            console.log("print control version:" + LODOP.VERSION);


            LODOP.PRINT_INITA(0,0,'100%','100%',"打印备货单");
            LODOP.SET_SHOW_MODE("LANGUAGE", 0);


            //宽度自动缩放
            LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT", "Auto-Width");
            //设置本次输出的打印任务名
            LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "备货单");
            LODOP.SET_PRINTER_INDEXA(printer);

            var strFormHtml = angular.element(".data-table-wrap").html();
            LODOP.ADD_PRINT_HTM(0, 0, '90%', '100%', '<!DOCTYPE html>' + strFormHtml);

            //预览
            if (preview) {
                //设置预览窗口大小
                LODOP.SET_PREVIEW_WINDOW(1, 0, 0, 950, 600, "打印预览");
                LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
                if (LODOP.VERSION > "6.1.8.7") {
                    LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                    LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                    LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
                }
                LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPreview();

            } else {
                //LODOP.SET_PRINT_COPIES(2);
                LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPrint();

            }
        }
        function callBackFunc(){
            $scope.loading = $restClient.postFormData('seller/preparingBill/printLog',{preparingBillId:$scope.preparingBillId},function(data){
                $win.alert({
                    type: "success",
                    content: '打印成功'//内容
                });
            })
        }
        function RealPreview() {

            //云打印C-Lodop返回结果用回调函数:
            if (LODOP.CVERSION) {
                CLODOP.On_Return = function (TaskID, Value) {
                    if (Value == 1) {
                        callBackFunc();
                    }
                    else {
                        console.log("放弃打印！");
                    }
                };
                LODOP.PREVIEW();
                return;
            }
            //控件返回结果用语句本身：
            if (LODOP.PREVIEW()) {
                callBackFunc();

            } else {
                console.log("放弃打印！");
            }
        }

        function RealPrint() {

            //云打印C-Lodop返回结果用回调函数:
            if (LODOP.CVERSION) {
                CLODOP.On_Return = function (TaskID, Value) {
                    if (Value == 1) {
                        callBackFunc();
                    }
                    else {
                        alert("放弃打印！");
                    }
                };
                LODOP.PRINT();
                return;
            }
            //控件返回结果用语句本身：
            if (LODOP.PRINT()) {
                callBackFunc();
            }
            else {
                alert("放弃打印！");
            }
        }
    };

}]);
app.controller('preparingBillFormCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$location', function ($scope, $modal, $restClient, $win, $q, $location) {

    function getData() {
        var tids = $location.search().tids;
        $restClient.get('seller/preparingBill/preparingBillForm', null, function (data) {
            $scope.preparingBillFormDto = data.data;
            $scope.preparingBillFormDto.preparingBillSearchModel.payStartTime = $scope.preparingBillFormDto.preparingBillSearchModel.payStartTime && moment($scope.preparingBillFormDto.preparingBillSearchModel.payStartTime)._d;
            $scope.preparingBillFormDto.preparingBillSearchModel.payEndTime = $scope.preparingBillFormDto.preparingBillSearchModel.payEndTime && moment($scope.preparingBillFormDto.preparingBillSearchModel.payEndTime)._d;
            $scope.preparingBillFormDto.preparingBillSearchModel.tids = tids;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludePrintExpress = 0;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludePrintDelivery = 0;
            $scope.preparingBillFormDto.preparingBillSearchModel.isExcludeRefund = 0;

        });
    }

    function init() {
        getData();
        $scope.limitTime = {
            dateFmt: "yyyy-MM-dd HH:mm:ss",
            startDate: '%y-%M-%d 00:00:00',
            maxDate: '%y-%M-%d 00:00:00',
            minDate: '%y-{%M-2}-%d 00:00:00'
        };
        $scope.limitTime2 = {
            dateFmt: "yyyy-MM-dd HH:mm:ss",
            startDate: '%y-%M-%d 23:59:59',
            maxDate: '%y-%M-%d 23:59:59',
            minDate: '%y-{%M-2}-%d 23:59:59'
        }
    }

    init();


    $scope.save = function () {
        if ($scope.selectArray.length > 0) {
            $scope.preparingBillFormDto.preparingBillSearchModel.sellerFlags = $scope.selectArray.join(",");
        }
        if ('undefined' == $scope.preparingBillFormDto.preparingBillSearchModel.tids || "" == $scope.preparingBillFormDto.preparingBillSearchModel.tids) {
            delete $scope.preparingBillFormDto.preparingBillSearchModel.tids;
        }
        var param = angular.copy($scope.preparingBillFormDto.preparingBillSearchModel);
        param.payStartTime = param.payStartTime && moment(param.payStartTime).format("YYYY/MM/DD HH:mm:ss");
        param.payEndTime = param.payEndTime && moment(param.payEndTime).format("YYYY/MM/DD HH:mm:ss");
        $scope.loading = $restClient.post('seller/preparingBill/save', null, param, function (data) {
            console.log(data);
            if (data.data) {
                $location.url('/print/preparingBill');
            }
            $win.alert({
                type: 'success',
                content: '已生成备货单!'
            })
        });
    };

    $scope.selectArray = [];
    $scope.select = function (sellerFlag) {
        var index = $scope.selectArray.indexOf(sellerFlag);
        if (index == -1) {
            $scope.selectArray.push(sellerFlag);
        } else {
            $scope.selectArray.splice(index, 1);
        }
    };

    $scope.updateCustomStar = function (customStarList, customStarId) {
        $scope.customStarColor = "";

        angular.forEach(customStarList, function (customStar) {
            if (customStar.id == customStarId) {
                $scope.customStarColor = customStar.color;
            }
        })

    };
}]);

/**
 * Created by Jin on 2017/10/14.
 */
app.controller("questionPackageCtrl", ["$scope", "$location", "$http", "$restClient", "$win", "$element","$modal",
    function ($scope, $location, $http, $restClient, $win, $element,$modal) {
        $scope.data = '123213';
    }
]);
app.controller('scopeOfDeliveryCorrectCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', function ($scope, $modal, $restClient, $win, $q) {

    function getData() {

        $restClient.get('seller/correctionRange', null, function (data) {
            console.log(data.data);
            $scope.expressCo = data.data;
            $scope.express = data.data[0];
            $scope.search();
        });
    }

    function restData() {

        $scope.checkAll = false;  //是否全选
        $scope.selectArray = [];  //选择的条数
    }

    function init() {
        getData();
        restData();
        $scope.noData = true;      //是否有数据
        $scope.isReach = '';        //派送状态
    }
    //查询
    $scope.search = function () {

        var params = {
            userExpressId: $scope.express.id,
            isReach: $scope.isReach
        };

        $scope.loading = $restClient.postFormData('seller/correctionRange/search', params, function (data) {
           // console.log(data);
            if (data.data.length != 0) {
                $scope.rangeList = data.data;
                $scope.expressName = angular.copy($scope.express).name;
                $scope.noData = false;
            } else {
                $scope.rangeList = data.data;
                restData();
            }

        });
    };
    //批量删除
    $scope.deleteBatch = function () {
        if($scope.selectArray.length == 0){
            $win.alert('请先选择要删除的信息');
            return false;
        }
        var confirm = $win.confirm({
            size: "sm",//尺寸
            img: "images/components/alert/alert-delete.png",//图标
            title: "您确认要删除吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "删除后将无法恢复，请慎重操作"//内容
        });
        confirm.result.then(function () {
            $restClient.deletes('seller/correctionRange/batchDelete', {ids: $scope.selectArray.join(',')}, function (data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'//内容
                });
                $scope.search();
                restData();
            })
        });
    };
    //单选
    $scope.selectItem = function (range) {
        range.selected = !range.selected;
        if (range.selected) {
            $scope.selectArray.push(range.id);
        } else {
            var index = $scope.selectArray.indexOf(range.id);
            $scope.selectArray.splice(index, 1);
            $scope.checkAll = false;
        }
        console.log($scope.selectArray);
    };
    //全选
    $scope.selectAll = function () {
        $scope.checkAll = !$scope.checkAll;
        if ($scope.checkAll) {
            angular.forEach($scope.rangeList, function (item) {
                if (!item.selected) {
                    item.selected = true;
                    $scope.selectArray.push(item.id)
                }
            });
        } else {
            angular.forEach($scope.rangeList, function (item) {
                if (item.selected) {
                    item.selected = false;
                }
            });
            $scope.selectArray = [];
        }
        console.log($scope.selectArray);
    };
    //删除
    $scope.delete = function (range) {
        var confirm = $win.confirm({
            size: "sm",//尺寸
            img: "images/components/alert/alert-delete.png",//图标
            title: "您确认要删除吗？",//内容标题
            closeText: "确定",//确认按钮文本
            cancelText: "取消",//取消按钮文本
            windowTitle: "系统提示",//窗口名称
            content: "删除后将无法恢复，请慎重操作"//内容
        });
        confirm.result.then(function () {
            $restClient.deletes('seller/correctionRange/delete', {id: range.id}, function (data) {
                if (data.data) {
                    $win.alert({
                        type: "success",
                        content: '删除成功'
                    });
                    $scope.search();
                }
            })
        });

    };
    //添加或编辑
    $scope.addCorrectScope = function (range) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/addCorrectScope.html",
            controller: "addCorrectScopeCtrl",
            resolve: {
                data: function () {
                    return angular.copy(range);
                },
                express: function () {
                    return $scope.express;
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.search();
        })
    }
    init();
}]);
app.controller('addCorrectScopeCtrl', ['$scope', '$modalInstance', '$modal', 'data', 'express', '$restClient', '$win', '$q', function ($scope, $modalInstance, $modal, data, express, $restClient, $win, $q) {
    $scope.express = express;
    $scope.edit = data != undefined;       //是否是编辑状态
    $scope.isReach = 0;
    if (data != undefined) {
        $scope.data = data;
        $scope.isReach = data.isReach;
    }

    //地区选择级联
    getProvince().then(watchProvince);

    function watchProvince() {
        $scope.$watch('provinceId', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.id == newValue) {
                            getCity(item.code).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity() {
        $scope.$watch('cityId', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.city, function (item) {
                    if (keepGoing) {
                        if (item.id == newValue) {
                            getCountry(item.code);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince() {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            deferred.resolve();
        });
        return promise;
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

    function getCountry(code) {
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            $scope.country = data.data;
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        var params = {};
        params.isReach = $scope.isReach;
        if ($scope.edit) {                           //编辑
            params.id = data.id;
        } else {                                    //新添加
            params.expressId = $scope.express.expressId;
            if ($scope.countryId != undefined) {
                params.areaId = $scope.countryId;
            } else if ($scope.cityId != undefined) {
                params.areaId = $scope.cityId;
            } else if ($scope.provinceId != undefined) {
                params.areaId = $scope.provinceId;
            } else if ($scope.provinceId == undefined) {
                $win.alert('请先选择省份');
                return false;
            }
        }
        $restClient.post('seller/correctionRange/save', null, params, function (data) {
            data.data && $modalInstance.close();
            $win.alert({
                type: "success",
                content: '保存成功'//内容
            });
        });
    }
}]);
app.controller('shipAddressCtrl', ['$scope', '$modal', '$restClient', '$win', function ($scope, $modal, $restClient, $win) {
    //新增发货地址
    function getData() {
        $scope.loading = $restClient.get('seller/receiptAddress/list', null, function (data) {
            console.log(data);
            $scope.entity = data.data;
        });
    }

    function init() {
        getData();

    }

    init();
    $scope.handleShipAddress = function (address) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/addShipAddress.html",
            controller: "addShipAddressCtrl",
            size: 'lg',
            resolve: {
                data: function () {
                    if (typeof address != 'undefined') {
                        return address;
                    }
                }
            }
        });
        modalInstance.result.then(function () {
            getData();
        });
    };
    $scope.setDefault = function (address) {
        var contactId = {contactId: address.contactId};
        $restClient.postFormData('seller/receiptAddress/default', contactId, function (data) {
            // console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '设为默认成功'
                });
                getData();
            }
            //$scope.entity = data.data;
        });
    };
    $scope.delete = function (address) {
        var addressId = {
            contactId: address.contactId
        };
        $restClient.deletes('seller/receiptAddress/delete', addressId, function (data) {
            console.log(data);
            if (data.data) {
                $win.alert({
                    type: "success",
                    content: '删除成功'
                });
                getData();
            }
        });
    };

}]);
app.controller('addShipAddressCtrl', ['$scope', '$modalInstance', 'data', '$restClient', '$q', function ($scope, $modalInstance, data, $restClient, $q) {

    function init() {
        $scope.edit = false;
        $scope.address = {};

        if (data) {
            $scope.address = angular.copy(data);
            //phone数据转换
            if ($scope.address.phone && $scope.address.phone != "") {
                var phone = $scope.address.phone.split("-");
                $scope.phoneHead = phone[0];
                $scope.phoneBody = phone[1];
            }

            $scope.edit = true;
        } else {
            $scope.address.getDef = 0;
        }
        getProvince().then(watchProvince);
    }


    init();
    function watchProvince() {
        $scope.$watch('address.province', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity() {
        $scope.$watch('address.city', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.city, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCountry(item.code);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince() {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.post('seller/area/listByParentId', {parentId: 1}, null, function (data) {
            //console.log(data);
            $scope.province = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCity(code) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.post('seller/area/listByParentId', {parentId: code}, null, function (data) {
            //console.log(data);
            $scope.city = data.data;
            deferred.resolve();
        });
        return promise;
    }

    function getCountry(code) {
        $restClient.post('seller/area/listByParentId', {parentId: code}, null, function (data) {
            $scope.country = data.data;
        });
    }

    function addNewAddress(postEntity) {
        $scope.loading=$restClient.post('seller/receiptAddress/add', null, angular.copy(postEntity), function (data) {
            console.log(data);
            $modalInstance.close();
        });
    }

    function updateAddress(postEntity) {
        $scope.loading=$restClient.put('seller/receiptAddress/update', null, angular.copy(postEntity), function (data) {
            console.log(data);
            $modalInstance.close(postEntity);
        });
    }

    $scope.save = function () {
        //phone数据拼接
        if ($scope.phoneHead && $scope.phoneHead != "") {
            $scope.address.phone = $scope.phoneHead;
        }
        if ($scope.phoneBody) {
            if ($scope.address.phone && $scope.address.phone != "") {
                $scope.address.phone = $scope.address.phone + "-" + $scope.phoneBody;
            } else {
                $scope.address.phone = $scope.phoneBody;
            }
        }

        $scope.edit ? updateAddress($scope.address) : addNewAddress($scope.address);

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    }
}]);
app.controller("tradeDataCtrl", ["$scope", "$location", "$http", "$restClient", "$win", "$element","$modal",
    function ($scope, $location, $http, $restClient, $win, $element,$modal) {
        var clipTimerId = null;
        $scope.customQueryAreaList = [];
        //分页相关
        $scope.count = 0;
        $scope.pageSize = 10;
        $scope.pageNo = 0;
        //收起/展开筛选条件
        $scope.isFilterMore = 0;
        //是否全选
        $scope.isCheckAll = 0;
        //选中几个
        $scope.checkboxNum = 0;
        //要删除的数据
        $scope.deleteArray = [];
        //是否显示已关闭订单 默认显示 屏蔽掉了没用
        $scope.isNotClose = false;
        //筛选条件
        $scope.condition = {
            timeType: 0,
            startTime: "",
            endTime: "",
            receiverMobile: "",
            buyerNick: "",
            tid: "",
            status: "",
            type: "",
            messageKey: 1,
            receiverKey: 1,
            orderParamKey: 1
        };
        // 订单状态对应的文字
        $scope.status = {
            WAIT_BUYER_PAY: "等待买家付款",
            WAIT_SELLER_SEND_GOODS: "已付款待发货",
            SELLER_CONSIGNED_PART: "部分已发货",
            WAIT_BUYER_CONFIRM_GOODS: "卖家已发货",
            TRADE_BUYER_SIGNED: "买家已签收（货到付款专用）",
            TRADE_FINISHED: "交易成功",
            TRADE_CLOSED: "付款后交易关闭",
            TRADE_CLOSED_BY_TAOBAO: "付款前交易关闭",
            TRADE_NO_CREATE_PAY: "未创建支付宝订单",
            WAIT_PRE_AUTH_CONFIRM: "余额宝0元购合约中",
            PAY_PENDING: "外卡支付付款确认中",
            ALL_WAIT_PAY: "所有买家未付款的交易", //所有买家未付款的交易（包含:WAIT_BUYER_PAY、TRADE_NO_CREATE_PAY）
            ALL_CLOSED: "所有关闭的交易",  //所有关闭的交易（包含:TRADE_CLOSED、TRADE_CLOSED_BY_TAOBAO）
            FRONT_NOPAID_FINAL_NOPAID: "定金未付尾款未付", //(定金未付尾款未付)
            FRONT_PAID_FINAL_NOPAID: "定金已付尾款未付",//(定金已付尾款未付)
            FRONT_PAID_FINAL_PAID: "定金和尾款都付",//(定金和尾款都付)
            WAIT_SELLER_AGREE: "已申请退款待卖家确认", //买家已经申请退款，等待卖家同意
            WAIT_BUYER_RETURN_GOODS: "同意退款待买家退货", //卖家已经同意退款，等待买家退货
            WAIT_SELLER_CONFIRM_GOODS: "已退货待卖家收货", //买家已经退货，等待卖家确认收货
            SELLER_REFUSE_BUYER: "卖家拒绝退款",
            CLOSED: "退款关闭",
            SUCCESS: "退款成功"
        };
        $scope.refundStatus = {
            WAIT_SELLER_AGREE: "已申请退款待卖家确认", //买家已经申请退款，等待卖家同意
            WAIT_BUYER_RETURN_GOODS: "同意退款待买家退货", //卖家已经同意退款，等待买家退货
            WAIT_SELLER_CONFIRM_GOODS: "已退货待卖家收货", //买家已经退货，等待卖家确认收货
            SUCCESS: "退款成功"
        };
        //点击用户名旁边的按钮只筛选当前用户的订单
        $scope.singleMember = function (ele) {
            $scope.condition.buyerNick = ele;
            getResultsPage(1);
        };
        init();
        function init() {
            //跳转链接
            $scope.condition.tid = $location.search().id || "";
            setTime();
            getResultsPage(1);
            //getAdvertisement();
        }

        //设置广告
        function getAdvertisement() {
            $restClient.post("seller/listAdvertiseForType", {
                pageSize: 20,
                type: "order_list"
            }, null, function (data) {
                if (data.data.length) {
                    // $element.find(".title-bar").eq(0).after($($advertisement.create(data.data[0])));
                }
            });
        }


        function setTime() {
            $scope.condition.startTime = moment(moment().add(-7, 'days').format('YYYY-MM-DD') + " 00:00:00")._d;
            /* $scope.condition.endTime = moment(moment().format('YYYY-MM-DD'))._d; //7天
             $scope.condition.startTime = moment().add(-7, 'days')._d;*/
            $scope.condition.endTime = moment(moment().format('YYYY-MM-DD') + " 23:59:59")._d; //7天
        }

        $scope.limitTime = {
            //minDate: '%y-{%M-3}-%d',
            maxDate: '%y-%M-%d'
        };

        //遍历给数据加属性 展开收起的属性 是否选中的属性 处理价格 是否关闭
        var off = ["TRADE_CLOSED", "TRADE_CLOSED_BY_TAOBAO", "ALL_CLOSED", "CLOSED"]; //已关闭的订单状态
        function addAttr() {
            angular.forEach($scope.list, function (item) {
                item.isListMore = false;  //收起展开
                item.trNum = item.orderNum > 2 ? item.orderNum : 2;  //列表后散列的高度
                item.isOff = off.indexOf(item.status) != -1;  //是否是已关闭订单
                item.checkbox = false;  //是否选中的属性 默认没不选中
                item.promotionDesc = [];
                if (item.orders.length == 1) {
                    angular.forEach(item.promotionDetails, function (proitem) {
                        var promotionDesc = proitem.promotionDesc;
                        promotionDesc = promotionDesc.split(':')[0] + '：' + promotionDesc.split(':')[1];
                        item.promotionDesc.push(promotionDesc);
                    })
                } else {
                    angular.forEach(item.orders, function (orderItem, index) {
                        angular.forEach(item.promotionDetails, function (proitem) {
                            if (orderItem.id == proitem.relatedId) {
                                orderItem.promotionDesc = proitem.promotionDesc;
                                proitem.promotionDesc = proitem.promotionDesc.split(':')[0] + '：' + proitem.promotionDesc.split(':')[1];
                            } else if ((proitem.relatedId == proitem.tid) && index == 0) {
                                var promotionDesc = proitem.promotionDesc;
                                promotionDesc = promotionDesc.split(':')[0] + '：' + promotionDesc.split(':')[1];
                                item.promotionDesc.push(promotionDesc);
                            }
                        })
                    })
                }
            });
        }

        //        查看收起订单商品列表
        $scope.listMore = function (ele) {
            ele.isListMore = !ele.isListMore;
            ele.trNum = ele.isListMore == true ? ele.orderNum : 2;
            setClipboard();
        };
        //    修改备注
        $scope.sellerMemo = function () {
            $win.modal({
                templateUrl: "views/components/sellerMemo.html"
            }, $scope);
        };
        //    筛选
        $scope.filtrate = function () {
            getResultsPage(1)
        };

        //全选/取消全选
        $scope.allAddData = function () {
            if (!$scope.isCheckAll) {
                $scope.deleteArray = angular.copy($scope.list);
                $scope.checkboxNum = $scope.list.length;
                for (ele in $scope.list) {
                    $scope.list[ele].checkbox = true;
                }
            } else {
                $scope.deleteArray = [];
                $scope.checkboxNum = 0;
                for (ele in $scope.list) {
                    $scope.list[ele].checkbox = false;
                }
            }
            $scope.isCheckAll = !$scope.isCheckAll;
        };
        //添加或取消删除的数据
        $scope.addDelete = function (ele) {
            if ($scope.deleteArray.indexOf(ele) != -1) {
                $scope.deleteArray.splice($scope.deleteArray.indexOf(ele), 1);
                $scope.checkboxNum--;
            } else {
                $scope.deleteArray.push(ele);
                $scope.checkboxNum++;
            }
            if ($scope.checkboxNum == $scope.list.length) {
                $scope.isCheckAll = 1;
            } else {
                $scope.isCheckAll = 0;
            }
            //$scope.isCheckAll = $scope.deleteArray.length = $scope.list.length ? false : true;

        };
        //复制订单号
        //$scope.clipboardTradeId = clipboardTradeId;
        function clipboardTradeId(item) {
            var clip = new ZeroClipboard.Client();
            clip.glue(item.tid, "zeroClipContainer");
        }

        //复制地址
        //$scope.clipboardAddress = clipboardAddress;
        function clipboardAddress(item) {
            var clip = new ZeroClipboard.Client();
            clip.glue(item.alipayId, "zeroClipContainer");
        }

        //复制要提前生成一个对象 加载数据300毫秒后 在执行 即html网页加载完毕后 没有好的方法只好延时
        function setClipboard() {
            if (clipTimerId) {
                clearInterval(clipTimerId)
            }
            clipTimerId = setTimeout(function () {
                var $targetAddress = $('.addressBtn');//按钮组  地址
                var $targetTradeId = $('.tradeIdBtn');//按钮组  订单号
                var $labelsAddress = $('.clipboardAddress');//文字组 地址
                var $labelsTradeId = $('.clipboardTradeId'); //文字组 订单号
                angular.forEach($targetAddress, function (item, index) {
                    //复制
                    var clipAddress = new ZeroClipboard.Client(); // 新建一个对象 地址
                    clipAddress.setHandCursor(true);
                    clipAddress.setText($labelsAddress[index].textContent); // 设置要复制的文本。
                    clipAddress.addEventListener('mouseUp', function () {
                        $win.alert("复制成功", $scope);
                    });
                    clipAddress.glue(item.id, "zeroClipContainer");
                });
                angular.forEach($targetTradeId, function (item, index) {
                    var clipTradeId = new ZeroClipboard.Client(); // 新建一个对象 订单
                    clipTradeId.setHandCursor(true);
                    clipTradeId.setText($labelsTradeId[index].textContent); // 设置要复制的文本。
                    clipTradeId.addEventListener('mouseUp', function () {
                        $win.alert("复制成功", $scope);
                    });
                    clipTradeId.glue(item.id, "zeroClipContainer");
                });

                //启动bootstrap的提示框
                $("[data-toggle='tooltip']").tooltip();
            }, 300)
        }
        //自定义省份
        $scope.selectArea = function () {
            var modalInstance = $modal.open({
                templateUrl: 'views/components/queryArea.html',
                controller: 'queryAreaCtrl',
                resolve: {
                    selectItems: function () {
                        return $scope.customQueryAreaList;
                    },
                    isSave:function(){
                        return false;
                    }

                },
                backdrop: true
            });

            modalInstance.result.then(function (result) {
                console.log(result);

            });
            $scope.condition.customProvince = '';
        };

        //    分页
        $scope.getResultsPage = getResultsPage;
        function getResultsPage(pageNo,pageSize) {
            if (moment($scope.condition.endTime).diff(moment($scope.condition.startTime)) < 0) {
                $win.alert('开始时间不能小于结束时间');
                return;
            }
            if ($scope.condition.tid) {
                if(!/^[0-9]*$/.test($scope.condition.tid)){
                    $win.alert("订单号只能输入非负数字！");
                    return;
                }
            }
            if ($scope.condition.orderParamKey && $scope.condition.orderParamValue) {
                if ($scope.condition.orderParamKey == 1) {
                    if(!/^[A-Za-z0-9]*$/.test($scope.condition.orderParamValue)) {
                        $win.alert("运单号只能是字母和数字！");
                        return;
                    }
                }
                if ($scope.condition.orderParamKey == 3) {
                    if(!/^[0-9]*$/.test($scope.condition.orderParamValue)){
                        $win.alert("商品编号只能输入非负数字！");
                        return;
                    }
                }
            }

            var obj = {
                tid: $scope.condition.tid ? $scope.condition.tid : null,
                timeType: $scope.condition.timeType,
                startTime: $scope.condition.startTime ? moment($scope.condition.startTime).format('YYYY/MM/DD HH:mm:ss') : null,
                endTime: $scope.condition.endTime ? moment($scope.condition.endTime).format('YYYY/MM/DD HH:mm:ss') : null,
                receiverMobile: $scope.condition.receiverMobile == "" ? null : $scope.condition.receiverMobile,
                buyerNick: $scope.condition.buyerNick ? $scope.condition.buyerNick : null,
                status: $scope.condition.status ? $scope.condition.status : null,
                type: $scope.condition.type,
                pageNo: parseInt(pageNo) - 1,
                pageSize: pageSize||$scope.pageSize,
                sellerFlag: $scope.condition.sellerFlag,
                messageKey: $scope.condition.messageKey,
                messageValue: $scope.condition.messageValue,
                receiverKey: $scope.condition.receiverKey,
                receiverValue: $scope.condition.receiverValue,
                customProvince: $scope.condition.customProvince,
                orderParamKey: $scope.condition.orderParamKey,
                orderParamValue: $scope.condition.orderParamValue
            };
            if ($scope.isNotClose) {
                obj.status = "NO_CLOSED";
            }
            var action = {
                successCallback: function (data) {
                    $scope.list = data.data;
                    $scope.count = data.count;
                    $scope.pageSize = data.pageSize;
                    $scope.pageNo = parseInt(data.pageNo) + 1;
                    addAttr();
                    setClipboard();
                }
            };
            $scope.loading = $restClient.post("seller/trade/search", null, obj, action);
        }

    }]);
/**
 * Created by Jin on 2016/6/17.
 */
app.controller('unprintedExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$common', '$dpPrint', '$compile', '$modifyTemplate', '$timeout', '$dpAddress', '$location', '$local', '$advertisement', '$element', function ($scope, $modal, $restClient, $win, $q, $common, $dpPrint, $compile, $modifyTemplate, $timeout, $dpAddress, $location, $local, $advertisement, $element) {
    init();
    function init() {
        $scope.operateType = 1;
        $scope.operateStatus = 1;
        $scope.messages = '数据加载中。。';
        $scope.reachLoding = false;
        $scope.toolMessage = '';
        //分页相关
        $scope.pageNo = 1;
        $scope.pageSize = 20;
        $scope.count = 0;
        //筛选参数初始化
        $scope.receiverKey = 1;
        $scope.skuKey = 1;
        $scope.messageKey = 1;
        $scope.itemKey = 1;
        $scope.numKey = 1;
        $scope.dateKey = 1;
        $scope.customStarId = "";
        $scope.obj = {
            userExpressTemp: '',
            defaultReceiptAddress: '',
            baseSetting: ''
        };
        $scope.packageNum = 0;
        $scope.limitTime1 = {
            startDate: '%y-%M-%d 00:00:00',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        $scope.limitTime2 = {
            startDate: '%y-%M-%d 23:59:59',
            dateFmt: 'yyyy-MM-dd HH:mm:ss'
        };
        getData();

        $scope.validateOptions = {
            blurTrig: true
        };
        //初始化菜鸟云打印控件
        $dpPrint.initCaiNiao();
        //获取广告
        getAdvertisement();
    }

    //重置查询数据
    $scope.resetForm = function () {
        //查询数据
        $scope.operateType = 1;
        $scope.operateStatus = 1;
        //筛选数值设置
        $scope.receiverValue = null;
        $scope.skuValueSize = null;
        $scope.skuValue = null;
        $scope.messageValue = null;
        $scope.itemValue = null;
        $scope.numValueStart = null;
        $scope.numValueEnd = null;
        $scope.dateValueStart = null;
        $scope.dateValueEnd = null;

        //筛选key设置
        $scope.receiverKey = 1;
        $scope.skuKey = 1;
        $scope.messageKey = 1;
        $scope.itemKey = 1;
        $scope.numKey = 1;
        $scope.dateKey = 1;
        $scope.customStarId = "";
        $scope.fastChoiceStatus = "";
        $scope.sellerFlag = "";
        $scope.userTemplate = "";
        $scope.userExpressId = "";
        $scope.customProvince = "";
        $scope.tradeType = "";
        $scope.customStarColor = "";
        $local.clearData();
    };
    //获取数据
    function getData() {
        //设置搜索项初始值
        getParam().then(setFormerSearch).then(function () {

            getOrder($scope.pageNo, $scope.pageSize);
        });
    }

    $scope.$on('$destroy', function () {
        $local.clearData();
    });
    //获取查询参数
    function getParam() {
        var deferred = $q.defer();
        var action = {
            successCallback: function (data) {
                $scope.searchParam = data.data;
                $scope.obj.userExpressTemp = $scope.searchParam.userExpressTemplateList[0];
                $scope.obj.defaultReceiptAddress = $scope.searchParam.defaultReceiptAddress;
                $scope.obj.baseSetting = $scope.searchParam.baseSetting;
                //是否是电子面单
                $scope.waybill = ($scope.obj.userExpressTemp.category == 2);
                $scope.toolMessage = $scope.waybill ? '电子面单单号为系统自动获取不支持手工录入' : '';
                deferred.resolve();
            },
            failCallback: function (data) {
                if (data.resultCode == 900001 || data.resultCode == 900004) {
                    $scope.messages = data.resultMessage;
                    $scope.loading = deferred.promise;
                    $timeout(getData, 500);
                }
                else if (data.resultCode == 900015) {

                }
                else {
                    $scope.packages = [];
                    $win.alert({
                        type: "danger",
                        content: data.resultMessage
                    });
                }
                //getData();
            },
            errorCallback: function (data) {
                $win.alert({
                    type: "danger",
                    content: data
                });
            }
        };
        $scope.PackageSearchModel = {
            operateStatus: $scope.operateStatus
        };
        $scope.loading = $restClient.get('seller/normalPackage/list', null, action);
        return deferred.promise;
    }

    //设置广告
    function getAdvertisement() {
        $restClient.post("seller/listAdvertise", {
            pageSize: 1,
            position: "print_main"
        }, null, function (data) {
            if (data.data.length) {
                $element.find(".title-bar").eq(0).after($($advertisement.create(data.data[0])));
            }
        });
    }

    $scope.getOrder = getOrder;
    //设置筛选项上一次值
    function setFormerSearch() {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var searchModel = $local.getObject('PackageSearchModel');
        searchModel.operateType && ($scope.operateType = searchModel.operateType);
        searchModel.operateStatus && ($scope.operateStatus = searchModel.operateStatus);
        searchModel.tradeType && ($scope.tradeType = searchModel.tradeType);
        searchModel.receiverKey && ($scope.receiverKey = searchModel.receiverKey);
        searchModel.receiverValue && ($scope.receiverValue = searchModel.receiverValue);
        searchModel.fastChoiceStatus && ($scope.fastChoiceStatus = searchModel.fastChoiceStatus);
        // searchModel.customProvince &&($scope.customProvince = searchModel.customProvince);
        searchModel.sellerFlag && ($scope.sellerFlag = searchModel.sellerFlag);
        // searchModel.customStarId &&($scope.customStarId = searchModel.customStarId);
        searchModel.skuKey && ($scope.skuKey = searchModel.skuKey);
        searchModel.skuValue && ($scope.skuValue = searchModel.skuValue);
        searchModel.skuValueSize && ($scope.skuValueSize = searchModel.skuValueSize);
        searchModel.messageKey && ($scope.messageKey = searchModel.messageKey);
        searchModel.messageValue && ($scope.messageValue = searchModel.messageValue);
        searchModel.itemKey && ($scope.itemKey = searchModel.itemKey);
        searchModel.itemValue && ($scope.itemValue = searchModel.itemValue);
        searchModel.numKey && ($scope.numKey = searchModel.numKey);
        searchModel.numValueStart && ($scope.numValueStart = searchModel.numValueStart);
        searchModel.numValueEnd && ($scope.numValueEnd = searchModel.numValueEnd);
        searchModel.userExpressId && ($scope.userExpressId = searchModel.userExpressId);
        searchModel.dateKey && ($scope.dateKey = searchModel.dateKey);
        searchModel.dateValueStart && ($scope.dateValueStart = searchModel.dateValueStart);
        searchModel.dateValueEnd && ($scope.dateValueEnd = searchModel.dateValueEnd);
        //是否空对象
        function isEmptyObject(obj) {
            for (var n in obj) {
                return false
            }
            return true;
        }

        var collapsed = $local.getObject('collapsed');
        if (!collapsed) {    //不为空时
            var element = angular.element('.search-bar');
            var $filterBar = element,
                $btn = element.find(".btn-toggle"),
                $searchPane = element.find(".search-pane"),
                $operations = element.find(".operations");


            $btn.text($filterBar.hasClass("collapsed") ? "收起" : "展开");
            $filterBar.removeClass("collapsed");
            $searchPane.addClass("clearfix");
            $operations.addClass("clearfix");

        }
        deferred.resolve();
        return promise;
    }

    //获取订单
    function getOrder(page, pageSize) {
        function getData() {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $scope.PackageSearchModel = {
                operateStatus: $scope.operateStatus,
                operateType: $scope.operateType,
                // userTemplate: $scope.userTemplate,
                userExpressId: $scope.userExpressId,
                fastChoiceStatus: $scope.fastChoiceStatus,
                tradeType: $scope.tradeType,
                customProvince: $scope.customProvince,
                sellerFlag: $scope.sellerFlag,
                receiverKey: $scope.receiverKey,
                receiverValue: $scope.receiverValue,
                skuKey: $scope.skuKey,
                skuValue: $scope.skuValue,
                skuValueSize: $scope.skuValueSize,
                messageKey: $scope.messageKey,
                messageValue: $scope.messageValue,
                itemKey: $scope.itemKey,
                itemValue: $scope.itemValue,
                numKey: $scope.numKey,
                customStarId: $scope.customStarId,
                numValueStart: $scope.numValueStart,
                numValueEnd: $scope.numValueEnd,
                dateKey: $scope.dateKey,
                dateValueStart: $scope.dateValueStart && moment($scope.dateValueStart).format("YYYY/MM/DD HH:mm:ss"),
                dateValueEnd: $scope.dateValueEnd && moment($scope.dateValueEnd).format("YYYY/MM/DD HH:mm:ss"),

                syncTime: $scope.searchParam.printSync.syncTime,
                waitConsignSequence: $scope.searchParam.baseSetting.waitConsignSequence,
                consignSequence: $scope.searchParam.baseSetting.consignSequence,
                pageSize: pageSize,
                pageNo: --page
            };
            if ($scope.userTemplate) {      //选择了快递模板
                $scope.PackageSearchModel.userTemplateId = $scope.userTemplate.id;
                $scope.PackageSearchModel.userExpressId = $scope.userTemplate.userExpressId;
            } else {                        //仅选择了快递公司
                $scope.userExpressId && ($scope.PackageSearchModel.userExpressId = $scope.userExpressId);
            }
            $scope.messages = '数据加载中。。';
            $scope.loading = $restClient.post('seller/normalPackage/search', null, $scope.PackageSearchModel, function (data) {
                $scope.packages = data.data;
                $scope.pageNo = ++data.pageNo;
                $scope.pageSize = data.pageSize;
                $scope.count = data.count;
                if (data.data.length != 0) {
                    //全选
                    $scope.checkedAll = false;
                    $scope.isCollapsed = false;
                    deferred.resolve();
                }

                console.log(data);
                $scope.packageNum = 0;
                //发货按钮是否显示
                $scope.consignBtn = $scope.operateStatus == 8;
                $scope.consignBtn2 = $scope.operateStatus == 7;

            });
            return promise;
        }

        function initData() {
            $timeout(function () {
                //初始化数据是否可达
                if ($scope.obj.userExpressTemp) {
                    reachWithPackage(clientToServer(angular.copy($scope.packages)), $scope.obj.userExpressTemp);
                }
                //初始化包裹是否可选
                initPackages($scope.packages);
                $scope.isCollapsed = Boolean($scope.searchParam.baseSetting.isShowDetail);
                $scope.expandAll(!$scope.isCollapsed);
            });
        }

        getData().then(initData);
        //获取已打印未发货订单数显示在头部
        countNoPrint();
    }

    //初始化订单状态
    function initPackages(packages) {
        angular.forEach(packages, function (item) {
            item.checked = false;
            item.disabled = false;                                 //包裹异常不可选
            item.compel = false;                                   //包裹异常可选
            item.normal = true;                                   //正常订单
            //全部退款成功关闭的不可选
            if (item.refundStatus == 4) {
                item.disabled = true;
                item.normal = false;
            }
            //退款中或存在异常的订单
            if (item.refundStatus == 1 || item.refundStatus == 2 || item.normalPackage.addressChangeTids || item.normalPackage.isNeedTipStatusChange == 1) {
                item.compel = true;
            }
            /*if ((item.refundStatus == 0 || item.refundStatus == 3) && (!item.normalPackage.addressChangeTids && item.normalPackage.isNeedTipStatusChange != 1)) {
             item.normal = true;

             } else if ((item.refundStatus == 1 || item.refundStatus == 2) && (!item.normalPackage.addressChangeTids && item.normalPackage.isNeedTipStatusChange != 1)) {
             item.compel = true;
             item.disabled = true;
             } else {
             item.disabled = true;
             }*/
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    normalOrder.checked = false;
                    normalOrder.compel = false;                  //强制可选
                    normalOrder.normal = false;                 //非正常订单
                    normalOrder.disabled = false;                //可强制选
                    if (normalOrder.refundStatus == 'SUCCESS' ||
                        (normalOrder.consignStatus == 0 && (normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' || normalOrder.status == 'TRADE_BUYER_SIGNED' ||
                        normalOrder.status == 'TRADE_FINISHED' || normalOrder.status == 'TRADE_CLOSED' ||
                        normalOrder.status == 'TRADE_CLOSED_BY_TAOBAO'))) {

                        normalOrder.disabled = true;            //包裹强制不可选
                    } else if (normalOrder.refundStatus == 'WAIT_SELLER_AGREE' || normalOrder.refundStatus == 'WAIT_BUYER_RETURN_GOODS' ||
                        normalOrder.refundStatus == 'WAIT_SELLER_CONFIRM_GOODS' || normalOrder.refundStatus == 'SELLER_REFUSE_BUYER') {
                        normalOrder.normal = true;
                        normalOrder.compel = true;              //可强制选订单
                    } else {

                        normalOrder.normal = true;             //正常订单
                    }
                })
            })
        })
    }

    //验证是否可达
    function reachWithPackage(packages, expressTemplate) {
        var normalPackages = $(packages).map(function () {
            return this.normalPackage
        }).get();
        $scope.reachLoding = true;
        $restClient.post('seller/normalPackage/reachWithPackage', {expressId: expressTemplate.expressId}, normalPackages, function (data) {
            console.log(data);
            $scope.reachLoding = false;
            angular.forEach($scope.packages, function (Package, i) {
                Package.normalPackage.isReach = data.data[i].isReach;
                Package.normalPackage.isExpressSame = data.data[i].isExpressSame;
                Package.normalPackage.terminiBigChar = data.data[i].terminiBigChar;
            });
        });
    }

    //查询参数转换
    function clientToServer(data) {
        angular.forEach(data, function (item) {
            delete item.checked;
            delete item.disabled;
            delete item.compel;
            delete item.normal;
            delete item.needTipRural;
            delete item.isNeedTipStatusChange;
            delete item.isNeedTipMatching;
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    delete normalOrder.checked;
                    delete normalOrder.compel;
                    delete normalOrder.normal;
                    delete normalOrder.disabled;

                })
            })
        });
        return data;
    }

    //打开修改窗口
    function openModal(temp, Obj, size) {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/" + temp + ".html",
            controller: temp + "Ctrl",
            size: size,
            resolve: {
                data: function () {
                    return angular.copy(Obj);
                }
            }
        });
        return modalInstance;
    }

    //检查包裹
    function checkPackage(packages, chooseOrder) {
        var oneChoose = false;
        angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                if (chooseOrder) {                                     //当选择订单时
                    oneChoose = oneChoose || normalOrder.checked;       //check包裹的选中状态
                    packages.checked = oneChoose;
                } else {                                                //当选择包裹时
                    if (packages.checked) {                              //选中包裹
                        if (normalOrder.normal) {
                            normalOrder.checked = packages.checked;       //将包裹正常的订单选中
                        }
                    } else {                                              //取消选中包裹
                        normalOrder.checked = packages.checked;         //全部不选
                    }
                }
            })
        })

    }

    function getSelectedPackages() {
        var packages = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && packages.push(item);
        });
        return packages;
    }

    function getSelectedOrders() {
        var Orders = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    normalOrder.checked && Orders.push(normalOrder);
                })
            })
        });
        return Orders;
    }

    function getSelectedTrades(Packages) {
        var Trades = [];
        angular.forEach(Packages, function (item) {
            angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                Trades.push(normalTrade);
            })
        });
        return Trades;
    }

    //过滤未选中订单
    function filterUncheckedOrder(packages) {
        angular.forEach(packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade, i) {
                normalTrade.normalOrderList = normalTrade.normalOrderList.filter(function (order) {
                    if (order.checked) {
                        return order;
                    }
                });

            });
            Package.normalPackage.normalTradeList = Package.normalPackage.normalTradeList.filter(function (normalTrade) {
                if (normalTrade.normalOrderList.length != 0) {
                    return normalTrade;
                }
            });
        });
        return packages;
    }

    //合单
    function mergeTrade(Packages) {
        choosePackage(Packages);
        //合单操作
        function choosePackage(Packages) {               //选择要合并的订单
            var modelInstance = openModal('choosePackage', Packages, 'lg');
            modelInstance.result.then(function (data) {
                chooseAddress(data);
            });
        }

        //合单下一步
        function chooseAddress(packages) {               //选择主订单地址
            var modelInstance = openModal('chooseAddress', packages, 'lg');
            modelInstance.result.then(function (data) {
                console.log(data);
                if (data.back) {              //返回上一步
                    choosePackage(Packages);
                } else {
                    $restClient.post('seller/normalPackage/mergeSave', null, data, function (data) {
                        console.log(data);
                        data.data && getOrder($scope.pageNo, $scope.pageSize);
                    });

                }

            });
        }
    }

    //检查运单号
    function is_valid_out_sid(expressId, out_sid) {
        var tb_code = get_exp_tb_code(expressId);
        if (tb_code) {
            if (is_validate_function_exist('is_' + tb_code)) {//验证运单号的函数存在
                var validate_sid_ok = eval('(' + 'is_' + tb_code + '(out_sid)' + ')');

                return validate_sid_ok;
            }
        }
        return false;
    }

    //已打印未发货
    function countNoPrint() {
        $restClient.post('seller/normalPackage/countNoPrint', null, null, function (data) {
            $scope.countNoPrint = data.data;
            $scope.showSlogan = true;
            //已打印快递单页面不显示提示
            if ($scope.operateStatus == 2 || $scope.operateStatus == 5) {
                $scope.showSlogan = false;
            }
            console.log(data);
        });
    }

    //电子面单余额查询
    $scope.remaining = function (userExpressTemp) {
        var params = {
            userExpressId: userExpressTemp.userExpressId
        };
        //是否使用的是其他绑定店铺的账号
        if (userExpressTemp.userId) {
            params.userId = userExpressTemp.userId;
        }

        $scope.loading = $restClient.get('seller/waybill/getSubscription', params, function (data) {
            console.log(data);
            if (data.data) {
                var branchAccountCols = data.data.branchAccountCols[0];
                if (userExpressTemp.branchCode) {
                    angular.forEach(data.data.branchAccountCols, function (item) {
                        if (item.branchCode == userExpressTemp.branchCode) {
                            branchAccountCols = item;
                        }
                    })
                }
                var mes = {
                    title: '电子面单余额！',
                    content: '<ul><li>发货地址：' + branchAccountCols.branchName + '</li>' +
                    '<li>已用单号：' + branchAccountCols.allocatedQuantity + '</li>' +
                    '<li>已回收单号：' + branchAccountCols.cancelQuantity + '</li>' +
                    '<li>单号余额：' + branchAccountCols.quantity + '</li></ul>',
                    img: "images/components/alert/alert-forbid.png",
                    size: 'lg',
                    showClose: true,
                    showCancel: false
                };
                var cover = $win.confirm(mes);

            } else {
                var mes = {
                    title: '余额查询！',
                    content: '<div>您尚未开通<span class="text-warning">【' + $scope.obj.userExpressTemp.userExpressName + '】</span>的电子面单服务，无法查询余额！',
                    img: "images/components/alert/alert-forbid.png",
                    size: 'lg',
                    showClose: true,
                    showCancel: false
                };
                var cover = $win.confirm(mes);
            }

        })
    };
    //设置排序
    $scope.setSort = function () {
        var modalInstance = $modal.open({
            templateUrl: "views/pages/setSort.html",
            controller: "setSortCtrl",
            resolve: {
                data: function () {
                    return angular.copy($scope.searchParam.baseSetting);
                }
            }
        });
        modalInstance.result.then(function (baseSetting) {
            $scope.searchParam.baseSetting = baseSetting;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.put('seller/baseSetting/update', null, baseSetting, function (data) {
                $win.alert({
                    type: "success",
                    content: '设置排序成功'
                });
                data.data && getOrder($scope.pageNo, $scope.pageSize);
            });
        })

    };
    //跳转到已打印快递单
    $scope.checkPrinted = function () {
        $scope.operateType = 1;
        $scope.operateStatus = 2;
        getOrder($scope.pageNo, $scope.pageSize);
    };
    //编辑快递模板
    $scope.editTemp = function (userExpressTemplate) {
        if ($scope.waybill) {
            $modifyTemplate.editCloud(getParam);
        } else {
            $modifyTemplate.edit(userExpressTemplate);
        }
    };
    //删除快递模板
    $scope.deleteTemp = function (userExpressTemplate) {
        $modifyTemplate.deleteTemp(userExpressTemplate, getParam);
    };
    //添加快递模板
    $scope.addExpressTemplate = function () {
        $modifyTemplate.addExpressTemplate(getParam);
    };
    //添加云打印模板
    $scope.addCloudTemplate = function () {
        $modifyTemplate.addCloudTemplate(getParam);
    };
    //切换筛选项
    $scope.$watch('operateType', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.operateStatus = newValue == 1 ? 1 : 7;
        }
    });
    //展开详细
    $scope.expandAll = function (isCollapsed) {
        var collapse = $('.table .tableCollapse');

        if (!isCollapsed) {
            //$('.table .collapse').collapse('show');
            // $('.table .testCollapse').css('display','block');

            if (collapse.hasClass('collapse')) {
                collapse.removeClass('collapse');
                collapse.removeClass('in');
                collapse.css('height', 'auto');
            }
            $('.package-tab').each(function (i, element) {
                if (!$(element).hasClass('expanded')) {
                    $(element).addClass('expanded');
                }
            })
        } else {
            collapse.addClass('collapse');

            $('.package-tab').each(function (i, element) {
                if ($(element).hasClass('expanded')) {
                    $(element).removeClass('expanded');
                }
            });

            //底部栏复原
            $timeout(function () {
                if ($('.operation-bar-wrap').offset().top < $(window).height()) {
                    $('.smart-float-bottom').css({position: 'inherit'});
                }
            }, 500);
        }

        $scope.searchParam.baseSetting.isShowDetail = Number(!isCollapsed);

        $restClient.put('seller/baseSetting/update', null, $scope.searchParam.baseSetting, function (data) {
            console.log(data);
        });
    };
    //关闭异常提示
    $scope.closeTip = function (Package) {
        var type = [];
        if (Package.isNeedTipStatusChange) {

            Package.normalPackage.isNeedTipStatusChange = 0;
            type.push(3);
            delete Package.isNeedTipStatusChange;


        }
        if (Package.addressChangeTids) {

            Package.normalPackage.addressChangeTids = "";
            type.push(1);
            delete Package.addressChangeTids;


        }
        if (type.length > 0) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.postFormData('seller/normalPackage/closeWarn', {
                packageId: Package.normalPackage.id,
                types: type.join(',')
            }, function (data) {
                console.log(data);
                if (data.data == 1) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }
                if ((Package.refundStatus == 0 || Package.refundStatus == 3) && (!Package.normalPackage.addressChangeTids && Package.normalPackage.isNeedTipStatusChange != 1)) {
                    Package.disabled = false;
                }
            });
        }

    };
    //切换模板检查是否可达
    $scope.switchTemplate = function (expressTemplate) {
        if ($scope.packages.length > 0) {
            reachWithPackage(clientToServer(angular.copy($scope.packages)), expressTemplate);
        }
        console.log(expressTemplate);
        //是否是电子面单
        $scope.waybill = (expressTemplate.category == 2);
        $scope.toolMessage = $scope.waybill ? '电子面单单号为系统自动获取不支持手工录入' : '';
    };
    //派送范围
    $scope.reachCover = function (Package) {
        //转换数据
        var array = [];
        array.push(angular.copy(Package));
        var normalPackage = clientToServer(array)[0].normalPackage;
        $restClient.post('seller/normalPackage/reachCover', {expressId: $scope.obj.userExpressTemp.expressId}, normalPackage, function (data) {
            console.log(data);
            var modalInstance = $modal.open({
                templateUrl: "views/pages/reachCover.html",
                controller: "reachCoverCtrl",
                resolve: {
                    data: function () {
                        return angular.copy(data.data);
                    },
                    normalPackage: function () {
                        return angular.copy(Package);
                    }
                }
            });
            modalInstance.result.then(function () {

                var reachCorrectModal = $modal.open({
                    templateUrl: "views/pages/addCorrectScope.html",
                    controller: "editCorrectScopeCtrl",
                    resolve: {
                        Package: function () {
                            return angular.copy(Package);
                        },
                        correctionRange: function () {
                            return angular.copy(data.data.correctionRange);
                        }
                    }
                });
                reachCorrectModal.result.then(function (params) {
                    // Package.normalPackage.isReach = isReach;
                    $restClient.post('seller/correctionRange/save', null, params, function (data) {
                        $win.alert({
                            type: "success",
                            content: '修改成功'
                        });
                        reachWithPackage(clientToServer(angular.copy($scope.packages)), $scope.obj.userExpressTemp);
                    });

                });
            });
        });
    };
    //联想快递单号/ onePackage:点击的包裹;isConsign:是否打印后发货联想
    $scope.associateExpressNo = function (onePackage, isConsign) {
        // onePackage.smart = true;
        var packages = getSelectedPackages();

        if (packages.length > 1) {                           //选择了多笔订单
            var index = -1;
            angular.forEach(packages, function (Package, i) {
                if (Package.normalPackage.id == onePackage.normalPackage.id) {
                    index = i;
                }
            });
            if (index == -1) {                                  //若点击的包裹非选中
                inputOneExpressNo();
                return false;
            } else if (index > 0) {                               //若点击的包裹非首个
                packages.splice(0, index);                      //截取点击位以下包裹

            }

            console.log(packages);
            packages.length > 1 ? inputBatchExpressNo(packages) : inputOneExpressNo();

        } else {
            inputOneExpressNo();
        }
        function inputOneExpressNo() {      //单个联想
            if (onePackage.normalPackage.expressNo) {
                $win.alert('已经输入了运单号码，不能联想输入');
                return false;
            } else {
                $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: $scope.obj.userExpressTemp.id}, function (data) {
                    console.log(data);
                    if (data.data) {
                        onePackage.normalPackage.expressNo = window.getNextSid2($scope.obj.userExpressTemp.expressId, data.data, 1);
                        //打印后的联想
                        isConsign && showExpressNo([onePackage], isConsign, onePackage.normalPackage.expressNo);
                    } else {
                        $win.alert('尚未保存过' + $scope.obj.userExpressTemp.name + '的运单号码，所以不能联想输入。您至少要手工录入' +
                            '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                    }
                });
            }
        }

        function showExpressNo(packages, isConsign, sidStart, lastSid) {
            var modalInstance = $modal.open({
                templateUrl: "views/pages/remindExpressNo.html",
                controller: "remindExpressNoCtrl",
                resolve: {
                    data: function () {
                        return angular.copy({
                            sidStart: sidStart,
                            lastSid: lastSid,
                            packages: packages,
                            userExpressName: $scope.obj.userExpressTemp.name,
                            isConsign: isConsign
                        });
                    }
                }
            });
            modalInstance.result.then(function () {
                //是否发货
                if (isConsign) {
                    $scope.consign(1);
                }
            });
        }

        function inputBatchExpressNo(packages) {        //多个联想
            var existExpressNo = false;                 //非首个是否存在运单号

            angular.forEach(packages, function (Package, i) {
                if (i > 0 && Package.normalPackage.expressNo) {
                    existExpressNo = true;
                }
            });
            if (existExpressNo) {
                var mes = {
                    title: '已存在运单号！',
                    content: '当前选择联想的订单已存在运单号，是否覆盖这些运单号码？',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var cover = $win.confirm(mes);
                cover.result.then(function () {
                    inputExpressNo();
                });
            } else {
                inputExpressNo();
            }
            function inputExpressNo() {
                var sidStart;
                if (packages[0].normalPackage.expressNo) {              //第一个包裹是否存在运单号
                    sidStart = packages[0].normalPackage.expressNo;
                    var firstPackage = packages[0];
                    packages.shift();
                    replaceExpressNo(sidStart);
                    //加回原来的元素
                    packages.unshift(firstPackage);
                    showExpressNo(packages, isConsign, sidStart, packages[packages.length - 1].normalPackage.expressNo);
                } else {
                    getSidStart();

                }


                function getSidStart() {                            //获取订单号
                    $restClient.postFormData('seller/userExpressTemplate/getLastExpressNo', {userExpressTemplateId: $scope.obj.userExpressTemp.id}, function (data) {
                        console.log(data);
                        if (data.data) {
                            sidStart = data.data;
                            replaceExpressNo(sidStart);
                            showExpressNo(packages, isConsign, window.getNextSid2($scope.obj.userExpressTemp.expressId, sidStart, 1), packages[packages.length - 1].normalPackage.expressNo);
                        } else {
                            $win.alert('尚未保存过' + $scope.obj.userExpressTemp.name + '的运单号码，所以不能联想输入。您至少要手工录入' +
                                '一个该快递公司的单号，保存或发货成功后，就可以联想了。');
                        }
                    });
                }

                function replaceExpressNo(sidStart) {           //替换订单号
                    angular.forEach(packages, function (Package, i) {
                        var index = 1 + i;
                        Package.normalPackage.expressNo = window.getNextSid2($scope.obj.userExpressTemp.expressId, sidStart, 1);
                        sidStart = Package.normalPackage.expressNo;
                    });
                    //var modelInstance = openModal('remindExpressNo', packages);

                }
            }
        }
    };
    //选择order
    $scope.selectOrder = function (normalOrder, packages) {
        if (!normalOrder.disabled) {
            var choose = normalOrder.checked;
            normalOrder.checked = !choose;
            checkPackage(packages, true);
        }
    };
    //选择包裹
    $scope.selectPackage = function (packages) {
        if (!packages.disabled) {
            //选择的是否是异常订单，是的话进入异常订单弹框提醒
            if (packages.compel && !packages.checked) {
                var blackList = {
                    isRefund: $scope.searchParam.packageWarn.isTipRefund,
                    isAddressChange: $scope.searchParam.packageWarn.isTipAddressChange,
                    isNeedTip: $scope.searchParam.packageWarn.isTipStatusChange
                };

                var stack = [];

                function initStack() {
                    if ((packages.refundStatus == 1 || packages.refundStatus == 2) && blackList.isRefund) {
                        stack.push({
                            type: "isRefund",
                            content: '买家全部或部分申请了退款；'
                        })
                    }
                    if (packages.normalPackage.addressChangeTids && blackList.isAddressChange) {
                        stack.push({
                            type: "isAddressChange",
                            content: '打印快递单后订单状态发生变更；'
                        })
                    }
                    if ((packages.normalPackage.isNeedTipStatusChange == 1) && blackList.isNeedTip) {
                        stack.push({
                            type: "isNeedTip",
                            content: "打印快递单后收货人信息发生变更"
                        })

                    }
                }

                function showTip() {
                    if (stack.length > 0) {
                        var obj = stack.splice(0, 1);
                        var remind = $modal.open({
                            templateUrl: 'views/pages/remindException.html',
                            controller: "remindExceptionCtrl",
                            windowClass: "confirm",
                            size: 'lg',
                            resolve: {
                                data: function () {
                                    return obj;
                                }
                            }
                        });

                        remind.result.then(function (data) {

                            blackList[obj[0].type] = data;

                            if (stack.length == 0) {
                                // packages.checked = true;
                                checkPackage(packages, false);
                                $scope.packageNum = getSelectedPackages().length;

                                if (!blackList.isRefund || !blackList.isAddressChange || !blackList.isNeedTip) {
                                    var packageWarn = {
                                        isTipRefund: blackList.isRefund,
                                        isTipStatusChange: blackList.isNeedTip,
                                        isTipAddressChange: blackList.isAddressChange,
                                        id: $scope.searchParam.packageWarn.id
                                    };

                                    //回传是否提示弹框的值给后台
                                    $restClient.post('seller/normalPackage/closePackageWarn', null, packageWarn, function (data) {
                                        console.log(data);
                                        if (data.data) {
                                            $scope.searchParam.packageWarn.isTipRefund = blackList.isRefund;
                                            $scope.searchParam.packageWarn.isTipAddressChange = blackList.isAddressChange;
                                            $scope.searchParam.packageWarn.isTipStatusChange = blackList.isNeedTip;
                                        }
                                    });
                                }

                            } else {
                                showTip();
                            }

                        }, function () {
                            packages.checked = false;
                            checkPackage(packages, false);
                            $scope.packageNum = getSelectedPackages().length;

                        })
                    } else {
                        var choose = packages.checked;
                        packages.checked = !choose;
                        checkPackage(packages, false);
                        $scope.packageNum = getSelectedPackages().length;
                    }
                }

                initStack();

                showTip();

            } else {

                var choose = packages.checked;
                packages.checked = !choose;
                checkPackage(packages, false);
                $scope.packageNum = getSelectedPackages().length;
            }

        }

    };

    //选择正常订单/异常和退款中及退款完成关闭的除外
    $scope.selectNormal = function () {
        $scope.selectCancel();
        angular.forEach($scope.packages, function (packages) {

            if (packages.normal && (!packages.compel)) {
                packages.checked = true;
                angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }

                    })
                });
            }

        });
        $scope.packageNum = getSelectedPackages().length;
    };
    //选择全部订单/不包括退款完成关闭的
    $scope.selectAllPackage = function () {
        $scope.selectCancel();
        angular.forEach($scope.packages, function (packages) {

            if (!packages.disabled) {
                packages.checked = true;
                angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }
                    })
                })
            }

        });
        $scope.packageNum = getSelectedPackages().length;
    };
    //反选
    $scope.selectInvert = function () {
        //是否存在异常订单
        var existUnusual = false;
        angular.forEach($scope.packages, function (packages) {
            if (packages.normal && !packages.checked) {
                existUnusual = existUnusual || packages.compel;
            }
        });
        if (existUnusual) {
            var mes = {
                title: '所选订单存在异常，是否要继续选中？',
                content: '反向选择的订单部分存在异常(订单状态变更、退款中的订单、收货地址变更)，处理时需谨慎操作，防止错发漏发带来不必要损失。',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            var remind = $win.confirm(mes);
            remind.result.then(function () {
                angular.forEach($scope.packages, function (packages) {
                    if (packages.normal) {
                        packages.checked = !packages.checked;
                        angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                if (normalOrder.normal) {
                                    normalOrder.checked = !normalOrder.checked;
                                }
                            })
                        });
                        //order被选中则package也被选中
                        checkPackage(packages, true);
                    }

                });
                $scope.packageNum = getSelectedPackages().length;
            })
        } else {
            angular.forEach($scope.packages, function (packages) {
                if (packages.normal) {
                    packages.checked = !packages.checked;
                    angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                        angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                            if (normalOrder.normal) {
                                normalOrder.checked = !normalOrder.checked;
                            }
                        })
                    });
                    //order被选中则package也被选中
                    checkPackage(packages, true);
                }

            });
            $scope.packageNum = getSelectedPackages().length;
        }


    };
    //取消
    $scope.selectCancel = function () {

        angular.forEach($scope.packages, function (packages) {
            packages.checked = false;

            angular.forEach(packages.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {

                    normalOrder.checked = false;

                })
            })
        });
        $scope.checkedAll = false;
        $scope.packageNum = getSelectedPackages().length;
    };

    //查询订单
    $scope.search = function () {
        getOrder();
        $local.setObject('PackageSearchModel', $scope.PackageSearchModel);
        //搜索栏展开状态
        $local.setObject('collapsed', angular.element('.search-bar').hasClass('collapsed'));
    };
    //自定义省份
    $scope.selectArea = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/components/queryArea.html',
            controller: 'queryAreaCtrl',
            resolve: {
                isSave: function () {
                    return true;
                },
                selectItems: function () {
                    return $scope.searchParam.customQueryAreaList;
                }

            },
            backdrop: true
        });

        modalInstance.result.then(function (result) {
            $scope.searchParam.customQueryAreaList.push(result);
        });
        $scope.customProvince = '';
    };
    //提示合并订单
    $scope.tipMergeForm = function (Package) {
        $restClient.postFormData('seller/normalPackage/tipMergeForm', {packageId: Package.id}, function (data) {
            console.log(data);
            angular.forEach(data.data, function (Package) {
                Package.checked = true;
            });
            mergeTrade(data.data);
        });

    };
    //强制合并订单
    $scope.mergeSave = function () {
        var Packages = getSelectedPackages();
        if (Packages.length < 2) {
            var mes = {
                title: '不符合合单规则，无法进行合并订单！',
                content: '合并订单至少选择两笔或两笔以上的订单方可合单',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            $win.confirm(mes);
            return false;
        }

        checkDeliverPackage(Packages) ? mergeTrade(Packages) : $win.alert('存在多笔已发货订单且地址不同，无法合单');

        function checkDeliverPackage(Packages) {        //检查是否有多笔已发货且不同地址
            var deliverPackages = [];
            var sameAddress = true;
            angular.forEach(Packages, function (Package) {
                if (Package.normalPackage.isPrintDeliveryBill) {
                    deliverPackages.push(Package);
                }
            });

            if (deliverPackages.length > 1) {  //多笔部分发货订单
                var keepGoing = true;
                keepGoing && angular.forEach(deliverPackages, function (Package, index) {
                    for (var i = index + 1; i < deliverPackages.length; i++) {
                        keepGoing = sameAddress = Package.normalPackage.receiverAddress == deliverPackages[i].normalPackage.receiverAddress;
                        if (!sameAddress) break;
                    }
                })
            }
            return sameAddress;
        }

    };
    //拆分订单
    $scope.splitSave = function (Package) {

        function chooseTrade(Package) {               //选择要拆分的订单
            var modelInstance = openModal('chooseTrade', Package, 'lg');
            modelInstance.result.then(function (data) {
                chooseStatus(data);
            });
        }


        function chooseStatus(trade) {               //选择订单状态
            var modelInstance = openModal('chooseStatus', trade, 'lg');
            console.log(trade);
            modelInstance.result.then(function (data) {

                if (data.back) {              //返回上一步
                    chooseTrade(Package);
                } else {
                    $restClient.post('seller/normalPackage/splitSave', null, data, function (data) {
                        console.log(data);
                        data.data && getOrder();
                    });
                }

            });
        }

        if (Package.normalPackage.normalTradeList.length > 1) {
            chooseTrade(Package);
        } else {
            var mes = {
                title: '不符合拆单规则，无法进行拆分订单！',
                content: '拆分订单至少需要有两笔或两笔以上的订单方可拆分',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };
            $win.confirm(mes);
        }
    };
    //修改打印状态
    $scope.updatePrintState = function (normalPackage) {
        var modelInstance = openModal('updatePrintState', normalPackage);
        modelInstance.result.then(function (params) {

            if (params.isPrintExpress != null || params.isPrintDeliveryBill != null) {
                (params.isPrintExpress == null) ? delete params.isPrintExpress : (params.isPrintExpress = parseInt(params.isPrintExpress));
                (params.isPrintDeliveryBill == null) ? delete params.isPrintDeliveryBill : (params.isPrintDeliveryBill = parseInt(params.isPrintDeliveryBill));

                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.post('seller/normalPackage/updatePrintState', null, params, function (data) {
                    console.log(data);
                    normalPackage.printDeliveryBillTime = data.data[0].printDeliveryBillTime;
                    normalPackage.printDeliveryBillNum = data.data[0].printDeliveryBillNum;
                    normalPackage.printExpressTime = data.data[0].printExpressTime;
                    normalPackage.printExpressNum = data.data[0].printExpressNum;
                    normalPackage.isPrintExpress = data.data[0].isPrintExpress;
                    normalPackage.isPrintDeliveryBill = data.data[0].isPrintDeliveryBill;
                    //修改order状态
                    angular.forEach(normalPackage.normalTradeList, function (normalTrade) {
                        angular.forEach(normalTrade.normalOrderList, function (normalOrder) {

                            angular.forEach(data.data[0].normalTradeList, function (returnNormalTrade) {
                                if (returnNormalTrade.id == normalTrade.id) {
                                    angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {
                                        if (returnNormalOrder.id == normalOrder.id) {
                                            normalOrder.isPrintExpress = returnNormalOrder.isPrintExpress;
                                            normalOrder.printExpressNum = returnNormalOrder.printExpressNum;
                                            normalOrder.printExpressTime = returnNormalOrder.printExpressTime;
                                            normalOrder.isPrintDelivery = returnNormalOrder.isPrintDelivery;
                                            normalOrder.printDeliveryNum = returnNormalOrder.printDeliveryNum;
                                            normalOrder.printDeliveryTime = returnNormalOrder.printDeliveryTime;
                                        }
                                    })
                                }

                            })

                        })
                    })

                });
            }
        });
    };
    //修改收货地址
    $scope.updateReceiverAddress = function (normalPackage) {
        var modelInstance = openModal('updateReceiverAddress', normalPackage, 'lg');
        modelInstance.result.then(function (params) {
            delete params.normalTradeList;
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateReceiverAddress', null, params, function (data) {
                console.log(data);
                data.data && getOrder($scope.pageNo, $scope.pageSize);
            });
        });
    };
    //选中本条及以下
    $scope.selectAfter = function (index) {
        //if(packages.normal)
        //console.log(index);
        $scope.selectCancel();
        for (var i = index; i < $scope.packages.length; i++) {
            if ($scope.packages[i].normal) {
                $scope.packages[i].checked = true;
                angular.forEach($scope.packages[i].normalPackage.normalTradeList, function (normalTrade) {
                    angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                        if (normalOrder.normal) {
                            normalOrder.checked = true;
                        }
                    })
                })
            }
        }
        $scope.packageNum = getSelectedPackages().length;
    };
    //选择本单
    $scope.selectThis = function (Package) {
        Package.checked = true;
        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                normalOrder.checked = true;
            })
        })
    };
    //查看日志
    $scope.showLog = function (Package) {
        var modelInstance = openModal('showLog', Package, 'lg');

    };
    //重新同步
    $scope.syncAgain = function (normalPackage) {

        var params = $(normalPackage.normalTradeList).map(function () {
            return this.tid;
        }).get().join(",");
        $scope.messages = '订单同步中。。';
        $scope.loading = $restClient.postFormData('seller/normalPackage/syncAgain', {tids: params}, function (data) {
            console.log(data);
            $win.alert({
                type: 'success',
                content: '同步成功'
            });
            //data.data && getOrder();
        });
    };
    //修改分类名
    $scope.updateCustomStar = function (customStarList, customStarId) {
        $scope.customStarColor = "";
        if (customStarId == -1000) {
            var modelInstance = openModal('updateCustomStar', customStarList);
            modelInstance.result.then(function (params) {
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.put('seller/c/update', null, params, function (data) {
                    console.log(data);
                    data.data && getParam();
                });
            });
            $scope.customStarId = "";
        } else {
            angular.forEach(customStarList, function (customStar) {
                if (customStar.id == customStarId) {
                    $scope.customStarColor = customStar.color;
                }
            })
        }
    };
    //设置包裹分类
    $scope.setCustomStar = function (normalPackage, customStar) {
        var params = {
            packageIds: normalPackage.id
        };
        customStar && (params.customStarId = customStar.id);
        $scope.messages = '数据提交中。。';
        $scope.loading = $restClient.postFormData('seller/c/save', params, function (data) {
            console.log(data);
            //data.data && getOrder();
            if (customStar) {
                normalPackage.customStarId = customStar.id;
                normalPackage.customStarColor = customStar.color;
            } else {
                delete normalPackage.customStarId;
                delete normalPackage.customStarColor;
            }
        });
    };
    //保存运单号
    $scope.saveExpressNo = function () {
        var Packages = getSelectedPackages();
        Packages = filterUncheckedOrder(angular.copy(Packages));
        Packages = clientToServer(Packages);
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        var existExpressNo = true;  //都存在运单号
        angular.forEach(Packages, function (Package) {
            if (Package.normalPackage.expressNo) {
                Package.normalPackage.expressNo = Package.normalPackage.expressNo.toUpperCase();
            }
            existExpressNo = Package.normalPackage.expressNo && existExpressNo;

        });
        existExpressNo ? checkExpressNo(Packages).then(postData) : $win.alert('请输入运单号码');

        function checkExpressNo(selectPackages) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var validate = [];
            var invalidate = [];
            angular.forEach(selectPackages, function (Package) {
                var out_sid = Package.normalPackage.expressNo;
                var expressId = $scope.obj.userExpressTemp.expressId;
                if (is_valid_out_sid(expressId, out_sid)) {
                    validate.push(Package);
                } else {
                    invalidate.push(Package);
                }
            });
            if (invalidate.length > 0) {
                var mes = {
                    title: '所输运单号不满足此快递运单号规则，是否继续保存？',
                    content: '共勾选了' + '<span class="text-warning">【' + selectPackages.length + '】</span>' + '笔订单，其中有' + '<span class="text-warning">【' + invalidate.length + '】</span>' + '笔所输入的运单号不符合' + '<span class="text-warning">【' + $scope.obj.userExpressTemp.userExpressName + '】</span>' + '运单号规则',
                    img: "images/components/alert/alert-forbid.png",
                    closeText: '保存',
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                var remind = $win.confirm(mes);
                remind.result.then(function () {
                    deferred.resolve(selectPackages);
                });
            } else {
                deferred.resolve(selectPackages);
            }

            return promise;
        }

        function postData(Packages) {
            var params = $(Packages).map(function () {
                return {
                    id: this.normalPackage.id,
                    normalTradeList: this.normalPackage.normalTradeList,
                    expressNo: this.normalPackage.expressNo,
                    userExpressId: $scope.obj.userExpressTemp.userExpressId,
                    userTemplateId: $scope.obj.userExpressTemp.id
                };
            }).get();
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/saveExpressNo', null, params, function (data) {
                console.log(data);
                if (data.data) {
                    angular.forEach(getSelectedPackages(), function (Package) {
                        Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                        Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                        Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                        Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                    });

                    $win.alert({
                        type: "success",
                        content: '保存运单号成功'
                    });
                }
            });
        }


    };
    //删除运单号码
    $scope.deleteExpressNo = function () {
        var Packages = getSelectedPackages();
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        var mes = {
            title: '您确定要删除（作废）所选的运单号吗？',
            content: '将对' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单的运单号进行删除，删除后无法恢复。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var remind = $win.confirm(mes);
        remind.result.then(function () {
            postData();
        });
        function postData() {
            var params = $(Packages).map(function () {
                var obj = {
                    id: this.normalPackage.id,
                    userExpressId: this.normalPackage.userExpressId,
                    userTemplateId: this.normalPackage.userTemplateId
                };
                return obj;
            }).get();
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/deleteExpressNo', null, params, function (data) {
                console.log(data);
                angular.forEach(Packages, function (Package) {
                    Package.normalPackage.expressNo = null;
                });

                $win.alert({
                    type: "success",
                    content: '删除运单号成功'
                });
            });
        }

    };
    //批量修改物流公司与物流模板
    $scope.updateUserExpressTemplate = function () {
        var Packages = getSelectedPackages();

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        var params = $(clientToServer(filterUncheckedOrder(angular.copy(Packages)))).map(function () {
            var obj = {
                id: this.normalPackage.id,
                normalTradeList: this.normalPackage.normalTradeList,
                userExpressId: $scope.obj.userExpressTemp.userExpressId,
                userTemplateId: $scope.obj.userExpressTemp.id
            };
            return obj;
        }).get();
        $scope.messages = '数据提交中。。';
        $scope.loading = $restClient.post('seller/normalPackage/updateUserExpressTemplate', null, params, function (data) {
            console.log(data);

            if (data.data) {
                angular.forEach(Packages, function (Package) {
                    Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                    Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                    Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                    Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                });

                $win.alert({
                    type: "success",
                    content: '修改快递模板成功'
                });
            }
        });


    };
    //修改宝贝简称
    $scope.updateItemTitle = function (normalOrder) {
        var modelInstance = openModal('updateItemTitle', normalOrder);
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateItemTitle', null, params, function (data) {
                console.log(data);

                normalOrder.abbrevName = params.normalOrder.abbrevName;
                if (params.isAllUpdate) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }
            });
        });
    };
    //修改sku属性
    $scope.updateSku = function (normalOrder) {

        var modalInstance = $modal.open({
            templateUrl: "views/pages/updateSku.html",
            controller: "updateSkuCtrl",
            resolve: {
                data: function () {
                    return {
                        normalOrder: angular.copy(normalOrder),
                        baseSetting: $scope.searchParam.baseSetting
                    };
                }
            }
        });


        modalInstance.result.then(function (data) {

            if (typeof data == 'object') {
                data.id = $scope.searchParam.baseSetting.id;
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.put('seller/baseSetting/update', null, data, function (data) {
                    console.log(data);
                    data.data && $win.alert({
                        type: "success",
                        content: '修改成功'
                    });
                    getOrder($scope.pageNo, $scope.pageSize);
                });

            } else {
                normalOrder.skuChangeName = data;
            }

        });

    };
    //修改软件备注
    $scope.updateSysMemo = function (normalTrade, Package) {
        var Packages = getSelectedPackages();

        var modelInstance;
        if (normalTrade) {                //单个修改
            modelInstance = openModal('updateSysMemo', normalTrade);
            Packages = [Package];

        } else {                          //批量修改
            var trades = getSelectedTrades(filterUncheckedOrder(angular.copy(Packages)));
            if (trades.length == 0) {
                $win.alert('请至少选择一个订单');
                return false;
            } else {
                var tids = $(trades).map(function () {
                    return this.tid;
                }).get().join(',');

                modelInstance = openModal('updateSysMemo', tids);
            }

        }
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.postFormData('seller/normalPackage/updateSysMemo', params, function (data) {
                console.log(data);

                if (normalTrade) {
                    normalTrade.sysMemo = params.sysMemo;

                } else {
                    //回调修改值
                    angular.forEach($scope.packages, function (item) {
                        item.checked && angular.forEach(item.normalPackage.normalTradeList, function (normalTrade) {
                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                if (normalOrder.checked) {
                                    normalTrade.sysMemo = params.sysMemo;
                                }
                            })
                        })
                    });
                }
                //重新拼接包裹的留言
                angular.forEach(Packages, function (Package) {

                    Package.sysMemos = [];
                    angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                        if (normalTrade.sysMemo) {
                            Package.sysMemos.push(normalTrade.sysMemo);
                        }
                    });
                    Package.sysMemos = Package.sysMemos.join('|');

                })
            });
        });

    };
    //修改卖家备注
    $scope.updateSellerMemo = function (normalTrade, Package) {

        var modelInstance = openModal('updateSellerMemo', normalTrade);
        modelInstance.result.then(function (params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/updateSellerMemo', null, params, function (data) {
                console.log(data);
                if (data.data) {
                    normalTrade.sellerFlag = params.sellerFlag;
                    normalTrade.sellerMemo = params.sellerMemo;
                    //重新拼接包裹的留言
                    angular.forEach(Package.packageMemoDtoList, function (packageMemo, i) {

                        if (Package.normalPackage.normalTradeList[i].sellerFlag) {
                            packageMemo.sellerFlag = Package.normalPackage.normalTradeList[i].sellerFlag;
                        }
                        if (Package.normalPackage.normalTradeList[i].sellerMemo) {
                            packageMemo.sellerMemo = Package.normalPackage.normalTradeList[i].sellerMemo;
                        }

                    })
                }
            });
        });
    };
    //批量修改卖家备注
    $scope.batchUpdateSellerMemo = function () {
        var Packages = getSelectedPackages();

        var trades = getSelectedTrades(filterUncheckedOrder(angular.copy(Packages)));
        if (trades.length == 0) {
            $win.alert('请至少选择一个订单');
            return false;
        } else {
            var tids = $(trades).map(function () {
                return this.tid;
            }).get().join(',');

            var modelInstance = openModal('updateSellerMemo', tids);
            modelInstance.result.then(function (params) {
                $scope.messages = '数据提交中。。';
                $scope.loading = $restClient.post('seller/normalPackage/batchUpdateSellerMemo', null, params, function (data) {
                    console.log(data);
                    if (data.data.errorList && data.data.errorList.length > 0) {
                        var modelInstance = openModal('errorList', data.data.detailNormalTradeList);

                    }
                    if (data.data.successList && data.data.successList.length > 0) {
                        //回调修改值
                        angular.forEach($scope.packages, function (item) {
                            item.checked && angular.forEach(item.normalPackage.normalTradeList, function (trade) {
                                angular.forEach(trade.normalOrderList, function (normalOrder) {
                                    if (normalOrder.checked) {
                                        if (data.data.successList.indexOf(trade.tid) > -1) {
                                            if (params.sellerFlag) {
                                                trade.sellerFlag = params.sellerFlag;
                                            }
                                            if (params.updateType == 1) {
                                                trade.sellerMemo = params.sellerMemo;
                                            } else if (params.updateType == 2) {
                                                trade.sellerMemo = params.sellerMemo.concat(trade.sellerMemo);
                                            } else if (params.updateType == 3) {
                                                trade.sellerMemo = trade.sellerMemo.concat(params.sellerMemo);
                                            }
                                        }
                                    }
                                })
                            })
                        });

                        //重新拼接包裹的留言
                        angular.forEach(Packages, function (Package) {
                            //重新拼接包裹的留言
                            angular.forEach(Package.packageMemoDtoList, function (packageMemo, i) {

                                if (Package.normalPackage.normalTradeList[i].sellerFlag) {
                                    packageMemo.sellerFlag = Package.normalPackage.normalTradeList[i].sellerFlag;
                                }
                                if (Package.normalPackage.normalTradeList[i].sellerMemo) {
                                    packageMemo.sellerMemo = Package.normalPackage.normalTradeList[i].sellerMemo;
                                }

                            });

                        })
                    }
                });
            });
        }
    };
    //获取电子面单号
    $scope.applyWaybill = function (Package) {

        var onePackage = Package ? true : false;

        var recycleWaybillPackage = [];     //待回收电子面单号包裹
        var allExistNum = true;  //都存在电子运单号
        var existPrinted = false; //存在已打印订单
        var deferred = $q.defer(),
            promise = deferred.promise;

        //提示信息
        var mes = {
            title: '你确定要获取新的电子面单号吗？',
            content: '获取新的<span class="text-warning">【' + $scope.obj.userExpressTemp.name + '】</span>的电子面单号后，现有的单号如果没有打印发货可能会被浪费掉，您确定要获取新的电子面单号吗？',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        //参数
        var applyWaybillParamModel = {
            userExpressTemplateId: $scope.obj.userExpressTemp.id,
            packageType: 1
        };
        //回调函数
        var actions = {
            successCallback: function (data) {
                console.log(data);
                //获取后回调
                angular.forEach(data.data.successWaybillList, function (successWaybill) {
                    if (onePackage) {
                        if (Package.normalPackage.id == successWaybill.packageId) {
                            Package.normalPackage.waybillId = successWaybill.id;
                            Package.normalPackage.expressNo = successWaybill.expressNo;

                            Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                            Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                            Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                            Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                        }
                    } else {
                        angular.forEach(getSelectedPackages(), function (Package) {
                            if (Package.normalPackage.id == successWaybill.packageId) {
                                Package.normalPackage.waybillId = successWaybill.id;
                                Package.normalPackage.expressNo = successWaybill.expressNo;

                                Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                                Package.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                            }
                        });
                    }
                });

                if (data.data.errorWaybillList.length == 0) {
                    if (onePackage) {
                        $win.alert({
                            type: 'success',
                            content: '新面单号获取成功'
                        })
                    } else {
                        deferred.resolve();
                    }

                } else {
                    //显示电子面单号获取结果提示失败原因
                    $modal.open({
                        templateUrl: 'views/pages/applyWaybillResult.html',
                        controller: "recycleResultCtrl",
                        resolve: {
                            data: function () {
                                return {
                                    errorRecycleList: data.data.errorWaybillList,
                                    successRecycleList: data.data.successWaybillList
                                };
                            }
                        }
                    });
                    if (!onePackage) {
                        deferred.reject();
                    }
                }


            },
            failCallback: function (data) {
                //没开通||没设置网点
                if (data.resultCode == 900015 || data.resultCode == 900017) {
                    $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
                } else
                //没余额
                {
                    var mes = {
                        title: '获取电子面单号',
                        content: data.resultMessage,
                        img: "images/components/alert/alert-forbid.png",
                        size: "lg",
                        showClose: true,
                        showCancel: false
                    };

                    $win.confirm(mes);
                }


            }
        };

        //获取多个包裹时
        if (!onePackage) {
            var Packages = angular.copy(getSelectedPackages());

            if (Packages.length == 0) {
                $win.alert('请至少选择一笔订单');
                deferred.reject();
                return promise;
            }
            //验证所选模板是否开通电子面单
            if (!$scope.obj.userExpressTemp.branchCode) {
                $modifyTemplate.setWaybill($scope.obj.userExpressTemp);
                deferred.reject();
                return promise;
            }


            //是否都存在已选模板的电子面单号
            angular.forEach(Packages, function (Package) {
                //是否存在已打印的已选模板的电子面单号
                existPrinted = existPrinted || (Package.normalPackage.isPrintExpress && Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id));
                allExistNum = Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id) && allExistNum;

                //要回收电子面单的包裹
                if (Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId != $scope.obj.userExpressTemp.id)) {
                    recycleWaybillPackage.push(clientToServer([angular.copy(Package)])[0].normalPackage);
                }

            });

            if (existPrinted) {
                //提示已打印的是否要获取新的单号弹窗
                var remindFilterModal = $modal.open({
                    templateUrl: "views/pages/remindFilter.html",
                    controller: "remindFilterCtrl",
                    windowClass: "confirm",
                    size: 'lg'
                });
                remindFilterModal.result.then(function (filter) {
                    //剔除已存在已选模板的单号的包裹
                    if (!filter) {
                        Packages = Packages.filter(function (Package) {
                            if (!(Package.normalPackage.waybillId && (Package.normalPackage.userTemplateId == $scope.obj.userExpressTemp.id))) {
                                return Package;
                            }
                        });
                    }
                    //若都存在则不去获取且不需获取
                    if (allExistNum && !filter) {
                        deferred.resolve();
                        return promise;
                    }
                    //若有需要回收的单号
                    if (recycleWaybillPackage.length > 0) {
                        //提示是否回收弹窗
                        var remindRecycleModal = $modal.open({
                            templateUrl: "views/pages/recycleRemind.html",
                            controller: "recycleRemindCtrl",
                            windowClass: "confirm",
                            size: 'lg',
                            resolve: {
                                data: function () {
                                    return recycleWaybillPackage;
                                }
                            }
                        });
                        //回收单号
                        remindRecycleModal.result.then(function (recycle) {

                            if (recycle) {
                                var recycleWaybillParams = {
                                    normalPackageList: recycleWaybillPackage,
                                    packageType: 1
                                };
                                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                    console.log(data);
                                    //全部回收成功
                                    if (data.data.errorRecycleList.length == 0) {
                                        //修改成功的
                                        angular.forEach(getSelectedPackages(), function (Package) {
                                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                if (successPackage.packageId == Package.normalPackage.id) {
                                                    Package.normalPackage.expressNo = null;
                                                }
                                            });
                                        });

                                        //拼接参数
                                        Packages = filterUncheckedOrder(angular.copy(Packages));
                                        Packages = clientToServer(Packages);
                                        applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                            return this.normalPackage;
                                        }).get();
                                        //获取单号
                                        $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                                    } else {

                                        //显示打印结果提示失败原因
                                        $modal.open({
                                            templateUrl: 'views/pages/recycleResult.html',
                                            controller: "recycleResultCtrl",
                                            resolve: {
                                                data: function () {
                                                    return data.data;
                                                }
                                            }
                                        });
                                        //修改成功的

                                        angular.forEach(getSelectedPackages(), function (Package) {
                                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                if (successPackage.packageId == Package.normalPackage.id) {
                                                    Package.normalPackage.expressNo = null;
                                                }
                                            });
                                        });


                                    }

                                });
                            } else {
                                //拼接参数
                                Packages = filterUncheckedOrder(angular.copy(Packages));
                                Packages = clientToServer(Packages);
                                applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                    return this.normalPackage;
                                }).get();
                                $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                            }

                        })
                    } else {

                        //拼接参数
                        Packages = filterUncheckedOrder(angular.copy(Packages));
                        Packages = clientToServer(Packages);
                        applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                            return this.normalPackage;
                        }).get();
                        $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                    }
                });
            } else {
                //若都存在则不去获取
                if (allExistNum) {
                    deferred.resolve();
                    return promise;
                }
                //若有需要回收的单号
                if (recycleWaybillPackage.length > 0) {
                    //提示是否回收弹窗
                    var remindRecycleModal = $modal.open({
                        templateUrl: "views/pages/recycleRemind.html",
                        controller: "recycleRemindCtrl",
                        windowClass: "confirm",
                        size: 'lg',
                        resolve: {
                            data: function () {
                                return recycleWaybillPackage;
                            }
                        }
                    });
                    //回收单号
                    remindRecycleModal.result.then(function (recycle) {

                        if (recycle) {
                            var recycleWaybillParams = {
                                normalPackageList: recycleWaybillPackage,
                                packageType: 1
                            };
                            $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                console.log(data);
                                //全部回收成功
                                if (data.data.errorRecycleList.length == 0) {
                                    //修改成功的
                                    angular.forEach(getSelectedPackages(), function (Package) {
                                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                                            if (successPackage.packageId == Package.normalPackage.id) {
                                                Package.normalPackage.expressNo = null;
                                            }
                                        });
                                    });

                                    //拼接参数
                                    Packages = filterUncheckedOrder(angular.copy(Packages));
                                    Packages = clientToServer(Packages);
                                    applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                        return this.normalPackage;
                                    }).get();
                                    //获取单号
                                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);

                                } else {

                                    //显示打印结果提示失败原因
                                    $modal.open({
                                        templateUrl: 'views/pages/recycleResult.html',
                                        controller: "recycleResultCtrl",
                                        resolve: {
                                            data: function () {
                                                return data.data;
                                            }
                                        }
                                    });
                                    //修改成功的

                                    angular.forEach(getSelectedPackages(), function (Package) {
                                        angular.forEach(data.data.successRecycleList, function (successPackage) {
                                            if (successPackage.packageId == Package.normalPackage.id) {
                                                Package.normalPackage.expressNo = null;
                                            }
                                        });
                                    });


                                }

                            });
                        } else {
                            //拼接参数
                            Packages = filterUncheckedOrder(angular.copy(Packages));
                            Packages = clientToServer(Packages);
                            applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                                return this.normalPackage;
                            }).get();
                            $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                        }

                    })
                } else {

                    //拼接参数
                    Packages = filterUncheckedOrder(angular.copy(Packages));
                    Packages = clientToServer(Packages);
                    applyWaybillParamModel.normalPackageList = $(Packages).map(function () {
                        return this.normalPackage;
                    }).get();
                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                }
            }

        } else {

            var filterPackage = clientToServer(angular.copy([Package]));          //filter包裹里未选中的订单
            applyWaybillParamModel.normalPackageList = [filterPackage[0].normalPackage];

            if (Package.normalPackage.waybillId) {
                //单个获取存在单号时提示覆盖
                var remind = $win.confirm(mes);
                remind.result.then(function () {
                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
                })
            } else {
                $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, actions);
            }
        }
        return promise;

    };
    //回收电子面单号
    $scope.recycleWaybill = function (Package) {

        //是否批量回收
        var isBatch = Package ? false : true;
        var mes = {
            title: '你确定要回收当前绑定的电子面单号吗？',
            content: '回收后可以重新申请新的电子面单号或用其他的模板重新打印。',
            img: "images/components/alert/alert-forbid.png",
            size: "lg",
            showClose: true,
            showCancel: true
        };
        var actions = {
            successCallback: function (data) {
                //全部成功
                if (data.data.errorRecycleList.length == 0) {
                    if (isBatch) {
                        angular.forEach(packages, function (Package) {
                            Package.normalPackage.expressNo = null;
                        });

                    } else {
                        Package.normalPackage.expressNo = null;
                    }
                    $win.alert({
                        content: '回收成功',
                        type: 'success'
                    })
                } else {
                    //显示结果
                    $modal.open({
                        templateUrl: 'views/pages/recycleResult.html',
                        controller: "recycleResultCtrl",
                        resolve: {
                            data: function () {
                                return data.data;
                            }
                        }
                    });
                    //批量时回调成功的
                    if (isBatch) {
                        angular.forEach(packages, function (Package) {
                            angular.forEach(data.data.successRecycleList, function (successPackage) {
                                if (successPackage.packageId == Package.normalPackage.id) {
                                    Package.normalPackage.expressNo = null;
                                }
                            });
                        });

                    }
                }

            }
        };

        if (isBatch) {
            var packages = angular.copy(getSelectedPackages());

            if (packages.length == 0) {
                $win.alert('请至少选择一笔订单');
                return false;
            }

            var allExistNum = true;
            //是否都存在已选模板的电子面单号
            angular.forEach(clientToServer(packages), function (Package) {
                allExistNum = Package.normalPackage.waybillId && allExistNum;
            });
            if (!allExistNum) {
                $win.alert('所选订单有不存在运单号,无法全部回收');
                return false;
            }
            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var recycleWaybillParams = {
                    packageType: 1
                };
                recycleWaybillParams.normalPackageList = $(packages).map(function () {
                    return this.normalPackage;
                }).get();

                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
            })


        } else {
            //不存在运单号
            if (!(Package.normalPackage.waybillId && Package.normalPackage.expressNo)) {
                $win.alert('不存在运单号,无法回收');
                return false;
            }

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var filterPackage = clientToServer(angular.copy([Package]));

                var recycleWaybillParams = {
                    normalPackageList: [filterPackage[0].normalPackage],
                    packageType: 1
                };

                $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, actions);
            })
        }
    };
    //使用之前的电子面单号
    $scope.fetchWaybill = function (Package) {

        var getWaybills = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                packageId: Package.normalPackage.id,
                packageType: 1
            };

            $restClient.post('seller/waybill/fetch', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };
        getWaybills().then(function (data) {
            var chooseWaybill = $modal.open({
                templateUrl: 'views/pages/chooseWaybill.html',
                controller: "chooseWaybillCtrl",
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            chooseWaybill.result.then(function (selectWaybill) {
                var postPackage = clientToServer([angular.copy(Package)]);
                var params = {
                    id: postPackage[0].normalPackage.id,
                    waybillId: selectWaybill.id,
                    normalTradeList: postPackage[0].normalPackage.normalTradeList,
                    expressNo: selectWaybill.expressNo,
                    userExpressId: selectWaybill.userExpressId,
                    userTemplateId: selectWaybill.userExpressTemplateId
                };


                $restClient.post('seller/normalPackage/chooseWaybill', null, params, function (data) {
                    console.log(data);
                    Package.normalPackage.expressNo = data.data.expressNo;
                    Package.normalPackage.userExpressId = data.data.userExpressId;
                    Package.normalPackage.userTemplateId = data.data.userTemplateId;
                    Package.normalPackage.userTemplateName = data.data.userTemplateName;
                    Package.normalPackage.expressId = data.data.expressId;
                    Package.normalPackage.waybillId = data.data.waybillId;
                });
            })
        })

    };
    //打印多个电子面单
    $scope.printMultiWaybill = function (Package) {
        //获取以前的单号
        var getWaybills = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                packageId: Package.normalPackage.id,
                packageType: 1
            };

            $restClient.post('seller/waybill/fetch', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };

        var inputTime = $modal.open({
            templateUrl: "views/pages/printMultiWaybill.html",
            controller: "printMultiWaybillCtrl"
        });
        inputTime.result.then(function (data) {
            //请求之前使用过的电子面单号
            var preview = data.preview;
            var times = data.time;
            getWaybills().then(function (waybills) {
                console.log(waybills);
                var packageList = [];
                //过滤掉曾用过不是当前模板的电子面单号
                var filterWaybills = waybills.filter(function (waybill) {
                    if (waybill.userExpressTemplateId == $scope.obj.userExpressTemp.id) {
                        return waybill;
                    }
                });

                //面单号足够
                if (filterWaybills.length >= times) {

                    for (var i = 0; i < data.time; i++) {
                        //曾使用过的与当前所选的模板相同的电子面单号
                        var packageCopy = angular.copy(Package);
                        packageCopy.normalPackage.expressNo = filterWaybills[i].expressNo;
                        packageCopy.normalPackage.waybillId = filterWaybills[i].id;
                        packageCopy.normalPackage.userExpressId = filterWaybills[i].userExpressId;
                        packageCopy.normalPackage.userTemplateId = filterWaybills[i].userExpressTemplateId;
                        packageCopy.normalPackage.userTemplateName = filterWaybills[i].userExpressTemplateName;
                        packageList.push(packageCopy);
                    }

                    $scope.print(preview, 1, packageList);
                } else {
                    for (var i = 0; i < filterWaybills.length; i++) {
                        //曾使用过的与当前所选的模板相同的电子面单号
                        var Copy = angular.copy(Package);
                        Copy.normalPackage.expressNo = filterWaybills[i].expressNo;
                        Copy.normalPackage.waybillId = filterWaybills[i].id;
                        Copy.normalPackage.userExpressId = filterWaybills[i].userExpressId;
                        Copy.normalPackage.userTemplateId = filterWaybills[i].userExpressTemplateId;
                        Copy.normalPackage.userTemplateName = filterWaybills[i].userExpressTemplateName;
                        packageList.push(Copy);
                    }


                    //不够的电子面单号数量
                    var num = times - filterWaybills.length;

                    var normalPackageCopy = clientToServer([angular.copy(Package)])[0].normalPackage;

                    var applyWaybillParamModel = {
                        userExpressTemplateId: $scope.obj.userExpressTemp.id,
                        normalPackageList: [],
                        packageType: 1
                    };
                    //拼接参数获取电子面单
                    while (num > 0) {
                        applyWaybillParamModel.normalPackageList.push(normalPackageCopy);
                        num = num - 1;
                    }

                    $restClient.post('seller/waybill/apply', null, applyWaybillParamModel, function (data) {
                        angular.forEach(data.data.successWaybillList, function (successWaybill) {
                            var packageCopy = angular.copy(Package);

                            packageCopy.normalPackage.waybillId = successWaybill.id;
                            packageCopy.normalPackage.expressNo = successWaybill.expressNo;

                            packageCopy.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                            packageCopy.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                            packageCopy.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;
                            packageCopy.normalPackage.expressId = $scope.obj.userExpressTemp.expressId;
                            packageList.push(packageCopy);

                        });
                        $scope.print(preview, 1, packageList);
                    });
                }

            });
        })
    };
    //使用之前的普通面单
    $scope.findUsedExpressNo = function (Package) {
        var getUsedExpressNo = function () {
            var deferred = $q.defer(),
                promise = deferred.promise;

            var params = {
                tids: Package.normalPackage.mergedTids
            };

            $restClient.post('seller/normalPackage/findUsedExpressNo', params, null, function (data) {
                console.log(data);
                deferred.resolve(data.data);
            });
            return promise;
        };
        getUsedExpressNo().then(function (data) {
            var chooseExpressNo = $modal.open({
                templateUrl: 'views/pages/chooseUsedExpressNo.html',
                controller: "chooseWaybillCtrl",
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            });
            chooseExpressNo.result.then(function (selectExpressNo) {
                var postPackage = clientToServer([angular.copy(Package)]);
                var params = {
                    templateLogId: selectExpressNo.id
                };

                $restClient.post('seller/normalPackage/chooseExpressNo', params, postPackage[0].normalPackage, function (data) {
                    console.log(data);
                    Package.normalPackage.expressNo = data.data.expressNo;
                    Package.normalPackage.userExpressId = data.data.userExpressId;
                    Package.normalPackage.userTemplateId = data.data.userTemplateId;
                    Package.normalPackage.userTemplateName = data.data.userTemplateName;
                    Package.normalPackage.expressId = data.data.expressId;
                });
            })
        });
    };
    //打印 printType:1快递单;printType:2发货单
    $scope.print = function (preview, printType, packageList) {

        var Packages = getSelectedPackages();                             //获得选中的包裹

        //内部手动调用打印方法-》一次打印多个电子面单时 printMultiWaybill
        if (packageList) {
            Packages = packageList;
            var multiWaybill = true;
        }


        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        Packages = filterUncheckedOrder(angular.copy(Packages));          //filter包裹里未选中的订单

        var NormalPackages = $(clientToServer(angular.copy(Packages))).map(function () {    //打印时要使用的数据
            return this.normalPackage;
        }).get();

        var printedPackages = $(Packages).map(function () {                //获得已打印包裹
            if (printType == 1) {                       //已打印过快递单
                if (this.normalPackage.isPrintExpress) {
                    return this;
                }
            }
            if (printType == 2) {                       //已打印过发货单
                if (this.normalPackage.isPrintDeliveryBill) {
                    return this;
                }
            }
        }).get();
        //按钮置为不可点击
        if (printType == 1) {
            $scope.expressProcessing = true;
        }
        if (printType == 2) {
            $scope.deliveryProcessing = true;
        }
        if ($scope.obj.baseSetting.isCheckMorePrint && printedPackages.length > 0 && !multiWaybill) {            //已开启多次打印验证且存在已打印订单
            var typeText = (printType == 1 ? '快递单' : '发货单');
            var buttonText = (preview ? '预览' : '打印') + typeText;
            var modal = $win.confirm({                      //提醒文案
                content: '共勾选了' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单,其中有'
                + '<span class="text-warning">【' + printedPackages.length + '】</span>' + '笔已打印过' + typeText,
                title: '含有已被打印过' + typeText + '的订单，是否要重新打印？',
                closeText: buttonText,
                size: "lg",
                img: "images/components/alert/alert-forbid.png"
            });
            modal.result.then(function () {
                //验证码确认
                return authCode();
            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            }).then(function (data) {

                if (data) {
                    doPrint();
                }


            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            })

        } else {

            doPrint();

        }

        function doPrint() {
            //电子面单打印
            if ($scope.waybill && printType == 1) {
                //一次打印多个电子面单
                if (multiWaybill) {
                    //包裹已经在printMultiWaybill里获取好了单号不用再获取
                    getSerial(NormalPackages).then(function (params) {
                        //获取打印数据

                        var waybillIds = [];
                        angular.forEach(NormalPackages, function (NormalPackage) {
                            waybillIds.push(NormalPackage.waybillId)
                        });
                        $restClient.post("seller/waybill/listPrintData", null, {
                            waybillIds: waybillIds,
                            userTemplateId: $scope.obj.userExpressTemp.id
                        }, function (data) {
                            console.log(data.data);
                            //打印
                            $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 1, $scope)

                        });

                    })

                } else {
                    //检查并获取电子面单号
                    $scope.applyWaybill().then(function () {

                        //重新获取有电子单号的包裹
                        NormalPackages = $(clientToServer(filterUncheckedOrder(angular.copy(getSelectedPackages())))).map(function () {    //打印时要使用的数据
                            return this.normalPackage;
                        }).get();
                        //获取流水号
                        getSerial(NormalPackages).then(function (params) {
                            //获取打印数据

                            var waybillIds = [];
                            angular.forEach(NormalPackages, function (NormalPackage) {
                                waybillIds.push(NormalPackage.waybillId)
                            });
                            $restClient.post("seller/waybill/listPrintData", null, {
                                waybillIds: waybillIds,
                                userTemplateId: $scope.obj.userExpressTemp.id
                            }, function (data) {
                                console.log(data.data);
                                //打印
                                $dpPrint.printWaybill(preview, $scope.obj, data.data, printCallback, params, 1, $scope)

                            });

                        })
                    })
                }


            } else {

                getSerial(NormalPackages).then(function (params) {
                    //打印完后回调 printType 1、快递单 2、发货单
                    //1、普通打印2、自由打印

                    if (printType == 1) {      //打印快递单

                        //判断是否有电子面单号提示是否要回收
                        var recycleWaybillPackage = [];
                        angular.forEach(NormalPackages, function (normalPackage) {
                            if (normalPackage.waybillId) {
                                recycleWaybillPackage.push(normalPackage);
                            }
                        });

                        if (recycleWaybillPackage.length > 0) {
                            //提示是否回收弹窗
                            var remindRecycleModal = $modal.open({
                                templateUrl: "views/pages/recycleRemind.html",
                                controller: "recycleRemindCtrl",
                                windowClass: "confirm",
                                size: 'lg',
                                resolve: {
                                    data: function () {
                                        return recycleWaybillPackage;
                                    }
                                }
                            });
                            //回收单号
                            remindRecycleModal.result.then(function (recycle) {

                                if (recycle) {
                                    var recycleWaybillParams = {
                                        normalPackageList: recycleWaybillPackage,
                                        packageType: 1
                                    };
                                    $restClient.post('seller/waybill/recycle', null, recycleWaybillParams, function (data) {
                                        console.log(data);
                                        //全部回收成功
                                        if (data.data.errorRecycleList.length == 0) {
                                            //修改成功的
                                            angular.forEach(getSelectedPackages(), function (Package) {
                                                angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                    if (successPackage.packageId == Package.normalPackage.id) {
                                                        Package.normalPackage.expressNo = null;
                                                    }
                                                });
                                            });
                                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                                        } else {

                                            //显示打印结果提示失败原因
                                            $modal.open({
                                                templateUrl: 'views/pages/recycleResult.html',
                                                controller: "recycleResultCtrl",
                                                resolve: {
                                                    data: function () {
                                                        return data.data;
                                                    }
                                                }
                                            });
                                            //修改成功的

                                            angular.forEach(getSelectedPackages(), function (Package) {
                                                angular.forEach(data.data.successRecycleList, function (successPackage) {
                                                    if (successPackage.packageId == Package.normalPackage.id) {
                                                        Package.normalPackage.expressNo = null;
                                                    }
                                                });
                                            });


                                        }
                                    })
                                } else {
                                    $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                                }
                            })
                        } else {
                            $dpPrint.printExpress(preview, $scope.obj, printCallback, params, NormalPackages, 1);
                        }
                    }
                    if (printType == 2) {     //打印发货单
                        var domElement = $('.deliveryTemplate');
                        $dpPrint.printDelivery(preview, $scope.obj, printCallback, params, NormalPackages, domElement);
                    }
                })
            }
        }

        //获取流水号
        function getSerial(NormalPackages) {
            var deferred = $q.defer(),
                promise = deferred.promise;
            $scope.loading = $restClient.post("seller/normalPackage/getSerial", null, NormalPackages, function (data) {
                console.log(data.data);
                NormalPackages = data.data;
                var params = {
                    userExpressTemplateId: $scope.obj.userExpressTemp.id,
                    normalPackageList: NormalPackages,
                    printType: printType
                };
                deferred.resolve(params);
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            });
            return promise;
        }

        //回调
        function printCallback(params) {
            $scope.messages = '数据提交中。。';
            $scope.loading = $restClient.post('seller/normalPackage/print', null, params, function (data) {
                console.log(data);
                var selectPackages = getSelectedPackages();
                if (data.data) {
                    //打印快递单
                    if (params.printType == 1) {


                        //显示普通面单打印结果
                        var modalInstance = openModal('printResult', {
                            data: data.data,
                            operateType: $scope.operateType
                        });
                        modalInstance.result.then(function (data) {
                            if (data) {
                                $scope.consign(1);
                            } else {

                                $scope.associateExpressNo(Packages[0], true); //联想单号
                            }
                        });


                        //回调修改包裹状态
                        angular.forEach(data.data.detailNormalPackageList, function (info) {
                            //打印成功的包裹
                            if (info.isSuccess) {
                                angular.forEach(selectPackages, function (Package) {
                                    if (Package.normalPackage.id == info.id) {
                                        Package.normalPackage.isNeedTipStatusChange = info.isNeedTipStatusChange;
                                        Package.normalPackage.isPrintExpress = info.isPrintExpress;
                                        Package.normalPackage.printExpressTime = info.printExpressTime;
                                        Package.normalPackage.printExpressNum = info.printExpressNum;
                                        Package.normalPackage.serial = info.serial;

                                        Package.normalPackage.userExpressId = $scope.obj.userExpressTemp.userExpressId;
                                        Package.normalPackage.userTemplateId = $scope.obj.userExpressTemp.id;
                                        Package.normalPackage.userTemplateName = $scope.obj.userExpressTemp.name;

                                    }
                                });
                            }
                            //order回调
                            angular.forEach(info.normalTradeList, function (returnNormalTrade) {
                                angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {


                                    angular.forEach(selectPackages, function (Package) {
                                        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                                if (normalOrder.oid == returnNormalOrder.oid) {

                                                    normalOrder.isPrintExpress = returnNormalOrder.isPrintExpress;
                                                    normalOrder.printExpressTime = returnNormalOrder.printExpressTime;
                                                    normalOrder.printExpressNum = returnNormalOrder.printExpressNum;

                                                }
                                            })


                                        })


                                    });

                                })
                            })

                        });

                    } else {
                        //回调修改包裹状态
                        angular.forEach(data.data.detailNormalPackageList, function (info) {
                            //打印发货单成功的包裹
                            if (info.isSuccess) {
                                angular.forEach(selectPackages, function (Package) {
                                    if (Package.normalPackage.id == info.id) {
                                        Package.normalPackage.isNeedTipStatusChange = info.isNeedTipStatusChange;
                                        Package.normalPackage.isPrintDeliveryBill = info.isPrintDeliveryBill;
                                        Package.normalPackage.printDeliveryBillTime = info.printDeliveryBillTime;
                                        Package.normalPackage.printDeliveryBillNum = info.printDeliveryBillNum;
                                        Package.normalPackage.serial = info.serial;
                                    }
                                });
                            }
                            //order回调
                            angular.forEach(info.normalTradeList, function (returnNormalTrade) {
                                angular.forEach(returnNormalTrade.normalOrderList, function (returnNormalOrder) {

                                    angular.forEach(selectPackages, function (Package) {
                                        angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {

                                            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                                                if (normalOrder.oid == returnNormalOrder.oid) {

                                                    normalOrder.isPrintDelivery = returnNormalOrder.isPrintDelivery;
                                                    normalOrder.printDeliveryTime = returnNormalOrder.printDeliveryTime;
                                                    normalOrder.printDeliveryNum = returnNormalOrder.printDeliveryNum;

                                                }
                                            })


                                        })


                                    });

                                })
                            })

                        });

                    }
                }
                $win.alert({
                    type: 'success',
                    content: '打印完成'
                })
            });

        }

        //验证码
        function authCode() {
            var deferred = $q.defer();

            var authModal = $modal.open({
                templateUrl: "views/pages/authModal.html",
                controller: "authModalCtrl"
            });
            authModal.result.then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
            }, function () {
                if (printType == 1) {
                    $scope.expressProcessing = false;
                }
                if (printType == 2) {
                    $scope.deliveryProcessing = false;
                }
            });
            return deferred.promise;
        }

    };
    //发货
    $scope.consign = function (consignType) {

        var Packages = getSelectedPackages();
        var filterPackages = filterUncheckedOrder(angular.copy(Packages));          //filter包裹里未选中的订单

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        if (consignType == 3) {         //虚拟发货
            var mes = {
                title: '确定用虚拟物流方式发货吗？',
                content: '您选择了' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，使用虚拟物流方式发货后，将不可对发货方式进行修改噢',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: true,
                showCancel: true
            };

            var remind = $win.confirm(mes);
            remind.result.then(function () {
                var isCod = false;   //是否存在货到付款订单
                angular.forEach(filterPackages, function (Package) {
                    isCod = isCod || Package.normalPackage.isCod;
                });

                (!isCod) ? postData(filterPackages) : $win.alert('存在货到付款订单，无法虚拟发货!');
            })
        } else {
            if (!confirm('您确定要发货吗？')) {
                return false;
            } else {
                checkExpressNo(filterPackages).then(postData);
            }
        }


        function checkExpressNo(consignPackages) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var validate = [];
            var invalidate = [];
            angular.forEach(consignPackages, function (Package) {
                var out_sid = Package.normalPackage.expressNo;
                var expressId = $scope.obj.userExpressTemp.expressId;
                if (is_valid_out_sid(expressId, out_sid)) {
                    validate.push(Package);
                } else {
                    invalidate.push(Package);
                }
            });
            if (invalidate.length > 0) {
                var mes = {
                    title: '所输运单号不满足此快递运单号规则，是否继续保存？',
                    content: '共勾选了' + '<span class="text-warning">【' + consignPackages.length + '】</span>' + '笔订单，其中有' + '<span class="text-warning">【' + invalidate.length + '】</span>' + '笔运单号不符合【' + '<span class="text-warning">' + $scope.obj.userExpressTemp.userExpressName + '</span>' + '】运单号规则',
                    img: "images/components/alert/alert-forbid.png",
                    closeText: "去修正",
                    size: "lg",
                    showClose: true,
                    showCancel: true
                };
                $win.confirm(mes);
            } else {
                deferred.resolve(consignPackages);
            }

            return promise;
        }

        function postData(consignPackages) {
            var normalPackageList = [];
            angular.forEach(clientToServer(consignPackages), function (Package) {
                normalPackageList.push(Package.normalPackage);
            });
            $scope.messages = '发货中。。';
            $scope.loading = $restClient.post('seller/normalPackage/consign', null, {
                consignType: consignType,
                normalPackageList: normalPackageList
            }, function (data) {
                console.log(data);

                if (data.data.errorList.length > 0) {
                    var modalInstance = $modal.open({
                        templateUrl: "views/pages/remindConsign.html",
                        controller: "remindConsignCtrl",
                        resolve: {
                            data: function () {
                                return angular.copy(data.data);
                            },
                            againConsign: function () {
                                return false;
                            }
                        }
                    });
                    modalInstance.result.then(function () {
                        var errorPackages = [];
                        angular.forEach(data.data.errorList, function (tid) {
                            var allPackages = angular.copy($scope.packages);
                            angular.forEach(allPackages, function (item) {
                                (item.normalPackage.tid == tid) && errorPackages.push(item);
                            });
                        });
                        //重新发货
                        checkExpressNo(errorPackages).then(postData);
                    });
                } else {
                    var mes = {
                        title: '恭喜您，发货成功！',
                        content: '您已成功发货' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，建议开启发货通知可以提升客户体验！',
                        img: "images/components/alert/alert-forbid.png",
                        size: "lg",
                        redirect: "//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliverGoodsInform",
                        showClose: true,
                        closeText: "发货通知",
                        cancelText: "关闭",
                        showCancel: true
                    };

                    var remind = $win.confirm(mes);

                }
                if (data.data.successList.length > 0) {
                    getOrder($scope.pageNo, $scope.pageSize);
                }


            });
        }


    };
    //手工同步数据
    $scope.syncData = function () {
        $scope.messages = '订单同步中。。';
        $scope.loading = $restClient.get('seller/normalPackage/syncData', null, function (data) {
            console.log(data);
            data.data && init();
        });
    };
    //生成备货单
    $scope.preparingBillForm = function () {
        var Packages = getSelectedPackages();

        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }
        Packages = filterUncheckedOrder(angular.copy(Packages));

        var tids = [];

        angular.forEach(Packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
                tids.push(normalTrade.tid);
            });
        });
        tids = tids.join(",");
        $location.url('/print/preparingBillForm?tids=' + tids);
    };
    //发货后修改物流公司
    $scope.cancelResend = function () {
        var Packages = filterUncheckedOrder(angular.copy(getSelectedPackages()));
        Packages = clientToServer(Packages);
        if (Packages.length == 0) {
            $win.alert('请至少选择一笔订单');
            return false;
        }

        var normalPackageList = $(Packages).map(function () {
            return this.normalPackage;
        }).get();
        $scope.messages = '数据提交中。。';
        $restClient.post("seller/normalPackage/cancelResend", {userExpressTemplateId: $scope.obj.userExpressTemp.id}, normalPackageList, function (data) {
            console.log(data);
            if (data.data.errorList.length > 0) {
                var modalInstance = $modal.open({
                    templateUrl: "views/pages/remindConsign.html",
                    controller: "remindConsignCtrl",
                    resolve: {
                        data: function () {
                            return angular.copy(data.data);
                        },
                        againConsign: function () {
                            return true;
                        }
                    }
                });

            } else {
                /*var mes = {
                 title: '恭喜您，发货成功！',
                 content: '您已成功发货' + '<span class="text-warning">【' + Packages.length + '】</span>' + '笔订单，建议开启发货通知可以提升客户体验！',
                 img: "images/components/alert/alert-forbid.png",
                 size: "lg",
                 redirect: "http://yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliverGoodsInform",
                 showClose: true,
                 closeText: "发货通知",
                 cancelText: "关闭",
                 showCancel: true
                 };

                 var remind = $win.confirm(mes);*/
                $win.alert({
                    type: 'success',
                    content: '重新发货成功'
                })

            }
            if (data.data.successList.length > 0) {
                getOrder($scope.pageNo, $scope.pageSize);
            }


        })
    };
    //移除订单
    $scope.removePackage = function (Package) {
        $restClient.postFormData("seller/normalPackage/removeTrade", {packageId: Package.normalPackage.id}, function (data) {
            $win.alert({
                type: 'success',
                content: '移除成功'
            })
            getOrder();
        })

    }
}
]);
//modalCtrl
app.controller("queryAreaCtrl", ["$scope", "selectItems", "$modalInstance", "$common", "$win", "$restClient", "isSave", function ($scope, selectItems, $modalInstance, $common, $win, $restClient, isSave) {
    $scope.allSelect = false;
    $scope.noneSelect = false;
    $scope.remoteArea = false;//是否偏远地区
    $scope.areas = [
        {
            "name": "华东",
            "select": false,
            "key": "01",
            "province": [
                {
                    "name": "上海",
                    "select": false,
                    "key": "010",
                    "parent": 0
                },
                {
                    "name": "浙江省",
                    "select": false,
                    "key": "011",
                    "parent": 0
                },
                {
                    "name": "江苏省",
                    "select": false,
                    "key": "012",
                    "parent": 0
                },
                {
                    "name": "安徽省",
                    "select": false,
                    "key": "013",
                    "parent": 0
                },
                {
                    "name": "江西省",
                    "select": false,
                    "key": "014",
                    "parent": 0
                }
            ]
        },
        {
            "name": "华北",
            "select": false,
            "key": "02",
            "province": [
                {
                    "name": "北京",
                    "select": false,
                    "key": "020",
                    "parent": 1
                },
                {
                    "name": "天津",
                    "select": false,
                    "key": "021",
                    "parent": 1
                },
                {
                    "name": "河北省",
                    "select": false,
                    "key": "022",
                    "parent": 1
                },
                {
                    "name": "山西省",
                    "select": false,
                    "key": "023",
                    "parent": 1
                },
                {
                    "name": "山东省",
                    "select": false,
                    "key": "024",
                    "parent": 1
                },
                {
                    "name": "内蒙古",
                    "select": false,
                    "key": "025",
                    "parent": 1
                }
            ]
        },
        {
            "name": "华中",
            "select": false,
            "key": "03",
            "province": [
                {
                    "name": "湖北省",
                    "select": false,
                    "key": "030",
                    "parent": 2
                },
                {
                    "name": "湖南省",
                    "select": false,
                    "key": "031",
                    "parent": 2
                },
                {
                    "name": "河南省",
                    "select": false,
                    "key": "032",
                    "parent": 2
                }
            ]
        },
        {
            "name": "华南",
            "select": false,
            "key": "04",
            "province": [
                {
                    "name": "广东省",
                    "select": false,
                    "key": "040",
                    "parent": 3
                },
                {
                    "name": "广西",
                    "select": false,
                    "key": "041",
                    "parent": 3
                },
                {
                    "name": "海南省",
                    "select": false,
                    "key": "042",
                    "parent": 3
                },
                {
                    "name": "福建省",
                    "select": false,
                    "key": "043",
                    "parent": 3
                }
            ]
        },
        {
            "name": "东北",
            "select": false,
            "key": "05",
            "province": [
                {
                    "name": "吉林省",
                    "select": false,
                    "key": "050",
                    "parent": 4
                },
                {
                    "name": "辽宁省",
                    "select": false,
                    "key": "051",
                    "parent": 4
                },
                {
                    "name": "黑龙江",
                    "select": false,
                    "key": "052",
                    "parent": 4
                }
            ]
        },
        {
            "name": "西北",
            "select": false,
            "key": "06",
            "province": [
                {
                    "name": "陕西省",
                    "select": false,
                    "key": "060",
                    "parent": 5
                },
                {
                    "name": "新疆",
                    "select": false,
                    "key": "061",
                    "parent": 5
                },
                {
                    "name": "青海省",
                    "select": false,
                    "key": "062",
                    "parent": 5
                },
                {
                    "name": "宁夏",
                    "select": false,
                    "key": "063",
                    "parent": 5
                },
                {
                    "name": "甘肃省",
                    "select": false,
                    "key": "064",
                    "parent": 5
                }
            ]
        },
        {
            "name": "西南",
            "select": false,
            "key": "07",
            "province": [
                {
                    "name": "四川省",
                    "select": false,
                    "key": "070",
                    "parent": 6
                },
                {
                    "name": "云南省",
                    "select": false,
                    "key": "071",
                    "parent": 6
                },
                {
                    "name": "贵州省",
                    "select": false,
                    "key": "072",
                    "parent": 6
                },
                {
                    "name": "西藏",
                    "select": false,
                    "key": "073",
                    "parent": 6
                },
                {
                    "name": "重庆",
                    "select": false,
                    "key": "074",
                    "parent": 6
                }
            ]
        },
        {
            "name": "港澳台",
            "select": false,
            "key": "08",
            "province": [
                {
                    "name": "香港",
                    "select": false,
                    "key": "080",
                    "parent": 7
                },
                {
                    "name": "澳门",
                    "select": false,
                    "key": "081",
                    "parent": 7
                },
                {
                    "name": "台湾",
                    "select": false,
                    "key": "082",
                    "parent": 7
                }
            ]
        },
        {
            "name": "海外",
            "select": false,
            "key": "09",
            "province": [
                {
                    "name": "海外",
                    "select": false,
                    "key": "090",
                    "parent": 8
                }
            ]
        }
    ];
    $scope.selectItems = selectItems;
    console.log(selectItems);

    //删除
    $scope.removeSelect = function (item) {
        var index = $scope.selectItems.indexOf(item);
        $scope.selectItems.splice(index, 1);
        $restClient.deletes('seller/customQueryArea/delete', {id: item.id}, function (data) {
            console.log(data);
            data.data && $win.alert({
                type: "success",
                content: '删除成功'
            });
            //data.data && $scope.selectItems.push(data.data);
            /*$modalInstance.close();*/
        });
    };
    //全选
    $scope.selectAll = function (event) {
        if ($scope.allSelect) {
            event.preventDefault();
            return;
        }
        selectAll();
    };

    //全不选
    $scope.selectNone = function (event) {
        if ($scope.noneSelect) {
            event.preventDefault();
            return;
        }
        selectNone();
        $scope.remoteArea = false;
    };

    //排除偏远
    $scope.selectFaraway = function () {
        if (!$scope.remoteArea) {//排除
            $scope.remoteArea = true;
            $scope.allSelect = false;
            $scope.noneSelect = false;
            selectAll();
            $scope.areas[5].select = false;
            $scope.areas[5].province[1].select = false;
            $scope.areas[5].province[2].select = false;
            $scope.areas[6].select = false;
            $scope.areas[6].province[1].select = false;
            $scope.areas[6].province[3].select = false;
        } else {//恢复
            $scope.remoteArea = false;
            selectAll();
        }
    };

    //选择区域
    $scope.selectRegion = function (region, status) {
        var choice = !status;
        region.select = choice;
        for (var i = 0; i < region.province.length; i++) {
            region.province[i].select = choice;
        }

        if (choice) {
            $scope.allSelect = isAllOrNoneSelect("all");
            $scope.noneSelect = false;
        } else {
            $scope.allSelect = false;
            $scope.noneSelect = isAllOrNoneSelect("none");
        }
    };

    //选择省份
    $scope.selectState = function (state, status) {
        var choice = !status;
        var region = $scope.areas[state.parent];
        state.select = choice;

        region.select = isRegionSelect(region);
        if (choice) {
            $scope.allSelect = isAllOrNoneSelect("all");
            $scope.noneSelect = false;
        } else {
            $scope.allSelect = false;
            $scope.noneSelect = isAllOrNoneSelect("none");
        }
    };

    $scope.save = function (event) {
        var result = getSelect();
        if (result == "") {
            $win.alert('请至少选择一个地区');
            return;
        }
        selectNone();
        if (isSave) {
            $restClient.postFormData('seller/customQueryArea/save', {areaNames: result}, function (data) {
                console.log(data);
                data.data && $scope.selectItems.push(data.data);
                /*$modalInstance.close();*/
            });
        } else {
            $scope.selectItems.push({areaNames: result});
        }
    };

    $scope.cancel = function (event) {
        $modalInstance.dismiss();
    };

    //是否全选或者全不选 type true时为判断全选否则判断全部选
    function isAllOrNoneSelect(type) {
        var result = true;
        type = (type == "all");
        //全选
        if (type) {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                if (!region.select) {
                    result = false;
                }
                for (var j = 0; j < region.province.length; j++) {
                    var state = region.province[j];
                    if (!state.select) {
                        result = false;
                    }
                }
            }
        } else {
            for (var i = 0; i < $scope.areas.length; i++) {
                var region = $scope.areas[i];
                if (region.select) {
                    result = false;
                }
                for (var j = 0; j < region.province.length; j++) {
                    var state = region.province[j];
                    if (state.select) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }

    function selectAll() {
        for (var i = 0; i < $scope.areas.length; i++) {
            var region = $scope.areas[i];
            region.select = true;
            for (var j = 0; j < region.province.length; j++) {
                region.province[j].select = true;
            }
        }
        $scope.allSelect = true;
        $scope.noneSelect = false;
    }

    function selectNone() {
        for (var i = 0; i < $scope.areas.length; i++) {
            var region = $scope.areas[i];
            region.select = false;
            for (var j = 0; j < region.province.length; j++) {
                region.province[j].select = false;
            }
        }
        $scope.noneSelect = true;
        $scope.allSelect = false;
    }

    function isRegionSelect(region) {
        var province = region.province;
        var result = true;
        for (var i = 0; i < province.length; i++) {
            result = result && province[i].select;
        }
        return result;
    }

    function getSelect() {
        var result = [];
        angular.forEach($scope.areas, function (region) {
            angular.forEach(region.province, function (state) {
                if (state.select) {
                    result.push(state.name);
                }
            })
        });

        return result.toString();
    }
}]);

app.controller('updateSkuCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.normalOrder = data.normalOrder;
    $scope.itemSkuFilter = data.baseSetting.itemSkuFilter;
    $scope.isSku = 1;


    $scope.sku = $scope.normalOrder.skuChangeName ? angular.copy($scope.normalOrder.skuChangeName) : angular.copy($scope.normalOrder.skuPropertiesName);
    //切割sku属性
    $scope.skuPropertiesName = [];
    angular.forEach($scope.sku.split(";"), function (properties) {
        var skuProperties = {};
        skuProperties.key = properties.split(":")[0];
        skuProperties.value = properties.split(":")[1];
        $scope.skuPropertiesName.push(skuProperties);
    });


    console.log(data);
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        var params;
        var emptyValue;
        if ($scope.isSku) {
            params = {
                oid: $scope.normalOrder.oid,
                skuChangeName: ''
            };
            for (var i = 0; i < $scope.skuPropertiesName.length; i++) {
                if ($scope.skuPropertiesName[i].value == "") {
                    emptyValue = true;
                    return false;
                } else {
                    params.skuChangeName = params.skuChangeName + $scope.skuPropertiesName[i].key + ":"
                        + $scope.skuPropertiesName[i].value + ";";
                }
            }
            if (emptyValue) {
                return false;
            }
            params.skuChangeName = params.skuChangeName.substring(0, params.skuChangeName.length - 1);
            $restClient.post('seller/normalPackage/updateSku', null, params, function (data) {
                console.log(data);
                data.data &&
                $modalInstance.close(params.skuChangeName);
            });
        } else {
            params = {
                itemSkuFilter: $scope.itemSkuFilter.replace(/\n/g, ",").replace(/\s/g, "")
            };
            data.baseSetting.itemSkuFilter = $scope.itemSkuFilter;
            $modalInstance.close(params);

        }

    }
}]);

app.controller('updateItemTitleCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    //修改宝贝简称表单
    function updateItemForm(normalOrder) {
        var params = {
            oid: normalOrder.oid,
            itemId: normalOrder.numIid
        };
        $restClient.postFormData('seller/normalPackage/updateItemForm', params, function (data) {
            console.log(data);
            $scope.itemTitleSort = data.data.itemTitleSort;
        });
    }

    updateItemForm(data);

    // $scope.abbrevName = angular.copy(data.abbrevName);
    $scope.normalOrder = angular.copy(data);
    $scope.isSyncItem = 0;
    $scope.isAllUpdate = 0;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close({
            normalOrder: {
                abbrevName: $scope.normalOrder.abbrevName,
                oid: $scope.normalOrder.oid
            },
            isSyncItem: $scope.isSyncItem,
            isAllUpdate: $scope.isAllUpdate
        });
    }
}]);

app.controller('updatePrintStateCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.isPrintExpress = null;
    $scope.isPrintDeliveryBill = null;
    $scope.data = data;
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close({
            packageIds: data.id,
            isPrintExpress: $scope.isPrintExpress,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill
        });
    }
}]);
app.controller('updateReceiverAddressCtrl', ['$scope', '$modalInstance', 'data', '$q', '$restClient', function ($scope, $modalInstance, data, $q, $restClient) {
    function init() {
        angular.forEach(data.normalPackage.normalTradeList, function (normalTrade) {
            angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                delete normalOrder.checked;
                delete normalOrder.normal;
                delete normalOrder.disabled;
            });
        });
        $scope.package = data;
        $scope.normalPackage = angular.copy(data.normalPackage);
        $scope.normalPackageCopy = angular.copy(data.normalPackage);
        getReceiverAddressForm();
        getProvince().then(watchProvince);
    }

    function getReceiverAddressForm() {
        $restClient.postFormData('seller/normalPackage/updateReceiverAddressForm', {packageId: data.normalPackage.id}, function (data) {
            console.log(data);
            $scope.receiverAddressList = data.data;
        });
    }

    init();

    function watchProvince() {
        $scope.$watch('normalPackage.receiverState', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.province, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity() {
        $scope.$watch('normalPackage.receiverCity', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.city, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCountry(item.code);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince() {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: 1}, function (data) {
            //console.log(data);
            $scope.province = data.data;
            deferred.resolve();
        });
        return promise;
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

    function getCountry(code) {
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            $scope.country = data.data;
            var hasCounty = false;
            angular.forEach($scope.country, function (item) {
                if (item.name == $scope.normalPackage.receiverDistrict) {
                    hasCounty = true;
                }
            });
            //如果区地址不存在则重置为空
            !hasCounty && ($scope.normalPackage.receiverDistrict = "");
        });
    }

    $scope.selectAddress = function (receiverAddress) {
        $scope.normalPackage.receiverName = receiverAddress.receiverName;
        $scope.normalPackage.receiverMobile = receiverAddress.receiverMobile;
        $scope.normalPackage.receiverState = receiverAddress.receiverState;
        $scope.normalPackage.receiverCity = receiverAddress.receiverCity;
        $scope.normalPackage.receiverDistrict = receiverAddress.receiverDistrict;
        $scope.normalPackage.receiverAddress = receiverAddress.receiverAddress;
        $scope.normalPackage.receiverZip = receiverAddress.receiverZip;

    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close($scope.normalPackage);
    }
}]);
app.controller('updateCustomStarCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.customStarList = data;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        var emptyValue;
        angular.forEach($scope.customStarList, function (customStar) {
            if (customStar.name == '') {
                emptyValue = true;
                return false;
            }
        });
        if (emptyValue) {
            return false;
        }

        $modalInstance.close($scope.customStarList);
    }
}]);

app.controller('updateSellerMemoCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    if (typeof data == 'object') {         //单个修改备注
        $scope.batch = false;
        $scope.sellerFlag = data.sellerFlag;
        $scope.sellerMemo = data.sellerMemo;
        $scope.save = function () {
            $modalInstance.close({
                tid: data.tid,
                sellerFlag: $scope.sellerFlag,
                sellerMemo: $scope.sellerMemo
            });
        }
    }
    if (typeof data == 'string') {         //批量修改备注
        $scope.sellerFlag = "";
        $scope.batch = true;
        $scope.updateType = 1;
        $scope.save = function () {
            var modifiedData = {
                tids: data,
                updateType: $scope.updateType,
                sellerMemo: $scope.sellerMemo
            };
            //选择了旗帜，不选不改
            if ($scope.sellerFlag) {
                modifiedData.sellerFlag = $scope.sellerFlag;
            }
            $modalInstance.close(modifiedData);
        }
    }
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('updateSysMemoCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    if (typeof data == 'object') {         //单个修改备注
        $scope.sysMemos = data.sysMemo;
        $scope.save = function () {
            $modalInstance.close({
                tids: data.tid.toString(),
                sysMemo: $scope.sysMemos
            });
        }
    }
    if (typeof data == 'string') {         //批量修改备注
        $scope.save = function () {
            $modalInstance.close({
                tids: data,
                sysMemo: $scope.sysMemos
            });
        }
    }


    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('choosePackageCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.packages = data;
    $scope.allChecked = true;
    //选中的包裹
    function getSelectedPackages() {
        var packages = [];
        angular.forEach($scope.packages, function (item) {
            item.checked && packages.push(item);
        });
        return packages;
    }

    //选择全部
    $scope.checkAll = function () {
        angular.forEach($scope.packages, function (item) {
            item.checked = !$scope.allChecked;
        });
    };
    //选择包裹
    $scope.selectPackage = function (packages) {
        var choose = packages.checked;
        packages.checked = !choose;
        var allChecked = true;
        angular.forEach($scope.packages, function (item) {
            allChecked = allChecked && item.checked;
        });
        $scope.allChecked = allChecked;
    };
    //保存
    $scope.save = function () {
        var packages = getSelectedPackages();
        if (packages.length < 2) {
            $win.alert('请选择2笔以上订单');
        } else {
            $modalInstance.close(packages);
        }
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('chooseAddressCtrl', ['$scope', '$modalInstance', 'data', '$dpAddress', function ($scope, $modalInstance, data, $dpAddress) {

    init();

    function init() {
        $scope.packages = data;
        $scope.mainPackage = data[0];   //主包裹
        $scope.customAdd = false;       //自定义地址

        $scope.isPrintDeliveryBill = 0;     //是否已发货
        $scope.isPrintExpress = 0;          //是否已打印
        $scope.existDelivered = false;      //是否有已发货订单
        $scope.receiverState = null;
        $scope.receiverCity = null;
        $scope.receiverTown = null;
        $scope.provinceList = [];
        $scope.cityList = [];
        $scope.countryList = [];

        checkDelivered();
    }

    //自定义地址
    $scope.customAddress = function () {
        $scope.customAdd = !$scope.customAdd;
        if ($scope.customAdd && $scope.provinceList.length == 0) {
            $dpAddress.getSelectAddress($scope);
        }
    };
    /*normalOrder.consignStatus==2||(normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' ||
     normalOrder.status == 'TRADE_BUYER_SIGNED' ||
     normalOrder.status == 'TRADE_FINISHED')*/
    //检查是否存在已发货订单
    function checkDelivered() {
        angular.forEach($scope.packages, function (Package) {
            angular.forEach(Package.normalPackage.normalTradeList, function (normalTrade) {
                angular.forEach(normalTrade.normalOrderList, function (normalOrder) {
                    if (normalOrder.consignStatus == 2 || (normalOrder.status == 'WAIT_BUYER_CONFIRM_GOODS' ||
                        normalOrder.status == 'TRADE_BUYER_SIGNED' ||
                        normalOrder.status == 'TRADE_FINISHED')) {
                        //部分发货
                        Package.partDelivered = true;
                    }
                })
            })
        });

        angular.forEach($scope.packages, function (Package) {
            $scope.existDelivered = $scope.existDelivered || Package.partDelivered;
        });
    }


    //保存
    $scope.save = function () {
        var mergeTids = $(data).map(function () {
            return this.normalPackage.tid;
        }).get().join();

        var needMergePackageIds = $(data).map(function () {
            return this.normalPackage.id;
        }).get();

        var masterNormalPackage = {
            id: $scope.mainPackage.normalPackage.id
        };
        if ($scope.customAdd) {                           //自定义地址
            masterNormalPackage.receiverName = $scope.receiverName;
            masterNormalPackage.receiverMobile = $scope.receiverMobile;
            masterNormalPackage.receiverState = $scope.receiverState;
            masterNormalPackage.receiverCity = $scope.receiverCity;
            masterNormalPackage.receiverDistrict = $scope.receiverDistrict;
            masterNormalPackage.receiverTown = $scope.receiverTown;
            masterNormalPackage.receiverAddress = $scope.receiverAddress;
        } else {                                          //使用主包裹地址
            masterNormalPackage.receiverName = $scope.mainPackage.normalPackage.receiverName;
            masterNormalPackage.receiverMobile = $scope.mainPackage.normalPackage.receiverMobile;
            masterNormalPackage.receiverState = $scope.mainPackage.normalPackage.receiverState;
            masterNormalPackage.receiverCity = $scope.mainPackage.normalPackage.receiverCity;
            masterNormalPackage.receiverDistrict = $scope.mainPackage.normalPackage.receiverDistrict;
            masterNormalPackage.receiverTown = $scope.mainPackage.normalPackage.receiverTown;
            masterNormalPackage.receiverAddress = $scope.mainPackage.normalPackage.receiverAddress;
        }
        var index = needMergePackageIds.indexOf($scope.mainPackage.normalPackage.id);
        needMergePackageIds.splice(index, 1);

        $modalInstance.close({
            mergeTids: mergeTids,
            masterNormalPackage: masterNormalPackage,
            needMergePackageIds: needMergePackageIds.join(','),
            isPrintExpress: $scope.isPrintExpress ? 2 : 0,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill ? 2 : 0
        });
    };
    //上一步
    $scope.back = function () {
        $modalInstance.close({
            back: true
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('chooseTradeCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.package = data;
    $scope.selectTrade = data.normalPackage.normalTradeList[0].tid;

    //保存
    $scope.save = function () {
        var needSplitTid = $scope.selectTrade;      //需拆的订单Tid

        var masterTids = $(data.normalPackage.normalTradeList).map(function () {
            return this.tid;
        }).get();

        var index = masterTids.indexOf(needSplitTid);
        masterTids.splice(index, 1);                //不需要拆的Tids


        $modalInstance.close({
            Package: data,
            needSplitTid: needSplitTid,
            masterTids: masterTids.join(',')
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('chooseStatusCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    $scope.package = data.Package;
    $scope.isPrintDeliveryBill = 0;     //是否已发货
    $scope.isPrintExpress = 0;          //是否已打印

    angular.forEach($scope.package.normalPackage.normalTradeList, function (normalTrade) {
        if (normalTrade.tid == data.needSplitTid) {
            $scope.trade = normalTrade;
        }
    });
    //保存
    $scope.save = function () {

        $modalInstance.close({
            packageId: data.Package.normalPackage.id,
            needSplitTid: data.needSplitTid,
            masterTids: data.masterTids,
            isPrintExpress: $scope.isPrintExpress ? 2 : 0,
            isPrintDeliveryBill: $scope.isPrintDeliveryBill ? 2 : 0
        });
    };
    //上一步
    $scope.back = function () {
        $modalInstance.close({
            back: true
        });
    };
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('showLogCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    $scope.getLogs = function (logType) {
        $scope.loading = $restClient.postFormData('seller/normalPackage/showLog', {
            tids: data.normalPackage.mergedTids,
            logType: logType
        }, function (data) {
            console.log(data);
            $scope.logs = data.data;
        });
    };
    console.log(data);
    $scope.getLogs(1);
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('authModalCtrl', ['$scope', '$modalInstance', '$restClient', function ($scope, $modalInstance, $restClient) {
    $scope.inputCode = '';
    $scope.authCode = Math.ceil(Math.random() * 10000);
    while ($scope.authCode < 1000) {
        $scope.authCode = Math.ceil(Math.random() * 10000);
    }

    //console.log(data);
    $scope.validCode = function () {           //验证
        return $scope.inputCode == $scope.authCode;
    };

    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close(true);
    }
}]);

app.controller('choosePrinterCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {

    function getPrinter() {
        var iPrinterCount = LODOP.GET_PRINTER_COUNT();
        $scope.printerList = [];
        for (var i = 0; i < iPrinterCount; i++) {
            $scope.printerList.push(LODOP.GET_PRINTER_NAME(i));
        }
        if ($scope.printType != 3) {
            if ($scope.printerList.indexOf($scope.lockPrintName) > -1) {
                $scope.printer = $scope.lockPrintName;

            } else {
                //锁定的打印机不匹配
                $scope.unmatch = true;
            }
        }
    }

    $scope.dealing = false;
    //打印类型: 1-打印快递单 2-打印发货单 3-备货单
    $scope.printType = data.type;

    //是否预览
    $scope.preview = data.preview;

    //是否存在快递模板
    if ($scope.printType != 3 && data.template) {
        //之前已锁定的打印机
        if (data.template.printerKey != "") {
            $scope.lockPrintName = data.template.printerKey;
        }

        //模板名称
        $scope.templateName = data.template.name;
        //锁定的打印机是否不存在且匹配
        $scope.unmatch = false;
        //是否锁定当前打印机
        $scope.lockPrint = false;
    }
    getPrinter();

    //$scope.printerList.indexOf()
    //退出
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        //虚拟打印机提示
        if ($scope.printer.toLowerCase().indexOf('xps') != -1 || $scope.printer.toLowerCase().indexOf('pdf') != -1) {
            if (!confirm('您选择的是虚拟打印机，是否继续打印！')) {
                return;
            }
        }
        if ($scope.printer.toLowerCase().indexOf('fax') != -1) {
            if (!confirm('您选择的不是打印机，是否继续打印！')) {
                return;
            }
        }
        $scope.dealing = true;
        //锁定打印机
        if ($scope.lockPrint) {
            //锁定发货单模板打印机
            if ($scope.printType == 2) {
                data.template.printerKey = $scope.printer;
                $restClient.post('seller/userDeliveryTemplate/printerLock', null, data.template, function (data) {
                    if (data.data) {

                    }
                });

            }
            //锁定快递单模板打印机
            if ($scope.printType == 1) {
                data.template.printerKey = $scope.printer;
                $restClient.post('seller/userExpressTemplate/updateSelective', null, data.template, function (data) {
                    if (data.data) {

                    }
                });
            }
        }

        $modalInstance.close($scope.printer);
    }
}]);

app.controller('remindExpressNoCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
    var packages = data.packages;

    var length = $scope.length = packages.length;
    //是否是打印后的联想
    $scope.isConsign = data.isConsign;
    $scope.expressName = data.userExpressName;
    $scope.one = false;
    $scope.firstSid = data.sidStart;

    if (length > 1) {
        $scope.lastSid = data.lastSid;
    } else {
        $scope.one = true;

    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.save = function () {
        $modalInstance.close();
    }

}]);

app.controller('reachCoverCtrl', ['$scope', '$modalInstance', 'data', 'normalPackage', '$modal', function ($scope, $modalInstance, data, normalPackage, $modal) {
    $scope.data = data;
    $scope.package = normalPackage;

    $scope.editCorrectScope = function () {
        $modalInstance.close();

    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('editCorrectScopeCtrl', ['$scope', '$modalInstance', 'Package', '$win', '$restClient', 'correctionRange', function ($scope, $modalInstance, Package, $win, $restClient, correctionRange) {

    $scope.edit = true;
    var params = correctionRange;
    console.log(correctionRange);
    console.log(Package);
    $scope.express = {};
    $scope.data = {};
    $scope.express.name = correctionRange.expressName;
    $scope.isReach = Package.normalPackage.isReach;
    $scope.data.province = Package.normalPackage.receiverState;
    $scope.data.city = Package.normalPackage.receiverCity;
    $scope.data.district = Package.normalPackage.receiverDistrict;

    $scope.save = function () {
        params.isReach = $scope.isReach;

        $modalInstance.close(params);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('printResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.operateType = data.operateType;
    $scope.data = data.data;
    $scope.totalNum = data.data.detailNormalPackageList.length;
    $scope.successNum = data.data.successList.length;
    $scope.errorNum = data.data.errorList.length;

    $scope.allExistExpressNo = true;
    angular.forEach(data.data.detailNormalPackageList, function (detailNormalPackage) {
        //是否都存在运单号
        if (!detailNormalPackage.expressNo) {
            $scope.allExistExpressNo = false;
        }
    });
    $scope.save = function () {
        $modalInstance.close($scope.allExistExpressNo);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindConsignCtrl', ['$scope', '$modalInstance', 'data', 'againConsign', '$win', function ($scope, $modalInstance, data, againConsign, $win) {

    $scope.data = data;
    $scope.againConsign = againConsign;
    $scope.totalNum = data.detailNormalTradeList.length;
    $scope.successNum = data.successList.length;
    $scope.errorNum = data.errorList.length;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('setSortCtrl', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

    $scope.data = data;

    $scope.save = function () {
        $modalInstance.close($scope.data);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('errorListCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.errorList = data;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('recycleRemindCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.recycleWaybillPackage = data;
    $scope.recycle = true;
    $scope.save = function () {
        $modalInstance.close($scope.recycle);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindFilterCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.filter = true;
    $scope.save = function () {
        $modalInstance.close($scope.filter);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('waybillPrintCtrl', ['$scope', '$modalInstance', 'data', '$win', '$restClient', function ($scope, $modalInstance, data, $win, $restClient) {
    //所有打印机
    $scope.printers = data.printerInfo.printers;

    //已锁定的打印机
    $scope.defaultPrint = data.templateData.printerKey;
    //模板名称
    $scope.templateName = data.templateData.name;


    if ($scope.defaultPrint != '') {
        angular.forEach($scope.printers, function (printerInfo) {
            //锁定的打印机匹配
            if (printerInfo.name == $scope.defaultPrint) {
                $scope.unmatch = false;
                //已锁定的打印机
                $scope.printer = $scope.defaultPrint;
            }
        });
    } else {
        //锁定的打印机是否存在不匹配
        $scope.unmatch = true;
        $scope.printer = "";
    }

    $scope.save = function () {

        //虚拟打印机提示
        if ($scope.printer.toLowerCase().indexOf('xps') != -1 || $scope.printer.toLowerCase().indexOf('pdf') != -1) {
            if (!confirm('您选择的是虚拟打印机，是否继续打印！')) {
                return;
            }
        }
        if ($scope.printer.toLowerCase().indexOf('fax') != -1) {
            if (!confirm('您选择的不是打印机，是否继续打印！')) {
                return;
            }
        }
        //锁定打印机
        if ($scope.lockPrint) {

            //锁定快递单模板打印机

            data.templateData.printerKey = $scope.printer;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, data.templateData, function (data) {
                if (data.data) {

                }
            });

        }

        $modalInstance.close($scope.printer);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('waybillResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.successNum = data.successNum;
    $scope.failedNum = data.failedNum;
    $scope.printStatus = data.printStatus;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('recycleResultCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.errorRecycleList = data.errorRecycleList;
    $scope.successRecycleList = data.successRecycleList;
    $scope.totalNum = $scope.errorRecycleList.length + $scope.successRecycleList.length;

    $scope.save = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('chooseWaybillCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.usedWaybillList = data;

    $scope.save = function () {
        $modalInstance.close($scope.selectWaybill);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('remindExceptionCtrl', ['$scope', '$modalInstance', 'data', '$win', function ($scope, $modalInstance, data, $win) {
    $scope.closeTip = false;
    $scope.content = data[0].content;

    $scope.save = function () {
        // 0 不提示，1提示
        var closeTip = $scope.closeTip ? 0 : 1;
        $modalInstance.close(closeTip);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);
app.controller('printMultiWaybillCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.time = 1;

    $scope.save = function (preview) {

        $modalInstance.close({
            preview: preview,
            time: $scope.time
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);






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

/**
 * Created by Jin on 2016/7/26.
 */
app.controller('userExpressCtrl', ['$scope', '$modal', '$restClient', '$win', '$q', '$compile', '$location', '$state', '$modifyTemplate', '$dpPrint', function ($scope, $modal, $restClient, $win, $q, $compile, $location, $state, $modifyTemplate, $dpPrint) {

    init();

    function init() {
        getData();
        $dpPrint.initCaiNiao();
    }

    function getData() {
        $scope.loading = $restClient.get('seller/userExpressTemplate/list', null, function (data) {
            $scope.userExpressTemplateList = data.data;
            console.log(data);
        });
    }
    //热敏设置
    $scope.setWaybill = function(userExpressTemplate){
        $modifyTemplate.setWaybill(userExpressTemplate);
    };
    //更新菜鸟云模板
    $scope.updateCloudTemplate = function(){
        $modifyTemplate.updateCloudTemplate(getData);

    };

    //添加云打印模板
    $scope.addCloudTemplate = function(){
        $modifyTemplate.addCloudTemplate(getData);
    };
    //删除云打印模板
    $scope.deleteCloudTemplate = function(){
        $modifyTemplate.deleteCloudTemplate(getData);
    };
    //编辑菜鸟云模板
    $scope.editCloud = function(){
        $modifyTemplate.editCloud(getData);
    };

    //编辑快递模板

    $scope.edit = function (userExpressTemplate) {
        $modifyTemplate.edit(userExpressTemplate);
    };

    //删除快递模板

    $scope.deleteTemp = function (userExpressTemplate) {
        $modifyTemplate.deleteTemp(userExpressTemplate, getData);
    };

    //添加快递模板
    $scope.addExpressTemplate = function () {
        $modifyTemplate.addExpressTemplate(getData);
    };
    //设为默认模板
    $scope.default = function (userExpressTemplate) {
        $restClient.postFormData('seller/userExpressTemplate/default', {id: userExpressTemplate.id}, function (data) {
            getData();
        });
    };

    //锁定打印机
    $scope.printerLock = function (userExpressTemplate) {
        var printerList = [];
        if(userExpressTemplate.category == 1){
            //普通面单
            if(!$dpPrint.isCLodopInstalled()){
                return false;
            }
            var iPrinterCount = LODOP.GET_PRINTER_COUNT();
            for (var i = 0; i < iPrinterCount; i++) {
                printerList.push(LODOP.GET_PRINTER_NAME(i));
            }
        }else{
            //电子面单
            if($dpPrint.printerInfo){
                printerList = $dpPrint.printerInfo.printers;
            }else{
                var mes = {
                    windowTitle: '系统提示',
                    title: '请下载并安装菜鸟云打印组件，否则会导致电子面单无法打印',
                    content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                    '打印控件并进行安装。安装后请启动运行控件。下载或安装遇到问题请' +
                    '联系我们在线客服！' +
                    '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                    '<br><a class="text-warning" href="http://cdn-cloudprint.cainiao.com/waybill-print/client/CNPrintSetup.exe" target="_self">下载控件</a>',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: false,
                    showCancel: false
                };
                $win.confirm(mes);
            }

        }
        if(printerList.length>0){
            var modalInstance = $modal.open({
                templateUrl: "views/pages/userExpressTemplatePrinterLock.html",
                controller: "userExpressTemplatePrinterLockCtrl",
                resolve: {
                    data: function () {
                        return {
                            userExpressTemplate :angular.copy(userExpressTemplate),
                            printerList:printerList
                        };
                    }
                }
            });
            modalInstance.result.then(function () {
                getData();
            });
        }

    };

    //取消锁定
    $scope.printerUnLock = function (userExpressTemplate) {
        userExpressTemplate.printerKey = null;
        $restClient.post('seller/userExpressTemplate/updatePrinter', null, userExpressTemplate, function (data) {
            if (data.data) {
                //getData();
            }
        });
    };

    //修改名称
    $scope.updateName = function (userExpressTemplate) {

        var modal = $win.prompt({
            value: userExpressTemplate.name,
            windowTitle: '修改模板名称',
            title: "模板名称",
            templateBody: '<div class="form-group ">' +
                              '<div class="col-xs-12">' +
                                 '<input type="text" class="form-control" ng-model="data.value" ng-maxlength="15" required="" name="username">' +
                              '</div>' +
                          '</div>'
        });
        modal.result.then(function (data) {
            var postData = angular.copy(userExpressTemplate);
            postData.name = data;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, postData, function (data) {
                getData();
            });
        });
    };

    //修改排序
    $scope.updateSequence = function (userExpressTemplate) {
        var modal = $win.prompt({
            value: userExpressTemplate.sequence,
            windowTitle: '修改模板排序',
            title: "模板排序",
            templateBody: '<div class="form-group">' +
                              '<div class="col-xs-12">' +
                                  '<input type="number" class="form-control" ng-model="data.value" required="" name="number">' +
                              '</div>' +
                           '</div>'
        });
        modal.result.then(function (data) {
            userExpressTemplate.sequence = data;
            $restClient.post('seller/userExpressTemplate/updateSelective', null, userExpressTemplate, function (data) {
                getData();
            });
        });
    };

    //预览模板
    $scope.previewTemplate = function (userExpressTemplate) {
        $dpPrint.printExpress(true, {userExpressTemp: userExpressTemplate});
    };

    //预览电子面单模板
    $scope.previewWaybillTemplate = function (userExpressTemplate) {

        $restClient.post('seller/userExpressTemplate/listCustomCell',{userTemplateId:userExpressTemplate.id},null,function(data){
            console.log(data.data);
            $dpPrint.printWaybill(true, {userExpressTemp: userExpressTemplate},
                {
                    userTemplateCells:data.data,
                    waybills:[{
                        expressNo:9890000160004,
                        templateUrl:userExpressTemplate.stdTemplateUrl,
                        customAreaUrl:userExpressTemplate.stdCustomAreaUrl,
                        printData: {
                            "data": {
                                "cpCode": userExpressTemplate.userExpressCode,
                                "recipient": {
                                    "address": {
                                        "city": "北京市",
                                        "detail": "花家地社区卫生服务站三层楼我也不知道是哪儿了",
                                        "district": "朝阳区",
                                        "province": "北京",
                                        "town": "望京街道"
                                    },
                                    "mobile": "1326443654",
                                    "name": "张三",
                                    "phone": "057123222"
                                },
                                "routingInfo": {
                                    "consolidation": {
                                        "name": "杭州",
                                        "code": "hangzhou"
                                    },
                                    "origin": {
                                        "code": "POSTB"
                                    },
                                    "sortation": {
                                        "name": "杭州"
                                    },
                                    "routeCode": "380D-56-04"
                                },
                                "sender": {
                                    "address": {
                                        "city": "北京市",
                                        "detail": "花家地社区卫生服务站二层楼我也不知道是哪儿了",
                                        "district": "朝阳区",
                                        "province": "北京",
                                        "town": "望京街道"
                                    },
                                    "mobile": "1326443654",
                                    "name": "张三",
                                    "phone": "057123222"
                                },
                                "shippingOption": {
                                    "code": "COD",
                                    "services": {
                                        "SVC-COD": {
                                            "value": "200"
                                        }
                                    },
                                    "title": "代收货款"
                                },
                                "waybillCode": "9890000160004"
                            },
                            "signature": "ALIBABACAINIAOWANGLUO",
                            "templateURL": userExpressTemplate.stdTemplateUrl
                        }
                    }]
                },undefined,undefined,undefined,$scope
            );

        })
    };

}]);

app.controller('userExpressTemplatePrinterLockCtrl', ['$scope', '$modalInstance', 'data', '$restClient', function ($scope, $modalInstance, data, $restClient) {
    $scope.userExpressTemplate = data.userExpressTemplate;
    $scope.printerList = data.printerList;
    $scope.waybill = (data.userExpressTemplate.category == 2);
    //保存
    $scope.save = function (userExpressTemplate) {
        $restClient.post('seller/userExpressTemplate/updatePrinter', null, userExpressTemplate, function (data) {
            if (data.data) {
                $modalInstance.close();
            }
        });
    };

    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

}]);

app.controller('addExpressTemplateCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win', function ($scope, $modalInstance, $modal, $restClient, $win) {
    init();
    function init() {
        getData();
    }

    function getData() {
        $restClient.post('seller/userExpressTemplate/form', null, null, function (data) {
            $scope.expressTemplateList = data.data.sysTemplateList;
            $scope.sysTemplate = data.data.sysTemplateList[0];
            $scope.sysTemplateName = $scope.sysTemplate.name;
        });
    }

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.save = function () {
        if ($scope.sysTemplateName == "" || $scope.sysTemplateName == null || $scope.sysTemplateName == undefined) {
            $win.alert("模板名称不能为空");
            return;
        }
        if ($scope.sysTemplateName.length > 15) {
            $win.alert("模板名称不能超过15个字符");
            return;
        }
        $scope.sysTemplate.name = $scope.sysTemplateName;
        $scope.loading = $restClient.post('seller/userExpressTemplate/add', null, $scope.sysTemplate, function (data) {
            console.log(data);
            $modalInstance.close($scope.express);
        });

    };
    $scope.checkEntry = function (sysTemplate) {
        $scope.sysTemplate = sysTemplate;
        $scope.sysTemplateName = $scope.sysTemplate.name;
    };

}]);

app.controller('setWaybillCtrl', ['$scope', '$modalInstance', '$modal', '$restClient', '$win','data', function ($scope, $modalInstance, $modal, $restClient, $win,data) {
    $scope.userExpressTemplate = data;
    $scope.interfaceType = 1;
    getData();
    function getData() {
        $scope.loading = $restClient.get('seller/waybill/getSubscription', {userExpressId:data.userExpressId}, function (data) {

            if(data.data){
                $scope.branchAccountCols = data.data.branchAccountCols;
                $scope.shipAddressList = serverToClient(angular.copy(data.data.branchAccountCols));
                $scope.shipAddress = $scope.shipAddressList[0];
            }

        });
        $restClient.post('seller/waybill/listBindSubscription', {userExpressId:data.userExpressId},null, function (data) {

            if(data.data){
                $scope.bindSubscriptionList = data.data;
                angular.forEach($scope.bindSubscriptionList,function(item){
                    if(item.subscriptionInfo){
                        item.shipAddressList = serverToClient(item.subscriptionInfo.branchAccountCols);
                    }
                });
                $scope.otherSubscription = $scope.bindSubscriptionList[0];
                $scope.$watch('otherSubscription',function(newValue,oldValue){
                    if(newValue!=oldValue){
                        if(newValue.shipAddressList) {
                            $scope.shipAddress = newValue.shipAddressList[0];
                        }
                    }
                });
            }
        });
    }

    $scope.$watch('interfaceType',function(newValue,oldValue){
        if(newValue!=oldValue){
            if(newValue==1){
                if($scope.shipAddressList){
                    $scope.shipAddress = $scope.shipAddressList[0];
                }
            }
            if(newValue==2){
                if($scope.bindSubscriptionList) {
                    $scope.otherSubscription = $scope.bindSubscriptionList[0];
                }
                if($scope.otherSubscription.shipAddressList){
                    $scope.shipAddress = $scope.otherSubscription.shipAddressList[0];

                }

            }
        }
    });
    function serverToClient(branchAccountCols){
        var shipAddressList =[];
        //将Address字段合到shippAddressCols的对象中
        angular.forEach(branchAccountCols,function(item){
            angular.forEach(item.shippAddressCols,function(address){
                angular.extend(address,item);
                delete address.shippAddressCols;
            });
            shipAddressList = shipAddressList.concat(item.shippAddressCols);
        });

        return shipAddressList;

    }

    $scope.save = function () {
        $scope.userExpressTemplate.interfaceType = $scope.interfaceType;
        $scope.userExpressTemplate.branchCode = $scope.shipAddress.branchCode;
        $scope.userExpressTemplate.city = $scope.shipAddress.city;
        $scope.userExpressTemplate.detail = $scope.shipAddress.detail;
        $scope.userExpressTemplate.district = $scope.shipAddress.district;
        $scope.userExpressTemplate.province = $scope.shipAddress.province;
        $scope.shipAddress.town &&($scope.userExpressTemplate.town = $scope.shipAddress.town);
        //使用其他店铺
        if($scope.interfaceType==2) {
            $scope.userExpressTemplate.userId = $scope.otherSubscription.userId;
            $scope.userExpressTemplate.userNick = $scope.otherSubscription.name;
        }
        $modalInstance.close($scope.userExpressTemplate);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
/**
 * Created by Jin on 2016/11/29.
 */
app.controller('waybillReportCtrl',['$scope','$restClient','$q','$location',function($scope,$restClient,$q,$location){
    function init(){
        //分页相关
        $scope.pageNo = 1;
        $scope.message = '加载数据中。。';
        $scope.pageSize = 10;
        $scope.count = 0;
        $scope.isRecycle = $location.search().isRecycle;
        getCompany();
        getProvince().then(watchProvince);
        searchData($scope.pageNo,$scope.pageSize);

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

}]);
/**
 * Created by Jin on 2016/6/16.
 */
app.filter('centToDollar', function () {
    return function (data) {
        if (data!=undefined) {
            return (parseFloat(data) / 100).toFixed(2);
        }
    }
});
app.filter('transformMm', function () {
    return function (data) {
        return Math.round(parseInt(data) / 3.775);
    }
});
app.filter('orderStatus', function () {
    return function (input) {
        var result;
        switch (input) {
            case "ALL":
                result = "全部订单";
                break;
            case "WAIT_BUYER_PAY":
                result = "已下单未付款";
                break;
            case "WAIT_SELLER_SEND_GOODS":
                result = "已付款未发货";
                break;
            case "WAIT_BUYER_CONFIRM_GOODS":
                result = "卖家已发货";
                break;
            case "SELLER_CONSIGNED_PART":
                result = "卖家部分发货";
                break;
            case "TRADE_FINISHED":
                result = "交易成功";
                break;
            case "TRADE_CLOSED":
                result = "已退款";
                break;
            case "ALL_CLOSED":
                result = "交易关闭";
                break;
            case "TRADE_CLOSED_BY_TAOBAO":
                result = "订单关闭";
        }
        return result;
    }
});
app.filter('refundStatus', function () {
    return function (input) {
        var result;
        switch ($.trim(input)) {
            case "WAIT_SELLER_AGREE":
                result = "买家申请退款待卖家确认";
                break;
            case "WAIT_BUYER_RETURN_GOODS":
                result = "卖家同意待买家退货";
                break;
            case "WAIT_SELLER_CONFIRM_GOODS":
                result = "买家已退货待卖家收货";
                break;
            case "SELLER_REFUSE_BUYER":
                result = "卖家拒绝退款";
                break;
            case "CLOSED":
                result = "退款关闭";
                break;
            case "SUCCESS":
                result = "退款成功";
                break;
        }
        return result;
    }
});
app.filter('CommonLogType', function () {
    return function (input) {
        switch (input) {
            case 1:
                return "卖家备注修改";
                break;
            case 2:
                return "卖家旗帜修改";
                break;
            case 3:
                return "软件内备注补充";
                break;
            case 4:
                return "软件订单自定义分类修改";
                break;
            case 5:
                return "合并订单收货地址修改";
                break;
            case 6:
                return "收货地址手动修改";
                break;
            case 7:
                return "宝贝简称修改";
                break;
            case 8:
                return "销售属性修改";
                break;
        }
    }
});
app.filter('category', function () {
    return function (input) {
        switch (input) {
            case 1:
                return "打印机打印";
                break;
            case 2:
                return "手工设置为未打印";
                break;
            case 3:
                return "手动设置为已打印";
                break;
            case 4:
                return "运单号保存";
                break;
            case 5:
                return "快递模板更换";
                break;
            case 6:
                return "取消运单号";
                break;
            case 7:
                return "获取电子面单号";
                break;
            case 8:
                return "回收电子面单号";
                break;
        }
    }
});
app.filter('operateType', function () {
    return function (input) {
        switch (input) {
            case 1:
                return "系统合并";
                break;
            case 2:
                return "手动合并";
                break;
            case 3:
                return "系统拆分";
                break;
            case 4:
                return "手动拆分";
                break;
            case 5:
                return "退款成功系统自动拆分";
                break;
            case 6:
                return "其他软件发货系统自动拆分";
                break;
        }
    }
});
app.filter('errorMsg', function () {
    return function (input) {
        return input.split("|")[1];
    }
});
app.filter('floatTransition', function () {
    return function (ele, precision) {
        if (!ele) {
            return "";
        }

        var priceStr = "";
        var ele = ele.toString().length > precision ? ele.toString() : '0' + ele.toString();
        for (; ele.length <= precision;) {
            ele = '0' + ele;
        }
        angular.forEach(ele, function (item, index) {
            priceStr = index == ele.length - precision ? priceStr + "." + item : priceStr + item;
        });
        return priceStr;
    }
});
app.filter('blackTypes',function(){
   return function(type){
       switch (type) {
           case 1:
               return "恶意打假";
               break;
           case 2:
               return "职业买手";
               break;
           case 3:
               return "刷单黑号";
               break;
           case 4:
               return "职业差评师";
               break;
           case 5:
               return "恶意退款";
               break;
           case 6:
               return "爱找茬";
               break;
           case 7:
               return "差评率高";
               break;
       }
   }
});
app.filter('blackTypeText',function(){
    return function(type){
        switch (type) {
            case 1:
                return "此买家为恶意打假，建议不要发货并且旺旺沟通时注意“好评返现”等违规用语！";
                break;
            case 2:
                return "此买家疑似职业买手，建议发货前检查一下宝贝质量，确保发货宝贝和详情描述相符！";
                break;
            case 3:
                return "此买家为刷单黑号，建议不要发货避免被系统评定为虚假交易！";
                break;
            case 4:
                return "此买家为职业差评师，建议不要发货避免完成交易后收到恶意差评！";
                break;
            case 5:
                return "此买家常恶意退款，建议不要发货避免邮费和物品的损失！";
                break;
            case 6:
                return "此买家爱找茬，建议检查宝贝质量并注意旺旺沟通时注意交流用语！";
                break;
            case 7:
                return "此买家给出的差评率很高，建议检查宝贝质量并催促一下物流，不要主动给差评点！";
                break;
        }
    }
});
/**
 * Created by Jin on 2016/6/7.
 */
app.factory('drag',['$q', function ($q) {
    //拖动拉伸方法
    var drag = function (element, event, container) {
        var deffer = $q.defer();

        var defaults = {
            handles: "n,e,s,w,ne,se,sw,nw",
            maxHeight: 10000,
            maxWidth: 10000,
            minHeight: 10,
            minWidth: 10,
            cursor: false,
            edge: 5
        };

        var dir = getDirection(event, $(element), defaults);

        $(element).on('mousemove', function (e) {                   //设置鼠标样式
            //console.log(this);
            var dir = getDirection(e, $(this), defaults);
            if (dir === "") {
                $(this).css('cursor', 'default')
            } else {
                $(this).css('cursor', dir + '-resize');

            }

        });

        var scroll = getScrollOffsets(),
            scrollX = event.clientX + scroll.x,     //鼠标起始位置
            scrollY = event.clientY + scroll.y;

        var origX = element.offsetLeft,            //拖动对象起始位置
            origY = element.offsetTop;

        var deltaX = scrollX - origX,              //鼠标与对象之间距离
            deltaY = scrollY - origY;


        $.extend(defaults, {
            dir: dir,
            container: container,
            mouseStartX: scrollX,
            mouseStartY: scrollY,
            elementStartX: origX,
            elementStartY: origY,
            deltaX: deltaX,
            deltaY: deltaY,
            startWidth: getCssValue($(element), 'width'),
            startHeight: getCssValue($(element), 'height'),
            rangeTopX: container.offsetLeft,                        //容器上顶角坐标
            rangeTopY: container.offsetTop,
            rangeWidth: getCssValue($(container), 'width'),
            rangeHeight: getCssValue($(container), 'height')

        });


        if (document.addEventListener) {
            document.addEventListener('mousemove', moveHandler, true);
            document.addEventListener('mouseup', upHandler, true);
        }
        else if (document.attachEvent) {
            element.setCapture();
            element.attachEvent('onmousemove', moveHandler);
            element.attachEvent('onmouseup', upHandler);

            element.attachEvent('onlosecapture', upHandler);
        }
        if (event.stopPropagation)event.stopPropagation();
        else event.cancelBubble = true;

        function moveHandler(e) {
            if (!e) e = window.event;

            defaults.dir == "" ? setPosition(e, element, defaults) : refresh(e, element, defaults);     //判断拖拽或拉伸

            if (e.stopPropagation)e.stopPropagation();
            else e.cancelBubble = true;

            if (e.preventDefault)e.preventDefault();
            else e.returnValue = true;
        }

        function upHandler(e) {
            if (!e) e = window.event;

            if (document.removeEventListener) {
                document.removeEventListener('mouseup', upHandler, true);
                document.removeEventListener('mousemove', moveHandler, true);
            } else if (document.detachEvent) {
                element.detachEvent('onlosecapture', upHandler);
                element.detachEvent('onmouseup', upHandler);
                element.detachEvent('onmousemove', moveHandler);
                element.releaseCapture();
            }

            if (e.stopPropagation) e.stopPropagation();
            else e.cancelBubble = true;
            deffer.resolve(element);
        }

        return deffer.promise;
    };
    //获取窗口滚动条位置
    function getScrollOffsets(win) {
        var w = win || window;
        if (w.pageXoffset != null) {
            return {x: w.pageXoffset, y: pageYoffset};
        }
        var d = w.document;
        if (document.compatMode == "CSS1Compat")
            return {x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop};
        return {x: d.body.scrollLeft, y: d.body.scrollTop};
    }

    //对样式值进行处理,强制转数值
    function getCssValue(el, css) {
        var val = parseInt(el.css(css), 10);
        if (isNaN(val)) {
            return 0;
        } else {
            return val;
        }
    }

    function getDirection(e, target, data) {
        var dir = "";
        var offset = target.offset();
        var width = target[0].offsetWidth;
        var height = target[0].offsetHeight;
        var edge = data.edge;
        if (e.pageY >= offset.top && e.pageY <= offset.top + edge) {
            dir += "n";
        } else if (e.pageY <= offset.top + height && e.pageY >= offset.top + height - edge) {
            dir += "s";
        }
        if (e.pageX >= offset.left && e.pageX <= offset.left + edge) {
            dir += "w";
        } else if (e.pageX <= offset.left + width && e.pageX >= offset.left + width - edge) {
            dir += "e";
        }
        for (var i = 0, handle; handle = data.handles.split(',')[i++];) {
            if (handle === "all" || handle === dir) {
                return dir;
            }
        }
        return "";
    }

    function setPosition(e, element, defaults) {
        var scroll = getScrollOffsets();
        var left = e.clientX + scroll.x - defaults.deltaX,                   //拖动后对象上顶角坐标
            top = e.clientY + scroll.y - defaults.deltaY;

        var origBottomX = left + element.offsetWidth,                    //拖动后对象下顶角坐标
            origBottomY = top + element.offsetHeight;

        if (defaults.container) {                                      //拖动范围容器
            var rangeTopX = defaults.rangeTopX,                       //容器上顶角坐标
                rangeTopY = defaults.rangeTopY,
                rangeBottomX = defaults.rangeWidth + rangeTopX,      //容器下顶角坐标
                rangeBottomY = defaults.rangeHeight + rangeTopY;

            if (left < rangeTopX) {
                left = rangeTopX;
            }
            if (top < rangeTopY) {
                top = rangeTopY;
            }
            if (origBottomX > rangeBottomX) {
                left = rangeBottomX - element.offsetWidth;
            }
            if (origBottomY > rangeBottomY) {
                top = rangeBottomY - element.offsetHeight;
            }
        }

        element.style.left = left + 'px';
        element.style.top = top + 'px';
    }



    function refresh(event, target, data) {      //n:上 w:left s:下 e:right  拉伸操作
        var b = data;
        if (data.dir.indexOf("e") !== -1) {
            var width = data.startWidth + event.clientX - data.mouseStartX;
            width = Math.min(Math.max(width, b.minWidth), b.maxWidth);
            data.resizeWidth = width;

        }
        if (data.dir.indexOf("s") !== -1) {
            var height = data.startHeight + event.clientY - data.mouseStartY;
            height = Math.min(Math.max(height, b.minHeight), b.maxHeight);
            data.resizeHeight = height;

        }
        if (data.dir.indexOf("w") !== -1) {
            data.resizeWidth = data.startWidth - event.clientX + data.mouseStartX;
            if (data.resizeWidth >= b.minWidth && data.resizeWidth <= b.maxWidth) {
                data.resizeLeft = data.elementStartX + event.clientX - data.mouseStartX;
            }
        }
        if (data.dir.indexOf("n") !== -1) {
            data.resizeHeight = data.startHeight - event.clientY + data.mouseStartY;
            if (data.resizeHeight >= b.minHeight && data.resizeHeight <= b.maxHeight) {
                data.resizeTop = data.elementStartY + event.clientY - data.mouseStartY;
            }
        }

        var obj = {
            left: data.resizeLeft,
            top: data.resizeTop,
            width: data.resizeWidth,
            height: data.resizeHeight
        };

        for (var i in obj) {
            $(target).css(i, obj[i]);
        }
    }

    return drag;
}]);
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
/**
 * Created by Jin on 2016/8/16.
 */
/**
 * 区域层级选择*/
app.factory('$dpAddress', ['$restClient', '$q', '$rootScope', function ($restClient, $q, $rootScope) {

    function watchProvince($scope) {
        $scope.$watch('receiverState', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.provinceList, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCity(item.code, $scope).then(watchCity);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function watchCity($scope) {
        $scope.$watch('receiverCity', function (newValue, oldValue) {
            if (newValue != oldValue || newValue != undefined) {
                var keepGoing = true;
                angular.forEach($scope.cityList, function (item) {
                    if (keepGoing) {
                        if (item.name == newValue) {
                            getCountry(item.code,$scope);
                            keepGoing = false;
                        }
                    }
                });
            }
        });
    }

    function getProvince($scope) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: 1}, function (data) {
            console.log(data);
            $scope.provinceList = data.data;
            deferred.resolve($scope);
        });
        return promise;
    }

    function getCity(code, $scope) {
        var deferred = $q.defer(),
            promise = deferred.promise;
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            console.log(data);
            $scope.cityList = data.data;
            deferred.resolve($scope);
        });
        return promise;
    }

    function getCountry(code,$scope) {
        $restClient.postFormData('seller/area/listByParentId', {parentId: code}, function (data) {
            $scope.countryList = data.data;
        });
    }

    return {
        getSelectAddress: function (scope) {

            getProvince(scope).then(watchProvince);

        }
    }
}]);
app.factory("$global", ["$location", "$common", function ($location) {
    var globalMethtods = {
        getModuleFromUrl: function () {
            var hashNodes = $location.path().split("/");
            hashNodes.splice(0, 1);
            return hashNodes[0];
        },
        getSubModuleFromUrl: function () {
            var hashNodes = $location.path().split("/");
            hashNodes.splice(0, 1);
            return hashNodes[1];
        },
        camelToUnderline: function (str) {
            var reg = /[A-Z]/g;
            str = str.replace(reg, function ($0) {
                return "_" + $0;
            });
            return str.toUpperCase();
        },
        camelToDash: function () {
            var reg = /[A-Z]/g;
            return str.replace(reg, function ($0) {
                return "-" + $0.toUpperCase;
            });
        },
        minutesToDate: function (input) {
            var hours = Math.floor(input / 60);
            var minutes = input % 60;
            return moment(new Date()).startOf("day").add(hours, "hours").add(minutes, "minutes")._d;
        },
        dateToMinutes: function (date) {
            if (!date) {
                return 0;
            }
            var date = moment(date);
            return date.get("hours") * 60 + date.get("minutes");
        }
    };
    return globalMethtods;
}]);


/**
 * Created by Jin on 2016/10/14.
 */
app.factory('$local',['$window',function($window){
    return {
        setValue:function(key,value){
            $window.localStorage[key]=value;
        },
        getValue:function(key){
            if($window.localStorage[key]){
                return $window.localStorage[key];
            }
        },
        setObject:function(key,value){
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject:function(key){
            if($window.localStorage[key]) {
                return JSON.parse($window.localStorage[key]);
            }else{
                return {};
            }
        },
        clearData:function(){
            $window.localStorage.clear();
        }
    }
}]);
/**
 * Created by Jin on 2016/8/8.
 */
app.factory('$dpPrint', ['$modal', '$restClient', '$common', '$q', '$rootScope', '$compile', 'code', '$win', '$location', function ($modal, $restClient, $common, $q, $rootScope, $compile, code, $win, $location) {

    //选择打印机
    function choosePrinter(printTypeData) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var choosePrinter = $modal.open({
            templateUrl: "views/pages/choosePrinter.html",
            controller: "choosePrinterCtrl",
            resolve: {
                data: function () {
                    return printTypeData;
                }
            }
        });
        choosePrinter.result.then(function (printerName) {

            deferred.resolve(printerName);               //打印机名称
        });

        return promise;
    }

    //创建打印页
    function createPrintPage(expressTemplateList, preview, baseData) {
        var sectionNum = 1; //每页的个数
        var print_orient;
        if (baseData.baseSetting) {
            print_orient = baseData.baseSetting.expressBillDirection; //1---纵(正)向打印，固定纸张；
        } else {
            print_orient = 1;
        }
        //2---横向打印，固定纸张；
        //3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
        //0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；
        console.log("print control version:" + LODOP.VERSION);
        var print_init = false;

        angular.forEach(expressTemplateList, function (template) {
            var userTemplateCell = template.userTemplateCell;
            var userExpressTemplate = template.userExpressTemplate;

            if (!print_init) {
                //设置偏移
                LODOP.PRINT_INITA(-2.2 + userExpressTemplate.calibrationY + "mm", userExpressTemplate.calibrationX + 'mm', userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "");
                LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
                LODOP.SET_SHOW_MODE("LANGUAGE", 0);
                //设置本次输出的打印任务名
                //if(category)
                LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "快递单");
                //设置纸张类型
                LODOP.SET_PRINT_PAGESIZE(print_orient, userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "");
                print_init = true;
            }

            //设置背景图片
            if (preview && userExpressTemplate.bgImg) {
                LODOP.ADD_PRINT_IMAGE(0, 0, userExpressTemplate.width + 'mm', userExpressTemplate.height + 'mm', "<img border=\"0\" src=\"" + userExpressTemplate.bgImg + "\" />");
                LODOP.SET_PRINT_STYLEA(0, "PreviewOnly", "true");	// 打印时不打印
            }
            createElement(userTemplateCell);                    //添加打印元素

            LODOP.NEWPAGEA();   //分页

        });

    }

    //创建打印页元素
    function createElement(userTemplateCell) {
        var unit = "px";
        var text_align = 1;

        angular.forEach(userTemplateCell, function (cell, i) {

            if (cell.entryCode == "custom_image") {                    //图片
                LODOP.ADD_PRINT_IMAGE(cell.yPosition, cell.xPosition, cell.width + unit, cell.height + unit,
                    "<img border='0' src='" + cell.entryContent + "' />");
            } else if (cell.entryCode == "bar_code_128_out_sid" || cell.entryCode == "bar_code_128_tid") {        // 条形码横版

                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 192 + unit, 64 + unit,
                    "128Auto", cell.entryContent);

            } else if (cell.entryCode == "bar_code_rotate90_128_out_sid") {// 条码竖版

                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 64 + unit, 192 + unit,
                    "128Auto", cell.entryContent);
                LODOP.SET_PRINT_STYLEA(0, "Angle", 90);

            } else if (cell.entryCode.indexOf('bar_code_qr') == 0) {        //二维码
                LODOP.ADD_PRINT_BARCODE(cell.yPosition, cell.xPosition, 90 + unit, 80 + unit,
                    "QRCode", cell.entryContent);
                LODOP.SET_PRINT_STYLEA(0, "GroundColor", "#ffffff");

                var qr_version = 1;
                if (cell.entryContent.length < 15) {
                    qr_version = 1;// 版本1只能编码14个字符
                } else if (cell.entryContent.length < 27) {
                    qr_version = 2;// 版本2只能编码26个字符
                } else if (cell.entryContent.length < 43) {
                    qr_version = 3;// 版本3只能编码42个字符
                } else if (cell.entryContent.length < 85) {
                    qr_version = 5;// 版本5只能编码84个字符
                } else if (cell.entryContent.length < 123) {
                    qr_version = 7;
                } else if (cell.entryContent.length < 213) {
                    qr_version = 10;
                } else {
                    qr_version = 14;
                }
                // 如果不指定版本，控件会自动选择版本
                LODOP.SET_PRINT_STYLEA(0, "QRCodeVersion", qr_version);

            } else if (cell.entryCode.indexOf("horizontal_line") == 0) {         // 横线
                var line_width = 1;
                var line_style = 0;
                if (cell.entryCode == "horizontal_line_1" || cell.entryCode == "vertical_line_1") {
                    line_style = 0;
                } else if (cell.entryCode == "horizontal_line_2" || cell.entryCode == "vertical_line_2") {
                    line_style = 2;
                } else {
                    line_style = 0;
                }
                var new_y = cell.yPosition + 1.5;
                LODOP.ADD_PRINT_LINE(new_y, cell.xPosition, new_y + unit, (cell.xPosition + cell.width) + unit, line_style, line_width);

            } else if (cell.entryCode.indexOf("vertical_line") == 0) {           // 竖线
                line_width = 1;
                line_style = 0;
                if (cell.entryCode == "vertical_line_1") {
                    line_style = 0;
                } else if (cell.entryCode == "vertical_line_2") {
                    line_style = 2;
                } else {
                    line_style = 0;
                }
                var new_x = cell.xPosition + 1.5;
                LODOP.ADD_PRINT_LINE(cell.yPosition, new_x,
                    ( cell.yPosition + cell.height) + unit,
                    new_x + unit, line_style, line_width);
            } else if (cell.entryCode == "rectangle_checkbox") {            // 矩形
                line_style = 0;     // 实线
                line_width = 1;     // 线宽

                LODOP.ADD_PRINT_RECT(cell.yPosition, cell.xPosition,
                    cell.width + unit, cell.height + unit, line_style,
                    line_width);

            } else {                                                      //文本
                var has_background_color = false;//用于标记打印项目是否有背景色
                if (!has_background_color) {//无背景色文本
                    LODOP.ADD_PRINT_TEXT(cell.yPosition, cell.xPosition, cell.width + unit, cell.height + unit, cell.entryContent);
                    LODOP.SET_PRINT_STYLEA(0, "FontName", cell.fontType);
                    LODOP.SET_PRINT_STYLEA(0, "FontSize", cell.fontSize);
                    LODOP.SET_PRINT_STYLEA(0, "LineSpacing", "-1px");
                    LODOP.SET_PRINT_STYLEA(0, "FontColor", cell.fontColor && cell.fontColor.replace("0x", "#"));
                    LODOP.SET_PRINT_STYLEA(0, "Bold", $.trim(cell.fontBold) == "normal" ? 0 : 1);
                    LODOP.SET_PRINT_STYLEA(0, "Italic", $.trim(cell.fontItalic) == "normal" ? 0 : 1);
                    LODOP.SET_PRINT_STYLEA(0, "Underline", $.trim(cell.textUnderline) == "initial" ? 0 : 1);
                    if (cell.textAlign == "center") {
                        text_align = 2;
                    } else if (cell.textAlign == "right") {
                        text_align = 3;
                    } else {
                        text_align = 1;
                    }
                    LODOP.SET_PRINT_STYLEA(0, "Alignment", text_align);
                }
            }

        });

    }

    //获取快递模板信息
    function getTemplate(NormalPackages, baseData, type) {
        var printDataList = [];
        var expressTemplate;
        var deferred = $q.defer();
        var promise = deferred.promise;

        $restClient.postFormData('seller/userExpressTemplate/form', {
                userExpressId: baseData.userExpressTemp.userExpressId,
                templateId: baseData.userExpressTemp.id
            }, function (data) {
                console.log(data.data);
                expressTemplate = data.data;
                if (NormalPackages) {
                    angular.forEach(NormalPackages, function (Package) {
                        //组合打印数据
                        code.createCellValue(expressTemplate.userTemplateCell, Package, baseData, type);
                        printDataList.push(angular.copy(expressTemplate));

                    });
                } else {
                    printDataList.push(expressTemplate);
                }
                deferred.resolve(printDataList);
            }
        );

        return promise;
    }

    //获取发货单模板
    function getDeliveryTemplate(templateId) {
        var deferred = $q.defer();

        if (templateId) {            //预览模板
            $restClient.get('seller/userDeliveryTemplate/form', {templateId: templateId}, function (data) {
                console.log(data);

                deferred.resolve(data.data);
            });
        } else {                      //打印预览默认模板
            $restClient.get('seller/userDeliveryTemplate/getPrintDeliveryTemplate', null, function (data) {
                console.log(data);

                deferred.resolve(data.data);
            });
        }
        return deferred.promise;
    }

    //替换发货单数据
    function replaceData(template, NormalPackages) {

        var listArray = [];

        function replaceSku(order) {
            if (order.skuPropertiesName == undefined) {
                return "";
            }
            var sku = order.skuPropertiesName;
            if (order.skuChangeName) {
                sku = order.skuChangeName;
            }

            var args = sku.split(";");
            var returnStr = "";
            for (var i = 0; i < args.length; i++) {
                var str = args[i].split(":");
                returnStr = ("" == returnStr) ? str[1] : returnStr + ";" + str[1];
            }
            return returnStr;
        }

        if (NormalPackages.length > 0) {
            angular.forEach(NormalPackages, function (Package) {
                var userTemplate = angular.copy(template);

                //转换SKU属性去掉名称
                if (Package.normalTradeList) {
                    angular.forEach(Package.normalTradeList, function (trade) {
                        angular.forEach(trade.normalOrderList, function (order) {
                            if(order.skuPropertiesName){
                                order.skuPropertiesName = replaceSku(order);
                            }

                        })
                    });
                }

                if (Package.freeTradeList) {
                    angular.forEach(Package.freeTradeList, function (freeTrade) {
                        angular.forEach(freeTrade.freeOrderList, function (order) {
                            if(order.skuPropertiesName){
                                order.skuPropertiesName = replaceSku(order);
                            }
                        })
                    });
                }

                angular.forEach(userTemplate.userTemplateCellList, function (cell) {
                    var entryCode = $common.underlineToCamel(cell.entryCode);

                    if (entryCode == "receiverInfo") {
                        cell.entryContent = (Package.receiverName ? Package.receiverName : '') +
                            (Package.receiverMobile ? Package.receiverMobile : '') + (Package.receiverState ? Package.receiverState : '') +
                            (Package.receiverCity ? Package.receiverCity : '') + (Package.receiverDistrict ? Package.receiverDistrict : '') +
                            (Package.receiverAddress ? Package.receiverAddress : '') + (Package.receiverZip ? Package.receiverZip : '');
                    } else if (entryCode == "sellerMemo") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.sellerMemo){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.sellerMemo;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.sellerMemo){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.sellerMemo;
                                }

                            });
                        }

                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "buyerMessage") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.buyerMessage){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.buyerMessage;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.buyerMessage){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.buyerMessage;
                                }
                            });
                        }

                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "sysMemo") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.sysMemo){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.sysMemo;
                                }

                            });
                        }
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "created") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.created){
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.created;
                                }

                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.created) {
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.created;
                                }
                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "tid") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.tid) {
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.tid;
                                }
                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.tid){
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.tid;
                                }

                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (entryCode == "payTime") {
                        cell.entryContent = '';
                        if (Package.normalTradeList) {
                            angular.forEach(Package.normalTradeList, function (normalTrade, i) {
                                if(normalTrade.payTime) {
                                    cell.entryContent = cell.entryContent + '，' + normalTrade.payTime;
                                }
                            });
                        }
                        if (Package.freeTradeList) {
                            angular.forEach(Package.freeTradeList, function (freeTrade, i) {
                                if(freeTrade.payTime) {
                                    cell.entryContent = cell.entryContent + '，' + freeTrade.payTime;
                                }
                            });
                        }
                        //去除第一个逗号
                        cell.entryContent = cell.entryContent.substr(1);
                    } else if (Package[entryCode]) {

                        cell.entryContent = Package[entryCode];
                    }

                });
                userTemplate.packageInfo = Package;
                listArray.push(userTemplate);
            });
        } else {
            listArray.push(template);
        }
        return listArray;
    }

    //执行打印快递单
    function doBatchPrint(preview, baseData, NormalPackages, callbackFunc, callbackParam, type) {
        //打印数据

        var printDataList;
        getTemplate(NormalPackages, baseData, type).then(function (dataList) {
            printDataList = dataList;

            return choosePrinter({
                preview: preview,
                type: 1,
                template: dataList[0].userExpressTemplate
            });
        }).then(function (printer) {

            createPrintPage(printDataList, preview, baseData);
            //设置打印机
            LODOP.SET_PRINTER_INDEXA(printer);

            if (preview) {
                //设置预览窗口大小
                LODOP.SET_PREVIEW_WINDOW(1, 0, 1, 950, 600, "打印预览");
                //LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS", 1);

                LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
                if (LODOP.VERSION > "6.1.8.7") {
                    LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                    LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                    LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
                }
                // LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPreview(callbackFunc, callbackParam);

            } else {
                //LODOP.SET_PRINT_COPIES(2);
                //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

                RealPrint(callbackFunc, callbackParam);
            }

        });
    }

    //执行打印发货单
    function doBatchDelivery(preview, baseData, printer, NormalPackages, callbackFunc, callbackParam, templateScope) {

        var printDataList = replaceData(templateScope.entity, NormalPackages);

        //LODOP = getLodop();


        var sectionNum; //每页的个数
        var print_orient;
        if (baseData.baseSetting) {
            print_orient = baseData.baseSetting.deliveryBillDirection; //1---纵(正)向打印，固定纸张；
        } else {
            print_orient = 1;
        }
        //2---横向打印，固定纸张；
        //3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
        //0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；

        var section_height;// 等分的高度


        console.log("print control version:" + LODOP.VERSION);
        var print_init = false;


        angular.forEach(printDataList, function (template, i) {
            //更新模板数据

            templateScope.entity = template;
            templateScope.$apply();


            var userDeliveryTemplate = template.userDeliveryTemplate;

            /*if (userDeliveryTemplate.paperType == 4) {      //自定义纸张
             sectionNum = parseInt(297 / userDeliveryTemplate.height);
             } else {
             sectionNum = userDeliveryTemplate.paperType;
             }*/

            if (!print_init) {
                //设置偏移
                LODOP.PRINT_INITA(userDeliveryTemplate.calibrationY + "mm", userDeliveryTemplate.calibrationX + "mm", userDeliveryTemplate.width + "mm", userDeliveryTemplate.height + "mm", "");
                LODOP.SET_SHOW_MODE("LANGUAGE", 0);
                //设置本次输出的打印任务名
                //if(category)
                LODOP.SET_PRINT_MODE("CUSTOM_TASK_NAME", "发货单");
                LODOP.SET_LICENSES("","3AD05B6A718991B1AFB7D2D9E8030626","C94CEE276DB2187AE6B65D56B3FC2848","");
                //设置纸张类型
                LODOP.SET_PRINT_PAGESIZE(print_orient, userDeliveryTemplate.width + "mm", userDeliveryTemplate.height + "mm", "");
                //LODOP.SET_PRINT_PAGESIZE(print_orient, 0, 0, $.trim(userDeliveryTemplate.name));
                print_init = true;
            }
            var strFormHtml = angular.element(".deliveryTemplate").html();
            if (userDeliveryTemplate.paperType == 2 || userDeliveryTemplate.paperType == 3) {
                LODOP.ADD_PRINT_HTM(0, "12mm", userDeliveryTemplate.width - 24 - userDeliveryTemplate.calibrationX + "mm", userDeliveryTemplate.height - userDeliveryTemplate.calibrationY + "mm", '<!DOCTYPE html>' + strFormHtml);

            } else {
                LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', '<!DOCTYPE html>' + strFormHtml);
            }
            //LODOP.SET_PRINT_STYLEA(0,"HtmWaitMilSecs",1000);
            //设置打印机
            LODOP.SET_PRINTER_INDEXA(printer);
            angular.forEach(template.userTemplateCellList, function (TemplateCell) {
                if (TemplateCell.entryCode == "activity_qrcode") {

                    var objExp = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
                    //检查是否是链接
                    if (objExp.test(TemplateCell.entryContent) == true) {
                        var height = angular.element(".deliveryTemplate ").height();
                        //获取内容html高度，减去二维码宽度
                        LODOP.ADD_PRINT_BARCODE(height - 15 + "px", userDeliveryTemplate.width - 24 - 30 - userDeliveryTemplate.calibrationX + "mm", 30 + 'mm', 30 + 'mm',
                            "QRCode", TemplateCell.entryContent);
                        LODOP.SET_PRINT_STYLEA(0, "GroundColor", "#ffffff");

                        var qr_version = 1;
                        if (TemplateCell.entryContent.length < 15) {
                            qr_version = 1;// 版本1只能编码14个字符
                        } else if (TemplateCell.entryContent.length < 27) {
                            qr_version = 2;// 版本2只能编码26个字符
                        } else if (TemplateCell.entryContent.length < 43) {
                            qr_version = 3;// 版本3只能编码42个字符
                        } else if (TemplateCell.entryContent.length < 85) {
                            qr_version = 5;// 版本5只能编码84个字符
                        } else if (TemplateCell.entryContent.length < 123) {
                            qr_version = 7;
                        } else if (TemplateCell.entryContent.length < 213) {
                            qr_version = 10;
                        } else {
                            qr_version = 14;
                        }
                        // 如果不指定版本，控件会自动选择版本
                        LODOP.SET_PRINT_STYLEA(0, "QRCodeVersion", qr_version);
                    }
                }
            });


            /*// 分页
             if ((i + 1) % sectionNum == 0) {*/
            LODOP.NEWPAGE();   //分页
            /*}*/
        });


        if (preview) {
            //设置预览窗口大小

            LODOP.SET_PREVIEW_WINDOW(1, 0, 1, 950, 600, "打印预览");
            LODOP.SET_PRINT_MODE("AUTO_CLOSE_PREWINDOW", 1);     // 打印后自动关闭预览窗口
            if (LODOP.VERSION > "6.1.8.7") {
                LODOP.SET_PRINT_MODE("RESELECT_PRINTER", true);// 设置是否可以重新选择打印机
                LODOP.SET_PRINT_MODE("RESELECT_PAGESIZE", true);// 设置是否可以重新选择纸张
                LODOP.SET_PRINT_MODE("RESELECT_ORIENT", true);// 设置是否可以重新选择打印方向
            }
            //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

            RealPreview(callbackFunc, callbackParam);

        } else {
            //LODOP.SET_PRINT_COPIES(2);
            //LODOP.SET_SHOW_MODE("NP_NO_RESULT", false);

            RealPrint(callbackFunc, callbackParam);

        }

    }

    function RealPreview(callbackFunc, callbackParam) {

        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    callbackFunc && callbackFunc(callbackParam);
                }
                else {
                    console.log("放弃打印！");
                }
            };
            LODOP.PREVIEW();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PREVIEW()) {
            callbackFunc && callbackFunc(callbackParam);
        } else {
            console.log("放弃打印！");
        }
    }

    function RealPrint(callbackFunc, callbackParam) {

        //云打印C-Lodop返回结果用回调函数:
        if (LODOP.CVERSION) {
            CLODOP.On_Return = function (TaskID, Value) {
                if (Value == 1) {
                    callbackFunc && callbackFunc(callbackParam);
                }
                else {
                    alert("放弃打印！");
                }
            };
            LODOP.PRINT();
            return;
        }
        //控件返回结果用语句本身：
        if (LODOP.PRINT()) {
            callbackFunc && callbackFunc(callbackParam);
        }
        else {
            alert("放弃打印！");
        }
    }

    //编译发货单模板
    function compileDeliveryTemplate(domElement, deliveryTemplate) {
        var templateScope = $rootScope.$new(true);
        templateScope.entity = deliveryTemplate;

        var deliveryTemplateDirective = angular.element('<div delivery-template />');
        deliveryTemplateDirective.attr({
            "entity": "entity"
        });
        domElement.html("");
        domElement.append($compile(deliveryTemplateDirective)(templateScope));
        return templateScope;
    }

    //普通面单打印控件是否安装
    function isCLodopInstalled() {
        var strCLodopInstall = "<div color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行安装</a>,安装后请刷新页面。</div>";
        var strCLodopUpdate = "<div color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='download/CLodop_Setup_for_Win32NT_2.062.exe' target='_self'>执行升级</a>,升级后请刷新页面。</div>";
        var LODOP;

        var isIE = (navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Trident') >= 0);
        try {
            LODOP = getCLodop();
        } catch (err) {
            console.log("getLodop出错:" + err);
        }
        if (!LODOP) {
            var mes = {
                windowTitle: '系统提示',
                title: '请下载并安装打印控件，否则会导致无法打印',
                content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                '打印控件并进行安装。安装后请刷新此页面。下载或安装遇到问题请' +
                '联系我们在线客服！' +
                '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                '<br><a class="text-warning" href="download/CLodop_Setup_for_Win32NT_2.062.exe" target="_self">下载控件</a>',
                img: "images/components/alert/alert-forbid.png",
                size: "lg",
                showClose: false,
                showCancel: false
            };
            $win.confirm(mes);
            return false;
        } else {
            /*if (CLODOP.CVERSION < "2.0.4.6") {
             var mes = {
             windowTitle: '全能掌柜提示，打印前请安装新打印控件',
             title: '打印控件需升级',
             content: strCLodopUpdate,
             img: "images/components/alert/alert-forbid.png",
             showClose: false,
             showCancel: true
             };
             $win.confirm(mes);
             return false;
             }*/
            return true;
        }

    }

    /***
     *
     * 获取请求的UUID，指定长度和进制,如
     * getUUID(8, 2)   //"01001010" 8 character (base=2)
     * getUUID(8, 10) // "47473046" 8 character ID (base=10)
     * getUUID(8, 16) // "098F4D35"。 8 character ID (base=16)
     *
     */
    function getUUID(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [], i;
        radix = radix || chars.length;
        if (len) {
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            var r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    }

    /***
     * 构造request对象
     */
    function getCainiaoReqObj(cmd) {
        var request = {};
        request.requestID = getUUID(8, 16);
        request.version = "1.0";
        request.cmd = cmd;
        return request;
    }


    var $dpPrint = {
        isCLodopInstalled:isCLodopInstalled,
        //打印控件回调函数
        handlerResp:function(rspObj){
            var self = this;
            var waybillData = self.waybillData;


            if (rspObj.cmd == "getPrinters") {
                self.printerInfo = {};
                self.printerInfo.defaultPrinter = rspObj.defaultPrinter;
                self.printerInfo.printerCount = rspObj.printers.length;
                self.printerInfo.printers = rspObj.printers;

            } else if (rspObj.cmd == "print") {
                if (rspObj.status == "success") {
                    if (waybillData.preview) {
                        // 由于是生成的pdf 所以需要在浏览器窗口中打开预览
                        var previewURL = rspObj.previewImage;
                        var previewModel = $win.prompt({
                            windowTitle:'打印预览',
                            windowClass: "previewModel",
                            templateBody:'<span ng-repeat="previewImg in data.value"><img  style="width: 513px;" ng-src="{{previewImg}}"></span>',
                            size:'lg',
                            closeText: "打印",
                            cancelText: "关闭",
                            //模板页面的预览不穿Type 不用打印
                            showClose: Boolean(self.waybillData.type),
                            showCancel: true,
                            value:previewURL

                        });
                        //打印
                        previewModel.result.then(function(){
                            waybillData.preview = false;
                            //打印
                            self.doPrint();
                        })
                    }
                } else {
                    alert("提交打印任务失败，请重试！");
                }
            } else if (rspObj.cmd == "notifyPrintResult") { // 打印结果反馈
                var printSuccessList = [];
                var printFailedList = [];
                angular.forEach(rspObj.printStatus,function(ps){
                    if(ps.status == 'success'){
                        printSuccessList.push(ps);
                    }else {
                        //去除打印失败的包裹
                        if(waybillData.type == 1){
                            //去除掉失败的包裹
                            waybillData.callbackParam.normalPackageList = waybillData.callbackParam.normalPackageList.filter(function (normalPackage) {
                                if (!(normalPackage.expressNo == ps.documentID)) {
                                    return normalPackage;
                                }
                            });
                        }
                        if(waybillData.type == 2){
                            //自由打印 去除掉失败的包裹
                            waybillData.callbackParam = waybillData.callbackParam.filter(function (freePackage) {
                                if (!(freePackage.expressNo == ps.documentID)) {
                                    return freePackage;
                                }
                            });
                        }

                        printFailedList.push(ps);
                    }
                });
                if(waybillData.type == 1){
                    if(waybillData.callbackParam.normalPackageList.length>0){
                        waybillData.callbackFunc(waybillData.callbackParam);
                    }
                }
                if(waybillData.type == 2){
                    if(waybillData.callbackParam.length>0){
                        waybillData.callbackFunc(waybillData.callbackParam);
                    }
                }


                /*$modal.open({
                 templateUrl:'views/pages/waybillResult.html',
                 controller: "waybillResultCtrl",
                 resolve: {
                 data: function () {
                 return {
                 successNum:printSuccessList.length,
                 failedNum:printFailedList.length,
                 printStatus:rspObj.printStatus
                 };
                 }
                 }
                 })*/
            }
        },
        //调用电子面单控件
        initCaiNiao: function () {
            var self = this;
            
            try {
                if ($location.protocol() == "http") {
                    self.webSocket = new WebSocket('ws://localhost:13528');
                } else
                //如果是https的话，端口是13529
                {
                    self.webSocket = new WebSocket('wss://localhost:13529');
                }
            } catch (err) {
                if (window.console && window.console.log) {
                    console.log('webSocket init error : ' + err.message);
                }
            }

            if (self.webSocket) {
                self.webSocket.onopen = function (event) {
                    var messageList = [];
                    self.webSocket_is_open = 1;
                    self.webSocket.send(JSON.stringify(getCainiaoReqObj("getPrinters")));
                    // 监听消息
                    self.webSocket.onmessage = function (event) {
                        console.log('Client received a message', event);
                        //loading
                        if(self.deferred){
                            self.deferred.resolve();
                        }
                        //控件请求回调函数
                        var rspObj = $.parseJSON(event.data);
                        if (rspObj.cmd == "notifyPrintResult") {
                            var messageInfo = rspObj.cmd + '_' + rspObj.requestID;
                            if (messageList.indexOf(messageInfo) < 0) {
                                messageList.push(messageInfo);
                                self.handlerResp(rspObj);
                            }
                        }else{
                            self.handlerResp(rspObj);
                        }

                    };
                    // 监听Socket的关闭
                    self.webSocket.onclose = function (event) {
                        console.log('Client notified socket has closed', event);
                    };
                };
                // 错误监听
                self.webSocket.onerror = function (event) {
                    self.webSocket_is_open = 0;
                    console.log('websocket init failed');
                    console.log('菜鸟云插件初始化失败! ');
                };

            }

        },
        //电子面单打印事件
        doPrint: function () {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var self = this;
            var waybillData = self.waybillData;
            var request = getCainiaoReqObj("print");
            request.task = {};
            request.task.taskID = getUUID(8, 10);
            request.task.preview = Boolean(waybillData.preview);
            request.task.previewType = "image";
            request.task.printer = self.printerInfo.defaultPrinter;
            request.task.notifyMode = "allInOne";

            var printData = waybillData.printData.waybills;
            var userTemplateCells = waybillData.printData.userTemplateCells;
            var documents = [];
            for (var i = 0; i < printData.length; i++) {
                var doc = {};
                doc.documentID = printData[i].expressNo;
                doc.contents = [];

                //是否模板是预览，模板页面的预览数据为自己拼接的obj否则为后台请求的json
                if(self.waybillData.type){
                    var cont = $.parseJSON(printData[i].printData);
                }else{
                    var cont = printData[i].printData;
                }

                //替换自定义区数据
                var customArea ={};
                var Package;
                customArea.templateURL = printData[i].customAreaUrl;

                if(waybillData.type ==1){
                    angular.forEach(waybillData.callbackParam.normalPackageList,function(normalPackage){
                        if(normalPackage.expressNo == printData[i].expressNo){
                            Package = normalPackage;
                        }
                    });
                }
                if(waybillData.type ==2){
                    angular.forEach(waybillData.callbackParam,function(freePackage){
                        if(freePackage.expressNo == printData[i].expressNo){
                            Package = freePackage;
                        }
                    });
                }
                if(Package){
                    code.createCellValue(userTemplateCells, Package, waybillData.baseData,waybillData.type);
                }

                customArea.data = {};
                angular.forEach(userTemplateCells,function(Cell){
                    customArea.data[Cell.entryCode] = Cell.entryContent;
                });

                doc.contents.push(cont);
                doc.contents.push(customArea);

                documents.push(doc);


            }
            request.task.documents = documents;
            self.webSocket.send(JSON.stringify(request));
            self.deferred = deferred;
            waybillData.scope.message = '获取打印数据中。。';
            waybillData.scope.loading = promise;
        },

        /**批量打印快递单
         * preview:是否为预览
         * NormalPackages 选择的包裹数据
         * printer:打印机名称
         * baseData
         * 1、userExpressTemp:模板对象需包含模板ID快递公司ID{userExpressId: ,id: }两个属性
         * 2、defaultReceiptAddress：寄件人信息
         */
        printExpress: function (preview, baseData, callbackFunc, callbackParam, NormalPackages, type) {

            //检查打印控件
            if (isCLodopInstalled()) {
                doBatchPrint(preview, baseData, NormalPackages, callbackFunc, callbackParam, type);    //开始打印

            }
        }
        ,
        /**批量打印发货单
         * preview:是否为预览
         * NormalPackages 选择的包裹数据
         * printer:打印机名称
         * userExpressTemp:模板对象需包含模板ID快递公司ID{userExpressId: ,id: }两个属性
         * callbackFunc 打印完后的回调函数
         * callbackParam 打印完后的回调参数
         */
        printDelivery: function (preview, baseData, callbackFunc, callbackParam, NormalPackages, domElement, templateId) {
            //检查打印控件
            if (isCLodopInstalled()) {
                getDeliveryTemplate(templateId, NormalPackages).then(function (deliveryTemplate) {
                    var templateScope = compileDeliveryTemplate(domElement, deliveryTemplate);
                    $q.when({
                        preview: preview,
                        type: 2,
                        template: deliveryTemplate.userDeliveryTemplate
                    }, choosePrinter).then(function (printerName) {
                        doBatchDelivery(preview, baseData, printerName, NormalPackages, callbackFunc, callbackParam, templateScope);
                    })

                });
            }
        }
        ,
        /**云打印电子面单
         * type:1为连打发货
         * type:2为自由打印发货
         * type:undefined为模板页面预览发货
         * */
        printWaybill: function (preview, baseData, printData, callbackFunc, callbackParam,type,scope) {
            var self = this;
            self.waybillData = {
                preview:preview,
                baseData:baseData,
                printData:printData,
                callbackFunc:callbackFunc,
                callbackParam:callbackParam,
                type:type,
                scope:scope
            };

            //检查云打印控件是否安装
            if(!self.webSocket_is_open){
                //提示未安装控件
                var mes = {
                    windowTitle: '系统提示',
                    title: '请下载并安装菜鸟云打印组件，否则会导致电子面单无法打印',
                    content: '1、在打印和预览快递单与发货时，都需要打印控件的支持，因此请先点击下载' +
                    '打印控件并进行安装。安装后请启动运行控件。下载或安装遇到问题请' +
                    '联系我们在线客服！' +
                    '<br>2. 下载安装后请让此控件随机启动运行，否则系统会一直提示下载安装；若已下载并安装过，请确认此插件是否已启动。' +
                    '<br><a class="text-warning" href="http://cdn-cloudprint.cainiao.com/waybill-print/client/CNPrintSetup.exe" target="_self">下载控件</a>',
                    img: "images/components/alert/alert-forbid.png",
                    size: "lg",
                    showClose: false,
                    showCancel: false
                };
                $win.confirm(mes);
            }else{
                //
                if(self.waybillData.printData){
                    var waybillData = self.waybillData;
                    var templateData = waybillData.baseData.userExpressTemp;
                    var matchPrint = false;
                    //设置打印机配置项
                    var ConfigJson = getCainiaoReqObj("setPrinterConfig");
                    var printerConfig = {
                        "needTopLogo":Boolean(templateData.printTopLogo),
                        "needBottomLogo":Boolean(templateData.printBottomLogo),
                        "horizontalOffset":1,
                        "verticalOffset":2,
                        "paperSize":{
                            "width":100,
                            "height":180
                        }
                    };

                    // 设置打印模版的宽高
                    if (parseInt(templateData.width) && parseInt(templateData.height)) {
                        printerConfig.paperSize = {
                            "width": parseFloat(templateData.width),
                            "height": parseFloat(templateData.height)
                        };
                        // 只有在宽高有效的情况下才可以设置偏移
                        printerConfig.horizontalOffset = parseFloat(templateData.calibrationX);
                        printerConfig.verticalOffset = parseFloat(templateData.calibrationY);
                    }


                    //判断是否有绑定打印机，绑定的是否存在，若存在则不用选择
                    if(templateData.printerKey!=''){
                        angular.forEach(self.printerInfo.printers, function (printerInfo) {
                            //锁定的打印机匹配
                            if ( printerInfo.name == templateData.printerKey) {
                                matchPrint = true;
                            }
                        });
                    }
                    if(matchPrint){
                        printerConfig.name = templateData.printerKey;
                        self.printerInfo.defaultPrinter = templateData.printerKey;
                        ConfigJson.printer = printerConfig;
                        //设置打印机配置项
                        self.webSocket.send(JSON.stringify(ConfigJson));
                        //打印
                        self.doPrint();
                    }else{
                        //选择打印机
                        var choosePrint = $modal.open({
                            templateUrl: "views/pages/waybillPrint.html",
                            controller: "waybillPrintCtrl",
                            resolve: {
                                data: function () {
                                    return {
                                        printerInfo:self.printerInfo,
                                        templateData:templateData
                                    };
                                }
                            }
                        });
                        choosePrint.result.then (function (printer) {

                            printerConfig.name = printer;
                            self.printerInfo.defaultPrinter = printer;

                            ConfigJson.printer = printerConfig;
                            //设置打印机配置项
                            self.webSocket.send(JSON.stringify(ConfigJson));


                            //打印
                            self.doPrint();
                        });
                    }

                }
            }

        }
    };
    return $dpPrint;
}])
;
