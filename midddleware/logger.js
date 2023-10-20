const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { log } = require('console');

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), 'dd/MM/yyyy\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.appendFile(
      path.join(__dirname, '..', 'logs', logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

//Middleware

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.header.origin}`,'reqLog.log');
  console.log(`${req.method}\t${req.path}`);
  next();
};

module.exports = {
  logEvents,
  logger,
};
