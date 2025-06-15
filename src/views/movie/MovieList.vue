<template>
  <div class="movie-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>电影列表</span>
          <el-button type="primary" size="small">添加电影</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为电影列表页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MovieList'
}
</script>

<style lang="scss" scoped>
.movie-list {
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