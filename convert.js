var promisify = require('promisify-node');
var svg2png = promisify('svg2png');

var merge = [].concat.bind([]);

var createIcons = function(name) {
  var png = svg2png.bind(null, 'production/' + name + '.svg');
  var scaleTo = function(size) {
    return size / 512;
  }

  return [
    png('production/png/' + name + '/512.png'),
    png('production/png/' + name + '/apple-touch-icon.png', scaleTo(200)),
  ]
};

Promise.all(merge(
  createIcons('tutor'),
  createIcons('corrector'),
  createIcons('lecturer')
))
.then(function() {
  process.exit(0);
})
.catch(function() {
  console.log('An error occurred while converting the icons.');
  process.exit(-1);
})
