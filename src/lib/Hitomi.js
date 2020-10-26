const fs = require('fs');
const http = require('https');
const Zip = require("adm-zip");
const request = require('request-promise');
const { getUrlFile } = require('./HitomiUtils');

function parseLink(linkGalery) {
  const regex = /^(.*?)\:\/\/(.*?)\/.*?(\d+).html/g;
  const result = regex.exec(linkGalery);

  const protocol = result[1];
  const domain = result[2];
  const id = result[3];

  return {
    id,
    domain,
    filesJs: `${protocol}://ltn.${domain}/galleries/${id}.js`
  }
}

async function getGalleryinfo(url) {
  try {
    const response = await request.get(url);
    eval(response);
    return galleryinfo;
  } catch (error) {
    console.log('Error ' + error.statusCode);
  }
}

function makeCBR(directory) {
  var file = new Zip();
  file.addLocalFolder(directory);
  file.writeZip(`${directory}.cbr`);
}

function removeFiles(directory) {
  fs.rmdir(directory, { recursive: true }, () => {
    console.log('directory removed!');
  });  
}

function downloadImage(url, dest) {
  const file = fs.createWriteStream(dest);
  const headers = {
    referer: 'https://hitomi.la/',
    Host: 'ab.hitomi.la',
  };

  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve('ok'));
      });
    }).on('error', (err) => {
      fs.unlink(dest);
      reject(err.message);
    });
  });
}

const httpGet = url => {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
};

function slugify(str) {
  let result = str;
  result = result.toLowerCase();
  result = result.replace(/\s/ig, '-');
  result = result.replace(/[\.]/ig, '');
  return result;
}

async function getFileNameFromPage(url) {
  const content = await httpGet(url);
  const regex = /<title>(.*?)\sby\s(.*?)\s-\sRead.*?<\/title>/g;
  const result = regex.exec(content);
  const title = result[1];
  const author = result[2];
  return `${slugify(author)}_${slugify(title)}`;
}

function downloadGaleryUrls(galleryUrls, directory) {
  return Promise.all(galleryUrls.map((url, idx) => {
    const dest = `${directory}/${(idx+1).toString().padStart(3, '0')}.jpg`;
    return downloadImage(url, dest)
      .then((res) => {
          console.log(`${url} =>`, res);
      })
      .catch((err) => {
          console.log(`${url} =>`, err);
      });
  }));
}

exports.init = async (galeryUrl) => {
  const fileName = await getFileNameFromPage(galeryUrl);
  console.log('Galery Name', fileName);

  const galery = parseLink(galeryUrl);
  const galleryinfo = await getGalleryinfo(galery.filesJs);
  const galleryUrls = galleryinfo.files.map(file => getUrlFile(galleryinfo.id, file));
  const directory = `storage/${fileName}`;

  console.log('Images', galleryUrls.length);

  fs.mkdir(directory, { recursive: true }, (err) => {
    if (err) throw err;
  });

  // Download das imagens em paralelo
  await downloadGaleryUrls(galleryUrls, directory);
  
  makeCBR(directory);

  removeFiles(directory);

  return true;
}
