'use strict'
const path = require('path')
const portfinder = require('portfinder')
const webpack = require('webpack')
const merge = require('webpack-merge')

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const baseWebpackConfig = require('./webpack.base.conf')
const config = require('../config')
const env = require('../config/dev.env');

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: 'development',

    // cheap-module-eval-source-map is faster for development
    devtool: 'cheap-module-eval-source-map',

    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: path.posix.join(config.build.assetsPublicPath, 'index.html') },
            ],
        },
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: HOST || config.dev.host,
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: { warnings: false, errors: true },
        publicPath: config.build.assetsPublicPath,
        quiet: true, // necessary for FriendlyErrorsPlugin
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
})

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            // add port to devServer config
            devWebpackConfig.devServer.port = port

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                },
            }))

            resolve(devWebpackConfig)
        }
    })
})
