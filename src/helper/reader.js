const {
  CommandApdu
} = require('smartcard');

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