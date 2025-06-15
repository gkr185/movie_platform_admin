import { defineStore } from 'pinia'
import { loginApi, getUserInfo } from '@/api/user'
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
    // token
    token: localStorage.getItem('token') || null
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
    
    // 检查是否为管理员
    isAdmin: (state) => {
      return state.roles.some(role => role.name === '管理员' || role.name === 'admin' || role.name === '超级管理员')
    },
    
    // 检查是否为VIP用户
    isVip: (state) => {
      return state.user?.isVip === 1
    }
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const response = await loginApi(loginForm)
        const { data } = response
        
        // 保存用户信息
        this.user = data
        this.isLoggedIn = true
        
        // 保存用户信息到localStorage
        localStorage.setItem('userInfo', JSON.stringify(data))
        
        // 如果后端返回token，保存token
        if (data.token) {
          this.token = data.token
          localStorage.setItem('token', data.token)
        }
        
        // 获取用户角色和权限
        await this.fetchUserRolesAndPermissions(data.id)
        
        return Promise.resolve(response)
      } catch (error) {
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
    logout() {
      this.user = null
      this.roles = []
      this.permissions = []
      this.isLoggedIn = false
      this.token = null
      
      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('userPermissions')
      
      // 跳转到登录页
      window.location.href = '/login'
    },

    // 从localStorage恢复用户状态
    restoreUserState() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      const userRoles = localStorage.getItem('userRoles')
      const userPermissions = localStorage.getItem('userPermissions')
      
      if (token && userInfo) {
        try {
          this.token = token
          this.user = JSON.parse(userInfo)
          this.isLoggedIn = true
          
          if (userRoles) {
            this.roles = JSON.parse(userRoles)
          }
          
          if (userPermissions) {
            this.permissions = JSON.parse(userPermissions)
          }
        } catch (error) {
          console.error('恢复用户状态失败:', error)
          this.logout()
        }
      }
    },

    // 更新用户信息
    async updateUserInfo() {
      if (this.user?.id) {
        try {
          const response = await getUserInfo(this.user.id)
          this.user = response.data
          localStorage.setItem('userInfo', JSON.stringify(this.user))
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