<template>
  <div class="no-permission">
    <div class="no-permission-content">
      <div class="no-permission-icon">
        <el-icon size="120" color="#F56C6C">
          <Lock />
        </el-icon>
      </div>
      <h1>权限不足</h1>
      <h2>您暂无访问权限</h2>
      <p>您的账户暂时没有分配任何系统权限，请联系管理员为您分配相应的角色和权限。</p>
      
      <div class="user-info">
        <el-card>
          <h3>当前账户信息</h3>
          <p><strong>用户名：</strong>{{ userInfo.username }}</p>
          <p><strong>邮箱：</strong>{{ userInfo.email }}</p>
          <p><strong>角色：</strong>{{ userRoles }}</p>
          <p><strong>权限：</strong>{{ userPermissions }}</p>
        </el-card>
      </div>
      
      <div class="no-permission-actions">
        <el-button type="primary" @click="contactAdmin">联系管理员</el-button>
        <el-button @click="logout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'NoPermission',
  components: {
    Lock
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const userInfo = computed(() => authStore.user || {})
    
    const userRoles = computed(() => {
      const roles = authStore.roles || []
      return roles.length > 0 ? roles.map(r => r.name).join(', ') : '暂无角色'
    })
    
    const userPermissions = computed(() => {
      const permissions = authStore.permissions || []
      return permissions.length > 0 ? permissions.join(', ') : '暂无权限'
    })
    
    const contactAdmin = () => {
      ElMessage.info('请联系系统管理员分配权限')
    }
    
    const logout = () => {
      authStore.logout()
    }
    
    return {
      userInfo,
      userRoles,
      userPermissions,
      contactAdmin,
      logout
    }
  }
}
</script>

<style lang="scss" scoped>
.no-permission {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.no-permission-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  
  .no-permission-icon {
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 48px;
    font-weight: bold;
    color: #F56C6C;
    margin: 0 0 10px 0;
  }
  
  h2 {
    font-size: 24px;
    color: #303133;
    margin: 0 0 10px 0;
  }
  
  p {
    color: #606266;
    font-size: 16px;
    margin-bottom: 30px;
    line-height: 1.6;
  }
  
  .user-info {
    margin: 30px 0;
    text-align: left;
    
    h3 {
      margin-bottom: 15px;
      color: #409EFF;
    }
    
    p {
      margin: 8px 0;
      font-size: 14px;
      
      strong {
        color: #303133;
      }
    }
  }
  
  .no-permission-actions {
    .el-button {
      margin: 0 10px;
    }
  }
}
</style> 