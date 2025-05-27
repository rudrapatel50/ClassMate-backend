const express = require('express');
const router = express.Router();
const {
    createTask,
    getProjectTasks,
    getUserTasks,
    getTask,
    updateTask,
    addComment,
    deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Task CRUD routes
router.post('/', createTask);
router.get('/project/:projectId', getProjectTasks);
router.get('/my-tasks', getUserTasks);
router.get('/:taskId', getTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// Task comment route
router.post('/:taskId/comments', addComment);

module.exports = router; 