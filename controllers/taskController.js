const Task = require('../models/Task');
const Project = require('../models/Project');

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, projectId, assigneeId, dueDate, priority, dependencies, estimatedHours, tags } = req.body;

        // Verify project exists and user has access
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.isMember(req.user._id)) {
            return res.status(403).json({ error: 'You are not a member of this project' });
        }

        // Verify assignee is a project member if provided
        if (assigneeId && !project.isMember(assigneeId)) {
            return res.status(400).json({ error: 'Assignee must be a project member' });
        }

        // Verify dependencies exist and belong to the same project
        if (dependencies && dependencies.length > 0) {
            const dependentTasks = await Task.find({
                _id: { $in: dependencies },
                project: projectId
            });
            if (dependentTasks.length !== dependencies.length) {
                return res.status(400).json({ error: 'Invalid dependencies' });
            }
        }

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignee: assigneeId,
            creator: req.user._id,
            dueDate,
            priority,
            dependencies,
            estimatedHours,
            tags
        });

        await task.populate('assignee', 'firstName lastName email');
        await task.populate('creator', 'firstName lastName email');
        await task.populate('dependencies', 'title status');

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get project tasks
const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Verify project exists and user has access
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.isMember(req.user._id) && !project.settings.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const tasks = await Task.findProjectTasks(projectId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's assigned tasks
const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.findUserTasks(req.user._id);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get task details
const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId)
            .populate('assignee', 'firstName lastName email')
            .populate('creator', 'firstName lastName email')
            .populate('dependencies', 'title status');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify user has access to the task's project
        const project = await Project.findById(task.project);
        if (!project.isMember(req.user._id) && !project.settings.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify user has access to the task's project
        const project = await Project.findById(task.project);
        if (!project.isMember(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only creator, assignee, or project leaders can update
        const memberRole = project.getMemberRole(req.user._id);
        if (!task.isCreator(req.user._id) && 
            !task.isAssignee(req.user._id) && 
            !['owner', 'leader'].includes(memberRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const updatableFields = [
            'title', 'description', 'assignee', 'status', 
            'priority', 'dueDate', 'dependencies', 
            'estimatedHours', 'actualHours', 'tags'
        ];

        const updates = {};
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Handle status change to completed
        if (updates.status === 'completed' && task.status !== 'completed') {
            const canComplete = await task.canBeCompleted();
            if (!canComplete) {
                return res.status(400).json({ 
                    error: 'Cannot complete task: dependencies not completed' 
                });
            }
            updates.completedAt = Date.now();
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { $set: updates },
            { new: true, runValidators: true }
        )
        .populate('assignee', 'firstName lastName email')
        .populate('creator', 'firstName lastName email')
        .populate('dependencies', 'title status');

        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add comment to task
const addComment = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify user has access to the task's project
        const project = await Project.findById(task.project);
        if (!project.isMember(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        task.comments.push({
            user: req.user._id,
            content,
            attachments
        });

        await task.save();
        await task.populate('comments.user', 'firstName lastName email');

        res.status(200).json({
            message: 'Comment added successfully',
            comment: task.comments[task.comments.length - 1]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify user has access to the task's project
        const project = await Project.findById(task.project);
        if (!project.isMember(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only creator or project owner can delete
        const memberRole = project.getMemberRole(req.user._id);
        if (!task.isCreator(req.user._id) && memberRole !== 'owner') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        await Task.findByIdAndDelete(req.params.taskId);

        res.status(200).json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getProjectTasks,
    getUserTasks,
    getTask,
    updateTask,
    addComment,
    deleteTask
}; 