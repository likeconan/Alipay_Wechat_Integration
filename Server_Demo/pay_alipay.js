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
        out_trade_no: '70501111111S501115',  //自己平台的支付订单号码
        total_amount: '0.01'       //支付金额，以元为单位
    })

    res.send(signedStr);
})

alipay.post('/notify_url', function (req, res) {
    var obj = req.body
    var sign = req.body.sign
    delete obj['sign']
    delete obj['sign_type']

    var verRes = verified(helper.raw(obj), sign)
    if (verRes) {
        /** 
         * 1、商户需要验证该通知数据中的out_trade_no是否为商户系统中创建的订单号，
         * 2、判断total_amount是否确实为该订单的实际金额（即商户订单创建时的金额）
         * 3、校验通知中的seller_id（或者seller_email) 是否为out_trade_no这笔单据的对应的操作方（有的时候，一个商户可能有多个seller_id/seller_email）
         * 4、验证app_id是否为该商户本身。上述1、2、3、4有任何一个验证不通过，则表明本次通知是异常通知，务必忽略。在上述验证通过后商户必须根据支付宝不同类型的业务通知，
         * 正确的进行不同的业务处理，并且过滤重复的通知结果数据。
         * 在支付宝的业务通知中，只有交易通知状态为TRADE_SUCCESS或TRADE_FINISHED时，支付宝才会认定为买家付款成功。
        */
        //按照支付结果异步通知中的描述，对支付结果中的业务内容进行1\2\3\4二次校验，校验成功后在response中返回success，校验失败返回failure
        res.send('success')
    } else {
        res.send('failure')
    }
})



module.exports = alipay;