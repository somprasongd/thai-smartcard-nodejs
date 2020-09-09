# Thai Smartcard Reader with Node.js

## Installation

### Windows

- Install Nodejs with [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) (use node 10.16.3)
  ```bash
  nvm install 10.16.3
  nvm use 10.16.3
  ```
- Start PowerShell as Administrator and run: `npm install --global --production windows-build-tools`, or use option 2 in <https://github.com/nodejs/node-gyp#on-windows>
- Go to `thai-smartcard-nodejs` and run `npm install`
- Setup PM2
  ```bash
  npm install -g pm2 pm2-windows-startup
  pm2-startup install
  pm2 start src/index.js --name smc
  pm2 save
  ```

### Ubuntu & Pi

- Install [Python 2.7.x](https://www.python.org/downloads/)
- Run `$ sudo apt-get install libpcsclite1 libpcsclite-dev pcscd`
- Install Nodejs with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (use node 10.16.3)
  ```bash
  nvm install 10.16.3
  nvm
  ```
- Go to `thai-smartcard-nodejs` and run `npm install`
- Setup PM2
  ```bash
  npm install -g pm2
  pm2 start src/index.js --name smc
  pm2 startup
  pm2 save
  ```

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
    console.log(data); // JSON {status: 200, description:, 'Success', data: {}
  });
  socket.on('smc-error', function (data) {
    console.log(data); // JSON {status: 500, description:, 'Error', data: {message: ''}
  });
  socket.on('smc-removed', function (data) {
    console.log(data); // JSON {status: 205, description:, 'Card Removed', data: {message: ''}
  });
  socket.on('smc-deactivated', function (data) {
    console.log(data); // JSON {status: 404, description:, 'Not Found Smartcard Device', data: {message: ''}
  });
  socket.on('smc-incorrect', function (data) {
      console.log(data); // JSON {status: 400, description:, 'Incorrect card input', data: {message: ''}
  });
  socket.on('smc-inserted', function (data) {
    console.log(data); // JSON {status: 202, description:, 'Card Inserted', data: {message: ''}
  });
</script>
```

## Donate

สนับสนุนได้ผ่านทาง Promptpay

<img src="https://bit.ly/3gusiz8">
