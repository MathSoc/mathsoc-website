import express from "express";
import authenticatedPages from "../config/authenticated-pages.json";
import { PageLoader } from "./controllers/page-loader";
// import { ADFSMiddleware } from "../auth/auth";
const router = express.Router();

// router.use(ADFSMiddleware);

PageLoader.buildRoutes(authenticatedPages, router, (page) => page);

export default router;
