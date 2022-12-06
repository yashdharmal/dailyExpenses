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
            return res.send({ message: "this email is already registed please sign in" });
        } else {

            await Users.create(req.body)

            let findUserId = await Users.findOne({ email: req.body.email })

            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);
            const expenses = []
            const dataForExpenses = { userId: userId, expenses }
            await Expenses.create(dataForExpenses)

            return res.send({ message: "You have succesfully registed", token })

        }

    } catch (error) {

        res.send(error)

    }

}


const login = async (req, res,) => {
    try {
        const recivedEmail = req.body.email;
        const recivedPassword = req.body.password;
        const userFound = await Users.findOne({ email: recivedEmail })
        if (!userFound) {
            return res.send({ message: "User not found" })
        }
        if (await bcrypt.compare(recivedPassword, userFound.password)) {
            let findUserId = await Users.findOne({ email: req.body.email })
            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);
            return res.send({ message: "You have succesfully loged in", token })
        } else {
            return res.send({ message: "plese check email or pass" })
        }
    } catch (error) {
        console.log({ error })
        res.send(error)
    }
}
module.exports = {
    signup,
    login
};