const path = require('path');

module.exports = {
  entry: './public/js/wallet.js',
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'public/dist'), 
    publicPath: '/dist/',
  },
  mode: 'development', //'production'
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    fallback: {
      "fs": false, // Disable Node.js modules that are not needed in the browser
      "path": false,
      "os": false,
    },
  },
};
