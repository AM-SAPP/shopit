require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const productRouter = require('./routes/product');
const groupRouter = require('./routes/group');
const { base } = require('./models/user');
require('./db')();
var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + "/public/chat_index.html");
});


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products',productRouter);
app.use('/api/groups',groupRouter)


var aMap = {};

function addValueToKey(key, value) {
    aMap[key] = aMap[key] || [];
    // Adds a value to the end of the Array
    aMap[key].push(value);
}

app.post("/api/addcart", (req, res) => {
     const {grpname, product} = req.body;

     addValueToKey(grpname,product);
     res.send("prod added");
});

app.get("/api/get_items",(req,res)=>{
    const grpname=req.query.groupname;
    var products=[];
    if(aMap[grpname]===undefined){
      res.status(400).json("Group does not exist");
    }else{
      aMap[grpname].forEach((item)=>{
        products.push(item);
     })

      res.send(products);
    }
    
});



app.use("*",(req,res)=>{
  res.status(400).json("this method is not supported");
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
