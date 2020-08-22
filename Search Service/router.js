//Controllers
const Search = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/search", Search.find_content)
router.post("/search_user", Search.find_user)
router.post("/search_friends", Search.search_friends)

module.exports = router;