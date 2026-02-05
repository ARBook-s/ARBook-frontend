import { createRouter, createWebHistory } from 'vue-router'
import ArView from '../../views/ArView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: ArView }],
})
