import { UploadedFile } from "express-fileupload";

export type Image = {
  fileName: string;
  path: string;
  publicLink: string;
  fileType: string;
};

export type ImageWithFile = Image & { uploadedFile: UploadedFile };
