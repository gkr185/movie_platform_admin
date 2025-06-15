<template>
  <div class="role-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 角色列表 -->
      <el-table
        :data="roleList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="角色ID" width="80" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="description" label="角色描述" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewPermissions(scope.row)">
              <el-icon><Key /></el-icon>
              权限
            </el-button>
            <el-button size="small" type="primary" @click="handleEditRole(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteRole(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="roleDialog.visible"
      :title="roleDialog.isEdit ? '编辑角色' : '新增角色'"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole" :loading="roleDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 角色权限管理对话框 -->
    <el-dialog v-model="permissionDialog.visible" title="角色权限管理" width="800px">
      <div v-if="selectedRole">
        <p class="mb-4">为角色 <strong>{{ selectedRole.name }}</strong> 分配权限</p>
        
        <div class="permission-assignment">
          <div class="current-permissions mb-4">
            <h4>当前权限：</h4>
            <div class="permissions-list">
              <el-tag
                v-for="permission in rolePermissions"
                :key="permission.id"
                closable
                @close="handleRemovePermission(permission.id)"
                class="mr-2 mb-2"
              >
                {{ permission.name }}
              </el-tag>
              <el-tag v-if="rolePermissions.length === 0" type="info">暂无权限</el-tag>
            </div>
          </div>

          <div class="available-permissions">
            <h4>可分配权限：</h4>
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              show-checkbox
              node-key="id"
              :default-checked-keys="selectedPermissions"
              :props="{ children: 'children', label: 'name' }"
              class="permission-tree"
            >
              <template #default="{ data }">
                <span class="tree-node">
                  <span>{{ data.name }}</span>
                  <span class="tree-node-code">{{ data.code }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="permissionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignPermissions" :loading="permissionDialog.loading">
          分配权限
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Key, Edit, Delete } from '@element-plus/icons-vue'
import { getAllRoles, getRolePermissions, assignPermissionsToRole, removePermissionsFromRole, getAllPermissions } from '@/api/rbac'

// 响应式数据
const loading = ref(false)
const roleList = ref([])
const selectedRole = ref(null)
const rolePermissions = ref([])
const allPermissions = ref([])
const permissionTree = ref([])
const selectedPermissions = ref([])

// 角色表单
const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  status: 1
})

const roleFormRef = ref()

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 200, message: '角色描述不能超过200个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ]
}

// 对话框状态
const roleDialog = reactive({
  visible: false,
  loading: false,
  isEdit: false
})

const permissionDialog = reactive({
  visible: false,
  loading: false
})

const permissionTreeRef = ref()

// 获取角色列表
const fetchRoleList = async () => {
  try {
    loading.value = true
    const response = await getAllRoles()
    
    if (response.code === 200) {
      roleList.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取所有权限
const fetchAllPermissions = async () => {
  try {
    const response = await getAllPermissions()
    if (response.code === 200) {
      allPermissions.value = response.data || []
      // 构建权限树
      buildPermissionTree()
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
  }
}

// 构建权限树
const buildPermissionTree = () => {
  const tree = []
  const permissionMap = {}

  // 先创建所有节点的映射
  allPermissions.value.forEach(permission => {
    permissionMap[permission.id] = {
      ...permission,
      children: []
    }
  })

  // 构建树结构
  allPermissions.value.forEach(permission => {
    if (permission.parentId === 0) {
      // 根节点
      tree.push(permissionMap[permission.id])
    } else if (permissionMap[permission.parentId]) {
      // 子节点
      permissionMap[permission.parentId].children.push(permissionMap[permission.id])
    }
  })

  permissionTree.value = tree
}

// 新增角色
const handleAddRole = () => {
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.status = 1
  roleDialog.isEdit = false
  roleDialog.visible = true
}

// 编辑角色
const handleEditRole = (role) => {
  roleForm.id = role.id
  roleForm.name = role.name
  roleForm.description = role.description
  roleForm.status = role.status
  roleDialog.isEdit = true
  roleDialog.visible = true
}

// 提交角色表单
const handleSubmitRole = async () => {
  if (!roleFormRef.value) return

  try {
    const valid = await roleFormRef.value.validate()
    if (!valid) return

    roleDialog.loading = true

    // 这里需要根据实际API来实现新增/编辑角色
    // 由于API文档中没有提供角色的增删改接口，这里只是模拟
    if (roleDialog.isEdit) {
      ElMessage.success('角色编辑功能需要后端API支持')
    } else {
      ElMessage.success('角色新增功能需要后端API支持')
    }
    
    roleDialog.visible = false
    // fetchRoleList() // 刷新列表
  } catch (error) {
    console.error('提交角色失败:', error)
    ElMessage.error('提交角色失败')
  } finally {
    roleDialog.loading = false
  }
}

// 删除角色
const handleDeleteRole = async (role) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里需要调用删除API
    ElMessage.success('角色删除功能需要后端API支持')
    // fetchRoleList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 查看角色权限
const handleViewPermissions = async (role) => {
  selectedRole.value = role
  selectedPermissions.value = []
  
  try {
    // 获取角色权限和所有权限
    const [rolePermissionsRes] = await Promise.all([
      getRolePermissions(role.id)
    ])

    if (rolePermissionsRes.code === 200) {
      rolePermissions.value = rolePermissionsRes.data || []
      selectedPermissions.value = rolePermissions.value.map(p => p.id)
    }

    permissionDialog.visible = true
  } catch (error) {
    console.error('获取角色权限失败:', error)
    ElMessage.error('获取角色权限失败')
  }
}

// 移除单个权限
const handleRemovePermission = async (permissionId) => {
  try {
    await ElMessageBox.confirm('确定要移除这个权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removePermissionsFromRole(selectedRole.value.id, [permissionId])
    if (response.code === 200) {
      ElMessage.success('权限移除成功')
      // 刷新角色权限列表
      const rolePermissionsRes = await getRolePermissions(selectedRole.value.id)
      if (rolePermissionsRes.code === 200) {
        rolePermissions.value = rolePermissionsRes.data || []
        selectedPermissions.value = rolePermissions.value.map(p => p.id)
      }
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
const handleAssignPermissions = async () => {
  if (!permissionTreeRef.value) return

  try {
    permissionDialog.loading = true
    
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
      // 刷新角色权限列表
      const rolePermissionsRes = await getRolePermissions(selectedRole.value.id)
      if (rolePermissionsRes.code === 200) {
        rolePermissions.value = rolePermissionsRes.data || []
        selectedPermissions.value = rolePermissions.value.map(p => p.id)
      }
    } else {
      ElMessage.error(response.message || '权限分配失败')
    }
  } catch (error) {
    console.error('权限分配失败:', error)
    ElMessage.error('权限分配失败')
  } finally {
    permissionDialog.loading = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRoleList()
  fetchAllPermissions()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-assignment {
  padding: 10px 0;
}

.permissions-list {
  min-height: 40px;
  margin-bottom: 20px;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
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

.mb-4 {
  margin-bottom: 16px;
}
</style> 