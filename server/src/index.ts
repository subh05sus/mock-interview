import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import jobRoutes from "./routes/jobs";
import interviewRoutes from "./routes/interviews";
import submissionRoutes from "./routes/submissions";
import authRoutes from "./routes/auth";
import configurePassport from "./config/passport";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mock-interview"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
