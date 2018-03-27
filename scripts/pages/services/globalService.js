app.factory("$global", ["$location", "$common", function ($location) {
    var globalMethtods = {
        getModuleFromUrl: function () {
            var hashNodes = $location.path().split("/");
            hashNodes.splice(0, 1);
            return hashNodes[0];
        },
        getSubModuleFromUrl: function () {
            var hashNodes = $location.path().split("/");
            hashNodes.splice(0, 1);
            return hashNodes[1];
        },
        camelToUnderline: function (str) {
            var reg = /[A-Z]/g;
            str = str.replace(reg, function ($0) {
                return "_" + $0;
            });
            return str.toUpperCase();
        },
        camelToDash: function () {
            var reg = /[A-Z]/g;
            return str.replace(reg, function ($0) {
                return "-" + $0.toUpperCase;
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
            var date = moment(date);
            return date.get("hours") * 60 + date.get("minutes");
        }
    };
    return globalMethtods;
}]);

