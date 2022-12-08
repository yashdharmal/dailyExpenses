const mongoose = require('mongoose');
const Users = require("../models/usersModel")
const Expenses = require("../models/expensesModel")
// const userId = req.user.userId
const userId = "636cee161a008cc3bf99d382"

const fetchExpences = async (param) => {
    try {
        let pageNumber = param.pageNumber || 1
        let pageSize = param.pageSize || 10
        console.log(param);
        let result = await Expenses.aggregate([
            {
                $match: param.filter,
            },
            {
                $project: {
                    userId: 1,
                    // _id: -1,
                    expenses: {
                        $filter: {
                            input: "$expenses",
                            cond: {
                                $and: [
                                    ...(param.fromDate ? [{
                                        $gt: [
                                            "$$expence.dateAndTime",
                                            new Date(param.fromDate)
                                        ],
                                    }] : []),
                                    ...(param.toDate ? [{
                                        $lte: [
                                            "$$expence.dateAndTime",
                                            new Date(param.toDate)
                                        ],
                                    }] : []),
                                ],
                            },
                            as: "expence",
                        },
                    },
                },
            },
            {
                $set: {
                    totalExpense: { $sum: "$expenses.amount" },
                    totalExpensesRecord: { $size: "$expenses" },
                },
            },
            {
                $unwind: {
                    path: "$expenses",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    "expenses.dateAndTime": -1,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    expenses: {
                        $push: "$expenses",
                    },
                    totalExpense: { $first: "$totalExpense" },
                    totalExpensesRecord: {
                        $first: "$totalExpensesRecord",
                    }
                },
            },
            {
                $set: {
                    expenses: {
                        $slice: ["$expenses", (pageNumber - 1) * (pageSize) || 0, pageSize]
                    },
                },
            },
            {
                $set: {
                    totalSize: {
                        $size: "$expenses"
                    },
                    pageNumber: param.pageNumber || 1,
                },
            },
        ])
        return result
    } catch (error) {
        console.log(error);
        // res.send(error)
        res.send(error)
    }
}



module.exports = {
    fetchExpences
};