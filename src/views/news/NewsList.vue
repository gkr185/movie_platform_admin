<template>
  <div class="news-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新闻列表</span>
          <el-button type="primary" size="small" @click="$router.push('/news/create')">
            <el-icon><Plus /></el-icon>
            新增新闻
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入新闻标题关键词"
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
          <el-col :span="6">
            <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable @change="handleSearch">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable @change="handleSearch">
              <el-option label="草稿" :value="0" />
              <el-option label="已发布" :value="1" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 新闻表格 -->
      <el-table
        v-loading="loading"
        :data="newsList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.cover_image"
              :src="row.cover_image"
              style="width: 60px; height: 40px"
              fit="cover"
              :preview-src-list="[row.cover_image]"
            />
            <span v-else class="no-image">无图片</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <el-tag v-if="row.is_top" type="danger" size="small">置顶</el-tag>
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="author" label="作者" width="120" />

        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category" size="small">{{ row.category.name }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="来源" width="120" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.publishTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedNews.length > 0" class="batch-actions">
        <el-alert :title="`已选择 ${selectedNews.length} 项`" type="info" show-icon />
        <div class="actions">
          <el-button type="danger" size="small" @click="handleBatchDelete">批量删除</el-button>
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

    <!-- 新闻详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentNews?.title"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentNews" class="news-detail">
        <div class="news-meta">
          <p><strong>作者：</strong>{{ currentNews.author }}</p>
          <p><strong>来源：</strong>{{ currentNews.source }}</p>
          <p><strong>分类：</strong>{{ currentNews.category?.name }}</p>
          <p><strong>发布时间：</strong>{{ formatDateTime(currentNews.publishTime) }}</p>
        </div>
        <div class="news-content" v-html="currentNews.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { newsApi, newsCategoryApi } from '@/api/news'

export default {
  name: 'NewsList',
  components: {
    Plus,
    Search
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const newsList = ref([])
    const categories = ref([])
    const selectedNews = ref([])
    const detailDialogVisible = ref(false)
    const currentNews = ref(null)

    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      categoryId: null,
      status: null
    })

    // 分页
    const pagination = reactive({
      page: 1,
      size: 20,
      total: 0
    })

    // 获取新闻列表
    const fetchNewsList = async () => {
      try {
        loading.value = true
        let response
        
        if (searchForm.keyword) {
          response = await newsApi.searchNews(searchForm.keyword)
        } else if (searchForm.categoryId) {
          response = await newsApi.getNewsByCategory(searchForm.categoryId)
        } else {
          response = await newsApi.getAllNews()
        }

        console.log('API响应:', response)

        // 处理不同的响应格式
        let data = []
        if (response && response.code === 200) {
          // 标准响应格式 {code: 200, data: [...]}
          data = response.data || []
        } else if (Array.isArray(response)) {
          // 直接返回数组格式
          data = response
        } else if (response && Array.isArray(response.data)) {
          // 包装在data字段中的数组
          data = response.data
        } else {
          throw new Error('API响应格式不正确')
        }
        
        // 根据状态筛选
        if (searchForm.status !== null && searchForm.status !== '') {
          data = data.filter(item => item.status === searchForm.status)
        }
        
        newsList.value = data
        pagination.total = data.length
        
        console.log('处理后的新闻列表:', data)
      } catch (error) {
        console.error('获取新闻列表失败:', error)
        ElMessage.error('获取新闻列表失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    // 获取分类列表
    const fetchCategories = async () => {
      try {
        const response = await newsCategoryApi.getActiveCategories()
        console.log('分类API响应:', response)
        
        // 处理不同的响应格式
        let data = []
        if (response && response.code === 200) {
          // 标准响应格式
          data = response.data || []
        } else if (Array.isArray(response)) {
          // 直接返回数组格式
          data = response
        } else if (response && Array.isArray(response.data)) {
          // 包装在data字段中的数组
          data = response.data
        }
        
        categories.value = data
        console.log('处理后的分类列表:', data)
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchNewsList()
    }

    // 重置搜索
    const resetSearch = () => {
      searchForm.keyword = ''
      searchForm.categoryId = null
      searchForm.status = null
      pagination.page = 1
      fetchNewsList()
    }

    // 编辑新闻
    const handleEdit = (row) => {
      // 跳转到编辑页面，携带新闻ID
      router.push(`/news/edit/${row.id}`)
    }

    // 查看新闻详情
    const handleView = async (row) => {
      try {
        const response = await newsApi.getNewsDetail(row.id)
        console.log('新闻详情API响应:', response)
        
        // 处理不同的响应格式
        let data = null
        if (response && response.code === 200) {
          // 标准响应格式
          data = response.data
        } else if (response && typeof response === 'object' && response.id) {
          // 直接返回新闻对象
          data = response
        } else if (response && response.data && typeof response.data === 'object') {
          // 包装在data字段中的对象
          data = response.data
        }
        
        if (data) {
          currentNews.value = data
          detailDialogVisible.value = true
        } else {
          ElMessage.error('获取新闻详情失败')
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        ElMessage.error('获取新闻详情失败')
      }
    }

    // 删除新闻
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除新闻"${row.title}"吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await newsApi.deleteNews(row.id)
        console.log('删除新闻API响应:', response)
        
        // 判断删除是否成功
        let success = false
        if (response && response.code === 200) {
          // 标准响应格式
          success = true
        } else if (response === null || response === undefined || response === '') {
          // 删除成功可能返回空响应
          success = true
        } else if (response && response.success === true) {
          // 其他成功标识
          success = true
        }
        
        if (success) {
          ElMessage.success('删除成功')
          fetchNewsList()
        } else {
          ElMessage.error(response?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除新闻失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedNews.value = selection
    }

    // 批量删除
    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedNews.value.length} 条新闻吗？`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const deletePromises = selectedNews.value.map(async (news) => {
          const response = await newsApi.deleteNews(news.id)
          console.log(`删除新闻 ${news.id} 的响应:`, response)
          
          // 判断删除是否成功 - 这里允许大部分情况下认为成功
          let success = true
          if (response && response.code && response.code !== 200) {
            // 只有明确返回了错误代码才认为失败
            success = false
          }
          
          if (!success) {
            throw new Error(`删除新闻 "${news.title}" 失败`)
          }
          
          return response
        })
        
        await Promise.all(deletePromises)
        
        ElMessage.success('批量删除成功')
        selectedNews.value = []
        fetchNewsList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 分页大小变化
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      fetchNewsList()
    }

    // 页码变化
    const handleCurrentChange = (page) => {
      pagination.page = page
      fetchNewsList()
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    onMounted(() => {
      fetchNewsList()
      fetchCategories()
    })

    return {
      loading,
      newsList,
      categories,
      selectedNews,
      detailDialogVisible,
      currentNews,
      searchForm,
      pagination,
      fetchNewsList,
      handleSearch,
      resetSearch,
      handleEdit,
      handleView,
      handleDelete,
      handleSelectionChange,
      handleBatchDelete,
      handleSizeChange,
      handleCurrentChange,
      formatDateTime
    }
  }
}
</script>

<style lang="scss" scoped>
.news-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-container {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .title-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .title-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .no-image {
    color: #999;
    font-size: 12px;
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

  .news-detail {
    .news-meta {
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 16px;

      p {
        margin: 8px 0;
        color: #666;
      }
    }

    .news-content {
      line-height: 1.6;
      color: #333;

      :deep(h1), :deep(h2), :deep(h3) {
        margin: 16px 0 8px 0;
      }

      :deep(p) {
        margin: 8px 0;
      }

      :deep(ul), :deep(ol) {
        margin: 8px 0;
        padding-left: 24px;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
      }
    }
  }
}
</style> 