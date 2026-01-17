const Task = require('../Model/TaskModel');

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedGroups = [], dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const createdBy = (req.user && req.user.id) || req.body.createdBy;
    if (!createdBy) return res.status(401).json({ message: 'Creator required' });

    const marksByGroup = assignedGroups.map(g => ({ group: g, marks: null }));

    const task = new Task({ title, description, assignedGroups, marksByGroup, createdBy, dueDate });
    await task.save();
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update marks for a group on a task
exports.updateMarks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { group, marks } = req.body;
    if (!group) return res.status(400).json({ message: 'group is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const item = task.marksByGroup.find(m => m.group === group);
    if (item) {
      item.marks = marks;
    } else {
      task.marksByGroup.push({ group, marks });
    }

    await task.save();
    res.status(200).json({ message: 'Marks updated', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update task meta (title, description, assignedGroups, dueDate)
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assignedGroups, dueDate } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedGroups !== undefined) {
      task.assignedGroups = assignedGroups;
      // ensure marksByGroup contains entries for assigned groups
      const existing = task.marksByGroup || [];
      const updated = assignedGroups.map(g => {
        const ex = existing.find(e => e.group === g);
        return ex ? ex : { group: g, marks: null };
      });
      task.marksByGroup = updated;
    }
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    res.status(200).json({ message: 'Task updated', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
