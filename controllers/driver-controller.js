const Driver = require('../models/driver');
const Package = require('../models/package')


module.exports = {
    addDriver: async function (req, res) {
        let aDriver = req.body;
        let id = generateDriverId();
        let driver = new Driver({ id: id, name: aDriver.name, department: aDriver.department, licence: aDriver.licence, isActive: aDriver.isActive });
        await driver.save();
        res.status(200).json({ id: driver._id, driver_id: driver.id });
    },
    viewDrivers: async function (req,res){
        let drivers = await Driver.find({}).populate('packages');
        res.status(200).json(drivers);
    },
    deleteDriver: async function (req,res){
        let id = req.query.driverId;
        let driver = await Driver.findOne({ id: id });
        if (!driver){
            let result = await Driver.deleteOne({ id: id });
            res.status(200).json(result);
        }
        else{
            for (let i=0;i<driver.packages.length;i++){
                let packageId = driver.packages[i];
                await Package.findOneAndDelete({_id: packageId})
            }
            let result = await Driver.deleteOne({ id: id });
            res.status(200).json(result);
        }
    },
    updateDriver: async function (req,res){
        let { id, ...updates } = req.body;
        let updatedDriver = await Driver.findOneAndUpdate({ _id: id }, updates, { new: true });
        if (!updatedDriver){
            res.status(200).json({"status": "ID not found"})
            return
        }
        res.status(200).json({"status": "Driver updated successfully!"})
    }
}

function generateDriverId(){
    let driverId = 'D' + Math.floor(Math.random()*90 + 10) + '-35-' + generateLetters(3);
    return driverId;
}

function generateLetters(size){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let output = '';
    for (let i = 0; i < size; i++) {
        output += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return output;
}
