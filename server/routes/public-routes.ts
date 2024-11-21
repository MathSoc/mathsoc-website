import express from "express";
import pages from "../config/pages.json";
import inventory from "../data/inventory.json";
import { PageLoader } from "./controllers/page-loader";

const router = express.Router();

PageLoader.buildRoutes(pages, router, (page) => page);

inventory.sections
  .filter((section) => !section.isBoardGames)
  .flatMap((section) => section.subsections)
  .forEach((category) => PageLoader.buildInventoryItemRoutes(category, router));

export default router;
