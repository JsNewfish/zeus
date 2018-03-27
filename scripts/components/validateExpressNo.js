// 根据我打中的快递公司ID获取此快递公司在淘宝里的代码 
function get_exp_tb_code(express_id){
    var exp_code_map = {};
    exp_code_map['14'] = 'STO';
    exp_code_map['16'] = 'YTO';
    exp_code_map['15'] = 'ZTO';
    exp_code_map['50'] = 'YUNDA';
    exp_code_map['26'] = 'SF';
    exp_code_map['19'] = 'HTKY';
    exp_code_map['34'] = 'TTKDEX';
    exp_code_map['131'] = 'POSTB';
    exp_code_map['225'] = 'EYB';
    exp_code_map['141'] = 'EYB';
    exp_code_map['1'] = 'EMS';
    exp_code_map['79'] = 'GTO';
    exp_code_map['114'] = 'QFKD';
    exp_code_map['138'] = 'POSTB';
    exp_code_map['109'] = 'UC';
    exp_code_map['144'] = 'EMS';
    exp_code_map['12'] = 'POST';
    exp_code_map['167'] = 'ESB';
    exp_code_map['113'] = 'QFKD';
    exp_code_map['24'] = 'ZJS';
    exp_code_map['128'] = 'FAST';
    exp_code_map['76'] = 'LB';
    exp_code_map['107'] = 'NEDA';
    exp_code_map['127'] = 'NEDA';
    exp_code_map['156'] = 'QRT';
    exp_code_map['73'] = 'DBL';
    exp_code_map['186'] = 'DBKD';
    exp_code_map['104'] = 'SURE';
    exp_code_map['126'] = 'YCT';
    exp_code_map['41'] = 'ZTKY';
    exp_code_map['75'] = 'APEX';
    exp_code_map['130'] = 'UAPEX';
    exp_code_map['115'] = 'LTS';
    exp_code_map['129'] = 'QRT';
    exp_code_map['31'] = 'FEDEX';
    exp_code_map['33'] = 'HOAU';
    exp_code_map['69'] = 'CNEX';
    exp_code_map['101'] = 'STARS';
    exp_code_map['102'] = 'XFHONG';
    exp_code_map['28'] = 'AIRFEX';
    exp_code_map['29'] = 'DTW';
    exp_code_map['74'] = 'EBON';
    exp_code_map['77'] = 'CYEXP';
    exp_code_map['78'] = 'ANTO';
    exp_code_map['103'] = 'XB';
    exp_code_map['110'] = 'HZABC';
    exp_code_map['106'] = 'YUD';
    exp_code_map['116'] = 'UNIPS';
    exp_code_map['117'] = 'BEST';
    exp_code_map['139'] = 'BJCS';
    exp_code_map['118'] = 'SHQ';
    exp_code_map['119'] = 'WLB-STARS';
    exp_code_map['120'] = 'WLB-ABC';
    exp_code_map['121'] = 'WLB-SAD';
    exp_code_map['122'] = 'ZY';
    exp_code_map['123'] = 'DFH';
    exp_code_map['124'] = 'SY';
    exp_code_map['125'] = 'YC';
    exp_code_map['142'] = 'ZHQKD';
    exp_code_map['132'] = 'OTHER';
    exp_code_map['143'] = 'OTHER';
    exp_code_map['140'] = 'OTHER';
    exp_code_map['2'] = 'OTHER';
    exp_code_map['13'] = 'OTHER';
    exp_code_map['17'] = 'OTHER';
    exp_code_map['18'] = 'OTHER';
    exp_code_map['20'] = 'OTHER';
    exp_code_map['21'] = 'OTHER';
    exp_code_map['22'] = 'OTHER';
    exp_code_map['23'] = 'OTHER';
    exp_code_map['25'] = 'OTHER';
    exp_code_map['32'] = 'OTHER';
    exp_code_map['35'] = 'OTHER';
    exp_code_map['36'] = 'OTHER';
    exp_code_map['37'] = 'OTHER';
    exp_code_map['38'] = 'OTHER';
    exp_code_map['40'] = 'OTHER';
    exp_code_map['42'] = 'OTHER';
    exp_code_map['43'] = 'OTHER';
    exp_code_map['44'] = 'OTHER';
    exp_code_map['45'] = 'OTHER';
    exp_code_map['46'] = 'OTHER';
    exp_code_map['47'] = 'OTHER';
    exp_code_map['48'] = 'OTHER';
    exp_code_map['49'] = 'OTHER';
    exp_code_map['51'] = 'OTHER';
    exp_code_map['52'] = 'OTHER';
    exp_code_map['53'] = 'OTHER';
    exp_code_map['54'] = 'OTHER';
    exp_code_map['55'] = 'OTHER';
    exp_code_map['56'] = 'OTHER';
    exp_code_map['57'] = 'OTHER';
    exp_code_map['58'] = 'OTHER';
    exp_code_map['59'] = 'OTHER';
    exp_code_map['60'] = 'OTHER';
    exp_code_map['61'] = 'OTHER';
    exp_code_map['62'] = 'OTHER';
    exp_code_map['64'] = 'OTHER';
    exp_code_map['65'] = 'OTHER';
    exp_code_map['66'] = 'OTHER';
    exp_code_map['67'] = 'OTHER';
    exp_code_map['68'] = 'OTHER';
    exp_code_map['70'] = 'OTHER';
    exp_code_map['71'] = 'OTHER';
    exp_code_map['72'] = 'OTHER';
    exp_code_map['105'] = 'OTHER';
    exp_code_map['108'] = 'OTHER';
    exp_code_map['111'] = 'OTHER';
    exp_code_map['112'] = 'OTHER';
    exp_code_map['133'] = 'OTHER';
    exp_code_map['134'] = 'OTHER';
    exp_code_map['135'] = 'OTHER';
    exp_code_map['136'] = 'XFWL';
    exp_code_map['137'] = 'OTHER';
    exp_code_map['145'] = 'OTHER';
    exp_code_map['146'] = 'OTHER';
    exp_code_map['149'] = 'OTHER';
    exp_code_map['150'] = 'OTHER';
    exp_code_map['151'] = 'OTHER';
    exp_code_map['152'] = 'OTHER';
    exp_code_map['153'] = 'OTHER';
    exp_code_map['154'] = 'OTHER';
    exp_code_map['155'] = 'OTHER';
    exp_code_map['157'] = 'OTHER';
    exp_code_map['158'] = 'OTHER';
    exp_code_map['159'] = 'OTHER';
    exp_code_map['160'] = 'OTHER';
    exp_code_map['161'] = 'OTHER';
    exp_code_map['162'] = 'OTHER';
    exp_code_map['163'] = 'OTHER';
    exp_code_map['164'] = 'OTHER';
    exp_code_map['165'] = 'OTHER';
    exp_code_map['166'] = 'OTHER';
    exp_code_map['168'] = 'OTHER';
    exp_code_map['169'] = 'OTHER';
    exp_code_map['170'] = 'OTHER';
    exp_code_map['147'] = 'OTHER';
    exp_code_map['148'] = 'OTHER';
    exp_code_map['10248'] = 'OTHER';
    var exp_code = exp_code_map[express_id+''];
    if(!exp_code){exp_code='';}
    return exp_code;
}

// 判断指定的验证运单号码的函数是否存在 
function is_validate_function_exist(function_name){
    var func_map = {};
    func_map['is_OTHER'] = true;
    func_map['is_POST'] = false;
    func_map['is_AIR'] = true;
    func_map['is_CYEXP'] = true;
    func_map['is_DTW'] = true;
    func_map['is_YUD'] = true;
    func_map['is_DFH'] = true;
    func_map['is_SY'] = true;
    func_map['is_YC'] = true;
    func_map['is_UNIPS'] = true;
    func_map['is_GZLT'] = true;
    func_map['is_MGSD'] = true;
    func_map['is_PKGJWL'] = true;
    func_map['is_EMS'] = true;
    func_map['is_YTO'] = true;
    func_map['is_ZJS'] = true;
    func_map['is_SF'] = true;
    func_map['is_UC'] = true;
    func_map['is_YANWENINTE'] = true;
    func_map['is_YANWENSH'] = true;
    func_map['is_YANWENSZ'] = true;
    func_map['is_YANWENBJ'] = true;
    func_map['is_YANWENYW'] = true;
    func_map['is_YANWENGZ'] = true;
    func_map['is_ZTOGZ'] = true;
    func_map['is_RUSTON'] = true;
    func_map['is_ZTOSH'] = true;
    func_map['is_GZFY'] = true;
    func_map['is_LTS'] = true;
    func_map['is_QFKD'] = true;
    func_map['is_UAPEX'] = true;
    func_map['is_BJCS'] = true;
    func_map['is_GDEMS'] = true;
    func_map['is_SURE'] = true;
    func_map['is_EYB'] = true;
    func_map['is_ZTO'] = true;
    func_map['is_HZABC'] = true;
    func_map['is_YUNDA'] = true;
    func_map['is_TTKDEX'] = true;
    func_map['is_CNEX'] = true;
    func_map['is_BEST'] = true;
    func_map['is_FEDEX'] = true;
    func_map['is_SHQ'] = true;
    func_map['is_HTKY'] = true;
    func_map['is_ZTKY'] = true;
    func_map['is_XFWL'] = true;
    func_map['is_STO'] = true;
    func_map['is_LB'] = true;
    func_map['is_HOAU'] = true;
    func_map['is_FAST'] = true;
    func_map['is_POSTB'] = true;
    func_map['is_YCT'] = true;
    func_map['is_XB'] = true;
    func_map['is_NEDA'] = true;
    func_map['is_QRT'] = true;
    func_map['is_GTO'] = true;
    func_map['is_DBL'] = true;
    func_map['is_DBKD'] = true;
    func_map['is_ESB'] = true;
    func_map['is_JWY'] = true;
    func_map['is_BOYOL'] = true;
    func_map['is_YS'] = true;
    if(func_map[function_name]){
        return true;
    }else{
        return false;
    }
}

// 自动生成的验证各快递公司运单号码的函数 

function is_DFH(val){var patrn=/^[0-9]{10}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}/;if (!patrn.exec(val)) return false;return true;}
function is_SY(val){var patrn=/^29[0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_YC(val){var patrn=/^96[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_EMS(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|^(10|11)[0-9]{11}$|^(50|51)[0-9]{11}$|^(95|97)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_YTO(val){var patrn=/^[A-Za-z0-9]{2}[0-9]{10}$|^[A-Za-z0-9]{2}[0-9]{8}$|^(8)[0-9]{17}|^(9)[0-9]{17}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZJS(val){var patrn=/^[a-zA-Z0-9]{10}$|^(42|16)[0-9]{8}$|^[aA][0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_SF(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_UC(val){var patrn=/^VIP[0-9]{9}|V[0-9]{11}|[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$|^(9001)[0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENINTE(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENSH(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENSZ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENBJ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENYW(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_YANWENGZ(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|[0-9]{13}/;if (!patrn.exec(val)) return false;return true;}
function is_ZTOGZ(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_RUSTON(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_ZTOSH(val){var patrn=/11111111111111111111/;if (!patrn.exec(val)) return false;return true;}
function is_GZFY(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_LTS(val){var patrn=/^[0-9]{9,12}$/;if (!patrn.exec(val)) return false;return true;}
function is_QFKD(val){var patrn=/^[0-9]{12}$|^[0-9]{15}$/;if (!patrn.exec(val)) return false;return true;}
function is_UAPEX(val){var patrn=/^\d{12}|\d{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_BJCS(val){var patrn=/^(CS[0-9]{13})$|^([0-9]{13})$|^([0-9]{9})$/;if (!patrn.exec(val)) return false;return true;}
function is_GDEMS(val){var patrn=/^[a-zA-Z]{2}[0-9]{9}[a-zA-Z]{2}$/;if (!patrn.exec(val)) return false;return true;}
function is_SURE(val){var patrn=/^[0-9]{11}[0-9]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_EYB(val){var patrn=/^[A-Z]{2}[0-9]{9}[A-Z]{2}$|^(10|11)[0-9]{11}$|^(50|51)[0-9]{11}$|^(95|97)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZTO(val){var patrn=/^((765|852|779|359|528|751|358|618|680|778|780|768|688|689|618|828|988|118|128|888|571|518|010|628|205|880|882|717|718|728|738|761|762|763|701|757|719|881|120)[0-9]{9})$|^((2008|2010|8050|7518)[0-9]{8})$|^((36|37|53|54|55|56)[0-9]{10})$|^((4)[0-9]{11})$/;if (!patrn.exec(val)) return false;return true;}
function is_HZABC(val){var patrn=/^[0-9]{10,11}$|^T[0-9]{10}$|^FYPS[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_YUNDA(val){var patrn=/^(10|11|12|13|14|15|16|17|19|18|50|55|58|80|88|66|31)[0-9]{11}$|^[0-9]{13}$/;if (!patrn.exec(val)) return false;return true;}
function is_TTKDEX(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_CNEX(val){var patrn=/^[7,1,9][0-9]{9}$|^[7,1,9,0][0-9]{8}$/;if (!patrn.exec(val)) return false;return true;}
function is_BEST(val){var patrn=/^[0-9]{11,12}$/;if (!patrn.exec(val)) return false;return true;}
function is_FEDEX(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_SHQ(val){var patrn=/^[A-Za-z0-9]*[0|2|4|6|8]$/;if (!patrn.exec(val)) return false;return true;}
function is_HTKY(val){var patrn=/^(A|B|C|D|E|H|0)(D|X|[0-9])(A|[0-9])[0-9]{10}$|^(21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|37|38|39|61)[0-9]{10}$|^(369|639|649|630|360)[0-9]{9}$|^(50|51)[0-9]{12}$|^(7)[0-9]{13}$/;if (!patrn.exec(val)) return false;return true;}
function is_ZTKY(val){var patrn=/^K[0-9]{13}$|^K[0-9]{11}$|^[0-9]{10}$|^\d{15,}[-\d]+$|^[0-9]{10}|[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_XFWL(val){var patrn=/^130[0-9]{9}|135[0-9]{9}|13[7-9]{1}[0-9]{9}|18[8-9]{1}[0-9]{9}$/;if (!patrn.exec(val)) return false;return true;}
function is_STO(val){var patrn=/^(268|888|588|688|368|468|568|668|768|868|968)[0-9]{9}$|^(11|22|40|268|888|588|688|368|468|568|668|768|868|968)[0-9]{10}$|^(STO)[0-9]{10}$|^(33)[0-9]{11}$|^(4)[0-9]{12}$|^(55)[0-9]{11}$|^(66)[0-9]{11}$|^(77)[0-9]{11}$|^(88)[0-9]{11}$|^(99)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_LB(val){var patrn=/^[0-9]{12}$|^LBX[0-9]{15}-[2-9AZ]{1}-[1-9A-Z]{1}$|^[0-9]{15}$|^[0-9]{15}-[1-9A-Z]{1}-[1-9A-Z]{1}$/;if (!patrn.exec(val)) return false;return true;}
function is_HOAU(val){var patrn=/^[A-Za-z0-9]{8,9}$/;if (!patrn.exec(val)) return false;return true;}
function is_FAST(val){var patrn=/^[0-9]{11,13}$|^(P330[0-9]{8})$|^(D[0-9]{11})$|^(319)[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_POSTB(val){var patrn=/^[GA]{2}[0-9]{9}([2-5][0-9]|[1][1-9]|[6][0-5])$|^[99]{2}[0-9]{11}$|^[95]{2}[0-9]{11}$|^[96]{2}[0-9]{11}$|^[98]{2}[0-9]{11}$/;if (!patrn.exec(val)) return false;return true;}
function is_YCT(val){var patrn=/^[0-9]{12}$/;if (!patrn.exec(val)) return false;return true;}
function is_XB(val){var patrn=/[0-9]{8}/;if (!patrn.exec(val)) return false;return true;}
function is_NEDA(val){var patrn=/^((88|)[0-9]{10})$|^((1|2|3|5|)[0-9]{9})$|^(90000[0-9]{7})$/;if (!patrn.exec(val)) return false;return true;}
function is_QRT(val){var patrn=/^[0-9]{12,13}$/;if (!patrn.exec(val)) return false;return true;}
function is_GTO(val){var patrn=/^(3(([0-6]|[8-9])\d{8})|((2|4|5|6|7|8|9)\d{9})|(1|2|3|4|5|6|7|8|9)\d{11})$/;if (!patrn.exec(val)) return false;return true;}
function is_DBL(val){var patrn=/^[0-9]{8,10}$/;if (!patrn.exec(val)) return false;return true;}
function is_DBKD(val){var patrn=/^[0-9]{8,10}$/;if (!patrn.exec(val)) return false;return true;}
function is_ESB(val){var patrn=/[0-9a-zA-Z-]{5,20}/;if (!patrn.exec(val)) return false;return true;}
function is_OTHER(val){return true;}
