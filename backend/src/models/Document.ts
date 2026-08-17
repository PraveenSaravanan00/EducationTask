import mongoose, { Schema, Document, Types } from "mongoose";

export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface IQuestion {
  _id?: Types.ObjectId;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  author: Types.ObjectId;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    type: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer"],
      required: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true }
);

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema);
export default DocumentModel;
