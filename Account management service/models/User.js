const mongoose = require("mongoose");//Import mongoose 

const Schema = mongoose.Schema;

const user_schema = new Schema({//create a schema object

    username:{
        type:String,//of type string
        required:true,//Must be defined when a user object is created
    },

    email_address: {
        type: String,//Of type string
        required: true//Must be defined when a user object is created
    },

    password: {
        type: String,//Of type string
        required: true//Must be defined when a user object is created
    },

    image_url:{
        type: String
    },

    friends: [{

        user_details: {//id of the friend
            type: Schema.Types.ObjectId,//special schema type object id 
            ref: "User"//Refers to another user_id
        }

    }],

    friend_requests: [{

        user_details: {//id of the friend
            type: Schema.Types.ObjectId,//special schema type object id 
            ref: "User"//Refers to another user_id
        }

    }],

    outgoing_friend_requests: [{

        user_details: {//id of the friend
            type: Schema.Types.ObjectId,//special schema type object id 
            ref: "User"//Refers to another user_id
        }

    }],

    reset_token:{type:String},//reset token (Set by the generate password reset email endpoint to verify that the user identity)

    token_expiration:{type:Number},//used to make the token expire after 1 hour
    
});

//Export the schema for usage by controller methods
module.exports = mongoose.model("User", user_schema); 