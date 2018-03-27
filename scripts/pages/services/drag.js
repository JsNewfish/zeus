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