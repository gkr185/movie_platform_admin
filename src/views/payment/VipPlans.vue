<template>
  <div class="vip-plans">
    <!-- 套餐统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.monthlyOrders }}</div>
            <div class="stats-label">月度会员订单</div>
          </div>
          <i class="el-icon-calendar stats-icon primary"></i>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.quarterlyOrders }}</div>
            <div class="stats-label">季度会员订单</div>
          </div>
          <i class="el-icon-date stats-icon success"></i>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.yearlyOrders }}</div>
            <div class="stats-label">年度会员订单</div>
          </div>
          <i class="el-icon-trophy stats-icon warning"></i>
        </el-card>
      </el-col>
    </el-row>

    <!-- VIP套餐配置 -->
    <el-card class="plans-card">
      <template #header>
        <div class="card-header">
          <span>VIP套餐配置</span>
          <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 月度会员卡片 -->
        <el-col :span="8">
          <el-card class="plan-card monthly" shadow="hover">
            <div class="plan-header">
              <h3>月度会员</h3>
              <div class="plan-badge">基础版</div>
            </div>
            <div class="plan-price">
              <span class="currency">¥</span>
              <span class="amount">{{ plans.monthly.price }}</span>
              <span class="period">/月</span>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>{{ plans.monthly.duration }}天有效期</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>高清画质观看</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>无广告播放</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>离线下载功能</span>
              </div>
            </div>
            <div class="plan-stats">
              <div class="stat-item">
                <span class="label">销售数量:</span>
                <span class="value">{{ statistics.monthlyOrders }}份</span>
              </div>
              <div class="stat-item">
                <span class="label">转化率:</span>
                <span class="value">{{ getConversionRate('monthly') }}%</span>
              </div>
            </div>
            <div class="plan-actions">
              <el-button type="primary" size="small" @click="editPlan('monthly')">编辑价格</el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 季度会员卡片 -->
        <el-col :span="8">
          <el-card class="plan-card quarterly popular" shadow="hover">
            <div class="popular-ribbon">推荐</div>
            <div class="plan-header">
              <h3>季度会员</h3>
              <div class="plan-badge">热门版</div>
            </div>
            <div class="plan-price">
              <span class="currency">¥</span>
              <span class="amount">{{ plans.quarterly.price }}</span>
              <span class="period">/季</span>
            </div>
            <div class="plan-discount">
              <span>相比月度节省 ¥{{ getMonthlySavings('quarterly') }}</span>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>{{ plans.quarterly.duration }}天有效期</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>超高清4K画质</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>无广告播放</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>离线下载功能</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>多端同时观看</span>
              </div>
            </div>
            <div class="plan-stats">
              <div class="stat-item">
                <span class="label">销售数量:</span>
                <span class="value">{{ statistics.quarterlyOrders }}份</span>
              </div>
              <div class="stat-item">
                <span class="label">转化率:</span>
                <span class="value">{{ getConversionRate('quarterly') }}%</span>
              </div>
            </div>
            <div class="plan-actions">
              <el-button type="primary" size="small" @click="editPlan('quarterly')">编辑价格</el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 年度会员卡片 -->
        <el-col :span="8">
          <el-card class="plan-card yearly" shadow="hover">
            <div class="plan-header">
              <h3>年度会员</h3>
              <div class="plan-badge">至尊版</div>
            </div>
            <div class="plan-price">
              <span class="currency">¥</span>
              <span class="amount">{{ plans.yearly.price }}</span>
              <span class="period">/年</span>
            </div>
            <div class="plan-discount">
              <span>相比月度节省 ¥{{ getMonthlySavings('yearly') }}</span>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>{{ plans.yearly.duration }}天有效期</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>超高清4K画质</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>无广告播放</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>离线下载功能</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>多端同时观看</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check"></i>
                <span>专属客服服务</span>
              </div>
            </div>
            <div class="plan-stats">
              <div class="stat-item">
                <span class="label">销售数量:</span>
                <span class="value">{{ statistics.yearlyOrders }}份</span>
              </div>
              <div class="stat-item">
                <span class="label">转化率:</span>
                <span class="value">{{ getConversionRate('yearly') }}%</span>
              </div>
            </div>
            <div class="plan-actions">
              <el-button type="primary" size="small" @click="editPlan('yearly')">编辑价格</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 支付方式统计 -->
    <el-card class="payment-methods-card">
      <template #header>
        <div class="card-header">
          <span>支付方式统计</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="payment-stat-item">
            <div class="payment-icon wechat">
              <i class="el-icon-chat-dot-square"></i>
            </div>
            <div class="payment-info">
              <div class="payment-name">微信支付</div>
              <div class="payment-count">{{ statistics.wechatOrders }} 笔</div>
              <div class="payment-percent">{{ getPaymentPercent('wechat') }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="payment-stat-item">
            <div class="payment-icon alipay">
              <i class="el-icon-money"></i>
            </div>
            <div class="payment-info">
              <div class="payment-name">支付宝</div>
              <div class="payment-count">{{ statistics.alipayOrders }} 笔</div>
              <div class="payment-percent">{{ getPaymentPercent('alipay') }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="payment-stat-item">
            <div class="payment-icon bankcard">
              <i class="el-icon-bank-card"></i>
            </div>
            <div class="payment-info">
              <div class="payment-name">银行卡</div>
              <div class="payment-count">{{ statistics.bankCardOrders }} 笔</div>
              <div class="payment-percent">{{ getPaymentPercent('bankcard') }}%</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 编辑价格对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑${currentPlan?.name}价格`"
      width="400px"
    >
      <el-form
        v-if="currentPlan"
        :model="priceForm"
        :rules="priceRules"
        ref="priceFormRef"
        label-width="80px"
      >
        <el-form-item label="当前价格">
          <span style="color: #f56c6c; font-size: 18px; font-weight: bold">
            ¥{{ currentPlan.price }}
          </span>
        </el-form-item>
        <el-form-item label="新价格" prop="price">
          <el-input-number
            v-model="priceForm.price"
            :min="1"
            :max="9999"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          >
            <template #prepend>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="调价原因" prop="reason">
          <el-input
            v-model="priceForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调价原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePrice">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paymentApi } from '@/api/payment'

export default {
  name: 'VipPlans',
  setup() {
    const editDialogVisible = ref(false)
    const priceFormRef = ref()
    const currentPlan = ref(null)
    
    // VIP套餐配置
    const plans = reactive({
      monthly: {
        name: '月度会员',
        price: 29.90,
        duration: 30,
        type: 1
      },
      quarterly: {
        name: '季度会员',
        price: 88.00,
        duration: 90,
        type: 2
      },
      yearly: {
        name: '年度会员',
        price: 328.00,
        duration: 365,
        type: 3
      }
    })

    // 统计数据
    const statistics = reactive({
      totalOrders: 0,
      monthlyOrders: 0,
      quarterlyOrders: 0,
      yearlyOrders: 0,
      wechatOrders: 0,
      alipayOrders: 0,
      bankCardOrders: 0
    })

    // 价格编辑表单
    const priceForm = reactive({
      price: 0,
      reason: ''
    })

    // 价格表单验证规则
    const priceRules = {
      price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 1, message: '价格不能小于1元', trigger: 'blur' }
      ],
      reason: [
        { required: true, message: '请输入调价原因', trigger: 'blur' },
        { min: 5, message: '调价原因至少5个字符', trigger: 'blur' }
      ]
    }

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        const response = await paymentApi.getOrderStatistics()
        // 响应数据可能直接是统计对象，也可能包装在data中
        const data = response.data || response
        Object.assign(statistics, data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
        ElMessage.error('获取统计数据失败')
      }
    }

    // 刷新数据
    const handleRefresh = () => {
      fetchStatistics()
      ElMessage.success('数据刷新成功')
    }

    // 编辑套餐价格
    const editPlan = (planType) => {
      currentPlan.value = {
        ...plans[planType],
        planType
      }
      priceForm.price = plans[planType].price
      priceForm.reason = ''
      editDialogVisible.value = true
    }

    // 保存价格
    const handleSavePrice = async () => {
      try {
        await priceFormRef.value.validate()
        
        await ElMessageBox.confirm(
          `确定要将${currentPlan.value.name}的价格从 ¥${currentPlan.value.price} 调整为 ¥${priceForm.price} 吗？`,
          '确认调价',
          { type: 'warning' }
        )

        // 模拟保存价格API调用
        // 实际项目中需要调用真实的API
        plans[currentPlan.value.planType].price = priceForm.price
        
        ElMessage.success('价格修改成功')
        editDialogVisible.value = false
        
        // 记录调价日志
        console.log('价格调整日志:', {
          planType: currentPlan.value.planType,
          oldPrice: currentPlan.value.price,
          newPrice: priceForm.price,
          reason: priceForm.reason,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('价格修改失败')
        }
      }
    }

    // 计算相比月度的节省金额
    const getMonthlySavings = (planType) => {
      if (planType === 'quarterly') {
        const monthlyTotal = plans.monthly.price * 3
        return (monthlyTotal - plans.quarterly.price).toFixed(2)
      } else if (planType === 'yearly') {
        const monthlyTotal = plans.monthly.price * 12
        return (monthlyTotal - plans.yearly.price).toFixed(2)
      }
      return 0
    }

    // 计算转化率
    const getConversionRate = (planType) => {
      const totalOrders = statistics.totalOrders || 1
      let planOrders = 0
      
      switch (planType) {
        case 'monthly':
          planOrders = statistics.monthlyOrders
          break
        case 'quarterly':
          planOrders = statistics.quarterlyOrders
          break
        case 'yearly':
          planOrders = statistics.yearlyOrders
          break
      }
      
      return ((planOrders / totalOrders) * 100).toFixed(1)
    }

    // 计算支付方式占比
    const getPaymentPercent = (method) => {
      const totalOrders = statistics.totalOrders || 1
      let methodOrders = 0
      
      switch (method) {
        case 'wechat':
          methodOrders = statistics.wechatOrders
          break
        case 'alipay':
          methodOrders = statistics.alipayOrders
          break
        case 'bankcard':
          methodOrders = statistics.bankCardOrders
          break
      }
      
      return ((methodOrders / totalOrders) * 100).toFixed(1)
    }

    onMounted(() => {
      fetchStatistics()
    })

    return {
      plans,
      statistics,
      editDialogVisible,
      priceFormRef,
      currentPlan,
      priceForm,
      priceRules,
      handleRefresh,
      editPlan,
      handleSavePrice,
      getMonthlySavings,
      getConversionRate,
      getPaymentPercent
    }
  }
}
</script>

<style lang="scss" scoped>
.vip-plans {
  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    position: relative;
    overflow: hidden;
    
    .stats-content {
      .stats-number {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1;
      }
      
      .stats-label {
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
      }
    }
    
    .stats-icon {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 35px;
      opacity: 0.8;
      
      &.primary {
        color: #409eff;
      }
      
      &.success {
        color: #67c23a;
      }
      
      &.warning {
        color: #e6a23c;
      }
    }
  }

  .plans-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .plan-card {
      position: relative;
      transition: all 0.3s ease;
      height: 100%;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      &.popular {
        border: 2px solid #409eff;
        
        .popular-ribbon {
          position: absolute;
          top: 15px;
          right: -8px;
          background: linear-gradient(45deg, #409eff, #67c23a);
          color: white;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: bold;
          border-radius: 3px;
          z-index: 1;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            right: 0;
            width: 0;
            height: 0;
            border-right: 4px solid transparent;
            border-top: 4px solid #2980b9;
          }
        }
      }
      
      .plan-header {
        text-align: center;
        margin-bottom: 20px;
        
        h3 {
          margin: 0 0 10px 0;
          font-size: 20px;
          color: #303133;
        }
        
        .plan-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(45deg, #f56c6c, #e6a23c);
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      }
      
      .plan-price {
        text-align: center;
        margin-bottom: 10px;
        
        .currency {
          font-size: 16px;
          color: #909399;
          vertical-align: top;
        }
        
        .amount {
          font-size: 36px;
          font-weight: bold;
          color: #f56c6c;
        }
        
        .period {
          font-size: 14px;
          color: #909399;
        }
      }
      
      .plan-discount {
        text-align: center;
        margin-bottom: 20px;
        
        span {
          color: #67c23a;
          font-size: 14px;
          font-weight: bold;
        }
      }
      
      .plan-features {
        margin-bottom: 20px;
        
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          i {
            color: #67c23a;
            margin-right: 8px;
            font-size: 16px;
          }
          
          span {
            color: #606266;
            font-size: 14px;
          }
        }
      }
      
      .plan-stats {
        border-top: 1px solid #f0f0f0;
        padding-top: 15px;
        margin-bottom: 15px;
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          .label {
            color: #909399;
            font-size: 13px;
          }
          
          .value {
            color: #303133;
            font-size: 13px;
            font-weight: bold;
          }
        }
      }
      
      .plan-actions {
        text-align: center;
      }
    }
  }

  .payment-methods-card {
    .payment-stat-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .payment-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        
        i {
          font-size: 24px;
          color: white;
        }
        
        &.wechat {
          background: linear-gradient(45deg, #1aad19, #00d100);
        }
        
        &.alipay {
          background: linear-gradient(45deg, #1677ff, #00a6fb);
        }
        
        &.bankcard {
          background: linear-gradient(45deg, #722ed1, #9254de);
        }
      }
      
      .payment-info {
        flex: 1;
        
        .payment-name {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .payment-count {
          font-size: 14px;
          color: #606266;
          margin-bottom: 3px;
        }
        
        .payment-percent {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style> 