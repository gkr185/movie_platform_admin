import axios from 'axios'

// 统计服务API基础配置
const STATISTICS_BASE_URL = '/api/statistics'

/**
 * 统计服务API
 */
export const statisticsApi = {
  /**
   * 获取每日统计数据
   * @param {string} date - 统计日期(YYYY-MM-DD格式)，可选
   */
  getDailyStatistics: (date) => {
    if (date) {
      return axios.get(`${STATISTICS_BASE_URL}/daily/${date}`)
    } else {
      return axios.get(`${STATISTICS_BASE_URL}/daily/today`)
    }
  },

  /**
   * 获取平台总统计数据
   */
  getTotalStatistics: () => {
    return axios.get(`${STATISTICS_BASE_URL}/total`)
  },

  /**
   * 获取指定日期范围的统计数据
   * @param {string} startDate - 开始日期(YYYY-MM-DD格式)
   * @param {string} endDate - 结束日期(YYYY-MM-DD格式)
   */
  getDateRangeStatistics: (startDate, endDate) => {
    return axios.get(`${STATISTICS_BASE_URL}/daily/range`, {
      params: { startDate, endDate }
    })
  },

  /**
   * 获取热门电影排行榜
   * @param {number} limit - 返回数量限制，默认10，最大50
   */
  getPopularMovies: (limit = 10) => {
    return axios.get(`${STATISTICS_BASE_URL}/movies/popular`, {
      params: { limit }
    })
  },

  /**
   * 获取用户行为分析数据
   */
  getUserBehaviorAnalysis: () => {
    return axios.get(`${STATISTICS_BASE_URL}/behavior`)
  },

  /**
   * 手动刷新统计数据
   */
  refreshStatistics: () => {
    return axios.post(`${STATISTICS_BASE_URL}/refresh`)
  },

  /**
   * 获取统计概览数据
   */
  getOverview: () => {
    return axios.get(`${STATISTICS_BASE_URL}/overview`)
  },

  /**
   * 服务健康检查
   */
  checkHealth: () => {
    return axios.get(`${STATISTICS_BASE_URL}/health`)
  }
}

export default statisticsApi 