const express = require('express');
const router = express.Router();
router.get('/start',(req, res, next)=>{
  res.send('ss');
});
module.exports = router;
