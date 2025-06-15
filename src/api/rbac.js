import request from './request'
import { mockGetUserRoles, mockGetUserPermissions } from './mock'

// 是否使用Mock数据
const USE_MOCK = false

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

// 获取所有角色
export function getAllRoles() {
  if (USE_MOCK) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: [
        { id: 1, name: '超级管理员', description: '系统超级管理员，拥有所有权限', status: 1 },
        { id: 2, name: '管理员', description: '普通管理员权限', status: 1 },
        { id: 3, name: '编辑员', description: '内容编辑权限', status: 1 }
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
        { id: 1, name: '查看仪表盘', code: 'dashboard:view', description: '查看系统仪表盘', parentId: 0 },
        { id: 2, name: '查看用户', code: 'user:view', description: '查看用户列表', parentId: 0 },
        { id: 3, name: '管理用户', code: 'user:manage', description: '管理用户信息', parentId: 0 }
      ]
    })
  }
  return request({
    url: '/api/rbac/permissions',
    method: 'get'
  })
}

// 注册权限
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