const fs = require('fs');

function writeInCurrentFolder(filename, data) {
  fs.open(filename, 'w+', (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        console.error('myfile already exists');
        return;
      } else {
        throw err;
      }
    }
    fs.write(fd, data, _ => console.log('write finish'));
  })
}

// writeInCurrentFolder('1.txt', 'gogogo');
module.exports = {
  writeInCurrentFolder,
}
