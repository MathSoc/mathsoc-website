import express, { Request, Response } from "express";
import adminPages from "../config/admin/admin-pages.json";
import { EditorDirectoryStructureConstructor } from "./controllers/editor-directory-structure-constructor";
import { PageLoader } from "./controllers/page-loader";
import { getFormattedURL } from "../util/util";
import {
  AdminPageOutflow,
  DirectoryEntry,
  PageOutflow,
} from "../types/routing";
import { GoogleMiddleware } from "../auth/auth";

interface EditorPageOutflow extends PageOutflow {
  editors: DirectoryEntry[];
  editorSource: string;
  editorName: string;
}

class AuthRoutesConstructor {
  static async buildRoutes() {
    PageLoader.buildRoutes(
      adminPages,
      router,
      this.addAdminSpecificOutflowToPage
    );
    await this.generateEditorPage();
  }

  /**
   * Handles the custom data input necessary for the editor pages.
   */
  static async generateEditorPage() {
    const genericEditorPageOutflow = await PageLoader.getAllPageData(
      {
        title: "Editor",
        ref: "/admin/editor",
      },
      this.addAdminSpecificOutflowToPage
    );

    const editorNavigationStructure =
      EditorDirectoryStructureConstructor.getDataDirectoryStructure();

    router.get("/admin/editor", async (req: Request, res: Response) => {
      const file = req.query["page"] ?? "home";
      const filename: string =
        typeof file === "string" ? file : file.toString();

      const editorOutflow: EditorPageOutflow = {
        ...genericEditorPageOutflow,

        editors: editorNavigationStructure,
        editorSource: `/api/data?path=${filename}`,
        editorName: getFormattedURL(filename),
      };
      res.render(`pages/admin/generic-editor.pug`, editorOutflow);
    });
  }

  /**
   * This pipeline adds the data for the admin navigation bar to a page's received data
   */
  static addAdminSpecificOutflowToPage(
    pageData: PageOutflow
  ): AdminPageOutflow {
    return {
      ...pageData,
      adminNavSections: adminPages,
    };
  }
}

const router = express.Router();

router.use(GoogleMiddleware);

AuthRoutesConstructor.buildRoutes();

export default router;
