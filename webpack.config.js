// webpack.config.js (ESM)
import path from 'path';
import { fileURLToPath } from 'url';

/** Поддержка __dirname в ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('webpack').Configuration} */
export default {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};
