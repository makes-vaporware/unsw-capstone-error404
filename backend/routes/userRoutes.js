const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router
  .route('/')
  .get(usersController.getAllUsers)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router.route('/profile').get(usersController.getUserProfile);

router.route('/scp').get(usersController.getUserSCP);

module.exports = router;
