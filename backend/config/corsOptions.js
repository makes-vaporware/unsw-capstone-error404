// This file defines our cors options, what we allow to request to our API.

const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {
    // Origin must be in the allowedOrigins array. Or no origin (then Postman can access)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // header. Access control allow credentials header set.
  // browsers will only expose the response to the frontend JavaScript code if the Access-Control-Allow-Credentials value is true
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
