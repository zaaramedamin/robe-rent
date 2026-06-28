const winston = require('winston');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Application logger.
 *  - Production: structured JSON (easy to ship to a log aggregator).
 *  - Development: colourised, human-friendly single lines.
 * Level is controlled by LOG_LEVEL (defaults to "debug" in dev, "info" in prod).
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: isProd
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${stack || message}${extra}`;
        })
      ),
  transports: [
    new winston.transports.Console({ silent: process.env.NODE_ENV === 'test' }),
  ],
});

// A stream adapter so morgan can pipe HTTP request logs through winston.
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
