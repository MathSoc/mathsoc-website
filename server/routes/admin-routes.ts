import express, { Request, Response } from "express";
import adminPages from "../config/admin/admin-pages.json";
import { PageLoader } from "./controllers/page-loader";
import { AdminPageOutflow, PageOutflow } from "../types/routing";
import { AdminMiddleware } from "../auth/google";

interface EditorPageOutflow extends PageOutflow {
  editorSource: string;
}

class AdminRoutesConstructor {
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

    router.get("/admin/editor", async (req: Request, res: Response) => {
      const file = req.query["page"] ?? "contact-us";
      const filename: string =
        typeof file === "string" ? file : file.toString();

      const editorOutflow: EditorPageOutflow = {
        ...genericEditorPageOutflow,

        editorSource: filename,
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

router.use(AdminMiddleware);

router.get("/admin/", (_req: Request, res: Response) => {
  res.redirect("/admin/editor");
});

AdminRoutesConstructor.buildRoutes();

export default router;
