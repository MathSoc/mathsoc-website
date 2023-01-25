import e from "express";
import express, { Request, Response } from "express";
import customAdminPages from "../config/admin/admin-pages.json";
import { BackendConstructor } from "./backend-constructor";
import { PageLoader } from "./page-loader";
import { getFormattedURL } from "./util";

const router = express.Router();

const pageBuilder = (pageData) => {
  pageData["adminPages"] = customAdminPages;
  return pageData;
};

PageLoader.buildRoutes(customAdminPages, router, pageBuilder);

router.get("/admin/editor", async (req: Request, res: Response) => {
  const file = req.query["page"] ?? "";
  const filename: string = typeof file === "string" ? file : file.toString();

  const pipedData = PageLoader.getPagePipedData(
    {
      title: "Editor",
      ref: "/admin/editor",
    },
    pageBuilder
  );

  const dataPages = BackendConstructor.getDataDirectoryStructure();

  pipedData["editors"] = dataPages;
  pipedData["editorSource"] = `/api/data?path=${filename}`;
  pipedData["editorName"] = getFormattedURL(filename);

  res.render(`pages/admin/generic-editor.pug`, pipedData);
});

export default router;
