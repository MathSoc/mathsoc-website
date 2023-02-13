import { Response } from "express";

import { Logger } from "../../util/logger";
import { ReadWriteController } from "./read-write-controller";

export class ReadWriteAPIController {
  static logger = new Logger();

  static getJSONDataPath(filePath: string, response: Response) {
    ReadWriteController.getJSONDataPath(
      filePath,
      (responseCode: number, responseBody: any) => {
        response.json(responseBody).status(responseCode).end();
      }
    );
  }

  static overwriteJSONDataPath(
    filePath: string,
    response: Response,
    newData: any
  ) {
    ReadWriteController.overwriteJSONDataPath(
      filePath,
      (responseCode: number) => {
        response.status(responseCode).end();
      },
      newData
    );
  }
}
