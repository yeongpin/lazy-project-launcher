/**
 * Theme Manager - Handle theme switching and persistence
 * Supports system default, light, and dark themes
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'system' // default theme
        this.init()
    }

    /**
     * Initialize theme manager
     * Load saved theme and set up event listeners
     */
    init() {
        // Load saved theme from localStorage
        this.loadTheme()
        
        // Apply the theme
        this.applyTheme(this.currentTheme)
        
        // Listen for theme changes from main process
        if (window.electronAPI) {
            window.electronAPI.onThemeChanged((event, data) => {
                console.log('Received theme change event:', { event, data })
                if (data && data.theme) {
                    this.setTheme(data.theme)
                } else {
                    console.warn('Invalid theme data received:', data)
                }
            })
        } else {
            console.log('electronAPI not available, running in browser mode')
        }
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('lazy-project-launcher-theme')
            if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
                this.currentTheme = savedTheme
            }
        } catch (error) {
            console.error('Error loading theme from localStorage:', error)
        }
    }

    /**
     * Save theme to localStorage
     * @param {string} theme - Theme to save
     */
    saveTheme(theme) {
        try {
            localStorage.setItem('lazy-project-launcher-theme', theme)
        } catch (error) {
            console.error('Error saving theme to localStorage:', error)
        }
    }

    /**
     * Set theme and apply it
     * @param {string} theme - Theme to set ('system', 'light', 'dark')
     */
    setTheme(theme) {
        if (!['system', 'light', 'dark'].includes(theme)) {
            console.warn('Invalid theme:', theme)
            return
        }

        this.currentTheme = theme
        this.saveTheme(theme)
        this.applyTheme(theme)
        
        console.log('Theme changed to:', theme)
    }

    /**
     * Apply theme to the document
     * @param {string} theme - Theme to apply
     */
    applyTheme(theme) {
        const html = document.documentElement
        
        console.log('Applying theme:', theme)
        
        // Remove existing theme attributes
        html.removeAttribute('data-theme')
        
        if (theme === 'system') {
            // For system theme, let CSS media queries handle it
            // Remove data-theme attribute to use system preference
            console.log('Using system theme preference')
            return
        } else if (theme === 'light' || theme === 'dark') {
            // For manual themes, set data-theme attribute
            html.setAttribute('data-theme', theme)
            console.log('Applied manual theme:', theme)
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return this.currentTheme
    }

    /**
     * Check if current theme is dark
     * @returns {boolean} True if dark theme is active
     */
    isDarkTheme() {
        if (this.currentTheme === 'dark') {
            return true
        } else if (this.currentTheme === 'light') {
            return false
        } else {
            // System theme - check media query
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
    }

    /**
     * Toggle between light and dark themes
     * System theme is not affected by toggle
     */
    toggleTheme() {
        if (this.currentTheme === 'system') {
            // If system theme, switch to opposite of current system preference
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            this.setTheme(isSystemDark ? 'light' : 'dark')
        } else if (this.currentTheme === 'light') {
            this.setTheme('dark')
        } else if (this.currentTheme === 'dark') {
            this.setTheme('light')
        }
    }
}

// Create global instance
window.themeManager = new ThemeManager()

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager
}
