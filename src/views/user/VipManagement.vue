<template>
  <div class="vip-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>VIP管理</span>
          <el-button type="primary" size="small">设置VIP</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为VIP管理页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'VipManagement'
}
</script>

<style lang="scss" scoped>
.vip-management {
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