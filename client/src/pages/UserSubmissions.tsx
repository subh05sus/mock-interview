import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserSubmissions } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Submission {
  _id: string;
  questionId: {
    slug: string;
    _id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
  jobId: {
    slug: string;
    _id: string;
    title: string;
    company: string;
  };
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compilation Error";
  language: string;
  createdAt: string;
  submittedAt: string;
  passed: boolean;
}

export default function UserSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      try {
        const data = await getUserSubmissions(user.id);
        setSubmissions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch submissions. Please try again later.");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
    <div className="p-6 ">
      <h1 className="text-3xl font-bold text-primary mb-6">My Submissions</h1>

      {submissions.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>You haven't submitted any solutions yet.</p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
          >
            Browse Jobs to Start
          </Link>
        </div>
      ) : (
        <div className="bg-background rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-muted divide-y divide-foreground/10">
              {submissions.map((submission) => {
                return (
                  <tr
                    key={submission._id}
                    className="hover:bg-muted-foreground/10"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-primary">
                            {submission.questionId.title}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {submission.questionId.difficulty}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        {submission.jobId.title}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {submission.jobId.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                      >
                        {submission.passed ? (
                          <span className="text-green-800">Passed</span>
                        ) : (
                          <span className="text-red-800">Failed</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {submission.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/interview/${submission.jobId.slug}/${submission.questionId.slug}`}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Try Again
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
