const allowedOrigins = require('./allowedOrigins');

const corsOption = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin /*for postman and other*/) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  Credential: true,
  optionSuccessStatus: 200, //default is 204 but some device have  problem with that like smart tv and older broweser
};

module.exports = corsOption;
