const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { title, description, deadline, color } = req.body;

    if (!title) return sendError(res, 'Project title is required.', 400);
    const project = await Project.create({
      title,
      description,
      deadline,
      color,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populated = await project.populate('createdBy', 'name email');

    const io = req.app.get('io');
    if (io) {
      io.emit('PROJECT_CREATED', populated);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, populated, 'Project created.', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Get all projects (admin: all, member: own)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });
        const completedCount = await Task.countDocuments({ project: p._id, status: 'done' });
        return {
          ...p.toObject(),
          taskCount,
          completedCount,
          progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
        };
      })
    );

    return sendSuccess(res, projectsWithCounts, 'Projects fetched.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (members only)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar role');

    if (!project) return sendError(res, 'Project not found.', 404);

    // Check access
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return sendError(res, 'Access denied.', 403);
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    const taskCount = tasks.length;
    const completedCount = tasks.filter((t) => t.status === 'done').length;

    return sendSuccess(res, {
      ...project.toObject(),
      tasks,
      taskCount,
      completedCount,
      progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email').populate('members', 'name email avatar');

    if (!project) return sendError(res, 'Project not found.', 404);

    const io = req.app.get('io');
    if (io) {
      io.emit('PROJECT_UPDATED', project);
      io.to(project._id.toString()).emit('PROJECT_DETAILS_UPDATED', project);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, project, 'Project updated.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found.', 404);

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('PROJECT_DELETED', req.params.id);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, null, 'Project and its tasks deleted.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return sendError(res, 'User not found.', 404);

    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found.', 404);

    if (project.members.includes(userId)) {
      return sendError(res, 'User already a member.', 400);
    }

    project.members.push(userId);
    await project.save();

    const updated = await Project.findById(req.params.id).populate('members', 'name email avatar');
    return sendSuccess(res, updated, 'Member added.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 'Project not found.', 404);

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    return sendSuccess(res, null, 'Member removed.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
