<template>
  <div class="create-post">
    <h1 class="page-title">发布新文章</h1>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group">
        <label for="title">文章标题</label>
        <input
          type="text"
          id="title"
          v-model="post.title"
          class="form-control"
          required
          placeholder="请输入文章标题"
        />
      </div>
      
      <div class="form-group">
        <label for="content">文章内容</label>
        <textarea
          id="content"
          v-model="post.content"
          class="form-control"
          rows="15"
          required
          placeholder="请输入文章内容..."
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>标签</label>
        <div class="tags-container">
          <div v-if="tagsLoading" class="loading-text">加载标签中...</div>
          <div v-else-if="tagsError" class="error-text">{{ tagsError }}</div>
          <div v-else class="tags-selection">
            <div 
              v-for="tag in availableTags" 
              :key="tag.id"
              @click="toggleTag(tag)"
              :class="['tag-item', { 'selected': isTagSelected(tag.id) }]"
            >
              {{ tag.name }}
            </div>
            <div class="tag-item new-tag" @click="showAddTagForm = !showAddTagForm">
              + 添加新标签
            </div>
          </div>
        </div>
        
        <div v-if="showAddTagForm" class="add-tag-form">
          <input 
            type="text" 
            v-model="newTagName" 
            placeholder="输入新标签名称" 
            class="form-control"
          >
          <div class="tag-actions">
            <button 
              type="button" 
              @click="addNewTag" 
              class="btn btn-primary btn-sm"
              :disabled="addingTag"
            >
              {{ addingTag ? '添加中...' : '添加' }}
            </button>
            <button 
              type="button" 
              @click="showAddTagForm = false" 
              class="btn btn-secondary btn-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$router.go(-1)" class="cancel-button">
          取消
        </button>
        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? '发布中...' : '发布文章' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreatePost',
  data() {
    return {
      post: {
        title: '',
        content: ''
      },
      selectedTags: [],
      availableTags: [],
      tagsLoading: true,
      tagsError: null,
      showAddTagForm: false,
      newTagName: '',
      addingTag: false,
      loading: false,
      error: null
    };
  },
  methods: {
    async submitPost() {
      if (!this.post.title.trim() || !this.post.content.trim()) {
        this.error = '标题和内容不能为空';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/api/posts', {
          title: this.post.title,
          content: this.post.content,
          tags: this.selectedTags.map(tag => tag.id)
        });
        
        if (response.data.success) {
          // 跳转到文章详情页
          this.$router.push({
            name: 'PostDetail',
            params: { id: response.data.data.id }
          });
        } else {
          this.error = '发布文章失败';
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.error = '未登录，请先登录';
          // 跳转到登录页
          this.$router.push({
            name: 'Login',
            query: { redirect: this.$route.fullPath }
          });
        } else {
          this.error = '网络错误，请稍后重试';
          console.error('发布文章失败:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    
    async fetchTags() {
      this.tagsLoading = true;
      this.tagsError = null;
      
      try {
        const response = await axios.get('/api/tags');
        if (response.data.success) {
          this.availableTags = response.data.data;
        } else {
          this.tagsError = '获取标签列表失败';
        }
      } catch (error) {
        console.error('获取标签列表失败:', error);
        this.tagsError = '网络错误，请稍后重试';
      } finally {
        this.tagsLoading = false;
      }
    },
    
    toggleTag(tag) {
      const index = this.selectedTags.findIndex(t => t.id === tag.id);
      if (index === -1) {
        // 添加标签
        this.selectedTags.push(tag);
      } else {
        // 移除标签
        this.selectedTags.splice(index, 1);
      }
    },
    
    isTagSelected(tagId) {
      return this.selectedTags.some(tag => tag.id === tagId);
    },
    
    async addNewTag() {
      if (!this.newTagName.trim()) {
        return;
      }
      
      this.addingTag = true;
      
      try {
        const response = await axios.post('/api/tags', {
          name: this.newTagName.trim()
        });
        
        if (response.data.success) {
          // 添加到可用标签列表
          const newTag = response.data.data;
          this.availableTags.push(newTag);
          
          // 自动选中新标签
          this.selectedTags.push(newTag);
          
          // 重置表单
          this.newTagName = '';
          this.showAddTagForm = false;
        } else {
          this.error = '添加标签失败，请重试';
        }
      } catch (error) {
        console.error('添加标签失败:', error);
        this.error = error.response?.data?.message || '网络错误，请稍后重试';
      } finally {
        this.addingTag = false;
      }
    }
  },
  created() {
    this.fetchTags();
  }
};
</script>

<style scoped>
.create-post {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

.error-message {
  background-color: #fde2e2;
  color: #e74c3c;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.post-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button, .submit-button {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.cancel-button {
  background-color: #ecf0f1;
  color: #7f8c8d;
  border: none;
}

.submit-button {
  background-color: #3498db;
  color: white;
  border: none;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 200px;
}

.tags-container {
  margin-top: 0.5rem;
}

.loading-text, .error-text {
  text-align: center;
  padding: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.error-text {
  color: #e74c3c;
}

.tags-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #34495e;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  background-color: #e0e0e0;
}

.tag-item.selected {
  background-color: #3498db;
  color: #fff;
}

.tag-item.new-tag {
  background-color: #ecf0f1;
  border: 1px dashed #bdc3c7;
}

.add-tag-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.tag-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style> 