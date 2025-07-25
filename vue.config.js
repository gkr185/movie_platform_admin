const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: 8080, // 前端开发服务器端口
    proxy: {
      // 统计服务代理 - 端口8068 (最具体的路径放在前面)
      '/api/statistics': {
        target: 'http://localhost:8069', // StatisticsService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // 新闻和反馈服务代理 - 端口8064
      '/api/news': {
        target: 'http://localhost:8064', // NewsAndFeedbackService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // 用户反馈相关代理 - 端口8064
      '/feedback': {
        target: 'http://localhost:8064', // NewsAndFeedbackService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // 图片管理相关代理 - 端口8064
      '/images': {
        target: 'http://localhost:8064', // NewsAndFeedbackService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // 广告服务代理 - 端口8065
      '/api/advertisements': {
        target: 'http://localhost:8065', // AdService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // VIP支付服务代理 - 端口8066
      '/api/payment': {
        target: 'http://localhost:8066', // VIPpayService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },

      // 用户服务代理 - 端口8062
      '/api/users': {
        target: 'http://localhost:8062', // UserService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // RBAC权限服务代理 - 端口8067
      '/api/rbac': {
        target: 'http://localhost:8067', // RBACService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影服务代理 - 端口8061
      '/api/movies': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影评论批量操作代理 - 端口8061 (更具体的路径)
      '/api/comments/batch': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影评论管理后台代理 - 端口8061
      '/api/comments/admin': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影评论相关代理 - 端口8061
      '/api/comments': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 用户收藏相关代理 - 端口8061
      '/api/favorites': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 观看历史相关代理 - 端口8061
      '/api/history': {
        target: 'http://localhost:8061', // MovieService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 分类服务代理 - 端口8063
      '/api/categories': {
        target: 'http://localhost:8063', // CategoriesService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影分类关联管理代理 - 端口8063
      '/api/movie-categories': {
        target: 'http://localhost:8063', // CategoriesService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 文件上传服务代理 - 端口8068
      '/api/files': {
        target: 'http://localhost:8068', // FileUploadService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        timeout: 300000 // 5分钟超时，适合大文件上传
      },
      
      // 静态文件访问代理 - 端口8068
      '/uploads': {
        target: 'http://localhost:8068', // FileUploadService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 默认API代理到网关 - 端口8080 (最通用的放在最后)
      '/api': {
        target: 'http://localhost:8080', // 默认网关端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  },
  
  // 构建配置
  configureWebpack: {
    // 开发环境下的配置
    ...(process.env.NODE_ENV === 'development' && {
      devtool: 'eval-source-map'
    })
  },
  
  // 生产环境构建配置
  productionSourceMap: false,
  
  // 静态资源配置
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  // CSS配置
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: process.env.NODE_ENV === 'production',
    // 开启 CSS source maps?
    sourceMap: process.env.NODE_ENV === 'development',
    // css预设器配置项
    loaderOptions: {
      scss: {
        // 全局引入变量和混合
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      }
    }
  }
})
