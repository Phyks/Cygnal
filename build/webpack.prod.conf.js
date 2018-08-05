'use strict'
const webpack = require('webpack')
const merge = require('webpack-merge')

process.env.NODE_ENV = 'production';

const baseWebpackConfig = require('./webpack.base.conf')
const env = require('../config/prod.env')
const utils = require('./utils')

const webpackConfig = merge(baseWebpackConfig, {
    mode: 'production',
    output: {
        filename: utils.assetsPath('js/[name].[chunkhash:4].js'),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash:4].js'),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env,
        }),
        // keep module.id stable when vendor modules does not change
        new webpack.HashedModuleIdsPlugin(),
    ]
})

if (process.env.ANALYZE) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
