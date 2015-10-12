var promisify = require('promisify-node');
var svg2png = promisify('svg2png');
var im = require('imagemagick');

var merge = [].concat.bind([]);

var fs = require('fs');
var deleteFolderRecursive = function(path) {
  var files = [];
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var createIcons = function(name) {
  deleteFolderRecursive('production/png/' + name);
  var png = svg2png.bind(null, 'production/' + name + '.svg');
  var scaleTo = function(size) {
    return size / 512;
  }

  var favicon = function(sizes) {
    return Promise.all(sizes.map(function(size) {
      return png('production/tmp/' + name + '-' + size + '.png', scaleTo(size))
    }))
    .then(function() {
      return new Promise(function(resolve, reject) {
        try {
          fs.mkdirSync('production/ico');
        } catch (e) {
          if (e.code != 'EEXIST') {
            reject(e);
          }
        }
        im.convert(merge(sizes.map(function(size) {
          return 'production/tmp/' + name + '-' + size + '.png';
        }), ['-alpha', 'on', 'production/ico/' + name + '.ico']), function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    })
    .then(function() {
      deleteFolderRecursive('production/tmp');
    });
  };

  return [
    png('production/png/' + name + '/original.png'),
    png('production/png/' + name + '/icon-57.png', scaleTo(57)),
    png('production/png/' + name + '/icon-72.png', scaleTo(72)),
    png('production/png/' + name + '/icon-114.png', scaleTo(114)),
    png('production/png/' + name + '/icon-160.png', scaleTo(160)),
    favicon([16, 32, 48, 64])
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
.catch(function(e) {
  console.log('An error occurred while converting the icons.');
  console.log(e);
  process.exit(-1);
})
