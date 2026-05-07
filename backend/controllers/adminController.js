const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users fetched.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return sendError(res, 'Invalid role. Use admin or member.', 400);
    }

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 'You cannot change your own role.', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, user, `User role updated to ${role}.`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 'You cannot deactivate yourself.', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(
      res,
      { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'}.`
    );
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 'You cannot delete yourself.', 400);
    }

    await User.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'User deleted.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Get system-wide analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      highPriorityTasks,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'done' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
      Task.countDocuments({ priority: 'high', status: { $ne: 'done' } }),
    ]);

    // Tasks per user
    const tasksPerUser = await Task.aggregate([
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$user.name', 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent projects
    const recentProjects = await Project.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, {
      overview: {
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        highPriorityTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksPerUser,
      tasksByPriority,
      tasksByStatus,
      recentProjects,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, deleteUser, getAnalytics };
