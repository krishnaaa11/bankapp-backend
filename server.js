require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth");
const chatbotRoutes = require("./chatbot");
const transactionRoutes = require("./transactions"); // ✅ Added Transactions Route

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// ✅ Root Route
app.get("/", (req, res) => {
    res.send("🚀 UniBank API is running...");
});

// ✅ Register API Routes
app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/transactions", transactionRoutes); // ✅ Now handles transactions

// ✅ Handle 404 Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server with Proper Logging
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
