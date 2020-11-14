const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        //host: '192.168.188.20',//your ip address
        host: '127.0.0.1',
        port: 8080,
        disableHostCheck: true,
        contentBase: './dist',
    }
});
