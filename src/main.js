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

app.use(VueSweetalert2)
app.use(i18n)
app.component('fa', FontAwesomeIcon)

const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('xAppToken') || process.env?.VUE_APP_NAME

import './assets/css/xapps-routed-dist.css'

app.config.globalProperties.token = token
app.config.globalProperties.endpoint = process.env.VUE_APP_API_ENDPOINT

app.mount('#app')
