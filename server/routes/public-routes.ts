import express from "express";
import pages from "../config/pages.json";
import inventory from "../data/inventory.json";
import { PageLoader } from "./controllers/page-loader";

const router = express.Router();

PageLoader.buildRoutes(pages, router, (page) => page);

inventory.novelties.forEach((category) =>
  PageLoader.buildInventoryItemRoutes(category.items, router)
);
inventory.stationary.forEach((category) =>
  PageLoader.buildInventoryItemRoutes(category.items, router)
);

export default router;
