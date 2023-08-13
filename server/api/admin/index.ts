import { Request, Response } from "express";
import { ReadWriteAPIController } from "../controllers/read-write-api-controller";
import { validate } from "../../validation/endpoint-schema-map";
import express from "express";
import { ExamBankController } from "../controllers/exam-bank-controller";
import { ImageController } from "../controllers/image-controller";
import { DocumentController } from "../controllers/document-controller";
import { AdminMiddleware } from "../../auth/google";
import { CartoonsController } from "../controllers/cartoons-controller";
import fs from "fs";

const router = express.Router();

const IMAGES_URL = "_hidden/image-list";
const DOCUMENT_URL = "_hidden/document-list";

router.use(AdminMiddleware);

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  new ExamBankController().rewriteFileJson();
  res.status(201).send();
});

router.patch("/exams/:examName/hide", (req: Request, res: Response) => {
  try {
    new ExamBankController().hideExamFile(req.params.examName);
    res.status(200).end();
  } catch (e) {
    res.status(404).end();
  }
});

router.patch("/exams/:examName/show", (req: Request, res: Response) => {
  try {
    new ExamBankController().showExamFile(req.params.examName);
    res.status(200).end();
  } catch (e) {
    res.status(404).end();
  }
});

router.post("/cartoons/rebuild", (_req: Request, res: Response) => {
  CartoonsController.rewriteFile();
  res.status(201).send();
});

router.post("/data", validate, (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.overwriteJSONDataPath(req.query.path, res, req.body);
  } else {
    res.status(400).end();
  }
});

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  new ExamBankController().rewriteFileJson();
  res.status(201).send();
});

router.post("/exams/upload", (req: Request, res: Response) => {
  new ExamBankController().uploadFiles(req, res);
});

router.delete("/exams/delete", (req: Request, res: Response) => {
  new ExamBankController().deleteFile(req, res);
});

router.post("/image/upload", async (req: Request, res: Response) => {
  new ImageController().uploadFiles(req, res);
});

router.delete("/image/delete", async (req: Request, res: Response) => {
  new ImageController().deleteFile(req, res);
});

router.get("/images", (_req: Request, res: Response) => {
  if (!fs.existsSync("server/data/_hidden/image-list.json")) {
    fs.writeFileSync("server/data/_hidden/image-list.json", "");
  }

  ReadWriteAPIController.getJSONDataPath(IMAGES_URL, res);
});

router.post("/document/upload", async (req: Request, res: Response) => {
  new DocumentController().uploadFiles(req, res);
});

router.delete("/document/delete", async (req: Request, res: Response) => {
  new DocumentController().deleteFile(req, res);
});

router.get("/documents", (req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath(DOCUMENT_URL, res);
});

export default router;
