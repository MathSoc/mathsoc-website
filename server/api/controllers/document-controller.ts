import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Logger } from "../../util/logger";
import { ReadWriteController } from "./read-write-controller";
import { ProcessQueue } from "./util/process-queue";
import { Document, DocumentWithFile } from "../../types/document";
import { Dirent, existsSync, readdirSync, unlinkSync, writeFileSync } from "fs";

const AllowedDocumentMimeTypes = ["application/pdf"];

type DocumentUploadRequest = {
  docs: DocumentWithFile[];
  errors: string[];
  res: Response;
};

type DocumentDeleteRequest = Document & {
  res: Response;
};

export class DocumentController {
  static logger = new Logger();
  private static uploadQueue = new ProcessQueue(
    this.processDocumentUpload.bind(this)
  );
  private static deleteQueue = new ProcessQueue(
    this.processDocumentDelete.bind(this)
  );

  static uploadDocuments(req: Request, res: Response) {
    try {
      const docs = Array.isArray(req.files?.documents)
        ? (req.files?.documents as UploadedFile[])
        : [req.files?.documents as UploadedFile];

      const errors: string[] = [];
      const documentsWithFileData: DocumentWithFile[] = [];

      for (const docFile of docs) {
        if (!docFile.mimetype) {
          errors.push(
            `No mimetype/filetype provided with file ${docFile.name}`
          );
          continue;
        }

        if (!AllowedDocumentMimeTypes.includes(docFile.mimetype)) {
          errors.push(
            `Unsupposed file type for ${docFile.name}. We only support pdfs.`
          );
          continue;
        }

        const transformedDoc: DocumentWithFile = {
          fileName: docFile.name,
          fileType: docFile.name.split(".").slice(1).join("."),
          path: this.getDocumentPath(docFile.name),
          publicLink: this.getDocumentPublicLink(docFile.name),
          file: docFile,
        };

        documentsWithFileData.push(transformedDoc);
      }

      // add to upload queue
      this.uploadQueue.push({
        docs: documentsWithFileData,
        errors,
        res,
      });
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/documents");
      return;
    }
  }

  static deleteDocument(req: Request, res: Response) {
    try {
      const { fileName, fileType, path, publicLink } = req.body;

      if (!path) {
        throw new Error("File path not provided with delete request");
      }

      if (!existsSync(path)) {
        throw new Error("Faulty file path provided with delete request");
      }

      const transformedDoc: Document = {
        fileName,
        fileType,
        path,
        publicLink,
      };

      // add to delete queue
      this.deleteQueue.push({ ...transformedDoc, res });
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/image-store");
      return;
    }
  }

  static async processDocumentUpload(request: DocumentUploadRequest) {
    const { docs, errors, res } = request;

    try {
      for (const doc of docs) {
        await doc.file?.mv(doc.path);
        this.logger.info(`${doc.fileName} uploaded to ${doc.path}`);
      }

      this.rewriteDocumentJson();
    } catch (err) {
      this.logger.error(err);
    }

    const urlSearchParams = new URLSearchParams();
    errors.forEach((item) => urlSearchParams.append("errors", item));
    res.send({ status: "success", errors: errors });
  }

  static async processDocumentDelete(request: DocumentDeleteRequest) {
    const { path, res, fileName } = request;
    try {
      unlinkSync(path);
      this.logger.info(`${fileName} deleted from ${path}`);
      this.rewriteDocumentJson();
      res.status(200).json({ status: "success" });
    } catch (err) {
      this.logger.error(err);
      res.status(400).json({ status: "fail" });
    }
  }

  private static generateJson(): Document[] {
    const uploadedFiles: Dirent[] = readdirSync(this.getDocumentPath(""), {
      withFileTypes: true,
    });

    const documents: Document[] = [];

    for (const doc of uploadedFiles) {
      if (doc.isFile()) {
        documents.push({
          fileName: doc.name,
          fileType: doc.name.split(".").slice(1).join("."),
          path: this.getDocumentPath(doc.name),
          publicLink: this.getDocumentPublicLink(doc.name),
        });
      }
    }

    return documents;
  }

  private static rewriteDocumentJson(): void {
    const url = "_hidden/document-list";
    const fullPath = `server/data/${url}.json`;

    if (!existsSync(fullPath)) {
      writeFileSync(fullPath, "");
    }

    ReadWriteController.overwriteJSONDataPath(
      url,
      (statusCode: number) => {
        switch (statusCode) {
          case 400:
            this.logger.error(`Bad request made`);
            break;
          case 403:
            this.logger.error(`Forbidden`);
            break;
          case 404:
            this.logger.error(`${url} not found`);
            break;
          default:
            if (statusCode.toString()[0] === "2") {
              // 2XX success codes
              this.logger.info("Document file rewritten");
              break;
            } else {
              this.logger.warn("Unexpected document file rewrite result");
            }
        }
      },
      this.generateJson()
    );
    this.logger.info("Document list regenerated.");
  }

  private static getDocumentPath(fileName: string) {
    return `public/assets/documents/${fileName}`;
  }

  private static getDocumentPublicLink(fileName: string) {
    return `/assets/documents/${fileName}`;
  }
}
