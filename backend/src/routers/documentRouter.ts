import { Router } from "express";
import {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/documentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const documentRouter = Router();

documentRouter.use(authMiddleware);

documentRouter.get("/", getDocuments);
documentRouter.post("/", createDocument);
documentRouter.get("/:id", getDocument);
documentRouter.put("/:id", updateDocument);
documentRouter.delete("/:id", deleteDocument);

documentRouter.post("/:id/questions", addQuestion);
documentRouter.put("/:id/questions/:qid", updateQuestion);
documentRouter.delete("/:id/questions/:qid", deleteQuestion);

export default documentRouter;
