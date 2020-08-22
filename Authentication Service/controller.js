const User = require("./models/User")//import the user schema to interact with the database
const Note = require("./models/Note")//import the note schema to interact with the database
const Process = require("./models/Process")//import the Process schema to interact with the database
const bcrypt = require("bcryptjs")//import bcrypt to encrypt the password
const jwt = require("jsonwebtoken")//Import json web tokens 
const crypto = require("crypto");//import the built in crypto feature from node

const send_email = require("./send_email")//import the email util function
const validate_password = require("./validate_password")

exports.check_email = async (req, res, next) => {

    if (!req.body.email) return res.status(400).json({ message: "Bad request" })//if there is no email, return 400 bad request

    const email = req.body.email.toLowerCase() //extract the email and convert it to toLowerCase

    try {
        const email_in_use = await User.findOne({ email_address: email })//Does the email already exist in the database?
        if (email_in_use) return res.status(424).json({ message: "Sorry, that email is unavailable" })//if so, abort and inform the user
        else return res.status(200).json({ message: "Email is okay" })//otherwise sebd a 200, email is okay
    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.check_username = async (req, res, next) => {

    if (!req.body.username) return res.status(400).json({ message: "Bad request" })//if there is no username, return 400 bad request

    const username = req.body.username.toString().toLowerCase()//the username

    try {
        const username_in_use = await User.findOne({ username: username })//Check to see if the username already exists in the database
        if (username_in_use) return res.status(424).json({ message: "Sorry, that username is unavailable" })//if so, abort and inform the user
        else return res.status(200).json({ message: "Username is okay" })//otherwise send a 200, username is okay
    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}

exports.create_user = async (req, res, next) => {

    //if any required fields are missing, return a 400 bad request
    if (!req.body.email || !req.body.password || !req.body.repeat_password || !req.body.username) return res.status(400).json({ message: "Bad request" })

    const email = req.body.email.toLowerCase() //extract the email and convert it to lowercase
    let password = req.body.password//password
    let repeat_password = req.body.repeat_password//and second password from the response
    const username = req.body.username.toString().toLowerCase()//the username

    if (req.body.password === "facebook_signup") {

        password = process.env.test
        repeat_password = process.env.test
    }

    try {

        const email_in_use = await User.findOne({ email_address: email })//Does the email already exist in the database?
        if (email_in_use) return res.status(424).json({ message: "Sorry, that email is unavailable" })//if so, abort and inform the user

        const username_in_use = await User.findOne({ username: username })//Check to see if the username already exists in the database
        if (username_in_use) return res.status(424).json({ message: "Sorry, that username is unavailable" })//if so, abort and inform the user

        const result = validate_password.validate(password, repeat_password)//Scan the password, checking that it conforms
        if (result !== "okay") return res.status(424).json({ message: result })//if the password is not valid, send a response with the reason why

        //*All password checks passed, hash the password
        const hashed_password = await bcrypt.hash(password, 12)//bcrypt.hash encrypts the user password, 12 is the salt

        if (!hashed_password) return res.status(500).json({ message: "Sorry, something went wrong with our server" })//if the password was not hashed properly

        //*Password hashed correctly, create a new user
        const user = new User({//create a new user object from the schema

            _id: req.body._id || null,//for testing purposes, if an object id was supplied, manually set it, otherwise set it as null and let mongodb generate it
            email_address: email,//set their email
            password: hashed_password, //set the hashed_password NOT THE PLAIN TEXT PASSWORD
            username: username,//set their username
            image_url: null,
            friends: [],//initialize friends as an empty array
            friend_requests: [],//initialize the friends requests as an empty array 
            outgoing_friend_requests: [],//initialize the friends requests as an empty array 
            reset_token: null,//reset token for resetting passwords
            token_expiration: null,//token expiration date

        })

        const user_saved = await user.save()//save the new user

        if (!user_saved) return res.status(500).json({ message: "Sorry, something went wrong with our server" }) //If there was an error, send a 500 server error

        const new_user = await User.findOne({ email_address: email })//find the newly created user to get their id

        //otherwise, generate a json web token with the user's id
        const token = generate_jwt(new_user._id)
        const refresh = generate_jwt(new_user._id, true)

        //if they saved correctly, send a 201 success response         
        return res.status(201).json({ message: "User created", token: token, user_id: new_user._id, username: new_user.username, refresh_token: refresh })

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }



}

exports.refresh_jwt = async (req, res, next) => {

    //if any required fields are missing, return a 400 bad request
    if (!req.body.refresh_token) return res.status(400).json({ message: "Bad request" })

    const refresh_token = req.body.refresh_token//extract the refresh token from the request body
    const user_id = req.body.user_id

    try {

        const refresh_token_verified = await jwt.verify(refresh_token, `${process.env.REFRESH_SECRET}`)

        if (refresh_token_verified) {

            const token = generate_jwt(user_id)
            const refresh = generate_jwt(user_id, true)

            return res.status(200).json({ message: "Token refreshed", token: token, refresh_token: refresh })

        }

        else { return res.status(400).json({ unauthorized:true }) }

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}


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

exports.login = async (req, res, next) => {

    console.log(req.body)

    //if any required fields are missing, return a 400 bad request
    if (!req.body.email || !req.body.password) return res.status(400).json({ message: "Bad request" })

    const email = req.body.email.toString().toLowerCase() //extract the email and convert it to lower case
    const password = req.body.password//password
    const request_ip = req.connection.remoteAddress//grab the request IP

    try {

        const user = await User.findOne({ $or: [{ email_address: email }, { username: email }] })//Search the database for the given email

        if (!user) return res.status(424).json({ message: "Sorry, that email/username does not exist in our database" })//if it doesn't exist, return a 424 and inform them

        const password_matches = await bcrypt.compare(password, user.password)//use bcyrpt to check if the hashed password in the db matches the given password

        if (!password_matches) {

            track_login_failure(request_ip, email)//keep track of the login failure by adding it to the loginfailures array

            const brute_force_detected = check_failed_attempts(request_ip, email)//check if the request IP has more than 3 failed attempts at the given email

            if (brute_force_detected) return res.status(418).json({ message: "Sorry, your password is incorrect", captcha: true })//if the password doesn't match, return a 424 and inform the user

            return res.status(424).json({ message: "Sorry, your password is incorrect" })//if the password doesn't match, return a 424 and inform the user

        }

        //*Passed all checks generate the token
        const token = generate_jwt(user._id)//generate a json web token with the user's id
        const refresh = await generate_jwt(user._id, true)


        clear_login_failure(request_ip, email)//clear any login failures to remove the captcha in the response next time they log in

        //token generated, login successful, respond with a message, along with the jwt and the userid
        return res.status(200).json({ message: "Login successful", token: token, user_id: user._id, username: user.username, refresh_token: refresh })

    }

    catch (error) {

        console.log(error)//if there was an error, log it and send a 500 server error
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }

}

//_ Helper methods and variables

let login_failures = []//keep track of login failures

const generate_jwt = (user_id, refresh) => {

    const token = jwt.sign({//create the web token here
        user_id: user_id.toString()//Store the user id inside the token  - Must be converted to string because its a mongodb id object
    }, refresh ? process.env.REFRESH_SECRET : process.env.JWT_SECRET,//Secret to the token
        { expiresIn: refresh ? "1y" : "15m" }//Expiry time set here
    );

    return token

}

const track_login_failure = (ip, email) => {

    const email_found = login_failures.find(failure => failure.email === email)//see if the email address has any failed attempts

    if (email_found) return email_found.attempts += 1//if it does, add another failed attempt on

    else login_failures.push({ ip: ip, email: email, attempts: 1 })//Otherwise, add the ip and email of the failed attempt

}

const check_failed_attempts = (ip, email) => {

    //check if there are more than 3 failed attempts for the given email and IP address
    const brute_force_detected = login_failures.find(failure => failure.email === email && failure.ip === ip && failure.attempts > 3)

    if (brute_force_detected) return true
    else return false

}

const clear_login_failure = (ip, email) => {
    //return the same array, without any objects that contain the given ip and email
    login_failures = login_failures.filter(failure => failure.ip !== ip && failure.email !== email)

}

exports.generate_email = async (req, res, next) => {

    console.log(req.body)

    if(!req.body.email) return res.status(400).json({message:"Bad request"})//if the email is missing, send a 400 and inform them bad request

    const email = req.body.email.toLowerCase()//extract the email from the request body and convert it to lower

    try {

        const token = crypto.randomBytes(32).toString('hex');//generate a random 32 char token

        exports.token = token;

        const user = await User.findOne({ email_address: email })//find the given email in the database

        //if it does not exist, send the same response to prevent people from abusing it to find real emails
        if (!user) return res.status(200).json({ message: "If your email address was found, we just sent you an email with instructions to reset your password" })

        //find the user, then set their reset token and expiration date                                                     1 hour from now
        const token_set = await User.findOneAndUpdate({ _id: user._id }, { reset_token: token, token_expiration: Date.now() + 36000000 })

        //then send the response, informing the user -> DO NOT SAY THAT THEIR EMAIL DOES/DOES NOT EXIST, TO PREVENT PEOPLE FROM ABUSING IT AND LEAKING EMAILS
        if (token_set) {

            send_email.password_reset(email, token, user._id)//send a password reset email, with the token and user id included

            //return a successful response and inform the user
            return res.status(200).json({ message: "If your email address was found, we just sent you an email with instructions to reset your password" })
        }

    }

    catch (error) {
        console.log(error)

        return res.status(500).json({ message: "Sorry, something went wrong with our server" })

    }

}

exports.change_password = async (req, res, next) => {

    if(!req.body.user_id || !req.body.token || !req.body.password || !req.body.repeat_password) return res.status(400).json({message:"Bad request"})//if the email is missing, send a 400 and inform them bad request

    const user_id = req.body.user_id//extract the userid from the request
    const token = req.body.token//extract the token from the request
    const password = req.body.password//extract the password from the request
    const repeat_password = req.body.repeat_password//extract the repeated password from the request

    try {

        const user = await User.findOne({ _id: user_id, reset_token: token })//find the user with the given user id and reset token

        //if they don't exist, someone is trying to abuse this endpoint, send a 418 and inform them
        if (!user) return res.status(418).json({ message: "You do not have permission to change this password" })

        //if their token is out of date, send a 401 and inform them
        if (user.token_expiration < Date.now()) return res.status(401).json({ message: "Your link has expired, please request a new one" })

        //*Token valid and in date, check the password

        const result = validate_password.validate(password, repeat_password)//Scan the password, checking that it conforms

        if(result !== "okay") return res.status(424).json({message: result})//if the password is not valid, send a response with the reason why

        //*Password is valid, encrypt the password
        const hashed_password = await bcrypt.hash(password, 12)//encrypt the new password

        if(hashed_password){//once it is encrypted

            user.password = hashed_password//set the users new password
            user.reset_token = undefined,//clear the reset token
            user.token_expiration = undefined//clear the expiration date

            const password_updated = await user.save()//save the user

            if(password_updated){//once they are saved

                return res.status(201).json({message:"Your password has been updated"})//return a success response

            }
        }



    }

    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Sorry, something went wrong with our server" })
    }

}


