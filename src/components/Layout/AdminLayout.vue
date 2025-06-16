<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <i class="el-icon-film" v-if="!isCollapse"></i>
        <span v-if="!isCollapse">电影平台管理</span>
        <i class="el-icon-film" v-else></i>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard" v-if="hasPermission('dashboard:view')">
          <el-icon><Platform /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <!-- 用户管理 -->
        <el-sub-menu index="user" v-if="hasAnyPermission(['user:view', 'user:manage', 'user:vip'])">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list" v-if="hasPermission('user:view')">
            <el-icon><List /></el-icon>
            <template #title>用户列表</template>
          </el-menu-item>
          <el-menu-item index="/user/vip" v-if="hasPermission('user:vip')">
            <el-icon><CreditCard /></el-icon>
            <template #title>VIP管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 权限管理 -->
        <el-sub-menu index="rbac" v-if="hasAnyPermission(['rbac:view', 'rbac:manage', 'rbac:role', 'rbac:permission', 'rbac:assign']) || isAdmin">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </template>
          <el-menu-item index="/rbac/roles" v-if="hasPermission('rbac:role') || isAdmin">
            <el-icon><User /></el-icon>
            <template #title>角色管理</template>
          </el-menu-item>
          <el-menu-item index="/rbac/permissions" v-if="hasPermission('rbac:permission') || isAdmin">
            <el-icon><Lock /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
          <el-menu-item index="/rbac/assign" v-if="hasPermission('rbac:assign') || isAdmin">
            <el-icon><Setting /></el-icon>
            <template #title>权限分配</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 电影管理 -->
        <el-sub-menu index="movie" v-if="hasAnyPermission(['movie:view', 'movie:manage', 'movie:upload', 'movie:review'])">
          <template #title>
            <el-icon><VideoPlay /></el-icon>
            <span>电影管理</span>
          </template>
          <el-menu-item index="/movie/list" v-if="hasPermission('movie:view')">
            <el-icon><List /></el-icon>
            <template #title>电影列表</template>
          </el-menu-item>
          <el-menu-item index="/movie/upload" v-if="hasPermission('movie:upload')">
            <el-icon><Upload /></el-icon>
            <template #title>上传电影</template>
          </el-menu-item>
          <el-menu-item index="/movie/reviews" v-if="hasPermission('movie:review')">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>影评管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 分类管理 -->
        <el-menu-item index="/categories" v-if="hasPermission('category:manage')">
          <el-icon><Grid /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>

        <!-- 广告管理 -->
        <el-sub-menu index="ad" v-if="hasAnyPermission(['ad:view', 'ad:manage', 'ad:create'])">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>广告管理</span>
          </template>
          <el-menu-item index="/ad/list" v-if="hasPermission('ad:view')">
            <el-icon><List /></el-icon>
            <template #title>广告列表</template>
          </el-menu-item>
          <el-menu-item index="/ad/create" v-if="hasPermission('ad:create')">
            <el-icon><Plus /></el-icon>
            <template #title>创建广告</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 新闻资讯 -->
        <el-sub-menu index="news" v-if="hasAnyPermission(['news:view', 'news:create', 'news:update', 'news:delete', 'news:feedback', 'news:manage'])">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>新闻资讯</span>
          </template>
          <el-menu-item index="/news/list" v-if="hasPermission('news:view')">
            <el-icon><List /></el-icon>
            <template #title>新闻列表</template>
          </el-menu-item>
          <el-menu-item index="/news/create" v-if="hasPermission('news:create')">
            <el-icon><EditPen /></el-icon>
            <template #title>发布新闻</template>
          </el-menu-item>
          <el-menu-item index="/news/feedback" v-if="hasPermission('news:feedback')">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>用户反馈</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- VIP支付 -->
        <el-sub-menu index="payment" v-if="hasAnyPermission(['payment:view', 'payment:manage', 'payment:order', 'payment:vip'])">
          <template #title>
            <el-icon><CreditCard /></el-icon>
            <span>支付管理</span>
          </template>
          <el-menu-item index="/payment/orders" v-if="hasPermission('payment:order')">
            <el-icon><List /></el-icon>
            <template #title>支付订单</template>
          </el-menu-item>
          <el-menu-item index="/payment/vip-plans" v-if="hasPermission('payment:vip')">
            <el-icon><CreditCard /></el-icon>
            <template #title>VIP套餐</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统设置 -->
        <el-menu-item index="/settings" v-if="hasPermission('system:setting') || isAdmin">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="{ path: item.path }">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="30" :src="userAvatar" />
              <span class="username">{{ displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import {
  Platform, User, Lock, VideoPlay, Grid, Picture, Document, 
  CreditCard, Setting, Expand, Fold, ArrowDown, List, EditPen, ChatDotRound,
  Plus, Upload
} from '@element-plus/icons-vue'

export default {
  name: 'AdminLayout',
  components: {
    Platform, User, Lock, VideoPlay, Grid, Picture, Document,
    CreditCard, Setting, Expand, Fold, ArrowDown, List, EditPen, ChatDotRound,
    Plus, Upload
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const isCollapse = ref(false)
    
    const activeMenu = computed(() => route.path)
    
    const breadcrumbs = computed(() => {
      const matched = route.matched.filter(item => item.name)
      return matched.map(item => ({
        path: item.path,
        title: item.meta?.title || item.name
      }))
    })
    
    // 用户显示名称
    const displayName = computed(() => {
      return authStore.username || '管理员'
    })
    
    // 用户头像
    const userAvatar = computed(() => {
      return authStore.user?.avatar || '/api/placeholder/30/30'
    })
    
    // 是否为管理员
    const isAdmin = computed(() => authStore.isAdmin)
    
    // 检查权限
    const hasPermission = (permissionCode) => {
      return authStore.hasPermission(permissionCode) || authStore.isAdmin
    }
    
    // 检查是否有任意一个权限
    const hasAnyPermission = (permissions) => {
      return permissions.some(permission => hasPermission(permission)) || authStore.isAdmin
    }
    
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
    }
    
    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          // 跳转到个人中心
          router.push('/profile')
          break
        case 'logout':
          // 退出登录确认
          ElMessageBox.confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            authStore.logout()
          })
          break
      }
    }
    
    // 初始化时恢复用户状态
    onMounted(() => {
      authStore.restoreUserState()
    })
    
    return {
      isCollapse,
      activeMenu,
      breadcrumbs,
      displayName,
      userAvatar,
      isAdmin,
      hasPermission,
      hasAnyPermission,
      toggleCollapse,
      handleCommand
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.28s;
  
  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #434953;
    
    i {
      font-size: 20px;
      margin-right: 8px;
    }
  }
  
  .sidebar-menu {
    border: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
    
    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      margin-right: 20px;
      font-size: 16px;
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      .username {
        margin: 0 8px;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style> 