const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().min(3).max(25).required(),

    phoneNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),

    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),

    password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required()

});


const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().min(8).max(30).regex(/[a-zA-Z0-9]{3,30}/).required()

});

module.exports = {
    signupSchema,
    loginSchema
}