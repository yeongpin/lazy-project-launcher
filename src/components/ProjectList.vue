<template>
  <div class="project-list">
    <div v-if="projectStore.projects.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <h3>{{ t('project.no_projects') }}</h3>
      <p>{{ t('project.import_first_project') }}</p>
    </div>
    
    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No projects found</h3>
      <p>Try adjusting your search terms</p>
    </div>
    
    <!-- Search status info -->
    <div v-if="searchQuery.trim() && filteredProjects.length > 0" class="search-info">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>{{ t('project.search_active_no_reorder') }}</span>
    </div>
    
    <div v-if="filteredProjects.length > 0" class="project-grid">
      <div 
        v-for="(project, index) in filteredProjects" 
        :key="project.id"
        class="project-card"
        :class="{ 
          'dragging': dragState.draggedIndex === index, 
          'drag-over': dragState.dragOverIndex === index,
          'search-mode': searchQuery.trim()
        }"
        :draggable="!searchQuery.trim()"
        @dragstart="searchQuery.trim() ? null : handleDragStart($event, index, project)"
        @dragend="handleDragEnd"
        @dragover.prevent="searchQuery.trim() ? null : handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop.prevent="searchQuery.trim() ? null : handleDrop($event, index)"
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
import { ref, computed, reactive } from 'vue'
import projectStore from '../store/projectStore'
import ProjectActionBar from './ProjectActionBar.vue'
import ProjectSettings from './ProjectSettings.vue'
import { useI18n } from '../utils/useI18n'

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
    // Use i18n composable
    const { t } = useI18n()
    
    const selectedProject = ref(null)
    const showSettings = ref(false)
    
    // Drag and drop state
    const dragState = reactive({
      draggedIndex: null,
      draggedProject: null,
      dragOverIndex: null,
      isDragging: false
    })
    
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
    
    // Drag and drop handlers
    const handleDragStart = (event, index, project) => {
      dragState.draggedIndex = index
      dragState.draggedProject = project
      dragState.isDragging = true
      
      // Set drag effect
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', project.id)
      
      // Add drag image
      const dragImage = event.target.cloneNode(true)
      dragImage.style.opacity = '0.8'
      event.dataTransfer.setDragImage(dragImage, 0, 0)
    }
    
    const handleDragEnd = () => {
      // Reset drag state
      dragState.draggedIndex = null
      dragState.draggedProject = null
      dragState.dragOverIndex = null
      dragState.isDragging = false
    }
    
    const handleDragOver = (event, index) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      
      if (dragState.draggedIndex !== null && dragState.draggedIndex !== index) {
        dragState.dragOverIndex = index
      }
    }
    
    const handleDragLeave = () => {
      dragState.dragOverIndex = null
    }
    
    const handleDrop = (event, dropIndex) => {
      event.preventDefault()
      
      const draggedIndex = dragState.draggedIndex
      if (draggedIndex === null || draggedIndex === dropIndex) {
        return
      }
      
      // Only allow reordering if no search filter is active
      if (props.searchQuery && props.searchQuery.trim()) {
        console.log('Cannot reorder while search is active')
        return
      }
      
      // Reorder projects in the store
      const projects = [...projectStore.projects]
      const draggedProject = projects[draggedIndex]
      
      // Remove from old position
      projects.splice(draggedIndex, 1)
      
      // Insert at new position
      projects.splice(dropIndex, 0, draggedProject)
      
      // Update the store
      projectStore.reorderProjects(projects)
      
      // Reset drag state
      handleDragEnd()
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
      t,
      projectStore,
      selectedProject,
      showSettings,
      filteredProjects,
      dragState,
      searchQuery: computed(() => props.searchQuery),
      openProject,
      removeProject,
      openSettings,
      closeSettings,
      onSettingsSaved,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop
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

/* Search info */
.search-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-md);
}

.search-info svg {
  flex-shrink: 0;
  color: var(--accent-warning);
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
  cursor: grab;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 60px;
  user-select: none;
}

/* Drag and drop styles */
.project-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  cursor: grabbing;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.project-card.drag-over {
  border-color: var(--accent-primary);
  background-color: var(--accent-primary-alpha);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.project-card:active {
  cursor: grabbing;
}

/* Search mode - disable drag cursor */
.project-card.search-mode {
  cursor: pointer;
}

.project-card.search-mode:active {
  cursor: pointer;
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
