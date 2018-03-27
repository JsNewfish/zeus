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
        $scope.clipboardTradeId = clipboardTradeId;
        function clipboardTradeId(item) {
            new Clipboard('#tradeId' + item.tid,{
                text:function (target) {
                    return item.tid;
                },
                action:function (target) {
                    $win.alertSuccess("复制成功");
                    this.destroy();
                }
            });
        }

        //复制地址
        $scope.clipboardAddress = clipboardAddress;
        function clipboardAddress(item) {

            new Clipboard('#clipboardAddress' + item.alipayNo,{
                text:function (target) {
                    return item.receiverName+item.receiverMobile+item.receiverState+item.receiverCity+
                        item.receiverDistrict+item.receiverTown+item.receiverAddress;
                },
                action:function (target) {
                    $win.alertSuccess("复制成功");
                    this.destroy();
                }
            });
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
                }
            };
            $scope.loading = $restClient.post("seller/trade/search", null, obj, action);
        }

    }]);