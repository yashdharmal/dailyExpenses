const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phoneNo: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
}, {
    collection: 'Users'
})

// encrypt password
userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
});



module.exports = mongoose.model("Users", userSchema);