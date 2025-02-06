const express = require('express');
const User = require('../models/user');
const router = express.Router();

// ✅ Signup Route (Working)
router.post('/signup', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const user = new User({ username, firstname, lastname, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fix Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.json({
            message: "Login successful",
            user: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
