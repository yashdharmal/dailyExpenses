require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");
const moment = require('moment/moment');
const { mongoose } = require('mongoose');
const Expenses = require('../models/expensesModel');
const { fetchExpences } = require('../queries/expense');


const addExpense = async (req, res) => {
    try {

        const { note, amount, dateAndTime = new Date().toISOString() } = req.body
        // let dateAndTime = req.body.dateAndTime || new Date().toISOString();
        const userId = req.user.userId
        console.log(dateAndTime);
        let dataForExpenses = { note, amount, dateAndTime }
        await Expenses.findOneAndUpdate(
            { userId: userId },
            { $push: { expenses: dataForExpenses } }
        )

        return res.send({
            success: true,
            data: {
                note: note,
                amount: amount,
                dateAndTime: dateAndTime
            },
            message: "expenses added successfully"
        })


    } catch (error) {
        res.send({
            success: false,
            message: "Add Expense faild",
            error: "DE-A - 01",
            addExpenseErrorStack: {
                message: (error)
            }
        })
    }
}
const fetchExpenses = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 10, fromDate, toDate, id, daily, weekly, monthly, yearly } = req.body;
        const userId = req.user.userId;
        const filter = { userId };
        let param = {}
        // day
        const todayStartTime = moment().startOf('day').toDate();
        const todayEndTime = moment().endOf('day').toDate();
        // week
        const weekStartTime = moment().startOf('week').toDate();
        const weekEndTime = moment().endOf('week').toDate();
        // month
        const monthStartTime = moment().startOf('month').toDate();
        const monthEndTime = moment().endOf('month').toDate();
        // year
        const yearStartTime = moment().startOf('year').toDate();
        const yearEndTime = moment().endOf('year').toDate();

        if (id) {
            let expensesData = await Expenses.findOne({ userId: mongoose.Types.ObjectId(userId) });
            let expenses = expensesData.expenses
            let findExpense = expenses.filter((m => m._id.toString() === id.toString()))[0]
            return res.send({ expenses: findExpense })
        }
        else if (daily) {

            param = {
                filter,
                fromDate: todayStartTime,
                toDate: todayEndTime,
                pageNumber,
                pageSize
            }
        } else
            if (weekly) {
                param = {
                    filter,
                    fromDate: weekStartTime,
                    toDate: weekEndTime,
                    pageNumber,
                    pageSize
                }
            } else
                if (monthly) {
                    param = {
                        filter,
                        fromDate: monthStartTime,
                        toDate: monthEndTime,
                        pageNumber,
                        pageSize
                    }
                } else
                    if (yearly) {
                        param = {
                            filter,
                            fromDate: yearStartTime,
                            toDate: yearEndTime,
                            pageNumber,
                            pageSize
                        }
                    } else {
                        param = {
                            filter,
                            ...req.body,
                        }
                    }
        let data = await fetchExpences(param);
        return res.send({
            success: true,
            data,
            message: "Expesnses Fetched successfully"
        })
    } catch (error) {
        res.send({
            success: false,
            message: "Fetch Expense failed",
            error: "DE-F-01",
            EditExpenseErrorStack: {
                message: (error)
            }
        })
    }
}
const editExpense = async (req, res) => {
    try {
        const { note, amount, dateAndTime, expenseId } = req.body
        const userId = req.user.userId
        let findUser = await Expenses.findOne({ userId: userId });
        let expenses = findUser.expenses
        let findExpense = expenses.filter((m => m._id.toString() === expenseId.toString()))[0]
        let currentNote = note || findExpense.note;
        let currentAmount = amount || findExpense.amount;
        let currentDateAndTime = dateAndTime || findExpense.dateAndTime;
        await Expenses.updateOne({ 'expenses._id': expenseId }, {
            '$set': {
                'expenses.$.note': currentNote,
                'expenses.$.amount': currentAmount,
                'expenses.$.dateAndTime': currentDateAndTime
            }
        })
        return res.send({
            success: true,
            message: "expense is updated succesfully"
        })
    } catch (error) {
        res.send({
            success: false,
            message: "edit Expense failed",
            error: "DE-E-01",
            EditExpenseErrorStack: {
                message: (error)
            }
        })
    }
}

const deleteExpense = async (req, res) => {
    try {
        const userId = req.user.userId
        const expenseId = req.body.expenseId
        await Expenses.updateOne({ userId: userId }, { "$pull": { "expenses": { "_id": expenseId } } },
            { safe: true, multi: true })
        // res.send({ message: "expense deleted successfully" })

        return res.send({
            success: true,
            message: "expenses deleted successfully"
        })

    } catch (error) {
        // res.send(error)
        res.send({
            success: false,
            message: "expense Delete failed",
            error: "DE-D-01",
            deleteExpenseErrorStack: {
                message: (error)
            }
        })
    }
}

module.exports = {
    addExpense,
    fetchExpenses,
    editExpense,
    deleteExpense,
};