<template>
  <div class="review-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>影评管理</span>
          <div class="header-actions">
            <el-button 
              type="success" 
              :icon="Check" 
              :disabled="!selectedComments.length"
              @click="handleBatchAudit('approved')"
            >
              批量通过
            </el-button>
            <el-button 
              type="warning" 
              :icon="Close" 
              :disabled="!selectedComments.length"
              @click="handleBatchAudit('rejected')"
            >
              批量拒绝
            </el-button>
            <el-button 
              type="danger" 
              :icon="Delete" 
              :disabled="!selectedComments.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索筛选区域 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索评论内容或用户名"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.status"
              placeholder="审核状态"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.sort"
              placeholder="排序方式"
            >
              <el-option label="按时间排序" value="time" />
              <el-option label="按热度排序" value="hot" />
              <el-option label="按评分排序" value="rating" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 统计信息 -->
      <div class="statistics-section" v-if="statistics">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="总评论数">
            <el-tag type="info">{{ statistics.total || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="待审核">
            <el-tag type="warning">{{ statistics.pending || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已通过">
            <el-tag type="success">{{ statistics.approved || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已拒绝">
            <el-tag type="danger">{{ statistics.rejected || 0 }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 评论树状列表 -->
      <div class="tree-section">
        <div class="tree-header">
          <el-checkbox 
            v-model="selectAll" 
            @change="handleSelectAll"
            :indeterminate="isIndeterminate"
          >
            全选
          </el-checkbox>
          <span class="selected-count" v-if="selectedComments.length">
            已选择 {{ selectedComments.length }} 条评论
          </span>
        </div>

        <div 
          v-if="loading" 
          class="loading-section"
          v-loading="loading"
          element-loading-text="加载中..."
        >
          <div style="height: 200px;"></div>
        </div>

        <div v-else-if="!commentList.length" class="empty-section">
          <el-empty description="暂无评论数据" />
        </div>

        <div v-else class="comment-tree">
          <div 
            v-for="comment in commentList" 
            :key="comment.id"
            class="comment-tree-item"
          >
            <!-- 父评论 -->
            <div class="parent-comment">
              <el-card shadow="hover" class="comment-card">
                <div class="comment-item-content">
                  <div class="comment-checkbox">
                    <el-checkbox 
                      :model-value="isCommentSelected(comment.id)"
                      @change="(checked) => handleCommentSelect(comment, checked)"
                    />
                  </div>

                  <div class="comment-info">
                    <div class="comment-header">
                      <div class="user-info">
                        <el-avatar 
                          :src="comment.userAvatar" 
                          :size="32"
                          :icon="User"
                        />
                        <div class="user-details">
                          <div class="username">{{ comment.username || '匿名用户' }}</div>
                          <div class="user-id">ID: {{ comment.userId }}</div>
                        </div>
                      </div>

                      <div class="movie-info">
                        <el-image
                          :src="comment.moviePoster"
                          fit="cover"
                          style="width: 40px; height: 60px;"
                        >
                          <template #error>
                            <div class="image-slot">
                              <el-icon><Picture /></el-icon>
                            </div>
                          </template>
                        </el-image>
                        <div class="movie-details">
                          <div class="movie-title">{{ comment.movieTitle }}</div>
                          <div class="movie-id">电影ID: {{ comment.movieId }}</div>
                        </div>
                      </div>

                      <div class="comment-status">
                        <el-tag
                          :type="getStatusType(comment.status)"
                          size="small"
                        >
                          {{ getStatusText(comment.status) }}
                        </el-tag>
                      </div>
                    </div>

                    <div class="comment-content">
                      <div class="rating-stars" v-if="comment.rating">
                        <el-rate
                          :model-value="comment.rating"
                          disabled
                          show-score
                          text-color="#ff9900"
                          score-template="{value} 分"
                        />
                      </div>
                      <div class="content-text">{{ comment.content }}</div>
                      <div class="content-meta">
                        <el-tag size="small" :icon="Like">{{ comment.likeCount || 0 }}</el-tag>
                        <el-tag size="small" type="info" :icon="DislikeOutlined">{{ comment.dislikeCount || 0 }}</el-tag>
                        <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                      </div>
                    </div>

                    <div class="comment-actions">
                      <el-button 
                        size="small" 
                        :icon="View" 
                        @click="handleViewDetail(comment)"
                      >
                        详情
                      </el-button>
                      
                      <el-dropdown trigger="click" @command="(command) => handleAction(command, comment)">
                        <el-button size="small" type="primary">
                          操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item 
                              command="approve" 
                              :icon="Check"
                              v-if="comment.status === 0 || comment.status === 'pending'"
                            >
                              通过审核
                            </el-dropdown-item>
                            <el-dropdown-item 
                              command="reject" 
                              :icon="Close"
                              v-if="comment.status === 0 || comment.status === 'pending'"
                            >
                              拒绝审核
                            </el-dropdown-item>
                            <el-dropdown-item 
                              command="like" 
                              :icon="Like"
                            >
                              点赞 ({{ comment.likeCount || 0 }})
                            </el-dropdown-item>
                            <el-dropdown-item 
                              command="report" 
                              :icon="Warning"
                            >
                              举报处理
                            </el-dropdown-item>
                            <el-dropdown-item 
                              command="delete" 
                              :icon="Delete"
                              divided
                            >
                              删除评论
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </el-card>

              <!-- 子评论（回复） -->
              <div v-if="comment.replies && comment.replies.length" class="replies-section">
                <div class="replies-header">
                  <el-divider>
                    <el-icon><ChatLineRound /></el-icon>
                    {{ comment.replies.length }} 条回复
                  </el-divider>
                </div>
                
                <div 
                  v-for="reply in comment.replies" 
                  :key="reply.id"
                  class="reply-item"
                >
                  <el-card shadow="hover" class="reply-card">
                    <div class="comment-item-content">
                      <div class="comment-checkbox">
                        <el-checkbox 
                          :model-value="isCommentSelected(reply.id)"
                          @change="(checked) => handleCommentSelect(reply, checked, comment.id)"
                        />
                      </div>

                      <div class="comment-info">
                        <div class="comment-header">
                          <div class="user-info">
                            <el-avatar 
                              :src="reply.userAvatar" 
                              :size="24"
                              :icon="User"
                            />
                            <div class="user-details">
                              <div class="username">{{ reply.username || '匿名用户' }}</div>
                              <div class="reply-to">回复 @{{ comment.username }}</div>
                            </div>
                          </div>

                          <div class="comment-status">
                            <el-tag
                              :type="getStatusType(reply.status)"
                              size="small"
                            >
                              {{ getStatusText(reply.status) }}
                            </el-tag>
                          </div>
                        </div>

                        <div class="comment-content">
                          <div class="content-text">{{ reply.content }}</div>
                          <div class="content-meta">
                            <el-tag size="small" :icon="Like">{{ reply.likeCount || 0 }}</el-tag>
                            <el-tag size="small" type="info" :icon="DislikeOutlined">{{ reply.dislikeCount || 0 }}</el-tag>
                            <span class="comment-time">{{ formatTime(reply.createTime) }}</span>
                          </div>
                        </div>

                        <div class="comment-actions">
                          <el-button 
                            size="small" 
                            :icon="View" 
                            @click="handleViewDetail(reply)"
                          >
                            详情
                          </el-button>
                          
                          <el-dropdown trigger="click" @command="(command) => handleAction(command, reply, comment.id)">
                            <el-button size="small" type="primary">
                              操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                            </el-button>
                            <template #dropdown>
                              <el-dropdown-menu>
                                <el-dropdown-item 
                                  command="approve" 
                                  :icon="Check"
                                  v-if="reply.status === 0 || reply.status === 'pending'"
                                >
                                  通过审核
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  command="reject" 
                                  :icon="Close"
                                  v-if="reply.status === 0 || reply.status === 'pending'"
                                >
                                  拒绝审核
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  command="like" 
                                  :icon="Like"
                                >
                                  点赞 ({{ reply.likeCount || 0 }})
                                </el-dropdown-item>
                                <el-dropdown-item 
                                  command="delete" 
                                  :icon="Delete"
                                  divided
                                >
                                  删除回复
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </template>
                          </el-dropdown>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 评论详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="评论详情"
      width="800px"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentComment" class="comment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="评论ID">{{ currentComment.id }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentComment.username }}</el-descriptions-item>
          <el-descriptions-item label="电影">{{ currentComment.movieTitle }}</el-descriptions-item>
          <el-descriptions-item label="父评论ID" v-if="currentComment.parentId">{{ currentComment.parentId }}</el-descriptions-item>
          <el-descriptions-item label="评分" v-if="currentComment.rating">
            <el-rate :model-value="currentComment.rating" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <el-tag :type="getStatusType(currentComment.status)">
              {{ getStatusText(currentComment.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatTime(currentComment.createTime) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="comment-content-detail">
          <h4>评论内容：</h4>
          <div class="content-box">{{ currentComment.content }}</div>
        </div>

        <div class="comment-stats">
          <el-statistic title="获赞数" :value="currentComment.likeCount || 0" />
          <el-statistic title="踩数" :value="currentComment.dislikeCount || 0" />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            type="success" 
            v-if="currentComment && (currentComment.status === 0 || currentComment.status === 'pending')"
            @click="handleSingleAudit(currentComment.id, 'approved')"
          >
            通过审核
          </el-button>
          <el-button 
            type="warning"
            v-if="currentComment && (currentComment.status === 0 || currentComment.status === 'pending')"
            @click="handleSingleAudit(currentComment.id, 'rejected')"
          >
            拒绝审核
          </el-button>
          <el-button 
            type="danger"
            @click="handleSingleDelete(currentComment.id)"
          >
            删除评论
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Check, Close, Delete, View, Like, Warning, User, Picture, ArrowDown, ChatLineRound
} from '@element-plus/icons-vue'
import {
  getAllComments,
  deleteComment,
  batchDeleteComments,
  auditComment,
  batchAuditComments,
  getCommentStatistics,
  likeComment,
  reportComment
} from '@/api/comment'
import { getUserInfo } from '@/api/user'
import { getMovieDetail } from '@/api/movie'

// DislikeOutlined 图标组件
const DislikeOutlined = {
  render() {
    return h('svg', {
      viewBox: '0 0 1024 1024',
      width: '1em',
      height: '1em',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M885.9 533.7c16.8-22.2 26.1-49.4 26.1-77.7 0-44.9-25.1-87.4-65.5-111.1a67.67 67.67 0 0 0-34.3-9.3H572.4l6-122.9c1.4-29.7-9.1-57.9-29.5-79.4A106.62 106.62 0 0 0 471 99.9c-52 0-98 35-111.8 85.1l-85.9 311H144c-17.7 0-32 14.3-32 32v364c0 17.7 14.3 32 32 32h601.3c9.2 0 18.2-1.8 26.8-5.4 99.3-41.3 180.7-126 214.6-223.7l1.9-5.4c11.9-33.6 11.9-71.4-.7-104.8zM184 872V536h81v336h-81zm636.4-353l-1.9 5.4c-29.5 82.8-102.4 151.6-183.9 184H360V536.5l99.4-360.5c4.2-15.2 17.7-25.9 33.5-25.9 16.2 0 32.1 13.1 35.3 29.1l18.4 373.7h255.7c2.8 0 5.5 1.4 7.1 3.7 1.6 2.4 1.9 5.3.5 7.9z'
      })
    ])
  }
}

export default {
  name: 'ReviewManagement',
  components: {
    Search, 
    Refresh, 
    Check, 
    Close, 
    Delete, 
    View, 
    Like, 
    Warning, 
    User, 
    Picture, 
    ArrowDown, 
    DislikeOutlined,
    ChatLineRound
  },
  setup() {
    const loading = ref(false)
    const commentList = ref([])
    const selectedComments = ref([])
    const detailDialogVisible = ref(false)
    const currentComment = ref(null)
    const statistics = ref(null)
    const selectAll = ref(false)
    const isIndeterminate = ref(false)

    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      status: '',
      sort: 'time'
    })

    // 分页参数
    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    // 批量获取用户信息和电影信息并合并到评论数据中
    const enrichCommentsWithUserInfo = async (comments) => {
      if (!comments || comments.length === 0) {
        return []
      }
      
      try {
        // 收集所有唯一的用户ID和电影ID
        const userIds = [...new Set(comments.map(comment => comment.userId).filter(id => id))]
        const movieIds = [...new Set(comments.map(comment => comment.movieId).filter(id => id))]
        
        // 批量获取用户信息
        const userInfoPromises = userIds.map(async (userId) => {
          try {
            const userResponse = await getUserInfo(userId)
            // 处理用户信息响应格式
            let userInfo = null
            if (userResponse) {
              if (userResponse.code === 200 && userResponse.data) {
                userInfo = userResponse.data
              } else if (userResponse.data) {
                userInfo = userResponse.data
              } else if (userResponse.id) {
                userInfo = userResponse
              }
            }
            
            return {
              userId,
              username: userInfo?.username || userInfo?.name || '匿名用户',
              userAvatar: userInfo?.avatar || userInfo?.avatarUrl || '',
              userEmail: userInfo?.email || '',
              userVipType: userInfo?.vipType || 0
            }
          } catch (error) {
            console.warn(`获取用户${userId}信息失败:`, error)
            return {
              userId,
              username: '匿名用户',
              userAvatar: '',
              userEmail: '',
              userVipType: 0
            }
          }
        })
        
        // 批量获取电影信息
        const movieInfoPromises = movieIds.map(async (movieId) => {
          try {
            const movieResponse = await getMovieDetail(movieId)
            // 处理电影信息响应格式
            let movieInfo = null
            if (movieResponse) {
              if (movieResponse.code === 200 && movieResponse.data) {
                movieInfo = movieResponse.data
              } else if (movieResponse.data) {
                movieInfo = movieResponse.data
              } else if (movieResponse.id) {
                movieInfo = movieResponse
              }
            }
            
            return {
              movieId,
              movieTitle: movieInfo?.title || movieInfo?.name || '未知电影',
              moviePoster: movieInfo?.poster || movieInfo?.posterUrl || movieInfo?.image || '',
              movieDescription: movieInfo?.description || movieInfo?.summary || '',
              movieRating: movieInfo?.rating || 0,
              movieYear: movieInfo?.year || movieInfo?.releaseYear || ''
            }
          } catch (error) {
            console.warn(`获取电影${movieId}信息失败:`, error)
            return {
              movieId,
              movieTitle: '未知电影',
              moviePoster: '',
              movieDescription: '',
              movieRating: 0,
              movieYear: ''
            }
          }
        })
        
        // 等待所有请求完成
        const [userInfoList, movieInfoList] = await Promise.all([
          Promise.all(userInfoPromises),
          Promise.all(movieInfoPromises)
        ])
        
        // 创建用户信息映射
        const userInfoMap = new Map()
        userInfoList.forEach(userInfo => {
          userInfoMap.set(userInfo.userId, userInfo)
        })
        
        // 创建电影信息映射
        const movieInfoMap = new Map()
        movieInfoList.forEach(movieInfo => {
          movieInfoMap.set(movieInfo.movieId, movieInfo)
        })
        
        // 将用户信息和电影信息合并到评论数据中
        const enrichedComments = comments.map(comment => {
          const userInfo = userInfoMap.get(comment.userId) || {
            userId: comment.userId,
            username: '匿名用户',
            userAvatar: '',
            userEmail: '',
            userVipType: 0
          }
          
          const movieInfo = movieInfoMap.get(comment.movieId) || {
            movieId: comment.movieId,
            movieTitle: '未知电影',
            moviePoster: '',
            movieDescription: '',
            movieRating: 0,
            movieYear: ''
          }
          
          return {
            ...comment,
            // 用户信息
            username: userInfo.username,
            userAvatar: userInfo.userAvatar,
            userEmail: userInfo.userEmail,
            userVipType: userInfo.userVipType,
            // 电影信息
            movieTitle: movieInfo.movieTitle,
            moviePoster: movieInfo.moviePoster,
            movieDescription: movieInfo.movieDescription,
            movieRating: movieInfo.movieRating,
            movieYear: movieInfo.movieYear
          }
        })
        
        console.log('信息合并完成，评论数量:', enrichedComments.length, '用户数量:', userIds.length, '电影数量:', movieIds.length)
        return enrichedComments
        
      } catch (error) {
        console.error('批量获取信息失败:', error)
        // 返回原始评论数据，但添加默认信息
        return comments.map(comment => ({
          ...comment,
          // 默认用户信息
          username: '匿名用户',
          userAvatar: '',
          userEmail: '',
          userVipType: 0,
          // 默认电影信息
          movieTitle: '未知电影',
          moviePoster: '',
          movieDescription: '',
          movieRating: 0,
          movieYear: ''
        }))
      }
    }

    // 获取评论列表
    const fetchCommentList = async () => {
      try {
        loading.value = true
        
        const params = {
          page: pagination.page,
          size: pagination.size,
          sort: searchForm.sort,
          keyword: searchForm.keyword,
          status: searchForm.status
        }
        
        const response = await getAllComments(params)
        
        // 处理多种响应格式
        if (response) {
          let data = null
          
          // 标准API响应格式: {code: 200, data: {...}}
          if (response.code === 200 && response.data) {
            data = response.data
          }
          // 直接响应格式: {data: {...}}
          else if (response.data) {
            data = response.data
          }
          // Spring Boot分页响应格式: {content: [...], totalElements: ...}
          else if (response.content && Array.isArray(response.content)) {
            data = response
          }
          // 直接数组格式: [...]
          else if (Array.isArray(response)) {
            data = response
          }
          
          if (data) {
            let comments = []
            
            // 分页数据格式
            if (data.content && Array.isArray(data.content)) {
              comments = data.content
              pagination.total = data.totalElements || 0
            }
            // 直接数组格式
            else if (Array.isArray(data)) {
              comments = data
              pagination.total = data.length
            }
            else {
              comments = []
              pagination.total = 0
            }
            
            // 批量获取用户信息并合并到评论数据中
            const commentsWithUserInfo = await enrichCommentsWithUserInfo(comments)
            
            // 构建树状结构
            commentList.value = buildCommentTree(commentsWithUserInfo)
          } else {
            commentList.value = []
            pagination.total = 0
          }
        } else {
          commentList.value = []
          pagination.total = 0
        }
      } catch (error) {
        console.error('获取评论列表失败:', error)
        ElMessage.error('获取评论列表失败')
        commentList.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    // 构建评论树状结构
    const buildCommentTree = (comments) => {
      console.log('构建评论树状结构，输入评论数量:', comments.length)
      
      // 分离父评论和回复
      const parentComments = []
      const repliesMap = new Map()
      
      // 第一遍遍历，收集回复并按父评论ID分组
      comments.forEach(comment => {
        if (comment.parentId && comment.parentId !== 0) {
          // 这是一个回复
          if (!repliesMap.has(comment.parentId)) {
            repliesMap.set(comment.parentId, [])
          }
          repliesMap.get(comment.parentId).push(comment)
        }
      })
      
      // 第二遍遍历，构建父评论并附加回复
      comments.forEach(comment => {
        if (!comment.parentId || comment.parentId === 0) {
          // 这是一个父评论
          const replies = repliesMap.get(comment.id) || []
          
          // 按时间排序回复
          replies.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          
          parentComments.push({
            ...comment,
            replies: replies
          })
        }
      })
      
      // 按时间排序父评论
      parentComments.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      
      console.log('构建完成，父评论数量:', parentComments.length, '回复映射大小:', repliesMap.size)
      
      return parentComments
    }

    // 获取统计信息
    const fetchStatistics = async () => {
      try {
        const response = await getCommentStatistics()
        
        // 处理多种响应格式
        let data = null
        if (response) {
          // 标准API响应格式
          if (response.code === 200 && response.data) {
            data = response.data
          }
          // 直接响应格式
          else if (response.data) {
            data = response.data
          }
          // 直接数据格式
          else if (response.total !== undefined) {
            data = response
          }
        }
        
        if (data && typeof data === 'object') {
          statistics.value = data
        } else {
          statistics.value = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          }
        }
      } catch (error) {
        console.error('获取统计信息失败:', error)
        ElMessage.error('获取统计信息失败')
        statistics.value = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      fetchCommentList()
    }

    // 重置
    const handleReset = () => {
      searchForm.keyword = ''
      searchForm.status = ''
      searchForm.sort = 'time'
      pagination.page = 1
      selectedComments.value = []
      selectAll.value = false
      isIndeterminate.value = false
      fetchCommentList()
    }

    // 选择改变
    const handleSelectionChange = (selection) => {
      selectedComments.value = selection
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      fetchCommentList()
    }

    // 页码改变
    const handlePageChange = (page) => {
      pagination.page = page
      fetchCommentList()
    }

    // 查看详情
    const handleViewDetail = (row) => {
      currentComment.value = row
      detailDialogVisible.value = true
    }

    // 关闭详情对话框
    const handleCloseDetail = () => {
      detailDialogVisible.value = false
      currentComment.value = null
    }

    // 单个审核
    const handleSingleAudit = async (id, status) => {
      try {
        await auditComment(id, status)
        ElMessage.success(`评论${status === 'approved' ? '通过' : '拒绝'}成功`)
        fetchCommentList()
        fetchStatistics()
        if (detailDialogVisible.value) {
          detailDialogVisible.value = false
        }
      } catch (error) {
        console.error('审核失败:', error)
        ElMessage.error('审核失败')
      }
    }

    // 批量审核
    const handleBatchAudit = async (status) => {
      if (!selectedComments.value.length) {
        ElMessage.warning('请选择要审核的评论')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要${status === 'approved' ? '通过' : '拒绝'}选中的${selectedComments.value.length}条评论吗？`,
          '批量审核确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = selectedComments.value.map(item => item.id)
        console.log('批量审核参数详情:', JSON.stringify({ ids, status }, null, 2))
        console.log('选中的评论详情:', JSON.stringify(selectedComments.value, null, 2))
        console.log('评论ID数组:', ids)
        console.log('审核状态:', status)
        
        await batchAuditComments(ids, status)
        
        ElMessage.success(`批量${status === 'approved' ? '通过' : '拒绝'}成功`)
        fetchCommentList()
        fetchStatistics()
        selectedComments.value = []
        selectAll.value = false
        isIndeterminate.value = false
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量审核失败:', error)
          console.error('错误详情:', error.response?.data)
          ElMessage.error('批量审核失败')
        }
      }
    }

    // 单个删除
    const handleSingleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评论吗？', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await deleteComment(id)
        ElMessage.success('删除成功')
        fetchCommentList()
        fetchStatistics()
        if (detailDialogVisible.value) {
          detailDialogVisible.value = false
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 批量删除
    const handleBatchDelete = async () => {
      if (!selectedComments.value.length) {
        ElMessage.warning('请选择要删除的评论')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除选中的${selectedComments.value.length}条评论吗？`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = selectedComments.value.map(item => item.id)
        await batchDeleteComments(ids)
        
        ElMessage.success('批量删除成功')
        fetchCommentList()
        fetchStatistics()
        selectedComments.value = []
        selectAll.value = false
        isIndeterminate.value = false
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 处理操作
    const handleAction = async (command, row) => {
      switch (command) {
        case 'approve':
          await handleSingleAudit(row.id, 'approved')
          break
        case 'reject':
          await handleSingleAudit(row.id, 'rejected')
          break
        case 'like':
          try {
            await likeComment(row.id)
            ElMessage.success('点赞成功')
            fetchCommentList()
          } catch (error) {
            ElMessage.error('点赞失败')
          }
          break
        case 'report':
          try {
            await ElMessageBox.prompt('请输入举报原因', '举报处理', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            })
            // 这里可以处理举报逻辑
            ElMessage.success('举报处理成功')
          } catch (error) {
            if (error !== 'cancel') {
              ElMessage.error('举报处理失败')
            }
          }
          break
        case 'delete':
          await handleSingleDelete(row.id)
          break
      }
    }

    // 获取状态类型
    const getStatusType = (status) => {
      // 兼容数字和字符串格式
      const statusMap = {
        0: 'warning',          // 待审核
        1: 'success',          // 已通过
        2: 'danger',           // 已拒绝
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      }
      return statusMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      // 兼容数字和字符串格式
      const statusMap = {
        0: '待审核',           // pending
        1: '已通过',           // approved
        2: '已拒绝',           // rejected
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return statusMap[status] || '未知'
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return '--'
      return new Date(time).toLocaleString('zh-CN')
    }

    // 选择所有评论
    const handleSelectAll = () => {
      if (selectAll.value) {
        selectedComments.value = []
        // 遍历所有父评论和子评论
        commentList.value.forEach(parentComment => {
          selectedComments.value.push({ ...parentComment, isParent: true })
          if (parentComment.replies && parentComment.replies.length > 0) {
            parentComment.replies.forEach(reply => {
              selectedComments.value.push({ ...reply, parentId: parentComment.id, isReply: true })
            })
          }
        })
      } else {
        selectedComments.value = []
      }
      isIndeterminate.value = false
    }

    // 判断评论是否被选中
    const isCommentSelected = (id) => {
      return selectedComments.value.some(item => item.id === id)
    }

    // 处理评论选择
    const handleCommentSelect = (comment, checked, parentId) => {
      if (checked) {
        const commentData = { 
          ...comment, 
          isParent: !parentId,
          isReply: !!parentId
        }
        if (parentId) {
          commentData.parentId = parentId
        }
        selectedComments.value.push(commentData)
      } else {
        selectedComments.value = selectedComments.value.filter(item => item.id !== comment.id)
      }
      
      // 计算总的评论数量（父评论 + 回复）
      const totalComments = commentList.value.reduce((total, parent) => {
        return total + 1 + (parent.replies ? parent.replies.length : 0)
      }, 0)
      
      // 更新选择状态
      if (selectedComments.value.length === 0) {
        selectAll.value = false
        isIndeterminate.value = false
      } else if (selectedComments.value.length === totalComments) {
        selectAll.value = true
        isIndeterminate.value = false
      } else {
        selectAll.value = false
        isIndeterminate.value = true
      }
    }

    // 页面加载
    onMounted(() => {
      fetchCommentList()
      fetchStatistics()
    })

    return {
      loading,
      commentList,
      selectedComments,
      detailDialogVisible,
      currentComment,
      statistics,
      searchForm,
      pagination,
      handleSearch,
      handleReset,
      handleSelectionChange,
      handleSizeChange,
      handlePageChange,
      handleViewDetail,
      handleCloseDetail,
      handleSingleAudit,
      handleBatchAudit,
      handleSingleDelete,
      handleBatchDelete,
      handleAction,
      getStatusType,
      getStatusText,
      formatTime,
      selectAll,
      isIndeterminate,
      handleSelectAll,
      isCommentSelected,
      handleCommentSelect,
      // 图标
      Search,
      Refresh,
      Check,
      Close,
      Delete,
      View,
      Like,
      Warning,
      User,
      Picture,
      ArrowDown,
      DislikeOutlined,
      ChatLineRound
    }
  }
}
</script>

<style lang="scss" scoped>
.review-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      .el-button {
        margin-left: 10px;
      }
    }
  }
  
  .search-section {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }
  
  .statistics-section {
    margin-bottom: 20px;
  }
  
  .tree-section {
    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .el-checkbox {
        margin-right: 10px;
      }
      
      .selected-count {
        color: #909399;
      }
    }
    
    .loading-section {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
    .empty-section {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
         .comment-tree {
       .comment-tree-item {
         margin-bottom: 20px;
         
         .parent-comment {
           .comment-card {
             border: 2px solid #e4e7ed;
             border-radius: 8px;
             transition: all 0.3s ease;
             
             &:hover {
               border-color: #409eff;
               box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
             }
             
             .comment-item-content {
               display: flex;
               align-items: flex-start;
               padding: 16px;
               
               .comment-checkbox {
                 margin-right: 12px;
                 margin-top: 4px;
               }
               
               .comment-info {
                 flex: 1;
                 
                 .comment-header {
                   display: flex;
                   justify-content: space-between;
                   align-items: center;
                   margin-bottom: 12px;
                   flex-wrap: wrap;
                   gap: 10px;
                   
                   .user-info {
                     display: flex;
                     align-items: center;
                     
                     .el-avatar {
                       margin-right: 8px;
                     }
                     
                     .user-details {
                       .username {
                         font-weight: 600;
                         color: #303133;
                         margin-bottom: 2px;
                       }
                       
                       .user-id {
                         font-size: 12px;
                         color: #909399;
                       }
                     }
                   }
                   
                   .movie-info {
                     display: flex;
                     align-items: center;
                     
                     .el-image {
                       margin-right: 8px;
                       border-radius: 4px;
                       overflow: hidden;
                     }
                     
                     .movie-details {
                       .movie-title {
                         font-weight: 500;
                         color: #303133;
                         margin-bottom: 2px;
                       }
                       
                       .movie-id {
                         font-size: 12px;
                         color: #909399;
                       }
                     }
                     
                     .image-slot {
                       display: flex;
                       justify-content: center;
                       align-items: center;
                       width: 100%;
                       height: 100%;
                       background: #f5f7fa;
                       color: #909399;
                     }
                   }
                   
                   .comment-status {
                     margin-left: auto;
                   }
                 }
                 
                 .comment-content {
                   margin-bottom: 12px;
                   
                   .rating-stars {
                     margin-bottom: 8px;
                   }
                   
                   .content-text {
                     margin-bottom: 10px;
                     line-height: 1.6;
                     color: #606266;
                     padding: 8px 12px;
                     background: #f9f9f9;
                     border-radius: 6px;
                     border-left: 3px solid #409eff;
                   }
                   
                   .content-meta {
                     display: flex;
                     align-items: center;
                     gap: 8px;
                     
                     .el-tag {
                       margin-right: 0;
                     }
                     
                     .comment-time {
                       font-size: 12px;
                       color: #909399;
                       margin-left: auto;
                     }
                   }
                 }
                 
                 .comment-actions {
                   display: flex;
                   gap: 8px;
                   flex-wrap: wrap;
                   
                   .el-button {
                     margin-right: 0;
                     margin-bottom: 0;
                   }
                 }
               }
             }
           }
           
           .replies-section {
             margin-top: 16px;
             padding-left: 20px;
             border-left: 3px solid #e4e7ed;
             
             .replies-header {
               margin-bottom: 12px;
               
               .el-divider {
                 margin: 8px 0;
                 
                 .el-divider__text {
                   color: #909399;
                   font-size: 13px;
                 }
               }
             }
             
             .reply-item {
               margin-bottom: 12px;
               
               .reply-card {
                 border: 1px solid #e4e7ed;
                 border-radius: 6px;
                 background: #fafafa;
                 transition: all 0.3s ease;
                 
                 &:hover {
                   border-color: #409eff;
                   background: #f0f9ff;
                 }
                 
                 .comment-item-content {
                   display: flex;
                   align-items: flex-start;
                   padding: 12px;
                   
                   .comment-checkbox {
                     margin-right: 8px;
                     margin-top: 2px;
                   }
                   
                   .comment-info {
                     flex: 1;
                     
                     .comment-header {
                       display: flex;
                       justify-content: space-between;
                       align-items: center;
                       margin-bottom: 8px;
                       
                       .user-info {
                         display: flex;
                         align-items: center;
                         
                         .el-avatar {
                           margin-right: 6px;
                         }
                         
                         .user-details {
                           .username {
                             font-weight: 500;
                             color: #303133;
                             font-size: 13px;
                           }
                           
                           .reply-to {
                             font-size: 12px;
                             color: #909399;
                           }
                         }
                       }
                     }
                     
                     .comment-content {
                       .content-text {
                         margin-bottom: 8px;
                         line-height: 1.5;
                         color: #606266;
                         font-size: 13px;
                         padding: 6px 10px;
                         background: #ffffff;
                         border-radius: 4px;
                         border-left: 2px solid #67c23a;
                       }
                       
                       .content-meta {
                         display: flex;
                         align-items: center;
                         gap: 6px;
                         
                         .el-tag {
                           margin-right: 0;
                           font-size: 11px;
                           height: 20px;
                           line-height: 18px;
                         }
                         
                         .comment-time {
                           font-size: 11px;
                           color: #c0c4cc;
                           margin-left: auto;
                         }
                       }
                     }
                     
                     .comment-actions {
                       display: flex;
                       gap: 6px;
                       
                       .el-button {
                         font-size: 12px;
                         height: 24px;
                         padding: 0 8px;
                       }
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
  }
  
  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .comment-detail {
    .comment-content-detail {
      margin: 20px 0;
      
      h4 {
        margin-bottom: 10px;
        color: #303133;
      }
      
      .content-box {
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 4px;
        border-left: 4px solid #409eff;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
    
    .comment-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }
  }
  
  .dialog-footer {
    text-align: right;
    
    .el-button {
      margin-left: 10px;
    }
  }
}
</style> 