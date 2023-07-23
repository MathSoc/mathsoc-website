import { Request, Response } from "express";
import { ReadWriteAPIController } from "./../controllers/read-write-api-controller";
import { validate } from "../../validation/endpoint-schema-map";
import express from "express";
import { ExamBankController } from "./../controllers/exam-bank-controller";
import { ImageController } from "./../controllers/image-controller";
import { DocumentController } from "./../controllers/document-controller";
import { AdminMiddleware } from "../../auth/google";

const router = express.Router();

const IMAGES_PATH = "public/assets/img/uploads";
const IMAGES_PUBLIC_LINK = "/assets/img/uploads";
const IMAGES_URL = "_hidden/image-list";

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
  ReadWriteAPIController.getJSONDataPath("_hidden/image-list", res);
});

/*
 **  REQUIRES: req.body.documentGroup
 **            req.body.documentName
 **            req.body.files: documents
 */
router.post("/document/upload", async (req: Request, res: Response) => {
  new DocumentController(
    "public/assets/documents",
    "assets/documents",
    "_hidden/document-list"
  ).uploadFiles(req, res);
});

/*
 **  REQUIRES: req.body.path
 **            req.body.fileName
 **            req.body.fileType
 **            req.body.publicLink
 */
router.delete("/document/delete", async (req: Request, res: Response) => {
  new DocumentController(
    "public/assets/documents",
    "assets/documents",
    "_hidden/document-list"
  ).uploadFiles(req, res);
});

/*
 **  REQUIRES: req.headers.documentGroup
 **            req.headers.documentName
 */
router.get("/documents", (req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/document-list", res);
});

export default router;
