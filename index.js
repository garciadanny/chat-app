var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.send( '<h1>Hello world!</h1>')
});

app.listen(8080, function() {
    console.log('Listening on port: 8080')
});