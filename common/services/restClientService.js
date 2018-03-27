app.factory("$restClient", ["$resource", "$http", "$win",
    function ($resource, $http, $win) {
        $http.defaults.cache = false;
        var httpClient = $resource("/:module/:target/:intention", null, {
            "update": {
                method: "PUT"
            },
            "post": {
                method: "POST"
            },
            "deletes": {
                method: "DELETE"
            },
            "put": {
                method: "PUT"
            }
        });

        function getParam(position, array) {
            var name = ["module", "target", "intention"],
                positionArray = position.split("/"),
                positionResult = {},
                param = {};

            $(positionArray).each(function (i, item) {
                positionResult[name[i]] = item;
            });

            param = $.extend({}, positionResult, array || {});
            return param
        }

        //获取相应回调
        function getAction(callback) {
            var options;
            var defaults = {
                successCallback: null,//成功回调
                errorCallback: null,//错误回调
                failCallback: null,//完成动作
                custom: false//自定义
            };
            options = typeof(callback) == "object" ? $.extend({}, defaults, callback) : $.extend({}, defaults, {successCallback: callback});

            return getCallback(options);
        }

        //转换成queryStr
        function jsonToQuery(data) {
            var result = "";
            if (typeof data != "object") {
                return data;
            }
            $.each(data, function (key, value) {
                result += key + '=' + encodeURIComponent(value) + "&";
            });
            return result.substr(0, result.length - 1);
        }

        function getCallback(options) {
            var successHandler, errorHandler;

            if (options.custom) {
                successHandler = options.successCallback;
            }
            else {
                successHandler = function (data) {
                    if (data.resultCode == 0) {
                        options.successCallback && options.successCallback.call(this, data);
                    } else if (data.resultCode == -1) {
                        location.href = data.resultMessage;
                        console.log("cookie过期" + data.resultMessage)
                    }
                    else {
                        if (options.failCallback) {
                            options.failCallback && options.failCallback(data);
                        } else {
                            $win.alert({
                                type: "danger",//场景类型：warning,info,danger,success
                                content: data.resultMessage//内容
                            });
                        }
                    }
                }
            }

            if (options.errorCallback && typeof options.errorCallback == "function") {
                errorHandler = options.errorCallback;
            }
            else {
                errorHandler = function (msg) {
                    $win.alert({
                        type: "danger",
                        content: "请求错误：" + msg.status + "|" + msg.statusText//内容
                    });
                }
            }

            return {
                success: successHandler,
                error: errorHandler
            }
        }

        return {
            get: function (url, array, action) {
                var callback = getAction(action);
                return httpClient.get(getParam(url, array), callback.success, callback.error);
            },
            post: function (url, array, entity, action) {
                var callback = getAction(action);
                return httpClient.post(getParam(url, array), entity, callback.success, callback.error);
            },
            put: function (url, array, entity, action) {
                var callback = getAction(action);
                return httpClient.put(getParam(url, array), entity, callback.success, callback.error);
            },
            deletes: function (url, array, action) {
                var callback = getAction(action);
                return httpClient.deletes(getParam(url, array), callback.success, callback.error);
            },
            save: function (url, array, entity, action) {
                var callback = getAction(action);
                return httpClient.save(getParam(url, array), entity, callback.success, callback.error);
            },
            remove: function (url, array, action) {
                var callback = getAction(action);
                return httpClient.remove(getParam(url, array), callback.success, callback.error);
            },
            update: function (url, array, entity, action) {
                var callback = getAction(action);
                return httpClient.update(getParam(url, array), entity, callback.success, callback.error);
            },
            postFormData: function (url, data, action) {
                var callback = getAction(action);
                return $http({
                    url: "/" + url,
                    method: 'POST',
                    data: jsonToQuery(data),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(callback.success).error(callback.error);
            },
            getBaseStaticUrl: "/static/",
            jsonToQuery: jsonToQuery
        };
    }
]);





