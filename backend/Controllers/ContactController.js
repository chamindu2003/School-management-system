const Message = require('../Model/MessageModel');

exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });

    const m = new Message({ name, email, subject, message });
    await m.save();

    // For now we simply persist messages. Optionally send email/notification to admin here.
    return res.status(201).json({ message: 'Message received' });
  } catch (err) {
    console.error('createMessage error', err);
    return res.status(500).json({ message: 'Unable to save message' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ read: false });
    return res.json({ unread: count });
  } catch (err) {
    console.error('getUnreadCount error', err);
    return res.status(500).json({ message: 'Unable to get unread count' });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ messages });
  } catch (err) {
    console.error('listMessages error', err);
    return res.status(500).json({ message: 'Unable to list messages' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const id = req.params.id;
    const m = await Message.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!m) return res.status(404).json({ message: 'Message not found' });
    return res.json({ message: 'Marked read' });
  } catch (err) {
    console.error('markRead error', err);
    return res.status(500).json({ message: 'Unable to mark read' });
  }
};
