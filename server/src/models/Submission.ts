import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  userId: string;
  questionId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error"
    | "Compilation Error";
  executionTime?: number;
  memory?: number;
  feedback?: {
    review: string;
    suggestions: string[];
    betterSolution?: string;
    explanation?: string;
  };
  createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Runtime Error",
      "Compilation Error",
    ],
    required: true,
  },
  executionTime: { type: Number },
  memory: { type: Number },
  feedback: {
    review: { type: String },
    suggestions: { type: [String] },
    betterSolution: { type: String },
    explanation: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
