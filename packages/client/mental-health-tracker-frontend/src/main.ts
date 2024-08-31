import 'primeicons/primeicons.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import router from './router';
import PrimeVue from 'primevue/config';
import { initializeAuth } from './utils/auth'

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import './assets/theme.css'

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);
app.use(ToastService);
app.component('PrimeToast', Toast);

initializeAuth().then(() => {
    app.mount('#app')
  })

