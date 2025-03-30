<template>
  <div class="edit-post">
    <h1>编辑文章</h1>
    
    <div v-if="loading" class="loading">
      正在加载文章...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <form v-else @submit.prevent="updatePost" class="post-form">
      <div class="form-group">
        <label for="title">标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="post.title" 
          required 
          class="form-control"
          placeholder="请输入文章标题"
        >
      </div>
      
      <div class="form-group">
        <label for="content">内容</label>
        <textarea 
          id="content" 
          v-model="post.content" 
          required 
          class="form-control"
          rows="10"
          placeholder="请输入文章内容"
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
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="submitting"
        >
          {{ submitting ? '保存中...' : '保存修改' }}
        </button>
        <router-link :to="{ name: 'PostDetail', params: { id: $route.params.id } }" class="btn btn-secondary">
          取消
        </router-link>
      </div>
      
      <div v-if="submitError" class="error-message">
        {{ submitError }}
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditPost',
  data() {
    return {
      post: {
        id: null,
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
      loading: true,
      submitting: false,
      error: null,
      submitError: null
    };
  },
  methods: {
    async fetchPost() {
      this.loading = true;
      this.error = null;
      
      try {
        const postId = this.$route.params.id;
        const response = await axios.get(`/api/posts/${postId}`);
        
        if (response.data.success) {
          const post = response.data.data;
          this.post = {
            id: post.id,
            title: post.title,
            content: post.content
          };
          
          // 如果文章有标签，初始化选中的标签
          if (post.tags && Array.isArray(post.tags)) {
            this.selectedTags = [...post.tags];
          }
        } else {
          this.error = '获取文章失败';
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        this.error = error.response?.data?.message || '网络错误，请稍后重试';
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
    
    async updatePost() {
      this.submitting = true;
      this.submitError = null;
      
      try {
        const response = await axios.put(`/api/posts/${this.post.id}`, {
          title: this.post.title,
          content: this.post.content,
          tags: this.selectedTags.map(tag => tag.id)
        });
        
        if (response.data.success) {
          // 跳转到文章详情页
          this.$router.push({ 
            name: 'PostDetail', 
            params: { id: this.post.id }
          });
        } else {
          this.submitError = '更新文章失败，请重试';
        }
      } catch (error) {
        console.error('更新文章失败:', error);
        this.submitError = error.response?.data?.message || '网络错误，请稍后重试';
      } finally {
        this.submitting = false;
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
          this.submitError = '添加标签失败，请重试';
        }
      } catch (error) {
        console.error('添加标签失败:', error);
        this.submitError = error.response?.data?.message || '网络错误，请稍后重试';
      } finally {
        this.addingTag = false;
      }
    }
  },
  created() {
    this.fetchPost();
    this.fetchTags();
  }
};
</script>

<style scoped>
.edit-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  color: #e74c3c;
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

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #34495e;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #7f8c8d;
  color: white;
}

.btn-secondary:hover {
  background-color: #6c7a7d;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  color: #e74c3c;
  background-color: #fadbd8;
  border-radius: 4px;
  text-align: center;
}
</style> 