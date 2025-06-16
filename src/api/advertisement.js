import request from './request'

// 广告状态枚举
export const AD_STATUS = {
  DISABLED: 0,    // 未生效/禁用
  ENABLED: 1      // 生效/启用
}

// 广告位置枚举
export const AD_POSITIONS = {
  HOME_CAROUSEL: '首页轮播',
  SIDEBAR: '侧边栏',
  TOP_BANNER: '顶部横幅',
  PRE_ROLL: '播放前广告',
  PAUSE_AD: '播放暂停广告'
}

// 广告状态标签
export const AD_STATUS_LABELS = {
  [AD_STATUS.DISABLED]: '禁用',
  [AD_STATUS.ENABLED]: '启用'
}

// 广告状态颜色
export const AD_STATUS_COLORS = {
  [AD_STATUS.DISABLED]: 'danger',
  [AD_STATUS.ENABLED]: 'success'
}

// 广告位置选项
export const AD_POSITION_OPTIONS = [
  { label: '首页轮播', value: '首页轮播' },
  { label: '侧边栏', value: '侧边栏' },
  { label: '顶部横幅', value: '顶部横幅' },
  { label: '播放前广告', value: '播放前广告' },
  { label: '播放暂停广告', value: '播放暂停广告' }
]

// 广告管理 API
export const advertisementApi = {
  /**
   * 分页获取广告列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码(从0开始)，默认0
   * @param {number} params.size - 每页大小，默认10
   * @param {string} params.sortBy - 排序字段，默认createTime
   * @param {string} params.direction - 排序方向(asc/desc)，默认desc
   * @returns {Promise} 分页广告列表
   */
  async getAdvertisementList(params = {}) {
    const defaultParams = {
      page: 0,
      size: 10,
      sortBy: 'createTime',
      direction: 'desc'
    }
    const queryParams = { ...defaultParams, ...params }
    
    try {
      const response = await request.get('/api/advertisements', { params: queryParams })
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取广告列表API错误:', error)
      throw error
    }
  },

  /**
   * 获取所有图片广告
   * @returns {Promise} 图片广告列表
   */
  async getImageAdvertisements() {
    try {
      const response = await request.get('/api/advertisements/images')
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取图片广告API错误:', error)
      throw error
    }
  },

  /**
   * 随机获取视频广告
   * @returns {Promise} 随机视频广告
   */
  async getRandomVideoAdvertisement() {
    try {
      const response = await request.get('/api/advertisements/video/random')
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取随机视频广告API错误:', error)
      throw error
    }
  },

  /**
   * 创建广告
   * @param {Object} data - 广告数据
   * @param {string} data.title - 广告标题
   * @param {string} data.imageUrl - 图片URL（必填）
   * @param {string} data.videoUrl - 视频URL（选填）
   * @param {string} data.linkUrl - 链接URL（选填）
   * @param {string} data.position - 广告位置（必填）
   * @param {number} data.sortOrder - 排序权重
   * @param {string} data.startTime - 开始投放时间
   * @param {string} data.endTime - 结束投放时间
   * @param {number} data.status - 广告状态
   * @returns {Promise} 创建结果
   */
  async createAdvertisement(data) {
    try {
      const response = await request.post('/api/advertisements', data)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('创建广告API错误:', error)
      throw error
    }
  },

  /**
   * 更新广告
   * @param {number} id - 广告ID
   * @param {Object} data - 广告数据
   * @returns {Promise} 更新结果
   */
  async updateAdvertisement(id, data) {
    try {
      const response = await request.put(`/api/advertisements/${id}`, data)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('更新广告API错误:', error)
      throw error
    }
  },

  /**
   * 删除广告
   * @param {number} id - 广告ID
   * @returns {Promise} 删除结果
   */
  async deleteAdvertisement(id) {
    try {
      const response = await request.delete(`/api/advertisements/${id}`)
      // 删除操作成功时，后端可能只返回200状态码，没有特定响应体
      // 直接返回成功格式
      return {
        code: 200,
        message: '删除成功',
        data: response || {}
      }
    } catch (error) {
      console.error('删除广告API错误:', error)
      throw error
    }
  },

  /**
   * 获取广告详情
   * @param {number} id - 广告ID
   * @returns {Promise} 广告详情
   */
  async getAdvertisementDetail(id) {
    try {
      const response = await request.get(`/api/advertisements/${id}`)
      return this.normalizeResponse(response)
    } catch (error) {
      console.error('获取广告详情API错误:', error)
      throw error
    }
  },

  /**
   * 批量更新广告状态
   * @param {Array} ids - 广告ID数组
   * @param {number} status - 目标状态
   * @returns {Promise} 批量更新结果
   */
  async batchUpdateStatus(ids, status) {
    try {
      const promises = ids.map(id => 
        this.updateAdvertisement(id, { status })
      )
      return Promise.all(promises)
    } catch (error) {
      console.error('批量更新广告状态API错误:', error)
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
      
      // 如果是分页格式 {content: [...], totalElements: 5}
      if (response.content !== undefined) {
        return {
          code: 200,
          message: '获取成功',
          data: response
        }
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
        message: '操作成功',
        data: response
      }
    }
    
    return response
  }
}

// 广告工具方法
export const advertisementHelper = {
  /**
   * 格式化广告数据用于表格显示
   * @param {Array} advertisements - 原始广告数据
   * @returns {Array} 格式化后的广告数据
   */
  formatAdvertisementsForTable(advertisements) {
    return advertisements.map(ad => ({
      ...ad,
      statusLabel: AD_STATUS_LABELS[ad.status] || '未知',
      statusColor: AD_STATUS_COLORS[ad.status] || 'default',
      createTimeFormatted: new Date(ad.createTime).toLocaleString('zh-CN'),
      updateTimeFormatted: new Date(ad.updateTime).toLocaleString('zh-CN'),
      startTimeFormatted: ad.startTime ? new Date(ad.startTime).toLocaleString('zh-CN') : '-',
      endTimeFormatted: ad.endTime ? new Date(ad.endTime).toLocaleString('zh-CN') : '-',
      hasVideo: !!ad.videoUrl,
      hasLink: !!ad.linkUrl
    }))
  },

  /**
   * 验证广告数据
   * @param {Object} data - 广告数据
   * @returns {Object} 验证结果
   */
  validateAdvertisementData(data) {
    const errors = []
    
    if (!data.title || data.title.trim() === '') {
      errors.push('广告标题不能为空')
    }
    
    if (!data.imageUrl || data.imageUrl.trim() === '') {
      errors.push('图片URL不能为空')
    }
    
    if (!data.position || data.position.trim() === '') {
      errors.push('广告位置不能为空')
    }
    
    if (data.sortOrder !== undefined && (isNaN(data.sortOrder) || data.sortOrder < 0)) {
      errors.push('排序权重必须是非负数')
    }
    
    if (data.startTime && data.endTime) {
      const startTime = new Date(data.startTime)
      const endTime = new Date(data.endTime)
      if (startTime >= endTime) {
        errors.push('开始时间必须早于结束时间')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * 获取广告类型
   * @param {Object} ad - 广告对象
   * @returns {string} 广告类型
   */
  getAdvertisementType(ad) {
    if (ad.videoUrl) {
      return '视频广告'
    } else if (ad.linkUrl) {
      return '链接广告'
    } else {
      return '图片广告'
    }
  },

  /**
   * 检查广告是否在投放期内
   * @param {Object} ad - 广告对象
   * @returns {boolean} 是否在投放期内
   */
  isAdvertisementActive(ad) {
    if (ad.status !== AD_STATUS.ENABLED) {
      return false
    }
    
    const now = new Date()
    const startTime = ad.startTime ? new Date(ad.startTime) : null
    const endTime = ad.endTime ? new Date(ad.endTime) : null
    
    if (startTime && now < startTime) {
      return false
    }
    
    if (endTime && now > endTime) {
      return false
    }
    
    return true
  }
}

// 导出所有内容
export default {
  advertisementApi,
  advertisementHelper,
  AD_STATUS,
  AD_POSITIONS,
  AD_STATUS_LABELS,
  AD_STATUS_COLORS,
  AD_POSITION_OPTIONS
} 