import request from './request'

// 新闻管理 API
export const newsApi = {
  // 获取所有新闻
  getAllNews() {
    return request.get('/api/news/all')
  },

  // 获取新闻详情
  getNewsDetail(id) {
    return request.get(`/api/news/${id}`)
  },

  // 按分类获取新闻
  getNewsByCategory(categoryId) {
    return request.get(`/api/news/category/${categoryId}`)
  },

  // 搜索新闻
  searchNews(keyword) {
    return request.get(`/api/news/keyword/${keyword}`)
  },

  // 创建新闻
  createNews(data) {
    return request.post('/api/news/create', data)
  },

  // 更新新闻
  updateNews(data) {
    return request.put('/api/news/update', data)
  },

  // 删除新闻
  deleteNews(id) {
    return request.delete(`/api/news/delete/${id}`)
  }
}

// 新闻分类管理 API
export const newsCategoryApi = {
  // 获取所有分类
  getAllCategories() {
    return request.get('/api/news/categories')
  },

  // 获取活动分类
  getActiveCategories() {
    return request.get('/api/news/categories/active')
  },

  // 获取分类详情
  getCategoryDetail(id) {
    return request.get(`/api/news/categories/${id}`)
  },

  // 创建分类
  createCategory(data) {
    return request.post('/api/news/categories', data)
  },

  // 更新分类
  updateCategory(id, data) {
    return request.put(`/api/news/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id) {
    return request.delete(`/api/news/categories/${id}`)
  },

  // 更新分类状态
  updateCategoryStatus(id, status) {
    return request.patch(`/api/news/categories/${id}/status?status=${status}`)
  }
}

// 用户反馈管理 API
export const feedbackApi = {
  // 分页获取反馈列表（支持状态过滤、排序）
  getFeedbackList(params = {}) {
    // 支持的参数：page, size, sortBy, direction, status
    // page: 页码(从0开始)，默认0
    // size: 每页大小，默认10
    // sortBy: 排序字段，默认createTime
    // direction: 排序方向(asc/desc)，默认desc
    // status: 处理状态（选填），用于过滤特定状态的反馈
    return request.get('/feedback/list', { params })
  },

  // 根据用户ID获取反馈列表
  getFeedbackByUser(userId) {
    return request.get(`/feedback/user/${userId}`)
  },

  // 根据反馈类型获取反馈列表
  getFeedbackByType(type) {
    // type: 反馈类型
    // 1: 功能建议
    // 2: Bug反馈
    // 3: 内容问题
    // 4: 其他
    return request.get(`/feedback/type/${type}`)
  },

  // 根据处理状态获取反馈列表
  getFeedbackByStatus(status) {
    // status: 处理状态
    // 0: 待处理
    // 1: 处理中
    // 2: 已处理
    // 3: 已关闭
    return request.get(`/feedback/status/${status}`)
  },

  // 创建反馈
  async createFeedback(data) {
    try {
      const response = await request.post('/feedback/create', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      // 处理不同的响应格式，统一返回格式
      if (response && typeof response === 'object') {
        // 如果是标准格式 {code: 200, data: {...}}
        if (response.code !== undefined) {
          return response
        }
        
        // 如果是直接返回的对象，包装一下
        return {
          code: 200,
          message: '创建成功',
          data: response
        }
      }
      
      return response
    } catch (error) {
      console.error('创建反馈API错误:', error)
      throw error
    }
  },

  // 处理反馈
  async processFeedback(data) {
    try {
      const response = await request.post('/feedback/process', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      // 处理不同的响应格式，统一返回格式
      if (response && typeof response === 'object') {
        // 如果是标准格式 {code: 200, data: {...}}
        if (response.code !== undefined) {
          return response
        }
        
        // 如果是直接返回的处理结果对象 {feedbackId: 1, status: 1, reply: '...'}
        if (response.feedbackId !== undefined || response.status !== undefined) {
          return {
            code: 200,
            message: '处理成功',
            data: response
          }
        }
        
        // 如果是其他对象格式，包装一下
        return {
          code: 200,
          message: '处理成功',
          data: response
        }
      }
      
      return response
    } catch (error) {
      console.error('处理反馈API错误:', error)
      throw error
    }
  }
}

// 图片管理 API
export const imageApi = {
  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传图片到指定实体
  uploadImageToEntity(file, entityType, entityId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)
    formData.append('entityId', entityId)
    return request.post('/images/uploadToEntity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取新闻图片列表
  getNewsImages() {
    return request.get('/images/news')
  },

  // 获取电影图片列表
  getMovieImages() {
    return request.get('/images/movie')
  },

  // 获取广告图片列表
  getAdvertisementImages() {
    return request.get('/images/advertisement')
  }
}

// 导出所有API
export default {
  newsApi,
  newsCategoryApi,
  feedbackApi,
  imageApi
} 