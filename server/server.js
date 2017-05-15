var express = require('express');
var bodyParser = require("body-parser");
var SSE = require('express-sse');
var session = require('express-session');
var http = require('http');
var redis = require('redis');
const WebSocket = require('ws');

var client = redis.createClient(6379, 'localhost');
var RedisStore = require('connect-redis')(session);

var sse = new SSE([]);
var app = express();

var error_count = 0;
client.on("error", function (err) {
  console.log("Redis error: " + err);
  error_count++;
  if(error_count > 5) {
    console.log("Exiting because of high error count.");
    process.exit(1);
  }
});

app.use(bodyParser.json({limit: "10mb"}));
app.use(express.static(__dirname + "/", {extensions: ['html']}));

var sess = {
  secret: 'keyboard cat',
  cookie: {},
  store: new RedisStore({client: client})
};

const wss = new WebSocket.Server({port: 8080});

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.post('/api/login', function (req, res) {
  if (req.body.username == "luca" && req.body.password == "abc") {
    console.log(req.session);
    req.session.loggedIn = true;
    req.session.user = {};
    req.session.user.username = "luca";
    res.json({status: "success"});
  } else {
    res.json({status: "error", error_message: "Invalid username or password."});
  }
});

app.post('/api/logout', function (req, res) {
  req.session.loggedIn = false;
  res.json({status: "success"});
});

app.post('/api/register', function (req, res) {
  console.log(req.body)
});

app.get('/api/session', function (req, res) {
  var user = req.session.user;
  if (req.session.loggedIn) {
    res.json({
      status: "success",
      data: {
        username: user.username
      }
    })
  } else {
    res.json({status: "error", error_message: "You are not logged in."});
  }
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

var port = 3000;
app.listen(port);

console.log("Server is running on port " + port);
