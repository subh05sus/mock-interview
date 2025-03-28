import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getQuestionById, getJobById, submitCode } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import FeedbackPanel from '../components/FeedbackPanel';

interface Question {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
}

interface Job {
  _id: string;
  title: string;
  company: string;
}

interface ExecutionResult {
  status: string;
  executionTime?: number;
  memory?: number;
  output?: string;
  error?: string;
}

interface Feedback {
  review: string;
  suggestions: string[];
  betterSolution?: string;
  explanation?: string;
}

export default function MockInterview() {
  const { jobId, questionId } = useParams<{ jobId: string; questionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Language-specific starter code templates
  const starterCode: Record<string, string> = {
    javascript: `/**
 * Write your solution here
 */
function solution(input) {
  // Your code here
  
  return output;
}
`,
    python: `# Write your solution here
def solution(input):
    # Your code here
    
    return output
`,
    java: `/**
 * Write your solution here
 */
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}
`,
    cpp: `/**
 * Write your solution here
 */
#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}
`,
    csharp: `/**
 * Write your solution here
 */
using System;

class Solution {
    static void Main() {
        // Your code here
    }
}
`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!jobId || !questionId) return;
        
        const [questionData, jobData] = await Promise.all([
          getQuestionById(questionId),
          getJobById(jobId)
        ]);
        
        setQuestion(questionData);
        setJob(jobData);
        setCode(starterCode[language]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interview data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, questionId, language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(starterCode[newLanguage]);
  };

  const handleSubmit = async () => {
    if (!user || !jobId || !questionId) return;
    
    setSubmitting(true);
    setExecutionResult(null);
    setFeedback(null);
    
    try {
      const result = await submitCode(
        user.id,
        questionId,
        jobId,
        code,
        language
      );
      
      setExecutionResult(result.executionResult);
      if (result.submission.feedback) {
        setFeedback(result.submission.feedback);
      }
      
      if (result.executionResult.status === 'Accepted') {
        toast.success('Your solution passed all test cases!');
      } else {
        toast.error(`Submission status: ${result.executionResult.status}`);
      }
    } catch (err) {
      toast.error('Failed to submit code. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !question || !job) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Interview data not found'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="text-red-700 underline mt-2"
        >
          Go Back
        </button>
      </div>
    );
  }

  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{question.title}</h1>
          <p className="text-gray-600">
            {job.title} at {job.company}
          </p>
        </div>
        <span className={`${difficultyColor[question.difficulty]} text-xs px-2 py-1 rounded`}>
          {question.difficulty}
        </span>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Question Panel */}
        <div className="w-1/2 overflow-y-auto bg-white rounded-lg shadow-md p-6">
          <div className="prose max-w-none">
            <h2>Problem Description</h2>
            <p>{question.description}</p>
            
            <h3>Examples</h3>
            {question.examples.map((example, index) => (
              <div key={index} className="mb-4">
                <div className="bg-gray-100 p-3 rounded">
                  <p><strong>Input:</strong> {example.input}</p>
                  <p><strong>Output:</strong> {example.output}</p>
                  {example.explanation && (
                    <p><strong>Explanation:</strong> {example.explanation}</p>
                  )}
                </div>
              </div>
            ))}
            
            <h3>Constraints</h3>
            <ul>
              {question.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <LanguageSelector 
              language={language} 
              onChange={handleLanguageChange} 
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </div>
          
          <div className="flex-1">
            <CodeEditor 
              language={language} 
              value={code} 
              onChange={setCode} 
            />
          </div>
          
          {(executionResult || feedback) && (
            <div className="mt-4 overflow-y-auto max-h-80">
              <FeedbackPanel 
                executionResult={executionResult} 
                feedback={feedback} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
