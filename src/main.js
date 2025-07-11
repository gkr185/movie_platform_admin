import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入Element Plus中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

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

// 使用Element Plus并配置中文语言包
app.use(store).use(router).use(ElementPlus, {
  locale: zhCn,
}).use(pinia)

// 在应用启动时初始化用户状态（Session机制）
import { useAuthStore } from '@/stores/auth'

// 等待应用挂载后再初始化状态
app.mount('#app')

// 初始化用户状态
const authStore = useAuthStore()
authStore.initUserState().catch(error => {
  console.error('初始化用户状态失败:', error)
})
