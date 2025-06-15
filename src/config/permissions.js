// 系统权限配置
export const PERMISSIONS = {
  // 仪表盘权限
  DASHBOARD: {
    VIEW: 'dashboard:view'
  },
  
  // 用户管理权限
  USER: {
    VIEW: 'user:view',
    CREATE: 'user:create',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    VIP: 'user:vip',
    MANAGE: 'user:manage'
  },
  
  // RBAC权限管理
  RBAC: {
    VIEW: 'rbac:view',
    ROLE: 'rbac:role',
    PERMISSION: 'rbac:permission',
    ASSIGN: 'rbac:assign',
    MANAGE: 'rbac:manage'
  },
  
  // 电影管理权限
  MOVIE: {
    VIEW: 'movie:view',
    CREATE: 'movie:create',
    UPDATE: 'movie:update',
    DELETE: 'movie:delete',
    UPLOAD: 'movie:upload',
    REVIEW: 'movie:review',
    MANAGE: 'movie:manage'
  },
  
  // 分类管理权限
  CATEGORY: {
    VIEW: 'category:view',
    CREATE: 'category:create',
    UPDATE: 'category:update',
    DELETE: 'category:delete',
    MANAGE: 'category:manage'
  },
  
  // 广告管理权限
  AD: {
    VIEW: 'ad:view',
    CREATE: 'ad:create',
    UPDATE: 'ad:update',
    DELETE: 'ad:delete',
    MANAGE: 'ad:manage'
  },
  
  // 新闻资讯权限
  NEWS: {
    VIEW: 'news:view',
    CREATE: 'news:create',
    UPDATE: 'news:update',
    DELETE: 'news:delete',
    FEEDBACK: 'news:feedback',
    MANAGE: 'news:manage'
  },
  
  // 支付管理权限
  PAYMENT: {
    VIEW: 'payment:view',
    ORDER: 'payment:order',
    VIP: 'payment:vip',
    MANAGE: 'payment:manage'
  },
  
  // 系统设置权限
  SYSTEM: {
    SETTING: 'system:setting',
    CONFIG: 'system:config',
    LOG: 'system:log'
  }
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  // 超级管理员 - 拥有所有权限
  admin: Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  
  // 管理员 - 除系统设置外的所有权限
  manager: [
    ...Object.values(PERMISSIONS.DASHBOARD),
    ...Object.values(PERMISSIONS.USER),
    ...Object.values(PERMISSIONS.MOVIE),
    ...Object.values(PERMISSIONS.CATEGORY),
    ...Object.values(PERMISSIONS.AD),
    ...Object.values(PERMISSIONS.NEWS),
    ...Object.values(PERMISSIONS.PAYMENT)
  ],
  
  // 编辑员 - 内容管理权限
  editor: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.MOVIE.VIEW,
    PERMISSIONS.MOVIE.CREATE,
    PERMISSIONS.MOVIE.UPDATE,
    PERMISSIONS.MOVIE.REVIEW,
    PERMISSIONS.CATEGORY.VIEW,
    PERMISSIONS.CATEGORY.MANAGE,
    PERMISSIONS.NEWS.VIEW,
    PERMISSIONS.NEWS.CREATE,
    PERMISSIONS.NEWS.UPDATE,
    PERMISSIONS.AD.VIEW,
    PERMISSIONS.AD.CREATE
  ],
  
  // 普通用户 - 查看权限
  user: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.MOVIE.VIEW,
    PERMISSIONS.CATEGORY.VIEW
  ]
}

// 获取角色权限
export function getRolePermissions(roleName) {
  return ROLE_PERMISSIONS[roleName.toLowerCase()] || []
}

// 检查权限是否存在
export function isValidPermission(permission) {
  const allPermissions = Object.values(PERMISSIONS).flatMap(module => Object.values(module))
  return allPermissions.includes(permission)
} 