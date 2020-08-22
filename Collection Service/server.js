//routes 
const router = require("./router")

//External
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//-File configuration
dotenv.config();

const MONGODBURI = `mongodb://Billy:${process.env.mongopw}@billy-shard-00-00-qqthk.mongodb.net:27017,billy-shard-00-01-qqthk.mongodb.net:27017,billy-shard-00-02-qqthk.mongodb.net:27017/Recall?ssl=true&replicaSet=Billy-shard-0&authSource=admin&retryWrites=true&w=majority`
//The mongodb connection string

const server = express();

server.use((req, res, next) => {

  res.setHeader("Access-Control-Allow-Origin", "*");//Allow all requests to prevent cors errors
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");//types of methods to allow
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");//Types of headers (Json and JWTS)
  next();

})

//=Middleware
server.use(bodyParser.json());//parse any incoming json requests

server.use(router)

//* Database connection

mongoose
  .connect(MONGODBURI, { useNewUrlParser: true })//connect to the database
  .then(result => {
    server.listen(process.env.PORT || 4000);//then start the server
    console.log("\n\x1b[36mCollection service running on port 4000\n")//and log it to the console
  })
  .catch(err => {//if theres an error
    console.log(err);//log it
  });



