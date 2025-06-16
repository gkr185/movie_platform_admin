<template>
  <div class="news-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>编辑新闻</span>
          <div class="header-actions">
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
            <el-button v-if="form.status === 0" type="success" @click="handlePublish" :loading="publishing">
              发布
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="large"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 基本信息 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <span>基本信息</span>
              </template>

              <el-form-item label="新闻标题" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="请输入新闻标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="作者" prop="author">
                <el-input
                  v-model="form.author"
                  placeholder="请输入作者名称"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="新闻来源" prop="source">
                <el-input
                  v-model="form.source"
                  placeholder="请输入新闻来源"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="新闻分类" prop="categoryId">
                <el-select v-model="form.categoryId" placeholder="请选择新闻分类" style="width: 100%">
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="封面图片">
                <div class="cover-upload">
                  <el-upload
                    class="cover-uploader"
                    :action="uploadAction"
                    :show-file-list="false"
                    :on-success="handleCoverSuccess"
                    :on-error="handleUploadError"
                    :before-upload="beforeCoverUpload"
                    accept="image/*"
                  >
                    <img v-if="form.cover_image" :src="form.cover_image" class="cover-image" />
                    <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="upload-tips">
                    <p>建议上传16:9比例的图片，文件大小不超过2MB</p>
                    <p>支持JPG、PNG格式</p>
                    <el-button v-if="form.cover_image" size="small" type="danger" @click="removeCover">
                      删除图片
                    </el-button>
                  </div>
                </div>
              </el-form-item>
            </el-card>

            <!-- 新闻内容 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <span>新闻内容</span>
              </template>

              <el-form-item label="内容编辑" prop="content">
                <div class="editor-container">
                  <div class="editor-toolbar">
                    <el-button-group>
                      <el-button size="small" @click="insertTemplate('heading')">
                        <el-icon><Document /></el-icon>
                        标题
                      </el-button>
                      <el-button size="small" @click="insertTemplate('list')">
                        <el-icon><List /></el-icon>
                        列表
                      </el-button>
                      <el-button size="small" @click="insertTemplate('quote')">
                        <el-icon><ChatLineSquare /></el-icon>
                        引用
                      </el-button>
                    </el-button-group>
                    <el-upload
                      :action="uploadAction"
                      :show-file-list="false"
                      :on-success="handleContentImageSuccess"
                      :on-error="handleUploadError"
                      :before-upload="beforeImageUpload"
                      accept="image/*"
                    >
                      <el-button size="small">
                        <el-icon><Picture /></el-icon>
                        插入图片
                      </el-button>
                    </el-upload>
                  </div>
                  
                  <el-input
                    v-model="form.content"
                    type="textarea"
                    :rows="20"
                    placeholder="请输入新闻内容，支持Markdown语法"
                    class="content-editor"
                  />
                </div>
              </el-form-item>

              <!-- 内容预览 -->
              <el-form-item label="内容预览">
                <div class="content-preview" v-html="renderedContent"></div>
              </el-form-item>
            </el-card>
          </el-col>

          <el-col :span="8">
            <!-- 发布设置 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <span>发布设置</span>
              </template>

              <el-form-item label="是否置顶">
                <el-switch
                  v-model="form.is_top"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="置顶"
                  inactive-text="普通"
                />
              </el-form-item>

              <el-form-item label="发布状态">
                <el-radio-group v-model="form.status">
                  <el-radio :value="0">草稿</el-radio>
                  <el-radio :value="1">发布</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="发布时间" v-if="form.status === 1">
                <el-date-picker
                  v-model="form.publishTime"
                  type="datetime"
                  placeholder="选择发布时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-card>

            <!-- 新闻信息 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <span>新闻信息</span>
              </template>
              
              <div class="news-info">
                <p><strong>新闻ID:</strong> {{ form.id }}</p>
                <p><strong>创建时间:</strong> {{ formatDateTime(originalData?.createTime) }}</p>
                <p><strong>更新时间:</strong> {{ formatDateTime(originalData?.updateTime) }}</p>
                <p><strong>当前状态:</strong> 
                  <el-tag :type="form.status === 1 ? 'success' : 'info'" size="small">
                    {{ form.status === 1 ? '已发布' : '草稿' }}
                  </el-tag>
                </p>
              </div>
            </el-card>

            <!-- 操作历史 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <span>操作历史</span>
              </template>
              <div class="operation-history">
                <p class="history-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDateTime(originalData?.createTime) }} 创建新闻
                </p>
                <p v-if="originalData?.updateTime !== originalData?.createTime" class="history-item">
                  <el-icon><Edit /></el-icon>
                  {{ formatDateTime(originalData?.updateTime) }} 最后更新
                </p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Document, 
  List, 
  ChatLineSquare, 
  Picture, 
  Clock,
  Edit
} from '@element-plus/icons-vue'
import { newsApi, newsCategoryApi } from '@/api/news'

export default {
  name: 'NewsEdit',
  components: {
    Plus,
    Document,
    List,
    ChatLineSquare,
    Picture,
    Clock,
    Edit
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref(null)
    
    const loading = ref(false)
    const saving = ref(false)
    const publishing = ref(false)
    
    const categories = ref([])
    const originalData = ref(null)
    const uploadAction = ref('/images/upload')
    const newsId = route.params.id

    // 新闻表单
    const form = reactive({
      id: null,
      title: '',
      content: '',
      author: '',
      source: '',
      cover_image: '',
      is_top: 0,
      status: 0,
      categoryId: null,
      publishTime: null
    })

    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入新闻标题', trigger: 'blur' },
        { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入新闻内容', trigger: 'blur' },
        { min: 50, message: '内容至少需要50个字符', trigger: 'blur' }
      ],
      author: [
        { required: true, message: '请输入作者名称', trigger: 'blur' }
      ],
      source: [
        { required: true, message: '请输入新闻来源', trigger: 'blur' }
      ],
      categoryId: [
        { required: true, message: '请选择新闻分类', trigger: 'change' }
      ]
    }

    // 渲染的内容（简单的Markdown转HTML）
    const renderedContent = computed(() => {
      if (!form.content) return ''
      return form.content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\n/g, '<br>')
    })

    // 获取新闻详情
    const fetchNewsDetail = async () => {
      if (!newsId) {
        ElMessage.error('缺少新闻ID')
        router.back()
        return
      }

      try {
        loading.value = true
        const response = await newsApi.getNewsDetail(newsId)
        console.log('获取新闻详情API响应:', response)
        
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
          originalData.value = data
          console.log('新闻详情数据:', data)
          
          // 填充表单数据
          Object.assign(form, {
            id: data.id,
            title: data.title || '',
            content: data.content || '',
            author: data.author || '',
            source: data.source || '',
            cover_image: data.cover_image || '',
            is_top: data.is_top || 0,
            status: data.status || 0,
            categoryId: data.category?.id || data.categoryId || null,
            publishTime: data.publishTime ? new Date(data.publishTime) : null
          })
          
          console.log('填充后的表单数据:', form)
        } else {
          ElMessage.error('获取新闻详情失败')
          router.back()
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        ElMessage.error('获取新闻详情失败')
        router.back()
      } finally {
        loading.value = false
      }
    }

    // 获取分类列表
    const fetchCategories = async () => {
      try {
        console.log('调用 getActiveCategories() 方法')
        const response = await newsCategoryApi.getActiveCategories()
        console.log('获取活跃分类列表API响应:', response)
        
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

    // 插入模板
    const insertTemplate = (type) => {
      const templates = {
        heading: '\n## 标题\n\n',
        list: '\n* 列表项1\n* 列表项2\n* 列表项3\n\n',
        quote: '\n> 引用内容\n\n'
      }
      
      form.content += templates[type] || ''
    }

    // 删除封面
    const removeCover = () => {
      form.cover_image = ''
    }

    // 封面上传成功
    const handleCoverSuccess = (response) => {
      console.log('封面上传API响应:', response)
      
      // 处理不同的响应格式
      let success = false
      let imageUrl = ''
      
      if (response && response.code === 200) {
        // 标准响应格式
        success = true
        imageUrl = response.data
      } else if (typeof response === 'string') {
        // 直接返回图片URL
        success = true
        imageUrl = response
      } else if (response && response.url) {
        // 包含url字段的响应
        success = true
        imageUrl = response.url
      }
      
      if (success && imageUrl) {
        form.cover_image = imageUrl
        ElMessage.success('封面上传成功')
      } else {
        ElMessage.error(response?.message || '上传失败')
      }
    }

    // 内容图片上传成功
    const handleContentImageSuccess = (response) => {
      console.log('内容图片上传API响应:', response)
      
      // 处理不同的响应格式
      let success = false
      let imageUrl = ''
      
      if (response && response.code === 200) {
        // 标准响应格式
        success = true
        imageUrl = response.data
      } else if (typeof response === 'string') {
        // 直接返回图片URL
        success = true
        imageUrl = response
      } else if (response && response.url) {
        // 包含url字段的响应
        success = true
        imageUrl = response.url
      }
      
      if (success && imageUrl) {
        const imageMarkdown = `\n![图片](${imageUrl})\n`
        form.content += imageMarkdown
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(response?.message || '上传失败')
      }
    }

    // 上传失败
    const handleUploadError = (error) => {
      console.error('上传失败:', error)
      ElMessage.error('上传失败')
    }

    // 上传前检查
    const beforeCoverUpload = (file) => {
      const isImage = /^image\//.test(file.type)
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    const beforeImageUpload = (file) => {
      return beforeCoverUpload(file)
    }

    // 保存新闻
    const handleSave = async () => {
      try {
        const valid = await formRef.value.validate()
        if (!valid) return

        saving.value = true
        
        // 构建新闻数据，确保格式正确
        const newsData = {
          id: form.id,
          title: form.title,
          content: form.content,
          author: form.author,
          source: form.source,
          cover_image: form.cover_image,
          is_top: form.is_top,
          status: form.status
        }

        // 只有当分类ID存在时才添加分类信息
        if (form.categoryId) {
          newsData.category = { id: form.categoryId }
        }

        // 只有当发布时间存在时才添加
        if (form.publishTime) {
          newsData.publishTime = form.publishTime.toISOString()
        }

        console.log('发送的新闻数据:', newsData)

        const response = await newsApi.updateNews(newsData)
        console.log('保存新闻API响应:', response)
        
        // 处理不同的响应格式
        let success = false
        let errorMessage = '保存失败'
        
        if (response && response.code === 200) {
          // 标准成功响应格式 {code: 200, data: {...}}
          success = true
        } else if (response && typeof response === 'object' && response.id) {
          // 直接返回新闻对象格式 {id: 1, title: "...", ...}
          success = true
        } else if (response === null || response === undefined || response === '') {
          // 保存成功可能返回空响应
          success = true
        } else if (response && response.success === true) {
          // 其他成功标识
          success = true
        } else if (response && response.code && response.code !== 200) {
          // 有错误代码的响应
          success = false
          errorMessage = response.message || `请求失败 (${response.code})`
        } else if (response && response.content && Array.isArray(response.content)) {
          // 处理验证错误响应格式
          success = false
          const errors = response.content.map(err => err.message || err).join(', ')
          errorMessage = `数据验证失败: ${errors}`
        }
        
        if (success) {
          ElMessage.success('保存成功')
          // 重新获取数据以更新显示
          await fetchNewsDetail()
        } else {
          ElMessage.error(errorMessage)
        }
      } catch (error) {
        console.error('保存新闻失败:', error)
        
        // 处理网络错误或其他异常
        let errorMessage = '保存失败'
        if (error.response) {
          // HTTP错误响应
          const data = error.response.data
          if (data && data.content && Array.isArray(data.content)) {
            const errors = data.content.map(err => err.message || err).join(', ')
            errorMessage = `数据验证失败: ${errors}`
          } else if (data && data.message) {
            errorMessage = data.message
          } else {
            errorMessage = `请求失败 (${error.response.status})`
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        ElMessage.error(errorMessage)
      } finally {
        saving.value = false
      }
    }

    // 发布新闻
    const handlePublish = async () => {
      try {
        const valid = await formRef.value.validate()
        if (!valid) return

        publishing.value = true
        
        // 构建发布数据
        const newsData = {
          id: form.id,
          title: form.title,
          content: form.content,
          author: form.author,
          source: form.source,
          cover_image: form.cover_image,
          is_top: form.is_top,
          status: 1,
          publishTime: new Date().toISOString()
        }

        // 只有当分类ID存在时才添加分类信息
        if (form.categoryId) {
          newsData.category = { id: form.categoryId }
        }

        console.log('发送的发布数据:', newsData)

        const response = await newsApi.updateNews(newsData)
        console.log('发布新闻API响应:', response)
        
        // 处理不同的响应格式
        let success = false
        let errorMessage = '发布失败'
        
        if (response && response.code === 200) {
          // 标准成功响应格式
          success = true
        } else if (response === null || response === undefined || response === '') {
          // 发布成功可能返回空响应
          success = true
        } else if (response && response.success === true) {
          // 其他成功标识
          success = true
        } else if (response && response.code && response.code !== 200) {
          // 有错误代码的响应
          success = false
          errorMessage = response.message || `请求失败 (${response.code})`
        } else if (response && response.content && Array.isArray(response.content)) {
          // 处理验证错误响应格式
          success = false
          const errors = response.content.map(err => err.message || err).join(', ')
          errorMessage = `数据验证失败: ${errors}`
        }
        
        if (success) {
          ElMessage.success('发布成功')
          // 更新表单状态
          form.status = 1
          form.publishTime = new Date()
          // 重新获取数据
          await fetchNewsDetail()
        } else {
          ElMessage.error(errorMessage)
        }
      } catch (error) {
        console.error('发布新闻失败:', error)
        
        // 处理网络错误或其他异常
        let errorMessage = '发布失败'
        if (error.response) {
          // HTTP错误响应
          const data = error.response.data
          if (data && data.content && Array.isArray(data.content)) {
            const errors = data.content.map(err => err.message || err).join(', ')
            errorMessage = `数据验证失败: ${errors}`
          } else if (data && data.message) {
            errorMessage = data.message
          } else {
            errorMessage = `请求失败 (${error.response.status})`
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        ElMessage.error(errorMessage)
      } finally {
        publishing.value = false
      }
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    }

    onMounted(() => {
      fetchNewsDetail()
      fetchCategories()
    })

    return {
      formRef,
      loading,
      saving,
      publishing,
      categories,
      originalData,
      uploadAction,
      form,
      rules,
      renderedContent,
      insertTemplate,
      removeCover,
      handleCoverSuccess,
      handleContentImageSuccess,
      handleUploadError,
      beforeCoverUpload,
      beforeImageUpload,
      handleSave,
      handlePublish,
      formatDateTime
    }
  }
}
</script>

<style lang="scss" scoped>
.news-edit {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .form-section {
    margin-bottom: 20px;
    
    .el-card__body {
      padding: 20px;
    }
  }

  .cover-upload {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    .cover-uploader {
      .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: 0.2s;
        width: 200px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #409eff;
        }
      }

      .cover-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .cover-image {
        width: 200px;
        height: 120px;
        object-fit: cover;
      }
    }

    .upload-tips {
      color: #666;
      font-size: 12px;
      line-height: 1.5;

      p {
        margin: 4px 0;
      }
    }
  }

  .editor-container {
    .editor-toolbar {
      margin-bottom: 12px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .content-editor {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
  }

  .content-preview {
    max-height: 300px;
    overflow-y: auto;
    padding: 16px;
    background-color: #fafafa;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    line-height: 1.6;

    :deep(h1), :deep(h2), :deep(h3) {
      margin: 16px 0 8px 0;
      color: #303133;
    }

    :deep(blockquote) {
      margin: 8px 0;
      padding: 8px 16px;
      background-color: #f0f0f0;
      border-left: 4px solid #409eff;
    }

    :deep(li) {
      margin: 4px 0;
      list-style-type: disc;
      margin-left: 20px;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }

  .news-info {
    p {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }
  }

  .operation-history {
    .history-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }
  }
}
</style> 