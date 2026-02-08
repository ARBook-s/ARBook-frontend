import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { pinia } from './api/store'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import router from './api/router'

createApp(App).use(pinia).use(router).use(Antd).mount('#app')
