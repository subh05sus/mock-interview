import express, { Request, Response } from "express";
import Submission from "../models/Submission";
import { isAuthenticated } from "../middleware/auth";
import { SubmissionService } from "../services/submissionService";
import { submissionRateLimit } from "../middleware/rateLimit";

const router = express.Router();

// Get user submissions
router.get("/user", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ userId: req.user?.id })
      .sort({ submittedAt: -1 })
      .populate("questionId")
      .populate("jobId");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

// Validate code input
const validateCode = (code: string): boolean => {
  // Check for potentially dangerous imports or system calls
  const dangerousPatterns = [
    /process\.exit/i,
    /require\s*$$\s*['"]child_process['"]\s*$$/i,
    /exec\s*\(/i,
    /spawn\s*\(/i,
    /eval\s*\(/i,
    /fs\./i,
    /require\s*$$\s*['"]fs['"]\s*$$/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return false;
    }
  }

  return true;
};

// Run code (without saving)
router.post("/run", isAuthenticated, submissionRateLimit, async (req, res) => {
  try {
    const { code, languageId, questionId } = req.body;
    console.log("Running code:", code, languageId, questionId);
    // Validate code input
    if (!validateCode(code)) {
      return res.status(400).json({
        message: "Code contains potentially dangerous operations",
      });
    }

    const results = await SubmissionService.executeCode(
      code,
      languageId,
      questionId
    );

    res.json({ results });
  } catch (error) {
    console.error("Error running code:", error);
    res.status(500).json({ message: "Error running code", error });
  }
});

// Submit solution
router.post(
  "/submit",
  isAuthenticated,
  submissionRateLimit,
  async (req, res) => {
    try {
      const { code, language, languageId, questionId, jobId } = req.body;

      // Validate code input
      if (!validateCode(code)) {
        return res.status(400).json({
          message: "Code contains potentially dangerous operations",
        });
      }

      const {
        results,
        hiddenResults,
        aiReview,
        passed,
        executionTime,
        memoryUsed,
      } = await SubmissionService.submitSolution(
        code,
        languageId,
        language,
        questionId,
        jobId,
        req.user?.id
      );

      // Save submission to database
      const submission = new Submission({
        code,
        language,
        questionId,
        jobId,
        userId: req.user?.id,
        results,
        aiReview,
        passed,
        executionTime,
        memoryUsed,
        submittedAt: new Date(),
      });

      await submission.save();

      res.json({ results, aiReview, passed });
    } catch (error) {
      console.error("Error submitting solution:", error);
      res.status(500).json({ message: "Error submitting solution", error });
    }
  }
);

// Get submission by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("questionId")
      .populate("jobId");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check if user is authorized to view this submission
    if (submission.userId.toString() !== req.user?.id && !req.user?.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this submission" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submission", error });
  }
});

router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await Submission.find({ userId })
      .sort({ submittedAt: -1 })
      .populate("questionId")
      .populate("jobId");

    if (!submissions) {
      return res.status(404).json({ message: "No submissions found" });
    }

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

export default router;
