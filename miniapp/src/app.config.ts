export default defineAppConfig({
  pages: ['pages/index/index'],
  subPackages: [
    {
      root: 'pages/analytics',
      pages: ['index', 'feedback'],
    },
    {
      root: 'pages/knowledge',
      pages: ['detail'],
    },
    {
      root: 'pages/support',
      pages: ['feedback'],
    },
  ],
  window: {
    navigationBarBackgroundColor: '#FDFBF7',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '控糖生存指南',
    backgroundColor: '#FDFBF7',
    backgroundTextStyle: 'light',
  },
})
