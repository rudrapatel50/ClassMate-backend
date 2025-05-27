const mongoose = require("mongoose");

const taskCommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    comments: [taskCommentSchema],
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    tags: [{
        type: String,
        trim: true
    }],
    estimatedHours: {
        type: Number,
        min: 0
    },
    actualHours: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ creator: 1 });

// Methods
taskSchema.methods.isAssignee = function(userId) {
    return this.assignee && this.assignee.toString() === userId.toString();
};

taskSchema.methods.isCreator = function(userId) {
    return this.creator.toString() === userId.toString();
};

taskSchema.methods.canBeCompleted = async function() {
    if (this.dependencies.length === 0) return true;
    
    const Task = mongoose.model('Task');
    const dependentTasks = await Task.find({
        _id: { $in: this.dependencies }
    });
    
    return dependentTasks.every(task => task.status === 'completed');
};

// Statics
taskSchema.statics.findProjectTasks = function(projectId) {
    return this.find({ project: projectId })
        .populate('assignee', 'firstName lastName email')
        .populate('creator', 'firstName lastName email')
        .populate('dependencies', 'title status');
};

taskSchema.statics.findUserTasks = function(userId) {
    return this.find({ assignee: userId })
        .populate('project', 'name')
        .populate('creator', 'firstName lastName email')
        .populate('dependencies', 'title status');
};

const Task = mongoose.model("Task", taskSchema);
module.exports = Task; 