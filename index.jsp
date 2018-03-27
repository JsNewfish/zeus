<%@ page import="com.dustpan.venus.common.domain.ShopInfo" %>
<%@ page pageEncoding="UTF-8" %>
<!doctype html>
<html class="no-js">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="edge"/>
    <title>全能掌柜</title>
    <link rel="icon" href="images/pages/icon.ico" type="image/x-icon"/>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet"
          href="//st.cuxiao.quannengzhanggui.net/static/cdist/styles/bootstrap/css/bootstrap.css?v=${build_version}">
    <link rel="stylesheet"
          href="//st.cuxiao.quannengzhanggui.net/static/cdist/styles/thirdparty/animation.css?v=${build_version}"/>
    <link rel="stylesheet" href="common/styles/bootstrap-extend.css?v=${build_version}">
    <link rel="stylesheet" href="//st.cuxiao.quannengzhanggui.net/static/cdist/styles/common.css?v=${build_version}">
    <link rel="stylesheet" href="styles/main.css?v=${build_version}">
</head>
<body>
<!--[if lt IE 8]>
<p class="browsehappy" 对不起您的浏览器版本太低，请升级您的浏览器到更高的版本</p>
<![endif]-->
<!-- Add your site or application content here -->
<script type="text/javascript">
    var VENUS_SHOP = JSON.parse('${shop_json_str}'),BROADCAST_POP_UP,BROADCAST_TOOLBAR_TIP,VENUS_SHOP_INFO;
    <% if (request.getAttribute("popup") != null) { %>
    BROADCAST_POP_UP=JSON.parse('${popup}');
    <% } %>
    <% if (request.getAttribute("toolbarTip") != null) { %>
    BROADCAST_TOOLBAR_TIP=JSON.parse('${toolbarTip}');
    <% } %>
    <% if (request.getAttribute("shopInfo") != null) { %>
    VENUS_SHOP_INFO=JSON.parse('${shopInfo}');
    <% } %>
</script>
<div class="frame">
    <jsp:include page="header.jsp"/>
    <div class="body">
        <div class="main" id="ng-app" ng-app="app">
            <% if ((Boolean) request.getAttribute("software_need_renew")) { %>
            <div class="global-notice-bar text-center  bg-warning text-warning" style="padding:10px;">
                亲，您当前的版本还有<span class="text-success">${software_expire_day}</span>天过期，为了确保不影响您的使用请尽快续订！
                <strong class="text-info cursor-hand" data-toggle="modal" data-target="#globalNoticeModal">立即续订</strong>
            </div>
            <% } %>
            <div ng-controller="indexCtrl">
                <div ui-view></div>
            </div>
        </div>
        <div class="sidebar" id="sidebar">
            <div class="menu-wrap list-unstyled">
                <div class="menu" id="left-navigation">
                    <!-- 侧边导航栏 插入html动态变化-->
                </div>
            </div>
        </div>
    </div>
    <jsp:include page="footer.jsp"/>
    <jsp:include page="toolbar.jsp"/>
    <%--到期通知Modal--%>
    <div class="modal fade" id="globalNoticeModal">
        <div class="modal-dialog">
            <div class="modal-content" style="background: transparent;box-shadow:none;">
                ${software_renew_content}
            </div>
        </div>
    </div>
    <%--版本提示Modal--%>
    <div class="modal fade" id="globalVersionModal">
        <div class="modal-dialog">
            <div class="modal-content" style="background: transparent">
                <div>${software_upgrade_content}</div>
            </div>
        </div>
    </div>
    <%--常用模块设置Modal--%>
    <div class="modal fade modal-favourite" id="modalFavourite">
        <div class="modal-dialog  modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">自定义设置</h4>
                </div>
                <div class="modal-body">
                    <ul class="category-list clearfix" id="categoryList">
                        <%-- <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>
                         <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>
                         <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>
                         <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>
                         <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>
                         <li>
                             <div class="category-name">促销</div>
                             <ul class="function-list">
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                                 <li>
                                     <div class="checkbox">
                                         <label for="function_0">
                                             <input type="checkbox" id="function_0"/>
                                             店铺工具
                                         </label>
                                     </div>
                                 </li>
                             </ul>
                         </li>--%>
                    </ul>

                </div>
                <div class="modal-footer">
                    <div class="tip pull-left">最多可选<span class="max">12</span>项：<span
                            class="current text-warning">12 </span>/ 12
                    </div>
                    <button class="btn btn-base" id="btnSaveCustomSetting">保存</button>
                    <button class="btn btn-default" data-dismiss="modal">取消</button>
                </div>
            </div>
        </div>
    </div>
    <%--轻提示--%>
    <div class="alert alert-fixed alert-warning" id="alert" style="top:0;display:none" role="alert">
        <button type="button" class="close">
            <span aria-hidden="true">&times;</span>
            <span class="sr-only">Close</span>
        </button>
        <div class="content">

        </div>
    </div>
    <%--广告提示Modal--%>
    <div class="modal fade" id="globalAdvModal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="background: transparent;box-shadow:none;">

            </div>
        </div>
    </div>
    <%--系统广播通知Modal--%>
    <div class="modal fade modal-boardcast" id="globalBroadcastModal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" >
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">消息通知</h4>
                </div>
                <div class="modal-body">
                    <div class="category-box">
                        <ul class="category-list">
                        </ul>
                    </div>
                    <div class="item-box">
                        <ul class="item-list">
                        </ul>
                    </div>
                    <div class="paging-wrap">

                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!--common-->
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/scripts/lib.js?v=${build_version}"></script>
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/scripts/common.js?v=${build_version}"></script>
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/scripts/datepicker/WdatePicker.js?v=${build_version}"></script>
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/scripts/kindeditor/kindeditor-all.js?v=${build_version}"></script>
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/views/templates.js?v=${build_version}"></script>

<!--end bower-->

<!--app-->
<script src="scripts/menuData.js?v=${build_version}"></script>
<script src="//st.cuxiao.quannengzhanggui.net/static/cdist/scripts/frame.js?v=${build_version}"></script>
<script src="scripts/app.js?v=${build_version}"></script>
<!--end app-->

<!--end common-->
<!--components-->
<script src="scripts/components/setupPrint.js"></script>
<script src="scripts/components/formatValue.js"></script>
<script src="scripts/components/printItemBox.js"></script>
<script src="scripts/components/getNextSid.js"></script>
<script src="scripts/components/deliveryTemplate.js"></script>
<script src="scripts/components/validateExpressNo.js"></script>
<script src="scripts/components/dpSmartFloat.js"></script>
<script src="scripts/components/jquery-ui-draggable.min.js"></script>
<script src="scripts/components/header.js"></script>
<!--end components-->
<!--pages-->
<script src="scripts/pages/controllers/indexCtrl.js"></script>
<script src="scripts/pages/controllers/deliveryTemplateCtrl.js"></script>
<script src="scripts/pages/controllers/shipAddressCtrl.js"></script>
<script src="scripts/pages/controllers/scopeOfDeliveryCorrectCtrl.js"></script>
<script src="scripts/pages/controllers/destinationBigCtrl.js"></script>
<script src="scripts/pages/controllers/logisticsTradeSettingCtrl.js"></script>
<script src="scripts/pages/controllers/baseSettingCtrl.js"></script>
<script src="scripts/pages/controllers/editExpressTemplateCtrl.js"></script>
<script src="scripts/pages/controllers/unprintedExpressCtrl.js"></script>
<script src="scripts/pages/controllers/editDeliveryTemplateCtrl.js"></script>
<script src="scripts/pages/controllers/preparingBillCtrl.js"></script>
<script src="scripts/pages/controllers/preparingBillFormCtrl.js"></script>
<script src="scripts/pages/controllers/preparingBillDetaileCtrl.js"></script>
<script src="scripts/pages/controllers/userExpressCtrl.js"></script>
<script src="scripts/pages/controllers/expressCompanyCtrl.js"></script>
<script src="scripts/pages/controllers/freeprintCtrl.js"></script>
<script src="scripts/pages/controllers/freeUnprintedExpressCtrl.js"></script>
<script src="scripts/pages/controllers/freePrintedExpressCtrl.js"></script>
<script src="scripts/pages/controllers/waybillReportCtrl.js"></script>
<script src="scripts/pages/controllers/cancelWaybillCtrl.js"></script>
<script src="scripts/pages/services/drag.js"></script>
<script src="scripts/pages/filters/filters.js"></script>
<script src="scripts/pages/services/printTemplate.js"></script>
<script src="scripts/pages/services/editTemplate.js"></script>
<script src="scripts/pages/services/getSelectAddress.js"></script>
<script src="scripts/pages/controllers/cellCode.js"></script>
<script src="scripts/pages/controllers/tradeDataCtrl.js"></script>
<script src="scripts/pages/controllers/bindShopCtrl.js"></script>
<script src="scripts/pages/controllers/questionPackageCtrl.js"></script>
<!--end pages-->
<!--plugins-->
<%--<script src="scripts/plugins/highcharts.js?v=${build_version}"></script>
<script src="scripts/plugins/map.src.js?v=${build_version}"></script>
<script src="scripts/plugins/china.js?v=${build_version}"></script>
<script src="scripts/plugins/exporting.js?v=${build_version}"></script>
<script src="scripts/plugins/jquery.form.min.js?v=${build_version}"></script>
<script src="scripts/plugins/jquery.ui.widget.js?v=${build_version}"></script>
<script src="scripts/plugins/jquery.iframe-transport.js?v=${build_version}"></script>
<script src="scripts/plugins/jquery.fileupload.js?v=${build_version}"></script>
<script src="scripts/plugins/w5cValidator.min.js"></script>--%>
<script src="scripts/plugins/jquery.qrcode.min.js"></script>
<script src="scripts/plugins/collapse.js"></script>
<script src="scripts/pages/services/localStorage.js"></script>
<script src="scripts/plugins/printLibInstall.js"></script>
<script src="scripts/plugins/jquery.form.min.js?v=${build_version}"></script>
<!--end plugins-->
</body>
</html>