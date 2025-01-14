const express = require('express');
const packageController = require('../controllers/package-controller');



const router=express.Router();

router.post('/addPackage',packageController.addPackage);
router.get('/viewPackages',packageController.viewPackages);
router.delete('/deletePackage',packageController.deletePackage);
router.post('/updatePackage',packageController.updatePackage);

module.exports=router;
