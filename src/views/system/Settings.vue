<template>
  <div class="settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为系统设置页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Settings'
}
</script>

<style lang="scss" scoped>
.settings {
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