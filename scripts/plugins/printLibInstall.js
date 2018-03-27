/**
 * Created by Jin on 2016/8/30.
 */
$(function () {

    //让本机浏览器打印(更优先)：
    oscript = document.createElement("script");
    oscript.src = "http://localhost:8000/CLodopfuncs.js?priority=1";
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore(oscript, head.firstChild);
    //本机浏览器的后补端口8001：
    oscript = document.createElement("script");
     oscript.src = "http://localhost:8001/CLodopfuncs.js?priority=2";
     var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
     head.insertBefore(oscript, head.firstChild);

});
