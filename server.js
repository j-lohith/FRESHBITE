const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./backend/routes/auth");
const recipeRoutes = require("./backend/routes/recipes");
const cartRoutes = require("./backend/routes/cart");
const orderRoutes = require("./backend/routes/orders");
const membershipRoutes = require("./backend/routes/membership");
const paymentRoutes = require("./backend/routes/payment");
const addressRoutes = require("./backend/routes/addresses");
const deliveryRoutes = require("./backend/routes/delivery");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/delivery", deliveryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});


const fs = require("fs");
const pool = require("./backend/config/db");

app.get("/api/init-db", async (req, res) => {
try {
let sql = fs.readFileSync("./backend/database.sql", "utf8");

// 🚨 Make sure you already removed:
// CREATE DATABASE and USE statements

await pool.query(sql); // ✅ run full SQL at once

res.send("✅ Database Initialized Successfully");


} catch (err) {
console.error("DB INIT ERROR:", err);
res.status(500).send(err.message); // 👈 show real error
}
});


app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
