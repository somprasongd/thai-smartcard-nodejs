const smartcard = require('smartcard');
const { PersonalApplet, NhsoApplet } = require('./applet');

const Devices = smartcard.Devices;
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
    console.log(`Card '${card.getAtr()}' inserted into '${event.device}'`);

    console.log(event);
    // card.on('command-issued', event => {
    //   console.log(`Command '${event.command}' issued to '${event.card}' `);
    // });

    // card.on('response-received', event => {
    //   console.log(`Response '${event.response}' received from '${event.card}' in response to '${event.command}'`);
    // });

    let req;
    if (card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')) req = [0x00, 0xc0, 0x00, 0x01];
    else req = [0x00, 0xc0, 0x00, 0x00];

    // try {
    //   const personalApplet = new PersonalApplet(card, req);
    //   const personal = await personalApplet.getInfo();

    //   const nhsoApplet = new NhsoApplet(card, req);
    //   const nhso = await nhsoApplet.getInfo();
    //   const info = { ...personal, nhso };
    //   console.log(info);
    // } catch (ex) {
    //   console.log('error');
    //   console.error(ex);
    // }
  });
  device.on('card-removed', event => {
    console.log(`Card removed from '${event.name}' `);
  });
});

devices.on('device-deactivated', event => {
  console.log(`Device '${event.device}' deactivated, devices: [${event.devices}]`);
});
