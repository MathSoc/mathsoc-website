import { UploadedFile } from "express-fileupload";

export type Document = {
    fileName: string;
    fileType: string;
    path: string;
    publicLink: string
}

export type DocumentWithFile = Document & {file: UploadedFile };