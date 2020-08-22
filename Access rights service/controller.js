const Note = require("./models/Note")//import the note schema to interact with the database
const Process = require("./models//Process")//import the process schema to interact with the database
const User = require("./models//User")//import the user schema to interact with the database

exports.give_access = async (req, res, next) => {
    
    //if any required request fields are missing, or wrong, send a 400 and inform the user
    if (!req.body.user_id || !req.body.friend_id || !req.body.note_or_process_id || !type_is_valid(req.body.type)) return res.status(400).json({ message: "Bad request" })

    const user_id = req.body.user_id//extract the user id
    const friend_id = req.body.friend_id//extract the friend's user id
    const note_or_process_id = req.body.note_or_process_id//extract the note or process id
    const type = req.body.type//extract the type (note or process)

    try {

        //search for the user, and check if their friends list contains the given friend id
        const users_are_friends = await User.findOne({ _id: user_id, friends: { $elemMatch: { user_details: friend_id } } })
        
        //if they are not friends, send a 424 and inform them
        if (!users_are_friends) {return res.status(400).json({ message: "Bad request" })}

        //?note
        if (type === "note") {

            //check to see if the note already permits access to the given friend id
            const rights_already_granted = await Note.findOne({ _id: note_or_process_id, created_by: user_id, access_rights: { $elemMatch: { user_id: friend_id } } })
            if (rights_already_granted) return res.status(400).json({ message: "Bad request" })//if rights are already granted to the friend, send a 400 bad request

            //*Check passed, grant the rights
            const rights_granted = await Note.findOneAndUpdate(

                { _id: note_or_process_id, created_by: user_id },
                { $push: { access_rights: { user_id: friend_id } } }

            )

            if (!rights_granted) return res.status(400).json({ message: "Bad request" })//if any checks fail, send a 400 bad request

            else return res.status(200).json({ message: "Rights granted" })//return a 200 and inform the user

        }

        //_process
        if (type === "process") {

            //check to see if the note already permits access to the given friend id
            const rights_already_granted = await Process.findOne({ _id: note_or_process_id, created_by: user_id, access_rights: { $elemMatch: { user_id: friend_id } } })
            if (rights_already_granted) return res.status(400).json({ message: "Bad request" })//if access rights have already been granted, send a 400 bad request

            //*Check passed, grant the rights
            const rights_granted = await Process.findOneAndUpdate(

                { _id: note_or_process_id, created_by: user_id },
                { $push: { access_rights: { user_id: friend_id } } }

            )

            if (!rights_granted) return res.status(400).json({ message: "Bad request" })//if any checks fail, send a 400 bad request

            else return res.status(200).json({ message: "Rights granted" })//return a 200 and inform the user

        }

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }
}

exports.revoke_access = async (req, res, next) => {

    //if any required request fields are missing, or wrong, send a 400 and inform the user
    if (!req.body.user_id || !req.body.friend_id || !req.body.note_or_process_id || !type_is_valid(req.body.type)) return res.status(400).json({ message: "Bad request" })

    const user_id = req.body.user_id//extract the user id
    const friend_id = req.body.friend_id//extract the friend's user id
    const note_or_process_id = req.body.note_or_process_id//extract the note or process id
    const type = req.body.type//extract the type (note or process)

    try {

        //?note
        if (type === "note") {//if they want to remove rights from a note

            const rights_removed = await Note.findOneAndUpdate(//find the note and update it

                { _id: note_or_process_id, created_by: user_id }, //find it by the given note id and user id
                { $pull: { access_rights: { user_id: friend_id } } }//update it by pulling the given friend id from the access rights

            )

            if (!rights_removed) return res.status(400).json({ message: "Bad request" })//if any checks fail, send a 400 bad request


            else return res.status(200).json({ message: "Rights removed" })//return a 200 and inform the user
        }

        //_process
        if (type === "process") {

            const rights_removed = await Process.findOneAndUpdate(//find the process and update it

                { _id: note_or_process_id, created_by: user_id }, //find it by the given process id and user id
                { $pull: { access_rights: { user_id: friend_id } } }//update it by pulling the given friend id from the access rights

            )

            if (!rights_removed) return res.status(400).json({ message: "Bad request" })//if any checks fail, send a 400 bad request

            else return res.status(200).json({ message: "Rights removed" })//return a 200 and inform the user
        }

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }
}

const type_is_valid = type => {

    if (type === "note") return true
    if (type === "process") return true
    else return false

}