import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  postedDate: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  salary: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
});

export default mongoose.model<IJob>("Job", JobSchema);
