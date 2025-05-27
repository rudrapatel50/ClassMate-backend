const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'leader', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true
        }
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'review', 'completed'],
        default: 'planning'
    },
    members: [projectMemberSchema],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        maxMembers: {
            type: Number,
            default: 5
        },
        allowJoinRequests: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

projectSchema.index({ "course.code": 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ "members.user": 1 });

projectSchema.virtual('groups', {
    ref: 'Group',
    localField: '_id',
    foreignField: 'project'
});

projectSchema.methods.isMember = function(userId) {
    return this.members.some(member => member.user.toString() === userId.toString());
};

projectSchema.methods.getMemberRole = function(userId) {
    const member = this.members.find(member => member.user.toString() === userId.toString());
    return member ? member.role : null;
};

// Statics
projectSchema.statics.findUserProjects = function(userId) {
    return this.find({ "members.user": userId })
               .populate('members.user', 'firstName lastName email');
};

const Project = mongoose.model("Project", projectSchema);
module.exports = Project; 