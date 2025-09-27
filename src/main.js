import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/global.css'
import './utils/themeManager.js'
import './utils/localeManager.js'

// Initialize managers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.themeManager) {
        console.log('Theme manager initialized')
    }
    if (window.localeManager) {
        console.log('Locale manager initialized')
    }
})

createApp(App).mount('#app')
