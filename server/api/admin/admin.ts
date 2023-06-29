import { Request, Response } from "express";
import { ReadWriteAPIController } from "./../controllers/read-write-api-controller";
import { validate } from "../../validation/endpoint-schema-map";
import express from "express";
import { ExamBankController } from "./../controllers/exam-bank-controller";
import { ImageController } from "./../controllers/image-controller";
import { DocumentController } from "./../controllers/document-controller";
import { AdminMiddleware } from "../../auth/google";

const router = express.Router();

router.use(AdminMiddleware);

ExamBankController.rewriteFile();

router.post("/data", validate, (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.overwriteJSONDataPath(req.query.path, res, req.body);
  } else {
    res.status(400).end();
  }
});

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  ExamBankController.rewriteFile();
  res.status(201).send();
});

router.post("/image/upload", async (req: Request, res: Response) => {
  ImageController.uploadImages(req, res);
});

router.delete("/image/delete", async (req: Request, res: Response) => {
  ImageController.deleteImage(req, res);
});

router.get("/images", (_req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/image-list", res);
});

/*
 **  REQUIRES: req.body.documentGroup
 **            req.body.documentName
 **            req.body.files: documents
 */
router.post("/document/upload", async (req: Request, res: Response) => {
  DocumentController.uploadDocument(req, res);
});

/*
 **  REQUIRES: req.body.path
 **            req.body.fileName
 **            req.body.fileType
 **            req.body.publicLink
 */
router.delete("/document/delete", async (req: Request, res: Response) => {
  DocumentController.deleteDocument(req, res);
});

/*
 **  REQUIRES: req.headers.documentGroup
 **            req.headers.documentName
 */
router.get("/documents", (req: Request, res: Response) => {
  DocumentController.getDocument(req, res);
});

export default router;
