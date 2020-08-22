//Controllers
const Note = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/notes", Note.create_note)
router.post("/update_note", Note.update_note)
router.post("/delete_note", Note.delete_note)
router.post("/get_notes", Note.get_notes)
router.post("/get_single_note", Note.get_single_note)

router.post("/check_note_title", Note.check_title)

module.exports = router;