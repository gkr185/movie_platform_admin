const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  
  // 开发服务器配置
  devServer: {
    port: 8080, // 前端开发服务器端口
    proxy: {
      // 用户服务代理
      '/api/users': {
        target: 'http://localhost:8062', // UserService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // RBAC权限服务代理
      '/api/rbac': {
        target: 'http://localhost:8067', // RBACService 端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 电影服务代理（如果有的话）
      '/api/movies': {
        target: 'http://localhost:8063', // 假设电影服务端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 其他服务的代理可以在这里添加
      '/api': {
        target: 'http://localhost:8080', // 默认网关端口
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  }
})
