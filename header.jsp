<%@ page pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<div class="header">
    <div class="header-inner">
        <div class="header-top">
            <div class="pull-left">
                <span class="username text-overflow"><strong>Hi,</strong>${user.username}</span>,
                <a class="btn-exit" href="//cx.cuxiao.quannengzhanggui.net/seller/authorize/reAuthorize">退出</a>
            </div>
            <div class="pull-right">
                <%--<span>${software_ch_version}</span>--%>
                <% if (request.getAttribute("software_ch_version").equals("初级版")) { %>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/cms.html?module=all_module&file=version_compare"
                   class="version low"><%--${software_ch_version}--%></a>
                <% } else if (request.getAttribute("software_ch_version").equals("高级版")) { %>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/cms.html?module=all_module&file=version_compare"
                   class="version middle"><%--${software_ch_version}--%></a>
                <% } else {%>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/cms.html?module=all_module&file=version_compare"
                   class="version high"><%--${software_ch_version}--%></a>
                <% } %>
                <span class="out-date">剩余 <strong class="day text-danger">${deadlineDay}</strong>天 <i class="space"></i>
                <a id="headerRenew" class="btn-3d" data-toggle="modal" data-target="#globalNoticeModal"
                   target="_blank">续费/升级</a>
                </span>
                <span class="split">|</span>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/cms.html?module=all_module&file=version_compare">版本对比</a>
                <span class="split">|</span>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/cms.html?module=all_module&file=comingsoon#/">即将上线功能</a>
                <span class="split">|</span>
                <a target="_blank"
                   href="//cx.cuxiao.quannengzhanggui.net/static/seller/activity">邀请返现</a>
                <span class="split">|</span>
                <span class="msg-rest-number"> 短信余额：
                    <strong class="count text-danger" onclick="SMSTopUp()">
                        <span id="totalSmsCount">${messageAccount.totalSmsCount}</span>
                    </strong>条
                    <i class="space"></i>
                    <a class="btn-3d rechage"
                       href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/SMSTopUp"
                       target="_blank">短信充值</a>
                </span>

            </div>
        </div>
        <div class="header-nav">
            <%--logo--%>
            <div class="logo-wrap">
                <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/homePage.html#">
                    <div class="logo pull-left font-color-white">
                        <%--<div class="img"></div>--%>
                        <span class="logo-name"
                              style="font-size: 24px;font-weight: bold;font-family: 'Microsoft Yahei', 'Helvetica Neue', Helvetica, Arial, sans-serif;">全能掌柜</span>
                        <img class="logo-icon"
                             src="https://wxllb.image.alimmdn.com/qnzg_material/54c863c9-9b8d-4cca-ad66-519d88b4e5c0">
                    </div>
                </a>

            </div>
            <ul class="nav navbar-nav main-nav" id="mainNav">
                <li class="msg-rest">
                    <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/homePage.html#/">首页</a>
                </li>
                <li class="msg-rest ">
                    <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/promotionHomePage"
                       data-key="tool">促销工具</a>

                    <div class="menu-select-dropdown " style="width:298px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    店铺促销
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/promotionList">活动列表</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/discount/discountEdit?type=100">限时折扣</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/dctStepPrice/dctStepPriceEdit?type=103">时间阶梯</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/discount/discountEdit?type=101">首件优惠</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/discount/discountEdit?type=102">限时限购</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/reward/rewardEdit?type=7">满减优惠/包邮</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    其他
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/couponEdit">优惠券</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/promotionSearch">宝贝活动查询</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/tool/activityApply">官方活动报名</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/activity">邀请返现</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/dashBoard"
                       data-key="wireless">无线互动</a>
                    <img style="position:absolute;top:-16px;left:32px;z-index:100;"
                         src="https://wxllb.image.alimmdn.com/qnzg_material/5133c09e-6945-462d-899a-1ede3c78de3f">
                    <div class="menu-select-dropdown " style="width:250px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    无线活动
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/homePageRed">首页红包</a>
                                    </li>
                                    <%--<li class="menu-dropdown-item hot-sign">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/giftCollection">收藏有礼</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/giftFollow">关注有礼</a>
                                    </li>--%>
                                    <li class="menu-dropdown-item ">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/createSignin">签到有礼</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/lottery">幸运大抽奖</a>
                                    </li>
                                    <%--<li class="menu-dropdown-item">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/giftPlus">加购有礼</a>
                                    </li>--%>

                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    无线管理
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/prizeManage">奖品管理</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/scoreRecord">积分管理</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//wx.cuxiao.quannengzhanggui.net/static/seller/index.html#/wireless/memberManage">粉丝管理</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialPublish"
                       data-key="material">素材模板</a>

                    <div class="menu-select-dropdown " style="width:250px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    活动素材
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialList?type=relatedList">关联推荐</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialList?type=groupPurchase">团购模板</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialList?type=tieInPlan">搭配套餐</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialIcon?type=materialIcon">主图图标</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/createTemplate">精选评价</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/createSizeTemplate">尺寸模板</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    活动海报
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/materialPoster?type=materialPoster">海报详情</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/mobilePoster?type=mobilePoster">手机海报</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/material/customPoster?custom=poster">自定义投放</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemManage"
                       data-key="treasure">商品管理</a>

                    <div class="menu-select-dropdown " style="width:266px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    宝贝管理
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemManage">宝贝列表</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/showcase">自动橱窗</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/relistAuto?type=relistAuto">自动上下架</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/wapDesc">手机详情</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/quantityItem">自动补库存</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/replicatingBaby">复制宝贝</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    宝贝修改
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemModifyPrice?type=price">修改价格</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemModifyTitle?type=title">修改标题</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemModifySubTitle?type=subTitle">修改卖点</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemModifyQuantity?type=quantity">修改库存</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//cx.cuxiao.quannengzhanggui.net/static/seller/index.html#/treasure/itemModifyOther?type=other">其他修改</a>
                                    </li>

                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/autoRate"
                       data-key="afterSales">评价管理</a>

                    <div class="menu-select-dropdown " style="width:273px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    评价管理
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/autoRate">自动评价</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/quickRate">一键评价</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/manualRate">手工评价</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/shopRateStat">评价监控</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/autoRateRecord">评价操作记录</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    差评师拦截
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/afterSales/tradeRateList">中差评处理</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/remindSellerInform">中差评提醒</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/wangWangBlacklist">黑白名单管理</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/orderIntercept/rateDefense"
                       data-key="orderIntercept">订单拦截</a>
                    <img style="position:absolute;top:-10px;left:32px;z-index:100;"
                         src="https://wxllb.image.alimmdn.com/qnzg_material/5a0eca16-1b89-479f-8a1c-e5e19cac5e23">
                </li>
                <li class="msg-rest">
                    <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/unprintedExpress"
                       data-key="print">打单发货</a>

                    <div class="menu-select-dropdown " style="width:256px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    打单发货
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/unprintedExpress">连打发货</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/freeprint">自由打印</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/preparingBillForm">打印备货单</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    其他工具
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/baseSetting">打印设置</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/waybillReport">辅助工具</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/tradeData">历史订单查询</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/orderCreateInform"
                       data-key="concern">客户关怀</a>

                    <div class="menu-select-dropdown four-ranks">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    催付
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/nonPaymentInform">下单后催付</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/jhsNonPaymentInform">聚划算催付</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/presellFrontNopaidInform">预售催订金</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/againNonPaymentInform">关闭前催付</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    物流
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliverGoodsInform">发货提醒</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/sendCity">同城到达</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/deliveryInform">派件提醒</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    到货
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/signInInform">包裹签收</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/affirmGoodsInform">回款答谢</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    关怀
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/orderCreateInform">下单关怀</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/paymentInform">日常付款</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/presellFrontPaidInform">预售付订金</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/concern/presellFinalPaidInform">预售付尾款</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/basicMarketing"
                       data-key="marketing">会员营销</a>

                    <div class="menu-select-dropdown " style="width:288px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    短信营销
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/basicMarketing">群发短信</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/uploadGroupMarketing">指定号码发送</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/continuousMarketing">二次营销</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/unionMarketing/unionInfoEdit?menu=true">跨店营销</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    会员管理
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/membersList">店铺会员资料</a>
                                    </li>
                                    <li class="menu-dropdown-item">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/marketing/dynamicGroupMember?groupType=1">会员分组</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="msg-rest">
                    <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/SMSTopUp"
                       data-key="setting">系统设置</a>

                    <div class="menu-select-dropdown " style="width:288px;">
                        <ul class="menu-drop-list">
                            <li class="menu-item-group">
                                <div class="title">
                                    短信
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/SMSTopUp">套餐列表</a>
                                    </li>
                                    <li class="menu-dropdown-item ">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/purchaseOrderList">充值记录</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/sendSMSStatistics">发送统计</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/SMSSendLog">发送记录</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="menu-item-group">
                                <div class="title">
                                    安全中心
                                    <div class="underline"></div>
                                </div>
                                <ul>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/safetyWarning">系统安全预警</a>
                                    </li>
                                    <li class="menu-dropdown-item hot-sign">
                                        <a href="//yx.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/setting/childrenPermissions">子账号权限</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
            <div class="shop-center pull-right">
                <span class="main-shop-name text-overflow">${shop.name}</span>

                <div class="header-drop-down ">
                    <div class="drop-down-inner">
                        <div class="no-shop">实现电子面单共享与不同店铺自由切换，降低成本提高效率</div>
                        <ul class="shop-list">
                            <c:if test="${not empty shops}">
                                <c:forEach var="shop" items="${shops}" varStatus="status">
                                    <li class="shop">
                                        <input type="hidden" value="${shop.shopId}">
                                        <c:if test="${shop.type == 'B'}">
                                            <span class="shop-icon tmll"></span>
                                        </c:if>
                                        <c:if test="${shop.type == 'C'}">
                                            <span class="shop-icon taobao"></span>
                                        </c:if>
                                        <span class="shop-name">${shop.shopNick}</span>
                                    </li>

                                </c:forEach>
                            </c:if>
                        </ul>
                        <div class="btn-add-shop">
                            <a href="//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/bindShop">
                                <div class="icon"></div>
                                &nbsp;
                                <span class="text">添加绑定店铺</span>
                            </a>
                        </div>
                        <div class="split"></div>
                        <ul class="link-list clearfix">
                            <li data-title="淘宝卖家中心" data-left="31"><a target="_blank"
                                                                      href="//myseller.taobao.com/seller_admin.htm"
                                                                      class="icon icon1"></a></li>
                            <li data-title="店铺首页" data-left="81"><a target="_blank"
                                                                    href="//shop${shop.outerShopId}.taobao.com/"
                                                                    class="icon icon2"></a></li>
                            <li data-title="最低折扣设置" data-left="131"><a target="_blank"
                                                                       href="//smf.taobao.com/index.htm?&menu=activity&module=rmgj"
                                                                       class="icon icon3"></a></li>
                            <li data-title="子账号管理" data-left="181"><a target="_blank"
                                                                      href="//zizhanghao.taobao.com/subaccount/myself/subaccountAuthFinal.htm"
                                                                      class="icon icon4"></a></li>
                        </ul>
                        <div class="link-tip">
                            <i class="arrow"></i>
                            <span class="text"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>