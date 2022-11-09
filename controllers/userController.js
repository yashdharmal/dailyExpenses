const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/usersModel")
const SECRECT_KEY = "skajdfhO*&^D*&E$r8739rbc";


const signup = async (req, res) => {
    try {
        let userFound = await Users.findOne({ email: req.body.email });
        console.log(userFound);


        if (userFound) {
            res.send("this email is already registed please sign in");
        } else {

            let myData = new Users(req.body);
            myData.save();

            res.send({ message: "You have succesfully registed" })

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
            res.send("User not found")

        }



        if (await bcrypt.compare(recivedPassword, userFound.password)) {
            var token = jwt.sign({ name: req.body.name, email: req.body.email }, SECRECT_KEY);
            res.send({ message: "You have succesfully loged in", token })
        } else {
            res.send("plese check email or pass")
        }

    } catch (error) {
        res.send(error)
    }

}

module.exports = {
    signup,
    login
};