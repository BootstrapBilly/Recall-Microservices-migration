//Controllers
const Authentication = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/user", Authentication.create_user)
router.post("/login", Authentication.login)
router.post("/refresh_jwt", Authentication.refresh_jwt)
router.post("/check_email", Authentication.check_email)
router.post("/check_username", Authentication.check_username)
router.post("/password_reset", Authentication.generate_email)
router.post("/change_password", Authentication.change_password)


module.exports = router;