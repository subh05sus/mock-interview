import express from "express";
import Job from "../models/Job";
import Question from "../models/Question";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { AIService } from "../services/aiService";
import TestCase from "../models/TestCase"; // Import TestCase model

const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error });
  }
});

// Get job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error });
  }
});

// Get job by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error });
  }
});

// Create job (admin only)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requiredSkills,
      difficulty,
      position,
      location,
      salaryRange,
      jobType,
    } = req.body;

    const job = new Job({
      title,
      company,
      description,
      requiredSkills,
      difficulty: difficulty || "Mid Level",
      position,
      location,
      salaryRange,
      jobType: jobType || "Full-time",
      slug: title.replace(/\s+/g, "-").toLowerCase(),
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error });
  }
});

// Update job (admin only)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requiredSkills,
      difficulty,
      position,
      location,
      salaryRange,
      jobType,
    } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        description,
        requiredSkills,
        difficulty,
        position,
        location,
        salaryRange,
        jobType,
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error });
  }
});

// Delete job (admin only)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Delete associated questions
    await Question.deleteMany({ jobId: req.params.id });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error });
  }
});

// Generate questions for a job (admin only)
router.post("/:id/generate-questions", isAuthenticated, async (req, res) => {
  try {
    const { count = 3, difficulties = ["Easy", "Medium", "Hard"] } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Generate questions
    const questionPromises = [];
    for (let i = 0; i < count; i++) {
      // Distribute difficulties evenly
      const difficulty = difficulties[i % difficulties.length];
      questionPromises.push(AIService.generateQuestion(job, difficulty));
    }

    const generatedQuestions = await Promise.all(questionPromises);

    // Save generated questions to database
    const savedQuestions = [];
    for (const questionData of generatedQuestions) {
      const question = new Question(questionData);
      question.slug = questionData.title.replace(/\s+/g, "-").toLowerCase();
      await question.save();
      savedQuestions.push(question);

      // Generate test cases for each question
      try {
        const testCases = await AIService.generateTestCases(question);
        await TestCase.insertMany(testCases);
      } catch (testCaseError) {
        console.error("Error generating test cases:", testCaseError);
        // Optionally, continue to the next question or return an error
      }
    }

    // Return generated questions
    res.json(savedQuestions);
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ message: "Error generating questions", error });
  }
});

export default router;
