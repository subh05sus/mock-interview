import express from "express";
import Submission from "../models/Submission";
import Question from "../models/Question";
import { executeCode } from "../services/codeExecutionService";
import { getAIFeedback } from "../services/aiService";

const router = express.Router();

// Submit code for evaluation
router.post("/", async (req, res) => {
  try {
    const { userId, questionId, jobId, code, language } = req.body;

    // Get the question to access test cases
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Execute code against test cases
    const executionResult = await executeCode(
      code,
      language,
      question.testCases
    );

    // Create submission record
    const submission = new Submission({
      userId,
      questionId,
      jobId,
      code,
      language,
      status: executionResult.status,
      executionTime: executionResult.executionTime,
      memory: executionResult.memory,
    });

    // If code passed all test cases, get AI feedback
    if (executionResult.status === "Accepted") {
      const feedback = await getAIFeedback(code, language, question);
      submission.feedback = feedback;
    }

    await submission.save();
    res.status(201).json({
      submission,
      executionResult,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing submission", error });
  }
});

// Get all submissions for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.params.userId })
      .populate("questionId")
      .populate("jobId")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

export default router;
