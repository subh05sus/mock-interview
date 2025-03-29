interface FeedbackPanelProps {
  feedback: {
    review: string;
    suggestions: string[];
    betterSolution?: string;
    explanation?: string;
  } | null;
  executionResult: {
    status: string;
    executionTime?: number;
    memory?: number;
    output?: string;
    error?: string;
  } | null;
}

export default function FeedbackPanel({
  feedback,
  executionResult,
}: FeedbackPanelProps) {
  if (!executionResult) {
    return null;
  }

  const statusColors = {
    Accepted: "text-green-600",
    "Wrong Answer": "text-red-600",
    "Time Limit Exceeded": "text-orange-600",
    "Runtime Error": "text-red-600",
    "Compilation Error": "text-red-600",
  };

  const statusColor =
    statusColors[executionResult.status as keyof typeof statusColors] ||
    "text-gray-600";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Execution Result</h2>

      <div className="mb-4">
        <p className="font-medium">
          Status: <span className={statusColor}>{executionResult.status}</span>
        </p>
        {executionResult.executionTime !== undefined && (
          <p className="text-gray-600">
            Execution Time: {executionResult.executionTime} ms
          </p>
        )}
        {executionResult.memory !== undefined && (
          <p className="text-gray-600">
            Memory Used: {executionResult.memory} KB
          </p>
        )}
      </div>

      {executionResult.error && (
        <div className="mb-4">
          <h3 className="font-medium text-red-600">Error:</h3>
          <pre className="bg-slate-100 p-3 rounded mt-2 text-sm overflow-x-auto">
            {executionResult.error}
          </pre>
        </div>
      )}

      {executionResult.output && (
        <div className="mb-4">
          <h3 className="font-medium">Output:</h3>
          <pre className="bg-slate-100 p-3 rounded mt-2 text-sm overflow-x-auto">
            {executionResult.output}
          </pre>
        </div>
      )}

      {feedback && executionResult.status === "Accepted" && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>

          <div className="mb-4">
            <h3 className="font-medium">Review:</h3>
            <p className="mt-1 text-gray-700">{feedback.review}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium">Suggestions:</h3>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="text-gray-700">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {feedback.betterSolution && (
            <div className="mb-4">
              <h3 className="font-medium">Better Solution:</h3>
              <pre className="bg-slate-100 p-3 rounded mt-2 text-sm overflow-x-auto">
                {feedback.betterSolution}
              </pre>
              {feedback.explanation && (
                <div className="mt-2">
                  <h4 className="font-medium">Explanation:</h4>
                  <p className="text-gray-700">{feedback.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
