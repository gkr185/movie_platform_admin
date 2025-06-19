<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人信息</h2>
      <p>管理您的个人账户信息</p>
    </div>

    <div class="profile-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <el-avatar
            :size="120"
            :src="userInfo.avatar || defaultAvatar"
            :icon="UserFilled"
            class="user-avatar"
          />
          <div class="avatar-upload-overlay" @click="showAvatarUpload = true">
            <el-icon><Camera /></el-icon>
            <span>更换头像</span>
          </div>
        </div>
        <div class="user-basic-info">
          <h3>{{ userInfo.username }}</h3>
          <p class="user-email">{{ userInfo.email || '未设置邮箱' }}</p>
          <el-tag
            :type="userInfo.isVip ? 'warning' : 'info'"
            size="small"
          >
            {{ userInfo.isVip ? 'VIP用户' : '普通用户' }}
          </el-tag>
        </div>
      </div>

      <!-- 信息卡片 -->
      <div class="info-cards">
        <!-- 基本信息卡片 -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button
                type="primary"
                link
                @click="editMode = !editMode"
              >
                {{ editMode ? '取消编辑' : '编辑信息' }}
              </el-button>
            </div>
          </template>

          <el-form
            ref="userFormRef"
            :model="editForm"
            :rules="userRules"
            label-width="80px"
            :disabled="!editMode"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input
                    v-model="editForm.username"
                    placeholder="请输入用户名"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="editForm.email"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input
                    v-model="editForm.phone"
                    placeholder="请输入手机号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-tag
                    :type="userInfo.userStatus === 1 ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ userInfo.userStatus === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item v-if="editMode">
              <el-button
                type="primary"
                :loading="updateLoading"
                @click="updateUserInfo"
              >
                保存修改
              </el-button>
              <el-button @click="cancelEdit">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 密码修改卡片 -->
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
              <el-button
                type="primary"
                link
                @click="showPasswordDialog = true"
              >
                修改密码
              </el-button>
            </div>
          </template>

          <div class="security-info">
            <div class="security-item">
              <el-icon><Lock /></el-icon>
              <div class="security-text">
                <div class="security-title">登录密码</div>
                <div class="security-desc">定期更换密码有助于保护账户安全</div>
              </div>
            </div>
            <div class="security-item">
              <el-icon><Calendar /></el-icon>
              <div class="security-text">
                <div class="security-title">注册时间</div>
                <div class="security-desc">{{ formatDate(userInfo.registerTime) }}</div>
              </div>
            </div>
            <div class="security-item">
              <el-icon><Clock /></el-icon>
              <div class="security-text">
                <div class="security-title">最后登录</div>
                <div class="security-desc">{{ formatDate(userInfo.lastLoginTime) }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- VIP信息卡片 -->
        <el-card v-if="userInfo.isVip" class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>VIP信息</span>
              <el-tag type="warning" size="small">VIP用户</el-tag>
            </div>
          </template>

          <div class="vip-info">
            <div class="vip-item">
              <el-icon><Star /></el-icon>
              <div class="vip-text">
                <div class="vip-title">VIP状态</div>
                <div class="vip-desc">享受VIP专属权益</div>
              </div>
            </div>
            <div class="vip-item">
              <el-icon><Calendar /></el-icon>
              <div class="vip-text">
                <div class="vip-title">到期时间</div>
                <div class="vip-desc">{{ formatDate(userInfo.vipExpireTime) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="showAvatarUpload"
      title="更换头像"
      width="400px"
      @close="resetAvatarUpload"
    >
      <div class="avatar-upload-dialog">
        <div class="current-avatar">
          <el-avatar
            :size="80"
            :src="userInfo.avatar || defaultAvatar"
            :icon="UserFilled"
          />
          <p>当前头像</p>
        </div>
        
        <FileUpload
          category="avatar"
          :related-id="userInfo.id"
          :max-size="5"
          :file-types="['jpg', 'jpeg', 'png']"
          upload-text="选择头像"
          @upload-success="handleAvatarUploadSuccess"
          @upload-error="handleAvatarUploadError"
        />
        
        <div class="upload-tips">
          <p>• 支持JPG、PNG格式</p>
          <p>• 文件大小不超过5MB</p>
          <p>• 建议使用正方形图片</p>
        </div>
      </div>
    </el-dialog>

    <!-- 密码修改对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="450px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="passwordLoading"
            @click="updatePassword"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Camera,
  Lock,
  Calendar,
  Clock,
  Star
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getUserInfo, updateUser, updatePassword as updatePasswordApi } from '@/api/user'
import FileUpload from '@/components/FileUpload.vue'

export default {
  name: 'Profile',
  components: {
    FileUpload
  },
  setup() {
    const authStore = useAuthStore()
    
    // 响应式数据
    const userFormRef = ref()
    const passwordFormRef = ref()
    const editMode = ref(false)
    const showAvatarUpload = ref(false)
    const showPasswordDialog = ref(false)
    const updateLoading = ref(false)
    const passwordLoading = ref(false)
    
    // 用户信息
    const userInfo = ref({})
    const editForm = reactive({
      username: '',
      email: '',
      phone: ''
    })
    
    // 密码修改表单
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 默认头像
    const defaultAvatar = computed(() => {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.value.username || 'default'}`
    })
    
    // 表单验证规则
    const userRules = {
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
      ]
    }
    
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo(authStore.userId)
        userInfo.value = response.data
        
        // 填充编辑表单
        editForm.username = userInfo.value.username
        editForm.email = userInfo.value.email || ''
        editForm.phone = userInfo.value.phone || ''
        
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      }
    }
    
    // 更新用户信息
    const updateUserInfo = async () => {
      if (!userFormRef.value) return
      
      const isValid = await userFormRef.value.validate()
      if (!isValid) return
      
      updateLoading.value = true
      
      try {
        await updateUser(authStore.userId, {
          email: editForm.email,
          phone: editForm.phone
        })
        
        ElMessage.success('信息更新成功')
        editMode.value = false
        await fetchUserInfo()
        await authStore.updateUserInfo()
        
      } catch (error) {
        console.error('更新用户信息失败:', error)
        ElMessage.error(error.response?.data?.message || '更新失败')
      } finally {
        updateLoading.value = false
      }
    }
    
    // 取消编辑
    const cancelEdit = () => {
      editMode.value = false
      editForm.username = userInfo.value.username
      editForm.email = userInfo.value.email || ''
      editForm.phone = userInfo.value.phone || ''
      userFormRef.value?.clearValidate()
    }
    
    // 修改密码
    const updatePassword = async () => {
      if (!passwordFormRef.value) return
      
      const isValid = await passwordFormRef.value.validate()
      if (!isValid) return
      
      passwordLoading.value = true
      
      try {
        await updatePasswordApi(
          authStore.userId,
          passwordForm.oldPassword,
          passwordForm.newPassword
        )
        
        ElMessage.success('密码修改成功')
        showPasswordDialog.value = false
        resetPasswordForm()
        
        // 提醒用户重新登录
        ElMessageBox.confirm(
          '密码修改成功，为了安全起见，请重新登录',
          '提示',
          {
            confirmButtonText: '立即登录',
            cancelButtonText: '稍后登录',
            type: 'warning'
          }
        ).then(() => {
          authStore.logout()
        }).catch(() => {
          // 用户选择稍后登录
        })
        
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error(error.response?.data?.message || '修改密码失败')
      } finally {
        passwordLoading.value = false
      }
    }
    
    // 重置密码表单
    const resetPasswordForm = () => {
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordFormRef.value?.clearValidate()
    }
    
    // 重置头像上传
    const resetAvatarUpload = () => {
      // 头像上传组件会自行重置
    }
    
    // 头像上传成功
    const handleAvatarUploadSuccess = async (response) => {
      try {
        // 更新用户头像
        await updateUser(authStore.userId, {
          avatar: response.fileUrl
        })
        
        ElMessage.success('头像更新成功')
        showAvatarUpload.value = false
        await fetchUserInfo()
        await authStore.updateUserInfo()
        
      } catch (error) {
        console.error('更新头像失败:', error)
        ElMessage.error('更新头像失败')
      }
    }
    
    // 头像上传失败
    const handleAvatarUploadError = (error) => {
      console.error('头像上传失败:', error)
      ElMessage.error('头像上传失败')
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '暂无'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return '暂无'
      }
    }
    
    // 初始化
    onMounted(() => {
      if (!authStore.userId) {
        ElMessage.error('用户信息获取失败，请重新登录')
        authStore.logout()
        return
      }
      
      fetchUserInfo()
    })
    
    return {
      userFormRef,
      passwordFormRef,
      editMode,
      showAvatarUpload,
      showPasswordDialog,
      updateLoading,
      passwordLoading,
      userInfo,
      editForm,
      passwordForm,
      defaultAvatar,
      userRules,
      passwordRules,
      updateUserInfo,
      cancelEdit,
      updatePassword,
      resetPasswordForm,
      resetAvatarUpload,
      handleAvatarUploadSuccess,
      handleAvatarUploadError,
      formatDate,
      // Icons
      UserFilled,
      Camera,
      Lock,
      Calendar,
      Clock,
      Star
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 24px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  position: relative;
  
  .user-avatar {
    border: 4px solid #f3f4f6;
  }
  
  .avatar-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
    color: white;
    font-size: 12px;
    
    &:hover {
      opacity: 1;
    }
    
    .el-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
  }
}

.user-basic-info {
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }
  
  .user-email {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
  }
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.info-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #1f2937;
  }
}

.security-info,
.vip-info {
  .security-item,
  .vip-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .el-icon {
      font-size: 20px;
      color: #6b7280;
    }
    
    .security-text,
    .vip-text {
      flex: 1;
      
      .security-title,
      .vip-title {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .security-desc,
      .vip-desc {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }
}

.avatar-upload-dialog {
  text-align: center;
  
  .current-avatar {
    margin-bottom: 24px;
    
    p {
      margin-top: 12px;
      font-size: 14px;
      color: #6b7280;
    }
  }
  
  .upload-tips {
    margin-top: 16px;
    text-align: left;
    
    p {
      font-size: 12px;
      color: #6b7280;
      margin: 4px 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
}
</style>
