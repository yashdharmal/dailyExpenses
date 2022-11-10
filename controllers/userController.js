require('dotenv').config()
const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/usersModel")


const signup = async (req, res) => {
    try {
        let userFound = await Users.findOne({ email: req.body.email });



        if (userFound) {
            res.send({ message: "this email is already registed please sign in" });
        } else {
            // let myData = new Users(req.body);
            // myData.save();
            await Users.create(req.body)

            let findUserId = await Users.findOne({ email: req.body.email })
            // findUserId = findUserId._id
            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);

            res.send({ message: "You have succesfully registed", token })

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
            res.send({ message: "User not found" })

        }



        if (await bcrypt.compare(recivedPassword, userFound.password)) {
            let findUserId = await Users.findOne({ email: req.body.email })
            // findUserId = findUserId._id
            userId = findUserId._id
            var token = jwt.sign({ email: req.body.email, userId }, process.env.SECRECT_KEY);
            res.send({ message: "You have succesfully loged in", token })
        } else {
            res.send({ message: "plese check email or pass" })
        }

    } catch (error) {
        res.send(error)
    }

}

module.exports = {
    signup,
    login
};