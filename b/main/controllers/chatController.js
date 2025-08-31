const Chat = require('../models/Chat');
const { translateText } = require('../services/translationService');

// Create or access chat for user-agent/trip
exports.getOrCreateChat = async (req, res) => {
  try {
    const { participantId, tripId } = req.body;
    let chat = await Chat.findOne({ participants: { $all: [req.user.id, participantId] }, tripId });
    if (!chat) {
      chat = new Chat({ participants: [req.user.id, participantId], tripId, messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Error accessing chat', error: err.message });
  }
};

// Send chat message with optional translation
exports.sendMessage = async (req, res) => {
  const { chatId, content, targetLang } = req.body;

  try {
    let textToStore = content;

    // Agar target language English se alag hai tabhi translate karo
    if (targetLang && targetLang !== 'en') {
      textToStore = await translateText(content, targetLang);
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.push({
      sender: req.user.id,
      content: textToStore,    // Translated ya original message
      timestamp: new Date()
    });

    chat.updatedAt = new Date();
    await chat.save();

    res.json({ message: 'Message sent', chat });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};




exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).populate('participants', 'name email').sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};
