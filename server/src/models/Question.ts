import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  jobTags: string[];
  testCases: {
    input: string;
    output: string;
  }[];
}

const QuestionSchema: Schema = new Schema({
  title: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  description: { type: String, required: true },
  examples: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String },
    },
  ],
  constraints: { type: [String], required: true },
  jobTags: { type: [String], required: true },
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
