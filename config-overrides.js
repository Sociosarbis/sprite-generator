const { mergeWithCustomize, default: merge } = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const aliasConfig = {
  src: path.join(__dirname, 'src'),
};

const serverAppBuild = path.join(__dirname, 'netlify/functions/ssr');

const extendServerWebpackConfig = {
  entry: {
    app: path.join(__dirname, 'src/entry-server.tsx'),
  },
  mode: 'development',
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
    }),
  ],
  resolve: {
    alias: aliasConfig,
  },
  output: {
    path: serverAppBuild,
    libraryTarget: 'commonjs2',
    filename: '[name].js',
  },
  optimization: {},
  plugins: [],
};

const extendClientWebpackConfig = {
  resolve: {
    alias: aliasConfig,
  },
};

const serverPlugins = [
  'ModuleNotFoundPlugin',
  'DefinePlugin',
  'IgnorePlugin',
  'MiniCssExtractPlugin',
  'ForkTsCheckerWebpackPlugin',
];
const serverMergeOptions = {
  customizeArray: (a, b, key) => {
    switch (key) {
      case 'plugins':
        return a.filter((item) =>
          serverPlugins.includes(item.constructor.name),
        );
    }
  },
  customizeObject: (a, b, key) => {
    switch (key) {
      case 'optimization':
      case 'entry':
        return b;
    }
  },
};

module.exports = {
  /** @param {import('webpack').Configuration} config */
  webpack: (config) => {
    return process.env.REACT_APP_SSR
      ? mergeWithCustomize(serverMergeOptions)(
          config,
          extendServerWebpackConfig,
        )
      : merge(config, extendClientWebpackConfig);
  },
  paths: (paths) => {
    if (process.env.REACT_APP_SSR) {
      paths.appBuild = serverAppBuild;
    }
    return paths;
  },
};
