var express = require('express');
var wechat = express();
var crypto = require('crypto');
var request = require("request");

var helper = require('./helper')

// 配置相关变量
const APPID = ''          //你的微信应用APPID
const MCH_ID = ''         //你的商户ID
const KEY = ''            //设置的密钥key 
const NOTIFY_URL = 'http://192.168.1.45:3000/wechat/notify_url'     //设置你的回调地址


// 根据订单产生prepay的签名
var prepaySign = function (order) {
    var ret = {
        appid: APPID,
        body: order.body,
        mch_id: MCH_ID,
        nonce_str: order.nonce_str,
        notify_url: NOTIFY_URL,
        out_trade_no: order.out_trade_no,
        spbill_create_ip: order.spbill_create_ip,
        total_fee: order.total_fee,
        trade_type: 'APP'
    };
    var string = helper.raw(ret);
    string = string + '&key=' + KEY;
    var crypto = require('crypto');
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
    return sign.toUpperCase();
}


//根据prepay的id，产生支付的签名
var paySign = function (prepay) {
    var ret = {
        appid: APPID,
        noncestr: prepay.nonce_str,
        package: 'Sign=WXPay',
        partnerid: MCH_ID,
        prepayid: prepay.prepayid,
        timestamp: prepay.timestamp
    };
    var string = helper.raw(ret);
    string = string + '&key=' + KEY;
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
    return sign.toUpperCase();
}


// 访问微信，根据订单信息，获取prepay并且生成最后的支付订单内容
var requestPrepay = function (order) {

    return new Promise((resolve, reject) => {
        var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
        var formData = "<xml>";
        formData += "<appid>" + APPID + "</appid>"; //appid  
        formData += "<body>" + order.body + "</body>";
        formData += "<mch_id>" + MCH_ID + "</mch_id>"; //商户号  
        formData += "<nonce_str>" + order.nonce_str + "</nonce_str>"; //随机字符串，不长于32位。  
        formData += "<notify_url>" + NOTIFY_URL + "</notify_url>";
        formData += "<out_trade_no>" + order.out_trade_no + "</out_trade_no>";
        formData += "<spbill_create_ip>" + order.spbill_create_ip + "</spbill_create_ip>";
        formData += "<total_fee>" + order.total_fee + "</total_fee>";
        formData += "<trade_type>APP</trade_type>";
        formData += "<sign>" + prepaySign(order) + "</sign>";
        formData += "</xml>";
        request({
            url: url,
            method: 'POST',
            body: formData
        }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                helper.getXMLNodeValue(body.toString("utf-8")).then((XML_RETURN) => {
                    var code = XML_RETURN.return_code[0];
                    var msg = XML_RETURN.return_msg[0];
                    if (code != 'SUCCESS' || msg != 'OK') {
                        deferred.reject({ message: XML_RETURN.return_msg[0] })
                        console.log(XML_RETURN)
                        return;
                    }

                    var prepay_id = XML_RETURN.prepay_id[0];

                    //签名  
                    var _paySign = paySign(Object.assign({ prepayid: prepay_id }, order));
                    var args = {
                        appId: APPID,
                        partnerId: MCH_ID,
                        prepayId: prepay_id,
                        nonceStr: order.nonce_str,
                        timeStamp: order.timestamp,
                        package: 'Sign=WXPay',
                        sign: _paySign
                    };
                    resolve(args);
                })

            } else {
                reject(err)
                console.log(body);
            }
        });
    })

}


//产生订单
wechat.post('/pay', function (req, res) {

    requestPrepay({
        body: '免费赠送IPhone X',
        out_trade_no: '453234533123',
        nonce_str: helper.createNonceStr(),
        spbill_create_ip: '192.168.1.45',  //一般可以从客户端获取用户IP,
        total_fee: '1',                    //单位为分
        timestamp: helper.createTimeStamp()
    }).then((data) => {
        res.send(data)
    })
})


//回调方法
wechat.post('/notify_url', function (req, res) {
    parser.parseString(req.body, function (err, result) {
        var wechatPayResult = result.xml

        console.log('wechat', wechatPayResult)
        var success = wechatPayResult.return_code[0] == 'SUCCESS'

        res.setHeader('content-type', 'application/xml')
        res.send('<xml><return_code><![CDATA[' + success ? 'SUCCESS' : 'FAIL' + ']]></return_code><return_msg><![CDATA[' + success ? 'OK' : 'FAIL' + ']]></return_msg></xml>')
    })

})


module.exports = wechat;