// Mock数据，用于开发测试
export const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    registerTime: '2024-01-01T10:00:00',
    lastLoginTime: '2024-01-15T15:30:00',
    userStatus: 1,
    isVip: 1,
    vipExpireTime: '2024-12-31T23:59:59'
  },
  {
    id: 2,
    username: 'manager',
    password: '123456',
    email: 'manager@example.com',
    phone: '13800138001',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    registerTime: '2024-01-01T10:00:00',
    lastLoginTime: '2024-01-15T15:30:00',
    userStatus: 1,
    isVip: 0
  },
  {
    id: 3,
    username: 'editor',
    password: '123456',
    email: 'editor@example.com',
    phone: '13800138002',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    registerTime: '2024-01-01T10:00:00',
    lastLoginTime: '2024-01-15T15:30:00',
    userStatus: 1,
    isVip: 0
  }
]

// Mock角色数据
export const MOCK_ROLES = {
  1: [ // admin用户的角色
    {
      id: 1,
      name: '超级管理员',
      description: '系统超级管理员，拥有所有权限',
      status: 1,
      createTime: '2024-01-01T00:00:00'
    }
  ],
  2: [ // manager用户的角色
    {
      id: 2,
      name: '管理员',
      description: '普通管理员权限',
      status: 1,
      createTime: '2024-01-01T00:00:00'
    }
  ],
  3: [ // editor用户的角色
    {
      id: 3,
      name: '编辑员',
      description: '内容编辑权限',
      status: 1,
      createTime: '2024-01-01T00:00:00'
    }
  ]
}

// Mock权限数据
export const MOCK_PERMISSIONS = {
  1: [ // admin用户的权限
    'dashboard:view',
    'user:view', 'user:create', 'user:update', 'user:delete', 'user:vip',
    'rbac:view', 'rbac:role', 'rbac:permission', 'rbac:assign',
    'movie:view', 'movie:create', 'movie:update', 'movie:delete', 'movie:upload', 'movie:review',
    'category:view', 'category:create', 'category:update', 'category:delete', 'category:manage',
    'ad:view', 'ad:create', 'ad:update', 'ad:delete',
    'news:view', 'news:create', 'news:update', 'news:delete', 'news:feedback',
    'payment:view', 'payment:order', 'payment:vip',
    'system:setting', 'system:config', 'system:log'
  ],
  2: [ // manager用户的权限
    'dashboard:view',
    'user:view', 'user:create', 'user:update', 'user:vip',
    'movie:view', 'movie:create', 'movie:update', 'movie:upload', 'movie:review',
    'category:view', 'category:manage',
    'ad:view', 'ad:create',
    'news:view', 'news:create', 'news:update', 'news:feedback',
    'payment:view', 'payment:order', 'payment:vip'
  ],
  3: [ // editor用户的权限
    'dashboard:view',
    'movie:view', 'movie:create', 'movie:update', 'movie:review',
    'category:view', 'category:manage',
    'news:view', 'news:create', 'news:update',
    'ad:view', 'ad:create'
  ]
}

// Mock API函数
export const mockLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.username === username && u.password === password)
      if (user) {
        const { password: pwd, ...userInfo } = user
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            ...userInfo,
            token: `mock_token_${user.id}_${Date.now()}`
          }
        })
      } else {
        reject({
          code: 401,
          message: '用户名或密码错误'
        })
      }
    }, 1000) // 模拟网络延迟
  })
}

export const mockGetUserRoles = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: MOCK_ROLES[userId] || []
      })
    }, 500)
  })
}

export const mockGetUserPermissions = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: MOCK_PERMISSIONS[userId] || []
      })
    }, 500)
  })
}

export const mockGetUserInfo = (userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.id === userId)
      if (user) {
        const { password, ...userInfo } = user
        resolve({
          code: 200,
          message: 'success',
          data: userInfo
        })
      } else {
        reject({
          code: 404,
          message: '用户不存在'
        })
      }
    }, 500)
  })
} 