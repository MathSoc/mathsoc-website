import Winston, { Logger as WinstonLogger } from 'winston';

export class Logger {
  private _logger: WinstonLogger;

  constructor(name?: string) {
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

  info(message: any, ...meta: any[]): void {
    this._logger.info(message, ...meta);
  }

  warn(message: any, ...meta: any[]): void {
    this._logger.warn(message, ...meta);
  }

  error(message: any, ...meta: any[]): void {
    this._logger.error(message, ...meta);
  }
}
