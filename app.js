const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const port = process.env.PORT || 3400



const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
    // "mongodb://localhost:27017"
    "mongodb+srv://yashraj:dBqe7WSnN3btT0pl@cluster0.rxu2hq3.mongodb.net/test",

    {
        dbName: "DailyExpenses"
    }, (err) => {
        if (!err) console.log("connected to mongo db");
    })




app.use('', userRouter);
app.listen(port, (err) => {
    if (!err) console.log("port 3400 is running");
})
