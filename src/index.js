const app = require('express')();
const server = require('http').Server(app);
const path = require('path');
const { publicDir } = require('./helper/path');
const smc = require('./smc');

const PORT = process.env.SMC_AGENT_PORT || 9898;

const io = require('socket.io')(server, {
  origins: app.env !== 'production'? '*' :`localhost:${PORT}`
});

smc.init(io);

if (app.env !== 'production') {
  app.get('/', function (req, res) {
    res.sendFile(path.join(publicDir, 'example.html'));
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

server.listen(PORT, function () {
  console.log(`listening on *:${PORT}`);
});
