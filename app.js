require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routers/userRouter');

const port = process.env.PORT || 3400



const app = express();
app.use(express.json());

mongoose.connect(
    // "mongodb://localhost:27017"
    process.env.DB_HOST,


    {
        dbName: "DailyExpenses"
    }, (err) => {
        if (!err) console.log("connected to mongo db");
    })




app.use('', userRouter);
app.listen(port, (err) => {
    if (!err) console.log("port 3400 is running");
})
