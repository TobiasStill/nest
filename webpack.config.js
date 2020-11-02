const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    devServer: {
        host: '192.168.188.20',//your ip address
        //host: '127.0.0.1',
        port: 8080,
        disableHostCheck: true,
        contentBase: './dist',
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
        new HtmlWebpackPlugin({
            title: 'Development',
            template: 'src/index.html',
            inject: 'body'
        }),
        new CopyPlugin({
            patterns: [
                {from: 'src/draco', to: 'public'},
                {from: 'src/model', to: 'model'},
                {from: 'src/assets', to: 'assets'},
                {from: 'src/css', to: 'css'},
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
};