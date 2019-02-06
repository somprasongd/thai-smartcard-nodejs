const {
  Devices
} = require('smartcard');
const {
  PersonalApplet,
  NhsoApplet
} = require('./applet');

const DEFAULT_QUERY = [
  'cid',
  'name',
  'dob',
  'gender'
];

const ALL_QUERY = [
  'cid',
  'name',
  'nameEn',
  'dob',
  'gender',
  'issuer',
  'issueDate',
  'expireDate',
  'address',
  'photo',
  'nhso'
];

let query = [...DEFAULT_QUERY];

module.exports.init = io => {
  const devices = new Devices();

  devices.on('device-activated', event => {
    const currentDevices = event.devices;
    const device = event.device;
    console.log(`Device '${device}' activated, devices: ${currentDevices}`);
    for (const prop in currentDevices) {
      console.log(`Devices: ${currentDevices[prop]}`);
    }

    device.on('card-inserted', async event => {
      const card = event.card;
      const message = `Card '${card.getAtr()}' inserted into '${event.device}'`;
      io.emit('smc-inserted', {
        status: 202,
        description: 'Card Inserted',
        data: {
          message
        }
      });
      console.log(message);

      // card.on('command-issued', event => {
      //   console.log(`Command '${event.command}' issued to '${event.card}' `);
      // });

      // card.on('response-received', event => {
      //   console.log(`Response '${event.response}' received from '${event.card}' in response to '${event.command}'`);
      // });

      let req = [0x00, 0xc0, 0x00, 0x00];
      if (card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')) {
        req = [0x00, 0xc0, 0x00, 0x01];
      }

      try {
        const q = query ? [...query] : [...DEFAULT_QUERY];
        let data = {};
        const personalApplet = new PersonalApplet(card, req);
        const personal = await personalApplet.getInfo(q.filter(key => key !== 'nhso'));
        data = {
          ...personal
        };

        if (q.includes('nhso')) {
          const nhsoApplet = new NhsoApplet(card, req);
          const nhso = await nhsoApplet.getInfo();
          data = {
            ...data,
            nhso
          };
        }
        console.log('Received data', data);
        io.emit('smc-data', {
          status: 200,
          description: 'Success',
          data
        });
      } catch (ex) {
        const message = `Exception: ${ex.message}`;
        console.error(ex);
        io.emit('smc-error', {
          status: 500,
          description: 'Error',
          data: {
            message
          }
        });
        process.exit(); // auto restart handle by pm2
      }
    });
    device.on('card-removed', event => {
      const message = `Card removed from '${event.name}'`;
      console.log(message);
      io.emit('smc-removed', {
        status: 205,
        description: 'Card Removed',
        data: {
          message
        }
      });
    });

    device.on('error', event => {
      const message = `Incorrect card input'`;
      console.log(message);
      io.emit('smc-incorrect', {
        status: 400,
        description: 'Incorrect card input',
        data: {
          message
        }
      });
    });
  });

  devices.on('device-deactivated', event => {
    const message = `Device '${event.device}' deactivated, devices: [${event.devices}]`;
    console.error(message);
    io.emit('smc-error', {
      status: 404,
      description: 'Not Found Smartcard Device',
      data: {
        message
      }
    });
  });

  devices.on('error', error => {
    const message = `${error.error}`;
    console.error(message);
    io.emit('smc-error', {
      status: 404,
      description: 'Not Found Smartcard Device',
      data: {
        message
      }
    });
  });
};

module.exports.setQuery = (q = DEFAULT_QUERY) => {
  query = [...q];
  console.log(query)
}

module.exports.setAllQuery = () => {
  query = [...ALL_QUERY];
  console.log(query)
}