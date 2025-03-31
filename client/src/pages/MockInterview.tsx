/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Editor from "@monaco-editor/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Play,
  Send,
  Code2,
  FileText,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  GripHorizontal,
  History,
  ListFilter,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { ScrollArea } from "../components/ui/scroll-area";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import AIReviewPanel from "../components/interview/AIReviewPanel";
import TestCasePanel from "../components/interview/TestCasePanel";
import api from "../services/api";

// Language IDs for Judge0
const languageIds: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
};

// TypeScript interfaces
interface TestCase {
  _id: string;
  input: Record<string, any>;
  expectedOutput: any;
  explanation: string;
}

interface TestResult {
  passed: boolean;
  output: any;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  consoleOutput?: string[];
}

interface Question {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  constraints: string;
  examples: string[];
  hints: string[];
  tags: string[];
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  preferredLanguage: string;
  languageTemplates: Record<string, string>;
  answerSnippets: Record<string, string>;
  relatedQuestions?: Array<{
    _id: string;
    title: string;
    slug: string;
    difficulty: string;
  }>;
}

interface Job {
  _id: string;
  title: string;
  slug: string;
  company: string;
}

interface Submission {
  _id: string;
  code: string;
  language: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  submittedAt: string;
  aiReview?: any;
}

interface AIReview {
  overallFeedback: string;
  codeQuality: string;
  timeComplexity: string;
  spaceComplexity: string;
  suggestions: string[];
  correctness: string;
  efficiency: string;
  readability: string;
  bestPractices: string;
}

export default function MockInterview() {
  const { jobSlug, questionSlug } = useParams<{
    jobSlug: string;
    questionSlug: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [job, setJob] = useState<Job | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [showAiReview, setShowAiReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [previousSubmissions, setPreviousSubmissions] = useState<Submission[]>(
    []
  );
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);

  // Resizable panels state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [consolePanelHeight, setConsolePanelHeight] = useState(50); // percentage
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);

  const editorRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle editor mounting
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Set editor theme based on app theme
    monaco.editor.defineTheme("mockInterviewLight", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#f9fafb",
      },
    });

    monaco.editor.defineTheme("mockInterviewDark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      },
    });

    monaco.editor.setTheme(
      theme === "dark" ? "mockInterviewDark" : "mockInterviewLight"
    );
  };

  // Fetch job and question data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch job by slug
        const jobRes = await api.get(`/jobs/slug/${jobSlug}`);
        setJob(jobRes.data);

        // Fetch question by slug
        const questionRes = await api.get(
          `/interviews/question/slug/${questionSlug}`
        );
        setQuestion(questionRes.data);

        // Fetch related questions for this job
        const relatedQuestionsRes = await api.get(
          `/interviews/job/${jobRes.data._id}`
        );
        // Filter out the current question
        const filteredQuestions = relatedQuestionsRes.data.filter(
          (q: Question) => q.slug !== questionSlug
        );
        setRelatedQuestions(filteredQuestions);

        // Fetch previous submissions for this question
        if (isAuthenticated) {
          try {
            const submissionsRes = await api.get("/submissions/user");
            const questionSubmissions = submissionsRes.data.filter(
              (sub: any) => sub.questionId.slug === questionSlug
            );
            setPreviousSubmissions(questionSubmissions);
          } catch (error) {
            console.error("Error fetching submissions:", error);
          }
        }

        // Set initial code template based on question's preferred language
        const preferredLanguage =
          questionRes.data.preferredLanguage || "javascript";
        setLanguage(preferredLanguage);

        // Use question-specific answer snippets if available, otherwise use templates
        if (
          questionRes.data.answerSnippets &&
          questionRes.data.answerSnippets[preferredLanguage]
        ) {
          setCode(questionRes.data.answerSnippets[preferredLanguage]);
        } else if (
          questionRes.data.languageTemplates &&
          questionRes.data.languageTemplates[preferredLanguage]
        ) {
          setCode(questionRes.data.languageTemplates[preferredLanguage]);
        } else {
          // Fallback to default templates if question doesn't have templates
          const defaultTemplates: Record<string, string> = {
            javascript: `/**
 * Function signature based on the problem
 */
var solution = function(params) {
    // Write your solution here
};`,
            python: `class Solution:
    def solution(self, params):
        # Write your solution here
        pass`,
            java: `class Solution {
    public void solution(params) {
        // Write your solution here
    }
}`,
            cpp: `class Solution {
public:
    void solution(params) {
        // Write your solution here
    }
};`,
          };
          setCode(defaultTemplates[preferredLanguage]);
        }

        // Fetch test cases
        const testCasesRes = await api.get(
          `/interviews/question/${questionRes.data._id}/test-cases`
        );
        setTestCases(testCasesRes.data);

        setLoading(false);

        // Start the timer
        setStartTime(Date.now());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load interview data");
        setLoading(false);
        navigate("/");
      }
    };

    fetchData();

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, jobSlug, questionSlug, navigate]);

  // Update elapsed time
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // Handle horizontal resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingHorizontal && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Limit the width between 20% and 80%
        if (newWidth >= 20 && newWidth <= 80) {
          setLeftPanelWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
    };

    if (isResizingHorizontal) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingHorizontal]);

  // Handle vertical resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingVertical && containerRef.current) {
        const editorContainer = document.querySelector(".editor-container");
        if (editorContainer) {
          const containerRect = editorContainer.getBoundingClientRect();
          const newHeight =
            ((e.clientY - containerRect.top) / containerRect.height) * 100;

          // Limit the height between 10% and 70%
          const consoleHeight = 100 - newHeight;
          // if (consoleHeight >= 10 && consoleHeight <= 70) {
          // }
          setConsolePanelHeight(consoleHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingVertical(false);
    };

    if (isResizingVertical) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingVertical]);

  // Format elapsed time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Run code against test cases
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    try {
      setIsRunning(true);
      setTestResults([]);

      const response = await api.post("/submissions/run", {
        code,
        language,
        languageId: languageIds[language],
        questionId: question?._id,
      });

      setTestResults(response.data.results);
      setIsRunning(false);

      // Show toast based on results
      const allPassed = response.data.results.every(
        (result: TestResult) => result.passed
      );
      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Failed to run code");
      setIsRunning(false);
    }
  };

  // Submit solution
  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/submissions/submit", {
        code,
        language,
        languageId: languageIds[language],
        questionId: question?._id,
        jobId: job?._id,
      });

      setTestResults(response.data.results);
      setAiReview(response.data.aiReview);
      setShowAiReview(true);

      // Add the new submission to the list
      if (response.data.submission) {
        setPreviousSubmissions([
          response.data.submission,
          ...previousSubmissions,
        ]);
      }

      setIsSubmitting(false);

      // Show toast based on results
      const allPassed = response.data.results.every(
        (result: TestResult) => result.passed
      );
      if (allPassed) {
        toast.success("Solution submitted successfully!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (
      code ===
        (question?.answerSnippets?.[language] ||
          question?.languageTemplates?.[language] ||
          "") ||
      !code.trim()
    ) {
      // If current code is the template or empty, replace with new template
      if (question?.answerSnippets?.[newLanguage]) {
        setCode(question.answerSnippets[newLanguage]);
      } else if (question?.languageTemplates?.[newLanguage]) {
        setCode(question.languageTemplates[newLanguage]);
      } else {
        // Fallback to a simple template
        const defaultTemplates: Record<string, string> = {
          javascript: `// Write your solution here`,
          python: `# Write your solution here`,
          java: `// Write your solution here`,
          cpp: `// Write your solution here`,
        };
        setCode(defaultTemplates[newLanguage]);
      }
    } else if (
      window.confirm("Changing language will reset your code. Continue?")
    ) {
      if (question?.answerSnippets?.[newLanguage]) {
        setCode(question.answerSnippets[newLanguage]);
      } else if (question?.languageTemplates?.[newLanguage]) {
        setCode(question.languageTemplates[newLanguage]);
      } else {
        // Fallback to a simple template
        const defaultTemplates: Record<string, string> = {
          javascript: `// Write your solution here`,
          python: `# Write your solution here`,
          java: `// Write your solution here`,
          cpp: `// Write your solution here`,
        };
        setCode(defaultTemplates[newLanguage]);
      }
    } else {
      return; // User cancelled
    }

    setLanguage(newLanguage);
  };

  const getLanguageLabel = (languageCode: string): string => {
    const labels: Record<string, string> = {
      javascript: "JavaScript",
      python: "Python",
      java: "Java",
      cpp: "C++",
    };
    return labels[languageCode] || languageCode;
  };

  const loadSubmission = (submission: Submission) => {
    if (
      window.confirm(
        "Loading this submission will replace your current code. Continue?"
      )
    ) {
      setCode(submission.code);
      setLanguage(submission.language);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/jobs/${jobSlug}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-xl font-bold truncate">{question?.title}</h1>
          <Badge
            variant={
              question?.difficulty === "Easy"
                ? "success"
                : question?.difficulty === "Medium"
                ? "warning"
                : "destructive"
            }
          >
            {question?.difficulty}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-zinc-500" />
            <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
          </div>

          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run your code against test cases</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Submit your solution and get AI feedback</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* Left panel - Question */}
        <div
          className="flex flex-col border-r relative"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Tabs defaultValue="description" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 justify-start">
              <TabsTrigger value="description" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Description
              </TabsTrigger>
              <TabsTrigger value="hints" className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" /> Hints
              </TabsTrigger>
              <TabsTrigger value="solution" className="flex items-center">
                <Code2 className="h-4 w-4 mr-2" /> Solution Approach
              </TabsTrigger>
              <TabsTrigger value="related" className="flex items-center">
                <ListFilter className="h-4 w-4 mr-2" /> Other Problems
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center">
                <History className="h-4 w-4 mr-2" /> Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="flex-1 overflow-auto p-4"
            >
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{question?.title}</h2>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          question?.description.replace(/\n/g, "<br />") || "",
                      }}
                    />
                  </div>

                  {question?.examples && question.examples.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold">Examples</h3>
                      {question.examples.map((example, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="font-mono whitespace-pre-wrap">
                              {example}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {question?.constraints && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold">Constraints</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="prose dark:prose-invert max-w-none">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: question.constraints.replace(
                                  /\n/g,
                                  "<br />"
                                ),
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question?.tags &&
                        question.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="hints" className="flex-1 overflow-auto p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hints</h3>
                  {question?.hints && question.hints.length > 0 ? (
                    <div className="space-y-4">
                      {question.hints.map((hint, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="font-medium">Hint {index + 1}</div>
                            <div className="mt-2">{hint}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500">
                      No hints available for this question.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="solution" className="flex-1 overflow-auto p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Solution Approach</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              question?.solutionApproach?.replace(
                                /\n/g,
                                "<br />"
                              ) || "",
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Time Complexity</h4>
                        <p>{question?.timeComplexity}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Space Complexity</h4>
                        <p>{question?.spaceComplexity}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="related" className="flex-1 overflow-auto p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Other Problems from {job?.title}
                  </h3>

                  {relatedQuestions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {relatedQuestions.map((relatedQuestion) => (
                        <Card
                          key={relatedQuestion._id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                {relatedQuestion.title}
                              </CardTitle>
                              <Badge
                                variant={
                                  relatedQuestion.difficulty === "Easy"
                                    ? "success"
                                    : relatedQuestion.difficulty === "Medium"
                                    ? "warning"
                                    : "destructive"
                                }
                              >
                                {relatedQuestion.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 pb-4 px-4">
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  to={`/interview/${jobSlug}/${relatedQuestion.slug}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                                  Problem
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500">
                      No related problems available.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="submissions"
              className="flex-1 overflow-auto p-4"
            >
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Your Previous Submissions
                  </h3>

                  {previousSubmissions.length > 0 ? (
                    <div className="space-y-4">
                      {previousSubmissions.map((submission) => (
                        <Card
                          key={submission._id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {getLanguageLabel(submission.language)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(submission.submittedAt),
                                    "MMM d, yyyy HH:mm"
                                  )}
                                </span>
                              </div>
                              {submission.passed ? (
                                <Badge
                                  variant="success"
                                  className="flex items-center"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                  Passed
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center"
                                >
                                  <XCircle className="h-3 w-3 mr-1" /> Failed
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>
                                    {submission.executionTime.toFixed(2)}s
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Code2 className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>
                                    {(submission.memoryUsed / 1024).toFixed(2)}
                                    MB
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadSubmission(submission)}
                              >
                                Load Code
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500">
                      You haven't submitted any solutions for this problem yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Horizontal resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700"
            onMouseDown={() => setIsResizingHorizontal(true)}
          >
            <GripVertical className="h-6 w-6 text-zinc-400" />
          </div>
        </div>

        {/* Right panel - Code editor and test cases */}
        <div
          className="flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Code editor */}
          <div
            className="flex-1 overflow-hidden editor-container relative"
            style={{ height: `${100 - consolePanelHeight}%` }}
          >
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                lineNumbers: "on",
                folding: true,
                renderLineHighlight: "all",
              }}
              theme={theme === "dark" ? "vs-dark" : "light"}
            />

            {/* Vertical resize handle */}
            <div
              className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize flex justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700"
              onMouseDown={() => setIsResizingVertical(true)}
            >
              <GripHorizontal className="h-6 w-6 text-zinc-400" />
            </div>
          </div>

          {/* Console/Test cases panel */}
          <div
            className="border-t  flex flex-col"
            style={{ height: `${consolePanelHeight}%` }}
          >
            <div
              className="flex items-center justify-between px-4 py-2 cursor-pointer bg-zinc-100 dark:bg-zinc-800"
              onClick={() => setShowConsole(!showConsole)}
            >
              <div className="font-medium">Console</div>
              <Button variant="ghost" size="sm">
                {showConsole ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showConsole && (
              <div className="flex-1 overflow-auto">
                <TestCasePanel
                  testCases={testCases}
                  testResults={testResults}
                  activeTestCase={activeTestCase}
                  setActiveTestCase={setActiveTestCase}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Review Panel (modal) */}
      {showAiReview && aiReview && (
        <AIReviewPanel
          aiReview={aiReview}
          onClose={() => setShowAiReview(false)}
          questionId={question?._id || ""}
          submissionId={previousSubmissions[0]?._id || ""}
        />
      )}
    </div>
  );
}
