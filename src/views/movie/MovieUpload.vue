<template>
  <div class="movie-upload">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上传电影</span>
          <el-button @click="handleReset">重置表单</el-button>
        </div>
      </template>
      
      <el-form
        ref="movieFormRef"
        :model="movieForm"
        :rules="movieRules"
        label-width="120px"
        class="movie-form"
      >
        <!-- 基本信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <span class="section-title">基本信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电影标题" prop="title">
                <el-input v-model="movieForm.title" placeholder="请输入电影标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原始标题" prop="originalTitle">
                <el-input v-model="movieForm.originalTitle" placeholder="请输入原始标题" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="导演" prop="director">
                <el-input v-model="movieForm.director" placeholder="请输入导演姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编剧" prop="writers">
                <el-input v-model="movieForm.writers" placeholder="请输入编剧，多个用逗号分隔" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="主演" prop="actors">
            <el-input v-model="movieForm.actors" placeholder="请输入主演，多个用逗号分隔" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="类型" prop="genres">
                <el-input v-model="movieForm.genres" placeholder="如：科幻,动作,冒险" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="制片国家" prop="country">
                <el-input v-model="movieForm.country" placeholder="请输入制片国家" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="语言" prop="language">
                <el-input v-model="movieForm.language" placeholder="请输入语言" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="上映日期" prop="releaseDate">
                <el-date-picker
                  v-model="movieForm.releaseDate"
                  type="date"
                  placeholder="选择上映日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="时长(分钟)" prop="runtime">
                <el-input-number
                  v-model="movieForm.runtime"
                  :min="1"
                  :max="999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="IMDb ID" prop="imdbId">
            <el-input v-model="movieForm.imdbId" placeholder="如：tt1630029" style="width: 300px" />
          </el-form-item>

          <el-form-item label="剧情简介" prop="description">
            <el-input
              v-model="movieForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入剧情简介"
            />
          </el-form-item>
        </el-card>

        <!-- 文件上传 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <span class="section-title">文件上传</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电影海报" prop="posterUrl">
                <div class="upload-section">
                  <FileUpload
                    ref="posterUploadRef"
                    category="poster"
                    :related-id="movieForm.id"
                    url-type="poster"
                    :auto-update-db="!!movieForm.id"
                    upload-text="上传海报"
                    :max-size="10"
                    @upload-success="handlePosterUploadSuccess"
                  />
                  <el-input
                    v-model="movieForm.posterUrl"
                    placeholder="或直接输入海报链接"
                    style="margin-top: 10px"
                  />
                  <div v-if="movieForm.posterUrl" class="preview-container">
                    <el-image
                      :src="movieForm.posterUrl"
                      :preview-src-list="[movieForm.posterUrl]"
                      fit="cover"
                      style="width: 120px; height: 180px; margin-top: 10px"
                      preview-teleported
                    />
                  </div>
                </div>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="预告片" prop="trailerUrl">
                <div class="upload-section">
                  <FileUpload
                    ref="trailerUploadRef"
                    category="video"
                    :related-id="movieForm.id"
                    url-type="trailer"
                    :auto-update-db="!!movieForm.id"
                    upload-text="上传预告片"
                    :max-size="500"
                    @upload-success="handleTrailerUploadSuccess"
                  />
                  <el-input
                    v-model="movieForm.trailerUrl"
                    placeholder="或直接输入预告片链接"
                    style="margin-top: 10px"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="电影视频" prop="playUrl">
            <div class="upload-section">
              <FileUpload
                ref="videoUploadRef"
                category="video"
                :related-id="movieForm.id"
                url-type="play"
                :auto-update-db="!!movieForm.id"
                upload-text="上传电影视频"
                :max-size="1000"
                @upload-success="handleVideoUploadSuccess"
              />
              <el-input
                v-model="movieForm.playUrl"
                placeholder="或直接输入视频播放链接"
                style="margin-top: 10px"
              />
            </div>
          </el-form-item>
        </el-card>

        <!-- 属性设置 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <span class="section-title">属性设置</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="推荐" prop="isRecommended">
                <el-switch
                  v-model="movieForm.isRecommended"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="推荐"
                  inactive-text="不推荐"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="热门" prop="isHot">
                <el-switch
                  v-model="movieForm.isHot"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="热门"
                  inactive-text="普通"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="VIP专享" prop="isVip">
                <el-switch
                  v-model="movieForm.isVip"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="VIP"
                  inactive-text="免费"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="movieForm.status">
              <el-radio :label="1">上线</el-radio>
              <el-radio :label="0">下线</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>

        <!-- 分类管理 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <span class="section-title">分类标签</span>
          </template>
          
          <div class="category-section">
            <div class="selected-categories">
              <el-tag
                v-for="category in selectedCategories"
                :key="category.id"
                closable
                @close="removeCategory(category.id)"
                class="category-tag"
              >
                {{ category.name }}
              </el-tag>
            </div>
            <el-button type="primary" @click="showCategoryDialog = true">
              <el-icon><Plus /></el-icon>
              添加分类
            </el-button>
          </div>
        </el-card>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <el-icon><Upload /></el-icon>
            {{ movieForm.id ? '更新电影' : '创建电影' }}
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 分类选择对话框 -->
    <el-dialog v-model="showCategoryDialog" title="选择分类" width="600px">
      <div class="category-selector">
        <el-checkbox-group v-model="tempSelectedCategories">
          <el-row :gutter="20">
            <el-col :span="8" v-for="category in allCategories" :key="category.id">
              <el-checkbox :label="category.id">{{ category.name }}</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCategoryConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import FileUpload from '@/components/FileUpload.vue'
import { createMovie, updateMovie } from '@/api/movie'
import { getAllCategories } from '@/api/category'

export default {
  name: 'MovieUpload',
  components: {
    FileUpload,
    Plus,
    Upload
  },
  setup() {
    const movieFormRef = ref()
    const posterUploadRef = ref()
    const trailerUploadRef = ref()
    const videoUploadRef = ref()
    
    const submitting = ref(false)
    const showCategoryDialog = ref(false)
    const allCategories = ref([])
    const selectedCategories = ref([])
    const tempSelectedCategories = ref([])

    // 电影表单数据
    const movieForm = reactive({
      id: null,
      title: '',
      originalTitle: '',
      director: '',
      writers: '',
      actors: '',
      genres: '',
      country: '',
      language: '',
      releaseDate: '',
      runtime: null,
      imdbId: '',
      description: '',
      posterUrl: '',
      trailerUrl: '',
      playUrl: '',
      isRecommended: 0,
      isHot: 0,
      isVip: 0,
      status: 1
    })

    // 表单验证规则
    const movieRules = {
      title: [
        { required: true, message: '请输入电影标题', trigger: 'blur' }
      ],
      director: [
        { required: true, message: '请输入导演姓名', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入剧情简介', trigger: 'blur' }
      ]
    }

    // 加载分类数据
    const loadCategories = async () => {
      try {
        const response = await getAllCategories()
        if (response.code === 200) {
          allCategories.value = response.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    // 文件上传成功处理
    const handlePosterUploadSuccess = (response) => {
      if (response.success) {
        movieForm.posterUrl = response.fileUrl
        ElMessage.success('海报上传成功')
      }
    }

    const handleTrailerUploadSuccess = (response) => {
      if (response.success) {
        movieForm.trailerUrl = response.fileUrl
        ElMessage.success('预告片上传成功')
      }
    }

    const handleVideoUploadSuccess = (response) => {
      if (response.success) {
        movieForm.playUrl = response.fileUrl
        ElMessage.success('电影视频上传成功')
      }
    }

    // 分类管理
    const removeCategory = (categoryId) => {
      selectedCategories.value = selectedCategories.value.filter(cat => cat.id !== categoryId)
    }

    const handleCategoryConfirm = () => {
      selectedCategories.value = allCategories.value.filter(cat => 
        tempSelectedCategories.value.includes(cat.id)
      )
      showCategoryDialog.value = false
    }

    // 表单提交
    const handleSubmit = async () => {
      try {
        const valid = await movieFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        // 准备提交数据
        const submitData = {
          ...movieForm,
          categoryIds: selectedCategories.value.map(cat => cat.id)
        }

        let response
        if (movieForm.id) {
          response = await updateMovie(movieForm.id, submitData)
        } else {
          response = await createMovie(submitData)
        }

        // 处理不同的响应格式
        if (response.code === 200 || response.code === 201 || response.id) {
          ElMessage.success(movieForm.id ? '电影更新成功' : '电影创建成功')
          
          // 如果是新创建的电影，设置ID以便后续文件上传
          if (!movieForm.id) {
            // 处理不同的响应格式
            const movieId = response.data?.id || response.id
            if (movieId) {
              movieForm.id = movieId
              ElMessage.info(`电影ID: ${movieId}，现在可以上传相关文件`)
            }
          }
          
          // 不自动重置表单，让用户可以继续上传文件
          // handleReset()
        } else {
          ElMessage.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败：' + (error.message || '网络错误'))
      } finally {
        submitting.value = false
      }
    }

    // 重置表单
    const handleReset = () => {
      ElMessageBox.confirm('确定要重置表单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        movieFormRef.value?.resetFields()
        Object.assign(movieForm, {
          id: null,
          title: '',
          originalTitle: '',
          director: '',
          writers: '',
          actors: '',
          genres: '',
          country: '',
          language: '',
          releaseDate: '',
          runtime: null,
          imdbId: '',
          description: '',
          posterUrl: '',
          trailerUrl: '',
          playUrl: '',
          isRecommended: 0,
          isHot: 0,
          isVip: 0,
          status: 1
        })
        selectedCategories.value = []
        tempSelectedCategories.value = []
        
        // 清空文件上传组件
        posterUploadRef.value?.clearFiles()
        trailerUploadRef.value?.clearFiles()
        videoUploadRef.value?.clearFiles()
        
        ElMessage.success('表单已重置')
      }).catch(() => {})
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      movieFormRef,
      posterUploadRef,
      trailerUploadRef,
      videoUploadRef,
      movieForm,
      movieRules,
      submitting,
      showCategoryDialog,
      allCategories,
      selectedCategories,
      tempSelectedCategories,
      handlePosterUploadSuccess,
      handleTrailerUploadSuccess,
      handleVideoUploadSuccess,
      removeCategory,
      handleCategoryConfirm,
      handleSubmit,
      handleReset
    }
  }
}
</script>

<style lang="scss" scoped>
.movie-upload {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .movie-form {
    padding: 20px;
  }
  
  .form-section {
    margin-bottom: 20px;
    
    .section-title {
      font-weight: 600;
      color: #303133;
    }
  }
  
  .upload-section {
    .preview-container {
      margin-top: 10px;
    }
  }
  
  .category-section {
    .selected-categories {
      margin-bottom: 15px;
      min-height: 32px;
      
      .category-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
  }
  
  .category-selector {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .form-actions {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #ebeef5;
    margin-top: 20px;
    
    .el-button {
      margin: 0 10px;
      min-width: 120px;
    }
  }
}
</style> 