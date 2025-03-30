<!--
  标签列表组件 (TagList.vue)
  用于展示文章标签的可点击列表，每个标签都是到对应标签文章列表页面的链接
  可被多个页面复用，如文章详情页、文章列表页等
-->
<template>
  <!-- 标签列表容器 -->
  <div class="tag-list">
    <!-- 
      遍历标签数组，为每个标签创建一个路由链接
      点击后导航到对应标签的文章列表页面 
    -->
    <router-link 
      v-for="tag in tags" 
      :key="tag.id" 
      :to="{ name: 'TagPosts', params: { id: tag.id } }"
      class="tag"
    >
      {{ tag.name }}
    </router-link>
  </div>
</template>

<script>
/**
 * 标签列表组件
 * 接收标签数组并渲染成可点击的标签列表
 */
export default {
  name: 'TagList',
  props: {
    // 标签数组属性，必须传入
    tags: {
      type: Array,     // 数据类型为数组
      required: true   // 该属性为必填项
    }
  }
};
</script>

<style scoped>
/* 标签列表容器样式 - 使用弹性布局和自动换行 */
.tag-list {
  display: flex;
  flex-wrap: wrap;     /* 允许标签自动换行 */
  gap: 0.5rem;         /* 标签之间的间距 */
  margin: 0.5rem 0;
}

/* 单个标签样式 - 圆角胶囊形状 */
.tag {
  display: inline-block;
  background-color: #e1f5fe;  /* 淡蓝色背景 */
  color: #0288d1;             /* 深蓝色文字 */
  border-radius: 16px;        /* 圆角效果 */
  padding: 0.25rem 0.75rem;   /* 内边距 */
  font-size: 0.8rem;          /* 字体大小 */
  text-decoration: none;      /* 移除下划线 */
  transition: background-color 0.2s; /* 背景色过渡效果 */
}

/* 标签悬停效果 */
.tag:hover {
  background-color: #b3e5fc;  /* 悬停时加深背景色 */
}
</style> 