const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
	  path: path.resolve(__dirname, 'docs'),
      filename: 'main.js',
      libraryTarget: 'var',
      library: 'EntryPoint'
    }
  };