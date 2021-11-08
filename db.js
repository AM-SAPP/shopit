const mongoose = require('mongoose');
const config = require('./config')
mongoose.Promise = global.Promise;
const mongoUrl = config.mongoUrl;

const connect = mongoose.connect(mongoUrl);


const mongooseConnection = ()=> connect.then((db)=>{
  console.log('Connected correctly to server');
},(err)=>{
  console.log(err);
})

module.exports = mongooseConnection;