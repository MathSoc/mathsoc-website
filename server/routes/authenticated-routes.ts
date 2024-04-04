import express, { Request, Response } from "express";
import authenticatedPages from "../config/authenticated-pages.json";
import { PageLoader } from "./controllers/page-loader";
import { StudentMiddleware } from "../auth/adfs";
import path from "path";
import { AdminMiddleware } from "../auth/google";

const router = express.Router();

PageLoader.buildRoutes(
  authenticatedPages,
  router,
  (page) => page,
  StudentMiddleware
);

// prevent any "hidden" exams from being seen by non-admins
router.get(
  "/exams/:fileName",
  StudentMiddleware,
  (req: Request, res: Response) => {
    const sendFile = () =>
      res.sendFile(
        path.join(__dirname, `../../public/exams/${req.params.fileName}`)
      )

    if (req.params.fileName.includes("hidden")) {
      AdminMiddleware(req, res, sendFile);
    } else {
      sendFile();
    }
  }
);

export default router;
