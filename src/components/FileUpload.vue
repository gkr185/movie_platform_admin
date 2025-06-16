<template>
  <div class="file-upload-component">
    <el-upload
      ref="uploadRef"
      :action="uploadAction"
      :headers="uploadHeaders"
      :data="uploadData"
      :multiple="multiple"
      :accept="accept"
      :show-file-list="showFileList"
      :auto-upload="autoUpload"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-progress="handleUploadProgress"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :file-list="fileList"
      :disabled="disabled"
      :limit="limit"
      :on-exceed="handleExceed"
      class="upload-component"
    >
      <template #trigger>
        <slot name="trigger">
          <el-button type="primary" :loading="uploading">
            <el-icon><Upload /></el-icon>
            {{ uploadText }}
          </el-button>
        </slot>
      </template>
      
      <template #tip>
        <div class="el-upload__tip">
          <slot name="tip">
            <div v-if="tips.length > 0">
              <div v-for="tip in tips" :key="tip" class="tip-item">{{ tip }}</div>
            </div>
          </slot>
        </div>
      </template>
    </el-upload>

    <!-- 文件预览 -->
    <div v-if="previewFiles.length > 0" class="file-preview">
      <div class="preview-title">文件预览</div>
      <div class="preview-list">
        <div
          v-for="(file, index) in previewFiles"
          :key="index"
          class="preview-item"
        >
          <!-- 图片预览 -->
          <div v-if="isImageFile(file)" class="image-preview">
            <el-image
              :src="file.url || file.response?.fileUrl"
              :preview-src-list="[file.url || file.response?.fileUrl]"
              fit="cover"
              style="width: 100px; height: 100px"
              preview-teleported
            />
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="isVideoFile(file)" class="video-preview">
            <video
              v-if="file.url || file.response?.fileUrl"
              :src="file.url || file.response?.fileUrl"
              controls
              style="width: 200px; height: 120px"
            />
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          
          <!-- 其他文件 -->
          <div v-else class="file-preview">
            <el-icon class="file-icon"><Document /></el-icon>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <el-button
            v-if="!disabled"
            type="danger"
            size="small"
            circle
            class="remove-btn"
            @click="removeFile(index)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <el-progress
        :percentage="uploadProgress"
        :status="uploadStatus"
        :stroke-width="6"
      />
      <div class="progress-text">{{ progressText }}</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Close, Document } from '@element-plus/icons-vue'
import { fileUploadUtils } from '@/api/fileUpload'

export default {
  name: 'FileUpload',
  components: {
    Upload,
    Close,
    Document
  },
  props: {
    // 文件分类
    category: {
      type: String,
      required: true,
      validator: (value) => ['avatar', 'poster', 'video', 'banner', 'news', 'ad'].includes(value)
    },
    // 关联的业务ID
    relatedId: {
      type: [Number, String],
      default: null
    },
    // URL字段类型
    urlType: {
      type: String,
      default: null
    },
    // 是否自动更新数据库
    autoUpdateDb: {
      type: Boolean,
      default: false
    },
    // 是否支持多文件上传
    multiple: {
      type: Boolean,
      default: false
    },
    // 文件数量限制
    limit: {
      type: Number,
      default: 1
    },
    // 是否自动上传
    autoUpload: {
      type: Boolean,
      default: true
    },
    // 是否显示文件列表
    showFileList: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 上传按钮文字
    uploadText: {
      type: String,
      default: '选择文件'
    },
    // 文件类型限制
    fileTypes: {
      type: Array,
      default: () => []
    },
    // 文件大小限制（MB）
    maxSize: {
      type: Number,
      default: 100
    }
  },
  emits: ['upload-success', 'upload-error', 'file-change', 'file-remove'],
  setup(props, { emit }) {
    const uploadRef = ref()
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const uploadStatus = ref('')
    const fileList = ref([])
    const previewFiles = ref([])

    // 计算属性
    const uploadAction = computed(() => {
      return props.autoUpdateDb 
        ? '/api/files/upload-and-update'
        : '/api/files/upload'
    })

    const uploadHeaders = computed(() => ({
      'Authorization': localStorage.getItem('token') || ''
    }))

    const uploadData = computed(() => {
      const data = {
        category: props.category
      }
      if (props.relatedId) {
        data.relatedId = props.relatedId
      }
      if (props.urlType && props.autoUpdateDb) {
        data.urlType = props.urlType
      }
      return data
    })

    const accept = computed(() => {
      if (props.fileTypes.length > 0) {
        return props.fileTypes.map(type => `.${type}`).join(',')
      }
      
      // 根据分类自动设置接受的文件类型
      switch (props.category) {
        case 'avatar':
        case 'poster':
        case 'banner':
        case 'news':
        case 'ad':
          return '.jpg,.jpeg,.png,.gif,.bmp,.webp'
        case 'video':
          return '.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm'
        default:
          return ''
      }
    })

    const tips = computed(() => {
      const tipList = []
      
      // 文件类型提示
      if (props.fileTypes.length > 0) {
        // 如果指定了文件类型，使用指定的类型
        tipList.push(`支持格式：${props.fileTypes.map(type => type.toUpperCase()).join(', ')}`)
      } else if (props.category === 'video') {
        tipList.push('支持格式：MP4, AVI, MOV, WMV, FLV, MKV, WEBM')
      } else {
        tipList.push('支持格式：JPG, JPEG, PNG, GIF, BMP, WEBP')
      }
      
      // 文件大小提示
      tipList.push(`文件大小不超过 ${props.maxSize}MB`)
      
      // 数量限制提示
      if (props.multiple && props.limit > 1) {
        tipList.push(`最多可选择 ${props.limit} 个文件`)
      }
      
      return tipList
    })

    const progressText = computed(() => {
      if (uploadProgress.value === 100) {
        return '上传完成'
      }
      return `上传中... ${uploadProgress.value}%`
    })

    // 方法
    const handleBeforeUpload = (file) => {
      // 验证文件类型
      const allowedTypes = props.fileTypes.length > 0 
        ? props.fileTypes 
        : (props.category === 'video' 
          ? fileUploadUtils.fileTypes.video 
          : fileUploadUtils.fileTypes.image)
      
      if (!fileUploadUtils.validateFileType(file, allowedTypes)) {
        ElMessage.error(`不支持的文件格式：${file.name}`)
        return false
      }

      // 验证文件大小
      const maxBytes = props.maxSize * 1024 * 1024
      if (!fileUploadUtils.validateFileSize(file, maxBytes)) {
        ElMessage.error(`文件大小超过限制：${fileUploadUtils.formatFileSize(maxBytes)}`)
        return false
      }

      uploading.value = true
      uploadProgress.value = 0
      uploadStatus.value = ''
      
      return true
    }

    const handleUploadSuccess = (response, file) => {
      uploading.value = false
      uploadProgress.value = 100
      uploadStatus.value = 'success'
      
      if (response.success) {
        ElMessage.success(response.message || '上传成功')
        emit('upload-success', response, file)
      } else {
        ElMessage.error(response.message || '上传失败')
        emit('upload-error', response, file)
      }
    }

    const handleUploadError = (error, file) => {
      uploading.value = false
      uploadStatus.value = 'exception'
      ElMessage.error('上传失败：' + (error.message || '网络错误'))
      emit('upload-error', error, file)
    }

    const handleUploadProgress = (event) => {
      uploadProgress.value = Math.round(event.percent)
    }

    const handleFileChange = (file, fileList) => {
      previewFiles.value = fileList
      emit('file-change', file, fileList)
    }

    const handleFileRemove = (file, fileList) => {
      previewFiles.value = fileList
      emit('file-remove', file, fileList)
    }

    const handleExceed = (files, fileList) => {
      ElMessage.warning(`最多只能选择 ${props.limit} 个文件`)
    }

    const removeFile = (index) => {
      previewFiles.value.splice(index, 1)
      emit('file-remove', null, previewFiles.value)
    }

    const isImageFile = (file) => {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      const extension = file.name.split('.').pop().toLowerCase()
      return imageTypes.includes(extension)
    }

    const isVideoFile = (file) => {
      const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
      const extension = file.name.split('.').pop().toLowerCase()
      return videoTypes.includes(extension)
    }

    const formatFileSize = (bytes) => {
      return fileUploadUtils.formatFileSize(bytes)
    }

    // 清空文件列表
    const clearFiles = () => {
      uploadRef.value?.clearFiles()
      previewFiles.value = []
    }

    // 手动上传
    const submit = () => {
      uploadRef.value?.submit()
    }

    // 暴露方法给父组件
    return {
      uploadRef,
      uploading,
      uploadProgress,
      uploadStatus,
      fileList,
      previewFiles,
      uploadAction,
      uploadHeaders,
      uploadData,
      accept,
      tips,
      progressText,
      handleBeforeUpload,
      handleUploadSuccess,
      handleUploadError,
      handleUploadProgress,
      handleFileChange,
      handleFileRemove,
      handleExceed,
      removeFile,
      isImageFile,
      isVideoFile,
      formatFileSize,
      clearFiles,
      submit
    }
  }
}
</script>

<style lang="scss" scoped>
.file-upload-component {
  .upload-component {
    width: 100%;
  }

  .tip-item {
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
  }

  .file-preview {
    margin-top: 20px;
    
    .preview-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 10px;
      color: #303133;
    }
    
    .preview-list {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .preview-item {
      position: relative;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 10px;
      background: #fafafa;
      
      .file-info {
        margin-top: 8px;
        text-align: center;
        
        .file-name {
          font-size: 12px;
          color: #303133;
          word-break: break-all;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .file-size {
          font-size: 11px;
          color: #909399;
          margin-top: 2px;
        }
      }
      
      .file-icon {
        font-size: 40px;
        color: #909399;
        display: block;
        text-align: center;
      }
      
      .remove-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        min-height: 20px;
        padding: 0;
      }
    }
    
    .image-preview,
    .video-preview {
      text-align: center;
    }
  }

  .upload-progress {
    margin-top: 15px;
    
    .progress-text {
      text-align: center;
      margin-top: 8px;
      font-size: 12px;
      color: #606266;
    }
  }
}
</style> 