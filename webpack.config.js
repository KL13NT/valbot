const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const fs = require('fs')
const { exec } = require('child_process')
const nodeModules = {}

fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod
  })

module.exports = function (env, argv){
  return {
    devtool: 'sourcemap',
    target: 'node',


  
    entry: {
      index: ['@babel/polyfill', path.resolve(__dirname, 'index.js')]
    },



    output: {
      libraryTarget: 'umd',
      filename: '[name].prod.js',
      path: path.resolve(__dirname, 'releases')
    },
  



    module: {
      rules: [
        {
          test: /\.js$/i,
          exclude: path.resolve(__dirname, 'node_modules'),
          use: [
            'babel-loader'
          // {
          //   loader: 'eslint-loader',
          //   options: {
          //     fix: true,
          //     cache: true,
          //     failOnWarning: false,
          //     failOnError: false
          //   } 
          // }
          ]
        }
      ]
    },



    plugins: argv.mode === 'production'? [
      new CompressionPlugin({
        test: /\.(js|svg|png|jpg|webp|css|svg|jpeg)$/i,
        cache: true,
        algorithm: 'gzip',
        threshold: 4096,
        deleteOriginalAssets: true
      })
    ]: [],



    optimization: {
      minimizer: argv.mode === 'production'? [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        })
      ]: []
    },

    externals: nodeModules
  }
}