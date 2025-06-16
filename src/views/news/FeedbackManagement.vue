<template>
  <div class="feedback-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户反馈管理</span>
          <div class="header-stats">
            <el-tag type="warning">待处理: {{ stats.pending }}</el-tag>
            <el-tag type="primary">处理中: {{ stats.processing }}</el-tag>
            <el-tag type="success">已处理: {{ stats.resolved }}</el-tag>
            <el-tag type="info">已关闭: {{ stats.closed }}</el-tag>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="searchForm.type" placeholder="反馈类型" clearable @change="handleSearch">
              <el-option label="功能建议" :value="1" />
              <el-option label="Bug反馈" :value="2" />
              <el-option label="内容问题" :value="3" />
              <el-option label="其他" :value="4" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.status" placeholder="处理状态" clearable @change="handleSearch">
              <el-option label="待处理" :value="0" />
              <el-option label="处理中" :value="1" />
              <el-option label="已处理" :value="2" />
              <el-option label="已关闭" :value="3" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索反馈内容或联系方式"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 反馈列表 -->
      <el-table
        v-loading="loading"
        :data="feedbackList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="反馈类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="反馈内容" min-width="250">
          <template #default="{ row }">
            <div class="content-cell">
              <p class="content-text">{{ row.content }}</p>
              <div class="content-meta">
                <span class="contact">联系方式: {{ row.contact }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" width="120">
          <template #default="{ row }">
            <div v-if="row.userId">
              <p>ID: {{ row.userId }}</p>
              <p class="user-contact">{{ row.contact }}</p>
            </div>
            <span v-else>匿名用户</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="处理时间" width="180">
          <template #default="{ row }">
            {{ row.replyTime ? formatDateTime(row.replyTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleProcess(row)"
              :disabled="row.status === 3"
            >
              处理
            </el-button>
            <el-button type="info" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="close" :disabled="row.status === 3">
                    关闭反馈
                  </el-dropdown-item>
                  <el-dropdown-item command="reopen" :disabled="row.status !== 3">
                    重新打开
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedFeedbacks.length > 0" class="batch-actions">
        <el-alert :title="`已选择 ${selectedFeedbacks.length} 项`" type="info" show-icon />
        <div class="actions">
          <el-button type="success" size="small" @click="handleBatchProcess">批量处理</el-button>
          <el-button type="warning" size="small" @click="handleBatchClose">批量关闭</el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="反馈ID">{{ currentFeedback.id }}</el-descriptions-item>
            <el-descriptions-item label="反馈类型">
              <el-tag :type="getTypeColor(currentFeedback.type)" size="small">
                {{ getTypeName(currentFeedback.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ currentFeedback.userId || '匿名' }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ currentFeedback.contact }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusColor(currentFeedback.status)" size="small">
                {{ getStatusName(currentFeedback.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatDateTime(currentFeedback.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>反馈内容</h4>
          <div class="feedback-content">
            {{ currentFeedback.content }}
          </div>
        </div>

        <div v-if="currentFeedback.reply" class="detail-section">
          <h4>处理回复</h4>
          <div class="reply-content">
            <p><strong>回复时间:</strong> {{ formatDateTime(currentFeedback.replyTime) }}</p>
            <p><strong>回复内容:</strong></p>
            <div class="reply-text">{{ currentFeedback.reply }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 处理反馈对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理反馈"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processRules"
        label-width="100px"
      >
        <el-form-item label="处理状态" prop="status">
          <el-radio-group v-model="processForm.status">
            <el-radio :value="1">处理中</el-radio>
            <el-radio :value="2">已处理</el-radio>
            <el-radio :value="3">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="回复内容" prop="reply">
          <el-input
            v-model="processForm.reply"
            type="textarea"
            :rows="6"
            placeholder="请输入处理回复内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitProcess" :loading="processing">
            提交处理
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { feedbackApi } from '@/api/feedback'

export default {
  name: 'FeedbackManagement',
  components: {
    Search,
    ArrowDown
  },
  setup() {
    const loading = ref(false)
    const processing = ref(false)
    const feedbackList = ref([])
    const selectedFeedbacks = ref([])
    const detailDialogVisible = ref(false)
    const processDialogVisible = ref(false)
    const currentFeedback = ref(null)
    
    const processFormRef = ref(null)

    // 搜索表单
    const searchForm = reactive({
      type: null,
      status: null,
      keyword: ''
    })

    // 处理表单
    const processForm = reactive({
      feedbackId: null,
      status: 1,
      reply: ''
    })

    // 分页
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0
    })

    // 表单验证规则
    const processRules = {
      status: [
        { required: true, message: '请选择处理状态', trigger: 'change' }
      ],
      reply: [
        { required: true, message: '请输入回复内容', trigger: 'blur' },
        { min: 10, message: '回复内容至少需要10个字符', trigger: 'blur' }
      ]
    }

    // 统计信息
    const stats = computed(() => {
      return {
        pending: feedbackList.value.filter(item => item.status === 0).length,
        processing: feedbackList.value.filter(item => item.status === 1).length,
        resolved: feedbackList.value.filter(item => item.status === 2).length,
        closed: feedbackList.value.filter(item => item.status === 3).length
      }
    })

    // 获取反馈列表
    const fetchFeedbackList = async () => {
      try {
        loading.value = true
        
        const params = {
          page: pagination.page - 1, // API使用0基索引，UI使用1基索引
          size: pagination.size,
          sortBy: 'createTime',
          direction: 'desc'
        }

        // 添加搜索条件
        if (searchForm.type !== null) {
          params.type = searchForm.type
        }
        if (searchForm.status !== null) {
          params.status = searchForm.status
        }
        if (searchForm.keyword) {
          params.keyword = searchForm.keyword
        }

        console.log('发送请求参数:', params)
        const response = await feedbackApi.getFeedbackList(params)
        console.log('收到响应数据:', response)
        
        // 现在API层已经统一了响应格式，直接处理
        if (response && response.code === 200 && response.data) {
          const feedbackData = response.data.content || []
          const totalCount = response.data.totalElements || 0
          
          feedbackList.value = feedbackData
          pagination.total = totalCount
          
          console.log('处理后的数据:', {
            feedbackCount: feedbackData.length,
            totalCount: totalCount,
            currentPage: pagination.page,
            pageSize: pagination.size
          })
          
          if (feedbackData.length === 0 && totalCount === 0) {
            ElMessage.info('暂无反馈数据')
          } else if (feedbackData.length === 0 && totalCount > 0) {
            ElMessage.info('当前页面无数据，请检查页码设置')
          }
        } else {
          console.error('响应格式不正确:', response)
          ElMessage.error(response?.message || '获取反馈列表失败')
        }
      } catch (error) {
        console.error('获取反馈列表失败:', error)
        ElMessage.error('获取反馈列表失败: ' + (error.message || '网络错误'))
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchFeedbackList()
    }

    // 重置搜索
    const resetSearch = () => {
      Object.assign(searchForm, { type: null, status: null, keyword: '' })
      pagination.page = 1
      fetchFeedbackList()
    }

    // 处理反馈
    const handleProcess = (row) => {
      currentFeedback.value = row
      processForm.feedbackId = row.id
      processForm.status = row.status === 0 ? 1 : row.status
      processForm.reply = row.reply || ''
      processDialogVisible.value = true
    }

    // 查看详情
    const handleView = (row) => {
      currentFeedback.value = row
      detailDialogVisible.value = true
    }

    // 下拉菜单命令处理
    const handleCommand = async (command, row) => {
      if (command === 'close') {
        await handleCloseFeedback(row)
      } else if (command === 'reopen') {
        await handleReopenFeedback(row)
      }
    }

    // 关闭反馈
    const handleCloseFeedback = async (row) => {
      try {
        await ElMessageBox.confirm(
          '确定要关闭这个反馈吗？',
          '确认关闭',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const data = new URLSearchParams()
        data.append('feedbackId', row.id)
        data.append('status', '3')
        data.append('reply', row.reply || '反馈已关闭')

        const response = await feedbackApi.processFeedback(data)
        if (response.code === 200) {
          ElMessage.success('反馈已关闭')
          fetchFeedbackList()
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('关闭反馈失败:', error)
          ElMessage.error('操作失败')
        }
      }
    }

    // 重新打开反馈
    const handleReopenFeedback = async (row) => {
      try {
        const data = new URLSearchParams()
        data.append('feedbackId', row.id)
        data.append('status', '0')
        data.append('reply', '')

        const response = await feedbackApi.processFeedback(data)
        if (response.code === 200) {
          ElMessage.success('反馈已重新打开')
          fetchFeedbackList()
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('重新打开反馈失败:', error)
        ElMessage.error('操作失败')
      }
    }

    // 提交处理
    const handleSubmitProcess = async () => {
      try {
        const valid = await processFormRef.value.validate()
        if (!valid) return

        processing.value = true

        const data = new URLSearchParams()
        data.append('feedbackId', processForm.feedbackId)
        data.append('status', processForm.status)
        data.append('reply', processForm.reply)

        const response = await feedbackApi.processFeedback(data)
        if (response.code === 200) {
          ElMessage.success('处理成功')
          processDialogVisible.value = false
          fetchFeedbackList()
        } else {
          ElMessage.error(response.message || '处理失败')
        }
      } catch (error) {
        console.error('处理反馈失败:', error)
        ElMessage.error('处理失败')
      } finally {
        processing.value = false
      }
    }

    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedFeedbacks.value = selection
    }

    // 批量处理
    const handleBatchProcess = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要批量处理选中的 ${selectedFeedbacks.value.length} 条反馈吗？`,
          '确认批量处理',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const processPromises = selectedFeedbacks.value.map(feedback => {
          const data = new URLSearchParams()
          data.append('feedbackId', feedback.id)
          data.append('status', '2')
          data.append('reply', '批量处理完成')
          return feedbackApi.processFeedback(data)
        })

        await Promise.all(processPromises)
        ElMessage.success('批量处理成功')
        selectedFeedbacks.value = []
        fetchFeedbackList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量处理失败:', error)
          ElMessage.error('批量处理失败')
        }
      }
    }

    // 批量关闭
    const handleBatchClose = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要批量关闭选中的 ${selectedFeedbacks.value.length} 条反馈吗？`,
          '确认批量关闭',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const closePromises = selectedFeedbacks.value.map(feedback => {
          const data = new URLSearchParams()
          data.append('feedbackId', feedback.id)
          data.append('status', '3')
          data.append('reply', '批量关闭')
          return feedbackApi.processFeedback(data)
        })

        await Promise.all(closePromises)
        ElMessage.success('批量关闭成功')
        selectedFeedbacks.value = []
        fetchFeedbackList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量关闭失败:', error)
          ElMessage.error('批量关闭失败')
        }
      }
    }

    // 分页变化
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      fetchFeedbackList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchFeedbackList()
    }

    // 获取反馈类型名称
    const getTypeName = (type) => {
      const typeMap = {
        1: '功能建议',
        2: 'Bug反馈',
        3: '内容问题',
        4: '其他'
      }
      return typeMap[type] || '未知'
    }

    // 获取反馈类型颜色
    const getTypeColor = (type) => {
      const colorMap = {
        1: 'primary',
        2: 'danger',
        3: 'warning',
        4: 'info'
      }
      return colorMap[type] || 'info'
    }

    // 获取状态名称
    const getStatusName = (status) => {
      const statusMap = {
        0: '待处理',
        1: '处理中',
        2: '已处理',
        3: '已关闭'
      }
      return statusMap[status] || '未知'
    }

    // 获取状态颜色
    const getStatusColor = (status) => {
      const colorMap = {
        0: 'warning',
        1: 'primary',
        2: 'success',
        3: 'info'
      }
      return colorMap[status] || 'info'
    }

    // 获取行样式类名
    const getRowClassName = ({ row }) => {
      if (row.status === 0) return 'pending-row'
      if (row.status === 2) return 'resolved-row'
      return ''
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    onMounted(() => {
      fetchFeedbackList()
    })

    return {
      loading,
      processing,
      feedbackList,
      selectedFeedbacks,
      detailDialogVisible,
      processDialogVisible,
      currentFeedback,
      processFormRef,
      searchForm,
      processForm,
      pagination,
      processRules,
      stats,
      handleSearch,
      resetSearch,
      handleProcess,
      handleView,
      handleCommand,
      handleSubmitProcess,
      handleSelectionChange,
      handleBatchProcess,
      handleBatchClose,
      handleSizeChange,
      handleCurrentChange,
      getTypeName,
      getTypeColor,
      getStatusName,
      getStatusColor,
      getRowClassName,
      formatDateTime
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-stats {
      display: flex;
      gap: 12px;
    }
  }
  
  .search-container {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .content-cell {
    .content-text {
      margin: 0 0 8px 0;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .content-meta {
      font-size: 12px;
      color: #999;
    }
  }

  .user-contact {
    font-size: 12px;
    color: #666;
    margin: 4px 0 0 0;
  }

  .batch-actions {
    margin: 20px 0;
    padding: 16px;
    background-color: #f0f9ff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .feedback-detail {
    .detail-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .feedback-content {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
      color: #333;
    }

    .reply-content {
      .reply-text {
        margin-top: 8px;
        padding: 12px;
        background-color: #e7f4ff;
        border-radius: 4px;
        line-height: 1.6;
        color: #333;
      }
    }
  }
}

// 表格行样式
:deep(.el-table) {
  .pending-row {
    background-color: #fff7e6;
  }

  .resolved-row {
    background-color: #f0f9f4;
  }
}
</style> 