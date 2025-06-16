import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  timeout: 10000, // 请求超时时间
  withCredentials: true // 跨域请求时发送cookies
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
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

// 响应拦截器 - 简化版本
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url, response.data)
    
    // 直接返回响应数据，不做过多处理
    return response.data
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
          message = '未授权，请重新登录'
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