require('dotenv').config(); // can use dotenv in all files, not just this one.
require('express-async-errors');
const express = require('express');
const app = express();
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const path = require('path');

app.use(logger); // logging requests to the folder and console.

app.use(cors(corsOptions)); // middleware allowing certain websites to make requests to our API.

app.use(express.json()); // middleware that lets us take in json data.

app.use(cookieParser()); // middleware that lets us use cookies

app.use('/', express.static(path.join(__dirname, '/public'))); // middleware, that makes our index.html able to access everything in the /public folder (style.css)

app.use('/', require('./routes/root')); // use that file to tell us what to send

// routes available
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/courses', require('./routes/courseRoutes'));
app.use('/projects', require('./routes/projectRoutes'));
app.use('/groups', require('./routes/groupRoutes'));
app.use('/skills', require('./routes/skillsRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Send an error message back, after all routes
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler); // handle errors after other routes done.

module.exports = app;
