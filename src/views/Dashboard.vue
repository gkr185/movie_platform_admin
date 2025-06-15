<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <h2>欢迎来到电影平台管理系统</h2>
          <p>此为仪表盘页面</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-card {
    text-align: center;
    padding: 40px;
    
    h2 {
      color: #409EFF;
      margin-bottom: 20px;
    }
    
    p {
      color: #666;
      font-size: 16px;
    }
  }
}
</style> 