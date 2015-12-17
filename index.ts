/// <reference path="typings/socket.io/socket.io.d.ts" />
/// <reference path="typings/express/express.d.ts" />
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('wtf is going on');
});

var port = process.env.port || 8000;

app.listen(8000);
