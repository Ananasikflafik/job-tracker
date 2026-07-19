const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

//Post /api/auth/register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password has to be minimum 6 characters" });
    }

    try {
        const has = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: "Email is already used" });
    }
});

//POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const valid = await bcrypt.compare(password, user, password_hash);
        if (!valid) return res.status(401).json({ error: "Invlaid email or password" });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;