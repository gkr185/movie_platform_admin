import request from './request'
import { mockLogin, mockGetUserInfo } from './mock'

// 是否使用Mock数据 (在后端服务未启动时可以设为true)
const USE_MOCK = false

// 用户登录
export function loginApi(data) {
  if (USE_MOCK) {
    return mockLogin(data.username, data.password)
  }
  return request({
    url: '/api/users/login',
    method: 'post',
    data
  })
}

// 用户登出
export function logoutApi() {
  return request({
    url: '/api/users/logout',
    method: 'post'
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/api/users/current',
    method: 'get'
  })
}

// 检查登录状态
export function checkLoginStatus() {
  return request({
    url: '/api/users/login-status',
    method: 'get'
  })
}

// 获取用户信息（通过ID）
export function getUserInfo(userId) {
  if (USE_MOCK) {
    return mockGetUserInfo(userId)
  }
  return request({
    url: `/api/users/${userId}`,
    method: 'get'
  })
}

// 分页获取用户列表
export function getUserList(params = {}) {
  const { page = 0, size = 10, sort = 'createTime', direction = 'desc' } = params
  return request({
    url: '/api/users/list',
    method: 'get',
    params: { page, size, sort, direction }
  })
}

// 搜索用户
export function searchUsers(params = {}) {
  const { keyword, page = 0, size = 10, sort = 'createTime', direction = 'desc' } = params
  return request({
    url: '/api/users/search',
    method: 'get',
    params: { keyword, page, size, sort, direction }
  })
}

// 检查用户名可用性
export function checkUsername(username) {
  if (USE_MOCK) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: true
    })
  }
  return request({
    url: '/api/users/check-username',
    method: 'get',
    params: { username }
  })
}

// 用户注册
export function registerApi(data) {
  return request({
    url: '/api/users/register',
    method: 'post',
    data
  })
}

// 修改密码 - 适配Session机制，不需要userId
export function updatePassword(oldPassword, newPassword) {
  return request({
    url: '/api/users/password',
    method: 'put',
    params: { oldPassword, newPassword }
  })
}

// 更新个人资料 - 适配Session机制
export function updateProfile(data) {
  return request({
    url: '/api/users/profile',
    method: 'put',
    data
  })
}

// 更新用户信息（管理员功能，仍需userId）
export function updateUser(userId, data) {
  return request({
    url: `/api/users/${userId}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(userId) {
  return request({
    url: `/api/users/${userId}`,
    method: 'delete'
  })
}

// 设置用户VIP (JSON方式)
export function setUserVip(userId, vipData) {
  return request({
    url: `/api/users/${userId}/vip`,
    method: 'put',
    data: vipData
  })
}

// 设置用户VIP (参数方式)
export function setUserVipParams(userId, vipType, vipExpireTime) {
  return request({
    url: `/api/users/${userId}/vip/params`,
    method: 'put',
    params: {
      vipType,
      vipExpireTime
    }
  })
}

// 取消用户VIP
export function cancelUserVip(userId) {
  return request({
    url: `/api/users/${userId}/vip`,
    method: 'delete'
  })
}

// 获取用户登录日志（如果后端支持）
export function getUserLoginLogs(userId, params = {}) {
  const { page = 0, size = 10, sort = 'loginTime', direction = 'desc' } = params
  return request({
    url: `/api/users/${userId}/login-logs`,
    method: 'get',
    params: { page, size, sort, direction }
  })
}

// 获取用户活动统计（如果后端支持）
export function getUserActivity(userId) {
  return request({
    url: `/api/users/${userId}/activity`,
    method: 'get'
  })
} 