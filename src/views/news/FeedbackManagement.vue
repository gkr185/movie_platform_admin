<template>
  <div class="feedback-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户反馈</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为用户反馈页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'FeedbackManagement'
}
</script>

<style lang="scss" scoped>
.feedback-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .page-content {
    padding: 20px;
    text-align: center;
    color: #666;
  }
}
</style> 