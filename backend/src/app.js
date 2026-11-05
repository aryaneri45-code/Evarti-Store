
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import pool from "./config/database.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Evarti Store API",
        version: "1.0.0"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "Evarti Store Backend"
    });
});

app.get("/api/health/database", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT VERSION() AS version");

        res.json({
            success: true,
            database: "connected",
            version: rows[0].version
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            database: "disconnected"
        });
    }
});

// API Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

app.listen(PORT, () => {
    console.log(`Evarti Store API running on port ${PORT}`);
});
