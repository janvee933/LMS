const express = require('express');
const router = express.Router();
const doubtController = require('../controllers/doubt.controller');
const { protect } = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.post('/', protect, doubtController.createDoubt);
router.get('/instructor', protect, authorize('instructor', 'admin'), doubtController.getInstructorDoubts);
router.get('/admin', protect, authorize('admin'), doubtController.getAdminDoubts);
router.put('/:id/status', protect, doubtController.updateDoubtStatus);

module.exports = router;
