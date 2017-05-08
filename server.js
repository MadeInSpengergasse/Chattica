var express = require('express');
var bodyParser = require("body-parser");
var SSE = require('express-sse');
var storage = require('node-persist');
var http = require('http');

var sse = new SSE([]);
var app = express();

app.use(bodyParser.json({limit: "10mb"}));
app.use(express.static('static', {extensions: ['html']}));

// background image, middletext text, middletext fontsize
app.post('/update_middletext', function (req, res) {
    console.log(req.body);
    if(req.body.type == "middletext") {
        var content = {"text": req.body.content.text, "fontsize": req.body.content.fontsize};
        sse.send({"type": "middletext", "content": content});
        storage.setItemSync("middletext", content)
    }
    res.send("Sent.");
});

app.post('/update_bg', function(req, res) {
    storage.setItemSync("background", req.body.background);
    sse.send({"type": "background", "background": req.body.background});
});

app.get('/current_values', function(req, res) {
    res.send({"middletext": storage.getItemSync("middletext"), "background": storage.getItemSync("background"), "scrolltext": storage.getItemSync("scrolltext")});
});

app.get('/stream', sse.init);

var port = 3000;
app.listen(port);

console.log("Server is running on port " + port);
