<template>
  <div class="movie-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>电影列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddMovie">
              <el-icon><Plus /></el-icon>
              新增电影
            </el-button>
            <el-button type="success" @click="showCategoryManager = true">
              <el-icon><Collection /></el-icon>
              批量管理分类
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索电影标题、导演、演员..."
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable>
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in allCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.isVip" placeholder="VIP属性" clearable>
              <el-option label="全部" value="" />
              <el-option label="VIP专享" :value="1" />
              <el-option label="免费观看" :value="0" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="上线" :value="1" />
              <el-option label="下线" :value="0" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleResetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 电影表格 -->
      <el-table
        :data="movieList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="海报" width="80">
          <template #default="scope">
            <el-image
              v-if="scope.row.posterUrl"
              :src="scope.row.posterUrl"
              :preview-src-list="[scope.row.posterUrl]"
              fit="cover"
              style="width: 50px; height: 75px"
              preview-teleported
            />
            <span v-else class="no-poster">无海报</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="电影标题" min-width="150" />
        <el-table-column prop="originalTitle" label="原始标题" min-width="150" />
        <el-table-column prop="director" label="导演" width="120" />
        <el-table-column label="类型" width="120">
          <template #default="scope">
            <el-tag
              v-for="genre in (scope.row.genres || '').split(',')"
              :key="genre"
              size="small"
              class="mr-1 mb-1"
            >
              {{ genre.trim() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类标签" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="info"
              @click="handleViewCategories(scope.row)"
              :loading="scope.row.categoriesLoading"
            >
              <el-icon><Collection /></el-icon>
              查看分类
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="scope">
            <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              text-color="#ff9900"
              :max="10"
              :precision="0.1"
            />
            <div class="rating-info">
              <small>{{ scope.row.ratingCount || 0 }}人评价</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="country" label="制片国家" width="100" />
        <el-table-column prop="releaseDate" label="上映日期" width="120" />
        <el-table-column label="时长" width="80">
          <template #default="scope">
            {{ scope.row.runtime || 0 }}分钟
          </template>
        </el-table-column>
        <el-table-column label="标签" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.isVip" type="warning" size="small">VIP</el-tag>
            <el-tag v-if="scope.row.isHot" type="danger" size="small" class="ml-1">热门</el-tag>
            <el-tag v-if="scope.row.isRecommended" type="success" size="small" class="ml-1">推荐</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-text="上线"
              inactive-text="下线"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewMovie(scope.row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button size="small" type="primary" @click="handleEditMovie(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteMovie(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
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

    <!-- 电影表单对话框 -->
    <el-dialog
      v-model="movieDialog.visible"
      :title="movieDialog.title"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="movieFormRef"
        :model="movieForm"
        :rules="movieRules"
        label-width="120px"
      >
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
            <el-form-item label="类型(genres)" prop="genres">
              <el-input v-model="movieForm.genres" placeholder="如：科幻,动作,冒险" />
              <small class="form-tip">注意：这是电影类型字段，与分类标签不同</small>
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="IMDb ID" prop="imdbId">
              <el-input v-model="movieForm.imdbId" placeholder="如：tt1630029" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="剧情简介" prop="description">
          <el-input
            v-model="movieForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入剧情简介"
          />
        </el-form-item>

        <!-- 文件上传区域 -->
        <el-card class="upload-section" shadow="never">
          <template #header>
            <span class="upload-title">文件上传</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="电影海报" prop="posterUrl">
                <div class="file-upload-container">
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
                      style="width: 100px; height: 150px; margin-top: 10px"
                      preview-teleported
                    />
                  </div>
                </div>
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="预告片" prop="trailerUrl">
                <div class="file-upload-container">
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
            <div class="file-upload-container">
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

        <!-- 分类标签管理 -->
        <el-form-item label="分类标签">
          <div class="category-tags">
            <el-tag
              v-for="category in movieCategories"
              :key="category.id"
              closable
              @close="removeMovieCategory(category.id)"
              class="mr-2 mb-2"
            >
              {{ category.categoryName || category.category?.name }}
            </el-tag>
            <el-button
              size="small"
              type="primary"
              @click="showCategorySelect = true"
            >
              添加分类标签
            </el-button>
          </div>
          <small class="form-tip">注意：这是分类标签，通过分类服务管理，与电影类型(genres)不同</small>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="movieDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMovie" :loading="movieDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 电影详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="电影详情" width="900px">
      <div v-if="selectedMovie" class="movie-detail">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-image
              v-if="selectedMovie.posterUrl"
              :src="selectedMovie.posterUrl"
              fit="cover"
              style="width: 100%; max-width: 200px"
            />
          </el-col>
          <el-col :span="18">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="电影标题">{{ selectedMovie.title }}</el-descriptions-item>
              <el-descriptions-item label="原始标题">{{ selectedMovie.originalTitle }}</el-descriptions-item>
              <el-descriptions-item label="导演">{{ selectedMovie.director }}</el-descriptions-item>
              <el-descriptions-item label="主演">{{ selectedMovie.actors }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ selectedMovie.genres }}</el-descriptions-item>
              <el-descriptions-item label="制片国家">{{ selectedMovie.country }}</el-descriptions-item>
              <el-descriptions-item label="语言">{{ selectedMovie.language }}</el-descriptions-item>
              <el-descriptions-item label="上映日期">{{ selectedMovie.releaseDate }}</el-descriptions-item>
              <el-descriptions-item label="时长">{{ selectedMovie.runtime }}分钟</el-descriptions-item>
              <el-descriptions-item label="IMDb ID">{{ selectedMovie.imdbId }}</el-descriptions-item>
              <el-descriptions-item label="评分">
                {{ selectedMovie.rating }}分 ({{ selectedMovie.ratingCount }}人评价)
              </el-descriptions-item>
              <el-descriptions-item label="标签">
                <el-tag v-if="selectedMovie.isVip" type="warning" size="small">VIP</el-tag>
                <el-tag v-if="selectedMovie.isHot" type="danger" size="small" class="ml-1">热门</el-tag>
                <el-tag v-if="selectedMovie.isRecommended" type="success" size="small" class="ml-1">推荐</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="mt-3">
              <h4>剧情简介：</h4>
              <p>{{ selectedMovie.description }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分类选择对话框 -->
    <el-dialog v-model="showCategorySelect" title="选择分类标签" width="500px">
      <el-tree
        ref="categoryTreeRef"
        :data="categoryTree"
        show-checkbox
        node-key="id"
        :props="{ children: 'children', label: 'name' }"
        :default-checked-keys="selectedCategoryIds"
      />
      <template #footer>
        <el-button @click="showCategorySelect = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategories">确定</el-button>
      </template>
    </el-dialog>

    <!-- 电影分类查看对话框 -->
    <el-dialog v-model="categoriesDialog.visible" title="电影分类标签" width="600px">
      <div v-if="selectedMovie">
        <p class="mb-4">电影：<strong>{{ selectedMovie.title }}</strong> 的分类标签</p>
        
        <el-table
          :data="movieCategories"
          v-loading="categoriesDialog.loading"
          size="small"
        >
          <el-table-column label="分类名称">
            <template #default="scope">
              {{ scope.row.categoryName || scope.row.category?.name }}
            </template>
          </el-table-column>
          <el-table-column label="分类描述">
            <template #default="scope">
              {{ scope.row.categoryDescription || scope.row.category?.description }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="关联时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="removeMovieCategory(scope.row.categoryId)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4">
          <el-button type="primary" @click="showCategorySelect = true">
            添加分类标签
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="categoriesDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Collection, Search, View, Edit, Delete } from '@element-plus/icons-vue'
import FileUpload from '@/components/FileUpload.vue'
import {
  getMovieList,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieDetail,
  searchMovies
} from '@/api/movie'
import {
  getAllCategories,
  getMovieCategories,
  getMovieCategoriesWithInfo,
  getMovieCategoryCount,
  updateMovieCategoryAssociations,
  removeMovieCategoryAssociation
} from '@/api/category'
import { getCompleteTagIds, getAutoAddedParentInfo, buildCategoryTree } from '@/utils/categoryUtils'

// 响应式数据
const loading = ref(false)
const movieList = ref([])
const allCategories = ref([])
const selectedMovie = ref(null)
const movieCategories = ref([])
const selectedCategoryIds = ref([])
const showCategorySelect = ref(false)
const showCategoryManager = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: '',
  isVip: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 电影表单
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
  runtime: 120,
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

const movieFormRef = ref()
const categoryTreeRef = ref()
const posterUploadRef = ref()
const trailerUploadRef = ref()
const videoUploadRef = ref()

// 表单验证规则
const movieRules = {
  title: [
    { required: true, message: '请输入电影标题', trigger: 'blur' },
    { min: 1, max: 100, message: '电影标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  director: [
    { required: true, message: '请输入导演姓名', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入剧情简介', trigger: 'blur' }
  ]
}

// 对话框状态
const movieDialog = reactive({
  visible: false,
  loading: false,
  title: '新增电影',
  isEdit: false
})

const detailDialog = reactive({
  visible: false
})

const categoriesDialog = reactive({
  visible: false,
  loading: false
})

// 计算属性：分类树
const categoryTree = computed(() => {
  return buildCategoryTree(allCategories.value)
})

// 构建分类树 - 改为使用工具函数
// const buildTree = (categories) => {
//   const tree = []
//   const categoryMap = {}

//   categories.forEach(category => {
//     categoryMap[category.id] = {
//       ...category,
//       children: []
//     }
//   })

//   categories.forEach(category => {
//     if (category.parentId === 0) {
//       tree.push(categoryMap[category.id])
//     } else if (categoryMap[category.parentId]) {
//       categoryMap[category.parentId].children.push(categoryMap[category.id])
//     }
//   })

//   return tree
// }

// 获取电影列表
const fetchMovies = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page, // 页码从1开始
      size: pagination.size,
      ...searchForm
    }

    let response
    if (searchForm.keyword.trim()) {
      response = await searchMovies(searchForm.keyword.trim())
      // 搜索结果需要转换格式以匹配分页结构
      if (Array.isArray(response)) {
        movieList.value = response
        pagination.total = response.length
      } else {
        movieList.value = []
        pagination.total = 0
      }
    } else {
      response = await getMovieList(params)
      // 直接处理Spring Boot分页响应结构
      if (response && response.content) {
        movieList.value = response.content || []
        pagination.total = response.totalElements || 0
      } else {
        movieList.value = []
        pagination.total = 0
      }
    }
    
    // 为每部电影加载分类数量
    //await loadMovieCategoryCounts()
  } catch (error) {
    console.error('获取电影列表失败:', error)
    ElMessage.error('获取电影列表失败')
  } finally {
    loading.value = false
  }
}

// 加载电影分类数量
const loadMovieCategoryCounts = async () => {
  for (const movie of movieList.value) {
    try {
      const response = await getMovieCategoryCount(movie.id)
      if (response && response.code === 200) {
        movie.categoryCount = response.data
      } else if (typeof response === 'number') {
        movie.categoryCount = response
      } else {
        movie.categoryCount = 0
      }
    } catch (error) {
      console.warn(`获取电影 ${movie.id} 的分类数量失败:`, error)
      movie.categoryCount = 0
    }
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getAllCategories()
    if (response && response.code === 200) {
      allCategories.value = response.data || []
    } else if (Array.isArray(response)) {
      allCategories.value = response
    } else {
      allCategories.value = []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  fetchMovies()
}

const handleResetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    categoryId: '',
    isVip: '',
    status: ''
  })
  pagination.page = 1
  fetchMovies()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.size = val
  pagination.page = 1
  fetchMovies()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchMovies()
}

// 新增电影
const handleAddMovie = () => {
  resetMovieForm()
  movieDialog.title = '新增电影'
  movieDialog.isEdit = false
  movieDialog.visible = true
  movieCategories.value = []
}

// 编辑电影
const handleEditMovie = async (movie) => {
  selectedMovie.value = movie
  
  // 获取电影详情
  try {
    const response = await getMovieDetail(movie.id)
    if (response && response.code === 200) {
      const movieData = response.data
      Object.assign(movieForm, movieData)
      movieForm.id = movieData.id
    } else if (response && response.id) {
      // 直接返回电影数据
      Object.assign(movieForm, response)
      movieForm.id = response.id
    }
  } catch (error) {
    console.error('获取电影详情失败:', error)
  }

  // 获取电影分类
  await loadMovieCategories(movie.id)
  
  movieDialog.title = '编辑电影'
  movieDialog.isEdit = true
  movieDialog.visible = true
}

// 查看电影详情
const handleViewMovie = async (movie) => {
  try {
    const response = await getMovieDetail(movie.id)
    if (response && response.code === 200) {
      selectedMovie.value = response.data
      detailDialog.visible = true
    } else if (response && response.id) {
      selectedMovie.value = response
      detailDialog.visible = true
    }
  } catch (error) {
    console.error('获取电影详情失败:', error)
    ElMessage.error('获取电影详情失败')
  }
}

// 删除电影
const handleDeleteMovie = async (movie) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除电影 "${movie.title}" 吗？删除后无法恢复！`, 
      '删除电影', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deleteMovie(movie.id)
    
    if (response && response.code === 200) {
      ElMessage.success('电影删除成功')
      fetchMovies()
    } else if (response === '' || response === null || response === undefined) {
      // 删除成功，没有返回内容
      ElMessage.success('电影删除成功')
      fetchMovies()
    } else {
      ElMessage.error(response?.message || '电影删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除电影失败:', error)
      ElMessage.error('删除电影失败')
    }
  }
}

// 切换电影状态
const handleStatusChange = async (movie) => {
  try {
    const response = await updateMovie(movie.id, { status: movie.status })
    
    if (response && response.code === 200) {
      ElMessage.success(`电影已${movie.status === 1 ? '上线' : '下线'}`)
    } else if (response && response.id) {
      // 直接返回更新后的电影数据
      ElMessage.success(`电影已${movie.status === 1 ? '上线' : '下线'}`)
    } else {
      movie.status = movie.status === 1 ? 0 : 1
      ElMessage.error(response?.message || '状态更新失败')
    }
  } catch (error) {
    movie.status = movie.status === 1 ? 0 : 1
    console.error('更新电影状态失败:', error)
    ElMessage.error('更新电影状态失败')
  }
}

// 提交电影表单
const handleSubmitMovie = async () => {
  if (!movieFormRef.value) return

  try {
    const valid = await movieFormRef.value.validate()
    if (!valid) return

    movieDialog.loading = true

    let response
    if (movieDialog.isEdit) {
      response = await updateMovie(movieForm.id, movieForm)
    } else {
      response = await createMovie(movieForm)
    }

    if (response && response.code === 200) {
      ElMessage.success(movieDialog.isEdit ? '电影更新成功' : '电影创建成功')
      
      // 如果有分类标签，更新分类关联
      if (movieCategories.value.length > 0) {
        const movieId = movieDialog.isEdit ? movieForm.id : response.data.id
        const categoryIds = movieCategories.value.map(cat => cat.categoryId || cat.id)
        await updateMovieCategoryAssociations(movieId, categoryIds)
      }
      
      movieDialog.visible = false
      fetchMovies()
    } else if (response && response.id) {
      // 直接返回电影数据
      ElMessage.success(movieDialog.isEdit ? '电影更新成功' : '电影创建成功')
      
      // 如果有分类标签，更新分类关联
      if (movieCategories.value.length > 0) {
        const movieId = movieDialog.isEdit ? movieForm.id : response.id
        const categoryIds = movieCategories.value.map(cat => cat.categoryId || cat.id)
        await updateMovieCategoryAssociations(movieId, categoryIds)
      }
      
      movieDialog.visible = false
      fetchMovies()
    } else {
      ElMessage.error(response?.message || (movieDialog.isEdit ? '电影更新失败' : '电影创建失败'))
    }
  } catch (error) {
    console.error('提交电影失败:', error)
    ElMessage.error('提交电影失败')
  } finally {
    movieDialog.loading = false
  }
}

// 重置电影表单
const resetMovieForm = () => {
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
    runtime: 120,
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
  
  // 清空文件上传组件
  posterUploadRef.value?.clearFiles()
  trailerUploadRef.value?.clearFiles()
  videoUploadRef.value?.clearFiles()
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

// 查看电影分类
const handleViewCategories = async (movie) => {
  selectedMovie.value = movie
  await loadMovieCategories(movie.id)
  categoriesDialog.visible = true
}

// 加载电影分类 - 使用安全接口避免序列化错误
const loadMovieCategories = async (movieId) => {
  try {
    categoriesDialog.loading = true
    const response = await getMovieCategoriesWithInfo(movieId)
    if (response && response.code === 200) {
      movieCategories.value = response.data || []
      selectedCategoryIds.value = movieCategories.value.map(cat => cat.categoryId)
    } else if (Array.isArray(response)) {
      movieCategories.value = response
      selectedCategoryIds.value = movieCategories.value.map(cat => cat.categoryId || cat.id)
    } else {
      movieCategories.value = []
      selectedCategoryIds.value = []
    }
  } catch (error) {
    console.error('获取电影分类失败:', error)
    ElMessage.error('获取电影分类失败')
  } finally {
    categoriesDialog.loading = false
  }
}

// 添加分类标签
const handleAddCategories = async () => {
  const checkedNodes = categoryTreeRef.value.getCheckedNodes()
  const selectedCategoryIds = checkedNodes.map(node => node.id)
  
  if (selectedCategoryIds.length === 0) {
    ElMessage.warning('请选择要添加的分类标签')
    return
  }

  // 使用工具函数获取包含父分类的完整分类ID列表
  const completeTagIds = getCompleteTagIds(selectedCategoryIds, allCategories.value)
  
  // 使用工具函数获取自动添加的父分类信息
  const autoAddedInfo = getAutoAddedParentInfo(selectedCategoryIds, completeTagIds, allCategories.value)
  
  if (autoAddedInfo.names.length > 0) {
    ElMessage.info(`系统已自动添加父分类: ${autoAddedInfo.names.join(', ')}`)
  }

  try {
    const movieId = selectedMovie.value?.id || movieForm.id
    if (movieId) {
      // 合并现有分类和新选择的分类
      const existingIds = movieCategories.value.map(cat => cat.categoryId || cat.id)
      const allCategoryIds = [...new Set([...existingIds, ...completeTagIds])]
      
      const response = await updateMovieCategoryAssociations(movieId, allCategoryIds)
      if (response && response.code === 200) {
        ElMessage.success('分类标签添加成功')
        await loadMovieCategories(movieId)
        showCategorySelect.value = false
        fetchMovies() // 刷新列表以更新计数
      } else if (response === '' || response === null || response === undefined) {
        // 操作成功，没有返回内容
        ElMessage.success('分类标签添加成功')
        await loadMovieCategories(movieId)
        showCategorySelect.value = false
        fetchMovies() // 刷新列表以更新计数
      }
    } else {
      // 新增电影时，先保存到临时数组
      completeTagIds.forEach(id => {
        if (!movieCategories.value.some(cat => (cat.categoryId || cat.id) === id)) {
          const category = allCategories.value.find(cat => cat.id === id)
          if (category) {
            movieCategories.value.push({
              categoryId: id,
              category: category
            })
          }
        }
      })
      showCategorySelect.value = false
      ElMessage.success('分类标签已选择，保存电影时生效')
    }
  } catch (error) {
    console.error('添加分类标签失败:', error)
    ElMessage.error('添加分类标签失败')
  }
}

// 移除电影分类
const removeMovieCategory = async (categoryId) => {
  try {
    const movieId = selectedMovie.value?.id || movieForm.id
    if (movieId) {
      const response = await removeMovieCategoryAssociation(movieId, categoryId)
      if (response && response.code === 200) {
        ElMessage.success('分类标签移除成功')
        await loadMovieCategories(movieId)
        fetchMovies() // 刷新列表以更新计数
      } else if (response === '' || response === null || response === undefined) {
        // 操作成功，没有返回内容
        ElMessage.success('分类标签移除成功')
        await loadMovieCategories(movieId)
        fetchMovies() // 刷新列表以更新计数
      }
    } else {
      // 新增电影时，从临时数组中移除
      movieCategories.value = movieCategories.value.filter(cat => 
        (cat.categoryId || cat.id) !== categoryId
      )
      ElMessage.success('分类标签已移除')
    }
  } catch (error) {
    console.error('移除分类标签失败:', error)
    ElMessage.error('移除分类标签失败')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMovies()
  fetchCategories()
})
</script>

<style scoped>
.movie-list {
  padding: 20px;
}

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
.header-actions {
  display: flex;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
    padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.no-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 75px;
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
  font-size: 12px;
  color: #999;
}

.rating-info {
    text-align: center;
  margin-top: 4px;
}

.category-tags {
  min-height: 40px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.2;
}

.upload-section {
  margin: 20px 0;
}

.upload-section .upload-title {
  font-weight: 600;
  color: #303133;
}

.file-upload-container .preview-container {
  margin-top: 10px;
  text-align: center;
}

.movie-detail {
  padding: 10px 0;
}

.mr-1 {
  margin-right: 4px;
}

.mb-1 {
  margin-bottom: 4px;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.ml-1 {
  margin-left: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-3 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 16px;
}
</style> 