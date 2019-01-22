const app = require('express')();
const server = require('http').Server(app);
const path = require('path');
const { publicDir } = require('./helper/path');
const smc = require('./smc');

const io = require('socket.io')(server, {
  origins: 'localhost:9898'
});

smc.init(io);

if (app.env !== 'production') {
  app.get('/', function (req, res) {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

io.on('connection', function (socket) {
  console.log(`New connection from ${socket.id}`);

  socket.on('set-query', function (data = {}) {
    const { query = undefined } = data;
    console.log(`set-query: ${query}`);
    smc.setQuery(query);
  });

  socket.on('set-all-query', function (data = {}) {
    const { query = undefined } = data;
    console.log(`set-query: ${query}`);
    smc.setQuery(query);
  });

  socket.on('disconnect', function () {
    console.log('client disconnected');
  });
});

const PORT = process.env.SMC_AGENT_PORT || 9898;

server.listen(PORT, function () {
  console.log(`listening on *:${PORT}`);
});
