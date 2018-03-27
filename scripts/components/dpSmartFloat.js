/**
 * Created by Jin on 2016/9/23.
 */
/*app.directive("dpSmartFloat", ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        link: function (scope, element, attr) {
            var DEFAULTS = {
                type: 'top',
                distance: 0
            };
            var options;
            var windowHeight = $(window).height();
            //获取参数配置项
            scope.$watchCollection(attr.dpSmartFloat, function (option) {
                if (angular.isObject(option)) {
                    options = angular.extend(angular.copy(DEFAULTS), option);
                } else {
                    throw new Error('Invalid value for smart-float. smart-float only accepts object params.');
                }
            }, true);
            function position() {
                var elementWidth = element.outerWidth();
                var elementHeight = element.outerHeight();
                var referElement = element.parent();//参照元素
                var referPos = referElement.offset().top + elementHeight;//参照距离
                referElement.css('height', elementHeight + 'px');
                referElement.css('width', elementWidth + 'px');
                var scrollTop = $(this).scrollTop();
                if (options.type == 'top') {
                    if (scrollTop > referPos) {
                        element.addClass("smart-float-top");
                        element.css({
                            position: 'fixed',
                            top: options.distance + 'px',
                            width: elementWidth,
                            'z-index': '100'
                        });
                    } else {
                        element.removeClass("smart-float-top");
                        element.css({
                            position: 'static'
                        });
                    }
                }
                if (options.type == 'bottom') {
                    //超出一屏可视区大小&&未滚动到最底部一屏
                    if ((windowHeight < referElement.offset().top) && ((scrollTop + windowHeight) < referPos)) {
                        element.addClass("smart-float-bottom");
                        element.css({
                            position: 'fixed',
                            /!*top: windowHeight - elementHeight + 'px',*!/
                            bottom: 0,
                            width: elementWidth,
                            'z-index': '100'
                        });
                    } else {
                        element.removeClass("smart-float-bottom");
                        element.css({
                            position: 'static'
                        });
                    }
                }


            }

            $timeout(function () {
                $(window).scroll(position);
            }, 800);
            //页面Dom加载完毕，否则高度取不准

            $(window).load(function(){
                $(window).resize(function () {
                    windowHeight = $(window).height();
                    position();
                });
            });

            //观察Dom元素变化时
            var ob = new MutationObserver(function(){
                windowHeight = $(window).height();
                position();
            });

            ob.observe(document,{
                childList:true,
                subtree:true
            });


        }
    }
}]);

$.fn.smartFloat = function () {
    var position = function (element) {
        var elementHeight = element.height();
        var elementWidth = element.width();
        var referElement = element.parent();   //参照元素

        referElement.css('height', elementHeight + 'px');
        referElement.css('width', elementWidth + 'px');
        var referPos = referElement.position().top + elementHeight;      //参照距离

        $(window).scroll(function () {

            var scrollTop = $(this).scrollTop();
            if (scrollTop > referPos) {
                element.css({
                    position: 'fixed',
                    top: '70px',
                    width: elementWidth,
                    'z-index': '100'
                });
            } else {
                element.css({
                    position: 'inherit'
                });
            }

        })

    };
    return $(this).each(function () {
        position($(this));
    })
};*/
app.directive("dyName", [

    function() {
        return {
            require: "ngModel",
            link: function(scope, elm, iAttrs, ngModelCtr) {
                ngModelCtr.$name = iAttrs.dyName;
                elm.attr('name', iAttrs.dyName);
                var formController = elm.controller('form') || {
                        $addControl: angular.noop
                    };
                formController.$addControl(ngModelCtr);

                scope.$on('$destroy', function() {
                    formController.$removeControl(ngModelCtr);
                });

            }
        };
    }
]);
//鼠标移开事件
app.directive('onBlur',[function(){
    return{
        link:function(scope,element,attr,Ctrl){
            element.blur(function(){
                scope.smart = false;
            })
        }
    }
}]);
//展开详细时增加class
app.directive('toggleExpand',[function(){
    return {
        link:function(scope,element,attr,ctrl) {

            var $btn =element.find('.dLabel');
            $btn.bind('click',function(){
                element.toggleClass('expanded');
            })

        }
    }
}]);
//收起、展开
app.directive("dpCollapse", function () {
    return {
        restrict: "EA",
        link: function (scope, element, attr) {
            var $btn = element.find(".btn-toggle"),
                $collapseTarget = element.parent().find(".entry-list");

            $btn.bind("click", function () {
                $btn.html($collapseTarget.hasClass("collapse") ? "<i class='glyphicon glyphicon-minus'></i> 收起" : "<i class='glyphicon glyphicon-plus'></i> 展开");
                $collapseTarget.toggleClass("collapse");
            });
        }
    }
});