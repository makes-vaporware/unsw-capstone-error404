const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router
  .route('/')
  .get(groupController.getAllGroups)
  .post(groupController.createNewGroup)
  .patch(groupController.updateGroup)
  .delete(groupController.deleteGroup);

router.route('/join').post(groupController.joinGroup);

router.route('/leave').post(groupController.leaveGroup);

router.route('/adduser').post(groupController.addUserToGroup);

router.route('/removeuser').post(groupController.removeUserFromGroup);

router.route('/changeowner').post(groupController.changeGroupOwner);

router.route('/recommend').get(groupController.recommendGroups);

router.route('/scp').get(groupController.getAverageGroupSCP);

router.route('/scptotal').get(groupController.getTotalGroupSCP);

router.route('/match/suggest').get(groupController.groupsMatchSuggest);

router.route('/match/assign').put(groupController.groupsMatchAssign);

router
  .route('/clearprojectassignments')
  .patch(groupController.groupsClearAssignments);

module.exports = router;
