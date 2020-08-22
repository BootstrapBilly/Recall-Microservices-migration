const Note = require("./models/Note")//import the Note model to interact with database
const Process = require("./models/Process")//import the process models to interact with the db
const User = require("./models/User")
const check_if_position_changed = require("./check_position_change_on_update")//function to check if the note position changes on title change to trigger a re-render on the frontend

exports.check_title = async (req, res, next) => {

    if (!req.body.title || !req.body.user_id) return res.status(400).json({ message: "Bad request" })//if there is no title, return 400 bad request

    const title = req.body.title.toLowerCase() //extract the title and convert it to toLowerCase
    const user_id = req.body.user_id // extract the user id from the request

    try {
        const title_in_use = await Note.findOne({ title: title, created_by: user_id })//see if a note with that title already exists for the given user
        if (title_in_use) return res.status(424).json({ message: "You already have a note with that title, please choose another" })//if it is, send a 424 and inform the user
        else return res.status(200).json({ message: "Title is okay", title:title })//otherwise send a 200, title is okay
    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.create_note = async (req, res, next) => {

    if (!req.body.title || !req.body.body) return res.status(424).json({ message: "A note must have a title and body" })//if the title is missing, send a 424 and inform the user

    if (!req.body.user_id) return res.status(400).json({ message: "Bad request" })//if no user id return a 400, bad request

    const user_id = req.body.user_id;//extract the user id from the request
    const title = req.body.title.toString().toLowerCase();//extract the title from the request and convert it to lower case string
    const subject = req.body.subject;//extract the subject from the request
    const body = req.body.body;//extract the body from the request
    let search_tags = req.body.search_tags;//extract the search tags from the request
    const syntax = req.body.syntax //extract the syntax from the request

    if (search_tags && search_tags !== Array) { search_tags = search_tags.split(" ") }//convert the given search tags to an array by splitting the string

    try {

        const title_in_use = await Note.findOne({ title: title, created_by: user_id })//see if a note with that title already exists for the given user

        if (title_in_use) return res.status(424).json({ message: "You already have a note with that title, please choose another" })//if it is, send a 424 and inform the user

        //if there are any search tags, 
        if (search_tags) search_tags = Array.from(new Set(search_tags))//create a new array from a set of the old search tags(removes any duplicates)  
            .map(String => String.toLowerCase())//and convert all elements to a string

        //* Checks passed

        const note = new Note({//create a new note, with the given details

            _id: req.body._id || null,//for testing purposes, if an object id was supplied, manually set it, otherwise set it as null and let mongodb generate it
            title: title,
            subject: subject,
            body: body,
            search_tags: search_tags,
            syntax: syntax,
            created_by: user_id,
            access_rights: []//initialse access rights as an empty array

        })

        let note_saved = await note.save()//save the new note

        const fetch_note = await Note.findOne({ title: title })//fetch the note again, to overwrite the id (Necessary for automated testing)
        .populate({ path: "created_by" })
        .populate({ path: "access_rights.user_id"})

        //if it was saved successfully, send the corresponding response
        if (note_saved && fetch_note) {

            note_saved._id = fetch_note._id//set the id of the note to return

            return res.status(201).json({ message: "Note added successfully", note: fetch_note }) //return the note

        }

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }
}

exports.update_note = async (req, res, next) => {

    if (!req.body.new_title || !req.body.new_body) return res.status(424).json({ message: "A note must have a title and body" })//if the title is missing, send a 424 and inform the user

    if (!req.body.user_id) return res.status(400).json({ message: "Bad request" })//if no user id return a 400, bad request

    const user_id = req.body.user_id;//extract the user id from the request
    const title = req.body.title.toString().toLowerCase();//extract the title from the request and convert it to lower case string
    const new_title = req.body.new_title.toString().toLowerCase();//extract the title from the request and convert it to lower case string
    const new_subject = req.body.new_subject;//extract the subject from the request
    const new_body = req.body.new_body;//extract the body from the request
    let new_search_tags = req.body.new_search_tags;//extract the search tags from the request
    const new_syntax = req.body.new_syntax //extract the syntax from the request
    const filter = req.body.filter //extract the filter (determines whether to display notes, process or both)
    const index = req.body.index //extract the index of the note (because nested notes can be modified and duplicate notes are allowed)

    try {

        if (title !== new_title) {//if they have supplied a new title

            const title_in_use = await Note.findOne({ title: new_title, created_by: user_id })//check to see if it is in use already

            if (title_in_use) {

                const note = await Note.findOne({ title: title, created_by: user_id })
                return res.status(424).json({ message: "You already have a note with that title, please choose another", id: note._id, index: index }

                )
            }//if it is, send a 424 and inform them

        }

        //if there are any search tags, 
        if (new_search_tags) new_search_tags = Array.from(new Set(new_search_tags))//create a new array from a set of the old search tags(removes any duplicates)  
            .map(String)//and convert all elements to a string

        let position_changed = false;//define a variable to determine whether the notes position has changed in the array of all notes/processes

        if (new_title && (title !== new_title)) { //if they have changed the title

            //the check_if_position_changed function is imported from util
            const result = await check_if_position_changed.check(user_id, title, new_title, filter)//see if a position change is needed

            position_changed = result//set the position changed variable to the result (either true or false)

        }

        const note_updated = await Note.findOneAndUpdate({ title: title, created_by: user_id }, {

            title: new_title,
            subject: new_subject,
            body: new_body,
            search_tags: new_search_tags,
            syntax: new_syntax,

        })
        .populate({ path: "created_by" })
        .populate({ path: "access_rights.user_id"})

        if (note_updated) {

            //find the processes with the note nested inside
            const processes_with_note_inside = await Process.find({ created_by: user_id, notes: { $elemMatch: { title: title } } })

            //and also update them
            processes_with_note_inside.forEach(process => {

                process.notes.forEach(note => {

                    if (note.title === title) {

                        note.title = new_title,
                            note.subject = new_subject,
                            note.body = new_body,
                            note.search_tags = new_search_tags,
                            note.syntax = new_syntax
                    }

                })

                process.markModified("notes")//mark them as modified so mongo will save them
                process.save()

            })

        }

        return res.status(201).json({ message: "note updated successfully", id: note_updated && note_updated._id, note: note_updated, title: new_title, position_changed: position_changed })
    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.delete_note = async (req, res, next) => {

    if (!req.body.user_id || !req.body.title) return res.status(400).json({ message: "Bad request" })//if the title is missing, send a 424 and inform the user

    const user_id = req.body.user_id;//extract the user id from the request
    const title = req.body.title.toString().toLowerCase();//extract the title from the request convert it to lower case string

    try {

        const note_deleted = await Note.findOneAndDelete({ title: title, created_by: user_id })//find and delete the note with the given title who was created by the given user

        if (!note_deleted) return res.status(424).json({ message: "We couldn't find that note" })

        //send the corresponding response
        if (note_deleted) {

            const notes_pulled_from_processes = await Process.updateMany(

                { created_by: user_id, notes: { $elemMatch: { title: title } } },
                { $pull: { notes: { title: title } } },
            )

            if (notes_pulled_from_processes) return res.status(200).json({ message: "note deleted successfully" })

        }

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.get_single_note = async (req, res, next) => {

    const user_id = req.body.user_id
    const note_id = req.body.note_id

    try {

        const note_found = await Note.findOne({ _id: note_id, created_by: user_id })
        .populate({ path: "created_by" })
        .populate({ path: "access_rights.user_id"})

        if (note_found) return res.status(200).json({ message: "Note retrieved successfully", note: note_found })

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }

}

exports.get_notes = async (req, res, next) => {

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
        .populate({ path: "access_rights.user_id"})
        //once the notes have been fetched (even if 0 was found)
        notes_fetched && res.status(200).json({ message: "notes retrieved", notes: notes_fetched })//return a 200 with all found notes attached

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}
