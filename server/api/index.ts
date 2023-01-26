import { Request, Response } from "express";
import { ReadWriteController } from "./read-write-controller";
import { ContactUsController } from "./contact-us-controller";
import { ContactUsAdminService } from "./admin-services/contact-us";
import { validate } from "../types/endpointSchemaMap";
import express from "express";

const router = express.Router();
import navItems from "../data/shared/navbar.json";
import footer from "../data/shared/footer.json";

router.get("/data", (req: Request, res: Response) => {
  ReadWriteController.getJSONDataPath(req.query.path, res);
});

router.post("/data", validate, (req: Request, res: Response) => {
  ReadWriteController.overwriteJSONDataPath(req.query.path, res, req.body);
});

router.post("/admin/contact-us/execs", (req: Request, res: Response) => {
  ContactUsAdminService.updateExecs(req, res);
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
