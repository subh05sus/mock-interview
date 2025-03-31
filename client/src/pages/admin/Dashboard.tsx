/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Loader2, Plus, Trash, Edit, RefreshCw, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  difficulty: string;
  position: string;
  location: string;
  salaryRange: string;
  jobType: string;
  createdAt: string;
  questions: any[];
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // User management state
  const [users, setUsers] = useState<User[]>([]);

  // Job management state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    requiredSkills: "",
    difficulty: "Entry Level",
    position: "",
    location: "",
    salaryRange: "",
    jobType: "Full-time",
  });

  // Question generation state
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionCount, setQuestionCount] = useState(3);
  const [selectedDifficulties, setSelectedDifficulties] = useState([
    "Easy",
    "Medium",
    "Hard",
  ]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch users
        const usersRes = await api.get("/auth/users");
        setUsers(usersRes.data);

        // Fetch jobs
        const jobsRes = await api.get("/jobs");
        setJobs(jobsRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  // User management functions
  const handleToggleAdmin = async (userId: string) => {
    try {
      const res = await api.patch(`/auth/users/${userId}/toggle-admin`);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isAdmin: res.data.isAdmin } : user
        )
      );
      toast.success(`Admin status updated successfully`);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    }
  };

  // Job management functions
  const handleCreateJob = async () => {
    try {
      const requiredSkills = jobForm.requiredSkills
        .split(",")
        .map((skill) => skill.trim());

      const res = await api.post("/jobs", {
        ...jobForm,
        requiredSkills,
      });

      setJobs([res.data, ...jobs]);
      setJobFormOpen(false);
      resetJobForm();
      toast.success("Job created successfully");
    } catch (err) {
      console.error("Error creating job:", err);
      toast.error("Failed to create job");
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;

    try {
      const requiredSkills = jobForm.requiredSkills
        .split(",")
        .map((skill) => skill.trim());

      const res = await api.put(`/jobs/${selectedJob._id}`, {
        ...jobForm,
        requiredSkills,
      });

      setJobs(
        jobs.map((job) => (job._id === selectedJob._id ? res.data : job))
      );
      setJobFormOpen(false);
      setSelectedJob(null);
      resetJobForm();
      toast.success("Job updated successfully");
    } catch (err) {
      console.error("Error updating job:", err);
      toast.error("Failed to update job");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This will also delete all associated questions."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      description: job.description,
      requiredSkills: job.requiredSkills.join(", "),
      difficulty: job.difficulty,
      position: job.position || "",
      location: job.location || "",
      salaryRange: job.salaryRange || "",
      jobType: job.jobType || "Full-time",
    });
    setJobFormOpen(true);
  };

  const resetJobForm = () => {
    setJobForm({
      title: "",
      company: "",
      description: "",
      requiredSkills: "",
      difficulty: "Entry Level",
      position: "",
      location: "",
      salaryRange: "",
      jobType: "Full-time",
    });
  };

  // Question generation functions
  const handleGenerateQuestions = async (jobId: string) => {
    try {
      setGeneratingQuestions(true);

      const res = await api.post(`/jobs/${jobId}/generate-questions`, {
        count: questionCount,
        difficulties: selectedDifficulties,
      });

      // Update the job with new questions
      const updatedJobs = jobs.map((job) => {
        if (job._id === jobId) {
          return {
            ...job,
            questions: [...(job.questions || []), ...res.data],
          };
        }
        return job;
      });

      setJobs(updatedJobs);
      toast.success(`${res.data.length} questions generated successfully`);
      setGeneratingQuestions(false);
    } catch (err) {
      console.error("Error generating questions:", err);
      toast.error("Failed to generate questions");
      setGeneratingQuestions(false);
    }
  };

  // Fetch questions for a job
  const fetchJobQuestions = async (jobId: string) => {
    try {
      const res = await api.get(`/interviews/questions/job/${jobId}`);

      // Update the job with fetched questions
      const updatedJobs = jobs.map((job) => {
        if (job._id === jobId) {
          return {
            ...job,
            questions: res.data,
          };
        }
        return job;
      });

      setJobs(updatedJobs);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch questions");
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs">Job Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Job Listings</h2>
            <div className="flex gap-2 items-center">
              <Dialog open={jobFormOpen} onOpenChange={setJobFormOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedJob(null);
                      resetJobForm();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedJob ? "Edit Job" : "Create New Job"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedJob
                        ? "Update the job details below."
                        : "Fill in the job details to create a new job listing."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={jobForm.title}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, title: e.target.value })
                          }
                          placeholder="e.g. Frontend Developer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={jobForm.company}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, company: e.target.value })
                          }
                          placeholder="e.g. Acme Inc."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={jobForm.description}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the job role and responsibilities"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requiredSkills">
                        Required Skills (comma separated)
                      </Label>
                      <Input
                        id="requiredSkills"
                        value={jobForm.requiredSkills}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            requiredSkills: e.target.value,
                          })
                        }
                        placeholder="e.g. JavaScript, React, Node.js"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={jobForm.position}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, position: e.target.value })
                          }
                          placeholder="e.g. Senior Developer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={jobForm.location}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, location: e.target.value })
                          }
                          placeholder="e.g. Remote, New York"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaryRange">Salary Range</Label>
                        <Input
                          id="salaryRange"
                          value={jobForm.salaryRange}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              salaryRange: e.target.value,
                            })
                          }
                          placeholder="e.g. $80,000 - $120,000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select
                          value={jobForm.jobType}
                          onValueChange={(value) =>
                            setJobForm({ ...jobForm, jobType: value })
                          }
                        >
                          <SelectTrigger id="jobType">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={jobForm.difficulty}
                        onValueChange={(value) =>
                          setJobForm({ ...jobForm, difficulty: value })
                        }
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry Level">
                            Entry Level
                          </SelectItem>
                          <SelectItem value="Mid Level">Mid Level</SelectItem>
                          <SelectItem value="Senior Level">
                            Senior Level
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setJobFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={selectedJob ? handleUpdateJob : handleCreateJob}
                    >
                      {selectedJob ? "Update Job" : "Create Job"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() => navigate("/admin/questions")}
                className="hidden md:inline-flex"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Question
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{job.location || "No location"}</span>
                    <span>{job.jobType || "Full-time"}</span>
                  </div>

                  {/* Questions section */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Questions</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchJobQuestions(job._id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                      </Button>
                    </div>

                    {job.questions && job.questions.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {job.questions.slice(0, 3).map((question) => (
                          <li key={question._id} className="flex items-center">
                            <Badge
                              variant={
                                question.difficulty === "Easy"
                                  ? "success"
                                  : question.difficulty === "Medium"
                                  ? "warning"
                                  : "destructive"
                              }
                              className="mr-2 h-2 w-2 rounded-full p-0"
                            />
                            <span className="truncate">{question.title}</span>
                          </li>
                        ))}
                        {job.questions.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{job.questions.length - 3} more questions
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No questions yet
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" /> Generate Questions
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                      <DialogHeader>
                        <DialogTitle>Generate Questions</DialogTitle>
                        <DialogDescription>
                          Generate AI-powered interview questions for this job.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="questionCount">
                            Number of Questions
                          </Label>
                          <Input
                            id="questionCount"
                            type="number"
                            min="1"
                            max="10"
                            value={questionCount}
                            onChange={(e) =>
                              setQuestionCount(Number.parseInt(e.target.value))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Difficulty Levels</Label>
                          <div className="flex flex-wrap gap-2">
                            {["Easy", "Medium", "Hard"].map((difficulty) => (
                              <Badge
                                key={difficulty}
                                variant={
                                  selectedDifficulties.includes(difficulty)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => {
                                  if (
                                    selectedDifficulties.includes(difficulty)
                                  ) {
                                    if (selectedDifficulties.length > 1) {
                                      setSelectedDifficulties(
                                        selectedDifficulties.filter(
                                          (d) => d !== difficulty
                                        )
                                      );
                                    }
                                  } else {
                                    setSelectedDifficulties([
                                      ...selectedDifficulties,
                                      difficulty,
                                    ]);
                                  }
                                }}
                              >
                                {difficulty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => handleGenerateQuestions(job._id)}
                          disabled={generatingQuestions}
                        >
                          {generatingQuestions && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Generate Questions
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {jobs.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No jobs found. Create your first job listing!
                </p>
                <Button onClick={() => setJobFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Job
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge
                            variant="success"
                            className="flex items-center w-fit"
                          >
                            <Check className="h-3 w-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center w-fit"
                          >
                            <X className="h-3 w-3 mr-1" /> No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(user._id)}
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
