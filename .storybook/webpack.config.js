const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin');

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.tsx$/,
    loader: 'ts-loader',
    options: {
      transpileOnly: true,
      getCustomTransformers: () => ({
        before: [ tsImportPluginFactory({
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true
        }) ]
      }),
    },
  });

  config.resolve.extensions.push('.ts', '.tsx');

  config.module.rules.push({
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
  });

  config.module.rules.push({
    test: /\.less$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'less-loader',
        options: {
          javascriptEnabled: true
        },
      },
    ],
  });

  return config;
};
