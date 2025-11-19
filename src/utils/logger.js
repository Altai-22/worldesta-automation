const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] INFO: ${message}\n`;
    console.log(log.trim());
    fs.appendFileSync(logFile, log);
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const errorMsg = error instanceof Error ? error.message : String(error);
    const log = `[${timestamp}] ERROR: ${message} - ${errorMsg}\n`;
    console.error(log.trim());
    fs.appendFileSync(logFile, log);
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] WARN: ${message}\n`;
    console.warn(log.trim());
    fs.appendFileSync(logFile, log);
  }
};

module.exports = logger;
