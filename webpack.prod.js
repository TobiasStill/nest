const {merge} = require('webpack-merge');
const path = require('path');
const static = require('./webpack.static.js');
const es2015 = require('./webpack.es2015.js');


module.exports = merge(static, es2015, {
    mode: 'production',
    entry: './src/index.ts',
    devtool: 'source-map',
    output: {
        publicPath: './',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
});
