/**
 * Created by Jin on 2016/5/31.
 */
app.directive('formatCheckbox', function () {
    return {
        restrict: 'AE',
        scope: {},
        require: '?^ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$formatters.push(function (value) {
                return !!value;
            });
            ctrl.$parsers.push(function (value) {
                return String(value) == "true" ? 1 : 0;
            });
            ctrl.$render = function () {
                element[0].checked = ctrl.$viewValue;
            }
        }
    }
});