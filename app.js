require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const expensesRouter = require("./routers/expensesRouter")
const port = process.env.PORT || 3400



const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
    // "mongodb://localhost:27017"
    process.env.DB_HOST,

    {
        dbName: "DailyExpenses"
    }, (err) => {
        if (!err) console.log("connected to mongo db");
    })




app.use('', userRouter, expensesRouter);
app.listen(port, (err) => {
    if (!err) console.log("port 3400 is running");
})
