const { merge } = require('webpack-merge');
const path = require('path');

const extendWebpackConfig = {
  resolve: {
    alias: {
      src: path.join(__dirname, 'src'),
    },
  },
};

module.exports = function override(config) {
  return merge(config, extendWebpackConfig);
};
