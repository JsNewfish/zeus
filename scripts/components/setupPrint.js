app.directive('setupPrint',function(){
	return{
		template:'<object id="LODOP_OB" classid="clsid:2105C259-1E0C-4534-8141-A753534CB4CA" width=800 height=900> '+
		'<embed id="LODOP_EM" type="application/x-print-lodop" width=800 height=720 pluginspage="install_lodop32.exe"></embed>'+
		'</object>',
		restrict:"AE",
		link:function(scope,element,attrs,ctrl){

			function CreatePage() {
				LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM')); 
				//LODOP = getLodop(element.find('#LODOP_OB'),element.find('#LODOP_EM'));
				LODOP.PRINT_INITA(4,10,820,610,"打印控件功能演示_Lodop功能_显示模式");
				LODOP.ADD_PRINT_TEXT(83,78,75,20,"寄件人姓名");
				LODOP.ADD_PRINT_TEXT(109,137,194,20,"寄件人单位名称");
				LODOP.ADD_PRINT_TEXT(134,90,238,35,"寄件人的详细地址");
				LODOP.ADD_PRINT_TEXT(85,391,75,20,"收件人姓名");
				LODOP.ADD_PRINT_TEXT(108,440,208,20,"收件人单位名称");
				LODOP.ADD_PRINT_TEXT(137,403,244,35,"收件人详细地址");
				LODOP.ADD_PRINT_TEXT(252,33,164,40,"内件品名");
				LODOP.ADD_PRINT_TEXT(261,221,100,20,"内件数量");
				LODOP.ADD_PRINT_TEXT(83,212,100,20,"寄件人电话");
				LODOP.ADD_PRINT_TEXT(80,554,75,20,"收件人电话");
				LODOP.ADD_PRINT_SETUP_BKIMG("<img border='0' src='http://s1.sinaimg.cn/middle/721e77e5t99431b026bd0&690'>");

			}
			function setShowMode(){
				LODOP.SET_SHOW_MODE("SETUP_IN_BROWSE",1);
				LODOP.SET_SHOW_MODE("SETUP_ENABLESS","11110100000001");
        		LODOP.SET_SHOW_MODE("HIDE_DISBUTTIN_SETUP",1);  //隐藏无用按钮
        		//LODOP.SET_SHOW_MODE("HIDE_TOOLS_DESIGN",1); //隐藏整个工具栏
        		LODOP.SET_SHOW_MODE("HIDE_GROUND_LOCK",1);   //隐藏纸钉按钮
        		//LODOP.SET_SHOW_MODE("SHOW_SCALEBAR",1);    //显示标尺 需高级注册
        		LODOP.SET_SHOW_MODE("HIDE_PBUTTIN_SETUP",1); //隐藏暂存按钮
        		LODOP.SET_SHOW_MODE("BKIMG_IN_PREVIEW",1);
        		LODOP.SET_SHOW_MODE("HIDE_ABUTTIN_SETUP",1); //隐藏打印按钮
        		LODOP.PRINT_SETUP();
        	}
        	CreatePage();
        	setShowMode();
        }
    }
});
