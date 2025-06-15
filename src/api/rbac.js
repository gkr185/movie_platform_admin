import request from './request'
import { mockGetUserRoles, mockGetUserPermissions } from './mock'

// 是否使用Mock数据（开发环境可设为true，生产环境应为false）
const USE_MOCK = false

// ==================== 权限检查接口 ====================

// 检查用户权限
export function checkPermission(userId, permissionCode) {
  if (USE_MOCK) {
    return mockGetUserPermissions(userId).then(res => ({
      code: 200,
      message: 'success',
      data: res.data.includes(permissionCode)
    }))
  }
  return request({
    url: '/api/rbac/check/permission',
    method: 'get',
    params: { userId, permissionCode }
  })
}

// 检查用户角色
export function checkRole(userId, roleName) {
  if (USE_MOCK) {
    return mockGetUserRoles(userId).then(res => ({
      code: 200,
      message: 'success',
      data: res.data.some(role => role.name === roleName)
    }))
  }
  return request({
    url: '/api/rbac/check/role',
    method: 'get',
    params: { userId, roleName }
  })
}

// 获取用户权限列表
export function getUserPermissions(userId) {
  if (USE_MOCK) {
    return mockGetUserPermissions(userId)
  }
  return request({
    url: `/api/rbac/users/${userId}/permissions`,
    method: 'get'
  })
}

// 获取用户角色列表
export function getUserRoles(userId) {
  if (USE_MOCK) {
    return mockGetUserRoles(userId)
  }
  return request({
    url: `/api/rbac/users/${userId}/roles`,
    method: 'get'
  })
}

// ==================== 用户角色管理接口 ====================  

// 分配用户角色
export function assignRolesToUser(userId, roleIds) {
  return request({
    url: `/api/rbac/users/${userId}/roles`,
    method: 'post',
    data: roleIds
  })
}

// 移除用户角色
export function removeRolesFromUser(userId, roleIds) {
  return request({
    url: `/api/rbac/users/${userId}/roles`,
    method: 'delete',
    data: roleIds
  })
}

// ==================== 角色权限管理接口 ====================

// 分配角色权限
export function assignPermissionsToRole(roleId, permissionIds) {
  return request({
    url: `/api/rbac/roles/${roleId}/permissions`,
    method: 'post',
    data: permissionIds
  })
}

// 移除角色权限
export function removePermissionsFromRole(roleId, permissionIds) {
  return request({
    url: `/api/rbac/roles/${roleId}/permissions`,
    method: 'delete',
    data: permissionIds
  })
}

// 获取角色权限
export function getRolePermissions(roleId) {
  return request({
    url: `/api/rbac/roles/${roleId}/permissions`,
    method: 'get'
  })
}

// ==================== 查询接口 ====================

// 获取所有角色
export function getAllRoles() {
  if (USE_MOCK) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: [
        { id: 1, name: '超级管理员', description: '系统超级管理员，拥有所有权限', status: 1, createTime: '2024-01-01T00:00:00', updateTime: '2024-01-01T00:00:00' },
        { id: 2, name: '管理员', description: '普通管理员权限', status: 1, createTime: '2024-01-01T00:00:00', updateTime: '2024-01-01T00:00:00' },
        { id: 3, name: 'VIP用户', description: '享有高清观看、下载等特权', status: 1, createTime: '2024-01-01T00:00:00', updateTime: '2024-01-01T00:00:00' }
      ]
    })
  }
  return request({
    url: '/api/rbac/roles',
    method: 'get'
  })
}

// 获取所有权限
export function getAllPermissions() {
  if (USE_MOCK) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: [
        { id: 1, name: '观看电影', code: 'movie:view', description: '允许观看电影内容', parentId: 0 },
        { id: 2, name: '评论电影', code: 'movie:comment', description: '允许对电影进行评论', parentId: 0 },
        { id: 3, name: '高清观看', code: 'vip:hd_watch', description: 'VIP专享高清画质', parentId: 1 },
        { id: 4, name: '下载电影', code: 'vip:download', description: 'VIP专享下载功能', parentId: 1 },
        { id: 5, name: '用户管理', code: 'user:manage', description: '管理用户信息', parentId: 0 },
        { id: 6, name: '角色管理', code: 'rbac:role', description: '管理系统角色', parentId: 0 }
      ]
    })
  }
  return request({
    url: '/api/rbac/permissions',
    method: 'get'
  })
}

// ==================== 角色CRUD管理接口 ====================

// 创建角色
export function createRole(roleData) {
  return request({
    url: '/api/rbac/roles',
    method: 'post',
    data: `name=${encodeURIComponent(roleData.name)}&description=${encodeURIComponent(roleData.description)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 更新角色
export function updateRole(roleId, roleData) {
  return request({
    url: `/api/rbac/roles/${roleId}`,
    method: 'put',
    data: `name=${encodeURIComponent(roleData.name)}&description=${encodeURIComponent(roleData.description)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 删除角色
export function deleteRole(roleId) {
  return request({
    url: `/api/rbac/roles/${roleId}`,
    method: 'delete'
  })
}

// 更新角色状态
export function updateRoleStatus(roleId, status) {
  return request({
    url: `/api/rbac/roles/${roleId}/status`,
    method: 'put',
    params: { status }
  })
}

// 获取角色详情
export function getRoleDetail(roleId) {
  return request({
    url: `/api/rbac/roles/${roleId}`,
    method: 'get'
  })
}

// ==================== 权限CRUD管理接口 ====================

// 更新权限
export function updatePermission(permissionId, permissionData) {
  return request({
    url: `/api/rbac/permissions/${permissionId}`,
    method: 'put',
    data: `name=${encodeURIComponent(permissionData.name)}&description=${encodeURIComponent(permissionData.description)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 删除权限
export function deletePermission(permissionId) {
  return request({
    url: `/api/rbac/permissions/${permissionId}`,
    method: 'delete'
  })
}

// 获取权限详情
export function getPermissionDetail(permissionId) {
  return request({
    url: `/api/rbac/permissions/${permissionId}`,
    method: 'get'
  })
}

// ==================== 权限注册接口 ====================

// 注册单个权限
export function registerPermission(code, name, description, parentId = 0) {
  return request({
    url: '/api/rbac/permissions/register',
    method: 'post',
    params: { code, name, description, parentId }
  })
}

// 批量注册权限
export function batchRegisterPermissions(permissions) {
  return request({
    url: '/api/rbac/permissions/batch-register',
    method: 'post',
    data: permissions
  })
} 