const Driver = require('../models/driver');
const Package = require('../models/package')
const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");


module.exports = {
    addPackage: async function (req, res) {
        let title = req.body.title;
        let weight = req.body.weight;
        let destination = req.body.destination;
        let description = req.body.description;
        let driverMongooseId = req.body.driverMongooseId;
        let isAllocated = req.body.isAllocated;
        let id = generatePackageId();
        let driver = await Driver.findOne({ _id: new ObjectId(driverMongooseId) });
        if (!driver){
            res.status(200).json({"status": "Driver not found"})
            return
        }
        let driverId = driver.id;
        let package = new Package({id, title, weight, destination, description, isAllocated, driverId, driverMongooseId});
        await package.save();
        driver.packages.push(package._id)
        await driver.save()
        res.status(200).json({ id: package._id, package_id: package.id });
    },
    viewPackages: async function(req,res){
        let packages = await Package.find({}).populate('driverMongooseId');
        res.status(200).json(packages);
    },
    deletePackage: async function(req,res){
        let id = req.query.packageId;
        let package = await Package.findOne({id: id});
        if (!package){
            let result = await Package.deleteOne({id: id})
            res.status(200).json(result);
            return
        }
        else{
            let driverId = package.driverId;
            let driver = await Driver.findOne({id: driverId});
            let packageId = package._id;
            for (let i=0; i<driver.packages.length;i++){
                if (driver.packages[i].toString() === packageId.toString()){
                    driver.packages.splice(i, 1)
                    await driver.save();
                    break
                }
            }
            let result = await Package.deleteOne({id: id})
            res.status(200).json(result);
        }
    },
    updatePackage: async function(req,res){
        let { id, ...updates } = req.body;
        let updatedPackage = await Package.findOneAndUpdate({ _id: id }, updates, { new: true });
        if (!updatedPackage){
            res.status(200).json({"status": "ID not found"})
            return
        }
        res.status(200).json({"status": "Package updated successfully!"})
    }
}

function generatePackageId(){
    let packageId = 'P' + generateLetters(2) + '-NK-' + (Math.floor(Math.random() * 900) + 100);
    return packageId;
}

function generateLetters(size){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let output = '';
    for (let i = 0; i < size; i++) {
        output += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return output;
}

