// Generated using webpack-cli https://github.com/webpack/webpack-cli

import { resolve as _resolve } from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import { GenerateSW } from 'workbox-webpack-plugin';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// import configOverrides from './config-overrides.js';
import {webpackOverride} from './config-overrides.js';
import webpack from 'webpack'

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loader: _loader } = MiniCssExtractPlugin;

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction
  ? _loader
  : 'style-loader';

const config = {
  entry: './src/index.js',
  output: {
    path: _resolve(__dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        loader: "babel-loader",
        test: /\.(js)$/,
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env', '@babel/preset-react'] }
      },
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        }
      },
      // {
      //   test: /\.(ts|tsx)$/i,
      //   loader: 'ts-loader',
      //   exclude: ['/node_modules/'],
      // },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpe?g|svg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: "asset",
      },
      // {
      //   test: /\.(jpe?g|png|gif|woff|woff2|otf|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
      //   use: [
      //     {
      //       loader: "url-loader",
      //       options: {
      //         limit: 1000,
      //         name: "assets/img/[name].[ext]",
      //       },
      //     },
      //   ],
      // },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    fallback: {
      stream: 'stream-browserify',
      os: 'os-browserify/browser',
      path: 'path-browserify',
      crypto: 'crypto-browserify'
    }
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(new MiniCssExtractPlugin());

    // config.plugins.push(new GenerateSW());
  } else {
    config.mode = 'development';
  }
  // return configOverride.webpack(config);
  return config;
  // return webpackOverride(config);
};
