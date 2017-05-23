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
  store: new RedisStore({client: client}),
  resave: false, // RedisStore has "touch" method
  saveUninitialized: true
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
    client.get("user:" + req.body.username + ":pwhash", function (err, reply) {
      if (!reply) {
        res.json({status: "error", error_message: "Invalid username or password."});
        return;
      }
      // var hash = '$2a$10$BfDijpQGEsH.UH7QSbMDuOMvZFz1sFbAZZOsvrNzmcY9Xf3IzdrNS'; // 'abc' hashed
      if (bcrypt.compareSync(req.body.password, reply)) {
        console.log(req.session);
        req.session.loggedIn = true;
        req.session.user = {};
        console.log("Logging in new user with username : " + req.body.username);
        req.session.user.username = req.body.username;
        res.json({status: "success"});
      } else {
        res.json({status: "error", error_message: "Invalid username or password."});
      }
    });
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
  if (req.body.username && req.body.password) {
    client.get(req.body.username + ":pwhash", function (err, reply) {
      // reply is null when the key is missing
      console.log(reply);
      if (reply) {
        res.json({status: "error", error_message: "User already exists."});
        return;
      }
      var hash = bcrypt.hashSync(req.body.password, 10);
      client.set("user:" + req.body.username + ":pwhash", hash);
      client.set("user:" + req.body.username + ":registered", new Date().toISOString());
      console.log("Save into db: " + req.body.username + " - " + hash);
      res.json({status: "success"});
    });
  } else {
    res.json({status: "error", error_message: "Please supply both username and password!"});
  }
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
    // console.log(ws.upgradeReq.session);
    if (!ws.upgradeReq.session.loggedIn) {
      ws.send(JSON.stringify({
        username: "Server",
        message: "You are not logged in! Please visit the login page, you will not receive messages!"
      }));
      return;
    }
    // Save connection to array
    ws_array.push(ws);
  });


  // OnMessage
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    client.incr("messagekey", function (err, reply) {
      if (reply) {
        var username = ws.upgradeReq.session.user.username;
        console.log("saving to database: " + message + " - " + username);
        client.set("message:" + reply, JSON.stringify({username: username, message: message}));
      } else {
        console.log("MESSAGEKEY ERROR WHILE INCR!!!!")
      }
    });

    ws_array.forEach(function (client) {
      if (client.readyState === client.OPEN) {
        var username = ws.upgradeReq.session.user.username;
        client.send(JSON.stringify({username: username, message: message}));
      } else {
        console.log("Failed to send message to client (because socket is not open)! Ignoring.");
      }
    });
  });

  // Welcome message
  ws.send(JSON.stringify({username: "System", message: "Welcome to the server!"}));

  client.get("messagekey", function (err, reply) { // get max key
    for (var i = 1; i <= reply; i++) { // for loop
      client.get("message:" + i, function (err, reply) { // get message
        if (reply) {
          var a = JSON.parse(reply);
          ws.send(JSON.stringify({username: a.username, message: a.message})); // actually send
        } else {
          console.log("redis errors:");
          console.log(err);
          console.log(reply);
        }

      });
    }
  });

  // OnClose
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
