import { defineStore } from 'pinia'
import { loginApi, logoutApi, getCurrentUser, checkLoginStatus } from '@/api/user'
import { getUserRoles, getUserPermissions } from '@/api/rbac'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户信息
    user: null,
    // 用户角色
    roles: [],
    // 用户权限
    permissions: [],
    // 登录状态
    isLoggedIn: false,
    // Session ID (如果后端返回)
    sessionId: null
  }),

  getters: {
    // 获取用户ID
    userId: (state) => state.user?.id,
    
    // 获取用户名
    username: (state) => state.user?.username,
    
    // 检查是否有某个权限
    hasPermission: (state) => (permissionCode) => {
      return state.permissions.includes(permissionCode)
    },
    
    // 检查是否有某个角色
    hasRole: (state) => (roleName) => {
      return state.roles.some(role => role.name === roleName)
    },
    
    // 检查是否为管理员（只要不是普通用户都可以）
    isAdmin: (state) => {
      // 如果没有角色，认为是普通用户
      if (!state.roles || state.roles.length === 0) {
        return false
      }
      // 只要不是普通用户，都认为有管理权限
      return !state.roles.every(role => 
        role.name === '普通用户' || 
        role.name === 'user' || 
        role.name === '用户' ||
        role.name === 'normal_user'
      )
    },
    
    // 检查是否为VIP用户
    isVip: (state) => {
      return state.user?.isVip === 1
    },
    
    // 检查是否为超级管理员
    isSuperAdmin: (state) => {
      return state.roles.some(role => 
        role.name === '超级管理员' || 
        role.name === 'super_admin' || 
        role.name === 'superadmin' ||
        role.name === '系统管理员'
      )
    }
  },

  actions: {
    // 检查登录状态
    async checkLoginStatus() {
      try {
        const response = await checkLoginStatus()
        const isLoggedIn = response.data
        this.isLoggedIn = isLoggedIn
        
        if (isLoggedIn) {
          // 如果已登录，获取当前用户信息
          await this.getCurrentUserInfo()
        } else {
          // 如果未登录，清除状态
          this.clearUserState()
        }
        
        return isLoggedIn
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.clearUserState()
        return false
      }
    },

    // 获取当前用户信息
    async getCurrentUserInfo() {
      try {
        const response = await getCurrentUser()
        const userInfo = response.data
        console.log('获取当前用户信息:', userInfo)
        
        this.user = userInfo
        this.isLoggedIn = true
        
        // 保存用户信息到localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        
        // 获取用户角色和权限
        if (userInfo.id) {
          await this.fetchUserRolesAndPermissions(userInfo.id)
        }
        
        return response
      } catch (error) {
        console.error('获取当前用户信息失败:', error)
        this.clearUserState()
        throw error
      }
    },

    // 登录
    async login(loginForm) {
      try {
        const response = await loginApi(loginForm)
        const { data } = response
        
        console.log('登录响应:', response)
        
        // Session机制下登录成功后的处理
        if (data) {
          // 保存Session ID（如果返回）
          if (data.sessionId) {
            this.sessionId = data.sessionId
          }
          
          // 如果登录响应包含用户信息
          if (data.user) {
            this.user = data.user
            this.isLoggedIn = true
            localStorage.setItem('userInfo', JSON.stringify(data.user))
            
            // 获取用户角色和权限
            await this.fetchUserRolesAndPermissions(data.user.id)
          } else if (data.id) {
            // 如果只返回基本信息，设置用户状态
            this.user = data
            this.isLoggedIn = true
            localStorage.setItem('userInfo', JSON.stringify(data))
            
            // 获取用户角色和权限
            await this.fetchUserRolesAndPermissions(data.id)
          } else {
            // 如果没有用户信息，主动获取
            await this.getCurrentUserInfo()
          }
        }
        
        return Promise.resolve(response)
      } catch (error) {
        this.clearUserState()
        return Promise.reject(error)
      }
    },

    // 获取用户角色和权限
    async fetchUserRolesAndPermissions(userId) {
      try {
        // 并行获取角色和权限
        const [rolesResponse, permissionsResponse] = await Promise.all([
          getUserRoles(userId),
          getUserPermissions(userId)
        ])
        
        this.roles = rolesResponse.data || []
        this.permissions = permissionsResponse.data || []
        
        // 保存到localStorage
        localStorage.setItem('userRoles', JSON.stringify(this.roles))
        localStorage.setItem('userPermissions', JSON.stringify(this.permissions))
        
      } catch (error) {
        console.error('获取用户角色权限失败:', error)
        // 如果获取权限失败，设置空权限
        this.roles = []
        this.permissions = []
      }
    },

    // 退出登录
    async logout() {
      try {
        // 调用后端登出接口
        await logoutApi()
      } catch (error) {
        console.error('后端登出失败:', error)
      } finally {
        // 无论后端是否成功，都要清除前端状态
        this.clearUserState()
        
        // 跳转到登录页
        window.location.href = '/login'
      }
    },

    // 清除用户状态
    clearUserState() {
      this.user = null
      this.roles = []
      this.permissions = []
      this.isLoggedIn = false
      this.sessionId = null
      
      // 清除localStorage
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('userPermissions')
    },

    // 从localStorage恢复用户状态（Session机制下不推荐）
    restoreUserState() {
      // Session机制下，推荐使用checkLoginStatus而不是从localStorage恢复
      // 保留此方法仅用于兼容性
      const userInfo = localStorage.getItem('userInfo')
      const userRoles = localStorage.getItem('userRoles')
      const userPermissions = localStorage.getItem('userPermissions')
      
      if (userInfo) {
        try {
          this.user = JSON.parse(userInfo)
          // 注意：这里不设置isLoggedIn，应该通过checkLoginStatus确认
          
          if (userRoles) {
            this.roles = JSON.parse(userRoles)
          }
          
          if (userPermissions) {
            this.permissions = JSON.parse(userPermissions)
          }
        } catch (error) {
          console.error('恢复用户状态失败:', error)
          this.clearUserState()
        }
      }
    },

    // 初始化用户状态
    async initUserState() {
      try {
        // 首先检查登录状态
        const isLoggedIn = await this.checkLoginStatus()
        return isLoggedIn
      } catch (error) {
        console.error('初始化用户状态失败:', error)
        return false
      }
    },

    // 更新用户信息
    async updateUserInfo() {
      if (this.isLoggedIn) {
        try {
          await this.getCurrentUserInfo()
        } catch (error) {
          console.error('更新用户信息失败:', error)
        }
      }
    },

    // 刷新权限
    async refreshPermissions() {
      if (this.user?.id) {
        await this.fetchUserRolesAndPermissions(this.user.id)
      }
    }
  }
}) 