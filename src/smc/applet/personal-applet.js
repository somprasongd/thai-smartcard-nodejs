const {
  CommandApdu
} = require('smartcard');
const legacy = require('legacy-encoding');
// const dayjs = require('dayjs');
const reader = require('../../helper/reader');
const {
  apduPerson
} = require('../apdu');
const hex2imagebase64 = require('hex2imagebase64');

class PersonalApplet {
  constructor(card, req = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.req = req;
  }

  async getInfo(query = ['cid']) {
    // check card
    await this.card.issueCommand(
      new CommandApdu(
        new CommandApdu({
          bytes: [...apduPerson.SELECT, ...apduPerson.THAI_CARD],
        })
      )
    );

    const q = query.reduce((q, key) => ({
      ...q,
      [key]: true
    }), {
      'cid': false,
      'name': false,
      'nameEn': false,
      'dob': false,
      'gender': false,
      'issuer': false,
      'issueDate': false,
      'expireDate': false,
      'address': false,
      'photo': false,
    });

    const info = {};
    let data;
    // cid
    if (q.cid) {
      data = await reader.getData(this.card, apduPerson.CMD_CID, this.req);
      info.cid = data.slice(0, -2).toString();
    }

    // TH fullname
    if (q.name) {
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
        }, '').trim().replace(' ', ''),
      };

      info.name = th;
    }

    // EN fullname
    if (q.nameEn) {
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
        }, '').trim().replace(' ', ''),
      };

      info.nameEN = en;
    }

    // DOB
    if (q.dob) {
      data = await reader.getData(this.card, apduPerson.CMD_BIRTH, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      // info.dob = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
      info.dob = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    // Gender
    if (q.gender) {
      data = await reader.getData(this.card, apduPerson.CMD_GENDER, this.req);
      info.gender = data
        .slice(0, -2)
        .toString()
        .trim();
    }

    // Card Issuer
    if (q.issuer) {
      data = await reader.getData(this.card, apduPerson.CMD_ISSUER, this.req);
      info.issuer = legacy
        .decode(data, 'tis620')
        .slice(0, -2)
        .toString()
        .trim();
    }

    // Issue Date
    if (q.issueDate) {
      data = await reader.getData(this.card, apduPerson.CMD_ISSUE, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      // info.issueDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
      info.issueDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    // Expire Date
    if (q.expireDate) {
      data = await reader.getData(this.card, apduPerson.CMD_EXPIRE, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      // info.expireDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
      info.expireDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    // Address
    if (q.address) {
      data = await reader.getData(this.card, apduPerson.CMD_ADDRESS, this.req);
      data = legacy.decode(data, 'tis620');
      data = data
        .slice(0, -2)
        .toString()
        .trim()
        .split('#');

      info.address = {
        houseNo: data[0],
        moo: data[1].substring(7).trim(),
        street: data
          .slice(2, -3)
          .join(' ')
          .trim(),
        subdistrict: data[data.length - 3].substring(4).trim(),
        district: data[data.length - 2].substring(5).trim(),
        province: data[data.length - 1].substring(7).trim(),
        full: data.reduce((addr, d) => {
          if (d.length === 0) {
            return addr;
          }
          return `${addr} ${d}`;
        }, ''),
      };
    }

    if (q.photo) {
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
      info.photo = hex2imagebase64(photo);
    }
    return info;
  }
}

module.exports = PersonalApplet;