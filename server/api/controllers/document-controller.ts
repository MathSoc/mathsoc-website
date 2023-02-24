import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import {
    Dirent,
    lstatSync,
    readdirSync,
  } from "fs";
import { Document } from "../../types/document";
import { Logger } from "../../util/logger";
import { ReadWriteController } from "./read-write-controller";


// All definitions used
enum Action {
    UPDATE,
    UPLOAD,
    DELETE,
}

type DocumentRequest = Document & {
  res: Response;
  type: Action;
  uploadedFile: UploadedFile | null;
}

const AllowedDocumentMimeTypes = ['application/pdf']

export class DocumentController {
    static logger = new Logger();
    private static queues: Record<string, DocumentRequestQueue> = {};
  
    /**
     * Checks if the current request is allowed.
     * If it's allowed than it is added to the queue with the request.
     * If not then an error is thrown.
     */
    static updateDocument(req: Request, res: Response) {
      try {
        const document = req.files?.document as UploadedFile; // @TODO: takes from 'document' name in pug
  
        if (!document) { throw new Error("No document was uploaded"); }
        if (!document.mimetype) { throw new Error("No mimetype/filetype provided with the document."); }
        if ( !AllowedDocumentMimeTypes.includes(document.mimetype) ) {
          throw new Error("Unsupported filetype uploaded.");
        }

        // Defining the uploaded Document
        const transformedDocument: Document = {
          fileName: document.name,
          fileType: document.name.split(".")[1],
          path: this.getImagePath(document.name),
          docName: req.body.docName,
        };
  
        if (!this.queues[transformedDocument.fileName]) {
          this.queues[transformedDocument.fileName] = new DocumentRequestQueue();
        }
  
        this.queues[transformedDocument.fileName].push(
          transformedDocument,
          Action.UPLOAD,
          res,
          document
        );
      } catch (err) {
        this.logger.error(err.message);
        res.status(400).redirect("/admin/document-upload");
        return;
      }
    }
  
    static async processImageUpload(request: ImageUploadRequest) {
      const { uploadedFile, fileName, res, path } = request;
  
      try {
        await uploadedFile?.mv(path);
        this.logger.info(`${fileName} uploaded to ${path}`);
        this.rewriteImageJson();
      } catch (err) {
        this.logger.error(err);
      }
  
      res.redirect("/admin/image-store");
    }
  
    private static generateJSON(): Image[] {
      const uploadedFiles: Dirent[] = readdirSync(this.getImagePath(""), {
        withFileTypes: true,
      });
  
      const images: Image[] = [];
  
      for (const img of uploadedFiles) {
        if (img.isFile()) {
          images.push({
            fileName: img.name,
            fileType: img.name.split(".")[1],
            path: this.getImagePath(img.name),
            publicLink: this.getPublicLink(img.name),
          });
        }
      }
  
      return images;
    }
  
    private static rewriteImageJson(): void {
      const url = "_hidden/image-list";
      ReadWriteController.overwriteJSONDataPath(
        url,
        () => {
          return;
        },
        this.generateJSON()
      );
      this.logger.info("Image list regenerated.");
    }
  
    private static getImagePath(fileName: string) {
      return `public/assets/img/uploads/${fileName}`;
    }
  
    private static getPublicLink(fileName: string) {
      return `/assets/img/uploads/${fileName}`;
    }
  
    // find occurences of image inside data folder before deleting.
    private static getDataFiles(mainPath: string, target: string): string[] {
      const files: string[] = [];
  
      const dataDir = readdirSync(mainPath);
      dataDir.forEach((file) => {
        const filePath = path.join(mainPath, file);
        const stat = lstatSync(filePath);
  
        if (stat.isDirectory()) {
          if (!filePath.includes("_hidden")) {
            const nestedFiles = this.getDataFiles(filePath, target);
            nestedFiles.forEach((file) => files.push(file));
          }
        } else {
          files.push(filePath);
        }
      });
  
      return files;
    }
  }
  
  class DocumentRequestQueue {
    private queue: (DocumentRequest)[] = [];
  
    push(
      doc: Document,
      action: Action,
      res: Response,
      uploadedFile?: UploadedFile
    ): void {
      const data: DocumentRequest = {
        fileName: doc.fileName,
        fileType: doc.fileType,
        path: doc.path,
        type: action,
        uploadedFile: uploadedFile ?? null,
        res,
      };
  
      this.queue.push(data);
  
      if (this.queue.length === 1) {
        this.process();
      }
    }
  
    private async process() {
      switch (this.queue[0].type) {
        case Action.UPDATE:
          await DocumentController.processImageUpload(
            this.queue[0] as DocumentRequest
          );
          break;
      }
      this.queue.splice(0, 1);
      if (this.queue.length > 0) this.process();
    }
  }