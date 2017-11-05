const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const build = require('./../build.settings');
const timestamp = build.getDomainConfig().__TIMESTAMP__;
const babelLoaderQuery = require('./getBabelLoaders')({
  cacheDirectory: true,
  presets: ['es2015-loose', 'stage-0', 'react'],
  plugins: [
    'transform-runtime',
    'transform-decorators-legacy',
    'transform-react-remove-prop-types',
    'transform-react-pure-class-to-function',
  ],
});

module.exports = {
  context: path.resolve(__dirname, '..'),
  entry: {
    bundle: [
      './src/index.js',
    ],
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: `[name].[chunkhash:8].${timestamp}.js`,
    chunkFilename: `[name].[chunkhash:8].${timestamp}.js`,
  },
  module: {
    rules: [
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
          publicPath: './',
        }),
      },
      {
        test: /\.(woff|woff2|ttf|eot|otf)(\?*[a-z|A-Z|0-9]*)$/,
        use: ['url?prefix=font/&limit=5000'],
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
      }, // 當圖片大小小於 xk 時使用 base64 URL, 其餘使用直接連接到圖片的 URL
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
    // css files from the extract-text-plugin loader
    new ExtractTextPlugin({
      filename: `bundle.[contenthash:8].${timestamp}.css`,
      allChunks: true,
    }),

    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {discardComments: {removeAll: true}},
    }),

    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

    // optimizations
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        comments: false,
        screw_ie8: true,
      },
    }),

    new WebpackMd5Hash(),

    // html
    new HtmlWebpackPlugin({
      template: 'index.tpl',
      inject: 'body',
      chunks: ['bundle'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      filename: 'index.html',
    }),

    build.defineJsConstants(),
  ],
};
