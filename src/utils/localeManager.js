/**
 * Locale Manager - Handle internationalization and localization
 * Supports English (en), Simplified Chinese (zh-cn), and Traditional Chinese (zh-tw)
 */

// Import locale files
import enLocale from '../locale/en.json'
import zhCnLocale from '../locale/zh-cn.json'
import zhTwLocale from '../locale/zh-tw.json'
import { ref, reactive } from 'vue'

class LocaleManager {
    constructor() {
        this.currentLocale = 'en' // default locale
        this.locales = {
            'en': enLocale,
            'zh-cn': zhCnLocale,
            'zh-tw': zhTwLocale
        }
        // Create reactive state for Vue
        this.reactiveState = reactive({
            currentLocale: 'en'
        })
        this.init()
    }

    /**
     * Initialize locale manager
     * Load saved locale and set up event listeners
     */
    init() {
        // Load saved locale from localStorage
        this.loadLocale()
        
        // Listen for locale changes from main process
        if (window.electronAPI) {
            window.electronAPI.onLocaleChanged((event, data) => {
                console.log('Received locale change event:', { event, data })
                if (data && data.locale) {
                    this.setLocale(data.locale)
                } else {
                    console.warn('Invalid locale data received:', data)
                }
            })
        } else {
            console.log('electronAPI not available, running in browser mode')
        }
    }

    /**
     * Load locale from localStorage
     */
    loadLocale() {
        try {
            const savedLocale = localStorage.getItem('lazy-project-launcher-locale')
            if (savedLocale && this.locales[savedLocale]) {
                this.currentLocale = savedLocale
                this.reactiveState.currentLocale = savedLocale
            }
        } catch (error) {
            console.error('Error loading locale from localStorage:', error)
        }
    }

    /**
     * Save locale to localStorage
     * @param {string} locale - Locale to save
     */
    saveLocale(locale) {
        try {
            localStorage.setItem('lazy-project-launcher-locale', locale)
        } catch (error) {
            console.error('Error saving locale to localStorage:', error)
        }
    }

    /**
     * Set locale and apply it
     * @param {string} locale - Locale to set ('en', 'zh-cn', 'zh-tw')
     */
    setLocale(locale) {
        if (!this.locales[locale]) {
            console.warn('Invalid locale:', locale)
            return
        }

        this.currentLocale = locale
        this.reactiveState.currentLocale = locale
        this.saveLocale(locale)
        
        console.log('Locale changed to:', locale)
        
        // Emit locale change event for Vue components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('localeChanged', { 
                detail: { locale } 
            }))
        }
    }

    /**
     * Get current locale
     * @returns {string} Current locale
     */
    getCurrentLocale() {
        return this.currentLocale
    }

    /**
     * Get all available locales
     * @returns {Array} Array of available locale codes
     */
    getAvailableLocales() {
        return Object.keys(this.locales)
    }

    /**
     * Get locale display name
     * @param {string} locale - Locale code
     * @returns {string} Display name
     */
    getLocaleDisplayName(locale) {
        const displayNames = {
            'en': 'English',
            'zh-cn': '简体中文',
            'zh-tw': '繁體中文'
        }
        return displayNames[locale] || locale
    }

    /**
     * Translate a key to current locale
     * @param {string} key - Translation key (e.g., 'common.yes' or 'project.no_projects')
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        try {
            // Use reactive state for current locale
            const currentLocale = this.reactiveState.currentLocale
            const keys = key.split('.')
            let value = this.locales[currentLocale]
            
            for (const k of keys) {
                if (value && typeof value === 'object' && value.hasOwnProperty(k)) {
                    value = value[k]
                } else {
                    // Fallback to English if key not found
                    console.warn(`Translation key not found: ${key} for locale: ${currentLocale}`)
                    value = this.locales['en']
                    for (const k of keys) {
                        if (value && typeof value === 'object' && value.hasOwnProperty(k)) {
                            value = value[k]
                        } else {
                            return key // Return the key itself if not found
                        }
                    }
                    break
                }
            }
            
            if (typeof value === 'string') {
                // Simple parameter interpolation
                return value.replace(/\{(\w+)\}/g, (match, param) => {
                    return params[param] || match
                })
            }
            
            return key
        } catch (error) {
            console.error('Error translating key:', key, error)
            return key
        }
    }

    /**
     * Check if a translation key exists
     * @param {string} key - Translation key
     * @returns {boolean} True if key exists
     */
    hasKey(key) {
        try {
            const currentLocale = this.reactiveState.currentLocale
            const keys = key.split('.')
            let value = this.locales[currentLocale]
            
            for (const k of keys) {
                if (value && typeof value === 'object' && value.hasOwnProperty(k)) {
                    value = value[k]
                } else {
                    return false
                }
            }
            
            return typeof value === 'string'
        } catch (error) {
            return false
        }
    }
}

// Create global instance
const localeManager = new LocaleManager()

// Make it available globally
if (typeof window !== 'undefined') {
    window.localeManager = localeManager
}

// Export for module systems
export default localeManager
