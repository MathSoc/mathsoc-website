import fs from "fs";

import { Logger } from "../../util/logger";
import { MultiTypeProcessQueue } from "./util/multi-type-process-queue";

enum ReadWrite {
  READ = "READ",
  WRITE = "WRITE",
}

type RequestCallback = (responseCode: number, responseBody?: string) => any;

type RequestData = {
  fileName: string;
  callback: RequestCallback;
  body?: any;
};

export class ReadWriteController {
  static queues: {
    [key: string]: MultiTypeProcessQueue<ReadWrite, RequestData>;
  } = {};

  static queueOptions = {
    READ: ReadWriteController.processReadEntry.bind(this),
    WRITE: ReadWriteController.processWriteEntry.bind(this),
  };

  static logger = new Logger();

  static getJSONDataPath(filePath: string, callback: RequestCallback) {
    if (!filePath) {
      throw new Error("No file path given to getJSONDataPath");
    }

    if (!this.queues[filePath]) {
      this.queues[filePath] = new MultiTypeProcessQueue<ReadWrite, RequestData>(
        this.queueOptions
      );
    }

    this.queues[filePath].push(
      {
        fileName: filePath,
        callback,
      },
      ReadWrite.READ
    );
  }

  static overwriteJSONDataPath(
    filePath: string,
    callback: RequestCallback,
    newBody: any[] | object
  ) {
    if (!filePath) {
      throw new Error("No file path given to overwriteJSONDataPath");
    }

    if (!this.queues[filePath]) {
      this.queues[filePath] = new MultiTypeProcessQueue<ReadWrite, RequestData>(
        this.queueOptions
      );
    }

    this.queues[filePath].push(
      { fileName: filePath, callback, body: newBody },
      ReadWrite.WRITE
    );
  }

  private static async processReadEntry(data: RequestData): Promise<void> {
    const promise = new Promise((resolve) => {
      const terminateWith = (code: number, body?: any) => {
        data.callback(code, body);
        resolve(code);
      };

      try {
        fs.readFile(
          `server/data/${data.fileName}.json`,
          (err: NodeJS.ErrnoException | null, readData: Buffer) => {
            // If any errors immediately occur, handle them
            if (ReadWriteController.handleErrors(err)) {
              resolve(null);
              return;
            }

            // If no content, return 204 code
            if (!readData || readData.length === 0) {
              terminateWith(204);
              return;
            }

            // Parse the file as JSON and return it
            try {
              const parsedJSON = JSON.parse(readData.toString("utf-8"));

              terminateWith(200, parsedJSON);
            } catch (e) {
              ReadWriteController.logger.error(e);
              terminateWith(500);
            }
          }
        );
      } catch (e) {
        ReadWriteController.logger.error(e);
        terminateWith(500);
      }
    });

    await promise;
  }

  private static async processWriteEntry(data: RequestData): Promise<void> {
    const promise = new Promise((resolve) => {
      const terminateWith = (code: number) => {
        data.callback(code);
        resolve(code);
      };

      let writeData: string;

      // First need to get the written data as a string
      try {
        writeData = ReadWriteController.getWriteData(data.body);
      } catch (e) {
        terminateWith(400);
        return;
      }

      // Want to first ensure the file exists before writing to it
      if (!fs.existsSync(`server/data/${data.fileName}.json`)) {
        this.logger.error(
          `Attempted write to server/data/${data.fileName}.json failed; file not found. Try creating the file first!`
        );
        terminateWith(404);
        return;
      }

      fs.writeFile(
        `server/data/${data.fileName}.json`,
        writeData,
        { encoding: "utf8", flag: "w" },
        (err: NodeJS.ErrnoException | null) => {
          if (ReadWriteController.handleErrors(err)) return;

          terminateWith(err?.code ? parseInt(err.code) : 201);
        }
      );
    });

    await promise;
  }

  private static getWriteData(requestBody?: object | any[] | string): string {
    const type = typeof requestBody;

    switch (type) {
      case "object":
        return JSON.stringify(requestBody);
      case "string":
        return requestBody as string;
      default:
        throw new Error("Bad requestBody");
    }
  }

  /** Returns true if an error is encountered */
  private static handleErrors(err: NodeJS.ErrnoException | null) {
    if (err) {
      this.logger.error(err.message);
      return true;
    }

    return false;
  }
}
