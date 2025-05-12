<!--
  首页组件 (Home.vue)
  展示网站主要功能模块的卡片布局，提供用户快速导航到各个功能区域
-->
<template>
  <div class="home">
    <!-- 功能卡片容器 -->
    <section class="card-container">
      <!-- 视频功能卡片 -->
      <div class="card" @click="handleCardClick('/videos')">
        <h3 class="card-title">最新视频</h3>
        <p class="card-desc">白雨的原创内容，支持1080p流媒体播放。</p>
        <ul class="advantages">
          <li>每周更新白雨的视频</li>
          <li>跨设备播放进度同步</li>
        </ul>
      </div>

      <!-- 游戏资源卡片 -->
      <div class="card" @click="handleCardClick('/games')">
        <h3 class="card-title">游戏资源</h3>
        <p class="card-desc">白雨的游戏设置、游戏插件、游戏地图、游戏文件均在此下载。</p>
        <ul class="advantages">
          <li>专属服务器低延迟</li>
          <li>永远不限速</li>
        </ul>
      </div>

      <!-- 论坛交流卡片 -->
      <div class="card" @click="handleCardClick('/forum')">
        <h3 class="card-title">论坛交流</h3>
        <p class="card-desc">专业技术与游戏讨论社区，涵盖开发运维、设计艺术等领域，支持实时消息推送。</p>
        <ul class="advantages">
          <li>主题分类精准明确</li>
          <li>自建频道可玩性高</li>
        </ul>
      </div>

      <!-- 软件中心卡片 -->
      <div class="card" @click="handleCardClick('/software')">
        <h3 class="card-title">软件中心</h3>
        <p class="card-desc">白雨团队自研软件，开发工具、设计软件和办公套件，全面覆盖你的生产进行时</p>
        <ul class="advantages">
          <li>自动更新维护</li>
          <li>多平台兼容支持</li>
        </ul>
      </div>

      <!-- 用户反馈卡片 -->
      <div class="card" @click="handleCardClick('/feedback')">
        <h3 class="card-title">用户反馈</h3>
        <p class="card-desc">产品、网站建议收集系统，全部公开，实时同步到开发看板。</p>
        <ul class="advantages">
          <li>状态追踪透明</li>
          <li>双向沟通渠道</li>
        </ul>
      </div>

      <!-- 技术支持卡片 -->
      <div class="card" @click="handleCardClick('/support')">
        <h3 class="card-title">技术支持</h3>
        <p class="card-desc">提供在线文档库，有什么问题看这里。</p>
        <ul class="advantages">
          <li>多语言支持</li>
          <li>多平台支持</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

/**
 * 首页组件
 * 作为网站主入口，展示六个主要功能模块的卡片导航
 */
export default {
  name: 'Home', // 组件名称
  setup() {
    const router = useRouter();

    // 卡片点击跳转处理函数
    const handleCardClick = (route) => {
      router.push(route);
    };

    return {
      handleCardClick
    };
  }
}
</script>

<style scoped>
/* 卡片容器样式 - 使用Grid布局实现响应式卡片排列 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 响应式网格布局 */
  gap: 2rem; /* 卡片之间的间距 */
  padding: 2rem;
  max-width: 1200px; /* 限制最大宽度，确保在大屏幕上有良好的阅读体验 */
  margin: 140px auto 0; /* 顶部外边距为导航栏预留空间 */
}

/* 卡片基础样式 - 采用毛玻璃效果设计 */
.card {
  background: rgba(255,255,255,0.05); /* 半透明背景 */
  border-radius: 12px; /* 圆角边框 */
  padding: 1.5rem;
  backdrop-filter: blur(8px); /* 背景模糊效果，增强毛玻璃质感 */
  border: 1px solid rgba(255,255,255,0.1); /* 微妙的边框 */
  transition: transform 0.2s; /* 平滑过渡效果 */
  cursor: pointer; /* 添加指针样式，提示可点击 */
}

/* 卡片悬停效果 - 轻微上浮，增强交互感 */
.card:hover {
  transform: translateY(-5px);
}

/* 卡片标题样式 - 包含装饰性的前缀图标 */
.card-title {
  position: relative;
  padding-left: 40px; /* 为图标预留空间 */
  font-size: 1.4rem;
  margin: 0 0 1rem;
}

/* 标题前的装饰图标 */
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  background: #666; /* 图标背景色 */
  border-radius: 6px;
}

/* 卡片描述文字样式 */
.card-desc {
  color: rgba(255,255,255,0.8); /* 略微降低不透明度，增强层次感 */
  line-height: 1.6; /* 增加行高，提高可读性 */
  margin-bottom: 1rem;
}

/* 优势列表样式 */
.advantages {
  padding-left: 1.2rem;
  margin: 0;
}

.advantages li {
  margin-bottom: 0.5rem;
  color: rgba(255,255,255,0.7); /* 较低的不透明度，形成视觉层次 */
}

/* 响应式适配规则 - 平板设备 */
@media (max-width: 768px) {
  .card-container {
    padding: 1rem;
    margin-top: 120px; /* 调整顶部边距 */
  }
  
  .card {
    padding: 1rem; /* 减小内边距 */
  }
  
  .card-title {
    font-size: 1.2rem; /* 减小字体大小 */
    padding-left: 36px;
  }
  
  .card-title::before {
    width: 26px;
    height: 26px; /* 调整图标大小 */
  }
}

/* 响应式适配规则 - 移动设备 */
@media (max-width: 480px) {
  .card-container {
    grid-template-columns: 1fr; /* 单列布局 */
  }
}
</style>
