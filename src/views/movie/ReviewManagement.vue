<template>
  <div class="review-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>影评管理</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为影评管理页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ReviewManagement'
}
</script>

<style lang="scss" scoped>
.review-management {
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