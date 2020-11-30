const path = require('path');

module.exports = {
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: [
                    "@babel/preset-typescript",
                    ['@babel/env', {
                        corejs: 3,
                        useBuiltIns: "usage",
                        targets: {
                            esmodules: true,
                        },
                    }],
                ],
                plugins: [
                    "@babel/plugin-proposal-class-properties"
                ]
            },
        }],

    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
};