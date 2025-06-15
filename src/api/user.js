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

// 获取用户信息
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

// 修改密码
export function updatePassword(userId, oldPassword, newPassword) {
  return request({
    url: `/api/users/${userId}/password`,
    method: 'put',
    params: { oldPassword, newPassword }
  })
}

// 更新用户信息
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