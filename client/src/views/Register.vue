<!--
  注册页面组件 (Register.vue)
  实现用户注册功能，包含表单验证、密码确认和错误处理
  提供用户名、邮箱和密码输入，以及注册状态展示
-->
<template>
  <!-- 注册页面主容器 -->
  <div class="register-page">
    <!-- 注册表单卡片容器 -->
    <div class="register-container">
      <h2 class="title">注册账号</h2>
      <!-- 错误信息提示区域，仅在有错误时显示 -->
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <!-- 注册表单，阻止默认提交行为，使用handleRegister方法处理 -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 用户名输入组 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            placeholder="设置用户名"
            required
          />
        </div>
        
        <!-- 邮箱输入组 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            placeholder="输入邮箱地址"
            required
          />
        </div>
        
        <!-- 密码输入组 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            placeholder="设置密码（至少6位）"
            minlength="6"
            required
          />
        </div>
        
        <!-- 确认密码输入组 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="再次输入密码"
            minlength="6"
            required
          />
          <!-- 密码不匹配错误提示 -->
          <div v-if="passwordError" class="password-error">{{ passwordError }}</div>
        </div>
        
        <!-- 表单操作区域 -->
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="isLoading || passwordError">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </div>
        
        <!-- 表单底部提示区域 -->
        <div class="form-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
/**
 * 注册页面组件
 * 处理用户注册流程和表单验证逻辑
 */
import axios from 'axios'; // 导入axios用于HTTP请求

export default {
  name: 'Register',
  data() {
    return {
      registerForm: {
        username: '', // 用户名
        email: '',    // 邮箱地址
        password: ''  // 用户密码
      },
      confirmPassword: '', // 确认密码
      isLoading: false,    // 注册请求状态标志
      error: null          // 错误信息
    };
  },
  computed: {
    /**
     * 计算属性：检查两次输入的密码是否一致
     * @returns {string|null} 错误信息或null
     */
    passwordError() {
      if (this.confirmPassword && this.registerForm.password !== this.confirmPassword) {
        return '两次输入的密码不一致';
      }
      return null;
    }
  },
  methods: {
    /**
     * 处理注册表单提交
     * 验证表单，发送注册请求并处理响应结果
     */
    async handleRegister() {
      // 如果密码不匹配，阻止表单提交
      if (this.passwordError) {
        return;
      }
      
      this.isLoading = true; // 设置加载状态
      this.error = null;     // 清除之前的错误信息
      
      try {
        // 发送注册请求到服务器
        const response = await axios.post('/api/auth/register', this.registerForm);
        
        if (response.data.success) {
          // 注册成功，保存token和用户信息到本地存储
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // 获取重定向路径，如果没有则跳转到首页
          const redirectPath = this.$route.query.redirect || '/';
          this.$router.push(redirectPath);
          
          // 重新加载页面以更新导航栏状态
          window.location.reload();
        } else {
          // 服务器返回失败信息
          this.error = response.data.message || '注册失败，请重试';
        }
      } catch (error) {
        // 处理请求异常
        console.error('注册请求失败:', error);
        if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else if (error.response?.status === 409) {
          // 处理冲突状态（用户名或邮箱已存在）
          this.error = '用户名或邮箱已存在';
        } else {
          this.error = '服务器错误，请稍后重试';
        }
      } finally {
        // 无论成功或失败，都重置加载状态
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
/* 注册页面样式 - 渐变背景和居中布局 */
.register-page {
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #121212, #2c2c2c); /* 深色渐变背景 */
  color: white;
  padding: 1rem;
}

/* 注册容器样式 - 毛玻璃效果卡片 */
.register-container {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.1); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); /* 深色阴影增强立体感 */
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1); /* 微妙的白色边框 */
}

/* 标题样式 */
.title {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
}

/* 错误信息提示样式 */
.error-message {
  background: rgba(231, 76, 60, 0.3); /* 半透明红色背景 */
  border-left: 4px solid #e74c3c; /* 左侧红色边框 */
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

/* 注册表单样式 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 表单项间距 */
}

/* 表单项组样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 表单标签样式 */
.form-group label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8); /* 轻微透明的白色 */
}

/* 表单输入框样式 */
.form-group input {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1); /* 半透明输入框背景 */
  color: white;
  font-size: 1rem;
  transition: all 0.3s; /* 平滑过渡效果 */
}

/* 输入框焦点状态 */
.form-group input:focus {
  outline: none;
  border-color: rgba(52, 152, 219, 0.6); /* 蓝色边框 */
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); /* 微妙的焦点光晕 */
}

/* 输入框占位符样式 */
.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4); /* 较淡的文字颜色 */
}

/* 密码错误提示样式 */
.password-error {
  color: #e74c3c; /* 错误文字使用红色 */
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

/* 表单操作区域样式 */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

/* 主按钮样式 */
.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: rgba(45, 45, 45, 0.8); /* 深色按钮背景 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s; /* 平滑过渡效果 */
}

/* 按钮悬停效果 */
.btn-primary:hover {
  background: rgba(60, 60, 60, 1); /* 悬停时加深背景色 */
}

/* 按钮禁用状态 */
.btn-primary:disabled {
  background: rgba(45, 45, 45, 0.5); /* 更淡的背景色表示禁用 */
  cursor: not-allowed;
}

/* 表单底部样式 */
.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7); /* 稍微透明的文字 */
}
</style> 