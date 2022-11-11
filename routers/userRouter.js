
const express = require('express');


const router = express.Router();
const User = require("../models/usersModel");

const userController = require("../controllers/userController")
const validationMiddleware = require("../middlewares/middleware")
const userValidation = require("../validation/userValidation")

router.post("/user/signup", validationMiddleware.validateRequest(userValidation.signupSchema), userController.signup)
router.post("/user/login", validationMiddleware.validateRequest(userValidation.loginSchema), userController.login)


module.exports = router;