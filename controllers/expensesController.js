require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");
const Expenses = require('../models/expensesModel')

const addExpense = async (req, res) => {
    try {
        const note = req.body.note;
        const amount = req.body.amount;
        const dateAndTime = req.body.dateAndTime
        const currentDateAndTime = new Date().toISOString()
        const userId = req.user.userId

        // if user not entered date then we will add current date and time
        if (!dateAndTime) {
            let dataForExpenses = { note, amount, dateAndTime: currentDateAndTime }
            await Expenses.findOneAndUpdate(
                { userId: userId },
                { $push: { expenses: dataForExpenses } }
            )
            return res.send({ message: "expenses added successfully" })

        } else {
            let dataForExpenses = { note, amount, dateAndTime }
            await Expenses.findOneAndUpdate(
                { userId: userId },
                { $push: { expenses: dataForExpenses } }
            )
            return res.send({ message: "expenses added successfully" })
        }





    } catch (error) {
        console.log(error);
        res.send(error)
    }
}



















module.exports = {
    addExpense
};