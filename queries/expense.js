const mongoose = require('mongoose');
const Users = require("../models/usersModel")
const Expenses = require("../models/expensesModel")
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
                    expenses: {
                        $filter: {
                            input: "$expenses",
                            cond: {
                                $and: [
                                    ...(param.fromDate ? [{
                                        $gte: [
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

const Summary = async (param, filter) => {
    try {
        console.log({ filter });

        let result = await Expenses.aggregate(
            [
                {
                    $match:
                        filter

                },
                {
                    $unwind: {
                        path: "$expenses",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        year: {
                            $year: "$expenses.dateAndTime",
                        },
                        month: {
                            $month: "$expenses.dateAndTime",
                        },
                        week: {
                            $week: "$expenses.dateAndTime",
                        },
                        dateAndTime: "$expenses.dateAndTime",
                        note: "$expenses.note",
                        amount: "$expenses.amount",
                        _id: 1,
                    },
                },
                {

                    $sort: {
                        year: -1,
                        month: -1,
                        week: -1,
                    },
                },
                {
                    ...param
                }
                // {
                //   $group: {
                //   _id: { week:  "$week", year:"$year"  },
                //   totalAmount: { $sum: "$amount" },
                //
                // }
                // },
                // {
                //     $group: {
                //         _id: { month: "$month", year: "$year" },
                //         totalAmount: { $sum: "$amount" },
                //     },
                // },
                // {
                //   $group: {
                //   _id:{ year:"$year"},
                //   amount: {
                //     $sum: "$amount",
                //   },
                // }
                //
                // }
            ])
        return result

    } catch (error) {
        console.log(error);
    }
}



// [
//     {
//         /**
//          * query: The query in MQL.
//          */
//         $match: {
//             userId: "6391b474b6fac2ad1c1644bd",
//         },
//     },
//     {
//         /**
//          * path: Path to the array field.
//          * includeArrayIndex: Optional name for index.
//          * preserveNullAndEmptyArrays: Optional
//          *   toggle to unwind null and empty values.
//          */
//         $unwind: {
//             path: "$expenses",
//             preserveNullAndEmptyArrays: true,
//         },
//     },
//     {
//         /**
//          * specifications: The fields to
//          *   include or exclude.
//          */
//         $project: {
// userId: 1,
//             dateAndTime: "$expenses.dateAndTime",
//             amount: "$expenses.amount",
//             year: { $year: "$expenses.dateAndTime" },
//             month: { $month: "$expenses.dateAndTime" },
//             week: { $week: "$expenses.dateAndTime" },
// //         },
//     },
//     {
//         /**
//          * Provide any number of field/order pairs.
//          */
//         $sort: {
//             year: 1,
//             month: 1,
//             week: 1,
//         },
//     },
//     {
//         /**
//          * _id: The id of the group.
//          * fieldN: The first field name.
//          */

//         $group:
//         // {
//         //   _id:"$year"
//         // }
//         {
//             _id: {
//                 year: "$year",
//             },
//         },
//     },
// ]



module.exports = {
    fetchExpences,
    Summary
};