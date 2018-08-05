'use strict'
const path = require('path')
const svg2png = require('svg2png')
const webpack = require('webpack')

const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const utils = require('./utils')
const config = require('../config')

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        app: './src/main.js'
    },
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[name].js'),
        publicPath: config.build.assetsPublicPath,
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                sourceMap: true,
                parallel: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
        splitChunks: {
            chunks: 'initial',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]|[\\/]css\/vendor[\\/]/,
                },
            },
        },
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': utils.resolve('src'),
        }
    },
    stats: {
        children: false,
    },
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [utils.resolve('src')],
                options: {
                    formatter: require('eslint-friendly-formatter'),
                    emitWarning: true,
                },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: file => (
                    /node_modules/.test(file) &&
                    !/\.vue\.js/.test(file)
                ),
            },
            {
                test: /\.css$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'vue-style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 1 },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [require("autoprefixer")()],
                        },
                    },
                ],
            },
            {
                test: /\.styl(us)?/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'vue-style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 1 },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [require("autoprefixer")()],
                        },
                    },
                    'stylus-loader',
                ],
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: utils.assetsPath('images/[name].[hash:4].[ext]'),
                            // Images larger than 10 KB won’t be inlined
                            limit: 10 * 1024,
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            disable: process.env.NODE_ENV !== 'production',
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "svg-url-loader",
                        options: {
                            name: utils.assetsPath('images/[name].[hash:4].[ext]'),
                            // Images larger than 10 KB won’t be inlined
                            limit: 10 * 1024,
                            noquotes: true,
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            disable: process.env.NODE_ENV !== 'production',
                        },
                    },
                ],
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024,
                    name: utils.assetsPath('media/[name].[hash:4].[ext]'),
                },
            },
            {
                test: /\.(woff2?|eot|ttf|otf)$/,
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024,
                    name: utils.assetsPath('fonts/[name].[hash:4].[ext]'),
                },
            },
        ],
    },
    node: {
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: utils.assetsPath('css/[name].[contenthash:4].css'),
            chunkFilename: utils.assetsPath('css/[name].[contenthash:4].css'),
        }),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            ogURL: config.build.ogURL,
            ogImage: config.build.ogImage,
            inject: true,
            minify: (
                process.env.NODE_ENV === 'production'
                ? {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    html5: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                }
                : {}
            ),
        }),
        new AppManifestWebpackPlugin({
            logo: path.resolve(__dirname, '../src/assets/logo.svg'),
            prefix: '.',
            output: '/static/icons-[hash:8]/',
            inject: true,
            persistentCache: true,
            config: {
                appName: 'Cyclassist',
                appDescription: "Track and share issues (work, interruption in routes, parked cars) on bike lanes in realtime.",
                developerName: 'Phyks (Lucas Verney)',
                developerURL: 'https://phyks.me',
            }
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            },
            {
                from: path.resolve(__dirname, '../src/assets/logo.svg'),
                to: path.join(config.build.assetsSubDirectory, 'ogIcon.png'),
                transform (content, path) {
                    return Promise.resolve(svg2png(content, { width: 400, height: 400 }));
                }
            },
            {
                from: path.resolve(__dirname, '../humans.txt'),
                to: config.build.assetsRoot,
                ignore: ['.*']
            },
            {
                from: path.resolve(__dirname, '../robots.txt'),
                to: config.build.assetsRoot,
                ignore: ['.*']
            }
        ]),
        // Only keep the useful locales from Moment.
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
}
