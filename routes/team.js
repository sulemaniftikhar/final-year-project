const express = require('express');
const {
    getTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize('RESTAURANT_OWNER', 'ADMIN'));

router.route('/')
    .get(getTeamMembers);

router.route('/invite')
    .post(inviteTeamMember);

router.route('/:id')
    .patch(updateTeamMember)
    .delete(removeTeamMember);

module.exports = router;
