<template>
  <div class="payment-flow">
    <!-- 流程步骤 -->
    <el-card class="steps-card">
      <template #header>
        <div class="card-header">
          <span>VIP支付流程管理</span>
        </div>
      </template>
      
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="创建订单" description="用户选择套餐"></el-step>
        <el-step title="生成二维码" description="生成支付码"></el-step>
        <el-step title="用户支付" description="扫码支付"></el-step>
        <el-step title="支付回调" description="处理结果"></el-step>
        <el-step title="开通VIP" description="权限生效"></el-step>
      </el-steps>
    </el-card>

    <!-- 测试支付流程 -->
    <el-card class="test-payment-card">
      <template #header>
        <div class="card-header">
          <span>测试支付流程</span>
          <el-button type="primary" @click="resetTest">重置测试</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <!-- 创建订单表单 -->
          <el-form
            :model="orderForm"
            :rules="orderRules"
            ref="orderFormRef"
            label-width="100px"
            class="order-form"
          >
            <el-form-item label="用户ID" prop="userId">
              <el-input
                v-model.number="orderForm.userId"
                placeholder="请输入用户ID"
                type="number"
              />
            </el-form-item>
            <el-form-item label="VIP套餐" prop="planId">
              <el-select v-model="orderForm.planId" placeholder="请选择VIP套餐" style="width: 100%">
                <el-option label="月度会员 - ¥29.90" :value="1" />
                <el-option label="季度会员 - ¥88.00" :value="2" />
                <el-option label="年度会员 - ¥328.00" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="支付金额" prop="amount">
              <el-input-number
                v-model="orderForm.amount"
                :min="1"
                :max="9999"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-radio-group v-model="orderForm.paymentMethod">
                <el-radio :label="0">微信支付</el-radio>
                <el-radio :label="1">支付宝</el-radio>
                <el-radio :label="2">银行卡</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="generateQRCode"
                :loading="generateLoading"
                :disabled="currentStep >= 1"
                style="width: 100%"
              >
                生成支付二维码
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <el-col :span="12">
          <!-- 支付结果展示 -->
          <div class="payment-result">
            <div v-if="!qrCodeInfo" class="no-qrcode">
              <i class="el-icon-info"></i>
              <p>请先填写订单信息并生成支付二维码</p>
            </div>
            
            <div v-else class="qrcode-info">
              <div class="qrcode-header">
                <h3>支付二维码</h3>
                <el-tag :type="getOrderStatusType(orderStatus)">
                  {{ getOrderStatusText(orderStatus) }}
                </el-tag>
              </div>
              
              <div class="qrcode-image">
                <img :src="qrCodeInfo.qrCodeUrl" alt="支付二维码" />
              </div>
              
              <div class="order-info">
                <el-descriptions :column="1" size="small" border>
                  <el-descriptions-item label="订单号">{{ qrCodeInfo.orderId }}</el-descriptions-item>
                  <el-descriptions-item label="支付金额">
                    <span style="color: #f56c6c; font-weight: bold">¥{{ qrCodeInfo.amount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="过期时间">{{ formatDateTime(qrCodeInfo.expireTime) }}</el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div class="payment-actions">
                <el-button
                  type="success"
                  @click="simulatePayment"
                  :loading="paymentLoading"
                  :disabled="orderStatus !== 0"
                  size="small"
                >
                  模拟支付成功
                </el-button>
                <el-button
                  type="info"
                  @click="checkPaymentStatus"
                  :loading="statusLoading"
                  size="small"
                >
                  查询支付状态
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 支付记录 -->
    <el-card class="payment-records-card">
      <template #header>
        <div class="card-header">
          <span>最近支付记录</span>
          <el-button type="text" @click="refreshRecords">刷新</el-button>
        </div>
      </template>

      <el-table
        :data="recentOrders"
        v-loading="recordsLoading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNumber" label="订单号" width="180" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="vipTypeName" label="VIP类型" width="100" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethodName" label="支付方式" width="100" />
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="text" @click="viewOrderDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { paymentApi } from '@/api/payment'

export default {
  name: 'PaymentFlow',
  setup() {
    const orderFormRef = ref()
    const generateLoading = ref(false)
    const paymentLoading = ref(false)
    const statusLoading = ref(false)
    const recordsLoading = ref(false)
    const currentStep = ref(0)
    const orderStatus = ref(-1) // -1: 未开始, 0: 待支付, 1: 已支付, 2: 已取消
    const qrCodeInfo = ref(null)
    const recentOrders = ref([])

    // 订单表单
    const orderForm = reactive({
      userId: 1,
      planId: 2,
      amount: 88.00,
      paymentMethod: 0
    })

    // 表单验证规则
    const orderRules = {
      userId: [
        { required: true, message: '请输入用户ID', trigger: 'blur' },
        { type: 'number', message: '用户ID必须是数字', trigger: 'blur' }
      ],
      planId: [
        { required: true, message: '请选择VIP套餐', trigger: 'change' }
      ],
      amount: [
        { required: true, message: '请输入支付金额', trigger: 'blur' },
        { type: 'number', min: 1, message: '金额必须大于0', trigger: 'blur' }
      ],
      paymentMethod: [
        { required: true, message: '请选择支付方式', trigger: 'change' }
      ]
    }

    // 生成支付二维码
    const generateQRCode = async () => {
      try {
        await orderFormRef.value.validate()
        generateLoading.value = true
        currentStep.value = 1
        
        const response = await paymentApi.generateQRCode(orderForm)
        const data = response.data || response
        qrCodeInfo.value = data
        orderStatus.value = 0
        currentStep.value = 2
        
        ElMessage.success('支付二维码生成成功')
        
        // 开始轮询支付状态
        startPollingPaymentStatus()
        
      } catch (error) {
        currentStep.value = 0
        ElMessage.error('生成支付二维码失败')
        console.error(error)
      } finally {
        generateLoading.value = false
      }
    }

    // 模拟支付成功
    const simulatePayment = async () => {
      if (!qrCodeInfo.value) return
      
      try {
        paymentLoading.value = true
        
        // 调用支付回调API
        await paymentApi.handlePaymentCallback({
          orderId: qrCodeInfo.value.orderId,
          status: 'SUCCESS'
        })
        
        orderStatus.value = 1
        currentStep.value = 4
        ElMessage.success('支付成功！')
        
        // 刷新最近订单
        refreshRecords()
        
      } catch (error) {
        ElMessage.error('模拟支付失败')
        console.error(error)
      } finally {
        paymentLoading.value = false
      }
    }

    // 查询支付状态
    const checkPaymentStatus = async () => {
      if (!qrCodeInfo.value) return
      
      try {
        statusLoading.value = true
        
        const response = await paymentApi.getPaymentStatus(qrCodeInfo.value.orderId)
        const data = response.data || response
        orderStatus.value = data.status
        
        if (data.status === 1) {
          currentStep.value = 4
          ElMessage.success('支付已完成')
        } else if (data.status === 2) {
          currentStep.value = 1
          ElMessage.warning('订单已取消')
        } else {
          ElMessage.info('订单待支付')
        }
        
      } catch (error) {
        ElMessage.error('查询支付状态失败')
        console.error(error)
      } finally {
        statusLoading.value = false
      }
    }

    // 开始轮询支付状态
    let pollingTimer = null
    const startPollingPaymentStatus = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
      }
      
      pollingTimer = setInterval(async () => {
        if (orderStatus.value !== 0) {
          clearInterval(pollingTimer)
          return
        }
        
        try {
                   const response = await paymentApi.getPaymentStatus(qrCodeInfo.value.orderId)
         const data = response.data || response
         orderStatus.value = data.status
          
          if (data.status === 1) {
            currentStep.value = 4
            clearInterval(pollingTimer)
            ElMessage.success('支付完成！')
            refreshRecords()
          } else if (data.status === 2) {
            currentStep.value = 1
            clearInterval(pollingTimer)
            ElMessage.warning('订单已取消')
          }
        } catch (error) {
          console.error('轮询支付状态失败:', error)
        }
      }, 3000) // 每3秒查询一次
    }

    // 重置测试
    const resetTest = () => {
      currentStep.value = 0
      orderStatus.value = -1
      qrCodeInfo.value = null
      orderForm.userId = 1
      orderForm.planId = 2
      orderForm.amount = 88.00
      orderForm.paymentMethod = 0
      
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
      
      ElMessage.info('测试已重置')
    }

    // 获取最近订单
    const refreshRecords = async () => {
      try {
        recordsLoading.value = true
        
        const response = await paymentApi.searchOrders({
          page: 0,
          size: 10,
          sortBy: 'createTime',
          sortDirection: 'DESC'
        })
        
        const data = response.data || response
        recentOrders.value = data.content || []
        
      } catch (error) {
        console.error('获取最近订单失败:', error)
      } finally {
        recordsLoading.value = false
      }
    }

    // 查看订单详情
    const viewOrderDetail = (order) => {
      this.$router.push({
        path: '/payment/orders',
        query: { orderId: order.id }
      })
    }

    // 获取订单状态类型
    const getOrderStatusType = (status) => {
      const typeMap = {
        [-1]: 'info',
        [0]: 'warning',
        [1]: 'success',
        [2]: 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 获取订单状态文本
    const getOrderStatusText = (status) => {
      const textMap = {
        [-1]: '未开始',
        [0]: '待支付',
        [1]: '已支付',
        [2]: '已取消'
      }
      return textMap[status] || '未知'
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 格式化时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    onMounted(() => {
      refreshRecords()
    })

    // 组件销毁时清理定时器
    onBeforeUnmount(() => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
      }
    })

    return {
      orderFormRef,
      generateLoading,
      paymentLoading,
      statusLoading,
      recordsLoading,
      currentStep,
      orderStatus,
      qrCodeInfo,
      recentOrders,
      orderForm,
      orderRules,
      generateQRCode,
      simulatePayment,
      checkPaymentStatus,
      resetTest,
      refreshRecords,
      viewOrderDetail,
      getOrderStatusType,
      getOrderStatusText,
      getStatusType,
      formatDateTime
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-flow {
  .steps-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .test-payment-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-form {
      padding-right: 20px;
      border-right: 1px solid #f0f0f0;
    }

    .payment-result {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .no-qrcode {
        text-align: center;
        color: #909399;
        padding: 60px 20px;
        
        i {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }
        
        p {
          margin: 0;
          font-size: 14px;
        }
      }
      
      .qrcode-info {
        text-align: center;
        
        .qrcode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          h3 {
            margin: 0;
            color: #303133;
          }
        }
        
        .qrcode-image {
          margin-bottom: 20px;
          
          img {
            width: 200px;
            height: 200px;
            border: 1px solid #dcdfe6;
            border-radius: 8px;
          }
        }
        
        .order-info {
          margin-bottom: 20px;
          text-align: left;
        }
        
        .payment-actions {
          .el-button {
            margin: 0 5px;
          }
        }
      }
    }
  }

  .payment-records-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style> 