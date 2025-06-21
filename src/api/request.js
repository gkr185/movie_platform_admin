import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  timeout: 15000, // 增加超时时间以匹配API文档
  withCredentials: true, // 重要：支持Cookie，用于Session机制
  credentials: 'include' // 确保跨域请求携带Cookie
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // Session机制不需要手动添加Token，Cookie会自动携带
    // 确保所有请求都携带Cookie
    config.withCredentials = true
    
    // 添加Content-Type头（如果没有设置）
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    // 开发环境使用代理，生产环境直接请求对应服务
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：所有API请求都通过Vue开发服务器代理
      config.baseURL = '' // 使用相对路径，通过代理转发
    } else {
      // 生产环境：根据不同服务设置不同的baseURL
      if (config.url.includes('/api/users')) {
        config.baseURL = 'http://localhost:8062' // UserService端口
      } else if (config.url.includes('/api/rbac')) {
        config.baseURL = 'http://localhost:8067' // RBACService端口
      } else if (config.url.includes('/api/payment')) {
        config.baseURL = 'http://localhost:8066' // VIPpayService端口
      } else if (config.url.includes('/api/movies')) {
        config.baseURL = 'http://localhost:8061' // MovieService端口
      } else if (config.url.includes('/api/categories')) {
        config.baseURL = 'http://localhost:8063' // CategoriesService端口
      } else if (config.url.includes('/api/news')) {
        config.baseURL = 'http://localhost:8064' // NewsAndFeedbackService端口
      } else if (config.url.includes('/api/advertisements')) {
        config.baseURL = 'http://localhost:8065' // AdService端口
      } else if (config.url.includes('/api/files')) {
        config.baseURL = 'http://localhost:8068' // FileUploadService端口
      } else if (config.url.includes('/api/statistics')) {
        config.baseURL = 'http://localhost:8069' // StatisticsService端口
      } else {
        config.baseURL = 'http://localhost:8080' // 默认网关端口
      }
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.baseURL + config.url)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 适配Session机制
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url, response.data)
    
    const res = response.data
    
    // 如果响应中包含错误码，进行相应处理
    if (res && res.code && res.code !== 200) {
      // Session失效或未登录
      if (res.code === 401) {
        ElMessage.error('登录已过期，请重新登录')
        // 清除本地存储并跳转登录页
        localStorage.clear()
        window.location.href = '/login'
        throw new Error('登录已过期，请重新登录')
      }
      
      // 处理用户模块特定错误码
      const errorMessages = {
        1001: '用户名已存在',
        1002: '邮箱已被注册',
        1003: '用户不存在',
        1004: '密码错误',
        1006: '用户名或密码错误',
        1007: '原密码错误'
      }
      
      const errorMessage = errorMessages[res.code] || res.message || '请求失败'
      throw new Error(errorMessage)
    }
    
    // 直接返回响应数据
    return res || response.data
  },
  error => {
    console.error('响应错误:', error)
    
    let message = '请求失败'
    
    if (error.response) {
      const { status, data } = error.response
      console.log('错误响应:', status, data)
      console.log('完整错误响应:', JSON.stringify(error.response, null, 2))
      
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '登录已过期，请重新登录'
          // Session过期，清除本地状态并跳转
          localStorage.clear()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else if (error.message === 'Network Error') {
      message = '网络连接失败，请检查网络或后端服务是否启动'
    } else {
      message = error.message || '网络错误'
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    
    return Promise.reject(error)
  }
)

export default service 