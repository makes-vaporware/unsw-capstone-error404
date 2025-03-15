const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.route('/changesiterole').patch(adminController.changeSiteRole);

router.route('/changecourserole').patch(adminController.changeCourseRole);

module.exports = router;
