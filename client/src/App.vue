<template>
  <div id="app">
    <Navbar />
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
  .site-title {
    font-size: 2.5rem;
  }
}
</style> 