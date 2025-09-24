import { reactive } from 'vue'

// from localStorage load data
const loadProjects = () => {
  try {
    const saved = localStorage.getItem('lazy-project-launcher-projects')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

// save data to localStorage
const saveProjects = (projects) => {
  try {
    localStorage.setItem('lazy-project-launcher-projects', JSON.stringify(projects))
  } catch (error) {
    console.error('Error saving projects:', error)
  }
}

// project data storage
const projectStore = reactive({
  projects: loadProjects(),

  // add project
  addProject(project) {
    // check if project already exists
    const exists = this.projects.some(p => p.path === project.path)
    if (!exists) {
      this.projects.unshift(project) // add to list top
      saveProjects(this.projects) // save to localStorage
    }
  },

  // remove project
  removeProject(projectId) {
    const index = this.projects.findIndex(p => p.id === projectId)
    if (index > -1) {
      this.projects.splice(index, 1)
      saveProjects(this.projects) // save to localStorage
    }
  },

  // get project count
  get projectCount() {
    return this.projects.length
  }
})

export default projectStore
