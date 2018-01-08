var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var alipay = require('./pay_alipay');
var wechat = require('./pay_wechat');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/alipay', alipay)
app.use('/wechat', wechat)

app.listen(3000, function () {
    console.log('Ready');
});