const webpack = require('webpack');
const path = require('path');

const build = require('./../build.settings');
const babelLoaderQuery = require('./getBabelLoaders')({
  presets: ['es2015-loose', 'stage-0', 'react', 'react-hmre'],
  plugins: [
    'transform-runtime',
    'transform-decorators-legacy',
    ['react-transform', {
      transforms: [{
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals: ['module'],
      }, {
        transform: 'react-transform-catch-errors',
        imports: ['react', 'redbox-react'],
      }],
    }],
  ],
});

module.exports = {
  devtool: 'eval-source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    bundle: [
      'eventsource-polyfill', // polyfill for IE, https://github.com/glenjamin/webpack-hot-middleware/issues/53
      './src/index.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: require.resolve('react-addons-perf'),
        use: [
          {
            loader: 'expose-loader',
            query: 'Perf',
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: babelLoaderQuery,
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot|otf)(\?*[a-z|A-Z|0-9]*)$/,
        use: ['url?prefix=font/&limit=5000'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, '../src'),
    ],
    extensions: ['.json', '.js', '.css'],
  },
  plugins: [
    // hot reload
    new webpack.HotModuleReplacementPlugin(),

    build.defineJsConstants(),
  ],
};
