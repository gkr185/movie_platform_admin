<template>
  <div class="ad-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑广告' : '创建广告' }}</span>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <!-- 基本信息 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <h4>基本信息</h4>
          </template>

          <el-form-item label="广告标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入广告标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="广告位置" prop="position">
            <el-select
              v-model="form.position"
              placeholder="请选择广告位置"
              style="width: 100%"
            >
              <el-option
                v-for="option in positionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <div class="position-option">
                  <span>{{ option.label }}</span>
                  <span class="position-desc">{{ getPositionDescription(option.value) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="排序权重" prop="sortOrder">
            <el-input-number
              v-model="form.sortOrder"
              :min="0"
              :max="999"
              placeholder="数字越小优先级越高"
              style="width: 200px"
            />
            <span class="form-tip">数字越小优先级越高，0为最高优先级</span>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
            <div class="form-tip">禁用状态的广告不会在前端显示</div>
          </el-form-item>
        </el-card>

        <!-- 媒体内容 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <h4>媒体内容</h4>
          </template>

          <el-form-item label="广告图片" prop="imageUrl" required>
            <div class="upload-section">
              <el-upload
                ref="uploadRef"
                :action="uploadAction"
                :headers="uploadHeaders"
                :show-file-list="false"
                :before-upload="beforeImageUpload"
                :on-success="handleImageSuccess"
                :on-error="handleImageError"
                accept="image/*"
                drag
              >
                <div v-if="!form.imageUrl" class="upload-dragger">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <div class="upload-text">点击或拖拽上传图片</div>
                  <div class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</div>
                </div>
                <div v-else class="image-preview">
                  <el-image
                    :src="form.imageUrl"
                    fit="cover"
                    style="width: 100%; height: 200px;"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <p>图片加载失败</p>
                      </div>
                    </template>
                  </el-image>
                  <div class="image-actions">
                    <el-button size="small" @click.stop="handlePreviewImage">预览</el-button>
                    <el-button size="small" type="danger" @click.stop="handleRemoveImage">删除</el-button>
                  </div>
                </div>
              </el-upload>
              
              <div class="manual-input" style="margin-top: 10px;">
                <el-input
                  v-model="form.imageUrl"
                  placeholder="或直接输入图片URL"
                >
                  <template #prepend>图片URL</template>
                </el-input>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="视频链接" prop="videoUrl">
            <el-input
              v-model="form.videoUrl"
              placeholder="请输入视频链接（选填）"
            >
              <template #prepend>视频URL</template>
            </el-input>
            <div class="form-tip">支持 MP4、WebM 等格式的视频链接</div>
          </el-form-item>

          <el-form-item label="跳转链接" prop="linkUrl">
            <el-input
              v-model="form.linkUrl"
              placeholder="请输入跳转链接（选填）"
            >
              <template #prepend>跳转URL</template>
            </el-input>
            <div class="form-tip">用户点击广告时跳转的目标链接</div>
          </el-form-item>
        </el-card>

        <!-- 投放设置 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <h4>投放设置</h4>
          </template>

          <el-form-item label="投放时间">
            <el-checkbox v-model="enableTimeRange" @change="handleTimeRangeChange">
              设置投放时间范围
            </el-checkbox>
          </el-form-item>

          <div v-if="enableTimeRange" class="time-range-section">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </div>

          <div v-else class="form-tip">
            不设置时间范围表示永久投放
          </div>
        </el-card>

        <!-- 预览区域 -->
        <el-card class="form-section" shadow="never">
          <template #header>
            <h4>广告预览</h4>
          </template>

          <div class="ad-preview-container">
            <div v-if="form.imageUrl" class="preview-item">
              <h5>图片预览</h5>
              <div class="preview-image">
                <el-image
                  :src="form.imageUrl"
                  fit="contain"
                  style="max-width: 100%; max-height: 300px;"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <p>图片加载失败</p>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>

            <div v-if="form.videoUrl" class="preview-item">
              <h5>视频链接</h5>
              <el-link :href="form.videoUrl" target="_blank" type="primary">
                {{ form.videoUrl }}
              </el-link>
            </div>

            <div v-if="form.linkUrl" class="preview-item">
              <h5>跳转链接</h5>
              <el-link :href="form.linkUrl" target="_blank" type="primary">
                {{ form.linkUrl }}
              </el-link>
            </div>

            <div class="preview-info">
              <el-descriptions :column="2" size="small" border>
                <el-descriptions-item label="广告位置">{{ form.position || '-' }}</el-descriptions-item>
                <el-descriptions-item label="排序权重">{{ form.sortOrder || 0 }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="form.status === 1 ? 'success' : 'danger'" size="small">
                    {{ form.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="广告类型">{{ getAdType() }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新广告' : '创建广告' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="60%">
      <div class="preview-dialog">
        <el-image
          :src="form.imageUrl"
          fit="contain"
          style="width: 100%;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Picture } from '@element-plus/icons-vue'
import { advertisementApi, advertisementHelper, AD_POSITION_OPTIONS } from '@/api/advertisement'

export default {
  name: 'AdCreate',
  components: {
    Upload,
    Picture
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref(null)
    const uploadRef = ref(null)
    const submitting = ref(false)
    const previewVisible = ref(false)
    const enableTimeRange = ref(false)

    // 判断是否为编辑模式
    const isEdit = computed(() => !!route.params.id)
    const adId = computed(() => route.params.id)

    // 表单数据
    const form = reactive({
      title: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      position: '',
      sortOrder: 1,
      startTime: '',
      endTime: '',
      status: 1
    })

    // 广告位置选项
    const positionOptions = AD_POSITION_OPTIONS

    // 上传配置
    const uploadAction = '/images/upload'
    const uploadHeaders = {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }

    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入广告标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      imageUrl: [
        { required: true, message: '请上传广告图片或输入图片URL', trigger: 'blur' }
      ],
      position: [
        { required: true, message: '请选择广告位置', trigger: 'change' }
      ],
      sortOrder: [
        { required: true, message: '请输入排序权重', trigger: 'blur' },
        { type: 'number', min: 0, max: 999, message: '排序权重必须在 0-999 之间', trigger: 'blur' }
      ],
      videoUrl: [
        // 取消URL格式检查
      ],
      linkUrl: [
        // 取消URL格式检查
      ],
      startTime: [
        { 
          validator: (rule, value, callback) => {
            if (enableTimeRange.value && form.endTime && value && new Date(value) >= new Date(form.endTime)) {
              callback(new Error('开始时间必须早于结束时间'))
            } else {
              callback()
            }
          }, 
          trigger: 'change' 
        }
      ],
      endTime: [
        { 
          validator: (rule, value, callback) => {
            if (enableTimeRange.value && form.startTime && value && new Date(value) <= new Date(form.startTime)) {
              callback(new Error('结束时间必须晚于开始时间'))
            } else {
              callback()
            }
          }, 
          trigger: 'change' 
        }
      ]
    }

    // 获取广告位置描述
    const getPositionDescription = (position) => {
      const descriptions = {
        '首页轮播': '首页轮播图位置，高曝光率',
        '侧边栏': '页面侧边栏位置，持续展示',
        '顶部横幅': '页面顶部横幅位置，全站显示',
        '播放前广告': '视频播放前广告，强制观看',
        '播放暂停广告': '视频暂停时广告，用户主动触发'
      }
      return descriptions[position] || ''
    }

    // 获取广告类型
    const getAdType = () => {
      if (form.videoUrl) {
        return '视频广告'
      } else if (form.linkUrl) {
        return '链接广告'
      } else {
        return '图片广告'
      }
    }

    // 时间范围变化处理
    const handleTimeRangeChange = (enabled) => {
      if (!enabled) {
        form.startTime = ''
        form.endTime = ''
      }
    }

    // 图片上传前验证
    const beforeImageUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    }

    // 图片上传成功
    const handleImageSuccess = (response) => {
      if (response.code === 200) {
        form.imageUrl = response.data.url || response.data
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(response.message || '图片上传失败')
      }
    }

    // 图片上传失败
    const handleImageError = (error) => {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }

    // 预览图片
    const handlePreviewImage = () => {
      previewVisible.value = true
    }

    // 删除图片
    const handleRemoveImage = () => {
      form.imageUrl = ''
    }

    // 获取广告详情（编辑模式）
    const fetchAdDetail = async () => {
      try {
        const response = await advertisementApi.getAdvertisementDetail(adId.value)
        if (response.code === 200) {
          const data = response.data
          Object.assign(form, {
            title: data.title,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl || '',
            linkUrl: data.linkUrl || '',
            position: data.position,
            sortOrder: data.sortOrder,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            status: data.status
          })
          
          // 如果有时间设置，启用时间范围
          if (data.startTime || data.endTime) {
            enableTimeRange.value = true
          }
        } else {
          ElMessage.error(response.message || '获取广告详情失败')
          router.push('/ad/list')
        }
      } catch (error) {
        console.error('获取广告详情失败:', error)
        ElMessage.error('获取广告详情失败')
        router.push('/ad/list')
      }
    }

    // 提交表单
    const handleSubmit = async () => {
      try {
        const valid = await formRef.value.validate()
        if (!valid) return

        // 验证广告数据
        const validation = advertisementHelper.validateAdvertisementData(form)
        if (!validation.isValid) {
          ElMessage.error(validation.errors[0])
          return
        }

        submitting.value = true

        const submitData = { ...form }
        
        // 如果没有启用时间范围，清空时间字段
        if (!enableTimeRange.value) {
          submitData.startTime = ''
          submitData.endTime = ''
        }

        let response
        if (isEdit.value) {
          response = await advertisementApi.updateAdvertisement(adId.value, submitData)
        } else {
          response = await advertisementApi.createAdvertisement(submitData)
        }

        if (response.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          router.push('/ad/list')
        } else {
          ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitting.value = false
      }
    }

    // 重置表单
    const handleReset = () => {
      formRef.value.resetFields()
      enableTimeRange.value = false
    }

    // 返回列表
    const handleBack = () => {
      router.push('/ad/list')
    }

    onMounted(() => {
      if (isEdit.value) {
        fetchAdDetail()
      }
    })

    return {
      formRef,
      uploadRef,
      submitting,
      previewVisible,
      enableTimeRange,
      isEdit,
      form,
      rules,
      positionOptions,
      uploadAction,
      uploadHeaders,
      getPositionDescription,
      getAdType,
      handleTimeRangeChange,
      beforeImageUpload,
      handleImageSuccess,
      handleImageError,
      handlePreviewImage,
      handleRemoveImage,
      handleSubmit,
      handleReset,
      handleBack
    }
  }
}
</script>

<style lang="scss" scoped>
.ad-create {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-section {
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      color: #303133;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 10px;
  }

  .position-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .position-desc {
      font-size: 12px;
      color: #909399;
    }
  }

  .upload-section {
    .upload-dragger {
      text-align: center;
      padding: 40px;
      border: 2px dashed #dcdfe6;
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: #409eff;
      }
      
      .upload-icon {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }
      
      .upload-text {
        font-size: 16px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .upload-tip {
        font-size: 12px;
        color: #909399;
      }
    }

    .image-preview {
      position: relative;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      overflow: hidden;
      
      .image-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 8px;
      }
      
      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #c0c4cc;
        
        p {
          margin-top: 10px;
          margin-bottom: 0;
        }
      }
    }

    .manual-input {
      margin-top: 10px;
    }
  }

  .time-range-section {
    margin-left: 20px;
    padding-left: 20px;
    border-left: 2px solid #e4e7ed;
  }

  .ad-preview-container {
    .preview-item {
      margin-bottom: 20px;
      
      h5 {
        margin-bottom: 10px;
        color: #303133;
      }
    }

    .preview-image {
      display: flex;
      justify-content: center;
      padding: 20px;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      background-color: #fafafa;
    }

    .preview-info {
      margin-top: 20px;
    }
  }

  .preview-dialog {
    text-align: center;
  }
}
</style> 