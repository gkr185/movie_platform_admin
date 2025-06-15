import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局样式
import '@/styles/index.scss'

// Pinia
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

// 全局错误处理 - 忽略 ResizeObserver 错误
const resizeObserverErrorHandler = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    return
  }
  console.error('Unhandled error:', e)
}

window.addEventListener('error', resizeObserverErrorHandler)
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver loop completed')) {
    e.preventDefault()
    return
  }
})

// Vue应用级错误处理
app.config.errorHandler = (err, vm, info) => {
  if (err.message?.includes('ResizeObserver loop completed')) {
    return
  }
  console.error('Vue error:', err, info)
}

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(store).use(router).use(ElementPlus).use(pinia).mount('#app')
