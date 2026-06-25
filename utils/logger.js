const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json, colorize, simple } = format;

// In production use structured JSON (machine-readable).
// In development use a simple coloured format for readability.
const logger =
  process.env.NODE_ENV === 'production'
    ? createLogger({
        level: 'info',
        format: combine(timestamp(), json()),
        transports: [new transports.Console()],
      })
    : createLogger({
        level: 'debug',
        format: combine(colorize(), simple()),
        transports: [new transports.Console()],
      });

const morganStream = {
  write: (message) => logger.http(message.trimEnd()),
};

module.exports = { logger, morganStream };
