const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController')
const validationMiddleware = require("../middlewares/middleware")
const expenseValidation = require("../validation/expenseValidation")

const authMiddelware = require('../middlewares/middleware');


// add expenses 
router.post("/user/addExpense", validationMiddleware.validateRequest(expenseValidation.addExpenseSchema), authMiddelware.authMiddelware, expensesController.addExpense)
router.get("/user/fetchExpences", authMiddelware.authMiddelware, validationMiddleware.validateRequest(expenseValidation.fetchExpencesSchema), expensesController.fetchExpenses);
router.patch("/user/updateExpense", authMiddelware.authMiddelware, validationMiddleware.validateRequest(expenseValidation.updateExpenseSchema), expensesController.editExpense);
router.delete("/user/deleteExpense", authMiddelware.authMiddelware, validationMiddleware.validateRequest(expenseValidation.deleteExpenseSchema), expensesController.deleteExpense);


module.exports = router;