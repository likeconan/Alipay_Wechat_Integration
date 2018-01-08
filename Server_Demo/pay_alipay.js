var express = require('express');
var helper = require('./helper')
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var moment = require('moment');

var alipay = express();

// 支付宝生成签名
var signed = function (order) {
    const app_id = ''; //此app_id为你申请的支付宝的应用APPID

    //生成一个基本的订单信息，必要的参数和值如下，更多参数和用法请参考官方文档

    var biz_content = '{"timeout_express":"60m",' +  //允许支付的最晚时间
        '"product_code":"QUICK_MSECURITY_PAY",' +
        '"total_amount":"' + order.total_amount + '",' + //支付金额，以元为单位
        '"subject":"' + order.subject + '",' +
        '"body":"' + order.body + '",' +
        '"out_trade_no":"' + order.out_trade_no + '"}'; //自己平台的支付订单号码


    var unsigned = {
        app_id: app_id,
        method: 'alipay.trade.app.pay',
        charset: 'utf-8',
        sign_type: 'RSA2',
        version: '1.0',
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        biz_content: biz_content,
        notify_url: 'http://192.168.1.45:3000/alipay/notify_url' //此处为支付宝服务端调用成功后通知你时会访问的url
    }
    var unsignedStr = helper.raw(unsigned);

    let private_key = fs.readFileSync('./config/alipay_private_key.pem'); //获取商户应用私钥
    let signer = crypto.createSign('RSA-SHA256');  //创建RSA2加密算法示例
    signer.update(unsignedStr);  //添加需要加密的字符串
    let sign = signer.sign(private_key, 'base64');  //加密并且以base64的形式返回

    return qs.stringify(unsigned) + '&sign=' + encodeURIComponent(sign)    //encode
}


var verified = function (response, sign) {
    let public_key = fs.readFileSync('./config/alipay_public_key.pem');
    var verify = crypto.createVerify('RSA-SHA256');
    verify.update(response);
    return verify.verify(public_key, sign, 'base64')

}

//支付宝获取签名的订单信息
alipay.post('/pay', function (req, res) {
    var signedStr = signed({
        body: '测试支付',//预祝春节快乐，1分钱购，赠送IPhone X一人一部
        subject: '测试支付',//免费赠送IPhone X
        out_trade_no: '70501111111S00113119',  //自己平台的支付订单号码
        total_amount: '0.01'       //支付金额，以元为单位
    })

    res.send(signedStr);
})

alipay.post('/notify_url', function (req, res) {
    debugger
    console.log(req)
})


















module.exports = alipay;