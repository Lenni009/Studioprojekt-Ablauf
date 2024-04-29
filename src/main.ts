import '@picocss/pico';
import App from './App.vue';
import { createApp } from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App);

// add toast notifications
app.use(Toast);

// css selector where the app should be mounted
app.mount('#app');
