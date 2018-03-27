/**
 * Created by Jin on 2016/6/6.
 */
app.directive('printItemBox', ['drag', function (drag) {
    return {
        restrict: 'AE',
        replace: 'true',
        scope: {
            remove: '&',
            entity: '='
        },
        templateUrl: 'views/components/printItemBox.html',
        link: function (scope, element, attrs, ctrl) {

            function init() {
                //取消拖拽
                $(document).on('mousedown', function (e) {                   //设置样式
                    if ($('.field').hasClass('dragged')) {
                        render(this, false);
                    }
                });

                //绑定拖拽
                $(element).on('mousedown', function (event) {
                    render(this, true);             //设置对象周围元素样式

                    drag(this, event, this.parentNode).then(cellUpdate);
                });

                scope.boxStyle = {
                    'top': scope.entity.yPosition,
                    'left': scope.entity.xPosition,
                    'width': scope.entity.width,
                    'height': scope.entity.height

                };

                scope.fontStyle = {
                    'font-size': scope.entity.fontSize,
                    'text-decoration': scope.entity.textUnderline,
                    'font-family': scope.entity.fontType,
                    'font-weight': scope.entity.fontBold,
                    'text-align': scope.entity.textAlign,
                    'font-style': scope.entity.fontItalic
                };
                scope.fontBold = scope.entity.fontBold == "bold";
                scope.fontItalic = scope.entity.fontItalic == "italic";
                scope.textUnderline = scope.entity.textUnderline == "underline";
            }



            init();

            function render(element, show) {
                var display = 'none';
                if (show) {
                    $('.field').addClass('dragged');
                    display = 'block';
                    $(element).addClass('dragging');
                    $(element).find('.edit-bar').css('display', 'inline-block');     //工具栏
                    $(element).css('z-index', 21);
                } else {
                    $('.dragging').css('z-index', 1).removeClass('dragging');
                    $('.field').removeClass('dragged');
                    $(element).find('.edit-bar').css('display', 'none');            //工具栏
                }
                $(element).find('.close').css('display', display);               //关闭按钮
                $('.shade').css('display', display);                            //遮罩
                $(element).find('i.tip').each(function (i, item) {             //初始化拖拽点
                    $(item).css('display', display);
                    var itemClass = $(item).attr('class').split(' ')[1].split('-');
                    if (itemClass.length == 2) {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css(itemClass[1], '-3.5px');
                    } else if (itemClass[0] == 'top' || itemClass[0] == 'bottom') {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css('left', '49%');
                    } else if (itemClass[0] == 'left' || itemClass[0] == 'right') {
                        $(item).css(itemClass[0], '-3.5px');
                        $(item).css('top', '45%');
                    }
                })
            }

            function cellUpdate(element) {
                scope.entity.width = $(element).css('width');
                scope.entity.height = $(element).css('height');
                scope.entity.xPosition = $(element).css('left');
                scope.entity.yPosition = $(element).css('top');
            }

            scope.setFontSize = function () {
                scope.fontStyle['font-size'] = scope.entity.fontSize;
            };

            scope.setFontType = function () {
                scope.fontStyle['font-family'] = scope.entity.fontType;
            };

            scope.setTextAlign = function () {
                scope.fontStyle['text-align'] = scope.entity.textAlign;
            };
            scope.setFontBold = function () {

                scope.entity.fontBold = scope.fontBold ? "normal" : "bold";
                scope.fontBold = !scope.fontBold;
                scope.fontStyle['font-weight'] = scope.entity.fontBold;
            };
            scope.setFontItalic = function () {

                scope.entity.fontItalic = scope.fontItalic ? "normal" : "italic";
                scope.fontItalic = !scope.fontItalic;
                scope.fontStyle['font-style'] = scope.entity.fontItalic;
            };
            scope.setTextUnderline = function () {
                scope.entity.textUnderline = scope.textUnderline ? "initial" : "underline";
                scope.textUnderline = !scope.textUnderline;
                scope.fontStyle['text-decoration'] = scope.entity.textUnderline;
            };


        }
    }
}]);
