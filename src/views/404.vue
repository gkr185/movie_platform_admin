<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-icon">
        <el-icon size="120" color="#409EFF">
          <WarningFilled />
        </el-icon>
      </div>
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <div class="not-found-actions">
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'

export default {
  name: 'NotFound',
  components: {
    WarningFilled
  },
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.go(-1)
    }
    
    const goHome = () => {
      router.push('/dashboard')
    }
    
    return {
      goBack,
      goHome
    }
  }
}
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.not-found-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .not-found-icon {
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 72px;
    font-weight: bold;
    color: #409EFF;
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
  }
  
  .not-found-actions {
    .el-button {
      margin: 0 10px;
    }
  }
}
</style> 