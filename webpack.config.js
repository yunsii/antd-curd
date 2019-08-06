const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin');
const nodeExternals = require('webpack-node-externals');

const moduleName = "index";

const webpackConfig = {
  mode: "production",
  entry: "./src/index.tsx",
  output: {
    filename: `${moduleName}.js`,
    library: moduleName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.tsx$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: () => ({
            before: [ tsImportPluginFactory({
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: true
            }) ]
          }),
        },
      },
      {
        loader: 'babel-loader',
        exclude: /node_modules/,
        test: /\.(js|jsx)$/,
        options: {
          presets: ['@babel/react'],
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ['@babel/plugin-proposal-class-properties'],
            ['import', {
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: true
            }]
          ]
        },
      },
      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ],
        include: [
          path.resolve(__dirname, './src'),
          /[\\/]node_modules[\\/].*antd/
        ]
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
        ],
        include: [
          path.resolve(__dirname, './src'),
        ]
      },
    ]
  },
  externals: [nodeExternals()],
};

module.exports = webpackConfig;
