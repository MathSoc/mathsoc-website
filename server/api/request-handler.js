const fs = require('fs');
const Logger = require('./logger.js');

class RequestHandler {
  static queues = {};

  static getJSONData(req, res) {
    try {
      fs.readFile(`server/data/${req.params.fileName}.json`, (err, data) => {
        try {
          if (this._handleErrors(res, err)) return;

          if (!data || data.length === 0) {
            res.status(204).end(); // success, no data
            return;
          }

          const parsedJson = JSON.parse(data.toString('utf-8'));
          res.json(parsedJson);

          res.status(200).end();
        } catch (e) {
          Logger.warn(e);
          res.status(500).end();
        }
      });
    } catch (e) {
      Logger.warn(e);
      res.status(500).end();
    }
  }

  static overwriteJSONData(req, res) {
    if (!this.queues[req.params.fileName]) {
      this.queues[req.params.fileName] = new RequestQueue();
    }

    this.queues[req.params.fileName].push(req, res);
  }

  static _processJSONOverwriteQueue({ req, res }) {
    try {
      let writeData;

      try {
        writeData = typeof req.body === "object"
          ? JSON.stringify(req.body)
          : req.body;
      } catch (e) {
        res.status(400).end(); // bad input (probably cannot parse to JSON)
      }

      fs.open(`server/data/${req.params.fileName}.json`,
        'r+',
        null,
        (err) => {
          if (this._handleErrors(res, err)) return;

          fs.writeFile(
            `server/data/${req.params.fileName}.json`,
            writeData,
            { encoding: 'utf8', flag: 'w' },
            (err, data) => {
              if (this._handleErrors(res, err)) return;

              res.status(200).end();
            }
          );
        }
      );
    } catch (e) {
      Logger.warn(e);
      res.status(500).end();
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

  push(req, res) {
    if (this._queue.length === 0) {
      this._queue.push({ req, res });
      this.process();
    } else this._queue.push({ req, res });
  }

  process() {
    RequestHandler._processJSONOverwriteQueue(this._queue[0]);
    this._queue.splice(0, 1);

    if (this._queue.length > 0)
      this.process();
  }
}

module.exports = RequestHandler;
