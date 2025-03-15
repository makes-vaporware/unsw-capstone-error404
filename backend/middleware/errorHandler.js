// This file replaces the default error handling.

const { logEvents } = require('./logger');

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    'errLog.log'
  );
  console.log(err.stack); // shows the function call stack

  const status = res.statusCode ? res.statusCode : 500; // server error

  res.status(status);

  res.json({ message: err.message });
};

module.exports = errorHandler;
