import mongoose, { type Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  difficulty: string;
  examples: string[];
  constraints: string;
  hints: string[];
  preferredLanguage: string;
  jobId: mongoose.Types.ObjectId;
  slug: string;
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  languageTemplates: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    examples: { type: [String], required: true },
    constraints: { type: String, required: true },
    hints: { type: [String], default: [] },
    preferredLanguage: {
      type: String,
      enum: ["javascript", "python", "java", "cpp", "c++", "c","Cpp"] ,
      default: "javascript",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    solutionApproach: { type: String, default: "" },
    timeComplexity: { type: String, default: "" },
    spaceComplexity: { type: String, default: "" },
    tags: { type: [String], default: [] },
    languageTemplates: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
QuestionSchema.pre("save", function (this: IQuestion, next) {
  if (!this.isModified("title")) return next();

  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  next();
});

export default mongoose.model<IQuestion>("Question", QuestionSchema);
