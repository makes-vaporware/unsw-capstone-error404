const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router
  .route('/')
  .get(skillsController.getAllSkills)
  .post(skillsController.createNewSkill)
  .patch(skillsController.updateSkill)
  .delete(skillsController.deleteSkill);

router.route('/add').post(skillsController.addSkillToUser);

router.route('/remove').post(skillsController.removeSkillFromUser);

module.exports = router;
