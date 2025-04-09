const express = require("express");
const db = require("./database");

const router = express.Router();

// ✅ Fetch transactions & spending breakdown for a user
router.get("/:user_id", (req, res) => {
    const userId = req.params.user_id;

    if (!userId) {
        console.warn("⚠️ Missing user ID in request.");
        return res.status(400).json({ error: "User ID is required." });
    }

    console.log(`🔹 Fetching transactions for user ${userId}...`);

    db.all(
        "SELECT id, user_id, amount, type, category, timestamp FROM transactions WHERE user_id = ? ORDER BY timestamp DESC",
        [userId],
        (err, transactions) => {
            if (err) {
                console.error("❌ Database error:", err.message);
                return res.status(500).json({ error: "Database error" });
            }

            if (!transactions.length) {
                console.warn(`⚠️ No transactions found for user ${userId}`);
                return res.json({ transactions: [], spendingBreakdown: {} });
            }

            // ✅ Categorize Spending
            const spendingBreakdown = {
                food: 0,
                shopping: 0,
                bills: 0,
                transport: 0,
                others: 0
            };

            transactions.forEach((txn) => {
                if (txn.type === "Withdrawal" || txn.type === "Transfer") {
                    spendingBreakdown[txn.category.toLowerCase()] = 
                        (spendingBreakdown[txn.category.toLowerCase()] || 0) + txn.amount;
                }
            });

            console.log(`✅ Found ${transactions.length} transactions for user ${userId}`);
            res.json({ transactions, spendingBreakdown });
        }
    );
});

module.exports = router;
