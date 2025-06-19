<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <h1>数据仪表盘</h1>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh" 
          :loading="refreshing"
          @click="handleRefresh"
          size="small"
        >
          刷新数据
        </el-button>

        <el-tag :type="serviceStatus === 'UP' ? 'success' : 'danger'" size="small">
          服务状态: {{ serviceStatus || '检查中...' }}
        </el-tag>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card class="stat-card total-users">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(totalStats.totalUsers) }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-trend" :class="getTrendClass(userGrowthRate)">
                <el-icon><ArrowUp v-if="userGrowthRate > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(userGrowthRate) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card total-movies">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(totalStats.totalMovies) }}</div>
              <div class="stat-label">总电影数</div>
              <div class="stat-extra">平均评分: {{ totalStats.platformRating }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card total-views">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(totalStats.totalViews) }}</div>
              <div class="stat-label">总观看次数</div>
              <div class="stat-trend" :class="getTrendClass(viewGrowthRate)">
                <el-icon><ArrowUp v-if="viewGrowthRate > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(viewGrowthRate) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card total-revenue">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatNumber(totalStats.totalRevenue) }}</div>
              <div class="stat-label">总收入</div>
              <div class="stat-trend" :class="getTrendClass(revenueGrowthRate)">
                <el-icon><ArrowUp v-if="revenueGrowthRate > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(revenueGrowthRate) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日数据概览 -->
    <el-row :gutter="20" class="daily-overview">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>今日数据概览</span>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleDateChange"
                size="small"
              />
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">{{ dailyStats.newUsers }}</div>
                <div class="daily-label">新增用户</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">{{ dailyStats.activeUsers }}</div>
                <div class="daily-label">活跃用户</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">{{ dailyStats.totalViews }}</div>
                <div class="daily-label">观看次数</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">{{ dailyStats.vipOrders }}</div>
                <div class="daily-label">VIP订单</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">¥{{ dailyStats.vipRevenue }}</div>
                <div class="daily-label">VIP收入</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="daily-stat">
                <div class="daily-value">{{ dailyStats.newFeedback || dailyStats.feedbackCount }}</div>
                <div class="daily-label">新增反馈</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容和用户分析 -->
    <el-row :gutter="20" class="analysis-section">
      <!-- 热门电影排行 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门电影排行</span>
              <el-button type="text" @click="refreshPopularMovies" size="small">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="popular-movies">
            <div 
              v-for="(movie, index) in popularMovies" 
              :key="movie.movieId"
              class="movie-item"
            >
              <div class="movie-rank">{{ movie.rank || index + 1 }}</div>
              <div class="movie-info">
                <div class="movie-title">{{ movie.title }}</div>
                <div class="movie-meta">
                  <el-tag size="small" type="info">{{ movie.category }}</el-tag>
                  <span class="movie-rating">评分: {{ movie.rating }}</span>
                </div>
              </div>
              <div class="movie-stats">
                <div class="view-count">{{ formatNumber(movie.viewCount || movie.view_count) }}次观看</div>
                <div class="favorite-count">{{ formatNumber(movie.favoriteCount || movie.commentCount || movie.comment_count) }}互动</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 用户行为分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户行为分析</span>
          </template>
          
          <div class="user-behavior">
            <!-- VIP转化分析 -->
            <div class="behavior-section">
              <h4>VIP转化分析</h4>
              <div class="vip-stats">
                <div class="vip-item">
                  <span>转化率</span>
                  <el-progress 
                    :percentage="userBehavior.vipAnalysis?.conversionRate || 0" 
                    :stroke-width="8"
                    :show-text="true"
                  />
                </div>
                <div class="vip-item">
                  <span>续费率</span>
                  <el-progress 
                    :percentage="userBehavior.vipAnalysis?.renewalRate || 0" 
                    :stroke-width="8"
                    color="#67C23A"
                  />
                </div>
                <div class="vip-metrics">
                  <div class="metric">
                    <span>平均订单价值</span>
                    <strong>¥{{ userBehavior.vipAnalysis?.averageOrderValue || 0 }}</strong>
                  </div>
                  <div class="metric">
                    <span>流失率</span>
                    <strong>{{ userBehavior.vipAnalysis?.churnRate || 0 }}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户参与度 -->
            <div class="behavior-section">
              <h4>用户参与度</h4>
              <div class="engagement-stats">
                <el-row :gutter="10">
                  <el-col :span="12">
                    <div class="engagement-item">
                      <div class="engagement-value">{{ userBehavior.userEngagement?.averageSessionTime || 0 }}</div>
                      <div class="engagement-label">平均会话时长(分钟)</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="engagement-item">
                      <div class="engagement-value">{{ userBehavior.userEngagement?.averageViewsPerUser || 0 }}</div>
                      <div class="engagement-label">人均观看次数</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户行为分布 -->
    <el-row :gutter="20" class="distribution-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>用户行为分布</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="distribution-item">
                <div class="distribution-percentage">
                  {{ userBehavior.behaviorDistribution?.onlyViewers || 0 }}%
                </div>
                <div class="distribution-label">仅观看用户</div>
                <el-progress 
                  :percentage="userBehavior.behaviorDistribution?.onlyViewers || 0"
                  :show-text="false"
                  :stroke-width="6"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="distribution-item">
                <div class="distribution-percentage">
                  {{ userBehavior.behaviorDistribution?.commenters || 0 }}%
                </div>
                <div class="distribution-label">评论用户</div>
                <el-progress 
                  :percentage="userBehavior.behaviorDistribution?.commenters || 0"
                  :show-text="false"
                  :stroke-width="6"
                  color="#E6A23C"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="distribution-item">
                <div class="distribution-percentage">
                  {{ userBehavior.behaviorDistribution?.collectors || 0 }}%
                </div>
                <div class="distribution-label">收藏用户</div>
                <el-progress 
                  :percentage="userBehavior.behaviorDistribution?.collectors || 0"
                  :show-text="false"
                  :stroke-width="6"
                  color="#67C23A"
                />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="distribution-item">
                <div class="distribution-percentage">
                  {{ userBehavior.behaviorDistribution?.vipUsers || 0 }}%
                </div>
                <div class="distribution-label">VIP用户</div>
                <el-progress 
                  :percentage="userBehavior.behaviorDistribution?.vipUsers || 0"
                  :show-text="false"
                  :stroke-width="6"
                  color="#F56C6C"
                />
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { statisticsApi } from '@/api/statistics'
import { ElMessage } from 'element-plus'
import { 
  User, VideoPlay, View, Money, ArrowUp, ArrowDown, Refresh 
} from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    User, VideoPlay, View, Money, ArrowUp, ArrowDown, Refresh
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const refreshing = ref(false)
    const serviceStatus = ref('')
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    
    // 统计数据
    const totalStats = reactive({
      totalUsers: 0,
      totalMovies: 0,
      totalViews: 0,
      totalRevenue: 0,
      platformRating: 0,
      recentTrends: {}
    })
    
    const dailyStats = reactive({
      date: '',
      newUsers: 0,
      activeUsers: 0,
      totalViews: 0,
      newFavorites: 0,
      newComments: 0,
      vipOrders: 0,
      vipRevenue: 0,
      newFeedback: 0
    })
    
    const popularMovies = ref([])
    const userBehavior = reactive({
      behaviorDistribution: {},
      userEngagement: {},
      vipAnalysis: {}
    })

    // 计算属性
    const userGrowthRate = computed(() => {
      return totalStats.recentTrends?.userGrowthRate || 0
    })
    
    const viewGrowthRate = computed(() => {
      return totalStats.recentTrends?.viewGrowthRate || 0
    })
    
    const revenueGrowthRate = computed(() => {
      return totalStats.recentTrends?.revenueGrowthRate || 0
    })

    // 工具方法
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    const getTrendClass = (rate) => {
      return rate > 0 ? 'trend-up' : 'trend-down'
    }

    // API调用方法
    const loadTotalStatistics = async () => {
      try {
        const response = await statisticsApi.getTotalStatistics()
        const data = response.data?.data || response.data
        
        Object.assign(totalStats, {
          totalUsers: data.totalUsers || 0,
          totalMovies: data.totalMovies || 0,
          totalViews: data.totalViews || 0,
          totalRevenue: data.totalVipRevenue || data.totalRevenue || 0,
          platformRating: data.platformRating || 0,
          recentTrends: data.recentTrends || {}
        })
      } catch (error) {
        console.error('获取总统计数据失败:', error)
        ElMessage.error('获取总统计数据失败')
      }
    }
    
    const loadDailyStatistics = async (date) => {
      try {
        // 格式化日期为 YYYY-MM-DD 格式
        const formattedDate = date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : null
        const response = await statisticsApi.getDailyStatistics(formattedDate)
        const data = response.data?.data || response.data
        
        Object.assign(dailyStats, {
          date: data.date || formattedDate || new Date().toISOString().split('T')[0],
          newUsers: data.newUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalViews: data.totalViews || 0,
          newFavorites: data.newFavorites || 0,
          newComments: data.newComments || 0,
          vipOrders: data.vipOrders || 0,
          vipRevenue: data.vipRevenue || 0,
          newFeedback: data.newFeedback || data.feedbackCount || 0
        })
      } catch (error) {
        console.error('获取每日统计数据失败:', error)
        ElMessage.error(`获取每日统计数据失败: ${error.response?.status === 404 ? '服务不可用' : error.message}`)
      }
    }
    
    const loadPopularMovies = async () => {
      try {
        const response = await statisticsApi.getPopularMovies(10)
        const data = response.data?.data || response.data
        popularMovies.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('获取热门电影数据失败:', error)
        ElMessage.error('获取热门电影数据失败')
      }
    }
    
    const loadUserBehavior = async () => {
      try {
        const response = await statisticsApi.getUserBehaviorAnalysis()
        const data = response.data?.data || response.data
        
        // 处理后端返回的用户行为数据格式
        if (Array.isArray(data)) {
          // 如果返回的是数组格式，转换为对象格式
          const behaviorMap = {}
          data.forEach(item => {
            behaviorMap[item.behaviorType || item.type] = item.count || item.value || 0
          })
          Object.assign(userBehavior, {
            behaviorDistribution: behaviorMap,
            userEngagement: {},
            vipAnalysis: {}
          })
        } else {
          Object.assign(userBehavior, {
            behaviorDistribution: data.behaviorDistribution || data || {},
            userEngagement: data.userEngagement || {},
            vipAnalysis: data.vipAnalysis || {}
          })
        }
      } catch (error) {
        console.error('获取用户行为数据失败:', error)
        ElMessage.error(`获取用户行为数据失败: ${error.response?.status === 404 ? '服务不可用' : error.message}`)
      }
    }
    
    const checkServiceHealth = async () => {
      try {
        const response = await statisticsApi.checkHealth()
        const data = response.data?.data || response.data
        serviceStatus.value = data.status || 'UNKNOWN'
      } catch (error) {
        console.error('服务健康检查失败:', error)
        serviceStatus.value = 'DOWN'
      }
    }

    // 事件处理方法
    const handleRefresh = async () => {
      refreshing.value = true
      try {
        await statisticsApi.refreshStatistics()
        await loadAllData()
        ElMessage.success('数据刷新成功')
      } catch (error) {
        console.error('刷新数据失败:', error)
        ElMessage.error('刷新数据失败')
      } finally {
        refreshing.value = false
      }
    }
    
    const handleDateChange = (date) => {
      if (date) {
        loadDailyStatistics(date)
      }
    }
    
    const refreshPopularMovies = () => {
      loadPopularMovies()
    }

    // 加载所有数据
    const loadAllData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadTotalStatistics(),
          loadDailyStatistics(selectedDate.value),
          loadPopularMovies(),
          loadUserBehavior(),
          checkServiceHealth()
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 生命周期
    onMounted(() => {
      loadAllData()
      
      // 设置定时刷新（每5分钟）
      const timer = setInterval(() => {
        checkServiceHealth()
        loadDailyStatistics(selectedDate.value)
      }, 5 * 60 * 1000)
      
      // 组件销毁时清除定时器
      return () => {
        clearInterval(timer)
      }
    })

    return {
      loading,
      refreshing,
      serviceStatus,
      selectedDate,
      totalStats,
      dailyStats,
      popularMovies,
      userBehavior,
      userGrowthRate,
      viewGrowthRate,
      revenueGrowthRate,
      formatNumber,
      getTrendClass,
      handleRefresh,
      handleDateChange,
      refreshPopularMovies
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;

    h1 {
      color: #303133;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }

  .stats-overview {
    margin-bottom: 20px;

    .stat-card {
      height: 120px;
      
      :deep(.el-card__body) {
        padding: 20px;
        height: 100%;
      }

      .stat-item {
        display: flex;
        align-items: center;
        height: 100%;

        .stat-icon {
          font-size: 36px;
          margin-right: 20px;
          
          .el-icon {
            padding: 15px;
            border-radius: 50%;
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            color: #909399;
            font-size: 14px;
            margin-bottom: 5px;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 500;

            .el-icon {
              margin-right: 4px;
            }

            &.trend-up {
              color: #67C23A;
            }

            &.trend-down {
              color: #F56C6C;
            }
          }

          .stat-extra {
            color: #909399;
            font-size: 12px;
          }
        }
      }

      &.total-users {
        .stat-icon .el-icon {
          background-color: #e1f3ff;
          color: #409EFF;
        }
      }

      &.total-movies {
        .stat-icon .el-icon {
          background-color: #f0f9ff;
          color: #67C23A;
        }
      }

      &.total-views {
        .stat-icon .el-icon {
          background-color: #fef0e6;
          color: #E6A23C;
        }
      }

      &.total-revenue {
        .stat-icon .el-icon {
          background-color: #fef0f0;
          color: #F56C6C;
        }
      }
    }
  }

  .daily-overview {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .daily-stat {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background-color: #fafafa;

      .daily-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;
      }

      .daily-label {
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .analysis-section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .popular-movies {
      .movie-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .movie-rank {
          font-size: 18px;
          font-weight: bold;
          color: #409EFF;
          width: 30px;
          text-align: center;
        }

        .movie-info {
          flex: 1;
          margin-left: 15px;

          .movie-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 6px;
          }

          .movie-meta {
            display: flex;
            align-items: center;
            gap: 10px;

            .movie-rating {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .movie-stats {
          text-align: right;
          font-size: 12px;
          color: #909399;

          .view-count {
            margin-bottom: 4px;
          }
        }
      }
    }

    .user-behavior {
      .behavior-section {
        margin-bottom: 25px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 15px 0;
          color: #303133;
          font-size: 14px;
          font-weight: 600;
        }

        .vip-stats {
          .vip-item {
            margin-bottom: 15px;

            span {
              display: block;
              font-size: 12px;
              color: #909399;
              margin-bottom: 8px;
            }
          }

          .vip-metrics {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;

            .metric {
              text-align: center;

              span {
                display: block;
                font-size: 12px;
                color: #909399;
                margin-bottom: 5px;
              }

              strong {
                font-size: 16px;
                color: #303133;
              }
            }
          }
        }

        .engagement-stats {
          .engagement-item {
            text-align: center;
            padding: 15px;
            background-color: #fafafa;
            border-radius: 6px;

            .engagement-value {
              font-size: 20px;
              font-weight: bold;
              color: #409EFF;
              margin-bottom: 6px;
            }

            .engagement-label {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }

  .distribution-section {
    .distribution-item {
      text-align: center;
      padding: 20px;

      .distribution-percentage {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;
      }

      .distribution-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 12px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard {
    .stats-overview {
      .el-col {
        margin-bottom: 15px;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 15px;

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      h1 {
        font-size: 20px;
      }
    }

    .analysis-section {
      .el-col {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 