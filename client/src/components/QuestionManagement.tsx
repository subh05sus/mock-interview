"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Loader2,
  Plus,
  Trash,
  Edit,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface Job {
  _id: string;
  title: string;
  company: string;
}

interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  examples: string[];
  constraints: string;
  hints: string[];
  preferredLanguage: string;
  jobId: string | { _id: string; title: string };
  slug: string;
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  languageTemplates: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  answerSnippets: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  functionName: string;
  returnType: string;
  paramTypes: string[];
  paramNames: string[];
  createdAt: string;
}

export default function QuestionManagement() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // State for questions and jobs
  const [questions, setQuestions] = useState<Question[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    examples: [""],
    constraints: "",
    hints: [""],
    preferredLanguage: "javascript",
    jobId: "",
    solutionApproach: "",
    timeComplexity: "",
    spaceComplexity: "",
    tags: "",
    functionName: "solution",
    returnType: "any",
    paramTypes: [""],
    paramNames: [""],
  });

  // Template editor state
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templateLanguage, setTemplateLanguage] = useState("javascript");
  const [templateCode, setTemplateCode] = useState("");
  const [answerSnippetCode, setAnswerSnippetCode] = useState("");

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch jobs
        const jobsRes = await api.get("/jobs");
        setJobs(jobsRes.data);

        // Fetch all questions
        const questionsRes = await api.get("/interviews/questions");
        setQuestions(questionsRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  // Filter questions by selected job
  const filteredQuestions = selectedJob
    ? questions.filter((q) => {
        const jobId = typeof q.jobId === "object" ? q.jobId._id : q.jobId;
        return jobId === selectedJob;
      })
    : questions;

  // Reset form
  const resetForm = () => {
    setQuestionForm({
      title: "",
      description: "",
      difficulty: "Easy",
      examples: [""],
      constraints: "",
      hints: [""],
      preferredLanguage: "javascript",
      jobId: "",
      solutionApproach: "",
      timeComplexity: "",
      spaceComplexity: "",
      tags: "",
      functionName: "solution",
      returnType: "any",
      paramTypes: [""],
      paramNames: [""],
    });
  };

  // Set form for editing
  const setFormForEditing = (question: Question) => {
    const jobId =
      typeof question.jobId === "object" ? question.jobId._id : question.jobId;

    setQuestionForm({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      examples: question.examples.length > 0 ? question.examples : [""],
      constraints: question.constraints,
      hints: question.hints.length > 0 ? question.hints : [""],
      preferredLanguage: question.preferredLanguage,
      jobId: jobId,
      solutionApproach: question.solutionApproach,
      timeComplexity: question.timeComplexity,
      spaceComplexity: question.spaceComplexity,
      tags: question.tags.join(", "),
      functionName: question.functionName,
      returnType: question.returnType,
      paramTypes: question.paramTypes.length > 0 ? question.paramTypes : [""],
      paramNames: question.paramNames.length > 0 ? question.paramNames : [""],
    });
  };

  // Handle creating a new question
  const handleCreateQuestion = async () => {
    try {
      // Validate form
      if (
        !questionForm.title ||
        !questionForm.description ||
        !questionForm.jobId
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Format data
      const formData = {
        ...questionForm,
        examples: questionForm.examples.filter((ex) => ex.trim() !== ""),
        hints: questionForm.hints.filter((hint) => hint.trim() !== ""),
        tags: questionForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        paramTypes: questionForm.paramTypes.filter(
          (type) => type.trim() !== ""
        ),
        paramNames: questionForm.paramNames.filter(
          (name) => name.trim() !== ""
        ),
      };

      // Create question
      const response = await api.post("/interviews", formData);

      // Add to questions list
      setQuestions([response.data.question, ...questions]);

      // Reset form and close dialog
      resetForm();
      setIsCreating(false);

      toast.success("Question created successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    }
  };

  // Handle updating a question
  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      // Validate form
      if (
        !questionForm.title ||
        !questionForm.description ||
        !questionForm.jobId
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Format data
      const formData = {
        ...questionForm,
        examples: questionForm.examples.filter((ex) => ex.trim() !== ""),
        hints: questionForm.hints.filter((hint) => hint.trim() !== ""),
        tags: questionForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        paramTypes: questionForm.paramTypes.filter(
          (type) => type.trim() !== ""
        ),
        paramNames: questionForm.paramNames.filter(
          (name) => name.trim() !== ""
        ),
      };

      // Update question
      const response = await api.put(
        `/interviews/${selectedQuestion._id}`,
        formData
      );

      // Update questions list
      setQuestions(
        questions.map((q) =>
          q._id === selectedQuestion._id ? response.data : q
        )
      );

      // Reset form and close dialog
      resetForm();
      setIsEditing(false);
      setSelectedQuestion(null);

      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/interviews/${questionId}`);

      // Remove from questions list
      setQuestions(questions.filter((q) => q._id !== questionId));

      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Handle generating test cases
  const handleGenerateTestCases = async (questionId: string) => {
    try {
      setIsGeneratingTestCases(true);

      const response = await api.post(
        `/interviews/question/${questionId}/generate-test-cases`,
        {
          count: 5,
        }
      );

      setIsGeneratingTestCases(false);
      toast.success(
        `${response.data.length} test cases generated successfully`
      );
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast.error("Failed to generate test cases");
      setIsGeneratingTestCases(false);
    }
  };

  // Handle opening template editor
  const handleOpenTemplateEditor = (
    question: Question,
    language: "javascript" | "python" | "java" | "cpp"
  ) => {
    setSelectedQuestion(question);
    setTemplateLanguage(language);
    setTemplateCode(question.languageTemplates[language] || "");
    setAnswerSnippetCode(question.answerSnippets[language] || "");
    setTemplateEditorOpen(true);
  };

  // Handle saving templates
  const handleSaveTemplates = async () => {
    if (!selectedQuestion) return;

    try {
      const updatedTemplates = {
        ...selectedQuestion.languageTemplates,
        [templateLanguage]: templateCode,
      };

      const updatedSnippets = {
        ...selectedQuestion.answerSnippets,
        [templateLanguage]: answerSnippetCode,
      };

      const response = await api.put(
        `/interviews/${selectedQuestion._id}/templates`,
        {
          languageTemplates: updatedTemplates,
          answerSnippets: updatedSnippets,
        }
      );

      // Update questions list
      setQuestions(
        questions.map((q) =>
          q._id === selectedQuestion._id ? response.data : q
        )
      );

      setTemplateEditorOpen(false);
      toast.success("Templates updated successfully");
    } catch (error) {
      console.error("Error updating templates:", error);
      toast.error("Failed to update templates");
    }
  };

  // Add/remove dynamic form fields
  const addFormField = (
    field: "examples" | "hints" | "paramTypes" | "paramNames"
  ) => {
    setQuestionForm({
      ...questionForm,
      [field]: [...questionForm[field], ""],
    });
  };

  const removeFormField = (
    field: "examples" | "hints" | "paramTypes" | "paramNames",
    index: number
  ) => {
    if (questionForm[field].length <= 1) return;

    setQuestionForm({
      ...questionForm,
      [field]: questionForm[field].filter((_, i) => i !== index),
    });
  };

  const updateFormField = (
    field: "examples" | "hints" | "paramTypes" | "paramNames",
    index: number,
    value: string
  ) => {
    const updatedField = [...questionForm[field]];
    updatedField[index] = value;

    setQuestionForm({
      ...questionForm,
      [field]: updatedField,
    });
  };

  const getLanguageLabel = (language: string) => {
    switch (language) {
      case "javascript":
        return "JavaScript";
      case "python":
        return "Python";
      case "java":
        return "Java";
      case "cpp":
        return "C++";
      default:
        return language;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Question Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Question
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="job-filter" className="mb-2 block">
          Filter by Job
        </Label>
        <div className="flex gap-4">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger id="job-filter" className="w-[300px]">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job._id} value={job._id}>
                  {job.title} - {job.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedJob && (
            <Button variant="outline" onClick={() => setSelectedJob("")}>
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-medium mb-2">No questions found</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {selectedJob
                ? "There are no questions for the selected job yet."
                : "There are no questions in the system yet."}
            </p>
            <Button
              onClick={() => {
                resetForm();
                if (selectedJob) {
                  setQuestionForm((prev) => ({ ...prev, jobId: selectedJob }));
                }
                setIsCreating(true);
              }}
            >
              Create Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((question) => {
            const jobTitle =
              typeof question.jobId === "object"
                ? question.jobId.title
                : jobs.find((j) => j._id === question.jobId)?.title ||
                  "Unknown Job";

            return (
              <Card key={question._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{question.title}</CardTitle>
                      <CardDescription>{jobTitle}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        question.difficulty === "Easy"
                          ? "success"
                          : question.difficulty === "Medium"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Function Signature
                      </h4>
                      <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs font-mono">
                        {question.functionName}({question.paramNames.join(", ")}
                        ): {question.returnType}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setFormForEditing(question);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit Question
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateTestCases(question._id)}
                      disabled={isGeneratingTestCases}
                    >
                      {isGeneratingTestCases ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Generate Test Cases
                    </Button>

                    <Select
                      onValueChange={(value) =>
                        handleOpenTemplateEditor(
                          question,
                          value as "javascript" | "python" | "java" | "cpp"
                        )
                      }
                      value=""
                    >
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Edit Templates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">
                          JavaScript Template
                        </SelectItem>
                        <SelectItem value="python">Python Template</SelectItem>
                        <SelectItem value="java">Java Template</SelectItem>
                        <SelectItem value="cpp">C++ Template</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteQuestion(question._id)}
                    >
                      <Trash className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Question Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col fixed top-0 left-0 right-0 bottom-0 m-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new coding challenge question.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title*</Label>
                  <Input
                    id="title"
                    value={questionForm.title}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Two Sum"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job">Job*</Label>
                  <Select
                    value={questionForm.jobId}
                    onValueChange={(value) =>
                      setQuestionForm({ ...questionForm, jobId: value })
                    }
                  >
                    <SelectTrigger id="job">
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job._id} value={job._id}>
                          {job.title} - {job.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed problem description"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Examples</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFormField("examples")}
                  >
                    Add Example
                  </Button>
                </div>

                {questionForm.examples.map((example, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={example}
                      onChange={(e) =>
                        updateFormField("examples", index, e.target.value)
                      }
                      placeholder={`Example ${index + 1}`}
                      rows={3}
                      className="flex-1"
                    />
                    {questionForm.examples.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFormField("examples", index)}
                        className="h-10 w-10 shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  value={questionForm.constraints}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      constraints: e.target.value,
                    })
                  }
                  placeholder="Problem constraints"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Hints</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFormField("hints")}
                  >
                    Add Hint
                  </Button>
                </div>

                {questionForm.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={hint}
                      onChange={(e) =>
                        updateFormField("hints", index, e.target.value)
                      }
                      placeholder={`Hint ${index + 1}`}
                      className="flex-1"
                    />
                    {questionForm.hints.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFormField("hints", index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Function Signature</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="functionName">Function Name</Label>
                    <Input
                      id="functionName"
                      value={questionForm.functionName}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          functionName: e.target.value,
                        })
                      }
                      placeholder="e.g. twoSum"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnType">Return Type</Label>
                    <Input
                      id="returnType"
                      value={questionForm.returnType}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          returnType: e.target.value,
                        })
                      }
                      placeholder="e.g. number[], void, string"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Parameters</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addFormField("paramTypes");
                        addFormField("paramNames");
                      }}
                    >
                      Add Parameter
                    </Button>
                  </div>

                  {questionForm.paramNames.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={questionForm.paramNames[index]}
                        onChange={(e) =>
                          updateFormField("paramNames", index, e.target.value)
                        }
                        placeholder="Parameter name"
                        className="flex-1"
                      />
                      <Input
                        value={questionForm.paramTypes[index]}
                        onChange={(e) =>
                          updateFormField("paramTypes", index, e.target.value)
                        }
                        placeholder="Parameter type"
                        className="flex-1"
                      />
                      {questionForm.paramNames.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            removeFormField("paramNames", index);
                            removeFormField("paramTypes", index);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={questionForm.difficulty}
                    onValueChange={(value) =>
                      setQuestionForm({ ...questionForm, difficulty: value })
                    }
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select
                    value={questionForm.preferredLanguage}
                    onValueChange={(value) =>
                      setQuestionForm({
                        ...questionForm,
                        preferredLanguage: value,
                      })
                    }
                  >
                    <SelectTrigger id="preferredLanguage">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={questionForm.tags}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, tags: e.target.value })
                    }
                    placeholder="e.g. Array, Hash Table, Two Pointers"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="solutionApproach">Solution Approach</Label>
                <Textarea
                  id="solutionApproach"
                  value={questionForm.solutionApproach}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      solutionApproach: e.target.value,
                    })
                  }
                  placeholder="Explain the approach to solve this problem"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeComplexity">Time Complexity</Label>
                  <Input
                    id="timeComplexity"
                    value={questionForm.timeComplexity}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        timeComplexity: e.target.value,
                      })
                    }
                    placeholder="e.g. O(n), O(n log n)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spaceComplexity">Space Complexity</Label>
                  <Input
                    id="spaceComplexity"
                    value={questionForm.spaceComplexity}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        spaceComplexity: e.target.value,
                      })
                    }
                    placeholder="e.g. O(n), O(1)"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuestion}>Create Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col fixed top-0 left-0 right-0 bottom-0 m-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the details of the selected question.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {/* Same form fields as Create Question Dialog */}
            <div className="space-y-6 py-4">
              {/* Same form fields as in the create dialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Question Title*</Label>
                  <Input
                    id="edit-title"
                    value={questionForm.title}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-job">Job*</Label>
                  <Select
                    value={questionForm.jobId}
                    onValueChange={(value) =>
                      setQuestionForm({ ...questionForm, jobId: value })
                    }
                  >
                    <SelectTrigger id="edit-job">
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job._id} value={job._id}>
                          {job.title} - {job.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rest of the form fields (same as create dialog) */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description*</Label>
                <Textarea
                  id="edit-description"
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      description: e.target.value,
                    })
                  }
                  rows={6}
                />
              </div>

              {/* Examples, Constraints, Hints, Function Signature, etc. (same as create dialog) */}
              {/* ... */}
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setSelectedQuestion(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion}>Update Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={templateEditorOpen} onOpenChange={setTemplateEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col fixed top-0 left-0 right-0 bottom-0 m-auto p-6">
          <DialogHeader>
            <DialogTitle>
              Edit {getLanguageLabel(templateLanguage)} Templates
            </DialogTitle>
            <DialogDescription>
              Update the code templates and answer snippets for{" "}
              {getLanguageLabel(templateLanguage)}.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="template" className="flex-1 flex flex-col">
            <TabsList className="mx-auto">
              <TabsTrigger value="template">Code Template</TabsTrigger>
              <TabsTrigger value="snippet">Answer Snippet</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-zinc-500">
                  <span className="font-medium">Code Template:</span> This will
                  be shown to users when they start the challenge. Include
                  function signature, comments, and any necessary imports.
                </p>
                <Select
                  value={templateLanguage}
                  onValueChange={(value) => {
                    if (selectedQuestion) {
                      setTemplateLanguage(
                        value as "javascript" | "python" | "java" | "cpp"
                      );
                      setTemplateCode(
                        selectedQuestion.languageTemplates[
                          value as "javascript" | "python" | "java" | "cpp"
                        ] || ""
                      );
                      setAnswerSnippetCode(
                        selectedQuestion.answerSnippets[
                          value as "javascript" | "python" | "java" | "cpp"
                        ] || ""
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 border rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                <textarea
                  value={templateCode}
                  onChange={(e) => setTemplateCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm focus:outline-none bg-transparent"
                  spellCheck="false"
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  Function:{" "}
                  <span className="font-mono">
                    {selectedQuestion?.functionName}(
                    {selectedQuestion?.paramNames.join(", ")}):{" "}
                    {selectedQuestion?.returnType}
                  </span>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="snippet" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-zinc-500">
                  <span className="font-medium">Answer Snippet:</span> This will
                  be used as a starting point for users who need help. Include
                  the basic structure but not the full solution.
                </p>
                <Select
                  value={templateLanguage}
                  onValueChange={(value) => {
                    if (selectedQuestion) {
                      setTemplateLanguage(
                        value as "javascript" | "python" | "java" | "cpp"
                      );
                      setTemplateCode(
                        selectedQuestion.languageTemplates[
                          value as "javascript" | "python" | "java" | "cpp"
                        ] || ""
                      );
                      setAnswerSnippetCode(
                        selectedQuestion.answerSnippets[
                          value as "javascript" | "python" | "java" | "cpp"
                        ] || ""
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 border rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                <textarea
                  value={answerSnippetCode}
                  onChange={(e) => setAnswerSnippetCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm focus:outline-none bg-transparent"
                  spellCheck="false"
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  Tip: Include comments with hints but leave the implementation
                  incomplete.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setTemplateEditorOpen(false);
                setSelectedQuestion(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplates}>Save Templates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
