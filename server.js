require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine (if needed)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  const transcriptionController = require('./controllers/transcriptionController');
  
  socket.on('startTranscription', (data) => {
    const language = data?.language || 'en-US';
    transcriptionController.setupLiveTranscription(socket, language);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', apiRoutes);

// Render main page - use the HTML file directly instead of EJS
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});