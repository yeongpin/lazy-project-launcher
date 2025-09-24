<template>
  <div v-if="isVisible" class="settings-overlay" @click="closeSettings">
    <div class="settings-popup" @click.stop>
      <div class="settings-header">
        <h3>Project Settings</h3>
        <button class="close-btn" @click="closeSettings" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div class="settings-content">
        <div class="setting-group">
          <label class="setting-label">Start Commands</label>
          <textarea 
            v-model="startCommands"
            class="setting-input"
            placeholder="Enter start commands (e.g., npm start, python app.py)"
            rows="3"
            resize="none"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          ></textarea>
        </div>
        
        <div class="settings-actions">
          <button class="cancel-btn" @click="closeSettings">Cancel</button>
          <button class="save-btn" @click="saveSettings">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    }
  },
  methods: {
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
