<template>
  <div class="ad-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建广告</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为创建广告页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdCreate'
}
</script>

<style lang="scss" scoped>
.ad-create {
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