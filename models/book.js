const mongoose = require('mongoose');


const Schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required for a book"],
        trim:true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: [true, "description is required for a book"],
        trim:true,
        minLength: 10,
    }
});

// migration

const Book = mongoose.model("Book", Schema);

module.exports = Book

