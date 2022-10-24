const Winston = require('winston');

class Logger {
  static _logger = Winston.createLogger({
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
      new Winston.transports.File({ filename: 'logs/request-errors.log' }),
    ]
  });

  static warn(arg1, arg2) {
    this._logger.warn(arg1, arg2);
  }
}

if (process.env.NODE_ENV !== 'production') {
  Logger._logger.add(new Winston.transports.Console({
    format: Winston.format.combine(
      Winston.format.colorize(),
      Winston.format.simple()
    )
  }));
}

module.exports = Logger;
