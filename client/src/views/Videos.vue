<template>
  <div class="videos-page">
    <h2 class="section-title">视频中心</h2>
    <p class="section-desc">白雨的原创内容，支持1080p流媒体播放。</p>
    <div class="content-placeholder">
      <p>视频内容正在开发中，敬请期待！</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Videos'
}
</script>

<style scoped>
.videos-page {
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
  .videos-page {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style> 