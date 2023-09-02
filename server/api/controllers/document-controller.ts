import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Document, DocumentWithFile } from "../../types/document";
import { Dirent, existsSync, readdirSync } from "fs";
import { AbstractFileController } from "./util/file-controller";

const AllowedDocumentMimeTypes = ["application/pdf"];

type DocumentUploadRequest = {
  docs: DocumentWithFile[];
  errors: string[];
  res: Response;
};

type DocumentDeleteRequest = Document & {
  res: Response;
};

export class DocumentController extends AbstractFileController<
  Document,
  DocumentUploadRequest,
  DocumentDeleteRequest
> {
  uploadFiles(req: Request, res: Response): void {
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
          path: this.getFilePath(docFile.name),
          publicLink: this.getPublicLink(docFile.name),
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

  deleteFile(req: Request, res: Response): void {
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

  async processFileUpload(request: DocumentUploadRequest): Promise<void> {
    const { docs, errors, res } = request;

    try {
      for (const doc of docs) {
        await doc.file?.mv(doc.path);
        this.logger.info(`${doc.fileName} uploaded to ${doc.path}`);
      }

      this.rewriteFileJson();
    } catch (err) {
      this.logger.error(err);
    }

    const urlSearchParams = new URLSearchParams();
    errors.forEach((item) => urlSearchParams.append("errors", item));
    res.send({ status: "success", errors: errors });
  }

  generateJson(): Document[] {
    const uploadedFiles: Dirent[] = readdirSync(this.getFilePath(""), {
      withFileTypes: true,
    });

    const documents: Document[] = [];

    for (const doc of uploadedFiles) {
      if (doc.isFile()) {
        documents.push({
          fileName: doc.name,
          fileType: doc.name.split(".").slice(1).join("."),
          path: this.getFilePath(doc.name),
          publicLink: this.getPublicLink(doc.name),
        });
      }
    }

    return documents;
  }
}
