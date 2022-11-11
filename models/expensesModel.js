const mongoose = require("mongoose");

let expenseSchema = mongoose.Schema({

    userId: {
        type: String,
        require: true
    },
    expenses: [{
        note: {
            type: String,
            require: true
        },
        amount: {
            type: Number,
            require: true
        },
        dateAndTime: {
            type: Date,
            require: true
        }
    }
    ],


}, { collection: 'Expenses' })



module.exports = mongoose.model('Expenses', expenseSchema)