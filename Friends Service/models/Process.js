const mongoose = require("mongoose");//Import mongoose 

const Schema = mongoose.Schema;

const process_schema = new Schema({//create a schema object

    title: {
        type: String,
        required: true
    },

    subject: {
        type: String,
    },

    search_tags: [],//an array of search tags

    body: {
        type: String,
    },

    notes: [],//an array of notes

    created_by: {//who created the process
        type: Schema.Types.ObjectId,//special schema type object id 
        ref: "User"//Refers to another user_id
    },

    access_rights: [{//people who will be able to see this process

        user_id: {//id of the friend
            type: Schema.Types.ObjectId,//special schema type object id 
            ref: "User"//Refers to another user_id
        },

    }]

});

//Export the schema for usage by controller methods
module.exports = mongoose.model("Process", process_schema); 