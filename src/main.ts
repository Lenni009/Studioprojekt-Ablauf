import '@/styles/styles.scss';
import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

const app = createApp(App);

// state management, if required
const pinia = createPinia();
app.use(pinia);

// css selector where the app should be mounted
app.mount('#app');
