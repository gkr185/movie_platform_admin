<template>
  <div class="permission-management">
    <!-- 权限提示卡片 -->
    <el-card class="permission-tips-card">
      <template #header>
        <div class="card-header">
          <span>系统权限提示</span>
          <el-button type="text" @click="showPermissionTips = !showPermissionTips">
            {{ showPermissionTips ? '收起' : '展开' }}
          </el-button>
        </div>
      </template>
      
      <el-collapse-transition>
        <div v-show="showPermissionTips" class="permission-tips">
          <el-alert
            title="权限码使用说明"
            type="info"
            :closable="false"
            class="mb-4"
          >
            <p>以下是系统中实际使用的权限码，请确保这些权限已正确注册：</p>
          </el-alert>
          
          <el-row :gutter="20">
            <el-col :span="12" v-for="module in systemPermissions" :key="module.name">
              <el-card class="module-card" shadow="hover">
                <template #header>
                  <div class="module-header">
                    <el-icon>
                      <component :is="module.icon" />
                    </el-icon>
                    <span class="module-name">{{ module.name }}</span>
                  </div>
                </template>
                
                <div class="permission-list">
                  <el-tag 
                    v-for="permission in module.permissions" 
                    :key="permission.code"
                    class="permission-tag"
                    :type="isPermissionRegistered(permission.code) ? 'success' : 'danger'"
                    size="small"
                  >
                    <el-tooltip :content="permission.description" placement="top">
                      <span>{{ permission.code }}</span>
                    </el-tooltip>
                  </el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <div class="tips-footer">
            <el-alert
              title="快速操作"
              type="success"
              :closable="false"
              class="mt-4"
            >
              <p>点击下方按钮快速注册所有系统权限：</p>
              <el-button type="primary" size="small" @click="registerSystemPermissions">
                <el-icon><Magic /></el-icon>
                一键注册系统权限
              </el-button>
            </el-alert>
          </div>
        </div>
      </el-collapse-transition>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <div>
            <el-button type="primary" @click="handleAddPermission">
              <el-icon><Plus /></el-icon>
              新增权限
            </el-button>
            <el-button type="success" @click="handleBatchRegister">
              <el-icon><Upload /></el-icon>
              批量注册
            </el-button>
          </div>
        </div>
      </template>

      <!-- 权限树形表格 -->
      <el-table
        :data="permissionTree"
        v-loading="loading"
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
      >
        <el-table-column prop="id" label="权限ID" width="80" />
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限代码" min-width="180" />
        <el-table-column prop="description" label="权限描述" min-width="200" />
        <el-table-column label="层级" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.parentId === 0 ? 'primary' : 'info'" size="small">
              {{ scope.row.parentId === 0 ? '根权限' : '子权限' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleAddChild(scope.row)">
              <el-icon><Plus /></el-icon>
              添加子权限
            </el-button>
            <el-button size="small" type="primary" @click="handleEditPermission(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeletePermission(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限表单对话框 -->
    <el-dialog
      v-model="permissionDialog.visible"
      :title="permissionDialog.title"
      width="600px"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        label-width="100px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限代码，如：user:view" />
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
        <el-form-item label="父权限" prop="parentId">
          <el-tree-select
            v-model="permissionForm.parentId"
            :data="parentPermissionOptions"
            :props="{ children: 'children', label: 'name', value: 'id' }"
            check-strictly
            placeholder="请选择父权限（可选）"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPermission" :loading="permissionDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量注册对话框 -->
    <el-dialog v-model="batchDialog.visible" title="批量注册权限" width="800px">
      <div class="batch-register">
        <el-alert
          title="批量注册说明"
          type="info"
          :closable="false"
          class="mb-4"
        >
          <p>请按照以下格式输入权限信息，每行一个权限：</p>
          <p><strong>权限名称,权限代码,权限描述,父权限ID</strong></p>
          <p>示例：</p>
          <p>用户管理,user:manage,管理用户信息,0</p>
          <p>查看用户,user:view,查看用户列表,1</p>
        </el-alert>
        
        <el-form-item label="权限数据">
          <el-input
            v-model="batchForm.data"
            type="textarea"
            :rows="10"
            placeholder="请输入权限数据，每行一个权限..."
          />
        </el-form-item>
        
        <div class="preview" v-if="parsedPermissions.length > 0">
          <h4>预览数据：</h4>
          <el-table :data="parsedPermissions" size="small" max-height="300">
            <el-table-column prop="name" label="权限名称" />
            <el-table-column prop="code" label="权限代码" />
            <el-table-column prop="description" label="权限描述" />
            <el-table-column prop="parentId" label="父权限ID" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button @click="parseBatchData">解析数据</el-button>
        <el-button type="primary" @click="handleSubmitBatch" :loading="batchDialog.loading">
          批量注册
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Upload, Edit, Delete, Magic,
  Platform, User, Lock, VideoPlay, Grid, Picture, Document, 
  CreditCard, Setting
} from '@element-plus/icons-vue'
import { 
  getAllPermissions, 
  registerPermission, 
  batchRegisterPermissions,
  updatePermission,
  deletePermission,
  getPermissionDetail
} from '@/api/rbac'

// 响应式数据
const loading = ref(false)
const allPermissions = ref([])
const selectedPermission = ref(null)
const parsedPermissions = ref([])
const showPermissionTips = ref(true)

// 系统权限定义（来自AdminLayout.vue）
const systemPermissions = ref([
  {
    name: '仪表盘',
    icon: 'Platform',
    permissions: [
      { code: 'dashboard:view', description: '查看仪表盘' }
    ]
  },
  {
    name: '用户管理',
    icon: 'User',
    permissions: [
      { code: 'user:view', description: '查看用户列表' },
      { code: 'user:manage', description: '管理用户信息' },
      { code: 'user:vip', description: 'VIP用户管理' }
    ]
  },
  {
    name: '权限管理',
    icon: 'Lock',
    permissions: [
      { code: 'rbac:view', description: '查看权限信息' },
      { code: 'rbac:manage', description: '管理权限' },
      { code: 'rbac:role', description: '角色管理' },
      { code: 'rbac:permission', description: '权限管理' },
      { code: 'rbac:assign', description: '权限分配' }
    ]
  },
  {
    name: '电影管理',
    icon: 'VideoPlay',
    permissions: [
      { code: 'movie:view', description: '查看电影列表' },
      { code: 'movie:manage', description: '管理电影' },
      { code: 'movie:upload', description: '上传电影' },
      { code: 'movie:review', description: '影评管理' }
    ]
  },
  {
    name: '分类管理',
    icon: 'Grid',
    permissions: [
      { code: 'category:manage', description: '分类管理' }
    ]
  },
  {
    name: '广告管理',
    icon: 'Picture',
    permissions: [
      { code: 'ad:view', description: '查看广告列表' },
      { code: 'ad:manage', description: '管理广告' },
      { code: 'ad:create', description: '创建广告' }
    ]
  },
  {
    name: '新闻资讯',
    icon: 'Document',
    permissions: [
      { code: 'news:view', description: '查看新闻列表' },
      { code: 'news:create', description: '发布新闻' },
      { code: 'news:update', description: '更新新闻' },
      { code: 'news:delete', description: '删除新闻' },
      { code: 'news:feedback', description: '用户反馈管理' },
      { code: 'news:manage', description: '新闻管理' }
    ]
  },
  {
    name: 'VIP支付',
    icon: 'CreditCard',
    permissions: [
      { code: 'payment:view', description: '查看支付信息' },
      { code: 'vip:manage', description: 'VIP管理' },
      { code: 'vip:view', description: '查看VIP订单' },
      { code: 'vip:audit', description: 'VIP套餐审核' }
    ]
  },
  {
    name: '系统设置',
    icon: 'Setting',
    permissions: [
      { code: 'system:setting', description: '系统设置' }
    ]
  }
])

// 权限表单
const permissionForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  parentId: 0
})

const permissionFormRef = ref()

// 批量注册表单
const batchForm = reactive({
  data: ''
})

// 表单验证规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9:_-]+$/, message: '权限代码只能包含字母、数字、冒号、下划线和横线', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入权限描述', trigger: 'blur' },
    { max: 200, message: '权限描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 对话框状态
const permissionDialog = reactive({
  visible: false,
  loading: false,
  title: '新增权限',
  isEdit: false
})

const batchDialog = reactive({
  visible: false,
  loading: false
})

// 计算属性：权限树
const permissionTree = computed(() => {
  return buildTree(allPermissions.value)
})

// 计算属性：父权限选项（用于下拉选择）
const parentPermissionOptions = computed(() => {
  const options = [{ id: 0, name: '根权限', children: [] }]
  const tree = buildTree(allPermissions.value)
  options[0].children = tree
  return options
})

// 构建权限树
const buildTree = (permissions) => {
  const tree = []
  const permissionMap = {}

  // 先创建所有节点的映射
  permissions.forEach(permission => {
    permissionMap[permission.id] = {
      ...permission,
      children: []
    }
  })

  // 构建树结构
  permissions.forEach(permission => {
    if (permission.parentId === 0) {
      // 根节点
      tree.push(permissionMap[permission.id])
    } else if (permissionMap[permission.parentId]) {
      // 子节点
      permissionMap[permission.parentId].children.push(permissionMap[permission.id])
    }
  })

  return tree
}

// 获取权限列表
const fetchPermissions = async () => {
  try {
    loading.value = true
    const response = await getAllPermissions()
    
    if (response.code === 200) {
      allPermissions.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取权限列表失败')
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

// 新增权限
const handleAddPermission = () => {
  resetForm()
  permissionDialog.title = '新增权限'
  permissionDialog.isEdit = false
  permissionDialog.visible = true
}

// 添加子权限
const handleAddChild = (parent) => {
  resetForm()
  permissionForm.parentId = parent.id
  permissionDialog.title = `为 "${parent.name}" 添加子权限`
  permissionDialog.isEdit = false
  permissionDialog.visible = true
}

// 编辑权限
const handleEditPermission = (permission) => {
  permissionForm.id = permission.id
  permissionForm.name = permission.name
  permissionForm.code = permission.code
  permissionForm.description = permission.description
  permissionForm.parentId = permission.parentId
  permissionDialog.title = '编辑权限'
  permissionDialog.isEdit = true
  permissionDialog.visible = true
}

// 重置表单
const resetForm = () => {
  permissionForm.id = null
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.description = ''
  permissionForm.parentId = 0
}

// 提交权限表单
const handleSubmitPermission = async () => {
  if (!permissionFormRef.value) return

  try {
    const valid = await permissionFormRef.value.validate()
    if (!valid) return

    permissionDialog.loading = true

    let response
    if (permissionDialog.isEdit) {
      // 编辑权限
      response = await updatePermission(permissionForm.id, {
        name: permissionForm.name,
        description: permissionForm.description
      })
    } else {
      // 新增权限
      response = await registerPermission(
        permissionForm.code,
        permissionForm.name,
        permissionForm.description,
        permissionForm.parentId
      )
    }

    if (response.code === 200) {
      ElMessage.success(permissionDialog.isEdit ? '权限更新成功' : '权限注册成功')
      permissionDialog.visible = false
      fetchPermissions() // 刷新列表
    } else {
      ElMessage.error(response.message || (permissionDialog.isEdit ? '权限更新失败' : '权限注册失败'))
    }
  } catch (error) {
    console.error('提交权限失败:', error)
    ElMessage.error('提交权限失败')
  } finally {
    permissionDialog.loading = false
  }
}

// 删除权限
const handleDeletePermission = async (permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${permission.name}" 吗？删除后无法恢复！`, 
      '删除权限', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    const response = await deletePermission(permission.id)
    
    if (response.code === 200) {
      ElMessage.success('权限删除成功')
      fetchPermissions() // 刷新列表
    } else {
      ElMessage.error(response.message || '权限删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error)
      ElMessage.error('删除权限失败')
    }
  }
}

// 批量注册权限
const handleBatchRegister = () => {
  batchForm.data = ''
  parsedPermissions.value = []
  batchDialog.visible = true
}

// 解析批量数据
const parseBatchData = () => {
  try {
    const lines = batchForm.data.trim().split('\n').filter(line => line.trim())
    const permissions = []

    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim())
      if (parts.length >= 3) {
        permissions.push({
          name: parts[0],
          code: parts[1],
          description: parts[2],
          parentId: parts[3] ? parseInt(parts[3]) : 0
        })
      }
    }

    parsedPermissions.value = permissions
    
    if (permissions.length === 0) {
      ElMessage.warning('没有解析到有效的权限数据')
    } else {
      ElMessage.success(`成功解析 ${permissions.length} 条权限数据`)
    }
  } catch (error) {
    console.error('解析数据失败:', error)
    ElMessage.error('数据格式错误，请检查输入格式')
  }
}

// 提交批量注册
const handleSubmitBatch = async () => {
  if (parsedPermissions.value.length === 0) {
    ElMessage.warning('请先解析权限数据')
    return
  }

  try {
    batchDialog.loading = true
    const response = await batchRegisterPermissions(parsedPermissions.value)
    
    if (response.code === 200) {
      ElMessage.success('批量注册成功')
      batchDialog.visible = false
      fetchPermissions() // 刷新列表
    } else {
      ElMessage.error(response.message || '批量注册失败')
    }
  } catch (error) {
    console.error('批量注册失败:', error)
    ElMessage.error('批量注册失败')
  } finally {
    batchDialog.loading = false
  }
}

// 检查权限是否已注册
const isPermissionRegistered = (permissionCode) => {
  return allPermissions.value.some(permission => permission.code === permissionCode)
}

// 一键注册系统权限
const registerSystemPermissions = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注册所有系统权限吗？已存在的权限将被跳过。',
      '一键注册系统权限',
      {
        confirmButtonText: '确定注册',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 收集所有未注册的权限
    const unregisteredPermissions = []
    
    systemPermissions.value.forEach(module => {
      module.permissions.forEach(permission => {
        if (!isPermissionRegistered(permission.code)) {
          unregisteredPermissions.push({
            name: permission.description,
            code: permission.code,
            description: permission.description,
            parentId: 0
          })
        }
      })
    })

    if (unregisteredPermissions.length === 0) {
      ElMessage.info('所有系统权限已注册，无需重复注册')
      return
    }

    // 批量注册
    const response = await batchRegisterPermissions(unregisteredPermissions)
    
    if (response.code === 200) {
      ElMessage.success(`成功注册 ${unregisteredPermissions.length} 个系统权限`)
      fetchPermissions() // 刷新列表
    } else {
      ElMessage.error(response.message || '系统权限注册失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('注册系统权限失败:', error)
      ElMessage.error('注册系统权限失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-register {
  padding: 10px 0;
}

.preview {
  margin-top: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

/* 权限提示卡片样式 */
.permission-tips-card {
  margin-bottom: 20px;
}

.permission-tips {
  padding: 10px 0;
}

.module-card {
  margin-bottom: 16px;
  height: 100%;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-name {
  font-weight: bold;
  font-size: 14px;
}

.permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  margin-bottom: 8px;
  cursor: help;
}

.tips-footer {
  text-align: center;
}

/* 权限状态颜色 */
.permission-tag.el-tag--success {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #67c23a;
  --el-tag-text-color: #67c23a;
}

.permission-tag.el-tag--danger {
  --el-tag-bg-color: #fef0f0;
  --el-tag-border-color: #f56c6c;
  --el-tag-text-color: #f56c6c;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .permission-tips .el-col {
    margin-bottom: 16px;
  }
  
  .module-card {
    margin-bottom: 12px;
  }
  
  .permission-list {
    gap: 6px;
  }
}
</style> 