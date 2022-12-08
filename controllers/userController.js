require('dotenv').config()
const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/usersModel")
const Expenses = require("../models/expensesModel")


const signup = async (req, res) => {
    try {
        let userFound = await Users.findOne({ email: req.body.email });
        if (userFound) {

            return res.send({
                success: false,
                message: "this email is already registered please sign in",
            })

        } else {
            await Users.create(req.body)
            let findUserId = await Users.findOne({ email: req.body.email })
            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);
            const expenses = []
            const dataForExpenses = { userId: userId, expenses }
            await Expenses.create(dataForExpenses)

            return res.send({
                success: true,
                data: { token: token },
                message: "You have succesfully registed"
            })
        }

    } catch (error) {


        res.status(403).send({

            success: false,
            message: "signup failed",
            error: "DE-S- 01",
            signupErrorStack: {
                message: (error)
            }
        })

    }

}


const login = async (req, res,) => {
    try {
        const recivedEmail = req.body.email;
        const recivedPassword = req.body.password;
        const userFound = await Users.findOne({ email: recivedEmail })
        if (!userFound) {
            return res.send({
                success: false,
                message: "user not found"
            })
        }
        if (await bcrypt.compare(recivedPassword, userFound.password)) {
            let findUserId = await Users.findOne({ email: req.body.email })
            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);
            return res.send({
                success: true,
                data: { token: token },
                message: "You have successfully loged in"
            })
        } else {
            return res.send({
                success: false,
                message: "please Check email or password"
            })
        }
    } catch (error) {
        res.status(403).send({
            success: false,
            message: "login failed",
            error: "DE-L- 01",
            loginErrorStack: {
                message: (error)
            }
        })
    }
}
module.exports = {
    signup,
    login
};