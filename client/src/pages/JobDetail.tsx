import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById, getQuestionsForJob } from '../services/api';
import QuestionCard from '../components/QuestionCard';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
}

interface Question {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndQuestions = async () => {
      try {
        if (!jobId) return;
        
        const [jobData, questionsData] = await Promise.all([
          getJobById(jobId),
          getQuestionsForJob(jobId)
        ]);
        
        setJob(jobData);
        setQuestions(questionsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobAndQuestions();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Job not found'}</p>
        <Link to="/" className="text-red-700 underline mt-2 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Jobs
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
        <p className="text-xl text-gray-600 mt-1">{job.company} • {job.location}</p>
        <p className="text-gray-700 mt-2 font-medium">{job.salary}</p>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
          <p className="mt-2 text-gray-700">{job.description}</p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Requirements</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {job.requirements.map((req, index) => (
              <li key={index} className="text-gray-700">{req}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mock Interview Questions</h2>
        <p className="text-gray-600 mb-6">
          Select a question below to start a mock interview for this position.
        </p>
        
        {questions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((question) => (
              <QuestionCard 
                key={question._id} 
                question={question} 
                jobId={job._id} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No questions available for this job position.</p>
          </div>
        )}
      </div>
    </div>
  );
}
