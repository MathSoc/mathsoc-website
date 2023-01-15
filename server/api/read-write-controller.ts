import { Response } from 'express';
import fs, { readlink } from 'fs';

import { Logger } from './logger';

type RequestData = {
  fileName: string,
  body?: object | any[]
  res: Response,
  type: 'r' | 'w'
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

  static async processReadEntry(requestData: RequestData): Promise<void> {
    const fail = (e: Error, reject: (reason?: any) => void) => {
      this.logger.warn(e);
      requestData.res.status(500).end();
      reject();
    }

    const promise = new Promise((resolve, reject) => {
      try {
        fs.readFile(`server/data/${requestData.fileName}.json`, (err: NodeJS.ErrnoException, data: Buffer) => {
          if (this.handleErrors(requestData.res, err)) {
            reject();
            return;
          };

          try {
            this.readFile(data, requestData.res);
          } catch (e) {
            fail(e, reject);
          }

          resolve(null);
        });
      } catch (e) {
        fail(e, reject);
      }
    });

    await promise;
  }

  private static readFile(data: Buffer, res: Response): void {
    if (!data || data.length === 0) {
      res.status(204).end(); // success, no data
      return;
    }

    const parsedJson = JSON.parse(data.toString('utf-8'));
    res.json(parsedJson);

    res.status(200).end();
  }

  static async processWriteEntry(data: RequestData): Promise<void> {
    const promise = new Promise((resolve, reject) => {
      try {
        let writeData: string = this.getWriteData(data.body, data.res);

        // Want to first ensure the file exists, then write to it
        if (!fs.existsSync(`server/data/${data.fileName}.json`)) {
          data.res.status(404).end();
        }

        fs.writeFile(
          `server/data/${data.fileName}.json`,
          writeData,
          { encoding: 'utf8', flag: 'w' },
          (err: NodeJS.ErrnoException) => {
            if (this.handleErrors(data.res, err)) return;

            data.res.status(200).end(); // if no errors, return 200: SUCCESS
            resolve(null);
          }
        );
      } catch (e) {
        this.logger.warn(e);
        data.res.status(500).end();
        reject(e);
      }
    });

    await promise;
  }

  private static getWriteData(requestBody: object | any[] | string, res: Response): string {
    try {
      return typeof requestBody === "object" // 'object' includes arrays
        ? JSON.stringify(requestBody)
        : requestBody;
    } catch (e) {
      res.status(400).end(); // probably can't read body
      return null;
    }
  }

  /** Returns true if an error is encountered */
  private static handleErrors(res: Response, err: NodeJS.ErrnoException) {
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
    const data: RequestData = { fileName, res, type, body };

    this.queue.push(data);

    if (this.queue.length === 1) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    switch (this.queue[0].type) {
      case 'r':
        await ReadWriteController.processReadEntry(this.queue[0]);
        break;
      case 'w':
        await ReadWriteController.processWriteEntry(this.queue[0]);
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
