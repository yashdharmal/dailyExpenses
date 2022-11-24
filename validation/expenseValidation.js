const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

const addExpenseSchema = Joi.object({
    note: Joi.string().min(2).max(50).required(),

    amount: Joi.number().positive().required(),

    dateAndTime: Joi.date().iso()


})



const updateExpenseSchema = Joi.object({
    expenseId: Joi.objectId().required(),

    note: Joi.string().min(2).max(50),

    amount: Joi.number().positive(),

    dateAndTime: Joi.date().iso()
})


const deleteExpenseSchema = Joi.object({
    expenseId: Joi.objectId().required()
})

const fetchExpencesSchema = Joi.object({
    fromDate: Joi.date().iso(),

    toDate: Joi.date().iso(),

    daily: Joi.boolean().valid(true),

    weekly: Joi.boolean().valid(true),

    monthly: Joi.boolean().valid(true),

    yearly: Joi.boolean().valid(true),

    pageNumber: Joi.number().positive(),

    pageSize: Joi.number().positive(),

    id: Joi.objectId().required(),



})


module.exports = {
    addExpenseSchema,
    updateExpenseSchema,
    deleteExpenseSchema,
    fetchExpencesSchema

}