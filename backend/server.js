require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

/* REGISTER PLAYER */
app.post("/register", (req, res) => {
  const {
    Name,
    WhatsAppNumber,
    DateOfBirth,
    City,
    ShirtSize,
    ShortSize,
    FoodPref,
    StayYorN,
    FeePaid
  } = req.body;

  console.log("Incoming:", req.body);

  if (!Name || !WhatsAppNumber) {
    return res.json({
      success: false,
      message: "Name and WhatsApp are required"
    });
  }

  const sql = `
    INSERT INTO tbl_players
    (Name, WhatsAppNumber, DateOfBirth, City, ShirtSize, ShortSize, FoodPref, StayYorN, FeePaid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      Name,
      WhatsAppNumber,
      DateOfBirth,
      City,
      ShirtSize,
      ShortSize,
      FoodPref,
      StayYorN,
      FeePaid
    ],
    (err) => {
      if (err) {
        console.error("INSERT ERROR:", err);
        return res.json({
          success: false,
          message: "Database error"
        });
      }

      res.json({ success: true });
    }
  );
});


/* VIEW PLAYERS */
app.get("/players", (req, res) => {
  db.query("SELECT * FROM tbl_players", (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

/* PLAYER LOGIN */
app.post("/login", (req, res) => {
  db.query(
    "SELECT * FROM tbl_players WHERE WhatsAppNumber=?",
    [req.body.whatsapp],
    (err, rows) => {
      if (rows.length > 0) res.json({ success: true });
      else res.json({ success: false });
    }
  );
});

/* ADMIN LOGIN */
app.post("/admin-login", (req, res) => {
  if (req.body.username === "admin" && req.body.password === "admin123") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at:");
  console.log("➡ http://localhost:3000/register.html");
  console.log("➡ http://localhost:3000/login.html");
  console.log("➡ http://localhost:3000/admin-login.html");
});
