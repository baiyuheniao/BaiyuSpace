/**
 * Vue CLI 配置文件
 * 用于设置开发环境和构建选项
 */
module.exports = {
  // 部署应用包时的基本URL
  publicPath: '/',
  
  // 输出文件目录
  outputDir: 'dist',
  
  // 放置生成的静态资源的目录
  assetsDir: 'static',
  
  // 是否在开发环境下启用eslint检查
  lintOnSave: process.env.NODE_ENV !== 'production',
  
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  
  // 开发服务器配置
  devServer: {
    // 端口号
    port: 8080,
    
    // 是否自动打开浏览器
    open: true,
    
    // 代理配置，用于处理跨域请求
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // 配置webpack
  configureWebpack: {
    // 配置解析别名
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    },
    watchOptions: {
      ignored: [
        '**/node_modules/**',
        '**/System Volume Information/**'
      ]
    }
  }
} 