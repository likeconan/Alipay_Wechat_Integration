var express = require('express');
var app = express();
var alipay = require('./pay_alipay');
var wechat = require('./pay_wechat');


app.use('/alipay', alipay)
app.use('/wechat', wechat)

app.listen(3000, function () {
    console.log('Ready');
});