const express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
const bodyParser = require('body-parser');
const path = require('path');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo')(session);


server.listen(3000);

//Bodyparser parses fields sent in json format, axios send fields in json
app.use(bodyParser.json());

//use passport to turn the user in to an id at the beginning and turn the id into an user at the end
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
    return done(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());

const User = require('./User');
const Document = require('./Document');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

app.use(session({
  secret: 'secret sauce',
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.send('successully connected to the server');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('successfully logged in');
});

app.get('/register', (req, res) => {
  // res.sendFile(path.join(__dirname, "..", 'build', "register.html"));
  res.send('get register');
});

app.post('/register', (req, res) => {
  console.log('register body', req.body);
  const newUser = new User(req.body);
  newUser.save((err, result) => {
    if (err) {
      res.json({success: false, error: err});
    } else {
      res.json({success: true});
    }
  });
});

app.post('/newdoc', (req, res) => {
  const newDoc = new Document(req.body);
  newDoc.save((err, result) => {
    if (err) {
      res.send('there was some kind of error');
    } else {
      res.send(result);
    }
  });
});

app.post('/updatedoc', (req, res) => {

  Document.findById(req.body.id, (err, doc) => {
    if (err) {
      console.error(err);
    } else {
      doc.body = req.body.body;
      doc.save()
      .then(()=>{
        console.log('body updated');
        res.send('body updated');
      });
    }
  });
});

app.post('/addSharedDoc', (req, res) => {
  console.log(req.body.id);
  Document.findById(req.body.id, (err, doc) => {
    if (err) {
      console.log(err);
    } else if (!doc){
      res.send('error finding doc');
    } else {
      res.send(doc.body);
    }
  });
});

app.get('/documents', (req, res) => {
  Document.find()
  .then((docs)=>{
    res.send(docs);
  })
  .catch((error)=>{
    res.send(error);
  });
});

io.on('connection', function(socket) {
  let currentName = '';
  console.log('connected to sockets');
  io.emit('message', 'here');
  socket.on('join room', (roomName)=>{
    console.log('submitted join room request for: ', roomName);

    currentName = roomName;
    socket.join(roomName);
    io.in(roomName).clients((err, clients)=>{
      console.log(clients);
    });
    io.to(roomName).emit('message', `someone successfully joined ${roomName}!`);
    // socket.on('update', (contentState)=>{
    //   io.to(roomName).emit('update', contentState);
    // });

  });
  socket.on('leave room', (roomName)=>{
    console.log(`leaving ${roomName}`);
    socket.leave(roomName);
  });

  socket.on('update', (contentState, selection) => {
    console.log('receieved update request');
    io.to(currentName).emit('update', contentState);
  });
});

// app.use((req, res, next) => {
//   if (req.user) {
//     next();
//   } else {
//     console.log('HERE');
//     res.send('error');
//   }
// });


server.listen(3000, function () {
  console.log('Backend server for Electron App running on port 3000!');
});
