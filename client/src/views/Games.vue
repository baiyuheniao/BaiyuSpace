<template>
  <div class="games-page">
    <h2 class="section-title">游戏资源</h2>
    <p class="section-desc">白雨的游戏设置、游戏插件、游戏地图、游戏文件均在此下载。</p>
    <div class="content-placeholder">
      <p>游戏资源内容正在开发中，敬请期待！</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Games'
}
</script>

<style scoped>
.games-page {
  max-width: 1200px;
  margin: 140px auto 0;
  padding: 2rem;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.section-desc {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.content-placeholder {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .games-page {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style> 