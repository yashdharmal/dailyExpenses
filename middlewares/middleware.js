require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken");




const authMiddelware = (req, res, next) => {
    try {
        let token = req.headers.authorization

        let tokenData = jwt.verify(token, process.env.SECRECT_KEY)

        req.user = tokenData
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