window.MENU_DATA = [
    {
        "key": "print",
        "title": "打印发货",
        "children": [
            {
                "key": "print",
                "title": "连打发货",
                "children": [
                    {
                        "param": {},
                        "key": "unprintedExpress",
                        "title": "连打发货",
                        "url": "#/print/unprintedExpress"
                    }
                ]
            },
            {
                "key": "print",
                "title": "打印备货单",
                "children": [
                    {
                        "param": {},
                        "key": "preparingBillForm",
                        "title": "生成备货单",
                        "url": "#/print/preparingBillForm"
                    },
                    {
                        "param": {},
                        "key": ["preparingBill", "preparingBillDetail"],
                        "title": "备货单列表",
                        "url": "#/print/preparingBill"
                    }
                ]
            },
            {
                "key": "print",
                "title": "自由打印",
                "children": [
                    {
                        "param": {},
                        "key": "freeprint",
                        "title": "录入/打印",
                        "url": "#/print/freeprint"
                    },
                    {
                        "param": {},
                        "key": "freeUnprintedExpress",
                        "title": "待打印【快递单】",
                        "url": "#/print/freeUnprintedExpress"
                    },
                    {
                        "param": {},
                        "key": "freePrintedExpress",
                        "title": "已打印【快递单】",
                        "url": "#/print/freePrintedExpress"
                    }
                ]
            },
            {
                "key": "print",
                "title": "打印设置",
                "children": [
                    {
                        "param": {},
                        "key": "baseSetting",
                        "title": "基本设置",
                        "url": "#/print/baseSetting"
                    },
                    {
                        "param": {},
                        "key": "itemManage",
                        "title": "宝贝简称",
                        "url": "//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemManage",
                        "blank": true
                    },
                    {
                        "param": {},
                        "key": "userExpress",
                        "title": "快递单模板",
                        "url": "#/print/userExpress"
                    },
                    {
                        "param": {},
                        "key": "shipAddress",
                        "title": "发货地址",
                        "url": "#/print/shipAddress"
                    },
                    {
                        "param": {},
                        "key": "bindShop",
                        "title": "多店铺关联",
                        "url": "#/print/bindShop"
                    },
                    {
                        "param": {},
                        "key": "deliveryTemplate",
                        "title": "发货单模板",
                        "url": "#/print/deliveryTemplate"
                    },
                    {
                        "param": {},
                        "key": "expressCompany",
                        "title": "快递运费统计",
                        "url": "#/print/expressCompany"
                    },
                    {
                        "param": {},
                        "key": "logisticsTradeSetting",
                        "title": "订单全链路",
                        "url": "#/print/logisticsTradeSetting"
                    },
                    {
                        "param": {},
                        "key": "destinationBig",
                        "title": "目的地大字",
                        "url": "#/print/destinationBig"
                    },
                    {
                        "param": {},
                        "key": "scopeOfDeliveryCorrect",
                        "title": "派送范围纠错",
                        "url": "#/print/scopeOfDeliveryCorrect"
                    }
                ]
            },
            {
                "key": "print",
                "title": "历史订单查询",
                "children": [
                    {
                        "param": {},
                        "key": "tradeData",
                        "title": "历史订单查询",
                        "url": "#/print/tradeData"
                    }
                ]
            },
            {
                "key": "print",
                "title": "辅助工具",
                "children": [
                    {
                        "param": {},
                        "key": "waybillReport",
                        "title": "电子面单记录",
                        "url": "#/print/waybillReport"
                    },
                    {
                        "param": {},
                        "key": "cancelWaybill",
                        "title": "回收电子面单",
                        "url": "#/print/cancelWaybill"
                    }/*,
                    {
                        "param": {},
                        "key": "questionPackage",
                        "title": "问题件",
                        "url": "#/print/questionPackage"
                    }*/
                ]
            }
        ]
    }
];





