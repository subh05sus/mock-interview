import { Link } from "react-router-dom";

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
  jobId: string;
}

export default function QuestionCard({ question, jobId }: QuestionCardProps) {
  const difficultyColor = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-zinc-800">
          {question.title}
        </h2>
        <span
          className={`${
            difficultyColor[question.difficulty]
          } text-xs px-2 py-1 rounded`}
        >
          {question.difficulty}
        </span>
      </div>

      <div className="mt-6">
        <Link
          to={`/interview/${jobId}/${question._id}`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Start Interview
        </Link>
      </div>
    </div>
  );
}
