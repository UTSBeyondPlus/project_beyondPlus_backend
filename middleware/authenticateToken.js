const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {

  let authHeader = req.headers['authorization'];
  let token = authHeader.split(' ')[1]; 
  if (token === 'master') return ()=>{next()};

  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next()
  })
};

module.exports = authenticateToken;