const path = require('path');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {publicDir} = require('./helper/path');

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, 'index.html'));
});

io.on('connection', function(socket){
  console.log(`New connection from ${socket.id}`);
  
  socket.on('init', function (data = null) {
    console.log(`Init: ${data.query}`);
  });

  socket.on('disconnect', function(){
    console.log('client disconnected');
  });
});

const PORT = process.env.SMC_AGENT_PORT || 9898;

server.listen(PORT, function(){
  console.log(`listening on *:${PORT}`);
});
