module.exports = {
  'compact': true,
  'comments': false,
  'presets': [
    [
      '@babel/env', {
        useBuiltIns: 'entry',
        targets: {
          node: 'current',
          'browsers': [
            'last 2 versions'
          ]
        },
        corejs: '3.1.1'
      }
    ]
  ],
  'plugins': [
    [
      'module-resolver', {
        root: ['./src'],
        cwd: 'babelrc',
        'alias': {
          'redux-storage-middleware': './src'
        }
      }
    ]
  ]
}
