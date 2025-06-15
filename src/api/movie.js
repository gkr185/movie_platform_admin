import request from './request'

// 电影管理接口

/**
 * 创建电影
 * @param {Object} movieData 电影数据
 */
export function createMovie(movieData) {
  return request({
    url: '/api/movies',
    method: 'post',
    data: movieData
  })
}

/**
 * 获取电影详情
 * @param {number} movieId 电影ID
 */
export function getMovieDetail(movieId) {
  return request({
    url: `/api/movies/${movieId}`,
    method: 'get'
  })
}

/**
 * 更新电影信息
 * @param {number} movieId 电影ID
 * @param {Object} movieData 电影数据
 */
export function updateMovie(movieId, movieData) {
  return request({
    url: `/api/movies/${movieId}`,
    method: 'put',
    data: movieData
  })
}

/**
 * 删除电影
 * @param {number} movieId 电影ID
 */
export function deleteMovie(movieId) {
  return request({
    url: `/api/movies/${movieId}`,
    method: 'delete'
  })
}

/**
 * 分页获取所有电影
 * @param {Object} params 查询参数
 */
export function getMovieList(params = {}) {
  return request({
    url: '/api/movies',
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      ...params
    }
  })
}

/**
 * 关键词搜索电影
 * @param {string} keyword 搜索关键词
 */
export function searchMovies(keyword) {
  return request({
    url: '/api/movies/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 按分类查询电影
 * @param {number} categoryId 分类ID
 */
export function getMoviesByCategory(categoryId) {
  return request({
    url: `/api/movies/categories/${categoryId}`,
    method: 'get'
  })
}

/**
 * 获取电影分类
 * @param {number} movieId 电影ID
 */
export function getMovieCategories(movieId) {
  return request({
    url: `/api/movies/getCategories/${movieId}`,
    method: 'get'
  })
}

/**
 * 获取所有电影分类
 */
export function getAllMovieCategories() {
  return request({
    url: '/api/movies/getCategories/1',
    method: 'get'
  })
}

/**
 * 获取热门电影
 */
export function getHotMovies() {
  return request({
    url: '/api/movies/rankings/hot',
    method: 'get'
  })
}

/**
 * 获取推荐电影
 */
export function getRecommendedMovies() {
  return request({
    url: '/api/movies/rankings/recommended',
    method: 'get'
  })
}

/**
 * 获取最新电影
 */
export function getNewMovies() {
  return request({
    url: '/api/movies/rankings/new',
    method: 'get'
  })
}

// 评论管理接口

/**
 * 发表评论
 * @param {Object} commentData 评论数据
 */
export function createComment(commentData) {
  return request({
    url: '/api/comments',
    method: 'post',
    data: commentData
  })
}

/**
 * 获取电影评论
 * @param {number} movieId 电影ID
 * @param {Object} params 查询参数
 */
export function getMovieComments(movieId, params = {}) {
  return request({
    url: `/api/comments/movies/${movieId}`,
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      sort: params.sort || 'time',
      ...params
    }
  })
}

/**
 * 点赞评论
 * @param {number} commentId 评论ID
 */
export function likeComment(commentId) {
  return request({
    url: `/api/comments/${commentId}/like`,
    method: 'post'
  })
}

/**
 * 点踩评论
 * @param {number} commentId 评论ID
 */
export function dislikeComment(commentId) {
  return request({
    url: `/api/comments/${commentId}/dislike`,
    method: 'post'
  })
}

/**
 * 删除评论
 * @param {number} commentId 评论ID
 */
export function deleteComment(commentId) {
  return request({
    url: `/api/comments/${commentId}`,
    method: 'delete'
  })
}

// 收藏管理接口

/**
 * 添加收藏
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 */
export function addFavorite(userId, movieId) {
  return request({
    url: `/api/favorites/${userId}/favorites/${movieId}`,
    method: 'post'
  })
}

/**
 * 取消收藏
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 */
export function removeFavorite(userId, movieId) {
  return request({
    url: `/api/favorites/${userId}/favorites/${movieId}`,
    method: 'delete'
  })
}

/**
 * 获取用户收藏列表
 * @param {number} userId 用户ID
 */
export function getUserFavorites(userId) {
  return request({
    url: `/api/favorites/${userId}/favorites`,
    method: 'get'
  })
}

/**
 * 检查收藏状态
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 */
export function checkFavoriteStatus(userId, movieId) {
  return request({
    url: `/api/favorites/${userId}/favorites/${movieId}/exists`,
    method: 'get'
  })
}

// 观看历史接口

/**
 * 添加/更新观看记录
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 * @param {Object} params 观看参数
 */
export function updateWatchHistory(userId, movieId, params = {}) {
  return request({
    url: `/api/history/${userId}/movies/${movieId}`,
    method: 'post',
    params: {
      progress: params.progress || 0,
      playTime: params.playTime || 0
    }
  })
}

/**
 * 获取观看历史(分页)
 * @param {number} userId 用户ID
 * @param {Object} params 查询参数
 */
export function getWatchHistory(userId, params = {}) {
  return request({
    url: `/api/history/${userId}/movies/page`,
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      ...params
    }
  })
}

/**
 * 时间范围查询观看历史
 * @param {number} userId 用户ID
 * @param {Object} params 查询参数
 */
export function getWatchHistoryByTimeRange(userId, params = {}) {
  return request({
    url: `/api/history/${userId}/movies/time-range`,
    method: 'get',
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      page: params.page || 1,
      size: params.size || 5,
      ...params
    }
  })
}

/**
 * 删除观看记录
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 */
export function deleteWatchHistory(userId, movieId) {
  return request({
    url: `/api/history/${userId}/movies/${movieId}`,
    method: 'delete'
  })
}

/**
 * 批量删除观看记录
 * @param {number} userId 用户ID
 * @param {Array} movieIds 电影ID数组
 */
export function batchDeleteWatchHistory(userId, movieIds) {
  return request({
    url: `/api/history/${userId}/movies/batch`,
    method: 'delete',
    data: movieIds
  })
}

/**
 * 清空观看历史
 * @param {number} userId 用户ID
 */
export function clearWatchHistory(userId) {
  return request({
    url: `/api/history/${userId}/movies`,
    method: 'delete'
  })
}

/**
 * 获取特定观看记录
 * @param {number} userId 用户ID
 * @param {number} movieId 电影ID
 */
export function getSpecificWatchHistory(userId, movieId) {
  return request({
    url: `/api/history/${userId}/movies/${movieId}`,
    method: 'get'
  })
} 