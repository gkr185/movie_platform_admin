/**
 * 服务状态检查工具
 */
import axios from 'axios'

const services = [
  { name: '统计服务', port: 8069, path: '/api/statistics/health' },
  { name: '用户服务', port: 8062, path: '/api/users/health' },
  { name: '电影服务', port: 8061, path: '/api/movies/health' },
  { name: '分类服务', port: 8063, path: '/api/categories/health' },
  { name: '新闻服务', port: 8064, path: '/api/news/health' },
  { name: '广告服务', port: 8065, path: '/api/advertisements/health' },
  { name: '支付服务', port: 8066, path: '/api/payment/health' },
  { name: '权限服务', port: 8067, path: '/api/rbac/health' },
  { name: '文件服务', port: 8068, path: '/api/files/health' }
]

/**
 * 检查单个服务状态
 */
export const checkService = async (service) => {
  try {
    const response = await axios.get(`http://localhost:${service.port}${service.path}`, {
      timeout: 5000
    })
    return {
      ...service,
      status: 'UP',
      data: response.data
    }
  } catch (error) {
    return {
      ...service,
      status: 'DOWN',
      error: error.message
    }
  }
}

/**
 * 检查所有服务状态
 */
export const checkAllServices = async () => {
  const results = await Promise.all(
    services.map(service => checkService(service))
  )
  return results
}

/**
 * 获取服务统计
 */
export const getServiceStats = (results) => {
  const total = results.length
  const up = results.filter(r => r.status === 'UP').length
  const down = total - up
  
  return {
    total,
    up,
    down,
    upPercentage: Math.round((up / total) * 100)
  }
}

export default {
  checkService,
  checkAllServices,
  getServiceStats,
  services
} 