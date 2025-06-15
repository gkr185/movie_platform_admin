<template>
  <div class="payment-orders">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付订单</span>
        </div>
      </template>
      <div class="page-content">
        <p>此为支付订单页面</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PaymentOrders'
}
</script>

<style lang="scss" scoped>
.payment-orders {
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