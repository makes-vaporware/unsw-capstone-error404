const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(projectController.createNewProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

router.route('/leave').post(projectController.leaveProject);

router.route('/addclient').post(projectController.addClientToProject);

router.route('/removeclient').post(projectController.removeClientFromProject);

router.route('/addskill').post(projectController.addSkillToProject);

router.route('/removeskill').post(projectController.removeSkillFromProject);

router.route('/assigngroup').post(projectController.assignGroupToProject);

router.route('/removegroup').post(projectController.removeGroupFromProject);

router
  .route('/addpreferences')
  .post(projectController.addProjectToGroupPreferences);

router
  .route('/removepreferences')
  .post(projectController.removeProjectFromGroupPreferences);

router.route('/recommend').get(projectController.recommendProjects);

module.exports = router;
