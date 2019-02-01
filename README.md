# Thai Smartcard Reader with Node.js

## Installation

### Windows

- ~~Install [Python 2.7.x]~~(https://www.python.org/downloads/)
- ~~Set enviroments~~

  ```text
  PATH=%PATH%;C:\Python27\Scripts\;C:\Python27\
  ```

- Start PowerShell as Administrator and run: `$ npm install --global --production windows-build-tools`, or use option 2 in <https://github.com/nodejs/node-gyp#on-windows>
- Run `$ npm install`
- Run `$ npm install -g pm2`
- Run `$ pm2 start src/index.js --name smc`

### Ubuntu & Pi

- Install [Python 2.7.x](https://www.python.org/downloads/)
- Run `$ sudo apt-get install libpcsclite1 libpcsclite-dev pcscd`
- Run `$ npm install`
- Run `$ npm start`

## Change Server Port

- Default port is `9898`, change by set system environment `SMC_AGENT_PORT`.

## Client connect with socket.io

```javascript
<script>
  const socket = io.connect('http://localhost:9898');
  socket.on('connect', function () {
    /**
    * Select field to read from smart card
    * Available fields: 'cid', 'name', 'nameEn', 'dob', 'gender', 'issuer', 'issueDate', 'expireDate', 'address', 'photo', 'nhso'
    */
    socket.emit('set-query', {
      query: ['cid', 'name']
    });

    // Or set select all fields.
    // socket.emit('set-all-query');
  });
  socket.on('smc-data', function (data) {
    console.log(data); // JSON {status: 200, data: {}}
  });
  socket.on('smc-error', function (data) {
    console.log(data); // JSON {status: 500, message: ''}
  });
  socket.on('smc-removed', function (data) {
    console.log(data); // JSON {status: 404, message: ''}
  });
  socket.on('smc-deactivated', function (data) {
    console.log(data); // JSON {status: 404, message: ''}
  });
</script>
```
