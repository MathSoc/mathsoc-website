import { Response } from 'express';

const fs = require('fs');
const Logger = require('./logger.js');

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

  static _processJSONReadQueue(requestData: RequestData): void {
    try {
      fs.readFile(`server/data/${requestData.fileName}.json`, (err: NodeJS.ErrnoException, data: Buffer) => {
        try {
          if (this._handleErrors(requestData.res, err)) return;

          this._readFile(data, requestData.res);
        } catch (e) {
          this.logger.warn(e);
          requestData.res.status(500).end();
        }
      });
    } catch (e) {
      this.logger.warn(e);
      requestData.res.status(500).end();
    }
  }

  private static _readFile(data: Buffer, res: Response): void {
    if (!data || data.length === 0) {
      res.status(204).end(); // success, no data
      return;
    }

    const parsedJson = JSON.parse(data.toString('utf-8'));
    res.json(parsedJson);

    res.status(200).end();
  }

  static overwriteJSONData(fileName: string, res: Response, newData: any[] | object): void {
    if (!this.queues[fileName]) {
      this.queues[fileName] = new RequestQueue();
    }

    this.queues[fileName].push(fileName, res, 'w', newData);
  }

  static _processJSONOverwriteQueue(requestData: RequestData): void {
    try {
      let writeData: string = this._getWriteData(requestData.body, requestData.res);

      fs.open(`server/data/${requestData.fileName}.json`,
        'r+',
        null,
        (err: NodeJS.ErrnoException) => {
          if (this._handleErrors(requestData.res, err)) return;

          fs.writeFile(
            `server/data/${requestData.fileName}.json`,
            writeData,
            { encoding: 'utf8', flag: 'w' },
            (err: NodeJS.ErrnoException) => {
              if (this._handleErrors(requestData.res, err)) return;

              requestData.res.status(200).end();
            }
          );
        }
      );
    } catch (e) {
      this.logger.warn(e);
      requestData.res.status(500).end();
    }
  }

  private static _getWriteData(requestBody: object | any[] | string, res: Response): string {
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
  private static _handleErrors(res: Response, err: NodeJS.ErrnoException) {
    if (err) {
      if (err.code === 'ENOENT') res.status(404).end();
      else res.status(500).end();
      this.logger.error(err);
      return true;
    }

    return false;
  }
}

class RequestQueue {
  private queue: RequestData[] = [];

  push(fileName: string, res: Response, type: 'r' | 'w', body?: object | any[]): void {
    if (this.queue.length === 0) {
      this.queue.push({ fileName: fileName, res: res, type: type, body: body });
      this.process();
    } else this.queue.push({ fileName: fileName, res: res, type: type, body: body });
  }

  private process(): void {
    if (this.queue[0].type === 'r')
      ReadWriteController._processJSONReadQueue(this.queue[0]);
    else if (this.queue[0].type === 'w')
      ReadWriteController._processJSONOverwriteQueue(this.queue[0]);
    else {
      ReadWriteController.logger.warn(new Error('Queued request has bad type'))
      this.queue[0].res.status(500).end();
    }

    this.queue.splice(0, 1);

    if (this.queue.length > 0)
      this.process();
  }
}
