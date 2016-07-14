var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/routes',
    './less/main.less',
  ],
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
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
  devtool: 'source-map', // Production
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin("style.css", {allChunks: false})
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
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader")
      },
    ]
  }
};