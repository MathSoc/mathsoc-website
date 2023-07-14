import { Request, Response } from "express";
import { ContactUsController } from "./controllers/contact-us-controller";
import { ReadWriteAPIController } from "./controllers/read-write-api-controller";
import express from "express";
import { ExamBankController } from "./controllers/exam-bank-controller";
import { StudentMiddleware } from "../auth/adfs";
import { CartoonsController } from "./controllers/cartoons-controller";

const router = express.Router();

ExamBankController.rewriteFile();
CartoonsController.rewriteFile();

router.get("/data", (req: Request, res: Response) => {
  if (typeof req.query.path === "string") {
    ReadWriteAPIController.getJSONDataPath(req.query.path, res);
  } else {
    res.status(400).end();
  }
});

router.get("/exams", StudentMiddleware, (_req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/exams-list", res);
});

router.get("/cartoons", (_req: Request, res: Response) => {
  ReadWriteAPIController.getJSONDataPath("_hidden/cartoons-list", res);
});

router.post("/exams/rebuild", (_req: Request, res: Response) => {
  ExamBankController.rewriteFile();
  res.status(201).send();
});

router.post("/cartoons/rebuild", (_req: Request, res: Response) => {
  CartoonsController.rewriteFile();
  res.status(201).send();
});

router.post("/general-inquiries", (req: Request, res: Response) => {
  const success = ContactUsController.handleRequest(req, res);
  // If the res hasn't been closed by bad input, then redirect to success page
  if (success) {
    res.redirect("/contact-us/success");
  }
});

export default router;
