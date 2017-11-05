require('babel-polyfill');

const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const build = require('./../build.settings');
const babelLoaderQuery = require('./getBabelLoaders')({
  cacheDirectory: true,
  presets: ['es2015-loose', 'stage-0', 'react'],
  plugins: ['transform-decorators-legacy'],
});
const projectRoot = path.resolve(__dirname, '../');

module.exports = {
  devtool: 'inline-eval-cheap-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
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
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url',
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
      path.resolve(__dirname, '../src'),
    ],
    extensions: ['.json', '.js'],
    alias: {
      src: path.resolve(projectRoot, 'src'),
      test: path.resolve(projectRoot, 'test'),
      mockApi: path.resolve(projectRoot, 'mockApi'),
    },
  },
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
  },
  plugins: [
    // 檢查是否有循環依賴
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),

    build.defineJsConstants(),
  ],
};
