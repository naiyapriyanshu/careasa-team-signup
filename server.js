const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

/* ============================
   MIDDLEWARE
   ============================ */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* ============================
   POSTGRES DATABASE CONNECTION
   ============================ */
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "careasa",
    password: "password", // 🔴 CHANGE THIS
    port: 5432
});

pool.query("SELECT 1")
    .then(() => console.log("✅ PostgreSQL connected"))
    .catch(err => console.error("❌ PostgreSQL error:", err));

/* ============================
   FILE UPLOAD CONFIG (MULTER)
   ============================ */
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx/;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.test(ext));
    }
});

/* ============================
   ROUTES
   ============================ */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/team-signup", upload.single("agreement"), async (req, res) => {
    try {
        const { fullName, email, phone, dob, department, address } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Agreement file required" });
        }

        const query = `
            INSERT INTO team_members
            (full_name, email, phone, date_of_birth, department, address, agreement_file)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await pool.query(query, [
            fullName,
            email,
            phone,
            dob,
            department,
            address,
            req.file.path
        ]);

        res.json({ message: "✅ Team member registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/* ============================
   START SERVER
   ============================ */
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
