import { Response } from 'express';
import fs, { read } from 'fs';

import { Logger } from './logger';

type RequestData = {
  fileName: string,
  res: Response,
  type: 'r' | 'w'
  body?: object | any[] | string
}

type ReadRequestData = RequestData & {
  type: 'r'
}

type WriteRequestData = RequestData & {
  body: object | any[] | string
  type: 'w'
}

export class ReadWriteController {
  static queues: Record<string, RequestQueue> = {};
  static logger = new Logger();

  static getJSONData(fileName: string, res: Response): void {
    if (!this.queues[fileName]) {
      this.queues[fileName] = new RequestQueue();
    }

    this.queues[fileName].push(fileName, res, 'r');
  }

  static overwriteJSONData(fileName: string, res: Response, newData: any[] | object): void {
    if (!this.queues[fileName]) {
      this.queues[fileName] = new RequestQueue();
    }

    this.queues[fileName].push(fileName, res, 'w', newData);
  }

  static async processReadEntry(requestData: ReadRequestData): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      const terminateWith = (code: number) => {
        requestData.res.status(code).end();
        resolve(code);
      }

      try {
        fs.readFile(`server/data/${requestData.fileName}.json`, (err: NodeJS.ErrnoException | null, readData: Buffer) => {
          // If any errors immediately occur, handle them
          if (this.handleErrors(requestData.res, err)) {
            resolve(null);
            return;
          };

          // If no content, return 204 code
          if (!readData || readData.length === 0) {
            terminateWith(204);
            return;
          } 
          
          // Parse the file as JSON and return it
          try {
            const parsedJSON = JSON.parse(readData.toString('utf-8'));
            requestData.res.json(parsedJSON);
        
            terminateWith(200);
          } catch (e) {
            this.logger.error(e);
            terminateWith(500);
          }
        });
      } catch (e) {
        this.logger.error(e);
        terminateWith(500);
      }
    });

    await promise;
  }

  static async processWriteEntry(data: WriteRequestData): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      const terminateWith = (code: number) => {
        data.res.status(code).end();
        resolve(code);
      }

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
        { encoding: 'utf8', flag: 'w' },
        (err: NodeJS.ErrnoException | null) => {
          if (this.handleErrors(data.res, err)) return;

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
        throw new Error('Bad requestBody');
    }
  }

  /** Returns true if an error is encountered */
  private static handleErrors(res: Response, err: NodeJS.ErrnoException | null) {
    if (err) {
      if (err.code === 'ENOENT') res.status(404).end();
      else res.status(500).end();
      this.logger.error(err.message);
      return true;
    }

    return false;
  }
}

class RequestQueue {
  private queue: RequestData[] = [];

  push(fileName: string, res: Response, type: 'r' | 'w', body?: object | any[]): void {
    const data: RequestData = { fileName, res, type, body: body };

    this.queue.push(data);

    if (this.queue.length === 1) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    switch (this.queue[0].type) {
      case 'r':
        await ReadWriteController.processReadEntry(this.queue[0] as ReadRequestData);
        break;
      case 'w':
        await ReadWriteController.processWriteEntry(this.queue[0] as WriteRequestData);
        break;
      default:
        ReadWriteController.logger.warn('Queued request has bad type');
        this.queue[0].res.status(500).end();
    }

    this.queue.splice(0, 1);

    if (this.queue.length > 0)
      this.process();
  }
}
