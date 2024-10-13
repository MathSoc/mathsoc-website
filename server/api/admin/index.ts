import { Request, Response } from "express";
import { ReadWriteAPIController } from "../controllers/read-write-api-controller";
import {
  getSchema,
  validateRequest,
} from "../../validation/endpoint-schema-map";
import express from "express";
import { ExamBankController } from "../controllers/exam-bank-controller";
import { ImageController } from "../controllers/image-controller";
import { DocumentController } from "../controllers/document-controller";
import { AdminMiddleware } from "../../auth/google";
import fs from "fs";
import { EditorDirectoryStructureConstructor } from "../../routes/controllers/editor-directory-structure-constructor";

const router = express.Router();

const IMAGES_PATH = "public/assets/img/uploads";
const IMAGES_PUBLIC_LINK = "/assets/img/uploads";
const IMAGES_URL = "_hidden/image-list";

const DOCUMENT_PATH = "public/assets/documents";
const DOCUMENT_PUBLIC_LINK = "/assets/documents";
const DOCUMENT_URL = "_hidden/document-list";

router.use(AdminMiddleware);

router.get("/editor/structure", (_req: Request, res: Response) => {
  res
    .status(200)
    .json(EditorDirectoryStructureConstructor.getDataDirectoryStructure())
    .end();
});

router.post("/exams/upload", (req: Request, res: Response) => {
  try {
    if (!req.files) {
      throw new Error("Files not found");
    }

    ExamBankController.uploadExams(req.files);
    res.status(200).json({});
  } catch (e) {
    res.status(404).end();
  }
});

router.post("/exams/:examName/hide", (req: Request, res: Response) => {
  try {
    ExamBankController.hideExamFile(req.params.examName);
    res.status(200).end();
  } catch (e) {
    res.status(404).end();
  }
});

router.post("/exams/:examName/show", (req: Request, res: Response) => {
  try {
    ExamBankController.showExamFile(req.params.examName);
    res.status(200).end();
  } catch (e) {
    res.status(404).end();
  }
});

router.get("/data/schema", (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    res
      .json(getSchema(req.query.path.replace(".json", "")))
      .status(200)
      .end();
  } else {
    res.status(400).end();
  }
});

router.post("/data", validateRequest, (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.overwriteJSONDataPath(
      req.query.path.replace(".json", ""),
      res,
      req.body
    );
  } else {
    res.status(400).end();
  }
});

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  ExamBankController.refreshExamsList();
  res.status(201).send();
});

router.post("/image/upload", async (req: Request, res: Response) => {
  new ImageController(IMAGES_PATH, IMAGES_PUBLIC_LINK, IMAGES_URL).uploadFiles(
    req,
    res
  );
});

router.delete("/image/delete", async (req: Request, res: Response) => {
  new ImageController(IMAGES_PATH, IMAGES_PUBLIC_LINK, IMAGES_URL).deleteFile(
    req,
    res
  );
});

router.get("/images", (_req: Request, res: Response) => {
  if (!fs.existsSync("server/data/_hidden/image-list.json")) {
    fs.writeFileSync("server/data/_hidden/image-list.json", "");
  }

  ReadWriteAPIController.getJSONDataPath(IMAGES_URL, res);
});

router.post("/document/upload", async (req: Request, res: Response) => {
  new DocumentController(
    DOCUMENT_PATH,
    DOCUMENT_PUBLIC_LINK,
    DOCUMENT_URL
  ).uploadFiles(req, res);
});

router.delete("/document/delete", async (req: Request, res: Response) => {
  new DocumentController(
    DOCUMENT_PATH,
    DOCUMENT_PUBLIC_LINK,
    DOCUMENT_URL
  ).deleteFile(req, res);
});

router.get("/documents", (req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath(DOCUMENT_URL, res);
});

export default router;
