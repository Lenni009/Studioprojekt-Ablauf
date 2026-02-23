<script setup lang="ts">
import Schedule from './components/Schedule.vue';
import { onMounted } from 'vue';

onMounted(async () => {
  try {
    await navigator.wakeLock.request('screen');
  } catch (error) {
    // the wake lock request fails - usually system related, such being low on battery
    if (Error.isError(error)) {
      console.error(`${error.name}, ${error.message}`);
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
