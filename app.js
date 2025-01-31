const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const passport = require('passport');
require('dotenv').config();
// require('./config/passport');  // Passport 설정
// const authRoutes = require('./routes/auth');
const verifier = require('./routes/login');
const postRoutes = require('./routes/posts');
const timetablesRoutes = require('./routes/timetables');
const commentsRoutes = require('./routes/comments');
const uploader = require('./routes/uploadFiles');
const { hostname } = require('os');

const winston = require("winston"); // loglibrary

const app = express();


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
      return `[${timestamp}]:[${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // 콘솔에 모든 로그 출력
    new winston.transports.File({ filename: 'logs/all-logs.log' }), // 파일에 모든 로그 저장
  ],
});


// middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack });
  res.status(500).send("서버 오류 발생!");
});
app.use((req, res, next) => {
  logger.http(`[${req.method}] ${req.url} - ${new Date().toISOString()} - IP:${req.ip} - ${JSON.stringify(req.body)}`);
  next();
});

// View 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));


// 라우팅
// app.use('/auth', authRoutes.router);
app.use('/posts', postRoutes);
app.use('/login', verifier);
app.use('/timetables', timetablesRoutes);
app.use('/comments', commentsRoutes);
app.use('/uploadfiles', uploader);



// 홈 페이지 (로그인 페이지)
app.get('/', (req, res) => {
  console.log(PORT, 'is allocated');
  res.render('login');
});

// Test
app.get('/test', (req, res) => {
  const queryParam = req.query.param;
  // logger.info(req)
  // console.log(PORT, 'is allocated by ', queryParam);
  // res.send(PORT, 'is working...' ,queryParam);
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  if (PORT === 3000) { 
    async function executeWithDelay() {
      
      // 10초 대기
      await sleep(10000); // 10000 밀리초 = 10초
      
      return res.send(`${PORT} is working... ${queryParam} \n`);
    }
    
    executeWithDelay();
  }

  else { res.send(`${PORT} is working... ${queryParam} \n`);};
});

// server start config
const PORT = process.argv[2] || process.env.PORT || 3000;
hostName = '0.0.0.0'; 
app.listen(PORT, hostName,() => {
  logger.info(`Server is running on port ${PORT} -- host : ${hostName}`);
});
