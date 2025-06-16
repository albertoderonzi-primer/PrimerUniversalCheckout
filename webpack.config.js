const path = require('path');

module.exports = {
  entry: './src/static/client-composable.js',
  output: {
    filename: 'client-composable.bundle.js',
    path: path.resolve(__dirname, 'src/static'),
  },
  mode: 'development',
}; 