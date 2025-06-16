import request from '@/api/request'

// 获取电影评论列表（分页）
export function getMovieComments(movieId, params = {}) {
  const { page = 1, size = 10, sort = 'time' } = params
  return request({
    url: `/api/comments/movies/${movieId}`,
    method: 'get',
    params: {
      page,
      size,
      sort
    }
  })
}

// 获取所有评论列表（管理后台用）
export function getAllComments(params = {}) {
  const { page = 1, size = 10, sort = 'time', keyword = '', status = '' } = params
  return request({
    url: '/api/comments/admin/list',
    method: 'get',
    params: {
      page,
      size,
      sort,
      keyword,
      status
    }
  })
}

// 获取评论详情
export function getCommentDetail(id) {
  return request({
    url: `/api/comments/${id}`,
    method: 'get'
  })
}

// 获取评论统计信息
export function getCommentStatistics() {
  return request({
    url: '/api/comments/admin/statistics',
    method: 'get'
  })
}

// 发表评论
export function createComment(data) {
  return request({
    url: '/api/comments',
    method: 'post',
    data
  })
}

// 删除评论
export function deleteComment(id) {
  return request({
    url: `/api/comments/${id}`,
    method: 'delete'
  })
}

// 批量删除评论
export function batchDeleteComments(ids) {
  return request({
    url: '/api/comments/batch/delete',
    method: 'delete',
    data: {
      ids: ids
    }
  })
}

// 点赞评论
export function likeComment(id) {
  return request({
    url: `/api/comments/${id}/like`,
    method: 'post'
  })
}

// 点踩评论
export function dislikeComment(id) {
  return request({
    url: `/api/comments/${id}/dislike`,
    method: 'post'
  })
}

// 审核评论（通过/拒绝）
export function auditComment(id, status, remark = '') {
  // 后端期望字符串格式的状态
  return request({
    url: `/api/comments/${id}/audit`,
    method: 'put',
    data: { 
      status: status, // 直接使用字符串状态
      remark
    }
  })
}

// 批量审核评论
export function batchAuditComments(ids, status) {
  // 确保状态为字符串格式，后端期望字符串
  const requestData = {
    ids,
    status: status // 直接使用字符串状态，不转换为数字
  }
  console.log('批量审核API调用，请求数据:', JSON.stringify(requestData, null, 2))
  console.log('发送状态:', status, '类型:', typeof status)
  
  return request({
    url: '/api/comments/batch/audit',
    method: 'put',
    data: requestData
  })
}

// 举报评论
export function reportComment(id, reason, type = '') {
  return request({
    url: `/api/comments/${id}/report`,
    method: 'post',
    data: { 
      reason,
      type
    }
  })
}

// 获取用户评论列表
export function getUserComments(userId, params = {}) {
  const { page = 1, size = 10 } = params
  return request({
    url: `/api/comments/users/${userId}`,
    method: 'get',
    params: {
      page,
      size
    }
  })
} 