const mongoose = require('mongoose');
const Users = require("../models/usersModel")
const Expenses = require("../models/expensesModel")
// const userId = req.user.userId
const userId = "636cee161a008cc3bf99d382"

const fetchExpences = async (param) => {
    try {

        let result = await Expenses.aggregate([
            {
                /**
                 * query: The query in MQL.
                 */
                $match: {
                    userId: "636cee161a008cc3bf99d382",
                },
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    userId: 1,
                    expenses: {
                        $filter: {
                            input: "$expenses",
                            cond: {
                                $and: [
                                    {
                                        $gte: [
                                            "$$expence.dateAndTime",
                                            // param.toDate
                                            ISODate(
                                                "2022-11-14T12:54:13.825+00:00"
                                            ),
                                        ],
                                    },
                                    {
                                        $lte: [
                                            "$$expence.dateAndTime",
                                            // param.fromDate
                                            ISODate(
                                                "2022-11-18T09:37:58.923+00:00"
                                            ),
                                        ],
                                    },
                                ],
                            },
                            as: "expence",
                        },
                    },
                },
            },
            {
                /**
                 * field: The field name
                 * expression: The expression.
                 */
                $set: {
                    totalExpense: { $sum: "$expenses.amount" },
                    totalExpensesRecord: { $size: "$expenses" },
                },
            },
            {
                /**
                 * path: Path to the array field.
                 * includeArrayIndex: Optional name for index.
                 * preserveNullAndEmptyArrays: Optional
                 *   toggle to unwind null and empty values.
                 */
                $unwind: {
                    path: "$expenses",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                /**
                 * field: The field name
                 * expression: The expression.
                 */
                $sort: {
                    "expenses.dateAndTime": -1,
                },
            },
            {
                /**
                 * _id: The id of the group.
                 * fieldN: The first field name.
                 */
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    expenses: {
                        $push: "$expenses",
                    },
                    totalExpenses: { $first: "$totalExpense" },
                    totalExpensesRecord: {
                        $first: "$totalExpensesRecord",
                    },
                },
            },
        ])
        return result
    } catch (error) {
        res.send(error)
    }
}



// if (daily) {
//     param.toDate = todayStartTime
//     param.fromDate = todayEndTime
// }

// if (id) {

//     filter = {
//         ...filter,
//         fromDate: fromDate,
//         toDate: toDate
//     }
// }

module.exports = {
    fetchExpences
};