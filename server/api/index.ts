import { Request, Response } from "express";
import { ReadWriteController } from "./controllers/read-write-controller";
import { ContactUsController } from "./controllers/contact-us-controller";
import { validate } from "../validation/endpoint-schema-map";
import express from "express";

const router = express.Router();
import navItems from "../config/navbar.json";
import footer from "../data/shared/footer.json";

router.get("/data", (req: Request, res: Response) => {
  ReadWriteController.getJSONDataPath(req.query.path, res);
});

router.post("/data", validate, (req: Request, res: Response) => {
  ReadWriteController.overwriteJSONDataPath(req.query.path, res, req.body);
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

export default router;
