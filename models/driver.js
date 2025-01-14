const mongoose = require("mongoose");

const driverSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        validate: {
			validator: function (newVal) {
				return newVal.length >= 3 && newVal.length <= 20;
			},
			message: "Name should be between 3 and 20 characters long",
		},
    },
    department: {
        type: String,
        required: true
    },
    licence: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5,
        validate: {
			validator: function (newVal) {
				return newVal.length == 5;
			},
			message: "Licence should be 5 characters long",
		},
    },
    isActive: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: String,
        default: getDate(),
        required: true
    },
    packages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package"
        },
    ],
});

function generateDriverId(){
    let driverId = 'D' + Math.floor(Math.random()*90 + 10) + '-35-' + generateLetters(3);
    return driverId;
}

function getDate(){
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    return formattedDate;
}

function generateLetters(size){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let output = '';
    for (let i = 0; i < size; i++) {
        output += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return output;
}

module.exports = mongoose.model("Driver", driverSchema);
