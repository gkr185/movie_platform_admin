import request from './request'

// 文件上传服务基础URL - 使用相对路径通过Vue代理
const FILE_UPLOAD_BASE_URL = '/api/files'

/**
 * 上传单个文件
 * @param {File} file - 文件对象
 * @param {string} category - 文件分类 (avatar/poster/video/banner/news/ad)
 * @param {number} relatedId - 关联的业务ID
 * @returns {Promise}
 */
export function uploadFile(file, category, relatedId = null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  if (relatedId) {
    formData.append('relatedId', relatedId)
  }

  return request({
    url: `${FILE_UPLOAD_BASE_URL}/upload`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时，适合大文件上传
  })
}

/**
 * 上传文件并更新数据库URL
 * @param {File} file - 文件对象
 * @param {string} category - 文件分类
 * @param {number} relatedId - 关联的业务ID
 * @param {string} urlType - URL字段类型 (avatar/poster/play/trailer/cover/image/video)
 * @returns {Promise}
 */
export function uploadFileAndUpdate(file, category, relatedId, urlType = null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  formData.append('relatedId', relatedId)
  if (urlType) {
    formData.append('urlType', urlType)
  }

  return request({
    url: `${FILE_UPLOAD_BASE_URL}/upload-and-update`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时
  })
}

/**
 * 批量上传文件
 * @param {FileList} files - 文件列表
 * @param {string} category - 文件分类
 * @param {number} relatedId - 关联的业务ID
 * @returns {Promise}
 */
export function uploadFiles(files, category, relatedId = null) {
  const formData = new FormData()
  Array.from(files).forEach(file => {
    formData.append('files', file)
  })
  formData.append('category', category)
  if (relatedId) {
    formData.append('relatedId', relatedId)
  }

  return request({
    url: `${FILE_UPLOAD_BASE_URL}/upload/batch`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000 // 10分钟超时，适合批量上传
  })
}

/**
 * 根据分类获取文件列表
 * @param {string} category - 文件分类
 * @returns {Promise}
 */
export function getFilesByCategory(category) {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/category/${category}`,
    method: 'get'
  })
}

/**
 * 根据关联ID获取文件列表
 * @param {number} relatedId - 关联的业务ID
 * @returns {Promise}
 */
export function getFilesByRelatedId(relatedId) {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/related/${relatedId}`,
    method: 'get'
  })
}

/**
 * 根据分类和关联ID获取文件列表
 * @param {string} category - 文件分类
 * @param {number} relatedId - 关联的业务ID
 * @returns {Promise}
 */
export function getFilesByCategoryAndRelatedId(category, relatedId) {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/category/${category}/related/${relatedId}`,
    method: 'get'
  })
}

/**
 * 删除文件
 * @param {number} fileId - 文件ID
 * @returns {Promise}
 */
export function deleteFile(fileId) {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/${fileId}`,
    method: 'delete'
  })
}

/**
 * 根据文件名获取文件信息
 * @param {string} fileName - 文件名
 * @returns {Promise}
 */
export function getFileByFileName(fileName) {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/filename/${fileName}`,
    method: 'get'
  })
}

/**
 * 获取所有文件列表
 * @returns {Promise}
 */
export function getAllFiles() {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/all`,
    method: 'get'
  })
}

/**
 * 健康检查
 * @returns {Promise}
 */
export function checkFileServiceHealth() {
  return request({
    url: `${FILE_UPLOAD_BASE_URL}/health`,
    method: 'get'
  })
}

// 文件上传工具函数
export const fileUploadUtils = {
  /**
   * 验证文件类型
   * @param {File} file - 文件对象
   * @param {Array} allowedTypes - 允许的文件类型
   * @returns {boolean}
   */
  validateFileType(file, allowedTypes) {
    const fileExtension = file.name.split('.').pop().toLowerCase()
    return allowedTypes.includes(fileExtension)
  },

  /**
   * 验证文件大小
   * @param {File} file - 文件对象
   * @param {number} maxSize - 最大文件大小（字节）
   * @returns {boolean}
   */
  validateFileSize(file, maxSize) {
    return file.size <= maxSize
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 获取文件预览URL
   * @param {File} file - 文件对象
   * @returns {string}
   */
  getFilePreviewUrl(file) {
    return URL.createObjectURL(file)
  },

  // 支持的文件类型配置
  fileTypes: {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
  },

  // 文件大小限制（字节）
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 1000 * 1024 * 1024 // 1000MB
  }
} 