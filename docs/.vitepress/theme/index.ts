import DefaultTheme from 'vitepress/theme'
import './custom.css'
import type { Theme } from 'vitepress'
import HomeScreen from './components/HomeScreen.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeScreen', HomeScreen)
  },
} satisfies Theme
