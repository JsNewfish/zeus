/**
 * Created by Jin on 2016/10/14.
 */
app.factory('$local',['$window',function($window){
    return {
        setValue:function(key,value){
            $window.localStorage[key]=value;
        },
        getValue:function(key){
            if($window.localStorage[key]){
                return $window.localStorage[key];
            }
        },
        setObject:function(key,value){
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject:function(key){
            if($window.localStorage[key]) {
                return JSON.parse($window.localStorage[key]);
            }else{
                return {};
            }
        },
        clearData:function(){
            $window.localStorage.clear();
        }
    }
}]);