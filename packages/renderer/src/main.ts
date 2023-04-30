import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import mitt from 'mitt'
export const emitter = mitt()

createApp(App)
  .use(createPinia())
  .mount('#app')
  .$nextTick(window.removeLoading)
