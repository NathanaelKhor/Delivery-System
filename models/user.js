const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        minlength: 6,
        validate: {
			validator: function (newVal) {
				return newVal.length >= 6;
			},
			message: "Username should be at least 6 characters long",
		}
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 10,
        validate: {
			validator: function (newVal) {
				return newVal.length >= 5 && newVal.length <= 10;
			},
			message: "Password should be between 5 and 10 characters long",
		}
    }
});




module.exports = mongoose.model("User", userSchema);
