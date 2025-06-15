<template>
  <div class="user-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入用户名、邮箱或手机号搜索"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 用户表格 -->
      <el-table
        :data="userList"
        v-loading="loading"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" :size="40">
              {{ scope.row.username?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="VIP状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isVip ? 'warning' : 'info'">
              {{ scope.row.isVip ? 'VIP' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.userStatus === 1 ? 'success' : 'danger'">
              {{ scope.row.userStatus === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180" sortable="custom" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewDetail(scope.row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button size="small" type="warning" @click="handleChangePassword(scope.row)">
              <el-icon><Edit /></el-icon>
              改密
            </el-button>
            <el-button size="small" type="primary" @click="handleManageRoles(scope.row)">
              <el-icon><User /></el-icon>
              角色
            </el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="用户详情" width="600px">
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">
            {{ selectedUser.registerTime }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">
            {{ selectedUser.lastLoginTime || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="VIP状态">
            <el-tag :type="selectedUser.isVip ? 'warning' : 'info'">
              {{ selectedUser.isVip ? 'VIP' : '普通' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户状态">
            <el-tag :type="selectedUser.userStatus === 1 ? 'success' : 'danger'">
              {{ selectedUser.userStatus === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedUser.isVip" label="VIP到期时间" :span="2">
            {{ selectedUser.vipExpireTime || '永久' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialog.visible" title="修改密码" width="500px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input :value="selectedUser?.username" disabled />
        </el-form-item>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
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
        <el-button @click="passwordDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPassword" :loading="passwordDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 角色管理对话框 -->
    <el-dialog v-model="roleDialog.visible" title="用户角色管理" width="600px">
      <div v-if="selectedUser">
        <p class="mb-4">为用户 <strong>{{ selectedUser.username }}</strong> 分配角色</p>
        
        <div class="role-assignment">
          <h4>当前角色：</h4>
          <div class="current-roles mb-4">
            <el-tag
              v-for="role in userRoles"
              :key="role.id"
              closable
              @close="handleRemoveRole(role.id)"
              class="mr-2 mb-2"
            >
              {{ role.name }}
            </el-tag>
            <el-tag v-if="userRoles.length === 0" type="info">暂无角色</el-tag>
          </div>

          <h4>可分配角色：</h4>
          <el-checkbox-group v-model="selectedRoles" class="role-checkboxes">
            <el-checkbox
              v-for="role in availableRoles"
              :key="role.id"
              :label="role.id"
              :disabled="userRoles.some(ur => ur.id === role.id)"
            >
              {{ role.name }} - {{ role.description }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignRoles" :loading="roleDialog.loading">
          分配角色
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Edit, User } from '@element-plus/icons-vue'
import { getUserList, searchUsers, updatePassword } from '@/api/user'
import { getUserRoles, getAllRoles, assignRolesToUser, removeRolesFromUser } from '@/api/rbac'

// 响应式数据
const loading = ref(false)
const userList = ref([])
const selectedUser = ref(null)
const userRoles = ref([])
const availableRoles = ref([])
const selectedRoles = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 排序信息
const sortInfo = reactive({
  sort: 'createTime',
  direction: 'desc'
})

// 对话框状态
const detailDialog = reactive({
  visible: false
})

const passwordDialog = reactive({
  visible: false,
  loading: false
})

const roleDialog = reactive({
  visible: false,
  loading: false
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref()

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
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

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    let response

    if (searchForm.keyword.trim()) {
      // 搜索用户
      response = await searchUsers({
        keyword: searchForm.keyword.trim(),
        page: pagination.page - 1, // 后端页码从0开始
        size: pagination.size,
        sort: sortInfo.sort,
        direction: sortInfo.direction
      })
    } else {
      // 获取用户列表
      response = await getUserList({
        page: pagination.page - 1,
        size: pagination.size,
        sort: sortInfo.sort,
        direction: sortInfo.direction
      })
    }

    if (response.code === 200) {
      userList.value = response.data.content || []
      pagination.total = response.data.totalElements || 0
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  pagination.page = 1
  fetchUserList()
}

// 排序改变
const handleSortChange = ({ prop, order }) => {
  if (prop) {
    sortInfo.sort = prop
    sortInfo.direction = order === 'ascending' ? 'asc' : 'desc'
    fetchUserList()
  }
}

// 页码改变
const handleCurrentChange = (page) => {
  pagination.page = page
  fetchUserList()
}

// 页面大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  fetchUserList()
}

// 查看用户详情
const handleViewDetail = (user) => {
  selectedUser.value = user
  detailDialog.visible = true
}

// 修改密码
const handleChangePassword = (user) => {
  selectedUser.value = user
  // 重置表单
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialog.visible = true
}

// 提交密码修改
const handleSubmitPassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    passwordDialog.loading = true
    const response = await updatePassword(
      selectedUser.value.id,
      passwordForm.oldPassword,
      passwordForm.newPassword
    )

    if (response.code === 200) {
      ElMessage.success('密码修改成功')
      passwordDialog.visible = false
    } else {
      ElMessage.error(response.message || '密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败')
  } finally {
    passwordDialog.loading = false
  }
}

// 管理用户角色
const handleManageRoles = async (user) => {
  selectedUser.value = user
  selectedRoles.value = []
  
  try {
    // 获取用户当前角色和所有可用角色
    const [userRolesRes, allRolesRes] = await Promise.all([
      getUserRoles(user.id),
      getAllRoles()
    ])

    if (userRolesRes.code === 200) {
      userRoles.value = userRolesRes.data || []
    }

    if (allRolesRes.code === 200) {
      availableRoles.value = allRolesRes.data || []
    }

    roleDialog.visible = true
  } catch (error) {
    console.error('获取角色信息失败:', error)
    ElMessage.error('获取角色信息失败')
  }
}

// 移除角色
const handleRemoveRole = async (roleId) => {
  try {
    await ElMessageBox.confirm('确定要移除这个角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removeRolesFromUser(selectedUser.value.id, [roleId])
    if (response.code === 200) {
      ElMessage.success('角色移除成功')
      // 刷新用户角色列表
      const userRolesRes = await getUserRoles(selectedUser.value.id)
      if (userRolesRes.code === 200) {
        userRoles.value = userRolesRes.data || []
      }
    } else {
      ElMessage.error(response.message || '角色移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除角色失败:', error)
      ElMessage.error('移除角色失败')
    }
  }
}

// 分配角色
const handleAssignRoles = async () => {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请选择要分配的角色')
    return
  }

  try {
    roleDialog.loading = true
    const response = await assignRolesToUser(selectedUser.value.id, selectedRoles.value)
    
    if (response.code === 200) {
      ElMessage.success('角色分配成功')
      // 刷新用户角色列表
      const userRolesRes = await getUserRoles(selectedUser.value.id)
      if (userRolesRes.code === 200) {
        userRoles.value = userRolesRes.data || []
      }
      selectedRoles.value = []
    } else {
      ElMessage.error(response.message || '角色分配失败')
    }
  } catch (error) {
    console.error('角色分配失败:', error)
    ElMessage.error('角色分配失败')
  } finally {
    roleDialog.loading = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-detail {
  padding: 20px 0;
}

.role-assignment {
  padding: 10px 0;
}

.current-roles {
  min-height: 40px;
}

.role-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-checkboxes .el-checkbox {
  margin-right: 0;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style> 