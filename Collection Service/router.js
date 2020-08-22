//Controllers
const Collection = require("./controller")

//External
const express = require("express");//import express 

//Config
const router = express.Router();//initialise the router

//routes
router.post("/processes", Collection.create_process)
router.post("/update_process", Collection.update_process)
router.post("/delete_process", Collection.delete_process)
router.post("/get_processes", Collection.get_processes)
router.post("/get_single_collection", Collection.get_single_collection)
router.post("/reorder_collection_notes", Collection.reorder_collection_notes)
router.post("/add_to_collection", Collection.add_to_collection)

router.post("/check_process_title", Collection.check_title)

module.exports = router;