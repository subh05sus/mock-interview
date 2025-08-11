import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import jobRoutes from "./routes/jobs";
import interviewRoutes from "./routes/interviews";
import submissionRoutes from "./routes/submissions";
import authRoutes from "./routes/auth";
import statsRoutes from "./routes/stats";
import configurePassport from "./config/passport";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/jobsforce"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/jobs", jobRoutes);
app.use("/interviews", interviewRoutes);
app.use("/submissions", submissionRoutes);
app.use("/auth", authRoutes);
app.use("/stats", statsRoutes);

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "API test route is working!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
