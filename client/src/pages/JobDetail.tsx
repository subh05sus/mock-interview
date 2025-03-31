/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Code,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

interface JobType {
  _id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  jobType: string;
  description: string;
  requiredSkills: string[];
  difficulty: string;
  slug: string;
}

interface QuestionType {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  slug: string;
}

export default function JobDetail() {
  const { jobSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [job, setJob] = useState<JobType | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);

        // Fetch job details
        const jobResponse = await api.get(`/jobs/slug/${jobSlug}`);
        setJob(jobResponse.data);

        // Fetch questions for this job
        const questionsResponse = await api.get(
          `/interviews/job/${jobResponse.data._id}`
        );
        setQuestions(questionsResponse.data);

        // If authenticated, fetch user's submissions for this job
        if (isAuthenticated) {
          const submissionsResponse = await api.get("/submissions/user");
          const jobSubmissions = submissionsResponse.data.filter(
            (sub: any) => sub.jobId._id === jobResponse.data._id
          );
          setSubmissions(jobSubmissions);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching job data:", error);
        setLoading(false);
        navigate("/jobs");
      }
    };

    fetchJobData();
  }, [jobSlug, isAuthenticated, navigate]);

  const handleGenerateQuestions = async () => {
    try {
      if (!job) return;

      setGeneratingQuestions(true);

      const response = await api.post(`/jobs/${job._id}/generate-questions`, {
        count: 3,
        difficulties: ["Easy", "Medium", "Hard"],
      });

      // Add new questions to the existing questions
      setQuestions([...questions, ...response.data]);

      setGeneratingQuestions(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      setGeneratingQuestions(false);
    }
  };

  // Get submission status for a question
  const getSubmissionStatus = (questionId: QuestionType) => {
    if (!isAuthenticated || submissions.length === 0) return null;
    if (!questionId) return null;
    const questionSubmissions = submissions.filter(
      (sub) => sub.questionId._id === questionId
    );

    if (questionSubmissions.length === 0) return null;

    // Get the latest submission
    const latestSubmission = questionSubmissions.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0];

    return {
      passed: latestSubmission.passed,
      date: latestSubmission.submittedAt,
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
      </Button>

      {loading ? (
        <div>
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job?.title}</h1>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="mr-4">{job?.company}</span>
                  <Badge variant="outline" className="ml-2">
                    {job?.difficulty}
                  </Badge>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions}
                  className="mt-4 md:mt-0"
                >
                  {generatingQuestions ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" /> Generate Questions
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 mr-2 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Location
                      </p>
                      <p className="font-medium">{job?.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-5 w-5 mr-2 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Salary Range
                      </p>
                      <p className="font-medium">{job?.salaryRange}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Job Type
                      </p>
                      <p className="font-medium">{job?.jobType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="description" className="mb-8">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="skills">Required Skills</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-line">{job?.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="skills" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {job?.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <h2 className="text-2xl font-bold mb-4">Coding Challenges</h2>
            {questions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-medium mb-2">
                    No challenges available
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    There are no coding challenges for this job yet.
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={handleGenerateQuestions}
                      disabled={generatingQuestions}
                    >
                      {generatingQuestions
                        ? "Generating..."
                        : "Generate Questions"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions.map((question, index) => {
                  const submissionStatus = getSubmissionStatus(question._id);

                  return (
                    <motion.div
                      key={question._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {question.title}
                            </CardTitle>
                            <Badge
                              className={getDifficultyColor(
                                question.difficulty
                              )}
                            >
                              {question.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">
                            {question.description.substring(0, 150)}...
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {question.tags &&
                              question.tags
                                .slice(0, 3)
                                .map((tag: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="bg-zinc-100 dark:bg-zinc-700"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                          </div>
                          {submissionStatus && (
                            <div className="mt-4">
                              {submissionStatus.passed ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  <span className="text-sm">Completed</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  <span className="text-sm">Attempted</span>
                                </div>
                              )}
                              <p className="text-xs text-zinc-500 mt-1">
                                Last submission:{" "}
                                {new Date(
                                  submissionStatus.date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Link
                            to={`/interview/${job?.slug}/${question.slug}`}
                            className="w-full"
                          >
                            <Button className="w-full">
                              <Briefcase className="mr-2 h-4 w-4" /> Start
                              Challenge
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
