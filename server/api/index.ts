import { Request, Response } from "express";
import { ContactUsController } from "./controllers/contact-us-controller";
import { ReadWriteAPIController } from "./controllers/read-write-api-controller";
import { validate } from "../validation/endpoint-schema-map";
import express from "express";

import navItems from "../config/navbar.json";
import footer from "../data/shared/footer.json";
import { ExamBankController } from "./controllers/exam-bank-controller";
import { ImageController } from "./controllers/image-controller";

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
    res.render("pages/contact-us/contact-us-success", {
      navItems: navItems,
      footer: footer,
    });
  }
});

router.post("/image/upload", async (req: Request, res: Response) => {
  ImageController.uploadImage(req, res);
});

router.post("/image/delete", async (req: Request, res: Response) => {
  ImageController.deleteImage(req, res);
});

router.get("/images", (_req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/image-list", res);
});

export default router;
