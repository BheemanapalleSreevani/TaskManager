require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

mongoose.connect(process.env.MONGO_URI).then(async () => {
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

    console.log('Total Users:', totalUsers);

    // Tasks per user
    const tasksPerUser = await Task.aggregate([
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      { $project: { name: { $ifNull: ['$user.name', 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    console.log('Tasks per user:', tasksPerUser);

    process.exit(0);
  } catch(e) {
    console.error('ERROR:', e);
    process.exit(1);
  }
});
