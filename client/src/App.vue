<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-group">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/videos" class="nav-item">视频</router-link>
        <router-link to="/games" class="nav-item">游戏</router-link>
        <router-link to="/forum" class="nav-item">论坛</router-link>
        <router-link to="/software" class="nav-item">软件</router-link>
        <router-link to="/feedback" class="nav-item">反馈</router-link>
        <router-link to="/support" class="nav-item">支持</router-link>
      </div>
    </nav>
    <h1 class="site-title">BaiyuSpace</h1>
    <router-view/>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',
  components: {
    Navbar
  }
};
</script>

<style>
/* 基础样式 */
body {
  margin: 0;
  padding: 100px 0 0;
  background: #0a0a0a;
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 导航栏样式 */
.main-nav {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.9);
  padding: 1rem;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.nav-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  width: auto;
  transform: translateX(0);
}

/* 导航项样式 */
.nav-item {
  position: relative;
  padding-left: 40px;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  background: #666;
  border-radius: 6px;
}

.site-title {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3.5rem;
  color: rgba(255,255,255,0.9);
  z-index: 1;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.8rem;
  }
  
  .nav-group {
    gap: 0.8rem;
  }
  
  .nav-item {
    padding-left: 32px;
    font-size: 1.1rem;
  }

  .site-title {
    font-size: 2.5rem;
  }
}
</style> 