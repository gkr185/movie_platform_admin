<template>
  <div class="news-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发布新闻</span>
          <div class="header-actions">
            <el-button @click="$router.back()">返回</el-button>
            <el-button type="primary" @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
            <el-button type="success" @click="handlePublish" :loading="publishing">发布</el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="large"
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
                  <FileUpload
                    ref="coverUploadRef"
                    category="news"
                    :related-id="form.id"
                    url-type="cover"
                    :auto-update-db="!!form.id"
                    upload-text="上传封面图片"
                    :max-size="5"
                    :file-types="['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']"
                    @upload-success="handleCoverUploadSuccess"
                  />
                  
                  <div class="manual-input" style="margin-top: 10px;">
                    <el-input
                      v-model="form.cover_image"
                      placeholder="或直接输入图片URL"
                    >
                      <template #prepend>封面URL</template>
                    </el-input>
                  </div>
                  
                  <div v-if="form.cover_image" class="cover-preview" style="margin-top: 10px;">
                    <el-image
                      :src="form.cover_image"
                      :preview-src-list="[form.cover_image]"
                      fit="cover"
                      style="width: 200px; height: 120px; border-radius: 4px;"
                      preview-teleported
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <p>图片加载失败</p>
                        </div>
                      </template>
                    </el-image>
                    <div class="cover-actions" style="margin-top: 8px;">
                      <el-button size="small" @click="handlePreviewCover">预览</el-button>
                      <el-button size="small" type="danger" @click="handleRemoveCover">删除</el-button>
                    </div>
                  </div>
                  
                  <div class="upload-tips" style="margin-top: 10px;">
                    <p>建议上传16:9比例的图片，文件大小不超过5MB</p>
                    <p>支持JPG、PNG、GIF等格式</p>
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
                    <FileUpload
                      ref="contentImageUploadRef"
                      category="news"
                      :related-id="form.id"
                      :auto-update-db="false"
                      upload-text="插入图片"
                      :max-size="5"
                      :file-types="['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']"
                      @upload-success="handleContentImageUploadSuccess"
                    >
                      <template #trigger>
                        <el-button size="small">
                          <el-icon><Picture /></el-icon>
                          插入图片
                        </el-button>
                      </template>
                    </FileUpload>
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

            <!-- 分类管理 -->
            <el-card class="form-section" shadow="never">
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>分类管理</span>
                  <el-button type="primary" size="small" @click="categoryDialogVisible = true">
                    新增分类
                  </el-button>
                </div>
              </template>

              <div class="category-list">
                <el-tag
                  v-for="category in categories"
                  :key="category.id"
                  :type="category.status === 1 ? 'success' : 'info'"
                  class="category-tag"
                  closable
                  @close="handleDeleteCategory(category.id)"
                >
                  {{ category.name }}
                </el-tag>
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
                  {{ new Date().toLocaleString() }} 创建草稿
                </p>
      </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 分类创建对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="新增分类"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="1" :max="100" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreateCategory" :loading="categoryCreating">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Document, 
  List, 
  ChatLineSquare, 
  Picture, 
  Clock 
} from '@element-plus/icons-vue'
import FileUpload from '@/components/FileUpload.vue'
import { newsApi, newsCategoryApi, imageApi } from '@/api/news'

export default {
  name: 'NewsCreate',
  components: {
    Plus,
    Document,
    List,
    ChatLineSquare,
    Picture,
    Clock,
    FileUpload
  },
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const categoryFormRef = ref(null)
    const coverUploadRef = ref(null)
    const contentImageUploadRef = ref(null)
    
    const saving = ref(false)
    const publishing = ref(false)
    const categoryCreating = ref(false)
    const categoryDialogVisible = ref(false)
    
    const categories = ref([])

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

    // 分类表单
    const categoryForm = reactive({
      name: '',
      description: '',
      sortOrder: 1,
      status: 1
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

    // 分类表单验证规则
    const categoryRules = {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      description: [
        { max: 100, message: '描述不能超过100个字符', trigger: 'blur' }
      ],
      sortOrder: [
        { required: true, message: '请输入排序权重', trigger: 'blur' }
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

    // 文件上传成功处理
    const handleCoverUploadSuccess = (response) => {
      if (response.success) {
        form.cover_image = response.fileUrl
        ElMessage.success('封面图片上传成功')
      }
    }

    const handleContentImageUploadSuccess = (response) => {
      if (response.success) {
        const imageMarkdown = `\n![图片](${response.fileUrl})\n`
        form.content += imageMarkdown
        ElMessage.success('图片上传成功，已插入到内容中')
      }
    }

    // 封面预览和删除
    const handlePreviewCover = () => {
      // 预览功能由el-image组件自动处理
    }

    const handleRemoveCover = () => {
      form.cover_image = ''
    }

    // 保存草稿
    const handleSaveDraft = async () => {
      try {
        const valid = await formRef.value.validate()
        if (!valid) return

        saving.value = true
        
        // 构建新闻数据
        const newsData = {
          title: form.title,
          content: form.content,
          author: form.author,
          source: form.source,
          cover_image: form.cover_image,
          is_top: form.is_top,
          status: 0
        }

        // 只有当分类ID存在时才添加分类信息
        if (form.categoryId) {
          newsData.category = { id: form.categoryId }
        }

        console.log('发送的草稿数据:', newsData)

        const response = await newsApi.createNews(newsData)
        console.log('保存草稿API响应:', response)
        
        // 处理不同的响应格式
        let success = false
        let errorMessage = '保存失败'
        
        if (response && response.code === 200) {
          // 标准成功响应格式
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
          ElMessage.success('草稿保存成功')
          
          // 如果是新创建的新闻，设置ID以便后续文件上传
          if (!form.id) {
            const newsId = response.data?.id || response.id
            if (newsId) {
              form.id = newsId
              ElMessage.info(`新闻ID: ${newsId}，现在可以上传相关文件`)
            }
          }
          
          router.push('/news/list')
        } else {
          ElMessage.error(errorMessage)
        }
      } catch (error) {
        console.error('保存草稿失败:', error)
        
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
          title: form.title,
          content: form.content,
          author: form.author,
          source: form.source,
          cover_image: form.cover_image,
          is_top: form.is_top,
          status: 1,
          publishTime: form.publishTime || new Date().toISOString()
        }

        // 只有当分类ID存在时才添加分类信息
        if (form.categoryId) {
          newsData.category = { id: form.categoryId }
        }

        console.log('发送的发布数据:', newsData)

        const response = await newsApi.createNews(newsData)
        console.log('发布新闻API响应:', response)
        
        // 处理不同的响应格式
        let success = false
        let errorMessage = '发布失败'
        
        if (response && response.code === 200) {
          // 标准成功响应格式
          success = true
        } else if (response && typeof response === 'object' && response.id) {
          // 直接返回新闻对象格式 {id: 1, title: "...", ...}
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
          ElMessage.success('新闻发布成功')
          
          // 如果是新创建的新闻，设置ID以便后续文件上传
          if (!form.id) {
            const newsId = response.data?.id || response.id
            if (newsId) {
              form.id = newsId
              ElMessage.info(`新闻ID: ${newsId}，现在可以上传相关文件`)
            }
          }
          
          router.push('/news/list')
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

    // 创建分类
    const handleCreateCategory = async () => {
      try {
        const valid = await categoryFormRef.value.validate()
        if (!valid) return

        categoryCreating.value = true
        
        const response = await newsCategoryApi.createCategory(categoryForm)
        console.log('创建分类API响应:', response)
        
        // 处理不同的响应格式
        let success = false
        if (response && response.code === 200) {
          // 标准响应格式
          success = true
        } else if (response && typeof response === 'object' && response.id) {
          // 直接返回分类对象
          success = true
        } else if (response === null || response === undefined || response === '') {
          // 创建成功可能返回空响应
          success = true
        }
        
        if (success) {
          ElMessage.success('分类创建成功')
          categoryDialogVisible.value = false
          
          // 重置表单
          Object.assign(categoryForm, {
            name: '',
            description: '',
            sortOrder: 1,
            status: 1
          })
          
          // 刷新分类列表
          fetchCategories()
        } else {
          ElMessage.error(response?.message || '创建失败')
        }
      } catch (error) {
        console.error('创建分类失败:', error)
        ElMessage.error('创建失败')
      } finally {
        categoryCreating.value = false
      }
    }

    // 删除分类
    const handleDeleteCategory = async (categoryId) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除这个分类吗？',
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await newsCategoryApi.deleteCategory(categoryId)
        console.log('删除分类API响应:', response)
        
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
          ElMessage.success('分类删除成功')
          fetchCategories()
        } else {
          ElMessage.error(response?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除分类失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    onMounted(() => {
      fetchCategories()
    })

    return {
      formRef,
      categoryFormRef,
      coverUploadRef,
      contentImageUploadRef,
      saving,
      publishing,
      categoryCreating,
      categoryDialogVisible,
      categories,
      form,
      categoryForm,
      rules,
      categoryRules,
      renderedContent,
      insertTemplate,
      handleCoverUploadSuccess,
      handleContentImageUploadSuccess,
      handlePreviewCover,
      handleRemoveCover,
      handleSaveDraft,
      handlePublish,
      handleCreateCategory,
      handleDeleteCategory
    }
  }
}
</script>

<style lang="scss" scoped>
.news-create {
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

  .category-list {
    .category-tag {
      margin: 4px 8px 4px 0;
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