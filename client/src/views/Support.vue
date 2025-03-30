<template>
  <div class="support-page">
    <h2 class="section-title">技术支持</h2>
    <p class="section-desc">提供在线文档库，有什么问题看这里。</p>
    <div class="content-placeholder">
      <p>技术支持文档系统正在开发中，敬请期待！</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Support'
}
</script>

<style scoped>
.support-page {
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
  .support-page {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style> 