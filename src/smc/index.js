const { Devices, CommandApdu } = require('smartcard');
const { PersonalApplet, NhsoApplet } = require('./applet');
const reader = require('../helper/reader');
const { sleep } = require('../helper/sleep');

const EXIST_WHEN_READ_ERROR =
  process.env.EXIST_WHEN_READ_ERROR &&
  process.env.EXIST_WHEN_READ_ERROR === 'false'
    ? false
    : true;

const DEBUG =
  process.env.SMC_AGENT_DEBUG && process.env.SMC_AGENT_DEBUG === 'true'
    ? true
    : false;

const DEFAULT_QUERY = ['cid', 'name', 'dob', 'gender'];

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
  'nhso',
  'laserId',
];

let query = [...DEFAULT_QUERY];

module.exports.init = (io) => {
  let devices = new Devices();
  devices.on('device-activated', (event) => {
    // console.log('device-activated');
    // console.log(devices);
    const currentDevices = event.devices;
    // console.log(currentDevices);
    const device = event.device;
    // console.log(device);
    console.log(`Device '${device}' activated, devices: ${currentDevices}`);
    for (const prop in currentDevices) {
      console.log(`Devices: ${currentDevices[prop]}`);
    }

    device.on('card-inserted', async (event) => {
      const card = event.card;
      const message = `Card '${card.getAtr()}' inserted into '${event.device}'`;
      io.emit('smc-inserted', {
        status: 202,
        description: 'Card Inserted',
        data: {
          message,
        },
      });
      console.log(message);

      card.on('command-issued', (event) => {
        console.log(`Command '${event.command}' issued to '${event.card}' `);
      });

      card.on('response-received', (event) => {
        console.log(
          `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
        );
      });

      try {
        data = await read(card);
        if (DEBUG) console.log('Received data', data);
        io.emit('smc-data', {
          status: 200,
          description: 'Success',
          data,
        });
      } catch (ex) {
        const message = `Exception: ${ex.message}`;
        console.error(ex);
        io.emit('smc-error', {
          status: 500,
          description: 'Error',
          data: {
            message,
          },
        });
        if (EXIST_WHEN_READ_ERROR) {
          process.exit(); // auto restart handle by pm2
        }
      }
    });
    device.on('card-removed', (event) => {
      const message = `Card removed from '${event.name}'`;
      console.log(message);
      io.emit('smc-removed', {
        status: 205,
        description: 'Card Removed',
        data: {
          message,
        },
      });
    });

    device.on('error', (event) => {
      const message = `Incorrect card input'`;
      console.log(message);
      io.emit('smc-incorrect', {
        status: 400,
        description: 'Incorrect card input',
        data: {
          message,
        },
      });
    });
  });

  devices.on('device-deactivated', (event) => {
    const message = `Device '${event.device}' deactivated, devices: [${event.devices}]`;
    console.error(message);
    io.emit('smc-error', {
      status: 404,
      description: 'Not Found Smartcard Device',
      data: {
        message,
      },
    });
  });

  devices.on('error', (error) => {
    const message = `${error.error}`;
    console.error(message);
    io.emit('smc-error', {
      status: 404,
      description: 'Not Found Smartcard Device',
      data: {
        message,
      },
    });
  });
};

module.exports.setQuery = (q = DEFAULT_QUERY) => {
  query = [...q];
  console.log(query);
};

module.exports.setAllQuery = () => {
  query = [...ALL_QUERY];
  console.log(query);
};

async function readWithRetry(card, maxRetry) {
  retryCount = 0;
  while (true) {
    try {
      data = await read(card);
      return data;
    } catch (error) {
      console.log(error);
      if (
        retryCount === maxRetry ||
        error.message === 'Card Reader not connected'
      ) {
        throw error;
      }
      retryCount = retryCount + 1;
      await sleep(3000);
      console.log('Retry read card #', retryCount);
    }
  }
}

function read(card) {
  return new Promise(async (resolve, reject) => {
    let req = [0x00, 0xc0, 0x00, 0x00];
    if (
      card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')
    ) {
      req = [0x00, 0xc0, 0x00, 0x01];
    }

    try {
      const q = query ? [...query] : [...DEFAULT_QUERY];
      let data = {};
      const personalApplet = new PersonalApplet(card, req);
      const personal = await personalApplet.getInfo(
        q.filter((key) => key !== 'nhso' || key !== 'laserId')
      );
      data = {
        ...personal,
      };

      if (q.includes('nhso')) {
        const nhsoApplet = new NhsoApplet(card, req);
        const nhso = await nhsoApplet.getInfo();
        data = {
          ...data,
          nhso,
        };
      }

      // laserid
      if (q.includes('laserId')) {
        let laserId = '';
        try {
          laserId = await reader.getLaser(card);
          // console.log('data', data, data.length);
        } catch (error) {
          console.log('Can not read laserId', error);
        }
        data = {
          ...data,
          laserId,
        };
      }

      return resolve(data);
    } catch (ex) {
      return reject(ex);
    }
  });
}
