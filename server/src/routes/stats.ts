import express from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import User from "../models/User";
import Job from "../models/Job";
import Question from "../models/Question";
import Submission from "../models/Submission";

const router = express.Router();

// Get admin dashboard stats
router.get("/admin", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Get submissions by difficulty
    const submissionsByDifficulty = await Submission.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "questionId",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.difficulty",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get submissions by language
    const submissionsByLanguage = await Submission.aggregate([
      {
        $group: {
          _id: "$language",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);

    // Get pass rate by difficulty
    const passRateByDifficulty = await Submission.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "questionId",
          foreignField: "_id",
          as: "question",
        },
      },
      { $unwind: "$question" },
      {
        $group: {
          _id: "$question.difficulty",
          total: { $sum: 1 },
          passed: {
            $sum: {
              $cond: [{ $eq: ["$passed", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          name: "$_id",
          passRate: {
            $multiply: [{ $divide: ["$passed", "$total"] }, 100],
          },
          _id: 0,
        },
      },
    ]);

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .populate("questionId", "title difficulty")
      .lean();

    // Format recent submissions
    const formattedSubmissions = recentSubmissions.map((submission) => ({
      _id: submission._id,
      user: submission.userId,
      question: submission.questionId,
      language: submission.language,
      passed: submission.passed,
      submittedAt: submission.submittedAt,
    }));

    res.json({
      totalUsers,
      totalJobs,
      totalQuestions,
      totalSubmissions,
      submissionsByDifficulty,
      submissionsByLanguage,
      passRateByDifficulty,
      recentSubmissions: formattedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching admin stats", error });
  }
});

export default router;
