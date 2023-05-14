import express from "express";
import authenticatedPages from "../config/authenticated-pages.json";
import { PageLoader } from "./controllers/page-loader";
import { adfsMiddleware } from "../auth/adfs";
const router = express.Router();

router.use(adfsMiddleware);

PageLoader.buildRoutes(authenticatedPages, router, (page) => page);

export default router;
