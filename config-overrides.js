const { mergeWithCustomize, default: merge } = require('webpack-merge');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const aliasConfig = {
  src: path.join(__dirname, 'src'),
};

const isDev = process.env.NODE_ENV === 'development';

const serverAppBuild = path.join(__dirname, 'netlify/functions/ssr');

const extendServerWebpackConfig = {
  entry: {
    main: path.join(__dirname, 'src/entry-server.tsx'),
  },
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i],
    }),
  ],
  resolve: {
    alias: aliasConfig,
  },
  module: {
    rules: [],
  },
  output: {
    path: serverAppBuild,
    libraryTarget: 'commonjs2',
    filename: '[name].js',
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  plugins: [],
};

const extendClientWebpackConfig = {
  resolve: {
    alias: aliasConfig,
  },
  plugins: [],
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
        return a.filter((item) => {
          return serverPlugins.includes(item.constructor.name);
        });
      case 'module.rules':
        if (isDev) {
          a.forEach((rule) => {
            if (rule.oneOf) {
              rule.oneOf.forEach((branch) => {
                if (branch.use) {
                  const i = branch.use.indexOf(require.resolve('style-loader'));
                  if (i !== -1) {
                    branch.use[i] = require.resolve('vue-style-loader');
                  }
                }
              });
            }
          });
          return a;
        }
    }
  },
  customizeObject: (a, b, key) => {
    switch (key) {
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
