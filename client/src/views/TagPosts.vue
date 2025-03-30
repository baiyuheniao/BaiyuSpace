<template>
  <div class="tag-posts">
    <div v-if="loading" class="loading">
      正在加载文章...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <template v-else>
      <h1 class="page-title">标签: {{ tagName }}</h1>
      
      <div v-if="posts.length === 0" class="no-posts">
        暂无包含此标签的文章。
      </div>
      
      <div v-else class="post-list">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <h2 class="post-title">
            <router-link :to="{ name: 'PostDetail', params: { id: post.id } }">
              {{ post.title }}
            </router-link>
          </h2>
          <div class="post-meta">
            <span class="post-author">作者: {{ post.username }}</span>
            <span class="post-date">发布于: {{ formatDate(post.created_at) }}</span>
          </div>
          <div class="post-content-preview">
            {{ truncateContent(post.content) }}
          </div>
          <div class="post-footer">
            <router-link :to="{ name: 'PostDetail', params: { id: post.id } }" class="read-more">
              阅读全文
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TagPosts',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      tagName: '',
      posts: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchPosts() {
      this.loading = true;
      this.error = null;
      
      try {
        // 获取标签信息
        const tagResponse = await axios.get(`/api/tags/${this.id}/posts`);
        
        if (tagResponse.data.success) {
          this.posts = tagResponse.data.data;
          
          // 获取标签名称
          if (this.posts.length > 0) {
            const tagsResponse = await axios.get('/api/tags');
            if (tagsResponse.data.success) {
              const tag = tagsResponse.data.data.find(t => t.id === parseInt(this.id));
              if (tag) {
                this.tagName = tag.name;
              } else {
                this.tagName = '未知标签';
              }
            }
          } else {
            // 如果没有文章，也要获取标签名称
            const tagsResponse = await axios.get('/api/tags');
            if (tagsResponse.data.success) {
              const tag = tagsResponse.data.data.find(t => t.id === parseInt(this.id));
              if (tag) {
                this.tagName = tag.name;
              } else {
                this.error = '标签不存在';
              }
            }
          }
        } else {
          this.error = '获取文章列表失败';
        }
      } catch (error) {
        this.error = '网络错误，请稍后重试';
        console.error('获取标签文章失败:', error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    truncateContent(content) {
      return content.length > 200 ? content.substring(0, 200) + '...' : content;
    }
  },
  watch: {
    id() {
      this.fetchPosts();
    }
  },
  created() {
    this.fetchPosts();
  }
};
</script>

<style scoped>
.tag-posts {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.loading, .error, .no-posts {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  color: #e74c3c;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.post-title a {
  color: #3498db;
  text-decoration: none;
}

.post-title a:hover {
  text-decoration: underline;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.post-content-preview {
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 1rem;
}

.post-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.read-more:hover {
  text-decoration: underline;
}
</style> 