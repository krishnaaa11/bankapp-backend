const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// 🔍 Local knowledge base for instant replies
const localResponses = {
  balance: "💰 Your current balance is $5,200.",
  transfer: "💸 You can transfer money from the 'Quick Services' section.",
  card: "💳 You have a debit and credit card. Both are active.",
  loan: "🏦 You have an active loan of $12,400. EMI is due on 5th Apr.",
  investment: "📈 Your investment portfolio is $6,200. ROI: +8.2%.",
  overdraft: "📉 Overdraft used: $320. Available: $680.",
  hello: "👋 Hey! I'm UniBot, your AI banking assistant.",
  help: "🧠 I can help with balance, loans, cards, investments, and more!",
  thanks: "🙏 You're welcome! Let me know if you need anything else.",
};

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const lowerMsg = message.toLowerCase();
    console.log("🔹 Chatbot received:", lowerMsg);

    // ✅ Keyword Matching First
    for (const keyword in localResponses) {
      if (lowerMsg.includes(keyword)) {
        const quickReply = localResponses[keyword];
        console.log("✅ Quick Reply:", quickReply);
        return res.json({ reply: quickReply });
      }
    }

    // 🔁 Fallback to OpenRouter AI if no match
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Keep responses short, helpful and banking-friendly. You're UniBot — a smart AI assistant.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 60,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply =
      response.data.choices[0]?.message?.content?.trim() ||
      "🤖 Hmm, I’m not sure about that yet.";

    console.log("🧠 AI Response:", botReply);
    res.json({ reply: botReply });
  } catch (error) {
    console.error("❌ Chatbot API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Chatbot service is unavailable",
      fallback: "I'm having trouble right now, but happy to try again!",
    });
  }
});

module.exports = router;
