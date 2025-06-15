<template>
  <div class="movie-upload">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上传电影</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为上传电影页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MovieUpload'
}
</script>

<style lang="scss" scoped>
.movie-upload {
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