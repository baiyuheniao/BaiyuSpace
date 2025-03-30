<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchUserData" class="btn-primary">重试</button>
    </div>
    
    <div v-else class="profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img :src="user.avatar || '/images/default-avatar.png'" alt="用户头像" class="avatar">
            <button @click="showAvatarUpload = true" class="btn-change-avatar">更换头像</button>
          </div>
          <div class="user-info">
            <h2>{{ user.username }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <p class="join-date">加入于 {{ formatDate(user.createdAt) }}</p>
          </div>
        </div>
        
        <div class="profile-tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'info' }" 
            @click="activeTab = 'info'"
          >
            个人资料
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'posts' }" 
            @click="activeTab = 'posts'"
          >
            我的文章
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'password' }" 
            @click="activeTab = 'password'"
          >
            修改密码
          </button>
        </div>
        
        <!-- 个人资料编辑 -->
        <div v-if="activeTab === 'info'" class="tab-content">
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                type="text" 
                id="username" 
                v-model="profileForm.username" 
                placeholder="用户名" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="bio">个人简介</label>
              <textarea 
                id="bio" 
                v-model="profileForm.bio" 
                placeholder="介绍一下自己吧"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="website">个人网站</label>
              <input 
                type="url" 
                id="website" 
                v-model="profileForm.website" 
                placeholder="个人网站链接"
              />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- 我的文章 -->
        <div v-else-if="activeTab === 'posts'" class="tab-content">
          <div v-if="userPosts.length === 0" class="empty-state">
            <p>你还没有发布过文章</p>
            <router-link to="/create-post" class="btn-primary">写一篇文章</router-link>
          </div>
          
          <div v-else class="user-posts">
            <div v-for="post in userPosts" :key="post.id" class="post-item">
              <div class="post-info">
                <h3 class="post-title">
                  <router-link :to="`/posts/${post.id}`">{{ post.title }}</router-link>
                </h3>
                <p class="post-date">{{ formatDate(post.createdAt) }}</p>
              </div>
              <div class="post-actions">
                <router-link :to="`/edit-post/${post.id}`" class="btn-edit">编辑</router-link>
                <button @click="deletePost(post.id)" class="btn-delete">删除</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 修改密码 -->
        <div v-else-if="activeTab === 'password'" class="tab-content">
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label for="currentPassword">当前密码</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                placeholder="输入当前密码" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="newPassword">新密码</label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="passwordForm.newPassword" 
                placeholder="设置新密码（至少6位）" 
                minlength="6"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="confirmNewPassword">确认新密码</label>
              <input 
                type="password" 
                id="confirmNewPassword" 
                v-model="passwordForm.confirmNewPassword" 
                placeholder="再次输入新密码" 
                minlength="6"
                required
              />
              <div v-if="passwordError" class="password-error">{{ passwordError }}</div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isChangingPassword || passwordError">
                {{ isChangingPassword ? '更新中...' : '更新密码' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 头像上传模态框 -->
    <div v-if="showAvatarUpload" class="modal-overlay">
      <div class="modal-content">
        <h3>更换头像</h3>
        <div class="upload-area">
          <input 
            type="file" 
            id="avatarUpload" 
            ref="avatarInput"
            accept="image/*"
            @change="handleAvatarChange"
          />
          <label for="avatarUpload" class="upload-button">
            选择图片
          </label>
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="头像预览" />
          </div>
        </div>
        <div class="modal-actions">
          <button 
            @click="uploadAvatar" 
            class="btn-primary" 
            :disabled="!avatarFile || isUploadingAvatar"
          >
            {{ isUploadingAvatar ? '上传中...' : '上传' }}
          </button>
          <button @click="closeAvatarModal" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Profile',
  data() {
    return {
      user: {},
      loading: true,
      error: null,
      activeTab: 'info',
      
      // 个人资料表单
      profileForm: {
        username: '',
        bio: '',
        website: ''
      },
      isSubmitting: false,
      
      // 密码修改表单
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      isChangingPassword: false,
      
      // 用户文章
      userPosts: [],
      
      // 头像上传
      showAvatarUpload: false,
      avatarFile: null,
      avatarPreview: null,
      isUploadingAvatar: false
    };
  },
  computed: {
    passwordError() {
      if (this.passwordForm.newPassword && 
          this.passwordForm.confirmNewPassword && 
          this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
        return '两次输入的密码不一致';
      }
      return null;
    }
  },
  methods: {
    async fetchUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/api/users/me');
        
        if (response.data.success) {
          this.user = response.data.user;
          this.initProfileForm();
          this.fetchUserPosts();
        } else {
          this.error = response.data.message || '获取用户信息失败';
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.error = error.response?.data?.message || '服务器错误，请稍后重试';
        
        // 如果是未授权错误，重定向到登录页
        if (error.response?.status === 401) {
          this.$router.push({ 
            name: 'Login', 
            query: { redirect: this.$route.fullPath } 
          });
        }
      } finally {
        this.loading = false;
      }
    },
    
    initProfileForm() {
      this.profileForm = {
        username: this.user.username || '',
        bio: this.user.bio || '',
        website: this.user.website || ''
      };
    },
    
    async fetchUserPosts() {
      try {
        const response = await axios.get('/api/posts/user');
        
        if (response.data.success) {
          this.userPosts = response.data.data;
        }
      } catch (error) {
        console.error('获取用户文章失败:', error);
      }
    },
    
    async updateProfile() {
      this.isSubmitting = true;
      
      try {
        const response = await axios.put('/api/users/profile', this.profileForm);
        
        if (response.data.success) {
          this.user = response.data.user;
          this.initProfileForm();
          alert('个人资料更新成功');
        } else {
          alert(response.data.message || '更新失败，请重试');
        }
      } catch (error) {
        console.error('更新个人资料失败:', error);
        alert(error.response?.data?.message || '服务器错误，请稍后重试');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    async changePassword() {
      if (this.passwordError) {
        return;
      }
      
      this.isChangingPassword = true;
      
      try {
        const response = await axios.put('/api/users/password', {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        if (response.data.success) {
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          };
          alert('密码更新成功');
        } else {
          alert(response.data.message || '更新失败，请重试');
        }
      } catch (error) {
        console.error('更新密码失败:', error);
        alert(error.response?.data?.message || '服务器错误，请稍后重试');
      } finally {
        this.isChangingPassword = false;
      }
    },
    
    async deletePost(postId) {
      if (!confirm('确定要删除这篇文章吗？删除后无法恢复！')) {
        return;
      }
      
      try {
        const response = await axios.delete(`/api/posts/${postId}`);
        
        if (response.data.success) {
          this.userPosts = this.userPosts.filter(post => post.id !== postId);
          alert('文章已删除');
        } else {
          alert(response.data.message || '删除失败，请重试');
        }
      } catch (error) {
        console.error('删除文章失败:', error);
        alert(error.response?.data?.message || '服务器错误，请稍后重试');
      }
    },
    
    handleAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // 验证文件是否为图片
      if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
      }
      
      this.avatarFile = file;
      this.avatarPreview = URL.createObjectURL(file);
    },
    
    async uploadAvatar() {
      if (!this.avatarFile) return;
      
      this.isUploadingAvatar = true;
      
      try {
        const formData = new FormData();
        formData.append('avatar', this.avatarFile);
        
        const response = await axios.post('/api/users/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          this.user.avatar = response.data.avatar;
          this.closeAvatarModal();
          alert('头像更新成功');
        } else {
          alert(response.data.message || '上传失败，请重试');
        }
      } catch (error) {
        console.error('上传头像失败:', error);
        alert(error.response?.data?.message || '服务器错误，请稍后重试');
      } finally {
        this.isUploadingAvatar = false;
      }
    },
    
    closeAvatarModal() {
      this.showAvatarUpload = false;
      this.avatarFile = null;
      this.avatarPreview = null;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  created() {
    this.fetchUserData();
  }
};
</script>

<style scoped>
.profile-page {
  max-width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #121212, #2c2c2c);
  color: white;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
}

.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-container,
.error-container {
  max-width: 800px;
  margin: 4rem auto;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid rgba(52, 152, 219, 0.8);
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.btn-change-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-change-avatar:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-info {
  flex-grow: 1;
}

.user-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0;
}

.join-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.profile-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
}

.tab-button {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: white;
}

.tab-button.active {
  color: white;
  border-bottom: 2px solid #444;
}

.tab-content {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(52, 152, 219, 0.6);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.password-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: rgba(45, 45, 45, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: rgba(60, 60, 60, 1);
}

.btn-primary:disabled {
  background: rgba(45, 45, 45, 0.5);
  cursor: not-allowed;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 1rem;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
}

.empty-state p {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.user-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.post-title a {
  color: white;
  text-decoration: none;
}

.post-title a:hover {
  color: #3498db;
}

.post-date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
}

.btn-edit {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.4);
}

.btn-delete {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.4);
}

.btn-edit:hover {
  background: rgba(52, 152, 219, 0.3);
}

.btn-delete:hover {
  background: rgba(231, 76, 60, 0.3);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: rgba(30, 44, 53, 0.95);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.upload-area {
  margin-bottom: 2rem;
}

.upload-area input[type="file"] {
  display: none;
}

.upload-button {
  display: block;
  background: rgba(52, 152, 219, 0.8);
  color: white;
  text-align: center;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  margin: 1rem auto;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .post-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .post-actions {
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style> 