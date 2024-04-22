<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: {
    name: string;
    timestamp: string;
  };
  ts: number;
}>();

function stringToTimestamp(time: string): number {
  const [minutes, seconds] = time.split(':').map((item) => parseInt(item));
  return (minutes * 60 + seconds) * 1000;
}

const isCompleted = computed(() => props.ts >= stringToTimestamp(props.data.timestamp));
</script>

<template>
  <div
    :class="{ 'is-completed': isCompleted }"
    class="table-item"
  >
    <div>{{ data.name }}</div>
    <div>{{ data.timestamp }}</div>
  </div>
</template>

<style scoped lang="scss">
.table-item {
  display: flex;
  gap: 0.5rem;

  &.is-completed {
    background-color: green;
  }
}
</style>
