const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority, status, tags } = req.body;

    if (!title) return sendError(res, 'Task title is required.', 400);
    if (!project) return sendError(res, 'Project ID is required.', 400);

    const proj = await Project.findById(project);
    if (!proj) return sendError(res, 'Project not found.', 404);

    const task = await Task.create({
      title, description, project, assignedTo, dueDate, priority, status, tags,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title');

    const io = req.app.get('io');
    if (io) {
      io.to(project.toString()).emit('TASK_CREATED', populated);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, populated, 'Task created.', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignedTo, search, overdue } = req.query;

    let filter = {};

    // Members only see assigned tasks or tasks in their projects
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'done' };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color')
      .sort({ createdAt: -1 });

    return sendSuccess(res, tasks, 'Tasks fetched.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color')
      .populate('comments.user', 'name email avatar');

    if (!task) return sendError(res, 'Task not found.', 404);
    return sendSuccess(res, task, 'Task fetched.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (admin: all fields, member: status only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found.', 404);

    let updateData = req.body;

    // Members can only update status
    if (req.user.role === 'member') {
      const { status } = req.body;
      if (!status) return sendError(res, 'Members can only update task status.', 403);
      updateData = { status };
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title');

    const io = req.app.get('io');
    if (io) {
      io.to(updated.project._id.toString()).emit('TASK_UPDATED', updated);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, updated, 'Task updated.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, 'Task not found.', 404);

    const io = req.app.get('io');
    if (io) {
      io.to(task.project.toString()).emit('TASK_DELETED', task._id);
      io.emit('DASHBOARD_UPDATE');
    }

    return sendSuccess(res, null, 'Task deleted.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 'Comment text is required.', 400);

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found.', 404);

    task.comments.push({ user: req.user._id, text });
    await task.save();

    const updated = await Task.findById(task._id).populate('comments.user', 'name email avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(task.project.toString()).emit('TASK_UPDATED', updated);
    }

    return sendSuccess(res, updated.comments, 'Comment added.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, addComment };
