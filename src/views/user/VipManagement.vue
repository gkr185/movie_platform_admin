<template>
  <div class="vip-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>VIP用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名、邮箱或手机号"
              style="width: 250px; margin-right: 12px;"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button type="primary" @click="refreshUserList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="statistics-panel">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总用户数" :value="statistics.totalUsers">
              <template #suffix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="VIP用户数" :value="statistics.vipUsers">
              <template #suffix>
                <el-icon style="color: #f56c6c;"><Crown /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="即将到期VIP" :value="statistics.expiringSoon">
              <template #suffix>
                <el-icon style="color: #e6a23c;"><Timer /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="VIP转化率" :value="vipConversionRate" :precision="1" suffix="%">
              <template #suffix>
                <span>%</span>
                <el-icon style="color: #67c23a;"><TrendCharts /></el-icon>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 用户列表 -->
      <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="用户ID" width="80" sortable="custom" />
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" :src="scope.row.avatar" />
              <span class="username">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="VIP状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.isVip ? 'danger' : 'info'" size="small">
              <el-icon v-if="scope.row.isVip"><Crown /></el-icon>
              {{ scope.row.isVip ? 'VIP用户' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="VIP到期时间" width="160">
          <template #default="scope">
            <span v-if="scope.row.isVip && scope.row.vipExpireTime">
              <el-tag 
                :type="getExpireTagType(scope.row.vipExpireTime)" 
                size="small"
              >
                {{ formatExpireTime(scope.row.vipExpireTime) }}
              </el-tag>
            </span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="160" sortable="custom">
          <template #default="scope">
            {{ formatDateTime(scope.row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" sortable="custom">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button
              v-if="!scope.row.isVip"
              type="primary"
              size="small"
              @click="handleSetVip(scope.row)"
            >
              <el-icon><Crown /></el-icon>
              设为VIP
            </el-button>
            <el-button
              v-else
              type="warning"
              size="small"
              @click="handleExtendVip(scope.row)"
            >
              <el-icon><Clock /></el-icon>
              续期
            </el-button>
            <el-button
              v-if="scope.row.isVip"
              type="danger"
              size="small"
              @click="handleCancelVip(scope.row)"
            >
              <el-icon><Close /></el-icon>
              取消VIP
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewUser(scope.row)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- VIP设置对话框 -->
    <el-dialog
      v-model="vipDialog.visible"
      :title="vipDialog.title"
      width="500px"
    >
      <el-form
        ref="vipFormRef"
        :model="vipForm"
        :rules="vipRules"
        label-width="100px"
      >
        <el-form-item label="用户信息">
          <div class="user-display">
            <el-avatar :size="40" :src="vipDialog.user?.avatar" />
            <div class="user-details">
              <div class="username">{{ vipDialog.user?.username }}</div>
              <div class="email">{{ vipDialog.user?.email }}</div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="VIP类型" prop="vipType">
          <el-select v-model="vipForm.vipType" placeholder="请选择VIP类型" style="width: 100%">
            <el-option label="月度VIP" :value="1" />
            <el-option label="季度VIP" :value="2" />
            <el-option label="年度VIP" :value="3" />
            <el-option label="永久VIP" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="到期时间" prop="vipExpireTime">
          <el-date-picker
            v-model="vipForm.vipExpireTime"
            type="datetime"
            placeholder="选择VIP到期时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDate"
            :disabled="vipForm.vipType === 4"
          />
          <div v-if="vipForm.vipType === 4" class="form-tip">
            永久VIP无需设置到期时间
          </div>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="vipForm.remark"
            type="textarea"
            :rows="3"
            placeholder="VIP设置备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="vipDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitVip" :loading="vipDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailDialog.visible"
      title="用户详情"
      width="600px"
    >
      <div v-if="userDetailDialog.user" class="user-detail">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userDetailDialog.user.avatar" />
              <div class="user-status">
                <el-tag 
                  :type="userDetailDialog.user.isVip ? 'danger' : 'info'" 
                  size="large"
                >
                  {{ userDetailDialog.user.isVip ? 'VIP用户' : '普通用户' }}
                </el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="16">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">
                {{ userDetailDialog.user.id }}
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ userDetailDialog.user.username }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ userDetailDialog.user.email }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ userDetailDialog.user.phone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ formatDateTime(userDetailDialog.user.registerTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后登录">
                {{ formatDateTime(userDetailDialog.user.lastLoginTime) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="userDetailDialog.user.isVip" label="VIP到期时间">
                <el-tag 
                  :type="getExpireTagType(userDetailDialog.user.vipExpireTime)"
                  size="small"
                >
                  {{ formatExpireTime(userDetailDialog.user.vipExpireTime) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="账户状态">
                <el-tag :type="userDetailDialog.user.userStatus ? 'success' : 'danger'">
                  {{ userDetailDialog.user.userStatus ? '正常' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, User, Crown, Timer, TrendCharts, 
  Clock, Close, View, Plus 
} from '@element-plus/icons-vue'
import { 
  getUserList, 
  searchUsers, 
  getUserInfo,
  setUserVip,
  cancelUserVip
} from '@/api/user'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const users = ref([])

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
  sort: 'createTime',
  direction: 'desc'
})

// 统计数据
const statistics = reactive({
  totalUsers: 0,
  vipUsers: 0,
  expiringSoon: 0
})

// VIP转化率
const vipConversionRate = computed(() => {
  if (statistics.totalUsers === 0) return 0
  return (statistics.vipUsers / statistics.totalUsers * 100)
})

// VIP设置表单
const vipFormRef = ref()
const vipForm = reactive({
  vipType: 1,
  vipExpireTime: '',
  remark: ''
})

const vipRules = {
  vipType: [
    { required: true, message: '请选择VIP类型', trigger: 'change' }
  ],
  vipExpireTime: [
    { required: true, message: '请选择VIP到期时间', trigger: 'change' }
  ]
}

// 对话框状态
const vipDialog = reactive({
  visible: false,
  loading: false,
  title: '设置VIP',
  user: null
})

const userDetailDialog = reactive({
  visible: false,
  user: null
})

// 获取用户列表
const fetchUsers = async (isSearch = false) => {
  try {
    loading.value = true
    let response
    
    if (isSearch && searchKeyword.value.trim()) {
      response = await searchUsers({
        keyword: searchKeyword.value.trim(),
        page: pagination.page - 1, // API使用0开始的页码
        size: pagination.size,
        sort: pagination.sort,
        direction: pagination.direction
      })
    } else {
      response = await getUserList({
        page: pagination.page - 1, // API使用0开始的页码
        size: pagination.size,
        sort: pagination.sort,
        direction: pagination.direction
      })
    }
    
    if (response.code === 200) {
      users.value = response.data.content || []
      pagination.total = response.data.totalElements || 0
      
      // 更新统计数据
      updateStatistics()
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = () => {
  statistics.totalUsers = users.value.length
  statistics.vipUsers = users.value.filter(user => user.isVip).length
  
  // 计算即将到期的VIP用户（7天内到期）
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  
  statistics.expiringSoon = users.value.filter(user => {
    if (!user.isVip || !user.vipExpireTime) return false
    const expireDate = new Date(user.vipExpireTime)
    return expireDate <= sevenDaysLater && expireDate > new Date()
  }).length
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  fetchUsers(true)
}

// 刷新用户列表
const refreshUserList = () => {
  searchKeyword.value = ''
  pagination.page = 1
  fetchUsers()
}

// 排序处理
const handleSortChange = ({ prop, order }) => {
  pagination.sort = prop
  pagination.direction = order === 'ascending' ? 'asc' : 'desc'
  fetchUsers(!!searchKeyword.value.trim())
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.size = val
  pagination.page = 1
  fetchUsers(!!searchKeyword.value.trim())
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchUsers(!!searchKeyword.value.trim())
}

// 设置VIP
const handleSetVip = (user) => {
  vipDialog.user = user
  vipDialog.title = '设置VIP'
  vipDialog.visible = true
  
  // 重置表单
  resetVipForm()
  
  // 根据当前时间设置默认到期时间（一个月后）
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  vipForm.vipExpireTime = nextMonth.toISOString().slice(0, 19)
}

// 续期VIP
const handleExtendVip = (user) => {
  vipDialog.user = user
  vipDialog.title = '续期VIP'
  vipDialog.visible = true
  
  // 重置表单
  resetVipForm()
  
  // 如果用户已有VIP到期时间，在此基础上延长
  if (user.vipExpireTime) {
    const currentExpire = new Date(user.vipExpireTime)
    const nextMonth = new Date(currentExpire)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    vipForm.vipExpireTime = nextMonth.toISOString().slice(0, 19)
  } else {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    vipForm.vipExpireTime = nextMonth.toISOString().slice(0, 19)
  }
}

// 取消VIP
const handleCancelVip = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消用户 "${user.username}" 的VIP权限吗？取消后用户将失去VIP特权。`,
      '取消VIP确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await cancelUserVip(user.id)
    
    if (response.code === 200) {
      ElMessage.success('VIP权限取消成功')
      fetchUsers(!!searchKeyword.value.trim()) // 刷新列表
    } else {
      ElMessage.error(response.message || 'VIP权限取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消VIP失败:', error)
      ElMessage.error('取消VIP失败')
    }
  }
}

// 查看用户详情
const handleViewUser = async (user) => {
  try {
    const response = await getUserInfo(user.id)
    if (response.code === 200) {
      userDetailDialog.user = response.data
      userDetailDialog.visible = true
    } else {
      ElMessage.error(response.message || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 重置VIP表单
const resetVipForm = () => {
  vipForm.vipType = 1
  vipForm.vipExpireTime = ''
  vipForm.remark = ''
}

// 提交VIP设置
const handleSubmitVip = async () => {
  if (!vipFormRef.value) return
  
  try {
    const valid = await vipFormRef.value.validate()
    if (!valid) return
    
    // 永久VIP不需要到期时间
    if (vipForm.vipType === 4) {
      vipForm.vipExpireTime = null
    }
    
    vipDialog.loading = true
    
    const response = await setUserVip(vipDialog.user.id, {
      vipType: vipForm.vipType,
      vipExpireTime: vipForm.vipExpireTime
    })
    
    if (response.code === 200) {
      ElMessage.success('VIP设置成功')
      vipDialog.visible = false
      fetchUsers(!!searchKeyword.value.trim()) // 刷新列表
    } else {
      ElMessage.error(response.message || 'VIP设置失败')
    }
  } catch (error) {
    console.error('VIP设置失败:', error)
    ElMessage.error('VIP设置失败')
  } finally {
    vipDialog.loading = false
  }
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 格式化到期时间
const formatExpireTime = (expireTime) => {
  if (!expireTime) return '-'
  return new Date(expireTime).toLocaleDateString('zh-CN')
}

// 获取到期时间标签类型
const getExpireTagType = (expireTime) => {
  if (!expireTime) return 'info'
  
  const expire = new Date(expireTime)
  const now = new Date()
  const diffDays = Math.ceil((expire - now) / (24 * 60 * 60 * 1000))
  
  if (diffDays < 0) return 'danger' // 已过期
  if (diffDays <= 7) return 'warning' // 即将过期
  return 'success' // 正常
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})
</script>

<style lang="scss" scoped>
.vip-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.statistics-panel {
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .username {
    font-weight: 500;
    color: #303133;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.user-display {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .user-details {
    .username {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }
    
    .email {
      font-size: 12px;
      color: #909399;
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-detail {
  .avatar-section {
    text-align: center;
    
    .user-status {
      margin-top: 12px;
    }
  }
}

// VIP相关样式
.el-tag {
  &.el-tag--danger {
    --el-tag-bg-color: #fef0f0;
    --el-tag-border-color: #f56c6c;
    --el-tag-text-color: #f56c6c;
  }
}

// 统计面板样式
:deep(.el-statistic) {
  .el-statistic__head {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  
  .el-statistic__content {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
    
    .el-input {
      width: 100% !important;
    }
  }
  
  .statistics-panel .el-col {
    margin-bottom: 16px;
  }
}
</style> 