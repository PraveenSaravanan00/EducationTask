import { Request, Response } from "express";
import DocumentModel, { IQuestion } from "../models/Document.js";

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const documents = await DocumentModel.find({ author: userId })
      .select("title createdAt updatedAt questions")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch documents.", error });
  }
};

export const createDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { title, questions } = req.body as {
      title: string;
      questions?: IQuestion[];
    };

    if (!title || title.trim() === "") {
      res.status(400).json({ success: false, message: "Document title is required." });
      return;
    }

    const document = await DocumentModel.create({
      title: title.trim(),
      author: userId,
      questions: questions ?? [],
    });

    res.status(201).json({
      success: true,
      message: "Document created successfully.",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create document.", error });
  }
};

export const getDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const userId = req.user?.userId;

    if (!docId || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const document = await DocumentModel.findOne({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    res.status(200).json({ success: true, data: { document } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch document.", error });
  }
};


export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const userId = req.user?.userId;

    if (!docId || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const { title, questions } = req.body as {
      title?: string;
      questions?: IQuestion[];
    };

    const document = await DocumentModel.findOne({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    if (title !== undefined) document.title = title.trim();
    if (questions !== undefined) document.questions = questions;

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully.",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update document.", error });
  }
};


export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const userId = req.user?.userId;

    if (!docId || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const document = await DocumentModel.findOneAndDelete({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    res.status(200).json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete document.", error });
  }
};


export const addQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const userId = req.user?.userId;

    if (!docId || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const question = req.body as IQuestion;

    const document = await DocumentModel.findOne({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    question.order = document.questions.length;
    document.questions.push(question);
    await document.save();

    res.status(201).json({
      success: true,
      message: "Question added.",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add question.", error });
  }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const qid = req.params["qid"];
    const userId = req.user?.userId;

    if (!docId || !qid || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const document = await DocumentModel.findOne({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    const question = document.questions.find((q) => q._id?.toString() === qid);

    if (!question) {
      res.status(404).json({ success: false, message: "Question not found." });
      return;
    }

    const updates = req.body as Partial<IQuestion>;
    if (updates.type !== undefined) question.type = updates.type;
    if (updates.questionText !== undefined) question.questionText = updates.questionText;
    if (updates.options !== undefined) question.options = updates.options;
    if (updates.correctAnswer !== undefined) question.correctAnswer = updates.correctAnswer;

    await document.save();

    res.status(200).json({
      success: true,
      message: "Question updated.",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update question.", error });
  }
};


export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params["id"];
    const qid = req.params["qid"];
    const userId = req.user?.userId;

    if (!docId || !qid || !userId) {
      res.status(400).json({ success: false, message: "Invalid request." });
      return;
    }

    const document = await DocumentModel.findOne({ _id: docId, author: userId });

    if (!document) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    const initialLength = document.questions.length;
    document.questions = document.questions.filter(
      (q) => q._id?.toString() !== qid
    );

    if (document.questions.length === initialLength) {
      res.status(404).json({ success: false, message: "Question not found." });
      return;
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: "Question deleted.",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete question.", error });
  }
};
