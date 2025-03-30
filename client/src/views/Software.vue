<template>
  <div class="software-page">
    <h2 class="section-title">软件中心</h2>
    <p class="section-desc">白雨团队自研软件，开发工具、设计软件和办公套件，全面覆盖你的生产进行时。</p>
    <div class="content-placeholder">
      <p>软件资源内容正在开发中，敬请期待！</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Software'
}
</script>

<style scoped>
.software-page {
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
  .software-page {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style> 