const express = require('express');
const router = express.Router();
const { 
    createProject,
    getUserProjects,
    getProject,
    updateProject,
    addMember,
    removeMember,
    deleteProject
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Project CRUD routes
router.post('/', createProject);
router.get('/my-projects', getUserProjects);
router.get('/:projectId', getProject);
router.patch('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

// Member management routes
router.post('/:projectId/members', addMember);
router.delete('/:projectId/members', removeMember);

module.exports = router; 