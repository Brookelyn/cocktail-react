var webpack = require('webpack');
var path = require('path');
var WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:5000',
    'webpack/hot/dev-server',
    'babel-polyfill',
    './src/routes',
    './less/main.less',
  ],
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:5000/'
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      React: path.resolve(__dirname, './node_modules/react')
    },
    fallback: path.resolve(__dirname, './node_modules')
  },
  resolveLoader: {
    fallback: path.resolve(__dirname, './node_modules')
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new WebpackNotifierPlugin({title: 'Commusoft front-end'}),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: ['babel'],
        query: {
          cacheDirectory: true,
          plugins: ['transform-decorators-legacy'],
          presets: ['es2015', 'stage-0', 'react']
        },
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.less$/,
        loader: "style!css!autoprefixer!less"
      }
    ],
    preLoaders: [
      {
        test: /\.js$/,
        loaders: ['eslint'],
        include: [new RegExp(path.join(__dirname, 'src'))]
      }
    ]
  },
  eslint: {
    configFile: './.eslintrc'
  }
};
