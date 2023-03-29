import { UploadedFile } from "express-fileupload";

export type Document = {
    fileName: string;
    fileType: string;
    path: string;
    date: string;
}

export type DocumentWithFile = Document & {file: UploadedFile };