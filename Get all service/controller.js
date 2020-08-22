const Note = require("./models/Note")//import the note schema to interact with the database
const Process = require("./models/Process")//import the process schema to interact with the database
const User = require("./models/User")//import the process schema to interact with the database

exports.get_all = async (req, res, next) => {

    if (!req.body.user_id) return res.status(400).json({ message: "Bad request" })//if the title is missing, send a 424 and inform the user

    const user_id = req.body.user_id;//extract the user id from the request body

    try {

        const notes_fetched = await Note.find({

            $or: [//either of the following criteria will return a match
                { created_by: user_id },//created by the user ?
                { access_rights: { $elemMatch: { user_id: user_id } } }//User has access rights to the note?
            ]
        })//fetch all notes which were created by the given user

            .populate({ path: "created_by" })
            .populate({ path: "access_rights.user_id" })

        const processes_fetched = await Process.find({

            $or: [//either of the following criteria will return a match
                { created_by: user_id },//created by the user ?
                { access_rights: { $elemMatch: { user_id: user_id } } }//User has access rights to the note?
            ]
        })//fetch all notes which were created by the given user
            .populate({ path: "created_by" })
            .populate({ path: "access_rights.user_id" })

        const sorted_notes = notes_fetched.sort((a, b) => (a.title > b.title) ? 1 : -1)//sort the notes in alphabetical based on title
        const sorted_processes = processes_fetched.sort((a, b) => (a.title > b.title) ? 1 : -1)//sort the processes in alphabetical based on title
        const sorted_both = sorted_notes.concat(sorted_processes).sort((a, b) => (a.title > b.title) ? 1 : -1)//sort everything in alphabetical based on title

        let nothing_found =  false;
        let no_collections_found = false;

        if(!sorted_both.length) nothing_found = true 
        else if(!sorted_processes.length) no_collections_found = true

        //once the notes have been fetched (even if 0 was found)
        notes_fetched && processes_fetched && res.status(200).json({ message: nothing_found? "No notes or collections found" : no_collections_found ? "No collections found" :  "Notes and processes retrieved", notes: sorted_notes, processes: sorted_processes, both: sorted_both })//return a 200 with all found notes attached

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}