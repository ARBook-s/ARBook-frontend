import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { pinia } from './api/store'
import { useAuthStore } from './api/store/auth'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import router from './api/router'

// vConsole — мобильная консоль для отладки (логи видны на экране телефона)
if (import.meta.env.DEV || new URLSearchParams(location.search).has('vconsole')) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  })
}

const app = createApp(App)
app.use(pinia)
useAuthStore().init()
app.use(router).use(Antd).mount('#app')
