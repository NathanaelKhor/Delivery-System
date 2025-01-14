const mongoose = require('mongoose')

const packageSchema = mongoose.Schema ({
    id: {
        type: String,
        default: generatePackageId(),
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15,
        validate: {
			validator: function (newVal) {
				return newVal.length >= 3 && newVal.length <= 15;
			},
			message: "Title should be between 3 and 15 characters long",
		},
    },
    weight: {
        type: Number,
        required: true,
        min: 0 // Ensures positive non-zero number
    },
    destination: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 15,
        validate: {
			validator: function (newVal) {
				return newVal.length >= 3 && newVal.length <= 15;
			},
			message: "Destination should be between 3 and 15 characters long",
		},
    },
    description: {
        type: String,
        maxlength: 30,
        default: '',
        validate: {
			validator: function (newVal) {
				return newVal.length <= 30;
			},
			message: "Description should be less than 30 characters long",
		},
    },
    createdAt: {
        type: String,
        default: getDate(),
        required: true
    },
    isAllocated: {
        type: Boolean,
        required: true
    },
    driverId: {
        type: String,
        required: true
    },
    driverMongooseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    }
});

function generatePackageId(){
    let packageId = 'P' + generateLetters(2) + '-NK-' + (Math.floor(Math.random() * 900) + 100);
    return packageId;
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

module.exports = mongoose.model("Package", packageSchema);
