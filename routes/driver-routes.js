const express = require('express');
const driverController = require('../controllers/driver-controller');




const router=express.Router();

router.post('/add',driverController.addDriver);
router.get('/viewDrivers',driverController.viewDrivers);
router.delete('/deleteDriver',driverController.deleteDriver);
router.post('/updateDriver',driverController.updateDriver);

module.exports=router;
