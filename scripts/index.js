$(function () {
    var jsonPath = "scripts/json/navigationMenu.json";
    var browser = support();
    //模块
    var pageModule = null;
    var pageSubModule = null;
    //菜单
    var menu = {
        init: function (options, element) {
            var self = this;
            self.options = self.getOptions(options);
            self.data = self.options.data || [];
            self.key = self.options.key;
            self.param = self.options.param;
            self.$element = $('#' + element);
            self.render();
            self.bindEvent();
            self.isComplete = true;
        },
        getOptions: function (options) {
            var defaults = {};
            return $.extend({}, options, defaults)
        },
        render: function () {
            var self = this;
            self.$element.empty();
            $.each(self.data, function (i, item) {
                var onlyOneChild = item.children && item.children.length == 1;
                var $menuNode = self.getMenuItem(item);
                var $subMenu = onlyOneChild ? null : self.getSubMenu(item);
                //如果存在当前选择，则展开子菜单
                if (!onlyOneChild) {
                    $subMenu.find(".sub-menu-item.active").length > 0 && $menuNode.addClass("opened");
                } else {
                    self.isCurrent(item.children[0].key, item.children[0].param) && $menuNode.addClass("active");
                }
                self.$element.append(onlyOneChild ? $menuNode : $menuNode.append($subMenu))
            });
        },
        isCurrent: function (keys, params) {
            var self = this;
            var keyResult = false;
            var paramResult = false;
            if (keys instanceof Array) {
                $.each(keys, function (i, key) {
                    if (self.key && key.toString().toLowerCase() == self.key.toLowerCase()) {
                        keyResult = true;
                    }
                })
            } else {
                if (self.key && keys.toString().toLowerCase() == self.key.toLowerCase()) {
                    keyResult = true;
                }
            }

            if (keyResult) {
                //有分支
                if (params) {
                    if (params.value) {
                        if (self.param) {
                            $.each(self.param, function (i, curParam) {
                                if ((params.key == curParam.key) && (params.value.toString() == curParam.value.toString())) {
                                    paramResult = true;
                                }
                            });
                        }
                    }
                    else {
                        if (self.param) {
                            var tempResult = true;
                            $.each(self.param, function (i, curParam) {
                                tempResult = tempResult && (params.key != curParam.key);
                            });
                            paramResult = tempResult;
                        } else {
                            paramResult = true;
                        }
                    }
                }
                //无分支
                else {
                    paramResult = true;
                }
            }

            return keyResult && paramResult;
        },
        getSubMenu: function (data) {
            //是否只有一个子节点
            if (data.children && data.children.length == 1) {
                return null;
            }
            var self = this;
            var $submenu = $('<div class="sub-menu"></div>');
            var hasActiveNode = false;

            $.each(data.children, function (i, item) {
                if (self.isCurrent(item.key, item.param)) {
                    var isCurItem = hasActiveNode = true;
                }
                var tpl = self.replace(item, self.getTpl("item", isCurItem));

                $submenu.append($(tpl).data(item));
            });
            return hasActiveNode ? $submenu.slideDown() : $submenu;
        },
        getMenuItem: function (data) {
            var self = this;
            var tpl = self.replace(data, self.getTpl("header", false, data.children && data.children.length == 1));
            var $tpl = $(tpl);
            if (data.children.length == 1) {
                $tpl.data(data.children[0]);
            }
            return $tpl
        },
        getTpl: function (type, isActive, onlyOneChild) {
            var tpl = "";
            switch (type) {
                case "header":
                {
                    if (onlyOneChild) {
                        tpl = '<li' +
                            ' class="menu-item can-not-expand' + (isActive ? " opened " : "") + '"' +
                            ' only-one-child="' + (onlyOneChild ? "true" : "false") + '"' +
                            '>' +
                            '<a class="title" data-key="{{key}}" href="{{url}}">{{title}}</a>' +
                            '</li>';
                    }
                    else {
                        tpl = '<li' +
                            ' class="menu-item can-expand' + (isActive ? " opened " : "") + '"' +
                            ' only-one-child="' + (onlyOneChild ? "true" : "false") + '"' +
                            '>' +
                            '<h5 class="title" data-key="{{key}}">{{title}}</h5>' +
                            '</li>';
                    }

                    break;
                }
                case   "item":
                {
                    tpl = '<li class="sub-menu-item' + (isActive ? " active " : '') + '"><a  href="{{url}}" data-key="{{key}}" {{blank}}>{{title}}</a></li>';
                }
            }
            return tpl;
        },
        replace: function (data, tpl) {
            var curData = $.extend({}, data);
            if (curData.children && curData.children.length == 1) {
                var child = curData.children[0];
                curData.url = child.url;
                curData.key = child.key;
                curData.title = child.title;
                curData.blank = child.blank;
            }
            tpl = tpl.replace("{{title}}", curData.title);
            tpl = tpl.replace("{{url}}", curData.url);
            tpl = tpl.replace("{{key}}", curData.key.toString());
            tpl = tpl.replace("{{blank}}", curData.blank ? 'target="_blank"' : '');
            return tpl;
        },
        bindEvent: function () {
            var self = this;
            //有字节点
            self.$element.find(".menu-item.can-expand .title").on("click", function (event) {
                var $this = $(this),
                    $next = $this.next();
                $next.stop().slideToggle();
                $this.parent().toggleClass("opened");
                self.$element.find(".sub-menu").not($next).stop().slideUp().parent().removeClass('opened');
            });
            //无子节点
            self.$element.find(".menu-item.can-not-expand .title").on("click", function (event) {
                self.$element.find(".sub-menu-item,.menu-item.can-not-expand").removeClass("active");
                self.$element.find(".sub-menu").stop().slideUp().parent().removeClass("opened");
                $(this).closest(".menu-item").addClass("active");
            });
            //2级节点
            self.$element.find(".sub-menu-item>a").on("click", function () {
                self.$element.find(".sub-menu-item,.menu-item.can-not-expand").removeClass("active");
                $(this).closest(".sub-menu-item").addClass("active");
            })
        },
        selectNodeByKey: function (key, param) {
            var self = this;
            if (!key) return;
            self.key = key;
            self.param = param;
            self.$element.find(".menu-item ").removeClass("opened active").find(".sub-menu-item").removeClass("active");
            $.each(self.$element.find(".sub-menu-item ,.menu-item.can-not-expand"), function (i, item) {
                var nodeKey = $(item).data().key;
                var nodeParam = $(item).data().param;
                if (self.isCurrent(nodeKey, nodeParam)) {
                    $(item).addClass("active").closest(".menu-item").addClass("opened");
                }
            })
        }
    };
    //导航
    var nav = {
        init: function (element, key) {
            var self = this;
            self.key = key;
            self.$element = $("#mainNav");
            self.$links = self.$element.find("a");
            self.render();
            self.bindEvent();
        },
        render: function () {
            var self = this;
            self.$links.parent().removeClass("active");
            if (!self.key) {
                self.$links.eq(0).addClass("active");
                return;
            }
            self.$links.each(function (i, item) {
                if ($(item).attr("data-key") == self.key) {
                    $(item).parent().addClass("active");
                }
            });
        },
        bindEvent: function () {
            var self = this;
            self.$links.on("click", function (event) {
                event.preventDefault();
                $(this).parent("li").addClass("active").siblings().removeClass("active");
                var href = event.currentTarget.href;
                var keys = getKeyFormUrl(href);
                if (keys.moduleKey != self.key) {
                    self.key = keys.moduleKey;
                    window.location.href = event.currentTarget.href;
                    if (browser.ie && browser.version <= 8) {
                        window.history.go(0);
                    }
                }
            });
        },
        selectNodeByKey: function (key) {
            var self = this;
            self.key = key;
            self.render();
        }
    };
    //初始化
    init();

    function init() {
        var key = getKeyFormUrl();
        //设置主导航
        setMainNav(key);
        //创建菜单
        createMenu(key);
        //设置头部信息
        setHeaderInfo();
        //监听路由
        listenerHash();
        //初始化侧边栏
        initSidebar();
    }

    function initSidebar() {
        $("#sidebar").on("mousewheel DOMMouseScroll", function (event) {
            var delta = (event.originalEvent.wheelDelta && (event.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 : 1));  // firefox
            var menu = $("#sidebar").find(".menu-wrap");
            var top = parseInt(menu.css("top").match(/[-]?\d+/));
            var wh = $(window).height();
            var mh = menu.height();
            var limit;
            event.preventDefault();

            if (delta > 0) {
                //鼠标向下滚
                if (top < 70) {
                    menu.css("top", (top + 10) + "px")
                }
            } else if (delta < 0) {
                //鼠标向上滚
                if (top > (wh - mh - 120 )) {
                    menu.css("top", (top - 10) + "px")
                }
            }
        });
    }

    function setMainNav(key) {
        nav.init("mainNav", key.moduleKey)
    }

    function listenerHash() {
        var handler = function (event) {
            var oldUrl = $("<a></a>").attr("href", event.oldURL).get(0);
            var newUrl = $("<a></a>").attr("href", event.newUrl).get(0);
            var oldKey = getKeyFormUrl(oldUrl.hash);
            var newKey = getKeyFormUrl(newUrl.hash);

            //模块不同，则加载新菜单
            if (oldKey.moduleKey != newKey.moduleKey) {
                nav.selectNodeByKey(newKey.moduleKey);
                createMenu(newKey);
            }
            //选择节点
            else {
                menu.selectNodeByKey(newKey.subModuleKey, newKey.param);
            }
        };

        if (window.addEventListener) {
            window.addEventListener("hashchange", handler);
        }
        else if (window.attachEvent) {
            window.attachEvent("onhashchange", handler);
        }
    }

    function getKeyFormUrl(url) {
        var defaultKeys = {
            moduleKey: "homePage",
            subModuleKey: "workplace",
            params: null
        };
        var link = $("<a></a>").attr("href", url || window.location.href).get(0);
        var urlHash = link.hash.substr(1),
            split = urlHash.split("?"),
            searchStr = split[1],
            pathStr = split[0].substr(1);
        //路径节点
        var pathNode = pathStr ? pathStr.split("/") : [];
        var search = [];
        //是否带参数
        if (searchStr) {
            var searchArray = searchStr.split("&");
            $.each(searchArray, function (i, item) {
                var array = item.split("=");
                search.push({
                    key: array[0],
                    value: array[1]
                })
            });
        }

        return {
            moduleKey: pathNode[0] || null,
            subModuleKey: pathNode[1] || null,
            param: search.length > 0 ? search : null
        }
    }

    function createMenu(key) {
        $.ajax({
            method: 'get',
            url: jsonPath,
            dataType: "json",
            success: function (data) {
                menu.init({
                    data: data[key.moduleKey],
                    key: key.subModuleKey,
                    param: key.param
                }, "left-navigation")
            }
        })
    }

    //设置头部信息
    function setHeaderInfo() {

    }

    //获取浏览器兼容
    function support() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

        if (Sys.ie) {
            Sys.version = parseInt((/msie (\d+)/.exec(ua.toLowerCase()) || [])[1]);
            if (isNaN(Sys.version)) {
                Sys.version = parseInt((/trident\/.*; rv:(\d+)/.exec(ua.toLowerCase()) || [])[1]);
            }
        }

        return Sys;
    }
});





