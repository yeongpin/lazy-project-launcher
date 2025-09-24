<template>
  <div id="app">
    <ProjectView />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import ProjectView from './views/ProjectView.vue'
import projectStore from './store/projectStore'

export default {
  name: 'App',
  components: {
    ProjectView
  },
  setup() {
    // handle project imported event
    const handleProjectImported = (event, projectData) => {
      projectStore.addProject(projectData)
    }
    
    onMounted(() => {
      // listen to project imported event from main process
      if (window.electronAPI) {
        window.electronAPI.onProjectImported(handleProjectImported)
      }
    })
    
    onUnmounted(() => {
      // clean up event listeners
      if (window.electronAPI) {
        window.electronAPI.removeProjectImportedListener(handleProjectImported)
      }
    })
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}
</style>
