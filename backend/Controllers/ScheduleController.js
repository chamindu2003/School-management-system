const Schedule = require('../Model/ScheduleModel');
const Teacher = require('../Model/TeacherModel');

// Create schedule entry (admin or teacher)
exports.createSchedule = async (req, res) => {
  try {
    const { class: className, subject, teacherId, room, timeFrom, timeTo, date, dayOfWeek } = req.body;
    const createdBy = req.user && req.user.id;

    if (!className || !subject || !timeFrom || !timeTo) {
      return res.status(400).json({ message: 'class, subject, timeFrom and timeTo are required' });
    }

    const doc = new Schedule({
      class: className,
      subject,
      teacher: teacherId,
      room,
      timeFrom,
      timeTo,
      date: date ? new Date(date) : undefined,
      dayOfWeek: typeof dayOfWeek !== 'undefined' ? Number(dayOfWeek) : undefined,
      createdBy
    });

    await doc.save();
    const populated = await doc.populate('teacher', 'name');
    res.status(201).json({ message: 'Schedule created', schedule: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get schedule for a class (for a specific date or today's dayOfWeek)
exports.getClassSchedule = async (req, res) => {
  try {
    const { className, date } = req.query;
    if (!className) return res.status(400).json({ message: 'className required' });

    let query = { class: className };

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0,0,0,0));
      const end = new Date(d.setHours(23,59,59,999));
      // Match either exact date entries OR entries for the same weekday
      query.$or = [
        { date: { $gte: start, $lte: end } },
        { dayOfWeek: start.getDay() }
      ];
    } else {
      // default: today's dayOfWeek or open date entries without date
      const today = new Date();
      query.$or = [ { dayOfWeek: today.getDay() }, { date: { $exists: false } } ];
    }

    const list = await Schedule.find(query).sort({ timeFrom: 1 }).populate('teacher', 'name');
    res.status(200).json({ schedules: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// (Optional) delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Schedule.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
