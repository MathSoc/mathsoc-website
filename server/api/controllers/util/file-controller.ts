import { Request, Response } from "express";
import { Logger } from "../../../util/logger";
import { ProcessQueue } from "./process-queue";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { ReadWriteController } from "../read-write-controller";

export interface FileControllerInterface<UploadRequestType, DeleteRequestType> {
  uploadFiles(req: Request, res: Response): void;
  deleteFile(req: Request, res: Response): void;
  processFileUpload(request: UploadRequestType): void;
  processFileDelete(request: DeleteRequestType): void;
}

export abstract class AbstractFileController<
  FileType,
  UploadRequestType,
  DeleteRequestType
> implements FileControllerInterface<UploadRequestType, DeleteRequestType>
{
  protected publicPath;
  protected publicLink;
  protected dataUrl;

  protected logger = new Logger();
  protected uploadQueue;
  protected deleteQueue;

  constructor(publicPath: string, publicLink: string, dataUrl: string) {
    this.publicPath = publicPath;
    this.publicLink = publicLink;
    this.dataUrl = dataUrl;

    this.uploadQueue = new ProcessQueue(this.processFileUpload.bind(this));
    this.deleteQueue = new ProcessQueue(this.processFileDelete.bind(this));
  }

  abstract uploadFiles(req: Request, res: Response): void;

  abstract processFileUpload(request: UploadRequestType): void;

  processFileDelete(request: DeleteRequestType): void {
    const { path, res, fileName } = request as {
      path: string;
      res: Response;
      fileName: string;
    };

    try {
      unlinkSync(path);
      this.logger.info(`${fileName} deleted from ${path}`);
      this.rewriteFileJson();
      res.status(200).json({ status: "success" });
    } catch (err) {
      this.logger.error(err);
      res.status(400).json({ status: "fail" });
    }
  }

  abstract deleteFile(req: Request, res: Response): void;

  abstract generateJson(): FileType[] | Promise<FileType[]>;

  getFilePath(fileName: string) {
    return `${this.publicPath}/${fileName}`;
  }

  getPublicLink(fileName: string) {
    return `${this.publicLink}/${fileName}`;
  }

  rewriteFileJson(): void {
    const fullPath = `server/data/${this.dataUrl}.json`;

    if (!existsSync(fullPath)) {
      writeFileSync(fullPath, "");
    }

    ReadWriteController.overwriteJSONDataPath(
      this.dataUrl,
      (statusCode: number) => {
        switch (statusCode) {
          case 400:
            this.logger.error(`Bad request made`);
            break;
          case 403:
            this.logger.error(`Forbidden`);
            break;
          case 404:
            this.logger.error(`${this.dataUrl} not found`);
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
  }
}
