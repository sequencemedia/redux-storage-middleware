module.exports = {
  compact: true,
  comments: false,
  presets: [
    [
      '@babel/env', {
        useBuiltIns: 'usage',
        targets: {
          node: '12.18.1',
          browsers: [
            'last 2 versions'
          ]
        },
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
