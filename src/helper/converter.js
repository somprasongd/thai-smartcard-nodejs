module.exports.hexToString = hex => {
  let string = '';
  for (let i = 0; i < hex.length; i += 2) {
    if (parseInt(hex.substr(i, 2), 16) > 160) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16) + 3424);
    } else {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
  }
  return string;
};

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const binaryToBase64 = input => {
  let ret = [];
  let i = 0;
  let j = 0;
  const charArray3 = new Array(3);
  const charArray4 = new Array(4);
  let inLen = input.length;
  let pos = 0;

  while (inLen--) {
    charArray3[i++] = input[pos++];
    if (i === 3) {
      charArray4[0] = (charArray3[0] & 0xfc) >> 2;
      charArray4[1] = ((charArray3[0] & 0x03) << 4) + ((charArray3[1] & 0xf0) >> 4);
      charArray4[2] = ((charArray3[1] & 0x0f) << 2) + ((charArray3[2] & 0xc0) >> 6);
      charArray4[3] = charArray3[2] & 0x3f;

      for (i = 0; i < 4; i++) {
        ret += base64Chars.charAt(charArray4[i]);
      }
      i = 0;
    }
  }

  if (i) {
    for (j = i; j < 3; j++) {
      charArray3[j] = 0;
    }

    charArray4[0] = (charArray3[0] & 0xfc) >> 2;
    charArray4[1] = ((charArray3[0] & 0x03) << 4) + ((charArray3[1] & 0xf0) >> 4);
    charArray4[2] = ((charArray3[1] & 0x0f) << 2) + ((charArray3[2] & 0xc0) >> 6);
    charArray4[3] = charArray3[2] & 0x3f;

    for (j = 0; j < i + 1; j++) {
      ret += base64Chars.charAt(charArray4[j]);
    }

    while (i++ < 3) {
      ret += '=';
    }
  }

  return ret;
};

module.exports.pic_hex2base64 = hex => {
  const binary = [];
  for (let i = 0; i < hex.length / 2; i++) {
    const h = hex.substr(i * 2, 2);
    binary[i] = parseInt(h, 16);
  }
  return binaryToBase64(binary);
};

module.exports.hash = value => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) + hash + value.charCodeAt(i);
  }
  return hash;
};
