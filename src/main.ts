import '@picocss/pico';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import Toast from 'vue-toastification';
import { createApp } from 'vue';

const app = createApp(App);

// add toast notifications
app.use(Toast);

// css selector where the app should be mounted
app.mount('#app');
