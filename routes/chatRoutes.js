const express = require('express');
const GroupMessage = require('../models/groupMessage');
const router = express.Router();

// Fetch messages from a room
router.get('/messages/:room', async (req, res) => {
    const messages = await GroupMessage.find({ room: req.params.room });
    res.send(messages);
});

module.exports = router;
