const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const membershipRoutes = require("./routes/membership");
const paymentRoutes = require("./routes/payment");
const addressRoutes = require("./routes/addresses");
const deliveryRoutes = require("./routes/delivery");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
