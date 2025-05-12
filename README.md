# BYSpace 项目

## 项目概述
BYSpace 是一个由白雨团队开发的社区论坛系统，包含前端Vue应用和后端Express服务，使用MySQL数据库。项目旨在为用户提供产品反馈、技术支持等功能。

## 技术栈
- **前端**: Vue 3 + Vue Router + Pinia
- **后端**: Node.js + Express + MySQL
- **构建工具**: Vite
- **包管理**: pnpm

## 项目结构
```
BYSpace/
├── client/          # 前端Vue应用
│   ├── src/         # 前端源代码
│   │   ├── components/ # 公共组件
│   │   ├── router/    # 路由配置
│   │   ├── services/  # API服务
│   │   ├── views/     # 页面组件
│   │   ├── App.vue    # 根组件
│   │   └── main.js    # 入口文件
│   ├── .eslintrc.js  # ESLint配置
│   ├── package.json  # 前端依赖
│   ├── pnpm-lock.yaml # 依赖锁文件
│   └── vue.config.js # Vue CLI配置
└── server/          # 后端Express服务
    ├── controllers/ # 控制器
    │   └── user.controller.js # 用户控制器
    ├── middleware/  # 中间件
    │   └── auth.js  # 认证中间件
    ├── routes/      # 路由
    │   └── user.routes.js # 用户路由
    ├── utils/       # 工具
    │   └── db.js    # 数据库连接
    ├── package.json # 后端依赖
    └── index.js     # 服务入口
```

## 安装指南
1. 克隆仓库
```bash
git clone <仓库地址>
```

2. 安装前端依赖
```bash
cd client
pnpm install
```

3. 安装后端依赖
```bash
cd ../server
pnpm install
```

## 运行项目
1. 启动前端开发服务器
```bash
cd client
pnpm dev
```

2. 启动后端服务
```bash
cd ../server
node index.js
```

## 功能模块
- 用户认证系统
- 用户反馈系统
- 技术支持文档

## 贡献指南
欢迎提交Pull Request或Issue。
请确保代码符合ESLint规范并通过所有测试。