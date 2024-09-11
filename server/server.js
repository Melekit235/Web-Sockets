require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const apiRoutes = require('./routes/api');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/');
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const dateString = now.toISOString().replace(/T/, '_').replace(/\..+/, '');
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('client'));
app.use(cookieParser());

app.use('/api', apiRoutes(upload));

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
