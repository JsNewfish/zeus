app.factory('$common', ["$restClient", function ($restClient) {
    return {
        strToArray: function (str, spliter, format) {
            if (!str) {
                return [];
            }
            spliter = spliter ? spliter : ",";
            var result = $.trim(str).split(spliter);

            if (typeof format == "function") {
                $.each(result, function (i, item) {
                    result[i] = format.call(item, item);
                })
            }
            else if (format) {
                $.each(result, function (i, item) {
                    result[i] = parseInt(item);
                })
            }
            return result;
        },
        arrayToStr: function (array) {
            return array ? array.toString() : "";
        },
        camelToUnderline: function (str, upperCase) {
            var reg = /[A-Z]/g;
            str = str.replace(reg, function ($0) {
                return "_" + (upperCase ? $0.toUpperCase : $0);
            });
            return str.toUpperCase();
        },
        camelToDash: function (str, upperCase) {
            var reg = /[A-Z]/g;
            return str.replace(reg, function ($0) {
                return "-" + (upperCase ? $0.toUpperCase : $0);
            });
        },
        minutesToDate: function (input) {
            var hours = Math.floor(input / 60);
            var minutes = input % 60;
            return moment(new Date()).startOf("day").add(hours, "hours").add(minutes, "minutes")._d;
        },
        dateToMinutes: function (date) {
            if (!date) {
                return 0;
            }
            var result = moment(date);
            return result.get("hours") * 60 + result.get("minutes");
        },
        underlineToCamel:function(str){
            var reg = /\_(\w)/g;
            return str = str.replace(reg, function(all, letter){
                return letter.toUpperCase();
            });
        }
    };
}]);

