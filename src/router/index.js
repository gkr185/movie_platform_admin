import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import AdminLayout from '../components/Layout/AdminLayout.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '登录',
      requiresAuth: false 
    }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      // 仪表盘
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { 
          title: '仪表盘',
          requiresAuth: true,
          permission: 'dashboard:view'
        }
      },
      
      // 用户管理
      {
        path: '/user/list',
        name: 'UserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { 
          title: '用户列表',
          requiresAuth: true,
          permission: 'user:view'
        }
      },
      {
        path: '/user/vip',
        name: 'VipManagement',
        component: () => import('../views/user/VipManagement.vue'),
        meta: { 
          title: 'VIP管理',
          requiresAuth: true,
          permission: 'user:vip'
        }
      },
      
      // 权限管理
      {
        path: '/rbac/roles',
        name: 'RoleManagement',
        component: () => import('../views/rbac/RoleManagement.vue'),
        meta: { 
          title: '角色管理',
          requiresAuth: true,
          permission: 'rbac:role',
          adminOnly: true
        }
      },
      {
        path: '/rbac/permissions',
        name: 'PermissionManagement',
        component: () => import('../views/rbac/PermissionManagement.vue'),
        meta: { 
          title: '权限管理',
          requiresAuth: true,
          permission: 'rbac:permission',
          adminOnly: true
        }
      },
      {
        path: '/rbac/assign',
        name: 'PermissionAssign',
        component: () => import('../views/rbac/PermissionAssign.vue'),
        meta: { 
          title: '权限分配',
          requiresAuth: true,
          permission: 'rbac:assign',
          adminOnly: true
        }
      },
      
      // 电影管理
      {
        path: '/movie/list',
        name: 'MovieList',
        component: () => import('../views/movie/MovieList.vue'),
        meta: { 
          title: '电影列表',
          requiresAuth: true,
          permission: 'movie:view'
        }
      },
      {
        path: '/movie/upload',
        name: 'MovieUpload',
        component: () => import('../views/movie/MovieUpload.vue'),
        meta: { 
          title: '上传电影',
          requiresAuth: true,
          permission: 'movie:upload'
        }
      },
      {
        path: '/movie/reviews',
        name: 'ReviewManagement',
        component: () => import('../views/movie/ReviewManagement.vue'),
        meta: { 
          title: '影评管理',
          requiresAuth: true,
          permission: 'movie:review'
        }
      },
      
      // 分类管理
      {
        path: '/categories',
        name: 'CategoryManagement',
        component: () => import('../views/categories/CategoryManagement.vue'),
        meta: { 
          title: '分类管理',
          requiresAuth: true,
          permission: 'category:manage'
        }
      },
      
      // 广告管理
      {
        path: '/ad/list',
        name: 'AdList',
        component: () => import('../views/ad/AdList.vue'),
        meta: { 
          title: '广告列表',
          requiresAuth: true,
          permission: 'ad:view'
        }
      },
      {
        path: '/ad/create',
        name: 'AdCreate',
        component: () => import('../views/ad/AdCreate.vue'),
        meta: { 
          title: '创建广告',
          requiresAuth: true,
          permission: 'ad:create'
        }
      },
      {
        path: '/ad/edit/:id',
        name: 'AdEdit',
        component: () => import('../views/ad/AdEdit.vue'),
        meta: { 
          title: '编辑广告',
          requiresAuth: true,
          permission: 'ad:update'
        }
      },
      
      // 新闻资讯
      {
        path: '/news/list',
        name: 'NewsList',
        component: () => import('../views/news/NewsList.vue'),
        meta: { 
          title: '新闻列表',
          requiresAuth: true,
          permission: 'news:view'
        }
      },
      {
        path: '/news/create',
        name: 'NewsCreate',
        component: () => import('../views/news/NewsCreate.vue'),
        meta: { 
          title: '发布新闻',
          requiresAuth: true,
          permission: 'news:create'
        }
      },
      {
        path: '/news/edit/:id',
        name: 'NewsEdit',
        component: () => import('../views/news/NewsEdit.vue'),
        meta: { 
          title: '编辑新闻',
          requiresAuth: true,
          permission: 'news:update'
        }
      },
      {
        path: '/news/feedback',
        name: 'FeedbackManagement',
        component: () => import('../views/news/FeedbackManagement.vue'),
        meta: { 
          title: '用户反馈',
          requiresAuth: true,
          permission: 'news:feedback'
        }
      },
      
      // VIP支付
      {
        path: '/payment/orders',
        name: 'PaymentOrders',
        component: () => import('../views/payment/PaymentOrders.vue'),
        meta: { 
          title: '支付订单',
          requiresAuth: true,
          permission: 'payment:order'
        }
      },
      {
        path: '/payment/vip-plans',
        name: 'VipPlans',
        component: () => import('../views/payment/VipPlans.vue'),
        meta: { 
          title: 'VIP套餐',
          requiresAuth: true,
          permission: 'payment:vip'
        }
      },
      
      
      // 个人中心
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { 
          title: '个人中心',
          requiresAuth: true
        }
      }
    ]
  },
  
  // 无权限页面
  {
    path: '/no-permission',
    name: 'NoPermission',
    component: () => import('../views/NoPermission.vue'),
    meta: { title: '权限不足', requiresAuth: true }
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../views/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 恢复用户状态
  if (!authStore.isLoggedIn && authStore.token) {
    authStore.restoreUserState()
  }
  
  // 如果已登录且访问登录页，跳转到首页
  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    // 如果访问无权限页面，允许通过
    if (to.path === '/no-permission') {
      next()
      return
    }
    
    // 检查用户是否有任何权限
    const hasAnyPermission = authStore.permissions && authStore.permissions.length > 0
    const isAdmin = authStore.isAdmin
    
    // 如果用户没有任何权限且不是管理员，重定向到无权限页面
    if (!hasAnyPermission && !isAdmin && to.path !== '/no-permission') {
      next('/no-permission')
      return
    }
    
    // 检查特定页面权限
    if (to.meta.permission) {
      const hasPermission = authStore.hasPermission(to.meta.permission)
      
      // 如果是管理员专用页面，检查管理员权限
      if (to.meta.adminOnly && !isAdmin) {
        ElMessage.error('权限不足，无法访问该页面')
        next('/no-permission')
        return
      }
      
      // 检查具体权限
      if (!hasPermission && !isAdmin) {
        ElMessage.error('权限不足，无法访问该页面')
        next('/no-permission')
        return
      }
    }
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 电影平台管理系统`
  }
  
  next()
})

export default router
