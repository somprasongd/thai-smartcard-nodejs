const pcsclite = require('pcsclite');

// Check card
const SELECT = [0x00, 0xa4, 0x04, 0x00, 0x08];
const THAI_CARD = [0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01];

const pcsc = pcsclite();
pcsc.on('reader', reader => {
  console.log('New reader detected', reader.name);

  reader.on('error', err => {
    console.log('Error(', pcsc.name, '):', err.message);
  });

  reader.on('status', status => {
    console.log('Status(', reader.name, '):', status);
    const { atr } = status;
    let req;
    if (atr[0] === 0x3b && atr[1] === 0x67) req = [0x00, 0xc0, 0x00, 0x01];
    else req = [0x00, 0xc0, 0x00, 0x00];
    /* check what has changed */
    const changes = reader.state ^ status.state;
    if (changes) {
      // card removed
      if (changes & reader.SCARD_STATE_EMPTY && status.state & reader.SCARD_STATE_EMPTY) {
        console.log('card removed');
        reader.disconnect(reader.SCARD_LEAVE_CARD, err => {
          if (err) {
            console.log(err);
          } else {
            console.log('Disconnected');
          }
        });
      }
      // card inserted
      else if (changes & reader.SCARD_STATE_PRESENT && status.state & reader.SCARD_STATE_PRESENT) {
        console.log('card inserted');
        reader.connect(
          { share_mode: reader.SCARD_SHARE_SHARED },
          (err, protocol) => {
            if (err) {
              console.log(err);
            } else {
              console.log('Protocol(', reader.name, '):', protocol);
              reader.transmit(Buffer.from([...SELECT, ...THAI_CARD]), 40, protocol, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Data received', data);
                  reader.transmit(
                    Buffer.from([0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d]),
                    40,
                    protocol,
                    (err, data) => {
                      reader.transmit(Buffer.from([0x00, 0xc0, 0x00, 0x00, 0x0d]), 40, protocol, (err, data) => {
                        console.log('Data received', data.toString().trim());
                      });
                    }
                  );
                  // reader.close();
                  // pcsc.close();
                }
              });
            }
          }
        );
      }
    }
  });

  reader.on('end', () => {
    console.log('Reader', reader.name, 'removed');
  });
});

pcsc.on('error', err => {
  console.log('PCSC error', err.message);
  pcsc.close();
});

process.on('SIGINT', () => {
  console.log('Caught interrupt signal');

  // if (i_should_exit) {
  pcsc.close();
  process.exit();
  // }
});
