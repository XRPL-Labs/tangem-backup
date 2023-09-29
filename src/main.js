import { createApp } from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowRight, faCheck, faLock, faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

library.add(faArrowRight, faCheck, faLock, faCreditCard)

const app = createApp(App)

import { createI18n } from 'vue-i18n'

import { languages, defaultLocale } from './locale/index.js'
const messages = Object.assign(languages)

const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages
})

app.use(i18n)
app.component('fa', FontAwesomeIcon)

const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('xAppToken') || process.env?.VUE_APP_NAME
const theme = urlParams.get('xAppStyle') || 'LIGHT'

const options = {
    DARK: {
        backdrop: 'rgba(0,0,0,.4)',
        background: '#000'
    },
    MOONLIGHT: {
        backdrop: 'rgba(0,0,0,.4)',
        background: '#181A21'
    },
    ROYAL: {
        backdrop: 'rgba(0,0,0,.4)',
        background: '#030B36'
    },
    LIGHT: {
        backdrop: 'rgba(255,255,255,.4)',
        background: '#fff'
    }
}

app.use(VueSweetalert2, options[theme])

import './assets/css/xapps-routed-dist.css'

app.config.globalProperties.token = token
app.config.globalProperties.endpoint = process.env?.VUE_APP_API_ENDPOINT || 'https://xumm.app/api/v1/platform'
app.config.globalProperties.apikey = process.env?.VUE_APP_XAPP_KEY

app.mount('#app')
