require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");
const moment = require('moment/moment');
const { mongoose } = require('mongoose');
const Expenses = require('../models/expensesModel')



const addExpense = async (req, res) => {
    try {

        const { note, amount } = req.body
        let dateAndTime = req.body.dateAndTime || new Date().toISOString();
        const userId = req.user.userId
        let dataForExpenses = { note, amount, dateAndTime }
        await Expenses.findOneAndUpdate(
            { userId: userId },
            { $push: { expenses: dataForExpenses } }
        )
        return res.send({ message: "expenses added successfully" })

    } catch (error) {
        console.log(error);
        res.send(error)
    }
}
const fetchExpenses = async (req, res) => {
    try {
        const { pageNumber = 1, pageSize = 10 } = req.body;
        const userId = req.user.userId
        const { id, daily, weekly, monthly, yearly } = req.body;
        const filter = { userId: mongoose.Types.ObjectId(userId) }

        // by providing date and time

        const { fromDate, toDate } = req.body
        // day
        const todayStartTime = moment().startOf('day');
        const todayEndTime = moment().endOf('day');
        // week
        const weekStartTime = moment().startOf('week');
        const weekEndTime = moment().endOf('week')
        // month
        const monthStartTime = moment().startOf('month')
        const monthEndTime = moment().endOf('month')
        // year
        const yearStartTime = moment().startOf('year');
        const yearEndTime = moment().endOf('year');

        /// function for dry
        // compare
        function compare(a, b) {
            return new Date(b.dateAndTime) - new Date(a.dateAndTime);
        }
        // total function
        function total(arr) {

            return arr.reduce(function (acc, curr) {
                acc = curr.amount + acc
                return acc
            }, 0)
        }
        // paginate function

        function paginate(arr) {
            return arr.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
        }
        let expensesData = await Expenses.findOne(filter);
        if (id) {
            let expenses = expensesData.expenses
            let findExpense = expenses.filter((m => m._id.toString() === id.toString()))[0]
            return res.send({ expenses: findExpense })
        }
        if (daily) {
            let expenses = expensesData.expenses.filter(e => moment(e.dateAndTime).isAfter(todayStartTime) && moment(e.dateAndTime).isBefore(todayEndTime));
            let totalExpense = total(expenses)
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpense, totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        if (weekly) {
            let expenses = expensesData.expenses.filter(e => moment(e.dateAndTime).isAfter(weekStartTime) && moment(e.dateAndTime).isBefore(weekEndTime))
            let totalExpense = total(expenses)
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpense, totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        if (monthly) {
            let expenses = expensesData.expenses.filter(e => moment(e.dateAndTime).isAfter(monthStartTime) && moment(e.dateAndTime).isBefore(monthEndTime));
            let totalExpense = total(expenses)
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpense, totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        if (yearly) {
            let expenses = expensesData.expenses.filter(e => moment(e.dateAndTime).isAfter(yearStartTime) && moment(e.dateAndTime).isBefore(yearEndTime))
            let totalExpense = total(expenses)
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpense, totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        if (fromDate && toDate) {
            fromDate = moment(fromDate).startOf('day');
            toDate = moment(toDate).endOf('day');
            let expenses = expensesData.expenses.filter(e => moment(moment(e.dateAndTime)).isBetween(fromDate, toDate))
            let totalExpense = total(expenses)
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpense, totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        if (fromDate) {
            fromDate = moment(fromDate).startOf('day');
            let expenses = expensesData.expenses.filter(e => moment(e.dateAndTime).isAfter(fromDate));
            expenses.sort(compare)
            let totalExpensesRecord = expenses.length
            let expensesPaginate = paginate(expenses)
            return res.send({ totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
        }
        let expenses = expensesData.expenses
        expenses.sort(compare)
        let totalExpensesRecord = expenses.length
        let expensesPaginate = paginate(expenses)
        return res.send({ totalExpensesRecord, expenses: expensesPaginate, totalSize: expensesPaginate.length })
    } catch (error) {
        console.log(error)
        res.send(error)
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
        return res.send({ messsage: "expense is updated succesfully" })
    } catch (error) {
        res.send(error)
    }
}

const deleteExpense = async (req, res) => {
    try {
        const userId = req.user.userId
        const expenseId = req.body.expenseId

        await Expenses.updateOne({ userId: userId }, { "$pull": { "expenses": { "_id": expenseId } } },
            { safe: true, multi: true })
        res.send({ message: "expense deleted successfully" })

    } catch (error) {
        res.send(error)
    }
}

module.exports = {
    addExpense,
    fetchExpenses,
    editExpense,
    deleteExpense,
};