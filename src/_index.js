const smartcard = require('smartcard');
const { PersonalApplet, NhsoApplet } = require('./applet');

const Devices = smartcard.Devices;
const devices = new Devices();

const PORT = process.env.SMC_AGENT_PORT || 9898;

devices.on('device-activated', event => {
  const currentDevices = event.devices;
  const device = event.device;
  console.log(`Device '${device}' activated, devices: ${currentDevices}`);
  for (const prop in currentDevices) {
    console.log(`Devices: ${currentDevices[prop]}`);
  }

  device.on('card-inserted', async event => {
    const card = event.card;
    console.log(`Card '${card.getAtr()}' inserted into '${event.device}'`);

    // card.on('command-issued', event => {
    //   console.log(`Command '${event.command}' issued to '${event.card}' `);
    // });

    // card.on('response-received', event => {
    //   console.log(`Response '${event.response}' received from '${event.card}' in response to '${event.command}'`);
    // });

    let req;
    if (card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')) req = [0x00, 0xc0, 0x00, 0x01];
    else req = [0x00, 0xc0, 0x00, 0x00];

    try {
      const personalApplet = new PersonalApplet(card, req);
      const personal = await personalApplet.getInfo();

      const nhsoApplet = new NhsoApplet(card, req);
      const nhso = await nhsoApplet.getInfo();
      const info = { ...personal, nhso };
      console.log(info);
      io.emit('smc-data', info);
    } catch (ex) {
      console.log('error');
      console.error(ex);
      io.emit('smc-error', ex.message);
      process.exit();
    }
  });
  device.on('card-removed', event => {
    console.log(`Card removed from '${event.name}'`);
    io.emit('smc-removed', `Card removed from '${event.name}'`);
  });
});

devices.on('device-deactivated', event => {
  console.log(`Device '${event.device}' deactivated, devices: [${event.devices}]`);
});

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.emit('greet', 'OK');
  
  socket.on('hi2', function (data) {
    console.log('client connected..................', data);
  });
  socket.on('disconnect', function(){
    console.log('client disconnected');
  });
});


server.listen(PORT, function(){
  console.log(`listening on *:${PORT}`);
});