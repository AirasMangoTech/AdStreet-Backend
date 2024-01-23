const winston = require('winston');
const moment = require('moment');
const fs = require('fs');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const logDir = 'logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format for logs
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create a new logger instance
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  transports: [
    new transports.File({
      filename: `${logDir}/combined.log`,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      dirname: `${logDir}/${moment().format('YYYY-MM-DD')}`
    })
  ]
});

// If in production, log only to files
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        customFormat
      )
    })
  );
}

module.exports = logger;