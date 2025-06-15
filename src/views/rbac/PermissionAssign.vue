<template>
  <div class="permission-assign">
    <el-row :gutter="20">
      <!-- 用户角色分配 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>用户角色分配</span>
            </div>
          </template>

          <!-- 用户搜索 -->
          <div class="search-section">
            <el-input
              v-model="userSearch.keyword"
              placeholder="搜索用户..."
              clearable
              @keyup.enter="searchUsers"
              @clear="searchUsers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="searchUsers">搜索</el-button>
              </template>
            </el-input>
          </div>

          <!-- 用户列表 -->
          <div class="user-list">
            <el-table
              :data="userList"
              v-loading="userLoading"
              @row-click="handleSelectUser"
              highlight-current-row
              size="small"
              max-height="400"
            >
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column label="VIP状态" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.isVip ? 'warning' : 'info'" size="small">
                    {{ scope.row.isVip ? 'VIP' : '普通' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 用户角色信息 -->
          <div v-if="selectedUser" class="user-roles-section">
            <el-divider>{{ selectedUser.username }} 的角色</el-divider>
            <div class="current-roles">
              <el-tag
                v-for="role in selectedUserRoles"
                :key="role.id"
                closable
                @close="removeUserRole(role.id)"
                class="mr-2 mb-2"
              >
                {{ role.name }}
              </el-tag>
              <el-tag v-if="selectedUserRoles.length === 0" type="info">暂无角色</el-tag>
            </div>
            
            <div class="assign-roles">
              <el-select
                v-model="selectedRoleIds"
                multiple
                placeholder="选择要分配的角色"
                style="width: 100%; margin-top: 10px;"
              >
                <el-option
                  v-for="role in availableRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                  :disabled="selectedUserRoles.some(ur => ur.id === role.id)"
                >
                  <span>{{ role.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ role.description }}</span>
                </el-option>
              </el-select>
              <el-button 
                type="primary" 
                @click="assignRoles" 
                :loading="assignLoading"
                class="mt-2"
                style="width: 100%;"
              >
                分配角色
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 角色权限管理 -->
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>角色权限管理</span>
            </div>
          </template>

          <!-- 角色选择 -->
          <div class="role-select-section">
            <el-select
              v-model="selectedRoleId"
              placeholder="选择角色"
              @change="handleRoleChange"
              style="width: 100%;"
            >
              <el-option
                v-for="role in allRoles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              >
                <span>{{ role.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ role.description }}</span>
              </el-option>
            </el-select>
          </div>

          <!-- 角色权限显示 -->
          <div v-if="selectedRole" class="role-permissions-section">
            <el-divider>{{ selectedRole.name }} 的权限</el-divider>
            
            <div class="current-permissions">
              <h4>当前权限：</h4>
              <div class="permissions-tags">
                <el-tag
                  v-for="permission in selectedRolePermissions"
                  :key="permission.id"
                  closable
                  @close="removeRolePermission(permission.id)"
                  class="mr-2 mb-2"
                  size="small"
                >
                  {{ permission.name }}
                </el-tag>
                <el-tag v-if="selectedRolePermissions.length === 0" type="info">暂无权限</el-tag>
              </div>
            </div>

            <div class="assign-permissions">
              <h4>分配权限：</h4>
              <el-tree
                ref="permissionTreeRef"
                :data="permissionTree"
                show-checkbox
                node-key="id"
                :props="{ children: 'children', label: 'name' }"
                class="permission-tree"
                size="small"
                default-expand-all
              >
                <template #default="{ data }">
                  <span class="tree-node">
                    <span>{{ data.name }}</span>
                    <span class="tree-node-code">{{ data.code }}</span>
                  </span>
                </template>
              </el-tree>
              <el-button 
                type="primary" 
                @click="assignPermissions" 
                :loading="permissionAssignLoading"
                class="mt-2"
                style="width: 100%;"
              >
                分配权限
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="6">
        <el-statistic title="总用户数" :value="statistics.totalUsers" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总角色数" :value="statistics.totalRoles" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总权限数" :value="statistics.totalPermissions" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="VIP用户数" :value="statistics.vipUsers" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, searchUsers as searchUsersApi } from '@/api/user'
import { 
  getAllRoles, 
  getAllPermissions, 
  getUserRoles, 
  getRolePermissions,
  assignRolesToUser, 
  removeRolesFromUser,
  assignPermissionsToRole,
  removePermissionsFromRole
} from '@/api/rbac'

// 响应式数据
const userLoading = ref(false)
const assignLoading = ref(false)
const permissionAssignLoading = ref(false)

const userList = ref([])
const allRoles = ref([])
const allPermissions = ref([])
const selectedUser = ref(null)
const selectedUserRoles = ref([])
const selectedRole = ref(null)
const selectedRolePermissions = ref([])
const selectedRoleIds = ref([])
const selectedRoleId = ref(null)
const selectedPermissionIds = ref([])

const permissionTreeRef = ref()

// 搜索表单
const userSearch = reactive({
  keyword: ''
})

// 统计信息
const statistics = reactive({
  totalUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
  vipUsers: 0
})

// 计算属性
const availableRoles = computed(() => {
  return allRoles.value.filter(role => 
    !selectedUserRoles.value.some(ur => ur.id === role.id)
  )
})

const permissionTree = computed(() => {
  return buildPermissionTree(allPermissions.value)
})

// 构建权限树
const buildPermissionTree = (permissions) => {
  console.log('构建权限树，原始数据:', permissions)
  
  if (!permissions || permissions.length === 0) {
    return []
  }

  const tree = []
  const permissionMap = {}

  // 先创建所有节点的映射
  permissions.forEach(permission => {
    permissionMap[permission.id] = {
      ...permission,
      children: []
    }
  })

  console.log('权限映射:', permissionMap)

  // 构建树结构
  permissions.forEach(permission => {
    if (permission.parentId === 0 || permission.parentId === null) {
      // 根节点
      tree.push(permissionMap[permission.id])
    } else if (permissionMap[permission.parentId]) {
      // 子节点
      permissionMap[permission.parentId].children.push(permissionMap[permission.id])
    } else {
      // 父节点不存在的情况，作为根节点处理
      console.warn('找不到父节点:', permission.parentId, '对于权限:', permission)
      tree.push(permissionMap[permission.id])
    }
  })

  console.log('构建完成的权限树:', tree)
  return tree
}

// 获取用户列表
const fetchUsers = async (keyword = '') => {
  try {
    userLoading.value = true
    let response

    if (keyword.trim()) {
      response = await searchUsersApi({
        keyword: keyword.trim(),
        page: 0,
        size: 20
      })
    } else {
      response = await getUserList({
        page: 0,
        size: 20
      })
    }

    if (response.code === 200) {
      userList.value = response.data.content || []
      statistics.totalUsers = response.data.totalElements || 0
      statistics.vipUsers = userList.value.filter(user => user.isVip).length
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    userLoading.value = false
  }
}

// 搜索用户
const searchUsers = () => {
  fetchUsers(userSearch.keyword)
}

// 获取所有角色
const fetchRoles = async () => {
  try {
    const response = await getAllRoles()
    if (response.code === 200) {
      allRoles.value = response.data || []
      statistics.totalRoles = allRoles.value.length
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 获取所有权限
const fetchPermissions = async () => {
  try {
    const response = await getAllPermissions()
    if (response.code === 200) {
      allPermissions.value = response.data || []
      statistics.totalPermissions = allPermissions.value.length
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
  }
}

// 选择用户
const handleSelectUser = async (user) => {
  selectedUser.value = user
  selectedRoleIds.value = []
  
  try {
    const response = await getUserRoles(user.id)
    if (response.code === 200) {
      selectedUserRoles.value = response.data || []
    }
  } catch (error) {
    console.error('获取用户角色失败:', error)
    ElMessage.error('获取用户角色失败')
  }
}

// 移除用户角色
const removeUserRole = async (roleId) => {
  try {
    await ElMessageBox.confirm('确定要移除这个角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removeRolesFromUser(selectedUser.value.id, [roleId])
    if (response.code === 200) {
      ElMessage.success('角色移除成功')
      // 刷新用户角色
      handleSelectUser(selectedUser.value)
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
const assignRoles = async () => {
  if (selectedRoleIds.value.length === 0) {
    ElMessage.warning('请选择要分配的角色')
    return
  }

  try {
    assignLoading.value = true
    const response = await assignRolesToUser(selectedUser.value.id, selectedRoleIds.value)
    
    if (response.code === 200) {
      ElMessage.success('角色分配成功')
      selectedRoleIds.value = []
      // 刷新用户角色
      handleSelectUser(selectedUser.value)
    } else {
      ElMessage.error(response.message || '角色分配失败')
    }
  } catch (error) {
    console.error('角色分配失败:', error)
    ElMessage.error('角色分配失败')
  } finally {
    assignLoading.value = false
  }
}

// 角色改变
const handleRoleChange = async (roleId) => {
  const role = allRoles.value.find(r => r.id === roleId)
  selectedRole.value = role
  selectedPermissionIds.value = []
  
  if (role) {
    try {
      console.log('获取角色权限，角色ID:', role.id)
      const response = await getRolePermissions(role.id)
      console.log('角色权限响应:', response)
      
      if (response.code === 200) {
        selectedRolePermissions.value = response.data || []
        selectedPermissionIds.value = selectedRolePermissions.value.map(p => p.id)
        
        console.log('当前角色权限:', selectedRolePermissions.value)
        console.log('选中的权限ID:', selectedPermissionIds.value)
        
        // 等待下一个tick后设置树的选中状态
        await nextTick()
        if (permissionTreeRef.value) {
          permissionTreeRef.value.setCheckedKeys(selectedPermissionIds.value)
        }
      } else {
        ElMessage.error(response.message || '获取角色权限失败')
      }
    } catch (error) {
      console.error('获取角色权限失败:', error)
      ElMessage.error('获取角色权限失败')
    }
  }
}

// 移除角色权限
const removeRolePermission = async (permissionId) => {
  try {
    await ElMessageBox.confirm('确定要移除这个权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removePermissionsFromRole(selectedRole.value.id, [permissionId])
    if (response.code === 200) {
      ElMessage.success('权限移除成功')
      // 刷新角色权限
      handleRoleChange(selectedRole.value.id)
    } else {
      ElMessage.error(response.message || '权限移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除权限失败:', error)
      ElMessage.error('移除权限失败')
    }
  }
}

// 分配权限
const assignPermissions = async () => {
  if (!permissionTreeRef.value) return

  try {
    permissionAssignLoading.value = true
    
    // 获取选中的权限节点
    const checkedNodes = permissionTreeRef.value.getCheckedNodes()
    const permissionIds = checkedNodes.map(node => node.id)
    
    if (permissionIds.length === 0) {
      ElMessage.warning('请选择要分配的权限')
      return
    }

    const response = await assignPermissionsToRole(selectedRole.value.id, permissionIds)
    
    if (response.code === 200) {
      ElMessage.success('权限分配成功')
      // 刷新角色权限
      handleRoleChange(selectedRole.value.id)
    } else {
      ElMessage.error(response.message || '权限分配失败')
    }
  } catch (error) {
    console.error('权限分配失败:', error)
    ElMessage.error('权限分配失败')
  } finally {
    permissionAssignLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
  fetchRoles()
  fetchPermissions()
})
</script>

<style scoped>
.permission-assign {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: 15px;
}

.user-list {
  margin-bottom: 20px;
}

.user-roles-section {
  margin-top: 20px;
}

.current-roles {
  margin-bottom: 15px;
  min-height: 32px;
}

.role-select-section {
  margin-bottom: 20px;
}

.role-permissions-section {
  margin-top: 20px;
}

.current-permissions {
  margin-bottom: 20px;
}

.permissions-tags {
  min-height: 32px;
  margin-bottom: 15px;
}

.permission-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tree-node-code {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style> 