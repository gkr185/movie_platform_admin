<template>
  <div class="category-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAddCategory">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 分类树形表格 -->
      <el-table
        :data="categoryTree"
        v-loading="loading"
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
      >
        <el-table-column prop="id" label="分类ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="description" label="分类描述" min-width="200" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="层级" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.parentId === 0 ? 'primary' : 'info'" size="small">
              {{ scope.row.parentId === 0 ? '根分类' : '子分类' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleAddChild(scope.row)">
              <el-icon><Plus /></el-icon>
              添加子分类
            </el-button>
            <el-button size="small" type="info" @click="handleViewMovies(scope.row)">
              <el-icon><Film /></el-icon>
              关联电影({{ scope.row.movieCount || 0 }})
            </el-button>
            <el-button size="small" type="primary" @click="handleEditCategory(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteCategory(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="categoryDialog.visible"
      :title="categoryDialog.title"
      width="600px"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="parentCategoryOptions"
            :props="{ children: 'children', label: 'name', value: 'id' }"
            check-strictly
            placeholder="请选择父分类（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number
            v-model="categoryForm.sortOrder"
            :min="0"
            :max="999"
            placeholder="排序权重"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCategory" :loading="categoryDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分类关联电影对话框 -->
    <el-dialog v-model="moviesDialog.visible" title="分类关联电影" width="800px">
      <div v-if="selectedCategory">
        <p class="mb-4">分类：<strong>{{ selectedCategory.name }}</strong> 关联的电影</p>
        
        <el-table
          :data="categoryMovies"
          v-loading="moviesDialog.loading"
          size="small"
          max-height="400"
        >
          <el-table-column prop="movieId" label="电影ID" width="80" />
          <el-table-column label="电影标题" min-width="200">
            <template #default="scope">
              <span>电影ID: {{ scope.row.movieId }}</span>
              <el-text type="info" size="small" class="ml-2">
                (需要通过电影服务获取详细信息)
              </el-text>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="关联时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="handleRemoveMovieAssociation(scope.row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4">
          <el-statistic title="关联电影总数" :value="categoryMovies.length" />
        </div>
      </div>
      <template #footer>
        <el-button @click="moviesDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Film, Edit, Delete } from '@element-plus/icons-vue'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryDetail,
  getCategoryMovies,
  getCategoryMovieCount,
  removeMovieCategoryAssociation
} from '@/api/category'

// 响应式数据
const loading = ref(false)
const allCategories = ref([])
const selectedCategory = ref(null)
const categoryMovies = ref([])

// 分类表单
const categoryForm = reactive({
  id: null,
  name: '',
  description: '',
  parentId: 0,
  sortOrder: 1,
  status: 1
})

const categoryFormRef = ref()

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分类名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入分类描述', trigger: 'blur' },
    { max: 200, message: '分类描述不能超过200个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序权重', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序权重必须在0-999之间', trigger: 'blur' }
  ]
}

// 对话框状态
const categoryDialog = reactive({
  visible: false,
  loading: false,
  title: '新增分类',
  isEdit: false
})

const moviesDialog = reactive({
  visible: false,
  loading: false
})

// 计算属性：分类树
const categoryTree = computed(() => {
  return buildTree(allCategories.value)
})

// 计算属性：父分类选项（用于下拉选择）
const parentCategoryOptions = computed(() => {
  const options = [{ id: 0, name: '根分类', children: [] }]
  const tree = buildTree(allCategories.value.filter(cat => cat.id !== categoryForm.id))
  options[0].children = tree
  return options
})

// 构建分类树
const buildTree = (categories) => {
  const tree = []
  const categoryMap = {}

  // 先创建所有节点的映射
  categories.forEach(category => {
    categoryMap[category.id] = {
      ...category,
      children: []
    }
  })

  // 构建树结构
  categories.forEach(category => {
    if (category.parentId === 0) {
      // 根节点
      tree.push(categoryMap[category.id])
    } else if (categoryMap[category.parentId]) {
      // 子节点
      categoryMap[category.parentId].children.push(categoryMap[category.id])
    }
  })

  return tree
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    loading.value = true
    const response = await getAllCategories()
    
    if (response.code === 200) {
      allCategories.value = response.data || []
      // 为每个分类获取电影数量
      await loadCategoryMovieCounts()
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类电影数量
const loadCategoryMovieCounts = async () => {
  for (const category of allCategories.value) {
    try {
      const response = await getCategoryMovieCount(category.id)
      if (response.code === 200) {
        category.movieCount = response.data
      }
    } catch (error) {
      console.warn(`获取分类 ${category.id} 的电影数量失败:`, error)
      category.movieCount = 0
    }
  }
}

// 新增分类
const handleAddCategory = () => {
  resetForm()
  categoryDialog.title = '新增分类'
  categoryDialog.isEdit = false
  categoryDialog.visible = true
}

// 添加子分类
const handleAddChild = (parent) => {
  resetForm()
  categoryForm.parentId = parent.id
  categoryDialog.title = `为 "${parent.name}" 添加子分类`
  categoryDialog.isEdit = false
  categoryDialog.visible = true
}

// 编辑分类
const handleEditCategory = (category) => {
  categoryForm.id = category.id
  categoryForm.name = category.name
  categoryForm.description = category.description
  categoryForm.parentId = category.parentId
  categoryForm.sortOrder = category.sortOrder
  categoryForm.status = category.status
  categoryDialog.title = '编辑分类'
  categoryDialog.isEdit = true
  categoryDialog.visible = true
}

// 重置表单
const resetForm = () => {
  categoryForm.id = null
  categoryForm.name = ''
  categoryForm.description = ''
  categoryForm.parentId = 0
  categoryForm.sortOrder = 1
  categoryForm.status = 1
}

// 提交分类表单
const handleSubmitCategory = async () => {
  if (!categoryFormRef.value) return

  try {
    const valid = await categoryFormRef.value.validate()
    if (!valid) return

    categoryDialog.loading = true

    let response
    if (categoryDialog.isEdit) {
      // 编辑分类
      response = await updateCategory(categoryForm.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        parentId: categoryForm.parentId,
        sortOrder: categoryForm.sortOrder,
        status: categoryForm.status
      })
    } else {
      // 新增分类
      response = await createCategory({
        name: categoryForm.name,
        description: categoryForm.description,
        parentId: categoryForm.parentId,
        sortOrder: categoryForm.sortOrder,
        status: categoryForm.status
      })
    }

    if (response.code === 200) {
      ElMessage.success(categoryDialog.isEdit ? '分类更新成功' : '分类创建成功')
      categoryDialog.visible = false
      fetchCategories() // 刷新列表
    } else {
      ElMessage.error(response.message || (categoryDialog.isEdit ? '分类更新失败' : '分类创建失败'))
    }
  } catch (error) {
    console.error('提交分类失败:', error)
    ElMessage.error('提交分类失败')
  } finally {
    categoryDialog.loading = false
  }
}

// 切换分类状态
const handleStatusChange = async (category) => {
  try {
    const response = await updateCategory(category.id, {
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      status: category.status
    })
    
    if (response.code === 200) {
      ElMessage.success(`分类已${category.status === 1 ? '启用' : '禁用'}`)
    } else {
      // 如果更新失败，恢复原状态
      category.status = category.status === 1 ? 0 : 1
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    // 如果出错，恢复原状态
    category.status = category.status === 1 ? 0 : 1
    console.error('更新分类状态失败:', error)
    ElMessage.error('更新分类状态失败')
  }
}

// 删除分类
const handleDeleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${category.name}" 吗？删除后无法恢复！`, 
      '删除分类', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    const response = await deleteCategory(category.id)
    
    if (response.code === 200) {
      ElMessage.success('分类删除成功')
      fetchCategories() // 刷新列表
    } else {
      ElMessage.error(response.message || '分类删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// 查看分类关联的电影
const handleViewMovies = async (category) => {
  selectedCategory.value = category
  categoryMovies.value = []
  moviesDialog.loading = true
  moviesDialog.visible = true

  try {
    const response = await getCategoryMovies(category.id)
    if (response.code === 200) {
      categoryMovies.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取关联电影失败')
    }
  } catch (error) {
    console.error('获取关联电影失败:', error)
    ElMessage.error('获取关联电影失败')
  } finally {
    moviesDialog.loading = false
  }
}

// 移除电影关联
const handleRemoveMovieAssociation = async (association) => {
  try {
    await ElMessageBox.confirm('确定要移除这个电影关联吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removeMovieCategoryAssociation(association.movieId, association.categoryId)
    if (response.code === 200) {
      ElMessage.success('电影关联移除成功')
      // 刷新关联电影列表
      handleViewMovies(selectedCategory.value)
      // 刷新分类列表以更新计数
      fetchCategories()
    } else {
      ElMessage.error(response.message || '移除电影关联失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除电影关联失败:', error)
      ElMessage.error('移除电影关联失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style> 