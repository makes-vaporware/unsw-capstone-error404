require('dotenv').config(); // can use dotenv in all files, not just this one.
require('express-async-errors');
const app = require('./app');
const PORT = process.env.PORT || 3500;
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const { logEvents } = require('./middleware/logger');

// internal dev note: app.js and server.js have been separated,
// so routes can be tested without running the actual server
// please put the app.use(route) calls in app.js instead

// delete this note in Week 7 when presumably everyone's seen this lol

console.log(process.env.NODE_ENV);

connectDB();

mongoose.connection.once('open', () => {
  //listen for the open event for mongo.
  console.log('Connected to MongoDB');
  // then you can open the backend
  app.listen(PORT, () =>
    console.log(`dev server running at: http://localhost:${PORT}`)
  );
});

mongoose.connection.on('error', (err) => {
  // if error with connection
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  ); //log mongoDB Error.
});
