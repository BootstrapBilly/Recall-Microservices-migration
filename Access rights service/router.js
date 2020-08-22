//controllers
const Access = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

router.post("/share_access", Access.give_access)
router.post("/remove_access", Access.revoke_access)

module.exports = router;
