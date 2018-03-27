/**
 * Created by Jin on 2016/11/7.
 */
$(function(){
    /**
     * 生成下一个运单号码
     * @param expressName - 快递公司名称
     * @param sidStart - 开始单号
     * @param step - 步长
     * @returns
     */
    window.getNextSid = function(expressName,sidStart,step){
        var emsReg = /(.*)ems(.*)/i; //EMS
        var postReg = /(.*)邮政平邮(.*)/i; //邮政平邮
        var postbReg = /(.*)国内小包(.*)|(.*)商务小包(.*)|(.*)邮政快递包裹(.*)/i; //邮政国内小包
        var sf = /(.*)顺丰(.*)/i; //顺丰
        var sure = /(.*)速尔(.*)/i; //速尔
        var fast = /(.*)快捷速递(.*)/i;//快捷速递
        var ems2Reg = /(.*)经济快递(.*)/i; //EMS经济快递
        var ems3Reg = /(.*)标准快递(.*)/i; //EMS标准快递
        var zjs = /(.*)宅急送(.*)/i; //宅急送
        var uc = /(.*)优速(.*)/i; //优速
        var yct = /(.*)黑猫宅急便(.*)/; //黑猫宅急便
        var fedex = /(.*)联邦快递(.*)/;//联邦快递

        if(ems2Reg.test(expressName)){//EMS经济快递
            return sidAdd4EMS2(sidStart,step);
        }if(ems3Reg.test(expressName)){//EMS标准快递
            return sidAdd4EMS2(sidStart,step);
        }else if(emsReg.test(expressName)){//EMS
            return sidAdd4EMS(sidStart,step);
        }else if(postReg.test(expressName)){//邮政平邮
            return sidAdd4POST(sidStart,step);
        }else if(postbReg.test(expressName)){//邮政国内小包
            return sidAdd4POSTB(sidStart,step);
        }else if(sf.test(expressName)){//顺丰
            return sidAdd4SF(sidStart,1);
        }else if(sure.test(expressName)){//速尔
            return sidAdd4SURE(sidStart,1);
        }else if(fast.test(expressName)){//快捷速递
            return sidAdd4FAST(sidStart,step);
        }else if(zjs.test(expressName)){//宅急送
            return sidAdd4ZJS(sidStart,1);
        }else if(uc.test(expressName)){//优速
            return sidAdd4UC(sidStart,step);
        }else if(yct.test(expressName)){//黑猫宅急便
            return sidAdd4YCT(sidStart,1);
        }else if(fedex.test(expressName)){//联邦快递
            return sidAdd4FEDEX(sidStart,1);
        }else{//其它快递
            return sidAdd4Normal(sidStart,step);
        }
    };

    /**
     * 生成下一个运单号码
     * @param expressName - 快递公司ID
     * @param sidStart - 开始单号
     * @param step - 步长
     * @returns
     */
    window.getNextSid2 = function(expressId,sidStart,step){
        if(141==expressId || "141"==expressId){//EMS经济快递
            return sidAdd4EMS2(sidStart,step);
        }if(144==expressId || "144"==expressId){//EMS标准快递
            return sidAdd4EMS2(sidStart,step);
        }else if(1==expressId || "1"==expressId){//EMS
            return sidAdd4EMS(sidStart,step);
        }else if(12==expressId || "12"==expressId){//邮政平邮
            return sidAdd4POST(sidStart,step);
        }else if(131==expressId || "131"==expressId){//邮政快递包裹
            return sidAdd4POSTB(sidStart,step);
        }else if(26==expressId || "26"==expressId){//顺丰
            return sidAdd4SF(sidStart,1);
        }else if(104==expressId || "104"==expressId){//速尔
            return sidAdd4SURE(sidStart,1);
        }else if(128==expressId || "128"==expressId){//快捷速递
            return sidAdd4FAST(sidStart,step);
        }else if(24==expressId || "24"==expressId){//宅急送
            return sidAdd4ZJS(sidStart,1);
        }else if(109==expressId || "109"==expressId){//优速
            return sidAdd4UC(sidStart,step);
        }else if(126==expressId || "126"==expressId){//黑猫宅急便
            return sidAdd4YCT(sidStart,1);
        }else if(31==expressId || "31"==expressId){//联邦快递
            return sidAdd4FEDEX(sidStart,1);
        }else{//其它快递
            return sidAdd4Normal(sidStart,step);
        }
    };

    // 将数字字符串strStart加上step，返回strStart+step后的字符串。strStart中的字符必须全部为数字
    var sidAdd4NumOnly = function(strStart,step){
        var sidLength = strStart.length;
        var stepLength = (step+"").length;

        var subSid1Length = (sidLength-stepLength);
        var subSid1 = strStart.substring(0,subSid1Length);
        var subSid2 = strStart.substring(subSid1Length,sidLength);
        var subSid2Length = subSid2.length;
        while(subSid2*1 < 1){
            if(subSid1Length<1){
                break;
            }
            subSid1Length = subSid1Length - 1;
            subSid1 = strStart.substring(0,subSid1Length);
            subSid2 = strStart.substring(subSid1Length,sidLength);
            subSid2Length = subSid2.length;
        }

        var suffix = subSid2*1 + step*1;//运单号码的后缀,数值型

        if((suffix+"").length < subSid2Length){//判断是否因乘法运算将suffix前面的0去掉了，如果是，则将suffix的前面重新补上0.
            for(var i=(suffix+"").length;i<subSid2Length;i++){
                suffix = "0"+suffix;
            }
        }

        if((suffix+"").length > strStart.length){
            return "";
        }else{
            while((suffix+"").length > subSid2.length){
                subSid1Length = subSid1Length - 1;
                subSid1 = strStart.substring(0,subSid1Length);
                subSid2 = strStart.substring(subSid1Length,sidLength);
                subSid2Length = subSid2.length;

                suffix = subSid2*1 + step*1;//重新计算运单号码的后缀,数值型

                if((suffix+"").length < subSid2Length){//判断是否因乘法运算将suffix前面的0去掉了，如果是，则将suffix的前面重新补上0.
                    for(var i=(suffix+"").length;i<subSid2Length;i++){
                        suffix = "0"+suffix;
                    }
                }
            }

            return subSid1+suffix;
        }
    };

    // 将运单号码加上步长，返回一个新的运单号码，支持运单号码开头或最后带字符的情况
    var sidAdd4Normal = function(sidStart,step){
        // 2012-02-04,改用正则表达式的方式，支持后缀非数字

        // 运单号码全部为数字
        var reg1 = /^(\d+)$/i;
        if(reg1.test(sidStart)){
            var tmp = reg1.exec(sidStart);
            var num = tmp[1];
            num = num + "";
            //alert("[1] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return base;
        }

        // 运单号码开头为字符，最后为数字
        var reg2 = /^(\D+)(\d+)$/i;
        if(reg2.test(sidStart)){
            var tmp = reg2.exec(sidStart);
            var sub1 = tmp[1];
            var num = tmp[2];
            num = num + "";
            //alert("[2] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+base;
        }

        // 运单号码开头为数字，最后为字符
        var reg3 = /^(\d+)(\D+)$/i;
        if(reg3.test(sidStart)){
            var tmp = reg3.exec(sidStart);
            var num = tmp[1];
            var sub2 = tmp[2];
            num = num + "";
            //alert("[3] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return base+""+sub2;
        }

        // 运单号码开头为字符，最后也为字符，中间为数字
        var reg4 = /^(\D+)(\d+)(\D+)$/i;
        if(reg4.test(sidStart)){
            var tmp = reg4.exec(sidStart);
            var sub1 = tmp[1];
            var num = tmp[2];
            var sub3 = tmp[3];
            num = num + "";
            //alert("[4] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+base+""+sub3;
        }

        // 运单号码开头为字符，最后也为字符，中间为混合字符的数字(数字中间带字符)
        var reg5 = /^(\D+)(\d+)(\D+)(\d+)(\D+)$/i;
        if(reg5.test(sidStart)){
            var tmp = reg5.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var sub3 = tmp[3];
            var num = tmp[4];
            var sub5 = tmp[5];
            num = num + "";
            //alert("[5] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+sub2+sub3+base+""+sub5;
        }

        // 运单号码开头为数字，最后也为数字，中间为字符
        var reg6 = /^(\d+)(\D+)(\d+)$/i;
        if(reg6.test(sidStart)){
            var tmp = reg6.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var num = tmp[3];
            num = num + "";
            //alert("[6] num = " + num);
            var base = sidAdd4NumOnly(num,step);
            if(""==base){
                alert("生成("+sidStart+")下一个运单号码时出错啦");
                return "";
            }
            return sub1+""+sub2+base;
        }

        alert("生成("+sidStart+")下一个运单号码时出错啦");
        return "";
    };

    // 根据指定的EMS运单号获取下一个运单号码
    var sidAdd4EMS = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            return "";
        }

        var emsReg = /^(\D{2}|\d{2})(\d{8})(\d)(\D{2}|\d{2})$/i;
        if(emsReg.test(sidStart)){
            var tmp = emsReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //根据指定的EMS（国内经济快递）运单号获取下一个运单号码
    var sidAdd4EMS2 = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            return "";
        }

        var emsReg = /^(\d{2})(\d{8})(\d)(\d{2})$/i;
        if(emsReg.test(sidStart)){
            var tmp = emsReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //算法来源：http://bbs.paidai.com/topic/76928
    //根据指定的顺丰运单号获取下一个运单号码
    var sidAdd4SF = function(sidStart,step){
        if(sidStart.length != 12){//顺丰运单号固定为12位长
            return "";
        }

        var num1 = sidStart.substring(0,11);
        var num2 = sidStart.substring(11,12);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            return "";
        }

        var numArray = new Array();
        for(var i=0;i<11;i++){
            var tmp = num1.substring(i,i+1);
            numArray[i] = tmp * 1;
        }

        if(9 != numArray[10]){
            var last = (num2*1+9)%10;
            return nextNum+""+last;
        }else{
            if(9 != numArray[9]){
                if(3==numArray[9]||6==numArray[9]){
                    var last = (num2*1+5)%10;
                    return nextNum+""+last;
                }else{
                    var last = (num2*1+6)%10;
                    return nextNum+""+last;
                }
            }else{
                if(9 != numArray[8]){
                    if(1==numArray[8]||3==numArray[8]||5==numArray[8]||7==numArray[8]){
                        var last = (num2*1+2)%10;
                        return nextNum+""+last;
                    }else{
                        var last = (num2*1+3)%10;
                        return nextNum+""+last;
                    }
                }else{
                    if(9 != numArray[7]){
                        if(0==numArray[7]||3==numArray[7]||6==numArray[7]){
                            var last = (num2*1+0)%10;
                            return nextNum+""+last;
                        }else{
                            var last = (num2*1+9)%10;
                            return nextNum+""+last;
                        }
                    }else{
                        if(9 != numArray[6]){
                            if(0==numArray[6]){
                                var last = (num2*1+7)%10;
                                return nextNum+""+last;
                            }else{
                                var last = (num2*1+6)%10;
                                return nextNum+""+last;
                            }
                        }else{
                            if(9 != numArray[5]){
                                var last = (num2*1+3)%10;
                                return nextNum+""+last;
                            }else{
                                if(9 != numArray[4]){
                                    if(3==numArray[4]||6==numArray[4]){
                                        var last = (num2*1+8)%10;
                                        return nextNum+""+last;
                                    }else{
                                        var last = (num2*1+9)%10;
                                        return nextNum+""+last;
                                    }
                                }else{
                                    if(9 != numArray[3]){
                                        if(1==numArray[3]||3==numArray[3]||5==numArray[3]||7==numArray[3]){
                                            var last = (num2*1+4)%10;
                                            return nextNum+""+last;
                                        }else{
                                            var last = (num2*1+5)%10;
                                            return nextNum+""+last;
                                        }
                                    }else{
                                        return "";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return "";
    };

    //根据指定的速尔运单号获取下一个运单号码
    var sidAdd4SURE = function(sidStart,step){
        if(sidStart.length != 12){//速尔运单号固定为12位长
            return "";
        }


        if (sidStart.indexOf("50") == 0 || sidStart.indexOf("55") == 0
            || sidStart.indexOf("60") == 0 || sidStart.indexOf("61") == 0
            || sidStart.indexOf("62") == 0
            || sidStart.indexOf("72") == 0 || sidStart.indexOf("88") == 0) {// 如果单号是以50、55、60、61、62、72、88开头的，则顺序加1
            return sidAdd4Normal(sidStart, step);
        }

        var sureReg = /^(8|6)(\d{7})(\d{3})([0-6])$/i;
        if(sureReg.test(sidStart)){
            var tmp = sureReg.exec(sidStart);
            var sub1 = tmp[1];
            var sub2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num3 = num3 + "";

            num3 = sidAdd4NumOnly(num3,step);
            if(""==num3)return "";

            if(sub4*1>=0 && sub4*1<=5){
                sub4 = sub4*1+1;
            }else{
                sub4 = 0;
            }

            return sub1+""+sub2+num3+sub4;
        }

        return "";
    };

    //根据指定的中国邮政平邮的运单号获取下一个运单号码
    var sidAdd4POST = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            alert("运单号码的长度非法");
            return "";
        }

        var postbReg = /^(\D{2})(\d{8})(\d)(\d{2})$/i;
        if(postbReg.test(sidStart)){
            var tmp = postbReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        alert("联想生成运单号码时出错啦");
        return "";
    };

    //根据指定的邮政国内小包运单号获取下一个运单号码
    var sidAdd4POSTB = function(sidStart,step){
        if(sidStart.length != 13){//EMS运单号固定为13位长
            alert("运单号码的长度非法");
            return "";
        }

        if(sidStart.indexOf("99")==0 || sidStart.indexOf("96")==0){//如果单号是以99、96开头的，单号顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var postbReg = /^(\D{2}|\d{2})(\d{8})(\d)(\d{2})$/i;
        if(postbReg.test(sidStart)){
            var tmp = postbReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var num3 = tmp[3];
            var sub4 = tmp[4];
            num2 = num2 + "";
            num3 = num3 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2)return "";

            var b = new Array();
            for(var i=0;i<8;i++){
                var tmp = num2.substring(i,i+1);
                b[i] = tmp*1;
            }

            var x = b[0]*8 + b[1]*6 + b[2]*4 + b[3]*2 + b[4]*3 + b[5]*5 + b[6]*9 + b[7]*7;
            var y = x%11;
            var z = 11 - y;
            if(z == 10){
                num3 = "0";
            }else if(z == 11){
                num3 = "5";
            }else if(z < 10){
                num3 = z+"";
            }

            return sub1+""+num2+num3+sub4;
        }

        return "";
    };

    //根据指定的快捷速递运单号获取下一个运单号码
    var sidAdd4FAST = function(sidStart,step){
        if(sidStart.length == 12){//如果快捷速递运单号为12位长，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }
        if(sidStart.length != 13){//快捷速递运单号固定为13位长
            return "";
        }

        if(sidStart.indexOf("5730")==0){//如果单号是以5730开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }else if(sidStart.indexOf("5790")==0){//如果单号是以5790开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        if(sidStart.indexOf("27")!=0 && sidStart.indexOf("57")!=0){//如果单号不是以27、57开头，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var num1 = sidStart.substring(0,12);
        var num2 = sidStart.substring(12,13);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            return "";
        }

        var last = num2*1 + step*1;
        if(last >= 10){
            last = (last+"").substring((last+"").length-1,(last+"").length) * 1;
        }
        last = last%7;

        return nextNum+""+last;
    };

    //根据指定的宅急送运单号获取下一个运单号码
    var sidAdd4ZJS = function(sidStart,step){
        if(sidStart.length != 10 && sidStart.length != 13){//宅急送运单号固定为10位或13位长（13位长的为2016.1.1新启用的单号规则）
            if(sidStart.length>0) alert("所输入的运单号的长度不符合宅急送的单号规则");
            return "";
        }

        if(10==sidStart.length){
            if(sidStart.indexOf("49")==0){//如果单号是以49开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }else if(sidStart.indexOf("70T")==0){//如果单号是以70T开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }else if(sidStart.indexOf("16")==0){//如果单号是以16开头的，则顺序加1
                return sidAdd4Normal(sidStart,step);
            }

            var zjsReg = /^(\d{6})(\d{3})([0-6])$/i;
            if(zjsReg.test(sidStart)){
                var tmp = zjsReg.exec(sidStart);
                var sub1 = tmp[1];
                var num2 = tmp[2];
                var sub3 = tmp[3];
                num2 = num2 + "";

                num2 = sidAdd4NumOnly(num2,step);
                if(""==num2)return "";

                if(sub3*1>=0 && sub3*1<=5){
                    sub3 = sub3*1+1;
                }else{
                    sub3 = 0;
                }

                return sub1+""+num2+sub3;
            }
        }else if(13==sidStart.length){
            var zjsReg = /^(A)(\d)(\d{11})$/i;
            if(zjsReg.test(sidStart)){
                var tmp = zjsReg.exec(sidStart);
                var sub1 = tmp[1];
                var num2 = tmp[2];
                var num3 = tmp[3];
                num2 = num2 - 0;
                if(num2>=0 && num2<=5){
                    var the_num = num2+""+num3;
                    the_num = the_num.substr(0,the_num.length-1);
                    the_num = sidAdd4NumOnly(the_num,step);
                    if(""==the_num){
                        alert("所输入的运单号不符合宅急送的单号规则");
                        return "";
                    }
                    var sub4 = the_num%7;
                    return sub1+""+the_num+sub4;
                }else{
                    num3 = num3 + "";
                    num3 = sidAdd4NumOnly(num3,step);
                    if(""==num3){
                        alert("所输入的运单号不符合宅急送的单号规则");
                        return "";
                    }
                    return sub1+""+num2+num3;
                }
            }
        }

        alert("所输入的运单号不符合宅急送的单号规则");
        return "";
    };

    //根据指定的优速运单号获取下一个运单号码
    var sidAdd4UC = function(sidStart,step){
        if(sidStart.length != 12){//优速运单号固定为12位长
            if(sidStart.length>0) alert("所输入的运单号的长度不符合优速的单号规则");
            return "";
        }

        if(sidStart.indexOf("v")!=0 && sidStart.indexOf("V")!=0){//如果单号不是以V开头的，则顺序加1
            return sidAdd4Normal(sidStart,step);
        }

        var ucReg = /^(V)([0-9]{10})([0-9])/i;
        if(ucReg.test(sidStart)){
            var tmp = ucReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var sub3 = tmp[3];
            num2 = num2 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2){
                alert("生成优速的("+sidStart+")下一个运单号码时出错啦");
                return "";
            }

            if(sub3*1>=0 && sub3*1<=5){
                sub3 = sub3*1+1;
            }else{
                sub3 = 0;
            }

            return sub1+""+num2+sub3;
        }

        alert("所输入的运单号不符合优速的单号规则");
        return "";
    };

    //根据指定的黑猫宅急便运单号获取下一个运单号码
    var sidAdd4YCT = function(sidStart,step){
        if(sidStart.length != 12){//黑猫宅急便运单号固定为12位长
            if(sidStart.length>0) alert("所输入的运单号的长度不符合黑猫宅急便的单号规则");
            return "";
        }

        var yctReg = /^(\d{6})(\d{5})([0-6])$/i;
        if(yctReg.test(sidStart)){
            var tmp = yctReg.exec(sidStart);
            var sub1 = tmp[1];
            var num2 = tmp[2];
            var sub3 = tmp[3];
            num2 = num2 + "";

            num2 = sidAdd4NumOnly(num2,step);
            if(""==num2){
                alert("生成黑猫宅急便的("+sidStart+")下一个运单号码时出错啦");
                return "";
            }

            if(sub3*1>=0 && sub3*1<=5){
                sub3 = sub3*1+1;
            }else{
                sub3 = 0;
            }

            return sub1+""+num2+sub3;
        }

        alert("所输入的运单号不符合黑猫宅急便的单号规则");
        return "";
    };

    //根据指定的联邦快递运单号获取下一个运单号码
    var sidAdd4FEDEX = function(sidStart,step){
        if(sidStart.length != 12){//联邦快递运单号固定为12位长
            alert("所输入的运单号的长度不符合联邦快递的单号规则");
            return "";
        }

        var num1 = sidStart.substring(0,11);
        var num2 = sidStart.substring(11,12);
        var nextNum = sidAdd4NumOnly(num1,step);
        if("" == nextNum){
            alert("生成联邦快递的单号时出错啦");
            return "";
        }

        var last = nextNum;
        last = last%11;
        if(last==10){
            last = 0;
        }

        return nextNum+""+last;
    };
});
