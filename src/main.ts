import '@picocss/pico';
import App from './App.vue';
import { createApp } from 'vue';

const app = createApp(App);

// css selector where the app should be mounted
app.mount('#app');
