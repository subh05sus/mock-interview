import { Link } from "react-router-dom";

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    requirements: string[];
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-zinc-800">{job.title}</h2>
      <p className="text-zinc-600 mt-1">
        {job.company} • {job.location}
      </p>
      <p className="text-zinc-700 mt-2 font-medium">{job.salary}</p>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-zinc-700">Requirements:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {job.requirements.map((req, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/jobs/${job._id}`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
