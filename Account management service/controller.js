const User = require("./models/User")//import the note schema to interact with the database
const bcrypt = require("bcryptjs")//import bcrypt to encrypt the password

const validate_password = require("./validate_password")

exports.Change_username = async (req, res, next) => {

    const user_id = req.body.user_id//extract the user id from the request
    const username = req.body.username.toString().toLowerCase()//extract the username from the request
    const password = req.body.password//extract the password from the request

    try {

        const user = await User.findOne({ _id: user_id })

        const password_matches = await bcrypt.compare(password, user.password)//use bcyrpt to check if the hashed password in the db matches the given password

        if (!password_matches) return res.status(424).json({ message: "Sorry, your password is incorrect" })//if it doesnt match, send an error response

        if (user.username !== username) {//only run the following test if the submitted a username which is different to their current one
            
            const username_taken = await User.findOne({ username: username })//check if the desired username is already taken

            if (username_taken) return res.status(424).json({ message: "Sorry, that username is not available" })//if the username is taken, send an error response

        }

        //*all checks passed

        const username_updated = await User.findOneAndUpdate({ _id: user_id }, { username: username })

        if (username_updated) return res.status(200).json({ message: "Username updated successfully" })

    }


    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.Change_password = async (req, res, next) => {

    const user_id = req.body.user_id//extract the user id from the request
    const old_password = req.body.old_password//extract the old password from the request
    const password = req.body.password//extract the new password from the request
    const repeat_password = req.body.repeat_password//extract the repeated new password from the request

    try {

        const user = await User.findOne({ _id: user_id })//find the user

        const password_matches = await bcrypt.compare(old_password, user.password)//use bcyrpt to check if the hashed password in the db matches the given password

        if (!password_matches) return res.status(424).json({ message: "Sorry, your old password is incorrect" })//if it doesnt match, send an error response

        const result = validate_password.validate(password, repeat_password)//Scan the password, checking that it conforms
        if (result !== "okay") return res.status(424).json({ message: result })//if the password is not valid, send a response with the reason why

        //*all checks passed

        const hashed_password = await bcrypt.hash(password, 12)//bcrypt.hash encrypts the user password, 12 is the salt

        user.password = hashed_password//overwrite their password with the given new password

        const password_updated = await user.save()

        if(password_updated) return res.status(200).json({message:"Password changed successfully"})





    }


    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.Set_url = async (req,res,next) => {

    const url = req.body.url.url
    const user_id = req.body.url.user_id

    try{

        const url_set = await User.findOneAndUpdate({_id:user_id}, {image_url:url})
        if(url_set) return res.status(201).json({success:true, message:"Image uploaded successfully"})
    }


    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.Get_url = async (req,res,next) => {

    const user_id = req.body.user_id

    try{

        const user_found = await User.findOne({_id:user_id})

        user_found && res.status(200).json({success:true, message:"Image fetched successfully", url:user_found.image_url})
    }


    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}