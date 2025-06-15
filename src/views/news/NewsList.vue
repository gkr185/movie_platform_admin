<template>
  <div class="news-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新闻列表</span>
          <el-button type="primary" size="small">新增新闻</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为新闻列表页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'NewsList'
}
</script>

<style lang="scss" scoped>
.news-list {
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