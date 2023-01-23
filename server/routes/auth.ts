import express, { Request, Response } from "express";
import pages from "../config/admin/admin-pages.json";
import { PageLoader } from "./page-loader";

const router = express.Router();

PageLoader.buildRoutes(pages, router);

router.get("/admin/editor", async (req: Request, res: Response) => {
  const file = req.query["page"];

  const pipedData = PageLoader.getPagePipedData({
    title: "Editor",
    ref: "/admin/editor",
  });

  pipedData['editorSource'] = `/api/data?path=${file}`;

  res.render(`pages/admin/generic-editor.pug`, pipedData);
});

export default router;
