import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './store'
import router from './api/router'
import './style.css'

createApp(App).use(pinia).use(router).mount('#app')
