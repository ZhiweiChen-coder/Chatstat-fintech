const { VueLoaderPlugin } = require('vue-loader');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    main: './src/entrypoint-vue.js',
    macgyver: './src/entrypoint-node.js',
  },
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, "dist"),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  "targets": {
                    "browsers": "last 2 versions"
                  }
                }
              ]
            ],
          },
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    //new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: [".js", ".vue"],
  },
  externals: {
    /*
    '@momsfriendlydevco/vue-setpath': {
      commonjs: '@momsfriendlydevco/vue-setpath',
      commonjs2: '@momsfriendlydevco/vue-setpath',
      amd: '@momsfriendlydevco/vue-setpath',
    },
    */
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
    moment: {
      commonjs: 'moment',
      commonjs2: 'moment',
      amd: 'moment',
      root: 'moment',
    },
    /*
    'vue-input-facade': {
      commonjs: 'vue-input-facade',
      commonjs2: 'vue-input-facade',
      amd: 'vue-input-facade',
    },
    */
  },
};
