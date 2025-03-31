"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface Submission {
  _id: string;
  code: string;
  language: string;
  questionId: {
    _id: string;
    title: string;
    difficulty: string;
    slug: string;
  };
  jobId: {
    _id: string;
    title: string;
    company: string;
    slug: string;
  };
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  submittedAt: string;
  aiReview: {
    overallFeedback: string;
    codeQuality: string;
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
  };
}

export default function Submissions() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/submissions/user");
        setSubmissions(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to fetch submissions");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [isAuthenticated, navigate]);

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
      <h1 className="text-3xl font-bold mb-6">Your Submissions</h1>

      {submissions.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't submitted any solutions yet. Start practicing to see
            your submissions here!
          </p>
          <Button onClick={() => navigate("/jobs")}>
            Browse Job Interviews
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <Card key={submission._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">
                    {submission.questionId.title}
                  </CardTitle>
                  {submission.passed ? (
                    <Badge variant="success" className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="h-3 w-3 mr-1" /> Failed
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {submission.jobId.title} • {submission.jobId.company}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      submission.questionId.difficulty === "Easy"
                        ? "success"
                        : submission.questionId.difficulty === "Medium"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {submission.questionId.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {getLanguageLabel(submission.language)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {format(new Date(submission.submittedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {submission.executionTime.toFixed(2)}s /{" "}
                      {(submission.memoryUsed / 1024).toFixed(2)}MB
                    </span>
                  </div>
                </div>

                {submission.aiReview && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-1">AI Review</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {submission.aiReview.overallFeedback}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/jobs/${submission.jobId.slug}/questions/${submission.questionId.slug}`
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Retry Question
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
