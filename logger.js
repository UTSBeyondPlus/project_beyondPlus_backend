const winston = require("winston");

//log config

const formatByLevel = winston.format((info) => {
  if (info.level === "http") {
    info.message = `🌐 HTTP: ${info.message}`;
  } else if (info.level === "info") {
    info.message = `[INFO] ${info.message}`;
  }
  return info;
})();

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}]:[:${process.argv[2] ? process.argv[2] : (process.env.PORT ? process.env.PORT : 3000 )}]:[${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // 콘솔에 모든 로그 출력
    new winston.transports.File({ filename: 'logs/all-logs.log' }), // 파일에 모든 로그 저장
  ],
});
module.exports = logger;