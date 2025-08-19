// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONFIG: change these to match your MySQL setup ---
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASS = "Nive@282005";           // <-- put your MySQL root password if any
const DB_NAME = "coastalDB";
const JWT_SECRET = "replace_this_with_a_strong_secret";
// -------------------------------------------------------

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected!");
});

// ---------- Signup endpoint ----------
app.post("/signup", async (req, res) => {
  try {
    const { username, mobile, email, password, gkAnswers } = req.body;
    if (!username || !mobile || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check existing
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", err });
      if (results.length > 0) return res.status(400).json({ message: "User already exists" });

      // hash password
      const hashed = await bcrypt.hash(password, 10);

      const sql = "INSERT INTO users (username, mobile, email, password, gk_answers) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [username, mobile, email, hashed, JSON.stringify(gkAnswers || [])], (err2, result) => {
        if (err2) return res.status(500).json({ message: "DB insert error", err: err2 });
        return res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error", error: e });
  }
});

// ---------- Login endpoint ----------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // optional: issue token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// ---------- Start server ----------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
