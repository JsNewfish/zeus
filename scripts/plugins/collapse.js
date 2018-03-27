/**
 * Created by Jin on 2016/7/29.
 */
angular.module('ui.bootstrap.collapse', [])

    .directive('uibCollapse', ['$animate', '$injector', '$q', function ($animate, $injector, $q) {
        var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
        return {
            link: function (scope, element, attrs) {
                if (!scope.$eval(attrs.uibCollapse)) {
                    element.addClass('in')
                        .addClass('collapse')
                        .css({height: 'auto'});
                }

                function expand() {
                    var defer = $q.defer();
                    element.removeClass('collapse')
                        .addClass('collapsing')
                        .attr('aria-expanded', true)
                        .attr('aria-hidden', false);

                    if ($animateCss) {
                        $animateCss(element, {
                            addClass: 'in',
                            easing: 'ease',
                            to: {height: element[0].scrollHeight + 'px'}
                        }).start()['finally'](expandDone);
                    } else {
                        defer.resolve();
                        defer.promise.then(function () {
                            $animate.addClass(element, 'in', function () {
                                to: {height: element[0].scrollHeight + 'px'}
                                //element.css({height: element[0].scrollHeight + 'px'});
                            })
                        }).then(expandDone);
                    }
                }

                function expandDone() {
                    element.removeClass('collapsing')
                        .addClass('collapse')
                        .css({height: 'auto'});
                }

                function collapse() {
                    var defer = $q.defer();
                    if (!element.hasClass('collapse') && !element.hasClass('in')) {
                        return collapseDone();
                    }

                    element
                        // IMPORTANT: The height must be set before adding "collapsing" class.
                        // Otherwise, the browser attempts to animate from height 0 (in
                        // collapsing class) to the given height here.
                        .css({height: element[0].scrollHeight + 'px'})
                        // initially all panel collapse have the collapse class, this removal
                        // prevents the animation from jumping to collapsed state
                        .removeClass('collapse')
                        .addClass('collapsing')
                        .attr('aria-expanded', false)
                        .attr('aria-hidden', true);

                    if ($animateCss) {
                        $animateCss(element, {
                            removeClass: 'in',
                            to: {height: '0'}
                        }).start()['finally'](collapseDone);
                    } else {
                        defer.resolve();
                        defer.promise.then(function () {
                            $animate.removeClass(element, 'in', function () {
                                to: {height: '0'}
                                //element.css({height: '0'});
                            })
                        }).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.css({height: '0'}); // Required so that collapse works when animation is disabled
                    element.removeClass('collapsing')
                        .addClass('collapse');
                }

                scope.$watch(attrs.uibCollapse, function (shouldCollapse) {
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }]);