//controllers
const Account_Settings = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

router.post("/change_username", Account_Settings.Change_username)
router.post("/change_password_account", Account_Settings.Change_password)
router.post("/set_image_url", Account_Settings.Set_url)
router.post("/fetch_image_url", Account_Settings.Get_url )

module.exports = router;
