const Note = require("./models/Note")//import the Note model to interact with database
const Process = require("./models/Process")//import the process models to interact with the db

exports.check = async (user_id, title, new_title, filter) => {

    const all_notes = await Note.find({ created_by: user_id })//fetch all notes for the given user
    const all_processes = await Process.find({ created_by: user_id })//fetch all processes for the given user
    const notes_and_processes = all_notes.concat(all_processes)//concat them both together

    let array_to_check;

    if(filter === "Notes") array_to_check =  all_notes.sort((a, b) => (a.title > b.title) ? 1 : -1) //set the array as only notes (sorted)   
    else if (filter === "Collections") array_to_check =  all_processes.sort((a, b) => (a.title > b.title) ? 1 : -1) //set the array as only processes (sorted)   
    else array_to_check = notes_and_processes.sort((a, b) => (a.title > b.title) ? 1 : -1) //otherwise check notes and processes (sorted)

    const index_of_note = array_to_check.findIndex(note => note.title === title)//get the index of the note to be updated

    const previous_note = array_to_check[index_of_note - 1] //get the note before it
    const next_note = array_to_check[index_of_note + 1] //and the note after it

    if(new_title < title){//if the new title is smaller

        if(!previous_note) return false //if theres no note before, no position change needed

        if(new_title < previous_note.title) return true //otherwise if the new title is smaller than the title of the previous note, a position changed is needed

    }

    else if(new_title > title) {//if the new title is bigger

        if(!next_note) return false//if theres no note after, no position change needed

        if(new_title > next_note.title) return true//otherwise if the new title is bigger than the title of the next note, a position changed is needed
    }

}