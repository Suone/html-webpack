var path = require('path')
var glob = require('glob')
var utils = require('./utils')
var config = require('../config')
var HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

// 入口文件
function entries() {
    var entryPath = resolve('src/scripts')
    var entryFiles = glob.sync(entryPath + '/**/*.{js,jsx,ts}')
    var entryMaps = {}

    entryFiles.forEach(function (item) {
        entryMaps[item.substring(item.lastIndexOf('\/') + 1, item.lastIndexOf('.'))] = item
    })
    return entryMaps
}

// html_webpack_plugins
// see https://github.com/ampedandwired/html-webpack-plugin
function htmlPlugins() {
    var templatePath = resolve('src/views')
    var templateFiles = glob.sync(templatePath + '/**/*.{html,htm}')
    var pluginArr = []
    var entryMaps = entries()

    templateFiles.forEach(function (item) {
        var filenameTmp = item.substring(item.lastIndexOf('\/') + 1, item.lastIndexOf('.'))
        var conf = {
            template: item,
            filename: filenameTmp + '.html',
            minify: {
                removeComments: process.env.NODE_ENV === 'production' ? true : false,
                collapseWhitespace: process.env.NODE_ENV === 'production' ? true : false,
                removeAttributeQuotes: process.env.NODE_ENV === 'production' ? true : false,
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            }
        }
        if (filenameTmp in entryMaps) {
            conf.inject = 'body',
            conf.chunks = ['vendor', 'manifest', filenameTmp]
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            conf.chunksSortMode = 'dependency'
        }
        pluginArr.push(new HtmlWebpackPlugin(conf))
    })
    return pluginArr
}


module.exports = {
    entry: Object.assign(entries()),
    output: {
        path: config.build.assetsRoot,
        filename: 'js/[name].js',
        publicPath: process.env.NODE_ENV === 'production' ?
            config.build.assetsPublicPath : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '~src': resolve('src'),
            '~views': resolve('src/views'),
            '~styles': resolve('src/styles'),
            '~scripts': resolve('src/scripts')
        }
    },
    module: {
        rules: [{
                test: /\.(js|html)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [resolve('src'), resolve('test')],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[ext]')
                }
            }
        ]
    },
    plugins: [].concat(htmlPlugins())
}
