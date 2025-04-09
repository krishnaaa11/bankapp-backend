const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs"); // For password hashing
const db = new sqlite3.Database("./bank.db");

// Hash Password Function
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Create Tables
db.serialize(() => {
    console.log("🚀 Creating tables...");

    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        account_type TEXT CHECK(account_type IN ('Savings', 'Checking', 'Business', 'Corporate')) DEFAULT 'Savings',
        balance REAL DEFAULT 1000.00,
        overdraft REAL DEFAULT 500.00,
        spending REAL DEFAULT 200.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Transactions Table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('Deposit', 'Withdrawal', 'Loan Payment', 'Transfer')) NOT NULL,
        category TEXT CHECK(category IN ('Salary', 'Shopping', 'Bills', 'Food', 'Transport', 'Entertainment', 'Others')) DEFAULT 'Others',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Loans Table
    db.run(`CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        loan_amount REAL NOT NULL,
        interest_rate REAL DEFAULT 5.0,
        remaining_balance REAL NOT NULL,
        due_date TIMESTAMP NOT NULL,
        status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Paid')) DEFAULT 'Pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Beneficiaries Table (For Transfers)
    db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        beneficiary_name TEXT NOT NULL,
        beneficiary_account TEXT UNIQUE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log("✅ Tables created successfully.");

    // Insert Sample Users
    console.log("🔹 Inserting sample users...");
    const users = [
        ["Steph", "steph@unibank.com", hashPassword("steph123"), "Business", 5000.00, 1500.00, 800.00],
        ["John Doe", "john@unibank.com", hashPassword("password123"), "Savings", 1200.00, 500.00, 250.00],
        ["Jane Doe", "jane@unibank.com", hashPassword("password123"), "Checking", 800.00, 300.00, 150.00],
        ["Mike Ross", "mike@unibank.com", hashPassword("password123"), "Business", 5000.00, 2000.00, 700.00],
        ["Sara Smith", "sara@unibank.com", hashPassword("password123"), "Corporate", 10000.00, 3000.00, 2000.00]
    ];

    const userStmt = db.prepare("INSERT OR IGNORE INTO users (name, email, password, account_type, balance, overdraft, spending) VALUES (?, ?, ?, ?, ?, ?, ?)");
    users.forEach(user => userStmt.run(...user));
    userStmt.finalize();

    // Insert Sample Transactions
    console.log("💰 Inserting sample transactions...");
    const transactions = [
        [1, 3000.00, "Deposit", "Salary"],
        [1, 500.00, "Withdrawal", "Shopping"],
        [1, 700.00, "Withdrawal", "Bills"],
        [1, 400.00, "Withdrawal", "Food"],
        [1, 150.00, "Withdrawal", "Transport"],
        [1, 250.00, "Withdrawal", "Entertainment"],
        [1, 1200.00, "Loan Payment", "Bills"],
        [2, 200.00, "Withdrawal", "Shopping"],
        [3, 1000.00, "Loan Payment", "Bills"],
        [4, 150.00, "Transfer", "Food"],
        [5, 300.00, "Deposit", "Salary"]
    ];

    const txnStmt = db.prepare("INSERT INTO transactions (user_id, amount, type, category) VALUES (?, ?, ?, ?)");
    transactions.forEach(txn => txnStmt.run(...txn));
    txnStmt.finalize();

    // Insert Sample Loans
    console.log("🏦 Inserting sample loans...");
    const loans = [
        [1, 5000.00, 4.5, 5000.00, "2024-12-31", "Approved"],
        [3, 2000.00, 5.0, 2000.00, "2024-11-30", "Pending"],
        [5, 3000.00, 6.0, 3000.00, "2025-01-15", "Rejected"]
    ];

    const loanStmt = db.prepare("INSERT INTO loans (user_id, loan_amount, interest_rate, remaining_balance, due_date, status) VALUES (?, ?, ?, ?, ?, ?)");
    loans.forEach(loan => loanStmt.run(...loan));
    loanStmt.finalize();

    console.log("✅ Sample data inserted successfully.");
});

console.log("✅ Database setup complete.");
module.exports = db;
