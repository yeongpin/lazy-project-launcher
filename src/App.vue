<template>
  <div id="app">
    <ProjectView />
  </div>
</template>

<script>
import { onMounted, onUnmounted, provide } from 'vue'
import ProjectView from './views/ProjectView.vue'
import projectStore from './store/projectStore'
import { useI18n } from './utils/useI18n'

export default {
  name: 'App',
  components: {
    ProjectView
  },
  setup() {
    // Use i18n composable
    const { t, currentLocale, localeManager } = useI18n()
    
    // Provide i18n functionality to all child components
    provide('$t', t)
    provide('$locale', currentLocale)
    provide('$localeManager', localeManager)
    
    // handle project imported event
    const handleProjectImported = (event, projectData) => {
      projectStore.addProject(projectData)
    }
    
    // handle locale change event
    const handleLocaleChange = () => {
      // The reactive state will automatically update
      console.log('Locale changed event received')
    }
    
    onMounted(() => {
      // listen to project imported event from main process
      if (window.electronAPI) {
        window.electronAPI.onProjectImported(handleProjectImported)
      }
      
      // listen to locale change events
      window.addEventListener('localeChanged', handleLocaleChange)
    })
    
    onUnmounted(() => {
      // clean up event listeners
      if (window.electronAPI) {
        window.electronAPI.removeProjectImportedListener(handleProjectImported)
      }
      
      window.removeEventListener('localeChanged', handleLocaleChange)
    })
    
    return {
      t,
      currentLocale
    }
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
