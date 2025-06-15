<template>
  <div class="vip-plans">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>VIP套餐</span>
          <el-button type="primary" size="small">新增套餐</el-button>
        </div>
      </template>
      <div class="page-content">
        <p>此为VIP套餐页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'VipPlans'
}
</script>

<style lang="scss" scoped>
.vip-plans {
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