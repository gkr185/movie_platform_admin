<template>
  <div class="ad-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>广告列表</span>
          <el-button type="primary" size="small">新增广告</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为广告列表页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdList'
}
</script>

<style lang="scss" scoped>
.ad-list {
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