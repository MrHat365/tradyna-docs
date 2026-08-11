import { defineConfig } from 'vitepress'

const binanceProxy = {
  '/binance-api': {
    target: 'https://api.binance.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/binance-api/, ''),
  },
}

export default defineConfig({
  base: '/tradyna-docs/',
  lang: 'zh-CN',
  title: 'Tradyna',
  description: '多交易所永续合约 DOM 交易终端 · 用户手册',
  cleanUrls: true,
  lastUpdated: false,
  appearance: false,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/tradyna-docs/brand/logo.svg' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+SC:wght@300;400;500;600&display=swap',
      },
    ],
    ['meta', { name: 'theme-color', content: '#07090D' }],
  ],
  vite: {
    server: { proxy: binanceProxy },
    preview: { proxy: binanceProxy },
  },
  themeConfig: {
    logo: '/brand/logo.svg',
    siteTitle: 'Tradyna',
    nav: [
      { text: '快速开始', link: '/guide/getting-started' },
      {
        text: 'DOM 终端',
        link: 'https://trader.tradyna.cc/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      { text: '经典网格', link: '/guide/classic-grid' },
      { text: '高级网格', link: '/guide/pro-grid' },
      { text: '常见问题', link: '/guide/faq' },
    ],
    sidebar: [
      {
        text: '入门',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '登录与界面导览', link: '/guide/login' },
        ],
      },
      {
        text: '交易',
        items: [
          { text: 'DOM 交易终端', link: '/guide/dom' },
          { text: '账户与权限', link: '/guide/accounts' },
        ],
      },
      {
        text: '策略',
        items: [
          { text: '经典网格', link: '/guide/classic-grid' },
          { text: '高级网格', link: '/guide/pro-grid' },
        ],
      },
      {
        text: '更多',
        items: [
          { text: '控制台', link: '/guide/console' },
          { text: '常见问题', link: '/guide/faq' },
        ],
      },
    ],
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            backButtonTitle: '返回',
            noResultsText: '没有结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    outline: {
      label: '本页目录',
      level: [2, 3],
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
  },
})
