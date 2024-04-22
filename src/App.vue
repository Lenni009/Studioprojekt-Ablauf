<script setup lang="ts">
import Schedule from './components/Schedule.vue';
</script>

<template>
  <header>
    <h1 class="title">Studioprojekt Ablauf</h1>
  </header>
  <main>
    <Schedule />
  </main>
</template>

<style scoped lang="scss">
header {
  margin-block-start: 2rem;

  .title {
    text-align: center;
  }
}
</style>
