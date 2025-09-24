<template>
  <div class="action-bar">
    <button 
      class="action-btn start-btn"
      @click="startProject"
      title="Start Project"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
      </svg>
    </button>
    
    <button 
      class="action-btn terminal-btn"
      @click="openTerminal"
      title="Open Terminal"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 16L8 12L4 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button 
      class="action-btn settings-btn"
      @click="openSettings"
      title="Settings"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M3 9.11v5.77C3 17 3 17 5 18.35l5.5 3.18c.83.48 2.18.48 3 0l5.5-3.18c2-1.35 2-1.35 2-3.46V9.11C21 7 21 7 19 5.65l-5.5-3.18c-.82-.48-2.17-.48-3 0L5 5.65C3 7 3 7 3 9.11" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ProjectActionBar',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  methods: {
    async startProject() {
      try {
        // get project settings
        const settings = localStorage.getItem(`project-settings-${this.project.id}`)
        const startCommands = settings ? JSON.parse(settings).startCommands : ''
        
        if (!startCommands.trim()) {
          alert('Please set start commands in settings first!')
          return
        }
        
        // send start command to main process
        if (window.electronAPI) {
          const result = await window.electronAPI.sendMessage('start-project', {
            projectId: this.project.id,
            path: this.project.path,
            commands: startCommands
          })
          
          if (result.success) {
            console.log('Project started successfully')
          } else {
            console.error('Failed to start project:', result.error)
            alert('Failed to start project: ' + result.error)
          }
        } else {
          console.log('Starting project with commands:', startCommands)
        }
      } catch (error) {
        console.error('Error starting project:', error)
        alert('Error starting project: ' + error.message)
      }
    },
    
    async openTerminal() {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.sendMessage('open-terminal', {
            path: this.project.path
          })
          
          if (result.success) {
            console.log('Terminal opened successfully')
          } else {
            console.error('Failed to open terminal:', result.error)
            alert('Failed to open terminal: ' + result.error)
          }
        } else {
          console.log('Opening terminal in:', this.project.path)
        }
      } catch (error) {
        console.error('Error opening terminal:', error)
        alert('Error opening terminal: ' + error.message)
      }
    },
    
    openSettings() {
      this.$emit('open-settings', this.project)
    }
  }
}
</script>

<style scoped>
.action-bar {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.action-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-dark);
}

.start-btn {
  color: var(--success-color);
}

.start-btn:hover {
  background-color: var(--success-light);
  border-color: var(--success-color);
  color: var(--success-dark);
}

.terminal-btn {
  color: var(--info-color);
}

.terminal-btn:hover {
  background-color: var(--info-light);
  border-color: var(--info-color);
  color: var(--info-dark);
}

.settings-btn {
  color: var(--text-secondary);
}

.settings-btn:hover {
  background-color: var(--secondary-light);
  border-color: var(--secondary-color);
  color: var(--secondary-dark);
}
</style>
