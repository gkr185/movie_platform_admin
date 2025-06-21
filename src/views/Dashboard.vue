<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1>控制台</h1>
        <p class="header-subtitle">实时业务数据监控与分析</p>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh" 
          :loading="refreshing"
          @click="handleRefresh"
          class="refresh-btn"
        >
          刷新数据
        </el-button>

        <div class="service-status" :class="serviceStatus === 'UP' ? 'status-up' : 'status-down'">
          <div class="status-indicator"></div>
          <span>{{ serviceStatus === 'UP' ? '服务正常' : '服务异常' }}</span>
        </div>
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

    <!-- 收入趋势分析 -->
    <el-row :gutter="24" class="charts-section">
      <el-col :span="24">
        <el-card class="chart-card revenue-trend-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <h3>近30天收入趋势</h3>
                <span class="header-desc">VIP收入变化趋势分析</span>
              </div>
              <el-button type="text" @click="refreshRevenueTrend" class="refresh-icon">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="chart-container" v-if="revenueTrendData.length > 0 && !revenueTrendLoading">
            <v-chart 
              ref="revenueTrendChart"
              :option="revenueTrendChartOption" 
              :style="{ height: '320px' }"
              autoresize
            />
          </div>
          <div v-else-if="revenueTrendLoading" class="loading-chart">
            <div class="loading-content">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <p>正在获取30天收入数据...</p>
            </div>
          </div>
          <div v-else class="empty-chart">
            <el-empty description="暂无收入趋势数据" :image-size="120" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据分析区域 -->
    <el-row :gutter="24" class="charts-section">
      <!-- 热门电影排行 -->
      <el-col :span="12">
        <el-card class="chart-card ranking-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <h3>热门电影TOP10</h3>
                <span class="header-desc">按观看量排序</span>
              </div>
              <el-button type="text" @click="refreshPopularMovies" class="refresh-icon">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          
          <div class="popular-movies">
            <div 
              v-for="(movie, index) in popularMovies.slice(0, 10)" 
              :key="movie.movieId"
              class="movie-item"
              :class="{ 'top-three': index < 3 }"
            >
              <div class="movie-rank" :class="getRankClass(index)">
                {{ index + 1 }}
              </div>
              <div class="movie-info">
                <div class="movie-title">{{ movie.title }}</div>
                <div class="movie-meta">
                  <el-tag size="small" :type="getCategoryType(movie.category)">
                    {{ movie.category }}
                  </el-tag>
                  <span class="movie-rating">★ {{ movie.rating }}</span>
                </div>
              </div>
              <div class="movie-stats">
                <div class="view-count">{{ formatNumber(movie.viewCount || movie.view_count) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 电影分类分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <h3>电影分类分布</h3>
                <span class="header-desc">各类型电影数量统计</span>
              </div>
            </div>
          </template>
          
          <div class="chart-container" v-if="categoryData.length > 0">
            <v-chart 
              ref="categoryChart"
              :option="categoryChartOption" 
              :style="{ height: '360px' }"
              autoresize
            />
          </div>
          <div v-else class="empty-chart">
            <el-empty description="暂无分类数据" :image-size="120" />
          </div>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { statisticsApi } from '@/api/statistics'
import { getAllCategories, getCategoryMovieCount } from '@/api/category'
import { ElMessage } from 'element-plus'
import { 
  User, VideoPlay, View, Money, ArrowUp, ArrowDown, Refresh, Loading 
} from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'Dashboard',
  components: {
    User, VideoPlay, View, Money, ArrowUp, ArrowDown, Refresh, Loading, VChart
  },
  provide: {
    [THEME_KEY]: 'light'
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
    
    // 图表相关数据
    const categoryData = ref([])
    const revenueTrendData = ref([])
    const revenueTrendLoading = ref(false)

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

    // 图表配置
    const revenueTrendChartOption = computed(() => {
      const dates = revenueTrendData.value.map(item => item.date)
      const revenues = revenueTrendData.value.map(item => item.revenue)
      
      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#333',
          textStyle: { color: '#fff' },
          formatter: function(params) {
            const data = params[0]
            return `${data.axisValueLabel}<br/>收入: ¥${formatNumber(data.value)}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#e4e7ed' } },
          axisTick: { show: false },
          axisLabel: { 
            color: '#909399',
            fontSize: 12,
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { 
            color: '#909399',
            formatter: value => `¥${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`
          },
          splitLine: { lineStyle: { color: '#f5f7fa' } }
        },
        series: [{
          data: revenues,
          type: 'line',
          smooth: true,
          lineStyle: { 
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ]
            },
            width: 3
          },
          itemStyle: { 
            color: '#667eea',
            borderWidth: 2,
            borderColor: '#fff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              color: '#667eea',
              borderColor: '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(102, 126, 234, 0.5)'
            }
          }
        }]
      }
    })

    const categoryChartOption = computed(() => {
      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#333',
          textStyle: { color: '#fff' }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#909399' }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: categoryData.value,
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
        }]
      }
    })



    // 工具方法
    const formatNumber = (num) => {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    const getTrendClass = (rate) => {
      return rate > 0 ? 'trend-up' : 'trend-down'
    }

    const getRankClass = (index) => {
      if (index === 0) return 'rank-1'
      if (index === 1) return 'rank-2'  
      if (index === 2) return 'rank-3'
      return ''
    }

    const getCategoryType = (category) => {
      const types = {
        '动作': 'danger',
        '爱情': 'warning', 
        '喜剧': 'success',
        '科幻': 'info',
        '剧情': ''
      }
      return types[category] || ''
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

    const loadRevenueTrendData = async () => {
      revenueTrendLoading.value = true
      try {
        // 生成过去30天的日期数组
        const dates = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          dates.push(date.toISOString().split('T')[0])
        }
        
        // 并发调用所有日期的统计API（限制并发数量避免服务器压力）
        const batchSize = 5 // 每批处理5个请求
        const results = []
        
        for (let i = 0; i < dates.length; i += batchSize) {
          const batch = dates.slice(i, i + batchSize)
          const batchPromises = batch.map(async (date) => {
            try {
              const response = await statisticsApi.getDailyStatistics(date)
              const data = response.data?.data || response.data
              return {
                date: date.slice(5), // MM-DD格式
                revenue: data?.vipRevenue || 0,
                fullDate: date
              }
            } catch (error) {
              console.warn(`获取 ${date} 的统计数据失败:`, error.message)
              return {
                date: date.slice(5),
                revenue: 0,
                fullDate: date
              }
            }
          })
          
          const batchResults = await Promise.allSettled(batchPromises)
          const validResults = batchResults.map(result => 
            result.status === 'fulfilled' ? result.value : {
              date: '',
              revenue: 0,
              fullDate: ''
            }
          )
          
          results.push(...validResults)
          
          // 添加小延迟避免请求过于频繁
          if (i + batchSize < dates.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        // 按日期排序并设置数据
        revenueTrendData.value = results
          .filter(item => item.date) // 过滤掉无效数据
          .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
          .map(item => ({
            date: item.date,
            revenue: item.revenue
          }))
          
        console.log(`成功获取 ${revenueTrendData.value.length} 天的收入数据`)
        
      } catch (error) {
        console.error('获取收入趋势数据失败:', error)
        ElMessage.error('获取收入趋势数据失败，请稍后重试')
        // API失败时创建空数据占位
        revenueTrendData.value = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          return {
            date: date.toISOString().split('T')[0].slice(5),
            revenue: 0
          }
        })
      } finally {
        revenueTrendLoading.value = false
      }
    }

    const loadCategoryData = async () => {
      try {
        // 获取所有分类
        const categoriesResponse = await getAllCategories()
        const categories = categoriesResponse.data?.data || categoriesResponse.data || []
        
        if (Array.isArray(categories) && categories.length > 0) {
          // 为每个分类获取电影数量
          const categoryStats = await Promise.all(
            categories.map(async (category) => {
              try {
                const countResponse = await getCategoryMovieCount(category.id)
                return {
                  name: category.name,
                  value: countResponse.data?.data || countResponse.data || 0
                }
              } catch (error) {
                return {
                  name: category.name,
                  value: 0
                }
              }
            })
          )
          
          // 过滤掉没有电影的分类，并按数量排序
          categoryData.value = categoryStats
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 8) // 只显示前8个分类
        } else {
          categoryData.value = []
        }
      } catch (error) {
        console.error('获取分类数据失败:', error)
        categoryData.value = []
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

    const refreshRevenueTrend = () => {
      loadRevenueTrendData()
    }

    // 加载所有数据
    const loadAllData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadTotalStatistics(),
          loadDailyStatistics(selectedDate.value),
          loadPopularMovies(),
          loadCategoryData(),
          loadRevenueTrendData(),
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
      categoryData,
      revenueTrendData,
      revenueTrendLoading,
      categoryChartOption,
      revenueTrendChartOption,
      userGrowthRate,
      viewGrowthRate,
      revenueGrowthRate,
      formatNumber,
      getTrendClass,
      getRankClass,
      getCategoryType,
      handleRefresh,
      handleDateChange,
      refreshPopularMovies,
      refreshRevenueTrend
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 24px;
  min-height: calc(100vh - 60px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
  }

  > * {
    position: relative;
    z-index: 1;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px; 
    padding: 24px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .header-left {
      h1 {
        color: #1a1a1a;
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .header-subtitle {
        color: #666;
        margin: 0;
        font-size: 14px;
        font-weight: 400;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;

      .refresh-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
      }

      .service-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        &.status-up {
          background: rgba(103, 194, 58, 0.1);
          color: #67C23A;
          border: 1px solid rgba(103, 194, 58, 0.2);

          .status-indicator {
            background: #67C23A;
          }
        }

        &.status-down {
          background: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
          border: 1px solid rgba(245, 108, 108, 0.2);

          .status-indicator {
            background: #F56C6C;
          }
        }
      }
    }
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }

  .stats-overview {
    margin-bottom: 32px;

    .stat-card {
      height: 140px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }
      
      :deep(.el-card__body) {
        padding: 24px;
        height: 100%;
        background: transparent;
      }

      .stat-item {
        display: flex;
        align-items: center;
        height: 100%;
        position: relative;

        .stat-icon {
          font-size: 42px;
          margin-right: 24px;
          
          .el-icon {
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 36px;
            font-weight: 800;
            color: #1a1a1a;
            line-height: 1;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .stat-label {
            color: #666;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            width: fit-content;

            .el-icon {
              margin-right: 4px;
              font-size: 14px;
            }

            &.trend-up {
              background: rgba(103, 194, 58, 0.1);
              color: #67C23A;
              border: 1px solid rgba(103, 194, 58, 0.2);
            }

            &.trend-down {
              background: rgba(245, 108, 108, 0.1);
              color: #F56C6C;
              border: 1px solid rgba(245, 108, 108, 0.2);
            }
          }

          .stat-extra {
            color: #888;
            font-size: 12px;
            font-weight: 500;
          }
        }
      }

      &.total-users {
        .stat-icon .el-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      }

      &.total-movies {
        .stat-icon .el-icon {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
          color: white;
        }
      }

      &.total-views {
        .stat-icon .el-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
      }

      &.total-revenue {
        .stat-icon .el-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }
      }
    }
  }

  .daily-overview {
    margin-bottom: 32px;

    .el-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);

      :deep(.el-card__header) {
        background: transparent;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        padding: 20px 24px;
      }

      :deep(.el-card__body) {
        padding: 24px;
        background: transparent;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }
    }

    .daily-stat {
      text-align: center;
      padding: 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .daily-value {
        font-size: 28px;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
      }

      .daily-label {
        color: #666;
        font-size: 13px;
        font-weight: 500;
      }
    }
  }

  .charts-section, .charts-section-2 {
    margin-bottom: 32px;

    .chart-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }

      :deep(.el-card__header) {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        padding: 24px;
      }

      :deep(.el-card__body) {
        padding: 24px;
        background: transparent;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .header-desc {
          color: #666;
          font-size: 13px;
          font-weight: 400;
        }
      }

      .chart-tabs {
        :deep(.el-radio-button__inner) {
          background: transparent;
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #667eea;
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
      }

      .refresh-icon {
        color: #667eea;
        font-size: 16px;
        padding: 8px;
        border-radius: 8px;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: rotate(90deg);
        }
      }
    }

    .chart-container {
      margin-top: 16px;
    }

    .empty-chart {
      padding: 40px 20px;
      text-align: center;
      
      :deep(.el-empty__description p) {
        color: #909399;
        font-size: 14px;
      }
    }

    .loading-chart {
      padding: 60px 20px;
      text-align: center;
      
      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        
        .loading-icon {
          font-size: 32px;
          color: #667eea;
          animation: spin 1s linear infinite;
        }
        
        p {
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .revenue-trend-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
      border: 1px solid rgba(102, 126, 234, 0.15);

      :deep(.el-card__header) {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      }

      .card-header {
        .header-title {
          h3 {
            color: #667eea;
            font-weight: 700;
          }
        }

        .refresh-icon {
          background: rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);

          &:hover {
            background: rgba(102, 126, 234, 0.25);
          }
        }
      }
    }
  }

  .ranking-card {
    .popular-movies {
      .movie-item {
        display: flex;
        align-items: center;
        padding: 16px;
        margin-bottom: 8px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;

        &:hover {
          transform: translateX(8px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        &.top-three {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .movie-rank {
          font-size: 18px;
          font-weight: 800;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-right: 16px;

          &.rank-1 {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
          }

          &.rank-2 {
            background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
          }

          &.rank-3 {
            background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
          }
        }

        .movie-info {
          flex: 1;

          .movie-title {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 6px;
            line-height: 1.4;
          }

          .movie-meta {
            display: flex;
            align-items: center;
            gap: 12px;

            .movie-rating {
              font-size: 12px;
              color: #f39c12;
              font-weight: 500;
            }
          }
        }

        .movie-stats {
          text-align: right;

          .view-count {
            font-size: 13px;
            font-weight: 600;
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            padding: 4px 8px;
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.2);
          }
        }
      }
    }
  }

}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard {
    .stats-overview {
      .el-col {
        margin-bottom: 20px;
      }
    }

    .charts-section, .charts-section-2 {
      .el-col {
        margin-bottom: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;

      .header-left {
        h1 {
          font-size: 24px;
        }

        .header-subtitle {
          font-size: 13px;
        }
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }

    .stats-overview {
      .stat-card {
        height: 120px;

        .stat-item {
          .stat-icon {
            font-size: 32px;
            margin-right: 16px;

            .el-icon {
              padding: 16px;
            }
          }

          .stat-content {
            .stat-value {
              font-size: 24px;
            }
          }
        }
      }
    }

    .charts-section, .charts-section-2 {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .chart-container {
        :deep(.echarts) {
          height: 240px !important;
        }
      }
    }

    .ranking-card {
      .popular-movies {
        .movie-item {
          padding: 12px;

          .movie-rank {
            width: 28px;
            height: 28px;
            font-size: 14px;
            margin-right: 12px;
          }

          .movie-info {
            .movie-title {
              font-size: 13px;
            }

            .movie-meta {
              gap: 8px;
            }
          }
        }
      }
    }
  }
}
</style> 