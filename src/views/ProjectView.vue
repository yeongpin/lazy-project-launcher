<template>
  <div class="project-view">
    <div class="project-view-header">
      <div class="search-container">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input 
          type="text" 
          :placeholder="t('project.search_projects')" 
          class="search-input"
          v-model="searchQuery"
        />
        <button 
          v-if="searchQuery"
          class="clear-btn"
          @click="clearSearch"
          title="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <button 
        class="import-btn"
        @click="importProject"
        :title="t('project.import_new_project')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 18V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 15L12 12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <ProjectList :search-query="searchQuery" />
  </div>
</template>

<script>
import { ref } from 'vue'
import ProjectList from '../components/ProjectList.vue'
import { useI18n } from '../utils/useI18n'

export default {
  name: 'ProjectView',
  components: {
    ProjectList
  },
  setup() {
    // Use i18n composable
    const { t } = useI18n()
    
    const searchQuery = ref('')
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    const importProject = async () => {
      // 触发主进程的导入项目功能
      if (window.electronAPI) {
        try {
          console.log('Sending import-project message...')
          const result = await window.electronAPI.sendMessage('import-project')
          console.log('Received result:', result)
          
          if (result && result.success) {
            console.log('Project import triggered successfully')
          } else {
            const errorMsg = result?.error || result?.message || 'Unknown error'
            console.error('Failed to trigger project import:', errorMsg)
          }
        } catch (error) {
          console.error('Error calling import project:', error)
        }
      } else {
        console.error('electronAPI not available')
      }
    }
    
    return {
      t,
      searchQuery,
      clearSearch,
      importProject
    }
  }
}
</script>

<style scoped>
.project-view {
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.project-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  gap: var(--spacing-md);
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
  width: 16px;
  height: 16px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 2.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.import-btn:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.import-btn svg {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-view-header {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .search-container {
    flex: 1;
  }
  
  .search-input {
    font-size: var(--text-base);
  }
  
  .import-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
