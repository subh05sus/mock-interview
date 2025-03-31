import express from "express";
import Question from "../models/Question";
import TestCase from "../models/TestCase";
import Job from "../models/Job";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { AIService } from "../services/aiService";

const router = express.Router();

// Get questions for a job
router.get("/job/:jobId", async (req, res) => {
  try {
    const questions = await Question.find({ jobId: req.params.jobId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Get questions for a job by slug
router.get("/job/slug/:jobSlug", async (req, res) => {
  try {
    // First find the job by slug
    const job = await Job.findOne({ slug: req.params.jobSlug });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Then find questions for that job
    const questions = await Question.find({ jobId: job._id });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Get question by ID
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

// Get question by slug
router.get("/question/slug/:slug", async (req, res) => {
  try {
    const question = await Question.findOne({ slug: req.params.slug });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

// Create question (admin only)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      examples,
      constraints,
      hints,
      preferredLanguage,
      jobId,
      solutionApproach,
      timeComplexity,
      spaceComplexity,
      tags,
      functionName,
      returnType,
      paramTypes,
      paramNames,
    } = req.body;

    // Generate language templates and answer snippets using AI
    const { templates, answerSnippets } =
      await AIService.generateLanguageTemplates(req.body);

    // Create new question with templates and answer snippets
    const newQuestion = new Question({
      title,
      description,
      difficulty,
      examples,
      constraints,
      hints,
      preferredLanguage,
      jobId,
      solutionApproach,
      timeComplexity,
      spaceComplexity,
      tags,
      functionName: functionName || "solution",
      returnType: returnType || "void",
      paramTypes: paramTypes || [],
      paramNames: paramNames || [],
      languageTemplates: templates,
      answerSnippets: answerSnippets,
    });

    await newQuestion.save();

    // Generate test cases for the question
    const testCases = await AIService.generateTestCases(newQuestion);
    await TestCase.insertMany(testCases);

    res.status(201).json({ question: newQuestion, testCases });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Failed to create question", error });
  }
});

// Update question (admin only)
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      examples,
      constraints,
      hints,
      preferredLanguage,
      jobId,
      solutionApproach,
      timeComplexity,
      spaceComplexity,
      tags,
      functionName,
      returnType,
      paramTypes,
      paramNames,
    } = req.body;

    // Generate new templates and answer snippets if function signature changed
    const updateData: any = {
      title,
      description,
      difficulty,
      examples,
      constraints,
      hints,
      preferredLanguage,
      jobId,
      solutionApproach,
      timeComplexity,
      spaceComplexity,
      tags,
      functionName: functionName || "solution",
      returnType: returnType || "void",
      paramTypes: paramTypes || [],
      paramNames: paramNames || [],
    };

    // Check if function signature changed
    const existingQuestion = await Question.findById(req.params.id);
    if (
      existingQuestion &&
      (existingQuestion.functionName !== functionName ||
        existingQuestion.returnType !== returnType ||
        JSON.stringify(existingQuestion.paramTypes) !==
          JSON.stringify(paramTypes) ||
        JSON.stringify(existingQuestion.paramNames) !==
          JSON.stringify(paramNames))
    ) {
      // Generate new templates and answer snippets
      const { templates, answerSnippets } =
        await AIService.generateLanguageTemplates(req.body);
      updateData.languageTemplates = templates;
      updateData.answerSnippets = answerSnippets;
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error updating question", error });
  }
});

// Delete question (admin only)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete associated test cases
    await TestCase.deleteMany({ questionId: req.params.id });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting question", error });
  }
});

// Get test cases for a question
router.get("/question/:questionId/test-cases", async (req, res) => {
  try {
    const testCases = await TestCase.find({
      questionId: req.params.questionId,
      isHidden: false, // Only return visible test cases
    });

    res.json(testCases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching test cases", error });
  }
});

// Generate test cases for a question (admin only)
router.post(
  "/question/:id/generate-test-cases",
  isAuthenticated,
  async (req, res) => {
    try {
      const { count = 5 } = req.body;

      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const testCases = await AIService.generateTestCases(question, count);

      // Delete existing test cases
      await TestCase.deleteMany({ questionId: req.params.id });

      // Save new test cases
      await TestCase.insertMany(testCases);

      res.json(testCases);
    } catch (error) {
      res.status(500).json({ message: "Error generating test cases", error });
    }
  }
);

router.get("/questions/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const questions = await Question.find({ jobId }).populate("jobId");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Get all questions (admin only)
router.get("/questions", isAuthenticated, async (req, res) => {
  try {
    const questions = await Question.find().populate("jobId");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Update templates and snippets (admin only)
router.put("/:id/templates", isAuthenticated, async (req, res) => {
  try {
    const { languageTemplates, answerSnippets } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { languageTemplates, answerSnippets },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error updating templates", error });
  }
});
export default router;
