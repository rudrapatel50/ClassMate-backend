const Project = require('../models/Project');

// Create a new project
const createProject = async (req, res) => {
    try {
        const { name, description, course, dueDate, settings } = req.body;
        
        const project = await Project.create({
            name,
            description,
            course,
            dueDate,
            settings,
            members: [{
                user: req.user._id,
                role: 'owner'
            }]
        });

        await project.populate('members.user', 'firstName lastName email');

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all projects for current user
const getUserProjects = async (req, res) => {
    try {
        const projects = await Project.findUserProjects(req.user._id);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific project by ID
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('members.user', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.isMember(req.user._id) && !project.settings.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update project details
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const memberRole = project.getMemberRole(req.user._id);
        if (!memberRole || !['owner', 'leader'].includes(memberRole)) {
            return res.status(403).json({ error: 'Only project owners and leaders can update project details' });
        }

        const updatableFields = ['name', 'description', 'course', 'dueDate', 'status', 'settings'];
        const updates = {};

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.projectId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('members.user', 'firstName lastName email');

        res.status(200).json({
            message: 'Project updated successfully',
            project: updatedProject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add member to project
const addMember = async (req, res) => {
    try {
        const { userId, role = 'member' } = req.body;
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if requester is owner or leader
        const requesterRole = project.getMemberRole(req.user._id);
        if (!requesterRole || !['owner', 'leader'].includes(requesterRole)) {
            return res.status(403).json({ error: 'Only project owners and leaders can add members' });
        }

        // Check if user is already a member
        if (project.isMember(userId)) {
            return res.status(400).json({ error: 'User is already a member of this project' });
        }

        // Check max members limit
        if (project.members.length >= project.settings.maxMembers) {
            return res.status(400).json({ error: 'Project has reached maximum member limit' });
        }

        // Only owner can add leaders
        if (role === 'leader' && requesterRole !== 'owner') {
            return res.status(403).json({ error: 'Only project owner can add leaders' });
        }

        project.members.push({
            user: userId,
            role: role
        });

        await project.save();
        await project.populate('members.user', 'firstName lastName email');

        res.status(200).json({
            message: 'Member added successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove member from project
const removeMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check permissions
        const requesterRole = project.getMemberRole(req.user._id);
        const targetRole = project.getMemberRole(userId);

        if (!requesterRole || !['owner', 'leader'].includes(requesterRole)) {
            return res.status(403).json({ error: 'Only project owners and leaders can remove members' });
        }

        // Leaders can't remove other leaders or owners
        if (requesterRole === 'leader' && ['leader', 'owner'].includes(targetRole)) {
            return res.status(403).json({ error: 'Leaders cannot remove other leaders or the owner' });
        }

        // Cannot remove the owner
        if (targetRole === 'owner') {
            return res.status(403).json({ error: 'Project owner cannot be removed' });
        }

        project.members = project.members.filter(
            member => member.user.toString() !== userId.toString()
        );

        await project.save();
        await project.populate('members.user', 'firstName lastName email');

        res.status(200).json({
            message: 'Member removed successfully',
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Only owner can delete project
        if (project.getMemberRole(req.user._id) !== 'owner') {
            return res.status(403).json({ error: 'Only project owner can delete the project' });
        }

        await Project.findByIdAndDelete(req.params.projectId);

        res.status(200).json({
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProject,
    getUserProjects,
    getProject,
    updateProject,
    addMember,
    removeMember,
    deleteProject
}; 