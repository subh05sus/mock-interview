import mongoose, { type Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  code: string;
  language: string;
  questionId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  results: any[];
  aiReview: any;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  code: { type: String, required: true },
  language: { type: String, required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  results: { type: Array, required: true },
  aiReview: { type: Object, required: true },
  passed: { type: Boolean, required: true },
  executionTime: { type: Number, default: 0 },
  memoryUsed: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
