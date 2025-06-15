<template>
  <div class="category-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" size="small">新增分类</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为分类管理页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CategoryManagement'
}
</script>

<style lang="scss" scoped>
.category-management {
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