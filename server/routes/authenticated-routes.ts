import express from "express";
import authenticatedPages from "../config/authenticated-pages.json";
import { PageLoader } from "./controllers/page-loader";

const router = express.Router();

PageLoader.buildRoutes(authenticatedPages, router, (page) => page);

export default router;
