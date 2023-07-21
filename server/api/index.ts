import { Request, Response } from "express";
import { ContactUsController } from "./controllers/contact-us-controller";
import { ReadWriteAPIController } from "./controllers/read-write-api-controller";
import { validate } from "../validation/endpoint-schema-map";
import express from "express";
import { ExamBankController } from "./controllers/exam-bank-controller";
import { ImageController } from "./controllers/image-controller";
import { DocumentController } from "./controllers/document-controller";
import { LockerSignoutController } from "./controllers/locker-signout-controller";

const router = express.Router();

ExamBankController.rewriteFile();

router.get("/data", (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.getJSONDataPath(req.query.path, res);
  } else {
    res.status(400).end();
  }
});

router.post("/data", validate, (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.overwriteJSONDataPath(req.query.path, res, req.body);
  } else {
    res.status(400).end();
  }
});

router.get("/exams", (_req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/exams-list", res);
});

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  ExamBankController.rewriteFile();
  res.status(201).send();
});

router.post("/general-inquiries", (req: Request, res: Response) => {
  const success = ContactUsController.handleRequest(req, res);
  // If the res hasn't been closed by bad input, then redirect to success page
  if (success) {
    res.redirect("/contact-us/success");
  }
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
  DocumentController.getDocument(req, res)
});


// LOCKER SIGN OUT ENDPOINTS
// remember to add admin only middleware to get endpoints
// i think works
router.get("/locker-signout/locker-by-user", (_req: Request, res: Response) => {
  LockerSignoutController.getLockerByUserId(_req, res);
});

// probably works
router.get("/locker-signout/user-by-locker", (_req: Request, res: Response) => {
  LockerSignoutController.getUserIdByLocker(_req, res);
});

// works too
router.get("/locker-signout/locker-available", (_req: Request, res: Response) => {
  LockerSignoutController.checkLockerAvailability(_req, res);
});

// w working
router.get("/locker-signout/all-available", (_req: Request, res: Response) => {
  LockerSignoutController.getAvailableLockers(_req, res);
});

/*
**  REQUIRES: req.body.userId        
*/
router.post("/locker-signout/request", async (req: Request, res: Response) => {
  LockerSignoutController.requestLocker(req, res);
});





export default router;
