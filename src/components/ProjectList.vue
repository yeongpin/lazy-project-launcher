<template>
  <div class="project-list">
    <div v-if="projectStore.projects.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <h3>No projects imported yet</h3>
      <p>Use File → Import Project to add your first project</p>
    </div>
    
    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No projects found</h3>
      <p>Try adjusting your search terms</p>
    </div>
    
    <div v-else class="project-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="project-card"
        @click="openProject(project)"
      >
        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-path">{{ project.path }}</p>
          <ProjectActionBar 
            :project="project" 
            @open-settings="openSettings"
          />
        </div>
        
        <div class="project-actions">
          <button 
            class="action-btn remove-btn"
            @click.stop="removeProject(project.id)"
            title="Remove project"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <ProjectSettings 
      v-if="selectedProject"
      :project="selectedProject"
      :is-visible="showSettings"
      @close-settings="closeSettings"
      @settings-saved="onSettingsSaved"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import projectStore from '../store/projectStore'
import ProjectActionBar from './ProjectActionBar.vue'
import ProjectSettings from './ProjectSettings.vue'

export default {
  name: 'ProjectList',
  components: {
    ProjectActionBar,
    ProjectSettings
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const selectedProject = ref(null)
    const showSettings = ref(false)
    
    const openProject = (project) => {
      console.log('Opening project:', project)
      // TODO: 实现打开项目的逻辑
    }
    
    const removeProject = (projectId) => {
      if (confirm('Are you sure you want to remove this project?')) {
        projectStore.removeProject(projectId)
      }
    }
    
    const openSettings = (project) => {
      selectedProject.value = project
      showSettings.value = true
    }
    
    const closeSettings = () => {
      showSettings.value = false
      selectedProject.value = null
    }
    
    const onSettingsSaved = (data) => {
      console.log('Settings saved for project:', data.projectId, data.settings)
    }
    
    // 过滤项目列表
    const filteredProjects = computed(() => {
      if (!props.searchQuery.trim()) {
        return projectStore.projects
      }
      
      const query = props.searchQuery.toLowerCase()
      return projectStore.projects.filter(project => 
        project.name.toLowerCase().includes(query)
      )
    })
    
    return {
      projectStore,
      selectedProject,
      showSettings,
      filteredProjects,
      openProject,
      removeProject,
      openSettings,
      closeSettings,
      onSettingsSaved
    }
  }
}
</script>

<style scoped>
.project-list {
  padding: var(--spacing-xl);
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.empty-state p {
  font-size: var(--text-base);
  margin: 0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
}

.project-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 60px;
}

.project-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-path {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
}

.project-actions {
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.project-card:hover .project-actions {
  opacity: 1;
}

.action-btn {
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

.action-btn:hover {
  background-color: var(--error-light);
  color: var(--error-color);
}

.remove-btn:hover {
  background-color: var(--error-light);
  color: var(--error-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-list {
    padding: var(--spacing-md);
  }
  
  .project-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .project-card {
    padding: var(--spacing-sm);
    min-height: 50px;
  }
  
  .project-name {
    font-size: var(--text-sm);
  }
  
  .project-path {
    font-size: 10px;
  }
}
</style>
