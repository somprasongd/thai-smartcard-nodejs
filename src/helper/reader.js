const { CommandApdu } = require('smartcard');

exports.getData = async (card, command, req = [0x00, 0xc0, 0x00, 0x00]) => {
  let data = await card.issueCommand(
    new CommandApdu({
      bytes: command,
    })
  );
  data = await card.issueCommand(
    new CommandApdu({
      bytes: [...req, ...command.slice(-1)],
    })
  );
  return data;
};

exports.getLaser = async (card, req = [0x00, 0xc0, 0x00, 0x00]) => {
  // check card
  await card.issueCommand(
    new CommandApdu(
      new CommandApdu({
        bytes: [
          0x00, 0xa4, 0x04, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x00, 0x84, 0x06,
          0x00, 0x02,
        ],
      })
    )
  );

  command = [0x80, 0x00, 0x00, 0x00, 0x07];
  let data = await card.issueCommand(
    new CommandApdu({
      bytes: command,
    })
  );
  data = await card.issueCommand(
    new CommandApdu({
      bytes: [...req, 0x10],
    })
  );
  return data.slice(0, -2).toString().replace(/\0/g, '').trim();
};
