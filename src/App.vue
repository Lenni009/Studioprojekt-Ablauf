<script setup lang="ts">
import { onMounted } from 'vue';
import Schedule from './components/Schedule.vue';

onMounted(async () => {
  try {
    await navigator.wakeLock.request('screen');
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    if (err instanceof Error) {
      console.error(`${err.name}, ${err.message}`);
    } else {
      console.error('Something went wrong!');
    }
  }
});
</script>

<template>
  <header>
    <h1 class="title">Studioprojekt Ablauf</h1>
  </header>
  <main>
    <Schedule />
  </main>
</template>

<style scoped>
header {
  margin-block-start: 2rem;

  .title {
    text-align: center;
  }
}
</style>
