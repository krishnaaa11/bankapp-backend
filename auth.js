const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");
require("dotenv").config();

const router = express.Router();  // ✅ Fix: Initialize router before using it

// ✅ Fetch logged-in user details
router.get("/user", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ Invalid token:", err);
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        db.get("SELECT id, name, email, account_type, balance, overdraft, spending FROM users WHERE id = ?", 
            [decoded.id], 
            (err, user) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (!user) return res.status(404).json({ error: "User not found" });

                console.log("✅ Returning user data:", user);
                res.json(user);
        });
    });
});

// ✅ User login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(400).json({ error: "User not found" });

        console.log("🔍 Checking login for:", user.email);
        console.log("📌 Entered Password:", password);
        console.log("🔑 Stored Hashed Password:", user.password);

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password mismatch!");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        console.log("✅ Password matches! Logging in...");

        // ✅ Generate JWT Token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "6h" });

        res.json({ token, user });
    });
});

module.exports = router;
