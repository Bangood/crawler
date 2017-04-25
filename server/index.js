const express = require('express');

const app = express();
const api = require('./api')(app);
app.set('port', 3000);
const server = app.listen(app.get('port'), ()=>{
  console.log('Express server listening on port: ', server.address().port, ' with pid', process.pid);
});
