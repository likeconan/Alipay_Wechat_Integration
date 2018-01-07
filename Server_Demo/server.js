var express = require('express');
var app = express();


app.get('/test', function (req, res) {
    res.send('OK')
})



app.listen(3000, function () {
    console.log('Ready');
});