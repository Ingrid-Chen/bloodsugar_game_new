const { defineConfig } = require('@tarojs/cli')

module.exports = defineConfig(() => ({
  projectName: 'bloodsugar-guide-miniapp',
  date: '2026-08-22',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: 'webpack5',
  cssMinimizer: 'lightningcss',
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: { enable: false },
    },
  },
}))
