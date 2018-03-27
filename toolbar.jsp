<%@ page pageEncoding="UTF-8" %>
<div class="smart-ui-bar">
    <div class="ui-bar-inner">
        <div class="side-adv" id="sideAdv">
        </div>
        <ul class="quick-link-list">
            <li class="link server-center">
                <div class="normal">
                    <div class="icon icon1"></div>
                </div>
                <div class="dropdown  ">
                    <ul class="dropdown-item-list">
                        <%--在线客服--%>
                        <li class="dropdown-item">
                            <div class="item-title">在线客服</div>
                            <div class="item-detail">
                                <span class="detail-name">售后服务:</span>
                                <a target="_blank" href="http://www.taobao.com/webww/ww.php?ver=3&touid=%E5%85%A8%E8%83%BD%E5%B0%8F%E7%A7%98%E6%9C%8D%E5%8A%A1%E4%B8%AD%E5%BF%83
&siteid=cntaobao&status=1&charset=utf-8"><img border="0" src="http://amos.alicdn.com/online.aw?v=2&uid=%E5%85%A8%E8%83%BD%E5%B0%8F%E7%A7%98%E6%9C%8D%E5%8A%A1%E4%B8%AD%E5%BF%83
&site=cntaobao&s=1&charset=utf-8" alt="点这里给我发消息" /></a>
                            </div>
                            <div class="item-detail">
                                <span class="detail-name">其他途径:</span>
                                微信 13738045147
                            </div>
                        </li>
                        <%--联系方式--%>
                        <li class="dropdown-item">
                            <div class="item-title">联系方式</div>
                            <div class="item-detail">
                                <span class="detail-name">电话号码:</span>
                                <span class="text-block">137-3804-5147</span>
                            </div>
                        </li>
                        <%--工作时间--%>
                        <li class="dropdown-item">
                            <div class="item-title">工作时间</div>
                            <div class="item-detail">
                                <span class="detail-name">周一至周日:</span>
                                <span class="text-block">9:00-23:00</span>
                            </div>
                        </li>
                        <%--使用建议--%>
                        <li class="dropdown-item">
                            <div class="item-title">使用建议</div>
                            <div class="item-detail">
                                <span class="detail-name">使用建议:</span>
                                微信 13738045147
                            </div>
                        </li>
                    </ul>
                </div>
            </li>
            <li class="link ">
                <a href="//mygod.cuxiao.quannengzhanggui.net/static/common/index.html#/" target="_blank">
                    <div class="normal">
                        <div class="icon icon2"></div>
                    </div>
                    <span class="tip">帮助文档</span>
                </a>
            </li>
            <li class="link broadcast">
                <div class="normal">
                    <div class="icon icon3"></div>
                    <% if ((Long) request.getAttribute("notificationNum") > 0) { %>
                    <i class="badge">${notificationNum}</i>
                    <% } %>
                </div>
                <span class="tip">重要提醒</span>
            </li>
        </ul>
        <ul class="action-list">
            <li class="action common-operations">
                <div class="normal">
                    <div class="icon icon4"></div>
                </div>
                <div class="dropdown">
                    <div class="dropdown-header clear">
                        <span class="title">常用操作</span>

                        <div class="setting" id="btnCustomSettingToolbar">
                            <span class="icon icon6"></span>
                            <span class="text">设置</span>
                        </div>
                    </div>
                    <ul class="action-menu clear" id="favouriteListToolbar">

                    </ul>
                </div>
            </li>
            <li class="action" id="backToTop">
                <div class="normal">
                    <div class="icon icon5"></div>
                </div>
                <span class="tip">回到顶部</span>
            </li>
        </ul>
    </div>
</div>