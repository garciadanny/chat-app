var express = require('express');
var app = express();

app.use(express.static(__dirname + '/app/views'));
app.use(express.static(__dirname + '/app/assets'));

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.listen(8080, function() {
    console.log('Listening on port: 8080')
});
