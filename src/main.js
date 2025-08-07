import { createApp } from 'vue'
import App from './App.vue'
import Toast from "vue-toastification";

import 'bulma/css/bulma.css'
import '@fontsource/inter/index.css';
import "vue-toastification/dist/index.css";

import router from './router'

const app = createApp(App)

const options = {
    timeout: 3000, 
    position: "bottom-left",
}

app.use(Toast, options)
app.use(router)

app.mount('#app')
