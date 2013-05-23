
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , User = require('./Models/Users')
  , Todo = require('./Models/Todo')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy  
  , mongoose = require('mongoose');

var app = express();

mongoose.connect('localhost', 'todos');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ usuario: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());    
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/',function (req,res) {
  res.render('index', { user: req.user });
});

app.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/todos');
    });
  })(req, res, next);
});

app.get('/login', function (req, res){
  res.render('login', { user: req.user, message: req.session.messages });
});

app.get('/signup', function (req,res){
  res.render('signup');
});

app.post('/signup', function (req,res){
  console.log(req.body.user);
  if (!req.body.user || !req.body.password) {
    res.redirect('/signup');
  }
  var user = new User({ usuario: req.body.user, password: req.body.password });
  user.save(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('user: ' + user.usuario + " saved.");
      res.redirect('/login');
    }
  });
});

app.get('/todos', ensureAuthenticated, function (req,res) {
  Todo.find({_userId: req.user._id}, function (err,todo){
    console.log(todo);
    res.render('todos', { user: req.user, todos: todo });
  });
});

app.get('/api/todos', function (req, res){
  Todo.find({_userId: req.user._id}, function (err,todo){
    res.json(todo);
  });
});

app.get('/api/todos/:id', function (req, res){
  Todo.findById(req.params.id,function (err,todo){
    if (err){res.send(404)};
    if (todo) {res.json(todo)};
  });
});

app.post('/api/todos', function (req,res) {
  console.log(req.user);
  var todo = new Todo({
    _userId: req.user._id,
    mensaje: req.body.mensaje,
    estado: 0
  });
  todo.save(function (err,todo) {
    if (err) { 
      console.log(err);
      res.send(500);
    };
    if (todo) { res.json(todo) };
  });
});

app.delete('/api/todos/:id', function (req, res){
  Todo.remove({_id : req.params.id}, function (err){
    if (err) {return res.send(500)};
    res.send(200);
  });
});

app.put('/api/todos/:id', function (req,res){
  Todo.findByIdAndUpdate(req.params.id, { $set: { mensaje: req.body.titulo, finalizado: req.body.estado  }}, function (err,todo){
    if (err) { return res.send(500)};
    res.json(todo);
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
