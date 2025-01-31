// log code sample
const winston = require("winston");

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
      return `[${timestamp}]:[${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // ✅ 1. info 로그: 콘솔 + 파일 (텍스트)
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, message }) => {
          return `[${timestamp}] ${message}`;
        })
      ),
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(), // 콘솔 색상 적용
        formatByLevel, // 메시지 변환
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, message }) => {
          return `[${timestamp}] ${message}`;
        })
      ),
    }),

    // ✅ 2. http 로그: 콘솔 + 파일 (JSON)
    new winston.transports.File({
      filename: "logs/http.log",
      level: "http",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // JSON 포맷
      ),
    }),
    new winston.transports.Console({
      level: "http",
      format: winston.format.combine(
        winston.format.colorize(),
        formatByLevel,
        winston.format.timestamp(),
        winston.format.json(),
        // winston.format.printf(({ message }) => message)
      ),
    }),
  ],
});

app.use((req, res, next) => {
  logger.http({ method: req.method, url: req.url, timestamp: new Date().toISOString() });
  next();
});

app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });
  res.status(500).send("서버 오류 발생!");
});