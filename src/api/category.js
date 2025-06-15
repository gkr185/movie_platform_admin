import request from './request'

// ==================== 分类管理API ====================

/**
 * 创建分类
 * @param {Object} categoryData 分类数据
 */
export function createCategory(categoryData) {
  return request({
    url: '/api/categories',
    method: 'post',
    data: categoryData
  })
}

/**
 * 更新分类
 * @param {number} categoryId 分类ID
 * @param {Object} categoryData 分类数据
 */
export function updateCategory(categoryId, categoryData) {
  return request({
    url: `/api/categories/${categoryId}`,
    method: 'put',
    data: categoryData
  })
}

/**
 * 删除分类
 * @param {number} categoryId 分类ID
 */
export function deleteCategory(categoryId) {
  return request({
    url: `/api/categories/${categoryId}`,
    method: 'delete'
  })
}

/**
 * 获取分类详情
 * @param {number} categoryId 分类ID
 */
export function getCategoryDetail(categoryId) {
  return request({
    url: `/api/categories/${categoryId}`,
    method: 'get'
  })
}

/**
 * 获取所有分类
 */
export function getAllCategories() {
  return request({
    url: '/api/categories',
    method: 'get'
  })
}

/**
 * 获取子分类
 * @param {number} parentId 父分类ID
 */
export function getSubCategories(parentId) {
  return request({
    url: `/api/categories/sub/${parentId}`,
    method: 'get'
  })
}

/**
 * 获取活动分类
 */
export function getActiveCategories() {
  return request({
    url: '/api/categories/active',
    method: 'get'
  })
}

// ==================== 电影分类关联管理API ====================

/**
 * 添加电影分类关联
 * @param {number} movieId 电影ID
 * @param {number} categoryId 分类ID
 */
export function addMovieCategoryAssociation(movieId, categoryId) {
  return request({
    url: '/api/movie-categories',
    method: 'post',
    data: { movieId, categoryId }
  })
}

/**
 * 批量添加电影分类关联
 * @param {number} movieId 电影ID
 * @param {Array} categoryIds 分类ID数组
 */
export function batchAddMovieCategoryAssociations(movieId, categoryIds) {
  return request({
    url: '/api/movie-categories/batch',
    method: 'post',
    data: { movieId, categoryIds }
  })
}

/**
 * 删除电影分类关联
 * @param {number} movieId 电影ID
 * @param {number} categoryId 分类ID
 */
export function removeMovieCategoryAssociation(movieId, categoryId) {
  return request({
    url: '/api/movie-categories',
    method: 'delete',
    params: { movieId, categoryId }
  })
}

/**
 * 批量删除电影分类关联
 * @param {number} movieId 电影ID
 * @param {Array} categoryIds 分类ID数组
 */
export function batchRemoveMovieCategoryAssociations(movieId, categoryIds) {
  return request({
    url: '/api/movie-categories/batch',
    method: 'delete',
    params: { movieId },
    data: categoryIds
  })
}

/**
 * 删除电影所有分类关联
 * @param {number} movieId 电影ID
 */
export function removeAllMovieCategoryAssociations(movieId) {
  return request({
    url: `/api/movie-categories/movie/${movieId}`,
    method: 'delete'
  })
}

/**
 * 更新电影分类关联
 * @param {number} movieId 电影ID
 * @param {Array} categoryIds 分类ID数组
 */
export function updateMovieCategoryAssociations(movieId, categoryIds) {
  return request({
    url: `/api/movie-categories/movie/${movieId}`,
    method: 'put',
    data: categoryIds
  })
}

/**
 * 获取电影的所有分类
 * @param {number} movieId 电影ID
 */
export function getMovieCategories(movieId) {
  return request({
    url: `/api/movie-categories/movie/${movieId}`,
    method: 'get'
  })
}

/**
 * 获取电影的所有分类(包含详细信息) - 安全接口
 * 解决Hibernate懒加载序列化问题
 * @param {number} movieId 电影ID
 */
export function getMovieCategoriesWithInfo(movieId) {
  return request({
    url: `/api/movie-categories/movie/${movieId}/with-info`,
    method: 'get'
  })
}

/**
 * 获取分类下的所有电影
 * @param {number} categoryId 分类ID
 */
export function getCategoryMovies(categoryId) {
  return request({
    url: `/api/movie-categories/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 检查电影分类关联是否存在
 * @param {number} movieId 电影ID
 * @param {number} categoryId 分类ID
 */
export function checkMovieCategoryAssociation(movieId, categoryId) {
  return request({
    url: '/api/movie-categories/exists',
    method: 'get',
    params: { movieId, categoryId }
  })
}

/**
 * 统计分类下的电影数量
 * @param {number} categoryId 分类ID
 */
export function getCategoryMovieCount(categoryId) {
  return request({
    url: `/api/movie-categories/count/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 统计电影的分类数量
 * @param {number} movieId 电影ID
 */
export function getMovieCategoryCount(movieId) {
  return request({
    url: `/api/movie-categories/count/movie/${movieId}`,
    method: 'get'
  })
}

// ==================== 兼容性导出 ====================

// 为了向后兼容，保留原有的categoryApi对象
export const categoryApi = {
  getCategories: getAllCategories,
  getActiveCategories,
  getCategoryById: getCategoryDetail,
  getSubCategories,
  createCategory,
  updateCategory,
  deleteCategory
}

export default categoryApi 