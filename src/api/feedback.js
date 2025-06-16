import request from './request'

// 反馈类型枚举
export const FEEDBACK_TYPES = {
  SUGGESTION: 1,    // 功能建议
  BUG: 2,          // Bug反馈
  CONTENT: 3,      // 内容问题
  OTHER: 4         // 其他
}

// 反馈状态枚举
export const FEEDBACK_STATUS = {
  PENDING: 0,      // 待处理
  PROCESSING: 1,   // 处理中
  COMPLETED: 2,    // 已处理
  CLOSED: 3        // 已关闭
}

// 反馈类型标签
export const FEEDBACK_TYPE_LABELS = {
  [FEEDBACK_TYPES.SUGGESTION]: '功能建议',
  [FEEDBACK_TYPES.BUG]: 'Bug反馈',
  [FEEDBACK_TYPES.CONTENT]: '内容问题',
  [FEEDBACK_TYPES.OTHER]: '其他'
}

// 反馈状态标签
export const FEEDBACK_STATUS_LABELS = {
  [FEEDBACK_STATUS.PENDING]: '待处理',
  [FEEDBACK_STATUS.PROCESSING]: '处理中',
  [FEEDBACK_STATUS.COMPLETED]: '已处理',
  [FEEDBACK_STATUS.CLOSED]: '已关闭'
}

// 反馈状态颜色
export const FEEDBACK_STATUS_COLORS = {
  [FEEDBACK_STATUS.PENDING]: 'warning',
  [FEEDBACK_STATUS.PROCESSING]: 'info',
  [FEEDBACK_STATUS.COMPLETED]: 'success',
  [FEEDBACK_STATUS.CLOSED]: 'info'
}

// 反馈管理 API
export const feedbackApi = {
  /**
   * 分页获取反馈列表（支持状态过滤、排序）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码(从0开始)，默认0
   * @param {number} params.size - 每页大小，默认10
   * @param {string} params.sortBy - 排序字段，默认createTime
   * @param {string} params.direction - 排序方向(asc/desc)，默认desc
   * @param {number} params.status - 处理状态（选填），用于过滤特定状态的反馈
   * @returns {Promise} 分页反馈列表
   */
  async getFeedbackList(params = {}) {
    const defaultParams = {
      page: 0,
      size: 10,
      sortBy: 'createTime',
      direction: 'desc'
    }
    const queryParams = { ...defaultParams, ...params }
    
    try {
      const response = await request.get('/feedback/list', { params: queryParams })
      
      // 处理不同的响应格式，统一返回格式
      if (response && typeof response === 'object') {
        // 如果直接返回分页对象格式 {content: [...], totalElements: 5}
        if (response.content !== undefined) {
          return {
            code: 200,
            message: '获取成功',
            data: {
              content: response.content || [],
              totalElements: response.totalElements || 0,
              totalPages: response.totalPages || 0,
              size: response.size || queryParams.size,
              number: response.number || 0,
              first: response.first || false,
              last: response.last || false
            }
          }
        }
        
        // 如果是标准格式 {code: 200, data: {...}}
        if (response.code !== undefined) {
          return response
        }
        
        // 如果是数组格式 [...]
        if (Array.isArray(response)) {
          return {
            code: 200,
            message: '获取成功',
            data: {
              content: response,
              totalElements: response.length,
              totalPages: 1,
              size: response.length,
              number: 0,
              first: true,
              last: true
            }
          }
        }
      }
      
      return response
    } catch (error) {
      console.error('获取反馈列表API错误:', error)
      throw error
    }
  },

  /**
   * 根据用户ID获取反馈列表
   * @param {number} userId - 用户ID
   * @returns {Promise} 用户反馈列表
   */
  async getFeedbackByUser(userId) {
    try {
      const response = await request.get(`/feedback/user/${userId}`)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取用户反馈API错误:', error)
      throw error
    }
  },

  /**
   * 根据反馈类型获取反馈列表
   * @param {number} type - 反馈类型 (1:功能建议 2:Bug反馈 3:内容问题 4:其他)
   * @returns {Promise} 指定类型的反馈列表
   */
  async getFeedbackByType(type) {
    try {
      const response = await request.get(`/feedback/type/${type}`)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取类型反馈API错误:', error)
      throw error
    }
  },

  /**
   * 根据处理状态获取反馈列表
   * @param {number} status - 处理状态 (0:待处理 1:处理中 2:已处理 3:已关闭)
   * @returns {Promise} 指定状态的反馈列表
   */
  async getFeedbackByStatus(status) {
    try {
      const response = await request.get(`/feedback/status/${status}`)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取状态反馈API错误:', error)
      throw error
    }
  },

  /**
   * 标准化响应格式
   * @param {*} response - 原始响应
   * @returns {Object} 标准化后的响应
   */
  normalizeResponse(response) {
    if (response && typeof response === 'object') {
      // 如果是标准格式 {code: 200, data: {...}}
      if (response.code !== undefined) {
        return response
      }
      
      // 如果是数组格式 [...]
      if (Array.isArray(response)) {
        return {
          code: 200,
          message: '获取成功',
          data: response
        }
      }
      
      // 如果是对象但没有code字段，包装一下
      return {
        code: 200,
        message: '获取成功',
        data: response
      }
    }
    
    return response
  },

  /**
   * 创建反馈
   * @param {Object} data - 反馈数据
   * @param {number} data.userId - 用户ID
   * @param {string} data.content - 反馈内容
   * @param {number} data.type - 反馈类型
   * @param {string} data.contact - 联系方式
   * @param {number} data.status - 处理状态
   * @returns {Promise} 创建结果
   */
  async createFeedback(data) {
    try {
      const response = await request.post('/feedback/create', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('创建反馈API错误:', error)
      throw error
    }
  },

  /**
   * 处理反馈
   * @param {Object} data - 处理数据
   * @param {number} data.feedbackId - 反馈ID
   * @param {number} data.status - 处理状态
   * @param {string} data.reply - 回复内容
   * @returns {Promise} 处理结果
   */
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

// 便捷方法
export const feedbackHelper = {
  /**
   * 获取待处理反馈数量
   * @returns {Promise} 待处理反馈列表
   */
  async getPendingFeedbackCount() {
    try {
      const response = await feedbackApi.getFeedbackByStatus(FEEDBACK_STATUS.PENDING)
      return response.data ? response.data.length : 0
    } catch (error) {
      console.error('获取待处理反馈数量失败:', error)
      return 0
    }
  },

  /**
   * 获取Bug反馈列表
   * @returns {Promise} Bug反馈列表
   */
  getBugFeedbacks() {
    return feedbackApi.getFeedbackByType(FEEDBACK_TYPES.BUG)
  },

  /**
   * 获取功能建议列表
   * @returns {Promise} 功能建议列表
   */
  getSuggestionFeedbacks() {
    return feedbackApi.getFeedbackByType(FEEDBACK_TYPES.SUGGESTION)
  },

  /**
   * 批量处理反馈
   * @param {Array} feedbacks - 反馈列表
   * @param {number} status - 目标状态
   * @param {string} reply - 回复内容
   * @returns {Promise} 批量处理结果
   */
  async batchProcessFeedbacks(feedbacks, status, reply = '') {
    const promises = feedbacks.map(feedback => 
      feedbackApi.processFeedback({
        feedbackId: feedback.id,
        status: status,
        reply: reply
      })
    )
    return Promise.all(promises)
  },

  /**
   * 格式化反馈数据用于表格显示
   * @param {Array} feedbacks - 原始反馈数据
   * @returns {Array} 格式化后的反馈数据
   */
  formatFeedbacksForTable(feedbacks) {
    return feedbacks.map(feedback => ({
      ...feedback,
      typeLabel: FEEDBACK_TYPE_LABELS[feedback.type] || '未知',
      statusLabel: FEEDBACK_STATUS_LABELS[feedback.status] || '未知',
      statusColor: FEEDBACK_STATUS_COLORS[feedback.status] || 'default',
      createTimeFormatted: new Date(feedback.createTime).toLocaleString('zh-CN'),
      replyTimeFormatted: feedback.replyTime ? new Date(feedback.replyTime).toLocaleString('zh-CN') : '-'
    }))
  },

  /**
   * 获取反馈统计信息
   * @returns {Promise} 反馈统计数据
   */
  async getFeedbackStatistics() {
    try {
      const [allFeedbacks, pendingFeedbacks, bugFeedbacks, suggestionFeedbacks] = await Promise.all([
        feedbackApi.getFeedbackList({ page: 0, size: 1000 }),
        feedbackApi.getFeedbackByStatus(FEEDBACK_STATUS.PENDING),
        feedbackApi.getFeedbackByType(FEEDBACK_TYPES.BUG),
        feedbackApi.getFeedbackByType(FEEDBACK_TYPES.SUGGESTION)
      ])

      return {
        total: allFeedbacks.data?.totalElements || 0,
        pending: pendingFeedbacks.data?.length || 0,
        bugs: bugFeedbacks.data?.length || 0,
        suggestions: suggestionFeedbacks.data?.length || 0
      }
    } catch (error) {
      console.error('获取反馈统计信息失败:', error)
      return {
        total: 0,
        pending: 0,
        bugs: 0,
        suggestions: 0
      }
    }
  }
}

// 导出所有内容
export default {
  feedbackApi,
  feedbackHelper,
  FEEDBACK_TYPES,
  FEEDBACK_STATUS,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_COLORS
} 