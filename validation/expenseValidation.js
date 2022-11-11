const Joi = require('joi');

const addExpenseSchema = Joi.object({
    note: Joi.string().min(2).max(50).required(),

    amount: Joi.number().positive().required(),

    dateAndTime: Joi.date().iso()


})



module.exports = {
    addExpenseSchema
}