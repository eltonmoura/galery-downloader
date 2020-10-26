const { init } = require('./lib/Hitomi');

const myArgs = process.argv.slice(2);
if (myArgs.length < 1) {
  console.error('Galery URL not informed.');
  return false;
}

init(myArgs[0]).then((res) => {
    console.log('Done.');
})
.catch((err) => {
    console.log('Error:', err);
});
