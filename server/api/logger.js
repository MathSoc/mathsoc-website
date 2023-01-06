const Winston = require('winston');

class Logger {
  _logger;

  constructor(name) {
    this._logger = Winston.createLogger({
      level: 'info',
      format: Winston.format.combine(
        Winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        Winston.format.errors({ stack: true }),
        Winston.format.splat(),
        Winston.format.json()
      ),
      defaultMeta: { service: 'mathsoc-website' },
      transports: [
        new Winston.transports.File({ filename: `logs/${name ?? 'general'}.log` }),
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this._logger.add(new Winston.transports.Console({
        format: Winston.format.combine(
          Winston.format.colorize(),
          Winston.format.simple()
        )
      }));
    }
  }

  info(message, ...meta) {
    this._logger.info(message, ...meta);
  }

  warn(message, ...meta) {
    this._logger.warn(message, ...meta);
  }

  error(message, ...meta) {
    this._logger.error(message, ...meta);
  }
}

module.exports = Logger;
