<template>
  <div v-if="isVisible" class="settings-overlay" @click="closeSettings" @keydown.esc="closeSettings">
    <div class="settings-popup" @click.stop @keydown.enter="saveSettings" @keydown.esc="closeSettings">
      <div class="settings-header">
        <h3>{{ t('project.project_settings') }}</h3>
        <button class="close-btn" @click="closeSettings" :title="t('common.close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div class="settings-content">
        <div class="setting-group">
          <label class="setting-label">{{ t('settings.startup_command') }}</label>
          <textarea 
            ref="startCommandsInput"
            v-model="startCommands"
            class="setting-input"
            :placeholder="t('settings.startup_command')"
            rows="3"
            resize="none"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          ></textarea>
        </div>
        
        <div class="settings-actions">
          <button class="cancel-btn" @click="closeSettings">{{ t('common.cancel') }}</button>
          <button class="save-btn" @click="saveSettings">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from '../utils/useI18n'

export default {
  name: 'ProjectSettings',
  props: {
    project: {
      type: Object,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    // Use i18n composable
    const { t } = useI18n()
    
    return {
      t
    }
  },
  data() {
    return {
      startCommands: ''
    }
  },
  watch: {
    project: {
      handler(newProject) {
        if (newProject) {
          this.loadSettings()
        }
      },
      immediate: true
    },
    isVisible: {
      handler(newValue) {
        if (newValue) {
          // 当弹窗显示时，延迟聚焦到输入框
          this.$nextTick(() => {
            this.focusInput()
          })
        }
      },
      immediate: false
    }
  },
  mounted() {
    // 如果组件挂载时弹窗已经可见，则聚焦
    if (this.isVisible) {
      this.$nextTick(() => {
        this.focusInput()
      })
    }
    
    // 添加全局键盘事件监听
    document.addEventListener('keydown', this.handleKeydown)
  },
  
  beforeUnmount() {
    // 移除全局键盘事件监听
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(event) {
      // 只有当弹窗可见时才处理键盘事件
      if (!this.isVisible) return
      
      if (event.key === 'Escape') {
        event.preventDefault()
        this.closeSettings()
      } else if (event.key === 'Enter' && event.ctrlKey) {
        // Ctrl+Enter 保存设置
        event.preventDefault()
        this.saveSettings()
      }
    },
    
    focusInput() {
      try {
        if (this.$refs.startCommandsInput) {
          this.$refs.startCommandsInput.focus()
          // 选中所有文本以便用户可以直接开始输入
          this.$refs.startCommandsInput.select()
        } else {
          // 如果第一次尝试失败，延迟再试一次
          setTimeout(() => {
            if (this.$refs.startCommandsInput) {
              this.$refs.startCommandsInput.focus()
              this.$refs.startCommandsInput.select()
            }
          }, 100)
        }
      } catch (error) {
        console.log('Failed to focus input:', error)
        // 如果还是失败，再试一次
        setTimeout(() => {
          try {
            if (this.$refs.startCommandsInput) {
              this.$refs.startCommandsInput.focus()
            }
          } catch (e) {
            console.log('Final focus attempt failed:', e)
          }
        }, 200)
      }
    },
    
    loadSettings() {
      // 从 localStorage 加载项目设置
      const settings = localStorage.getItem(`project-settings-${this.project.id}`)
      if (settings) {
        const parsed = JSON.parse(settings)
        this.startCommands = parsed.startCommands || ''
      } else {
        this.startCommands = ''
      }
    },
    
    saveSettings() {
      // 保存设置到 localStorage
      const settings = {
        startCommands: this.startCommands
      }
      localStorage.setItem(`project-settings-${this.project.id}`, JSON.stringify(settings))
      
      // 通知父组件设置已保存
      this.$emit('settings-saved', {
        projectId: this.project.id,
        settings
      })
      
      this.closeSettings()
    },
    
    
    closeSettings() {
      this.$emit('close-settings')
    }
  }
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.settings-popup {
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.settings-header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.settings-content {
  padding: var(--spacing-lg);
}

.setting-group {
  margin-bottom: var(--spacing-lg);
}

.setting-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.setting-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: 'Courier New', monospace;
  resize: none;
  transition: all var(--transition-fast);
}

.setting-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-input::placeholder {
  color: var(--text-muted);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.cancel-btn,
.save-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.cancel-btn {
  background-color: transparent;
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.cancel-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.save-btn {
  background-color: var(--primary-color);
  color: var(--white);
}

.save-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-popup {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .settings-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cancel-btn,
  .save-btn {
    flex: 1;
  }
}
</style>
