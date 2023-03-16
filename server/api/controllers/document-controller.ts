import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import {
    Dirent,
    readdirSync,
    unlinkSync,
    existsSync,
    writeFileSync,
    mkdirSync,
  } from "fs";
import { Document, DocumentWithFile } from "../../types/document";
import { Logger } from "../../util/logger";
import { ReadWriteAPIController } from "./read-write-api-controller";
import { ReadWriteController } from "./read-write-controller";
import { ProcessQueue } from "./util/process-queue";

type DocumentUploadRequest = Document & {
  documents: DocumentWithFile[],
  documentJSONPathEndPoint: string,
  errors: string[];
  res: Response;
  path: string;
}

type DocumentDeleteRequest = Document & {
  fileName: string,
  documentJSONPathEndPoint: string,
  errors: string[];
  res: Response;
}

const AllowedDocumentMimeTypes = ['application/pdf']

export class DocumentController {
    static logger = new Logger();
    private static uploadQueue = new ProcessQueue(this.processDocumentUpload.bind(this));
    private static deleteQueue = new ProcessQueue(this.processDocumentDelete.bind(this));

    /*
      Handles the GET /api/documents endpoint
    */
    static getDocument(req: Request, res: Response) {
      ReadWriteAPIController.
      getJSONDataPath(`_hidden/document-list/${req.headers.documentgroup}/${req.headers.documentname}`, res);
    }

    /*
    Handles the POST /api/document/upload endpoint 
    - handles all possible errors with the file upload (no file, no fileype, not recognized filetype)
    - if validation passes, adds the request with all uploaded files to the ImageRequestQueue
    */
    static uploadDocument(req: Request, res: Response) {
      try {
        const { documentGroup, documentName } = req.body;
  
        const documentFiles = Array.isArray(req.files?.documents)
          ? (req.files?.documents as UploadedFile[])
          : [req.files?.documents as UploadedFile];
  
        if (!documentFiles.length) {
          throw new Error("No documents were uploaded");
        }
  
        const errors: string[] = [];
        const documentsWithSupportedFileData: DocumentWithFile[] = [];
        const documentJSONPathEndPoint =  `${documentGroup}/${documentName}`;
  
        for (const documentFile of documentFiles) {
          if (!documentFile.mimetype) {
            errors.push(`No mimetype/filetype provided with file ${documentFile[0].name}`);
          }
  
          if ( !AllowedDocumentMimeTypes.includes(documentFile.mimetype) ) {
            errors.push(`Unsupported filetype for ${documentFile.name}. We only support pdf file types.`);
          }
          
          const transformedDocument: DocumentWithFile = {
            fileName: documentFile.name,
            fileType: documentFile.name.split(".")[1],
            path: this.getDocumentPath(`${documentJSONPathEndPoint}`),
            file: documentFile,
            date: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
          };
  
          documentsWithSupportedFileData.push(transformedDocument);
        }
  
        this.uploadQueue.push({
          documents: documentsWithSupportedFileData,
          documentJSONPathEndPoint: documentJSONPathEndPoint,
          errors,
          res,
          path: this.getDocumentPath(documentJSONPathEndPoint)
        });
      } catch (err) {
        this.logger.error(err.message);
        res.status(400).redirect("/admin/documents");
        return;
      }
    }

    /*
    Handles the DELETE /api/document/delete endpoint
    - checks that file was passed
    - checks that file exists
    - if validations pass, adds the delete request to the ImageRequestQueue
    */
    static deleteDocument(req: Request, res: Response, update: boolean = false) {
      try {
        const { fileName, fileType, path, date } = req.body;
  
        if (!path) {
          throw new Error("File path not provided with delete request");
        }
        if (!existsSync(path)) {
          throw new Error("Faulty file path provided with delete request");
        }
        
        const transformedDocument: Document = {
          fileName,
          fileType,
          path,
          date
        };

        const splitPath = path.split('/')
        const documentJSONPathEndPoint = `${splitPath[splitPath.length-3]}/${splitPath[splitPath.length-2]}`
        
        this.deleteQueue.push({ ...transformedDocument, res,
          documentJSONPathEndPoint: documentJSONPathEndPoint,
          update: update})
      } catch (err) {
        this.logger.error(err.message);
        res.status(400).redirect("/admin/documents");
        return;
      }
    }

    /*
      First checks if the path /public/assets/documents/{documentGroup}/documentName exists.
      If doesn't then it creates it.
      Then it uploads the file to the path and rewrites the json file.
    */
    static async processDocumentUpload(request: DocumentUploadRequest) {
      const { documents, errors, res, path, documentJSONPathEndPoint } = request;

      try {
        for(const document of documents){

          if (!existsSync(path)) {
            mkdirSync(path, {recursive: true});
          }
          await document.file?.mv(`${path}/${document.fileName}`);
          this.logger.info(`${document.fileName} uploaded to ${path}`);
        }
  
        this.rewriteDocumentJson(documentJSONPathEndPoint);
      } catch (err) {
        this.logger.error(err);
      }
      const urlSearchParams = new URLSearchParams();
      errors.forEach((item) => urlSearchParams.append("errors", item));
      res.send({ status: "success", errors: errors });
    }

    /*
      Delete the image from the given path and updates the json file.
    */
    static async processDocumentDelete(request: DocumentDeleteRequest) {
      const { fileName, path, res, documentJSONPathEndPoint } = request;
      try {
        unlinkSync(path);
        this.logger.info(`${fileName} deleted from ${path}`);
        this.rewriteDocumentJson(documentJSONPathEndPoint);
        res.status(200).json({ status: "success" });
      } catch (err) {
        this.logger.error(err);
        res.status(400).json({ status: "fail" });
      }
    }
  
    private static generateJSON(jsonEndPath): Document[] {
      const splitPath = jsonEndPath.split('/')
      const url = "_hidden/document-list/" + jsonEndPath;
      const fullPath = `server/data/${url}.json`;

      if (!existsSync(fullPath)) {
        mkdirSync(`server/data/_hidden/document-list/${splitPath[0]}`, {recursive: true});
        writeFileSync(fullPath, "[]");
      }

      const uploadedFiles: Dirent[] = readdirSync(this.getDocumentPath(jsonEndPath), {
        withFileTypes: true,
      });

      let jsonStructure: Document[] = [];

      ReadWriteController.getJSONDataPath(
        url,
        (responseCode: number, responseBody: any) => {
          jsonStructure = responseBody;
        }
      );
  
      const documents: Document[] = [];
  
      for (const document of uploadedFiles) {
        if (document.isFile()) {
          documents.push({
            fileName: document.name,
            fileType: document.name.split(".")[1],
            path: this.getDocumentPath(`${jsonEndPath}/${document.name}`),
            date: this.findDate(jsonStructure, document.name)
          });
        }
      }
      return documents;
    }

    private static findDate(jsonStructure, fileName): string {
      let fileDate;

      for(const doc of jsonStructure){
        if(doc.fileName == fileName){
          fileDate = doc.date;
          return fileDate;
        }
      }
      return new Date().toJSON().slice(0,10).replace(/-/g,'/');
    }
  
    /*
      Updates the json file with the changes made.
    */
    private static rewriteDocumentJson(path): void {
      const url = "_hidden/document-list/" + path;
      ReadWriteController.overwriteJSONDataPath(
        url,
        () => {
          return;
        },
        this.generateJSON(path)
      );
      this.logger.info("Document list regenerated.");
    }
  
    private static getDocumentPath(documentJSONPathEndPoint: string) {
      return `public/assets/documents/${documentJSONPathEndPoint}`;
    }
  }