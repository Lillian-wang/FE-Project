var webpack = require('webpack');
var path = require('path');
const { dependencies } = require('./package.json')
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'public/dist');
var APP_DIR = path.resolve(__dirname, './public');

var config = {
    exclude: "/node_modules/",
    entry: ['babel-polyfill', APP_DIR + '/index.jsx'],
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    devServer: {
        inline: false,
        contentBase: "./dist"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                exclude: '/node_modules/',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            },
            // {
            //     test: /\.css$/,
            //     include: /node_modules/,
            //     loaders: ['style-loader', 'css-loader'],
            // },
            // {
            //     test: /\.css$/,
            //     exclude: /node_modules/,
            //     use: [
            //         'style-loader',
            //         {
            //             loader: 'css-loader',
            //             options: {
            //                 modules: true,
            //             },
            //         },
            //     ],
            // },
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract(
            //         'style-loader',
            //         combineLoaders([{
            //             loader: 'css-loader',
            //             query: {
            //                 modules: true,
            //                 localIdentName: '[name]__[local]___[hash:base64:5]'
            //             }
            //         }])
            //     )
            // }
        ]
    },
    // plugins: [
    //     new ExtractTextPlugin("styles.css")
    // ],
    proxy: {
        "/api": {
            "target": "http://localhost:8080"
        }
    },
};

module.exports = config;