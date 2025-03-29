import mongoose, { type Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  slug: string;
  difficulty: string;
  position: string;
  location: string;
  salaryRange: string;
  jobType: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level"],
      default: "Mid Level",
    },
    position: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Remote", "Internship"],
      default: "Full-time",
    },
  },
  { timestamps: true }
);

// Create slug from title before saving
JobSchema.pre<IJob>("save", function (next) {
  if (!this.isModified("title")) return next();

  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  next();
});

export default mongoose.model<IJob>("Job", JobSchema);
