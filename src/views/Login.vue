<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1>电影平台管理系统</h1>
        <p>请输入您的账号密码登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form-content"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>电影平台后台管理系统 v1.0</p>
        <p style="margin-top: 10px; color: #999; font-size: 12px;">
          测试账号：admin/123456, manager/123456, editor/123456
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const loginFormRef = ref()
    const loading = ref(false)
    
    // 表单数据
    const loginForm = reactive({
      username: '',
      password: ''
    })
    
    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    // 登录处理
    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      const isValid = await loginFormRef.value.validate()
      if (!isValid) return
      
      loading.value = true
      
      console.log('开始登录:', loginForm)
      
      try {
        const response = await authStore.login(loginForm)
        console.log('登录响应:', response)
        
        ElMessage.success('登录成功！')
        
        // 检查用户权限并决定跳转页面
        const hasAnyPermission = authStore.permissions && authStore.permissions.length > 0
        const isAdmin = authStore.isAdmin
        
        if (hasAnyPermission || isAdmin) {
          router.push('/dashboard')
        } else {
          router.push('/no-permission')
        }
        
      } catch (error) {
        console.error('登录失败:', error)
        
        // 根据错误类型显示不同的错误信息
        let errorMessage = '登录失败'
        if (error.response) {
          const { status, data } = error.response
          console.log('错误详情:', status, data)
          errorMessage = data?.message || `请求失败 (${status})`
        } else if (error.message) {
          errorMessage = error.message
        }
        
        ElMessage.error(errorMessage)
      } finally {
        loading.value = false
      }
    }
    
    // 检查是否已登录
    onMounted(async () => {
      try {
        // 使用Session机制检查登录状态
        const isLoggedIn = await authStore.checkLoginStatus()
        if (isLoggedIn) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
    })
    
    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin,
      User,
      Lock
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-form {
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.login-form-content {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .login-button {
    width: 100%;
    height: 45px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 6px;
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  
  p {
    color: #999;
    font-size: 12px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-form {
    width: 90%;
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style> 