//Controllers
const Friends = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/friend", Friends.add_friend)
router.post("/process_friend_request", Friends.process_request)
router.post("/get_friends", Friends.get_friends)
router.post("/cancel_request", Friends.cancel_request)
router.post("/delete_friend", Friends.delete_friend)


module.exports = router;