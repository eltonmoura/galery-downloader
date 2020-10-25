'use strict';

const http = require('https');
const fs = require('fs');

module.exports = class FileDownloader {

  constructor() {
  }

  download(url, dest) {
    const pathDest = `storage/images/${dest}`;
    const file = fs.createWriteStream(pathDest);

    return new Promise((resolve, reject) => {
      http.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve('ok'));
        });
      }).on('error', (err) => {
        fs.unlink(pathDest);
        reject(err.message);
      });
    });
  }
}
