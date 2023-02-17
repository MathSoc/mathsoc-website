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

interface EditorPageOutflow extends PageOutflow {
  editors: DirectoryEntry[];
  editorSource: string;
  editorName: string;
}

interface DocumentPageOutflow extends PageOutflow {
  documents: DirectoryEntry[];
  documentSource: string;
  documentName: string;
}

class AuthRoutesConstructor {
  static buildRoutes() {
    PageLoader.buildRoutes(
      adminPages,
      router,
      this.addAdminSpecificOutflowToPage
    );
    this.generateEditorPage();
    this.generateDocumentUploadPage();
  }

  /**
   * Handles the custom data input necessary for the editor pages.
   */
  static generateEditorPage() {
    const genericEditorPageOutflow = PageLoader.getAllPageData(
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
   * Handles the custom data input necessary for the document upload pages.
   */
  static generateDocumentUploadPage() {
    const genericDocumentPageOutflow = PageLoader.getAllPageData(
      {
        title: "Document Upload",
        ref: "/admin/document-upload",
      },
      this.addAdminSpecificOutflowToPage
    );
    const documentNavigationStructure =
      EditorDirectoryStructureConstructor.getDocumentDataDirectoryStructure();
    console.log(documentNavigationStructure)

    router.get("/admin/document-upload", async (req: Request, res: Response) => {
      const file = req.query["page"] ?? "home";
      const filename: string =
        typeof file === "string" ? file : file.toString();

      const documentOutflow: DocumentPageOutflow = {
        ...genericDocumentPageOutflow,

        documents: documentNavigationStructure,
        documentSource: `/api/data?path=${filename}`,
        documentName: getFormattedURL(filename),
      };
      res.render(`pages/admin/generic-editor.pug`, documentOutflow);
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

AuthRoutesConstructor.buildRoutes();

export default router;
