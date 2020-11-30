const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
        new CopyPlugin({
            patterns: [
                {from: 'src/index.html', to: './'},
                {from: 'src/draco', to: 'public'},
                {from: 'src/model/glb', to: 'model/glb'},
                {from: 'src/assets', to: 'assets'},
                {from: 'src/css', to: 'css'},
            ],
        }),
    ],
};