//Controllers
const Authentication = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/delete_user", Authentication.delete_user)

module.exports = router;