import express from "express";
import pages from "../config/pages.json";
import { PageLoader } from "./page-loader";

const router = express.Router();

PageLoader.buildRoutes(pages, router, (page) => page);

export default router;
