require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MySQL Connection
========================= */
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  connectTimeout: 20000
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.send("UTA Tennis Backend is running");
});

/* =========================
   REGISTER PLAYER (CREATE)
========================= */
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

  if (!Name || !WhatsAppNumber) {
    return res.json({ success: false, message: "Required fields missing" });
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
        console.error("Insert error:", err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* =========================
   VIEW PLAYERS (READ)
========================= */
app.get("/players", (req, res) => {
  db.query("SELECT * FROM tbl_players", (err, rows) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.json([]);
    }
    res.json(rows);
  });
});

/* =========================
   PLAYER LOGIN
========================= */
app.post("/login", (req, res) => {
  db.query(
    "SELECT id FROM tbl_players WHERE WhatsAppNumber = ?",
    [req.body.whatsapp],
    (err, rows) => {
      if (rows && rows.length > 0) res.json({ success: true });
      else res.json({ success: false });
    }
  );
});

/* =========================
   ADMIN LOGIN
========================= */
app.post("/admin-login", (req, res) => {
  if (req.body.username === "admin" && req.body.password === "admin123") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

/* =========================
   UPDATE PLAYER (ADMIN)
========================= */
app.put("/players/:id", (req, res) => {
  const { Name, WhatsAppNumber, City } = req.body;
  const id = req.params.id;

  const sql = `
    UPDATE tbl_players
    SET Name = ?, WhatsAppNumber = ?, City = ?
    WHERE id = ?
  `;

  db.query(sql, [Name, WhatsAppNumber, City, id], (err) => {
    if (err) {
      console.error("Update error:", err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

/* =========================
   DELETE PLAYER (ADMIN)
========================= */
app.delete("/players/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM tbl_players WHERE id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("Delete error:", err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
