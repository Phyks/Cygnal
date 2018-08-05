'use strict'
// Template version: 1.2.8
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {
    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
  },

  build: {
    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: process.env.PUBLIC_PATH || '/',

    // OpenGraph-related variables
    ogURL: 'https://cyclo.phyks.me',
    ogImage: 'https://cyclo.phyks.me/static/ogIcon.png',
  }
}
