import express from "express";
import authenticatedPages from "../config/authenticated-pages.json";
import { PageLoader } from "./controllers/page-loader";
import { StudentMiddleware } from "../auth/adfs";
const router = express.Router();

PageLoader.buildRoutes(authenticatedPages, router, (page) => page, StudentMiddleware);

export default router;
