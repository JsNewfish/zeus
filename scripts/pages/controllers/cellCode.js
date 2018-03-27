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