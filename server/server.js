var express = require('express');
var bodyParser = require("body-parser");
var SSE = require('express-sse');
var session = require('express-session');
var http = require('http');
var redis = require('redis');
const WebSocket = require('ws');
var bcrypt = require('bcrypt');

var client = redis.createClient(6379, 'localhost');
var RedisStore = require('connect-redis')(session);

var sse = new SSE([]);
var app = express();

var error_count = 0;
client.on("error", function (err) {
  console.log("Redis error: " + err);
  error_count++;
  if (error_count > 5) {
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

var sessionParser = session(sess);
app.use(sessionParser);

app.post('/api/login', function (req, res) {
  if (req.body.username && req.body.password) {
    // var hash = getFromDbForUser(req.body.username);
    var hash = '$2a$10$BfDijpQGEsH.UH7QSbMDuOMvZFz1sFbAZZOsvrNzmcY9Xf3IzdrNS'; // 'abc' hashed
    if (bcrypt.compareSync(req.body.password, hash)) {
      console.log(req.session);
      req.session.loggedIn = true;
      req.session.user = {};
      console.log("Logging in new user with username : " + req.body.username);
      req.session.user.username = req.body.username;
      res.json({status: "success"});
    } else {
      res.json({status: "error", error_message: "Invalid username or password."});
    }
  } else {
    res.json({status: "error", error_message: "Please supply both username and password!"});
  }
});

app.post('/api/logout', function (req, res) {
  req.session.loggedIn = false;
  res.json({status: "success"});
});

app.post('/api/register', function (req, res) {
  console.log(req.body);
  //TODO Save into database
  var hash = bcrypt.hashSync(req.body.password, 10);
  console.log("Save into db: " + req.body.username + " - " + hash);
  res.json({status: "success"});
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

app.get('*', function (req, res) {
  res.sendfile(__dirname + "/index.html");
});

/* --- END EXPRESS --- */
/* --- START WEBSOCKETS --- */
var ws_array = [];

wss.on('connection', function connection(ws) {
  // "Inject" (?) express-session variables into ws -> http://stackoverflow.com/a/27727505/3527128
  sessionParser(ws.upgradeReq, {}, function () {
    console.log(ws.upgradeReq.session);
    // do stuff with the session here
  });

  ws_array.push(ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws_array.forEach(function (client) {
      if (client.readyState === client.OPEN) {
        var username = ws.upgradeReq.session.user.username;
        client.send(JSON.stringify({username: username, message: message}));
      } else {
        console.log("Failed to send message to client (because socket is not open)! Ignoring.");
      }
    });
  });
  ws.send(JSON.stringify({username: "System", message: "Welcome to the server!"}));

  ws.on('close', function () {
    // ws_array
    console.log("Should remove client from array.");
    var idx = ws_array.indexOf(ws);
    if (idx !== -1) {
      ws_array.splice(idx, 1);
      console.log("Removed client.");
    } else {
      console.log("Failed to remove client!");
    }
  });
});

var port = 3000;
app.listen(port);

console.log("Server is running on port " + port);
