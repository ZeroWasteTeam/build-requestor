module.exports = {
    entry: './src/index.js',
    output: {
      //path: './docs',
      filename: 'main.js',
      libraryTarget: 'var',
      library: 'EntryPoint'
    }
  };