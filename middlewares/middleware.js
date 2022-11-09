const express = require('express');
const jwt = require("jsonwebtoken");
const SECRECT_KEY = "skajdfhO*&^D*&E$r8739rbc";



const authMiddelware = (req, res, next) => {
    try {
        let token = req.headers.auth

        let tokenData = jwt.verify(token, SECRECT_KEY)

        req.user = tokenData
        console.log(req.user);
        next();
    } catch (error) {
        res.status(401).send("Un authorized")
    }

}




const validateRequest = (valiationSchema) => {
    return (req, res, next) => {
        const validationResult = valiationSchema.validate(req.body);
        if (validationResult.error) {
            let errorString = validationResult.error.details[0].message
            return res.send(validationResult.error.details[0].message)
        }

        next()
    }

}

module.exports = {
    validateRequest,
    authMiddelware
};