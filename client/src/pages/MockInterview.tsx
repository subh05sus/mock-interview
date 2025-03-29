"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Editor from "@monaco-editor/react";
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
} from "lucide-react";
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
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import AIReviewPanel from "../components/interview/AIReviewPanel";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { Card, CardContent } from "../components/ui/card";

// Import the TestCasePanel component
import TestCasePanel from "../components/interview/TestCasePanel";

// Language IDs for Judge0
const languageIds = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
};

export default function MockInterview() {
  const { jobSlug, questionSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  const [job, setJob] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [aiReview, setAiReview] = useState(null);
  const [showAiReview, setShowAiReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const editorRef = useRef(null);
  const timerRef = useRef(null);

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
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

        // Set initial code template based on question's preferred language
        const preferredLanguage =
          questionRes.data.preferredLanguage || "javascript";
        setLanguage(preferredLanguage);

        // Use question-specific templates if available, otherwise use defaults
        if (
          questionRes.data.languageTemplates &&
          questionRes.data.languageTemplates[preferredLanguage]
        ) {
          setCode(questionRes.data.languageTemplates[preferredLanguage]);
        } else {
          // Fallback to default templates if question doesn't have templates
          const defaultTemplates = {
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

  // Format elapsed time
  const formatTime = (seconds) => {
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
        questionId: question._id,
      });

      setTestResults(response.data.results);
      setIsRunning(false);

      // Show toast based on results
      const allPassed = response.data.results.every((result) => result.passed);
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
        questionId: question._id,
        jobId: job._id,
      });

      setTestResults(response.data.results);
      setAiReview(response.data.aiReview);
      setShowAiReview(true);
      setIsSubmitting(false);

      // Show toast based on results
      const allPassed = response.data.results.every((result) => result.passed);
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

  const handleLanguageChange = (newLanguage) => {
    if (
      code === (question?.languageTemplates?.[language] || "") ||
      !code.trim()
    ) {
      // If current code is the template or empty, replace with new template
      if (question?.languageTemplates?.[newLanguage]) {
        setCode(question.languageTemplates[newLanguage]);
      } else {
        // Fallback to a simple template
        const defaultTemplates = {
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
      if (question?.languageTemplates?.[newLanguage]) {
        setCode(question.languageTemplates[newLanguage]);
      } else {
        // Fallback to a simple template
        const defaultTemplates = {
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
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Question */}
        <div className="w-1/2 flex flex-col border-r">
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
            </TabsList>

            <TabsContent
              value="description"
              className="flex-1 overflow-auto p-4"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{question.title}</h2>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: question.description.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>

                {question.examples && question.examples.length > 0 && (
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

                {question.constraints && (
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
                    {question.tags &&
                      question.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hints" className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hints</h3>
                {question.hints && question.hints.length > 0 ? (
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
                  <p className="text-gray-500">
                    No hints available for this question.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="solution" className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Solution Approach</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: question.solutionApproach.replace(
                            /\n/g,
                            "<br />"
                          ),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Time Complexity</h4>
                      <p>{question.timeComplexity}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Space Complexity</h4>
                      <p>{question.spaceComplexity}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel - Code editor and test cases */}
        <div className="w-1/2 flex flex-col">
          {/* Code editor */}
          <div className="flex-1 overflow-hidden">
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
          </div>

          {/* Console/Test cases panel */}
          <div
            className={`border-t transition-all duration-300 ${
              showConsole ? "h-1/3" : "h-10"
            }`}
          >
            <div
              className="flex items-center justify-between px-4 py-2 cursor-pointer"
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
              <div className="h-[calc(100%-40px)] overflow-auto">
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
        />
      )}
    </div>
  );
}
