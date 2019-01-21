const path = require('path');

module.exports.rootDir = path.dirname(process.mainModule.filename);
module.exports.publicDir = path.join(path.dirname(process.mainModule.filename).split(path.sep).slice(0, -1).join(path.sep), 'public');