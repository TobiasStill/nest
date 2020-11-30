const {merge} = require('webpack-merge');
const static = require('./webpack.static.js');
const es2015 = require('./webpack.es2015.js');
const path = require('path');

module.exports = merge(es2015, static, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        //host: '192.168.188.20',//your ip address
        host: '127.0.0.1',
        port: 8080,
        disableHostCheck: true,
        contentBase: './dist',
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    }
});
