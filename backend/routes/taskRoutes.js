const express = require('express');
const router = express.Router();
const {
  createTask, getTasks, getTask, updateTask, deleteTask, addComment,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', getTasks);
router.post('/', adminOnly, createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', adminOnly, deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
