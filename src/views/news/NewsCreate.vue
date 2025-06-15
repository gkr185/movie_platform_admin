<template>
  <div class="news-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发布新闻</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为发布新闻页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'NewsCreate'
}
</script>

<style lang="scss" scoped>
.news-create {
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