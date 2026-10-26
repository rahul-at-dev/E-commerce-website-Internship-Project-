
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dns = require("dns");

// Google DNS workaround
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Database connection
const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");

// Error handling
const {
    notFound,
    errorHandler
} = require("./src/middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// IMPORTANT: Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ElectroCart API is running"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Frontend fallback
app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server after database connection
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log("================================");
            console.log("MongoDB Atlas Connected!");
            console.log(`ElectroCart: http://localhost:${PORT}`);
            console.log("================================");
        });
    })
    .catch((error) => {
        console.error(
            "Database connection failed:",
            error.message
        );
        process.exit(1);
    });
