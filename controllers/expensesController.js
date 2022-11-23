require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");
const moment = require('moment/moment');
const { default: mongoose } = require('mongoose');
const Expenses = require('../models/expensesModel')
const { Parser } = require('json2csv');
const fs = require('fs');

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

const fetchExpenses = async (req, res) => {
    try {
        // const { pageNumber = 1, pageSize = 10 } = req.body;
        const userId = req.user.userId
        const daily = req.body.daily;
        const weekly = req.body.weekly;
        const monthly = req.body.monthly;
        const yearly = req.body.yearly;
        const currentDateAndTime = moment();

        const filter = { userId: mongoose.Types.ObjectId(userId) }

        // by providing date and time

        let fromDate = req.body.fromDate;
        let toDate = req.body.toDate;

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


        let expencesData = await Expenses.findOne(filter);


        if (daily) {

            let expences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(todayStartTime) && moment(e.dateAndTime).isBefore(todayEndTime));

            let totalExpense = total(expences)

            await expences.sort(compare)
            return res.send({ totalExpense, expenses: expences })

            // return res.send({ totalExpense, expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) });



        }
        if (weekly) {

            let expences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(weekStartTime) && moment(e.dateAndTime).isBefore(weekEndTime))

            let totalExpense = total(expences)

            await expences.sort(compare)
            return res.send({ totalExpense, expenses: expences })


            // return res.send({ totalExpense, expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })
            // return res.send({ weeklyExpenceTotal, weeklyExpences: paginate(weeklyExpences) })

        }
        if (monthly) {
            let expences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(monthStartTime) && moment(e.dateAndTime).isBefore(monthEndTime));

            let totalExpense = total(expences)
            await expences.sort(compare)
            return res.send({ totalExpense, expenses: expences })

            // return res.send({ totalExpense, expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })
        }
        if (yearly) {
            let expences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(yearStartTime) && moment(e.dateAndTime).isBefore(yearEndTime))

            let totalExpense = total(expences)

            await expences.sort(compare)
            return res.send({ totalExpense, expenses: expences })

            // return res.send({ totalExpense, expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })
        }
        if (fromDate && toDate) {
            fromDate = moment(fromDate);
            toDate = moment(toDate)
            let expences = expencesData.expenses.filter(e => moment(moment(e.dateAndTime)).isBetween(fromDate, toDate, 'D', '[]'));

            let totalExpense = total(expences)

            await expences.sort(compare)

            return res.send({ totalExpense, expenses: expences })
            // return res.send({ totalExpense, expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })
        }


        if (fromDate) {

            fromDate = moment(fromDate).startOf('day');
            let expences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(fromDate));

            await expences.sort(compare)
            return res.send({ expenses: expenses })

            // return res.send({ expenses: expences.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })
        }

        let allExpenses = await Expenses.findOne({ userId: userId })
        let expenses = allExpenses.expenses

        await expenses.sort(compare)
        return res.send({ expenses: expenses })

        // return res.send({ expenses: expenses.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) })


    } catch (error) {
        console.log(error)
        res.send(error)
    }
}



const editExpense = async (req, res) => {
    try {
        const note = req.body.note;
        const amount = req.body.amount;
        const dateAndTime = req.body.dateAndTime
        const userId = req.user.userId
        const expenseId = req.body.expenseId

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

        res.send("expense deleted successfully")


    } catch (error) {
        res.send(error)
    }
}


const downloadExpenses = async (req, res) => {
    try {

        console.log("hello");
        const parserObj = new Parser();

        const userId = req.user.userId
        const daily = req.body.daily;
        const weekly = req.body.weekly;
        const monthly = req.body.monthly;
        const yearly = req.body.yearly;

        const filter = { userId: mongoose.Types.ObjectId(userId) }

        // by providing date and time

        let fromDate = req.body.fromDate;
        let toDate = req.body.toDate;

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

        // dateConverter


        function dateConverter(arr) {
            for (let element of arr) {
                element.dateAndTime = moment(element.dateAndTime).format('MMMM Do YYYY, h:mm:ss a')
                delete element._id
            }
            return arr
        }

        // csv converter

        // function csvConverter(arr) {
        //     const parser = new Parser(arr);
        //     const csv = parser.parse(arr)
        //     return csv
        // }





        // let expencesData = await Expenses.findOne(filter);

        let expencesData = (await Expenses.findOne({ filter }, {
        }, {
            lean: true
        }))

        if (daily) {
            let todaysExpences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(todayStartTime) && moment(e.dateAndTime).isBefore(todayEndTime));

            let totalDailyExpense = total(todaysExpences)

            await todaysExpences.sort(compare)


            dateConverter(todaysExpences)

            csvConverter(todaysExpences)
            console.log(todaysExpences);

            return res.send(todaysExpences)


        }
        if (weekly) {

            let weeklyExpences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(weekStartTime) && moment(e.dateAndTime).isBefore(weekEndTime))

            let weeklyExpenceTotal = total(weeklyExpences)

            await weeklyExpences.sort(compare)


            return res.send({ weeklyExpenceTotal, weeklyExpences: weeklyExpences })


        }
        // if (monthly) {
        //     let monthlyExpenses = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(monthStartTime) && moment(e.dateAndTime).isBefore(monthEndTime));

        //     let monthlyExpenceTotal = total(monthlyExpenses)
        //     await monthlyExpenses.sort(compare)

        //     return res.send({ monthlyExpenceTotal, monthlyExpenses: monthlyExpenses })
        // }
        // if (yearly) {
        //     let yearlyExpences = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(yearStartTime) && moment(e.dateAndTime).isBefore(yearEndTime))

        //     let yearlyExpenceTotal = total(yearlyExpences)

        //     await yearlyExpences.sort(compare)

        //     return res.send({ yearlyExpenceTotal, yearlyExpences: yearlyExpencesz })
        // }
        // if (fromDate && toDate) {
        //     fromDate = moment(fromDate);
        //     toDate = moment(toDate)
        //     let fromTotoExpenses = expencesData.expenses.filter(e => moment(moment(e.dateAndTime)).isBetween(fromDate, toDate, 'D', '[]'));

        //     let fromTotoTotal = total(fromTotoExpenses)

        //     await fromTotoExpenses.sort(compare)

        //     return res.send({ fromTotoTotal, fromTotoExpenses: fromTotoExpenses })
        // }


        // if (fromDate) {

        //     fromDate = moment(fromDate).startOf('day');
        //     let fromDateExpenses = expencesData.expenses.filter(e => moment(e.dateAndTime).isAfter(fromDate));

        //     await fromDate.sort(compare)

        //     return res.send({ fromDateExpenses: fromDateExpenses })
        // }

        let allExpenses = (await Expenses.findOne({ userId: userId }, {
        }, {
            lean: true
        }))
        let expenses = allExpenses.expenses.sort(compare)

        // for (let element of expenses) {
        //     element.dateAndTime = moment(element.dateAndTime).format('MMMM Do YYYY, h:mm:ss a')
        //     delete element._id
        // }


        dateConverter(expenses)

        // csvConverter(expenses)
        // const parser = new Parser(expenses);
        // const csv = parser.parse(expenses);

        // return res.send(csv)

        expenses.forEach(element => {
            const csv = json2csvParser.parse(element);
            console.log(csv);

        });
        const csv = json2csvParser.parse(expenses);
        console.log(csv);

        return res.send(csv)


        // const csv = parserObj.parse(expenses)

        // fs.writeFile('expenses.csv', csv, function (err) {
        //     if (err) {
        //         throw err;
        //     }
        //     console.log("File Saved");
        //     fs.unlinkSync("expenses.csv")
        // })



        // return res.send(expencesData)
    } catch (error) {
        res.send(error)
    }
}
















module.exports = {
    addExpense,
    fetchExpenses,
    editExpense,
    deleteExpense,
    downloadExpenses
};