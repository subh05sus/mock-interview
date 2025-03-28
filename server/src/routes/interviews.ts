import express from "express";
import Question from "../models/Question";
import Job from "../models/Job";

const router = express.Router();

// Get questions for a specific job
router.get("/job/:jobId", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find questions that match the job tags
    const questions = await Question.find({
      jobTags: { $in: [job.title, ...job.requirements] },
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Get a specific question
router.get("/question/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

export default router;
