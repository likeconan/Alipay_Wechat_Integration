var xml2js = require('xml2js');
var parser = new xml2js.Parser()


module.exports = {
    //升序参数，并且拼接为key & value字符串
    raw: function (args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function (key) {
            newArgs[key] = args[key];
        });
        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    },
    // 随机字符串产生函数  
    createNonceStr: function () {
        return Math.random().toString(36).substr(2, 15);
    },

    // 时间戳产生函数  
    createTimeStamp: function () {
        return parseInt(new Date().getTime() / 1000) + '';
    },

    getXMLNodeValue: function (xml) {
        return new Promise((resolve, reject) => {
            parser.parseString(xml, function (err, result) {
                if (err) {
                    reject('err')
                } else {
                    resolve(result.xml)
                }
            })
        })

    },
    parser: parser
}