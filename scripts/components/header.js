/**
 * Created by Jin on 2017/8/16.
 */
$(function(){
    //多店铺切换
    $('body').on('click','.shop-center .shop-list .shop',function(){
        var shopId = $(this).find('input').val();
        switchShop(shopId);
    });
    function switchShop(shopId){
        var url = "/seller/shopBinding/switch?switchShopId="+shopId;
        $.ajax({
            type: "post",
            url: url,
            cache: false,
            async: true,
            success: function (data) {
                if (data.resultCode == 0) {
                    location.reload();
                    location.href = "//print.cuxiao.quannengzhanggui.net/static/seller/app/index.html#/print/unprintedExpress";
                }
            },
            error: function (data) {
                alert("resultCode:" + data.resultCode + data.resultMessage)
            }
        })
    }
});