const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

const timestamp = () => new Date().toISOString();

const logger = {
  error: (msg) => currentLevel >= 0 && console.error(`[${timestamp()}] [ERROR] ${msg}`),
  warn:  (msg) => currentLevel >= 1 && console.warn(`[${timestamp()}] [WARN]  ${msg}`),
  info:  (msg) => currentLevel >= 2 && console.log(`[${timestamp()}] [INFO]  ${msg}`),
  debug: (msg) => currentLevel >= 3 && console.log(`[${timestamp()}] [DEBUG] ${msg}`),
};

module.exports = logger;
