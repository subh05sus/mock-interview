import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface RateLimitRecord {
  ip: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, default: Date.now, expires: 60 },
});

const RateLimit = mongoose.model("RateLimit", RateLimitSchema);

export const submissionRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const MAX_REQUESTS = 10; // Max 10 submissions per minute
  const WINDOW_MS = 60 * 1000; // 1 minute

  const ip = req.ip || req.socket.remoteAddress || "unknown";

  try {
    // Find or create rate limit record
    let record = await RateLimit.findOne({ ip });

    if (!record) {
      record = new RateLimit({
        ip,
        count: 0,
        resetAt: new Date(Date.now() + WINDOW_MS),
      });
    }

    // Check if window has expired
    if (Date.now() > record.resetAt.getTime()) {
      record.count = 0;
      record.resetAt = new Date(Date.now() + WINDOW_MS);
    }

    // Increment count
    record.count += 1;
    await record.save();

    // Check if over limit
    if (record.count > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many submissions. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next(); // Continue even if rate limiting fails
  }
};
