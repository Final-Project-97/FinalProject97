import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database.js";
import { carRoutes } from "./routes/car.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { authRoutes } from "./auth/routes.js";
import { wishlistRoutes } from "./wishlist/routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(express.json());
app.use(cors());

// Registrasi Rute API
app.use("/api/cars", carRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);



// Endpoint Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "SUCCESS",
    message: "Backend RAC AI aktif dan berjalan normal!",
    timestamp: new Date().toISOString(),
  });
});

// Menyalakan Server & Menghubungkan DB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Berjalan sukses di port ${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Gagal menyalakan server:", error);
  }
};

startServer();
