const mongoose = require("mongoose");
const express = require("express");
const PORT_NUMBER = 8080;
const ejs = require('ejs');
let path = require('path')
const Driver = require('./models/driver');
const Package = require('./models/package');
const User = require('./models/user')
const { ObjectId } = require('mongodb');
const app = express();
const driverRouter = require('./routes/driver-routes');
const packageRouter = require('./routes/package-routes');


const url = "mongodb://localhost:27017/FIT2095-A2";

let departments = ["Food", "Furniture", "Electronic"]
let loggedIn = false;

app.use(express.static("node_modules/bootstrap/dist/css"));
app.use(express.static('public/images'));

app.engine("html", ejs.renderFile);
app.set("view engine", "html");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**
 * Configures the port number and lets console know the server is up
 * @function
 * @param {int} port - Express Port number
 * @param {function} callback - Express callback
 */
app.listen(PORT_NUMBER, function () {
  console.log(`listening on port ${PORT_NUMBER}`);
});

async function connect() {
	await mongoose.connect(url);
}
connect()
	.catch((err) => console.log(err))

/**
 * Router serving the index html file, which is the homepage for the website
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("/", function(req,res){
    res.render('index');
});

/**
 * Router serving the add_driver file, where the user enters information into a form to create a Driver object
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("/35002670/Nathanael/addDriver", function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    res.render("add_driver")
});

/**
 * Router serving the post request for the addDriver endpoint, handling the submission of the drivers information
 * This info is then used to create a new driver object and add it to the drivers array, then renders the html file 
 * where the user can view all drivers including the one they recently added
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post("/35002670/Nathanael/addDriver", async function(req,res){
    let name = req.body.name;
    let department = req.body.department;
    let licence = req.body.licence;
    let isActive = req.body.isActive === 'on';
    let id = generateDriverId();
    let driver = new Driver({id, name, department, licence, isActive});
    await driver.save();
    let drivers = await Driver.find({});
    res.render("view_drivers", {drivers: drivers});
});

/**
 * Router serving the post request for the addPackage endpoint, handling the submission of the packages information
 * This info is then used to create a new package object and add it to the packages array, then renders the html file 
 * where the user can view all packages including the one they recently added
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post("/35002670/Nathanael/addPackage", async function(req,res){
    let title = req.body.title;
    let weight = req.body.weight;
    let destination = req.body.destination;
    let description = req.body.description;
    let driverMongooseId = req.body.driverId;
    let isAllocated = req.body.isAllocated === 'on';
    let id = generatePackageId();
    let driver = await Driver.findOne({ _id: new ObjectId(driverMongooseId) });
    let driverId = driver.id;
    let package = new Package({id, title, weight, destination, description, isAllocated, driverId, driverMongooseId});
    await package.save();
    driver.packages.push(package._id)
    await driver.save()
    let packages = await Package.find({})
    res.render('view_packages', {packages: packages});
});

/**
 * Router serving the view_drivers path, where all the drivers are organised into a table, with their values such as id and name being displayed
 * Each driver has a delete button where the user can delete the driver by clicking it
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("/35002670/Nathanael/viewDrivers", async function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    let drivers = await Driver.find({});
    res.render('view_drivers', {drivers: drivers});
});

/**
 * Router serving the add_package path, where users enter information into a form to help create a new Package object
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("/35002670/Nathanael/addPackage", async function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    let drivers = await Driver.find({});
    res.render('add_package', {drivers: drivers});
});

/**
 * Router serving the viewPackages path, where all the packages are organised into a table, with their values such as id and description being displayed
 * Each package has a delete button where the user can delete the package by clicking it
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get('/35002670/Nathanael/viewPackages', async function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    let packages = await Package.find({})
    res.render('view_packages', {packages: packages});
});

/**
 * Router serving the deleteDriver path, where the user can enter the drivers ID they want to delete into query string (?driverId=...)
 * This will delete the driver with the corresponding ID, however if the ID is invalid or does not belong to a driver the user is redirected to an invalid data page
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post('/35002670/Nathanael/deleteDriver', async function(req,res){
    let id = req.query.driverId;
    let driver = await Driver.findOne({ id: id });
    if (!driver){
        res.render('invalid_data');
        return
    }
    else{
        for (let i=0;i<driver.packages.length;i++){
            let packageId = driver.packages[i];
            await Package.findOneAndDelete({_id: packageId})
        }
        await Driver.findOneAndDelete({id: id})
        let drivers = await Driver.find({});
        res.render('view_drivers', {drivers: drivers});
    }
});

/**
 * Router serving the deletePackage path, where the user can enter the packages ID they want to delete into query string (?packageId=...)
 * This will delete the package with the corresponding ID, however if the ID is invalid or does not belong to a package the user is redirected to an invalid data page
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post('/35002670/Nathanael/deletePackage', async function(req,res){
    let id = req.query.packageId;
    let package = await Package.findOne({id: id});
    if (!package){
        res.render('invalid_data');
        return
    }
    else{
        let driverId = package.driverId;
        let driver = await Driver.findOne({id: driverId});
        let packageId = package._id;
        for (let i=0; i<driver.packages.length;i++){
            if (driver.packages[i].toString() == packageId.toString()){
                driver.packages.splice(i, 1)
                await driver.save();
                break
            }
        }
        await Package.findOneAndDelete({id: id})
        let packages = await Package.find({});
        res.render('view_packages', {packages: packages});
    }
});

/**
 * Router serving the post for the viewDrivers path, where if the delete driver button is clicked, the corresponding driver is removed from the drivers array
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post("/35002670/Nathanael/viewDrivers", async function(req,res){
    let id = req.body.driverId;
    let driver = await Driver.findOne({ _id: new ObjectId(id) });
    for (let i=0;i<driver.packages.length;i++){
        let packageId = driver.packages[i];
        await Package.findOneAndDelete({_id: packageId})
    }
    await Driver.findOneAndDelete({_id: id})
    let drivers = await Driver.find({});
    res.render('view_drivers', {drivers: drivers});
});

/**
 * Router serving the post for the viewPackages path, where if the delete package button is clicked, the corresponding package is removed from the drivers array
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.post("/35002670/Nathanael/viewPackages", async function(req,res){
    let packageId = req.body.packageId;
    let package = await Package.findOne({_id: new ObjectId(packageId)});
    let driverId = package.driverId;
    let driver = await Driver.findOne({id: driverId});
    for (let i=0; i<driver.packages.length;i++){
        if (driver.packages[i].toString() == packageId.toString()){
            driver.packages.splice(i, 1)
            await driver.save();
            break
        }
    }
    await Package.findOneAndDelete({_id: new ObjectId(packageId)})
    let packages = await Package.find({});
    res.render('view_packages', {packages: packages});
});

/**
 * Router serving the view_drivers path, where all the drivers are organised into a table, with their values such as id and name being displayed
 * However, in this page the drivers are sorted by their departments, so there are 3 different tables, one for each department
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get('/35002670/Nathanael/viewDepartments', async function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    let drivers = await Driver.find({});
    res.render('departments', {drivers: drivers, departments: departments});
})

app.get('/35002670/Nathanael/signup', function(req,res){
    res.render('signup');
})

app.post('/35002670/Nathanael/signup', async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    let user = new User({username: username, password: password});
    await user.save();
    res.render('login');
})

app.get('/35002670/Nathanael/login', function(req,res){
    if (loggedIn){
        res.render('already_loggedin');
        return;
    }
    res.render('login');
})

app.post('/35002670/Nathanael/login', async function(req,res){
    let username = req.body.username;
    let password = req.body.password;
    let users = await User.find({});
    for (let i=0; i<users.length;i++){
        if (users[i].username === username && users[i].password === password){
            loggedIn = true
            res.redirect('/')
            return
        }
    }
    res.render('incorrect_login')
})

app.get('/35002670/Nathanael/logout', function(req,res){
    if (!loggedIn){
        res.redirect('/35002670/Nathanael/login')
        return
    }
    res.render('logout');
})

app.post('/35002670/Nathanael/logout', async function(req,res){
    loggedIn = false;
    res.redirect('/');
})



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

function generatePackageId(){
    let packageId = 'P' + generateLetters(2) + '-NK-' + (Math.floor(Math.random() * 900) + 100);
    return packageId;
}

app.use('/35002670/Nathanael/api/driver', driverRouter);
app.use('/35002670/Nathanael/api/package', packageRouter);


/**
 * Router serving every other path not listed/accepted.  This will bring up a 404 error page
 * @function
 * @param {string} path - Express path
 * @param {function} callback - Express callback
 */
app.get("*", function(req,res){
    res.render('404');
});
