var fs = require('fs');
var babelrc = fs.readFileSync('./.babelrc');
var babelrcObject = {};

try {
  babelrcObject = JSON.parse(babelrc);
} catch (err) {
  console.error('==> ERROR: Error parsing your .babelrc.');
  console.error(err);
}

module.exports = function(config) {
  return  Object.assign({}, babelrcObject, config);
};
