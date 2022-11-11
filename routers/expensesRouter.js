const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController')
const validationMiddleware = require("../middlewares/middleware")
const expenseValidation = require("../validation/expenseValidation")

const authMiddelware = require('../middlewares/middleware');


// add expenses 
router.post("/user/addExpense", validationMiddleware.validateRequest(expenseValidation.addExpenseSchema), authMiddelware.authMiddelware, expensesController.addExpense)



module.exports = router;