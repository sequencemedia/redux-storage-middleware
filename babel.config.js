module.exports = {
  compact: true,
  comments: false,
  presets: [
    [
      '@babel/env', {
        targets: {
          node: 'current',
          browsers: [
            'last 2 versions'
          ]
        },
        useBuiltIns: 'usage',
        corejs: '3'
      }
    ]
  ],
  plugins: [
    '@babel/proposal-export-default-from',
    [
      'module-resolver', {
        root: ['./src'],
        cwd: 'babelrc',
        alias: {
          'redux-storage-middleware': './src'
        }
      }
    ]
  ]
}
