<template>
  <div class="payment-orders">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.totalOrders }}</div>
            <div class="stats-label">总订单数</div>
          </div>
          <i class="el-icon-s-order stats-icon"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.paidOrders }}</div>
            <div class="stats-label">已支付</div>
          </div>
          <i class="el-icon-circle-check stats-icon success"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">{{ statistics.pendingOrders }}</div>
            <div class="stats-label">待支付</div>
          </div>
          <i class="el-icon-time stats-icon warning"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-number">¥{{ statistics.paidAmount }}</div>
            <div class="stats-label">支付金额</div>
          </div>
          <i class="el-icon-money stats-icon primary"></i>
        </el-card>
      </el-col>
    </el-row>

    <!-- 查询表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNumber"
            placeholder="请输入订单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="VIP类型">
          <el-select v-model="searchForm.vipType" placeholder="请选择" clearable>
            <el-option label="月度会员" :value="1" />
            <el-option label="季度会员" :value="2" />
            <el-option label="年度会员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable>
            <el-option label="微信支付" :value="0" />
            <el-option label="支付宝" :value="1" />
            <el-option label="银行卡" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="warning" @click="handleCancelExpired">处理过期订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <div>
            <el-button type="primary" @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="订单ID" width="80" />
        <el-table-column prop="orderNumber" label="订单号" width="180">
          <template #default="{ row }">
            <el-button type="text" @click="showOrderDetail(row)">
              {{ row.orderNumber }}
            </el-button>
          </template>
        </el-table-column>
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
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="160">
          <template #default="{ row }">
            {{ row.payTime ? formatDateTime(row.payTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="showOrderDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              type="text"
              style="color: #f56c6c"
              @click="handleCancelOrder(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
          <el-descriptions-item label="VIP类型">{{ currentOrder.vipTypeName }}</el-descriptions-item>
          <el-descriptions-item label="支付金额">
            <span style="color: #f56c6c; font-weight: bold">¥{{ currentOrder.amount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder.paymentMethodName }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)" size="small">
              {{ currentOrder.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ currentOrder.payTime ? formatDateTime(currentOrder.payTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ currentOrder.expireTime ? formatDateTime(currentOrder.expireTime) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="currentOrder.qrCodeUrl" class="qr-code-section">
          <h4>支付二维码</h4>
          <div class="qr-code">
            <img :src="currentOrder.qrCodeUrl" alt="支付二维码" />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { paymentApi } from '@/api/payment'

export default {
  name: 'PaymentOrders',
  setup() {
    const loading = ref(false)
    const orderList = ref([])
    const detailDialogVisible = ref(false)
    const currentOrder = ref(null)
    
    // 统计数据
    const statistics = reactive({
      totalOrders: 0,
      paidOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      totalAmount: 0,
      paidAmount: 0,
      paymentRate: 0
    })

    // 搜索表单
    const searchForm = reactive({
      userId: '',
      orderNumber: '',
      vipType: '',
      paymentMethod: '',
      status: '',
      dateRange: []
    })

    // 分页
    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        const response = await paymentApi.getOrderStatistics()
        // 响应数据可能直接是统计对象，也可能包装在data中
        const data = response.data || response
        Object.assign(statistics, data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    // 获取订单列表
    const fetchOrderList = async () => {
      loading.value = true
      try {
        const params = {
          ...searchForm,
          startTime: searchForm.dateRange?.[0] || null,
          endTime: searchForm.dateRange?.[1] || null,
          page: pagination.page - 1, // 后端从0开始
          size: pagination.size,
          sortBy: 'createTime',
          sortDirection: 'DESC'
        }
        delete params.dateRange

        const response = await paymentApi.searchOrders(params)
        // 响应数据可能直接是分页对象，也可能包装在data中
        const data = response.data || response
        orderList.value = data.content || []
        pagination.total = data.totalElements || 0
      } catch (error) {
        ElMessage.error('获取订单列表失败')
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchOrderList()
    }

    // 重置
    const handleReset = () => {
      Object.assign(searchForm, {
        userId: '',
        orderNumber: '',
        vipType: '',
        paymentMethod: '',
        status: '',
        dateRange: []
      })
      pagination.page = 1
      fetchOrderList()
    }

    // 刷新
    const handleRefresh = () => {
      fetchOrderList()
      fetchStatistics()
    }

    // 处理过期订单
    const handleCancelExpired = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要处理所有过期订单吗？此操作将取消所有过期的待支付订单。',
          '确认操作',
          { type: 'warning' }
        )
        
        await paymentApi.cancelExpiredOrders()
        ElMessage.success('过期订单处理完成')
        handleRefresh()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('处理过期订单失败')
        }
      }
    }

    // 取消订单
    const handleCancelOrder = async (order) => {
      try {
        await ElMessageBox.confirm(
          `确定要取消订单 ${order.orderNumber} 吗？`,
          '确认取消',
          { type: 'warning' }
        )
        
        await paymentApi.cancelOrder(order.id)
        ElMessage.success('订单取消成功')
        fetchOrderList()
        fetchStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('取消订单失败')
        }
      }
    }

    // 显示订单详情
    const showOrderDetail = (order) => {
      currentOrder.value = order
      detailDialogVisible.value = true
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      fetchOrderList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchOrderList()
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        0: 'warning', // 待支付
        1: 'success', // 已支付
        2: 'danger'   // 已取消
      }
      return typeMap[status] || 'info'
    }

    // 格式化时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    onMounted(() => {
      fetchOrderList()
      fetchStatistics()
    })

    return {
      loading,
      orderList,
      statistics,
      searchForm,
      pagination,
      detailDialogVisible,
      currentOrder,
      handleSearch,
      handleReset,
      handleRefresh,
      handleCancelExpired,
      handleCancelOrder,
      showOrderDetail,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      formatDateTime
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-orders {
  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    position: relative;
    overflow: hidden;
    
    .stats-content {
      .stats-number {
        font-size: 24px;
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
      font-size: 30px;
      opacity: 0.8;
      
      &.success {
        color: #67c23a;
      }
      
      &.warning {
        color: #e6a23c;
      }
      
      &.primary {
        color: #409eff;
      }
    }
  }

  .search-card {
    margin-bottom: 20px;
    
    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    text-align: right;
  }

  .order-detail {
    .qr-code-section {
      margin-top: 20px;
      text-align: center;
      
      h4 {
        margin-bottom: 15px;
        color: #303133;
      }
      
      .qr-code {
        img {
          max-width: 200px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
        }
      }
    }
  }
}
</style> 