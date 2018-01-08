var express = require('express');
var wechat = express();


wechat.get('/pay', function (req, res) {
    res.send('OK')
})



















module.exports = wechat;