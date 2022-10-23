const fs = require('fs');
const Logger = require('./logger.js');

class RequestHandler {
  static queues = {};

  static getJSONData(req, res) {
    if (!this.queues[req.params.fileName]) {
      this.queues[req.params.fileName] = new RequestQueue();
    }

    this.queues[req.params.fileName].push(req, res, 'r');
  }

  static overwriteJSONData(req, res) {
    if (!this.queues[req.params.fileName]) {
      this.queues[req.params.fileName] = new RequestQueue();
    }

    this.queues[req.params.fileName].push(req, res, 'w');
  }

  static _processJSONReadQueue(requestData) {
    try {
      fs.readFile(`server/data/${requestData.req.params.fileName}.json`, (err, data) => {
        try {
          if (this._handleErrors(requestData.res, err)) return;

          if (!data || data.length === 0) {
            requestData.res.status(204).end(); // success, no data
            return;
          }

          const parsedJson = JSON.parse(data.toString('utf-8'));
          requestData.res.json(parsedJson);

          requestData.res.status(200).end();
        } catch (e) {
          Logger.warn(e);
          requestData.res.status(500).end();
        }
      });
    } catch (e) {
      Logger.warn(e);
      requestData.res.status(500).end();
    }
  }

  static _processJSONOverwriteQueue(requestData) {
    try {
      let writeData;

      try {
        writeData = typeof requestData.req.body === "object"
          ? JSON.stringify(requestData.req.body)
          : requestData.req.body;
      } catch (e) {
        requestData.res.status(400).end(); // bad input (probably cannot parse to JSON)
      }

      fs.open(`server/data/${requestData.req.params.fileName}.json`,
        'r+',
        null,
        (err) => {
          if (this._handleErrors(requestData.res, err)) return;

          fs.writeFile(
            `server/data/${requestData.req.params.fileName}.json`,
            writeData,
            { encoding: 'utf8', flag: 'w' },
            (err, data) => {
              if (this._handleErrors(requestData.res, err)) return;

              requestData.res.status(200).end();
            }
          );
        }
      );
    } catch (e) {
      Logger.warn(e);
      requestData.res.status(500).end();
    }
  }

  /** Returns true if an error is encountered */
  static _handleErrors(res, err) {
    if (err) {
      if (err.code === 'ENOENT') res.status(404).end();
      else res.status(500).end();
      return true;
    }

    return false;
  }
}

class RequestQueue {
  _queue = [];

  push(req, res, type) {
    if (this._queue.length === 0) {
      this._queue.push({ req: req, res: res, type: type });
      this.process();
    } else this._queue.push({ req: req, res: res, type: type });
  }

  process() {
    if (this._queue[0].type === 'r')
      RequestHandler._processJSONReadQueue(this._queue[0]);
    else if (this._queue[0].type === 'w')
      RequestHandler._processJSONOverwriteQueue(this._queue[0]);
    else {
      Logger.warn(new Error('Queued request has bad type'))
      this._queue[0].res.status(500).end();
    }

    this._queue.splice(0, 1);

    if (this._queue.length > 0)
      this.process();
  }
}

module.exports = RequestHandler;
