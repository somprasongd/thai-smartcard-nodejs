const smartcard = require('smartcard');
const legacy = require('legacy-encoding');
const dayjs = require('dayjs');
const hex64 = require('hex64');
const reader = require('../helper/reader');
const { apduPerson } = require('../apdu');
const converter = require('../helper/converter');

const CommandApdu = smartcard.CommandApdu;

class PersonalApplet {
  constructor(card, req = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.req = req;
  }

  async getInfo() {
    const info = {};
    // check card
    await this.card.issueCommand(
      new CommandApdu(
        new CommandApdu({
          bytes: [...apduPerson.SELECT, ...apduPerson.THAI_CARD],
        })
      )
    );

    // cid
    let data = await reader.getData(this.card, apduPerson.CMD_CID, this.req);
    info.cid = data.slice(0, -2).toString();

    // TH fullname
    data = await reader.getData(this.card, apduPerson.CMD_THFULLNAME, this.req);
    data = legacy.decode(data, 'tis620');
    data = data
      .slice(0, -2)
      .toString()
      .trim()
      .split('#'); // prefix, firstname, lastname
    const th = {
      prefix: data[0],
      firstname: data[1],
      middlename: data[2],
      lastname: data[3],
      fullname: data.reduce((name, d) => {
        if (d.length === 0) {
          return name;
        }
        return `${name} ${d}`;
      }, ''),
    };

    // EN fullname
    data = await reader.getData(this.card, apduPerson.CMD_ENFULLNAME, this.req);
    data = legacy.decode(data, 'tis620');
    data = data
      .slice(0, -2)
      .toString()
      .trim()
      .split('#'); // prefix, firstname, lastname
    const en = {
      prefix: data[0],
      firstname: data[1],
      middlename: data[2],
      lastname: data[3],
      fullname: data.reduce((name, d) => {
        if (d.length === 0) {
          return name;
        }
        return `${name} ${d}`;
      }, ''),
    };

    info.name = { th, en };

    // DOB
    data = await reader.getData(this.card, apduPerson.CMD_BIRTH, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    info.dob = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    // Gender
    data = await reader.getData(this.card, apduPerson.CMD_GENDER, this.req);
    info.gender = data
      .slice(0, -2)
      .toString()
      .trim();
    // Card Issuer
    data = await reader.getData(this.card, apduPerson.CMD_ISSUER, this.req);
    info.issuer = legacy
      .decode(data, 'tis620')
      .slice(0, -2)
      .toString()
      .trim();
    // Issue Date
    data = await reader.getData(this.card, apduPerson.CMD_ISSUE, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    info.issueDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    // Expire Date
    data = await reader.getData(this.card, apduPerson.CMD_EXPIRE, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    info.expireDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    // Address
    data = await reader.getData(this.card, apduPerson.CMD_ADDRESS, this.req);
    data = legacy.decode(data, 'tis620');
    data = data
      .slice(0, -2)
      .toString()
      .trim()
      .split('#');
    info.address = {
      houseNo: data[0],
      street: data
        .slice(1, -3)
        .join(' ')
        .trim(),
      subdistrict: data[data.length - 3],
      district: data[data.length - 2],
      province: data[data.length - 1],
      full: data.reduce((addr, d) => {
        if (d.length === 0) {
          return addr;
        }
        return `${addr} ${d}`;
      }, ''),
    };

    data = await reader.getData(this.card, apduPerson.CMD_PHOTO1, this.req);
    let photo = data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO2, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO3, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO4, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO5, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO6, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO7, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO8, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO9, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO10, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO11, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO12, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO13, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO14, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO15, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO16, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO17, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO18, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO19, this.req);
    photo += data.toString('hex').slice(0, -4);
    data = await reader.getData(this.card, apduPerson.CMD_PHOTO20, this.req);
    photo += data.toString('hex').slice(0, -4);
    info.photo = converter.pic_hex2base64(photo);

    return info;
  }
}

module.exports = PersonalApplet;
