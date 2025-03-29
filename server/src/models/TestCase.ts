import mongoose, { type Document, Schema } from "mongoose";

export interface ITestCase extends Document {
  questionId: mongoose.Types.ObjectId;
  input: any;
  expectedOutput: any;
  explanation: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema: Schema = new Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ITestCase>("TestCase", TestCaseSchema);
