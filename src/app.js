const FileDownloader = require('./lib/FileDownloader');

const url = 'https://miro.medium.com/max/640/0*i1v1In2Tn4Stnwnl.jpg';
const dest = 'temp.jpg';

const fileDownloader = new FileDownloader();
fileDownloader.download(url, dest)
    .then((res) => {
        console.log(`${url} =>`, res);
    })
    .catch((err) => {
        console.log(`${url} =>`, err);
    });
