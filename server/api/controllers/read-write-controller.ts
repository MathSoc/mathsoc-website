import fs from "fs";

import { Logger } from "../../util/logger";

enum ReadWrite {
  READ = "r",
  WRITE = "w",
}

type RequestCallback = (responseCode: number, responseBody?: string) => any;

type RequestData = {
  fileName: string;
  type: ReadWrite;
  callback: RequestCallback;
};

type ReadRequestData = RequestData & {
  type: ReadWrite.READ;
};

type WriteRequestData = RequestData & {
  body: any;
  type: ReadWrite.WRITE;
};

export class ReadWriteController {
  static queues: Record<string, RequestQueue> = {};
  static logger = new Logger();

  static getJSONDataPath(filePath: string, callback: RequestCallback) {
    if (!filePath) {
      throw new Error("No file path given to getJSONDataPath");
    }

    if (!this.queues[filePath]) {
      this.queues[filePath] = new RequestQueue();
    }

    this.queues[filePath].push(filePath, ReadWrite.READ, callback);
  }

  static overwriteJSONDataPath(
    filePath: string,
    callback: RequestCallback,
    newData: any[] | object
  ) {
    if (!filePath) {
      throw new Error("No file path given to overwriteJSONDataPath");
    }

    if (!this.queues[filePath]) {
      this.queues[filePath] = new RequestQueue();
    }

    this.queues[filePath].push(filePath, ReadWrite.WRITE, callback, newData);
  }

  static async processReadEntry(data: ReadRequestData): Promise<void> {
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
            if (this.handleErrors(err)) {
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
              this.logger.error(e);
              terminateWith(500);
            }
          }
        );
      } catch (e) {
        this.logger.error(e);
        terminateWith(500);
      }
    });

    await promise;
  }

  static async processWriteEntry(data: WriteRequestData): Promise<void> {
    const promise = new Promise((resolve) => {
      const terminateWith = (code: number) => {
        data.callback(code);
        resolve(code);
      };

      let writeData: string;

      // First need to get the written data as a string
      try {
        writeData = this.getWriteData(data.body);
      } catch (e) {
        terminateWith(400);
        return;
      }

      // Want to first ensure the file exists before writing to it
      if (!fs.existsSync(`server/data/${data.fileName}.json`)) {
        terminateWith(404);
        return;
      }

      fs.writeFile(
        `server/data/${data.fileName}.json`,
        writeData,
        { encoding: "utf8", flag: ReadWrite.WRITE },
        (err: NodeJS.ErrnoException | null) => {
          if (this.handleErrors(err)) return;

          terminateWith(200);
        }
      );
    });

    await promise;
  }

  private static getWriteData(requestBody: object | any[] | string): string {
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

class RequestQueue {
  private queue: (ReadRequestData | WriteRequestData)[] = [];

  push(
    fileName: string,
    type: ReadWrite,
    callback: RequestCallback,
    body?: any
  ): void {
    const data: ReadRequestData | WriteRequestData = {
      fileName,
      type,
      callback,
      body: body,
    };

    this.queue.push(data);

    if (this.queue.length === 1) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    switch (this.queue[0].type) {
      case ReadWrite.READ:
        await ReadWriteController.processReadEntry(
          this.queue[0] as ReadRequestData
        );
        break;
      case ReadWrite.WRITE:
        await ReadWriteController.processWriteEntry(
          this.queue[0] as WriteRequestData
        );
        break;
    }

    this.queue.splice(0, 1);

    if (this.queue.length > 0) this.process();
  }
}
