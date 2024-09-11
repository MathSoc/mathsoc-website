import express from "express";
import pages from "../config/pages.json";
import { PageLoader } from "./controllers/page-loader";
import tokens from "../../config";

const router = express.Router();

if (!tokens.EXAM_BANK_ONLY) {
  PageLoader.buildRoutes(pages, router, (page) => page);
}

export default router;
