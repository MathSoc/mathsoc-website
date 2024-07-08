// @todo: Autogenerate uploads folder if it doesn't exist on startup
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { Image, ImageWithFile } from "../../types/image";
import fs, {
  Dirent,
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from "fs";
import path from "path";
import { AbstractFileController } from "./util/file-controller";

type ImageUploadRequest = {
  images: ImageWithFile[];
  errors: string[];
  res: Response;
};

type ImageDeleteRequest = Image & {
  res: Response;
};

export class ImageController extends AbstractFileController<
  Image,
  ImageUploadRequest,
  ImageDeleteRequest
> {
  /*
  Handles the /api/image/upload endpoint 
  - handles all possible errors with the file upload (no file, no fileype, not recognized filetype)
  - if validation passes, adds the request with all uploaded files to the ImageRequestQueue
  */
  uploadFiles(req: Request, res: Response): void {
    try {
      const imageFiles = Array.isArray(req.files?.images)
        ? (req.files?.images as UploadedFile[])
        : [req.files?.images as UploadedFile];

      if (!imageFiles.length) {
        throw new Error("No images were uploaded");
      }

      const errors: string[] = [];
      const imagesWithSupportedFileData: ImageWithFile[] = [];

      for (const imageFile of imageFiles) {
        if (!imageFile.mimetype) {
          errors.push(
            `No mimetype/filetype provided with file ${imageFile.name}`
          );
          continue;
        }

        if (imageFile.mimetype.match(/(^image)(\/)[a-zA-Z0-9_]*/gm) === null) {
          errors.push(
            `Unsupported filetype for ${imageFile.name}. We only support image file types.`
          );
          continue;
        }

        const transformedImage: ImageWithFile = {
          fileName: imageFile.name,
          fileType: imageFile.name.split(".").slice(1).join("."),
          path: this.getFilePath(imageFile.name),
          publicLink: this.getPublicLink(imageFile.name),
          file: imageFile,
        };

        imagesWithSupportedFileData.push(transformedImage);
      }

      this.uploadQueue.push({
        images: imagesWithSupportedFileData,
        errors,
        res,
      });
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/image-store");
      return;
    }
  }

  /*
  Handles the /api/image/delete endpoint
  - checks that file was passed
  - checks that file exists
  - if validations pass, adds the delete request to the ImageRequestQueue
  */
  deleteFile(req: Request, res: Response): void {
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

      this.deleteQueue.push({ ...transformedImage, res });
    } catch (err) {
      this.logger.error(err.message);
      res.status(400).redirect("/admin/image-store");
      return;
    }
  }

  async processFileUpload(request: ImageUploadRequest): Promise<void> {
    const { images, errors, res } = request;

    try {
      for (const image of images) {
        if (existsSync(image.path)) {
          errors.push(`File ${image.fileName} already exists`);
          continue;
        }

        await image.file?.mv(image.path);
        this.logger.info(`${image.fileName} uploaded to ${image.path}`);
      }

      this.rewriteFileJson();
    } catch (err) {
      this.logger.error(err);
    }

    const urlSearchParams = new URLSearchParams();
    errors.forEach((item) => urlSearchParams.append("errors", item));
    res.status(201).send({
      status: "success",
      errors: errors,
      files: images.map((im) => im.fileName),
    });
  }

  processFileDelete(request: ImageDeleteRequest): void {
    const { path, res, fileName, publicLink } = request;
    try {
      const foundFiles = this.getImageOccurences("server/data", publicLink);
      if (foundFiles.length !== 0) {
        this.logger.error(`Delete path found in ${foundFiles}`);
        res.status(403).json({ status: "fail", message: foundFiles });
        return;
      }

      unlinkSync(path);
      this.logger.info(`${fileName} deleted from ${path}`);
      this.rewriteFileJson();
      res.status(200).json({ status: "success" });
    } catch (err) {
      this.logger.error(err);
      res.status(400).json({ status: "fail" });
    }
  }
  private getDataFiles(mainPath: string, target: string): string[] {
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

  /*
        Checks for occurence of an image in the server/data files, to make sure we aren't deleting an image that is in use on the frontend.
      */
  private getImageOccurences(mainPath: string, target: string) {
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

  generateJson(): Image[] {
    const uploadedFiles: Dirent[] = readdirSync(this.getFilePath(""), {
      withFileTypes: true,
    });

    const images: Image[] = [];

    for (const img of uploadedFiles) {
      if (img.isFile()) {
        images.push({
          fileName: img.name,
          fileType: img.name.split(".").slice(1).join("."),
          path: this.getFilePath(img.name),
          publicLink: this.getPublicLink(img.name),
        });
      }
    }

    return images;
  }
}
