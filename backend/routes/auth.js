const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Register API
router.post("/register", upload.single("profile_picture"), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;
    let primaryAddress = null;
    if (req.body.primary_address) {
      try {
        primaryAddress = JSON.parse(req.body.primary_address);
      } catch (error) {
        console.warn("Invalid primary_address payload", error.message);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // file path (only if user uploads photo)
    const profilePic = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO users 
      (username, email, password, first_name, last_name, phone, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone,
      profilePic,
    ]);

    const userId = result.insertId;

    if (primaryAddress && primaryAddress.latitude && primaryAddress.longitude) {
      await pool.query(
        `INSERT INTO user_addresses 
          (user_id, label, address_line, landmark, city, state, postal_code, country, latitude, longitude, place_id, formatted_address, instructions, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `,
        [
          userId,
          primaryAddress.label || "Primary",
          primaryAddress.address_line || primaryAddress.formatted_address || "",
          primaryAddress.landmark || "",
          primaryAddress.city || "",
          primaryAddress.state || "",
          primaryAddress.postal_code || "",
          primaryAddress.country || "",
          Number(primaryAddress.latitude),
          Number(primaryAddress.longitude),
          primaryAddress.place_id || "",
          primaryAddress.formatted_address || primaryAddress.address_line || "",
          primaryAddress.instructions || "",
        ]
      );
    }

    // Get the newly created user
    const [newUser] = await pool.query(
      "SELECT id, username, email, first_name, last_name, phone, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      message: "User registered successfully!",
      user: {
        ...newUser[0],
        profile_picture: newUser[0].profile_picture
          ? `/uploads/${newUser[0].profile_picture}`
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed!" });
  }
});

module.exports = router;

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const user = result[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || "your_super_secret_jwt_key",
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          profile_picture: user.profile_picture
            ? `/uploads/${user.profile_picture}`
            : null,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// Get current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id, username, email, first_name, last_name, phone, profile_picture, membership_type, membership_expires_at, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];
    if (user.profile_picture) {
      user.profile_picture = `/uploads/${user.profile_picture}`;
    }

    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put(
  "/update",
  authMiddleware,
  upload.single("profile_picture"),
  async (req, res) => {
    try {
      const { first_name, last_name, phone } = req.body;
      const updates = [];
      const values = [];

      if (first_name !== undefined) {
        updates.push("first_name = ?");
        values.push(first_name);
      }
      if (last_name !== undefined) {
        updates.push("last_name = ?");
        values.push(last_name);
      }
      if (phone !== undefined) {
        updates.push("phone = ?");
        values.push(phone);
      }
      if (req.file) {
        updates.push("profile_picture = ?");
        values.push(req.file.filename);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      values.push(req.user.id);

      await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      // Get updated user
      const [result] = await pool.query(
        "SELECT id, username, email, first_name, last_name, phone, profile_picture, membership_type, membership_expires_at FROM users WHERE id = ?",
        [req.user.id]
      );

      const updatedUser = result[0];
      if (updatedUser.profile_picture) {
        updatedUser.profile_picture = `/uploads/${updatedUser.profile_picture}`;
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
