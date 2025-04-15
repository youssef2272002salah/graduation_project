import winston from 'winston';
import morgan from 'morgan';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail("omapuu6zky9GXwjbnrNyuL7J", {
  endpoint: "https://s1231837.eu-nbg-2.betterstackdata.com",
});

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: 'info', // Use 'info' instead of 'http'
  format: combine(
    timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
    json()
  ),
  transports: [
    new winston.transports.Console(),
    new LogtailTransport(logtail),
  ],
});

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

const log = (level: "info" | "warn" | "error", message: string, meta?: object) => {
    logger.log(level, message, meta);
  };

export { logger, morganMiddleware, log };