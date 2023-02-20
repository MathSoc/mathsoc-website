import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Logger } from "../../util/logger";
import { Image } from "../../types/image";
import {
  Dirent,
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from "fs";
import { ReadWriteController } from "./read-write-controller";
import path from "path";

enum Action {
  UPLOAD,
  DELETE,
}

type ImageRequest = Image & {
  res: Response;
};

type ImageUploadRequest = ImageRequest & {
  type: Action.UPLOAD;
  uploadedFile: UploadedFile | null;
};

type ImageDeleteRequest = ImageRequest & {
  type: Action.DELETE;
};

export class ImageController {
  static logger = new Logger();
  private static queues: Record<string, ImageRequestQueue> = {};

  static uploadImage(req: Request, res: Response) {
    try {
      const image = req.files?.image as UploadedFile;

      if (!image) {
        throw new Error("No image was uploaded");
      }

      if (!image.mimetype) {
        throw new Error("No mimetype/filetype provided with the image.");
      }

      const transformedImage: Image = {
        fileName: image.name,
        fileType: image.name.split(".")[1],
        path: this.getImagePath(image.name),
        publicLink: this.getPublicLink(image.name),
      };

      if (!this.queues[transformedImage.fileName]) {
        this.queues[transformedImage.fileName] = new ImageRequestQueue();
      }

      this.queues[transformedImage.fileName].push(
        transformedImage,
        Action.UPLOAD,
        res,
        image
      );
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/image-store");
      return;
    }
  }

  static deleteImage(req: Request, res: Response) {
    try {
      const { fileName, fileType, path, publicLink } = req.body;

      if (!path) {
        throw new Error("File path not provided with delete request");
      }

      if (!existsSync(path)) {
        throw new Error("Faulty file path provided with delete request");
      }

      const transformedImage: Image = {
        fileName,
        fileType,
        path,
        publicLink,
      };

      if (!this.queues[transformedImage.fileName]) {
        this.queues[transformedImage.fileName] = new ImageRequestQueue();
      }

      this.queues[transformedImage.fileName].push(
        transformedImage,
        Action.DELETE,
        res
      );
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/image-store");
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

  static processImageDelete(request: ImageDeleteRequest) {
    const { path, res, fileName, publicLink } = request;
    try {
      const foundFiles = this.checkImageOccurences("server/data", publicLink);
      if (foundFiles.length !== 0) {
        this.logger.error(`Delete path found in ${foundFiles}`);
        res.status(403).json({ status: "fail", message: foundFiles });
        return;
      }

      unlinkSync(path);
      this.logger.info(`${fileName} deleted from ${path}`);
      this.rewriteImageJson();
      res.status(200).json({ status: "success" });
    } catch (err) {
      this.logger.error(err);
      res.status(400).json({ status: "fail" });
    }
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

  private static checkImageOccurences(mainPath: string, target: string) {
    const files = this.getDataFiles(mainPath, target);
    const matches: string[] = [];
    for (const file of files) {
      const fileContent = readFileSync(file);
      if (fileContent.includes(target)) {
        matches.push(file);
      }
    }

    return matches;
  }
}

class ImageRequestQueue {
  private queue: (ImageUploadRequest | ImageDeleteRequest)[] = [];

  push(
    img: Image,
    action: Action,
    res: Response,
    uploadedFile?: UploadedFile
  ): void {
    const data: ImageUploadRequest | ImageDeleteRequest = {
      fileName: img.fileName,
      fileType: img.fileType,
      path: img.path,
      publicLink: img.publicLink,
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
      case Action.UPLOAD:
        await ImageController.processImageUpload(
          this.queue[0] as ImageUploadRequest
        );
        break;
      case Action.DELETE:
        ImageController.processImageDelete(this.queue[0] as ImageDeleteRequest);
        break;
    }
    this.queue.splice(0, 1);
    if (this.queue.length > 0) this.process();
  }
}
