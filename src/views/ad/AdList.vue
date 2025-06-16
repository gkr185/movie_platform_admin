<template>
  <div class="ad-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>广告管理</span>
          <el-button type="primary" size="small" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增广告
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item label="广告标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入广告标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="广告位置">
            <el-select
              v-model="searchForm.position"
              placeholder="请选择广告位置"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="option in positionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作区域 -->
      <div class="batch-actions" v-if="selectedAds.length > 0">
        <el-alert
          :title="`已选择 ${selectedAds.length} 条广告`"
          type="info"
          show-icon
          :closable="false"
        >
          <template #default>
            <div class="batch-buttons">
              <el-button size="small" @click="handleBatchEnable">批量启用</el-button>
              <el-button size="small" @click="handleBatchDisable">批量禁用</el-button>
              <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 广告列表表格 -->
      <el-table
        :data="adList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="广告标题" min-width="150" show-overflow-tooltip />
        
        <!-- 广告预览 -->
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <div class="ad-preview">
              <el-image
                :src="row.imageUrl"
                :preview-src-list="[row.imageUrl]"
                fit="cover"
                style="width: 80px; height: 45px; border-radius: 4px;"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="ad-type-badges">
                <el-tag v-if="row.hasVideo" size="small" type="success">视频</el-tag>
                <el-tag v-if="row.hasLink" size="small" type="info">链接</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="position" label="广告位置" width="120" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        
        <!-- 投放时间 -->
        <el-table-column label="投放时间" width="180">
          <template #default="{ row }">
            <div class="time-range">
              <div v-if="row.startTime">开始: {{ row.startTimeFormatted }}</div>
              <div v-if="row.endTime">结束: {{ row.endTimeFormatted }}</div>
              <div v-if="!row.startTime && !row.endTime" class="text-muted">永久投放</div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <div class="status-info">
              <el-tag :type="row.statusColor" size="small">
                {{ row.statusLabel }}
              </el-tag>
              <div class="active-status" v-if="row.status === 1">
                <el-tag 
                  :type="isAdActive(row) ? 'success' : 'warning'" 
                  size="small"
                  style="margin-top: 2px;"
                >
                  {{ isAdActive(row) ? '投放中' : '未投放' }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTimeFormatted" label="创建时间" width="160" />

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="row.status === 1 ? 'disable' : 'enable'">
                    {{ row.status === 1 ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 广告详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="广告详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentAd" class="ad-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="广告ID">{{ currentAd.id }}</el-descriptions-item>
          <el-descriptions-item label="广告标题">{{ currentAd.title }}</el-descriptions-item>
          <el-descriptions-item label="广告位置">{{ currentAd.position }}</el-descriptions-item>
          <el-descriptions-item label="排序权重">{{ currentAd.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentAd.statusColor" size="small">
              {{ currentAd.statusLabel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="广告类型">
            {{ getAdType(currentAd) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentAd.createTimeFormatted }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentAd.updateTimeFormatted }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section" style="margin-top: 20px;">
          <h4>广告预览</h4>
          <div class="ad-preview-large">
            <el-image
              :src="currentAd.imageUrl"
              fit="contain"
              style="max-width: 100%; max-height: 300px;"
            >
              <template #error>
                <div class="image-error-large">
                  <el-icon><Picture /></el-icon>
                  <p>图片加载失败</p>
                </div>
              </template>
            </el-image>
          </div>
        </div>

        <div v-if="currentAd.videoUrl" class="detail-section">
          <h4>视频链接</h4>
          <el-link :href="currentAd.videoUrl" target="_blank" type="primary">
            {{ currentAd.videoUrl }}
          </el-link>
        </div>

        <div v-if="currentAd.linkUrl" class="detail-section">
          <h4>跳转链接</h4>
          <el-link :href="currentAd.linkUrl" target="_blank" type="primary">
            {{ currentAd.linkUrl }}
          </el-link>
        </div>

        <div v-if="currentAd.startTime || currentAd.endTime" class="detail-section">
          <h4>投放时间</h4>
          <p v-if="currentAd.startTime">开始时间: {{ currentAd.startTimeFormatted }}</p>
          <p v-if="currentAd.endTime">结束时间: {{ currentAd.endTimeFormatted }}</p>
          <p v-if="!currentAd.startTime && !currentAd.endTime">永久投放</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown, Picture } from '@element-plus/icons-vue'
import { advertisementApi, advertisementHelper, AD_POSITION_OPTIONS } from '@/api/advertisement'

export default {
  name: 'AdList',
  components: {
    Search,
    Plus,
    ArrowDown,
    Picture
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const adList = ref([])
    const selectedAds = ref([])
    const detailDialogVisible = ref(false)
    const currentAd = ref(null)

    // 搜索表单
    const searchForm = reactive({
      title: '',
      position: '',
      status: null
    })

    // 分页
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0
    })

    // 广告位置选项
    const positionOptions = AD_POSITION_OPTIONS

    // 获取广告列表
    const fetchAdList = async () => {
      try {
        loading.value = true
        const params = {
          page: pagination.page - 1, // 后端从0开始
          size: pagination.size,
          sortBy: 'createTime',
          direction: 'desc'
        }

        // 添加搜索条件
        if (searchForm.title) {
          params.title = searchForm.title
        }
        if (searchForm.position) {
          params.position = searchForm.position
        }
        if (searchForm.status !== null) {
          params.status = searchForm.status
        }

        const response = await advertisementApi.getAdvertisementList(params)
        if (response.code === 200) {
          const data = response.data
          if (data.content) {
            // 分页数据格式
            adList.value = advertisementHelper.formatAdvertisementsForTable(data.content)
            pagination.total = data.totalElements
          } else if (Array.isArray(data)) {
            // 数组格式
            adList.value = advertisementHelper.formatAdvertisementsForTable(data)
            pagination.total = data.length
          } else {
            adList.value = []
            pagination.total = 0
          }
        } else {
          ElMessage.error(response.message || '获取广告列表失败')
          adList.value = []
          pagination.total = 0
        }
      } catch (error) {
        console.error('获取广告列表失败:', error)
        ElMessage.error('获取广告列表失败')
        adList.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchAdList()
    }

    // 重置搜索
    const resetSearch = () => {
      searchForm.title = ''
      searchForm.position = ''
      searchForm.status = null
      pagination.page = 1
      fetchAdList()
    }

    // 新增广告
    const handleCreate = () => {
      router.push('/ad/create')
    }

    // 查看广告
    const handleView = (row) => {
      currentAd.value = row
      detailDialogVisible.value = true
    }

    // 编辑广告
    const handleEdit = (row) => {
      // 通过路由传递广告数据，避免重新请求API
      router.push({
        name: 'AdEdit',
        params: { id: row.id },
        query: { data: JSON.stringify(row) }
      })
    }

    // 下拉菜单操作
    const handleCommand = async (command, row) => {
      switch (command) {
        case 'enable':
          await handleToggleStatus(row, 1)
          break
        case 'disable':
          await handleToggleStatus(row, 0)
          break
        case 'copy':
          await handleCopy(row)
          break
        case 'delete':
          await handleDelete(row)
          break
      }
    }

    // 切换状态
    const handleToggleStatus = async (row, status) => {
      try {
        const action = status === 1 ? '启用' : '禁用'
        await ElMessageBox.confirm(
          `确定要${action}广告"${row.title}"吗？`,
          `确认${action}`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await advertisementApi.updateAdvertisement(row.id, { status })
        if (response.code === 200) {
          ElMessage.success(`${action}成功`)
          fetchAdList()
        } else {
          ElMessage.error(response.message || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换状态失败:', error)
          ElMessage.error('操作失败')
        }
      }
    }

    // 复制广告
    const handleCopy = async (row) => {
      try {
        const copyData = {
          title: `${row.title} - 副本`,
          imageUrl: row.imageUrl,
          videoUrl: row.videoUrl,
          linkUrl: row.linkUrl,
          position: row.position,
          sortOrder: row.sortOrder + 1,
          startTime: row.startTime,
          endTime: row.endTime,
          status: 0 // 复制的广告默认禁用
        }

        const response = await advertisementApi.createAdvertisement(copyData)
        if (response.code === 200) {
          ElMessage.success('复制成功')
          fetchAdList()
        } else {
          ElMessage.error(response.message || '复制失败')
        }
      } catch (error) {
        console.error('复制广告失败:', error)
        ElMessage.error('复制失败')
      }
    }

    // 删除广告
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除广告"${row.title}"吗？此操作不可恢复！`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        console.log('开始删除广告，ID:', row.id)
        const response = await advertisementApi.deleteAdvertisement(row.id)
        console.log('删除广告API响应:', response)
        
        // 检查响应格式，支持多种成功格式
        if (response && (response.code === 200 || response.code === undefined)) {
          ElMessage.success('删除成功')
          fetchAdList()
        } else {
          console.error('删除失败，响应:', response)
          ElMessage.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除广告失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedAds.value = selection
    }

    // 批量启用
    const handleBatchEnable = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要批量启用选中的 ${selectedAds.value.length} 条广告吗？`,
          '确认批量启用',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = selectedAds.value.map(ad => ad.id)
        await advertisementApi.batchUpdateStatus(ids, 1)
        ElMessage.success('批量启用成功')
        selectedAds.value = []
        fetchAdList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量启用失败:', error)
          ElMessage.error('批量启用失败')
        }
      }
    }

    // 批量禁用
    const handleBatchDisable = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要批量禁用选中的 ${selectedAds.value.length} 条广告吗？`,
          '确认批量禁用',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = selectedAds.value.map(ad => ad.id)
        await advertisementApi.batchUpdateStatus(ids, 0)
        ElMessage.success('批量禁用成功')
        selectedAds.value = []
        fetchAdList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量禁用失败:', error)
          ElMessage.error('批量禁用失败')
        }
      }
    }

    // 批量删除
    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要批量删除选中的 ${selectedAds.value.length} 条广告吗？此操作不可恢复！`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        console.log('开始批量删除广告，IDs:', selectedAds.value.map(ad => ad.id))
        const deletePromises = selectedAds.value.map(ad => 
          advertisementApi.deleteAdvertisement(ad.id)
        )
        const responses = await Promise.all(deletePromises)
        console.log('批量删除API响应:', responses)
        
        ElMessage.success('批量删除成功')
        selectedAds.value = []
        fetchAdList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 分页变化
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      fetchAdList()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchAdList()
    }

    // 获取广告类型
    const getAdType = (ad) => {
      return advertisementHelper.getAdvertisementType(ad)
    }

    // 检查广告是否在投放期内
    const isAdActive = (ad) => {
      return advertisementHelper.isAdvertisementActive(ad)
    }

    onMounted(() => {
      fetchAdList()
    })

    return {
      loading,
      adList,
      selectedAds,
      detailDialogVisible,
      currentAd,
      searchForm,
      pagination,
      positionOptions,
      handleSearch,
      resetSearch,
      handleCreate,
      handleView,
      handleEdit,
      handleCommand,
      handleSelectionChange,
      handleBatchEnable,
      handleBatchDisable,
      handleBatchDelete,
      handleSizeChange,
      handleCurrentChange,
      getAdType,
      isAdActive
    }
  }
}
</script>

<style lang="scss" scoped>
.ad-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-section {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .batch-actions {
    margin-bottom: 20px;
    
    .batch-buttons {
      margin-top: 10px;
    }
  }

  .ad-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .image-error {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 45px;
      background-color: #f5f7fa;
      border-radius: 4px;
      color: #c0c4cc;
    }

    .ad-type-badges {
      display: flex;
      gap: 2px;
    }
  }

  .time-range {
    font-size: 12px;
    line-height: 1.4;
    
    .text-muted {
      color: #909399;
    }
  }

  .status-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .ad-detail {
    .detail-section {
      margin-top: 20px;
      
      h4 {
        margin-bottom: 10px;
        color: #303133;
      }
    }

    .ad-preview-large {
      display: flex;
      justify-content: center;
      padding: 20px;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      background-color: #fafafa;

      .image-error-large {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #c0c4cc;
        
        p {
          margin-top: 10px;
          margin-bottom: 0;
        }
      }
    }
  }
}
</style> 