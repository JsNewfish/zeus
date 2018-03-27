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