require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParse = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { logger, logEvents } = require('./midddleware/logger');
const { errorHandler } = require('./midddleware/errorHandler');
const corsOption = require('./config/corsOption');
const connectDB = require('./config/dbConnection');
const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParse());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));
app.use('/users',require('./routes/userRoutes.js'))

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.send({
      message: '404 Not Found',
    });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to mongoDB');
  app.listen(PORT, () => {
    console.log(`Server in running on PORT ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  );
});
