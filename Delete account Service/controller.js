const User = require("./models/User")//import the user schema to interact with the database
const Note = require("./models/Note")//import the note schema to interact with the database
const Process = require("./models/Process")//import the Process schema to interact with the database
const bcrypt = require("bcryptjs")//import bcrypt to encrypt the password

exports.delete_user = async (req, res, next) => {

    //if any required fields are missing, return a 400 bad request
    if (!req.body.user_id || !req.body.password) return res.status(400).json({ message: "Bad request" })

    const user_id = req.body.user_id //extract the user id
    const password = req.body.password//password

    try {

        const user = await User.findOne({ _id: user_id })//find the given user id
        if (!user) return res.status(424).json({ message: "No user found" })//if no user was found, send a 424 and inform them

        const password_matches = await bcrypt.compare(password, user.password)//use bcyrpt to check if the hashed password in the db matches the given password
        if (!password_matches) return res.status(424).json({ message: "Sorry, your password is incorrect" })//if the password doesnt match, send a 424 and inform them

        //*Checks passed
        const user_deleted = await user.remove()//delete the given user

        if (user_deleted) {

            const users_notes_deleted = await Note.deleteMany({ created_by: user_id })
            const users_processes_deleted = await Process.deleteMany({ created_by: user_id })

            if (users_notes_deleted && users_processes_deleted) return res.status(200).json({ message: "Account deleted" })//when the user is deleted, send a 200 and inform them
        }

    }
    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }

}