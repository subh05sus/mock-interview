import axios from "axios";

export const API_URL = "http://localhost:7000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Jobs
export const getJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

export const getJobById = async (jobId: string) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

// Interviews
export const getQuestionsForJob = async (jobId: string) => {
  const response = await api.get(`/interviews/job/${jobId}`);
  return response.data;
};

export const getQuestionById = async (questionId: string) => {
  const response = await api.get(`/interviews/question/${questionId}`);
  return response.data;
};

// Submissions
export const submitCode = async (
  userId: string,
  questionId: string,
  jobId: string,
  code: string,
  language: string
) => {
  const response = await api.post("/submissions", {
    userId,
    questionId,
    jobId,
    code,
    language,
  });
  return response.data;
};

export const getUserSubmissions = async (userId: string) => {
  const response = await api.get(`/submissions/user/${userId}`);
  return response.data;
};

export default api;
