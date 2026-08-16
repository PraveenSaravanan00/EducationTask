export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
  _id?: string;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

export interface Document {
  _id: string;
  title: string;
  author: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface QuestionErrors {
  questionText?: string;
  options?: string;
  correctAnswer?: string;
}
