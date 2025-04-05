# BYSpace 项目

## 项目概述
BYSpace 是一个由白雨团队开发的社区论坛系统，包含前端Vue应用和后端Express服务，使用MySQL数据库。项目旨在为用户提供产品反馈、技术支持等功能。

## 技术栈
- **前端**: Vue.js + Vue Router
- **后端**: Node.js + Express
- **数据库**: MySQL
- **构建工具**: Vue CLI

## 项目结构
```
BYSpace/
├── client/          # 前端Vue应用
│   ├── src/         # 前端源代码
│   └── vue.config.js # Vue CLI配置
└── server/          # 后端Express服务
    ├── controllers/ # 控制器
    └── routes/      # 路由
```

## 安装指南
1. 克隆仓库
```bash
git clone <仓库地址>
```

2. 安装前端依赖
```bash
cd client
npm install
```

3. 安装后端依赖
```bash
cd ../server
npm install
```

## 运行项目
1. 启动前端开发服务器
```bash
cd client
npm run serve
```

2. 启动后端服务
```bash
cd ../server
node index.js
```

## 功能模块
- 首页展示
- 用户反馈系统
- 技术支持文档

## 贡献指南
欢迎提交Pull Request或Issue。