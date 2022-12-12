require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");
const moment = require('moment/moment');
const { default: mongoose } = require('mongoose');
const Expenses = require('../models/expensesModel')
const { Parser } = require('json2csv');
const fs = require('fs');
const queries = require('../queries/expense');

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
        const { pageNumber = 1, pageSize = 10, fromDate, toDate, id, daily, weekly, monthly, yearly } = req.body;
        const userId = req.user.userId;
        const filter = { userId };
        let param = {}
        // day

        if (id) {
            let expensesData = await Expenses.findOne({ userId: mongoose.Types.ObjectId(userId) });
            let expenses = expensesData.expenses
            let findExpense = expenses.filter((m => m._id.toString() === id.toString()))[0]
            return res.send({ expenses: findExpense })
        }
        // else if (daily) {

        //     param = {
        //         filter,
        //         fromDate: todayStartTime,
        //         toDate: todayEndTime,
        //         pageNumber,
        //         pageSize
        //     }
        // } else
        //     if (weekly) {
        //         param = {
        //             filter,
        //             fromDate: weekStartTime,
        //             toDate: weekEndTime,
        //             pageNumber,
        //             pageSize
        //         }
        //     } else
        //         if (monthly) {
        //             param = {
        //                 filter,
        //                 fromDate: monthStartTime,
        //                 toDate: monthEndTime,
        //                 pageNumber,
        //                 pageSize
        //             }
        //         } else
        // if (yearly) {
        //     param = {
        //         filter,
        //         fromDate: yearStartTime,
        //         toDate: yearEndTime,
        //         pageNumber,
        //         pageSize
        //     }
        //             } else {
        param = {
            filter,
            ...req.body,
        }
        // }
        let data = await queries.fetchExpences(param);
        return res.send(...data)
    } catch (error) {
        res.send(error)
    }
}


const expenseSummary = async (req, res) => {
    try {
        // console.log("CALLED !!");
        const { flag } = req.body
        const userId = req.user.userId;
        const filter = { userId }
        console.log({ flag });
        // console.log(filter);
        let param = {}
        //yearly = 1
        // monthly =2
        // weekly =3

        // if (flag == 1) {

        //     param = {
        //         $group: {
        //             _id: { year: "$year" },
        //             totalAmount: {
        //                 $sum: "$amount",
        //             },
        //         }
        //     }
        //     console.log({ param });
        // }
        // if (flag == 2) {
        //     param = {

        //         $group: {
        //             _id: { month: "$month", year: "$year" },
        //             totalAmount: { $sum: "$amount" },

        //         },

        //     }
        // }
        // if (flag == 3) {
        //     param = {
        //         $group: {
        //             _id: { week: "$week", year: "$year" },
        //             totalAmount: { $sum: "$amount" },
        //         }
        //     }
        // }

        switch (flag) {
            case 1: param = {
                $group: {
                    _id: { year: "$year" },
                    totalAmount: {
                        $sum: "$amount",
                    },
                }
            }

                break;
            case 2: param = {

                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalAmount: { $sum: "$amount" },

                },

            }

                break;
            case 3: param = {
                $group: {
                    _id: { week: "$week", year: "$year" },
                    totalAmount: { $sum: "$amount" },
                }
            }

                break;
            default:
                break;
        }




        console.log({ param, filter });
        let data = await queries.Summary(param, filter);
        console.log({ data });
        return res.send(data)
    } catch (error) {
        res.send()
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
    expenseSummary

};