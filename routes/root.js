const express = require('express');
const path = require('path');
const router = express.Router();

router.get('^/$|/index(.html)?', (req, res) => {
   console.log(req.url);
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

module.exports = router;
