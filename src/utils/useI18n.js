/**
 * Vue Composition API for i18n
 * Provides reactive translation functionality
 */

import { computed } from 'vue'
import localeManager from './localeManager'

/**
 * Use i18n composable
 * @returns {Object} i18n functions and reactive state
 */
export function useI18n() {
    // Create reactive translation function
    const t = computed(() => {
        // This will re-run whenever reactiveState.currentLocale changes
        return (key, params = {}) => {
            return localeManager.t(key, params)
        }
    })

    // Reactive current locale
    const currentLocale = computed(() => localeManager.reactiveState.currentLocale)

    // Other utility functions
    const setLocale = (locale) => localeManager.setLocale(locale)
    const getAvailableLocales = () => localeManager.getAvailableLocales()
    const getLocaleDisplayName = (locale) => localeManager.getLocaleDisplayName(locale)

    return {
        t: t.value,
        currentLocale,
        setLocale,
        getAvailableLocales,
        getLocaleDisplayName,
        localeManager
    }
}

export default useI18n
